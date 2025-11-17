from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import asyncio
import json
import os
import uuid
import subprocess
from jose import JWTError, jwt
from passlib.context import CryptContext

from models import User, Project, SessionLocal, engine, Base
from schemas import UserCreate, UserLogin, ProjectCreate, CodeExecution
from auth import create_access_token, verify_token, get_password_hash, verify_password

# Initialize FastAPI
app = FastAPI(title="Python Web IDE", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

# Authentication routes
@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(SessionLocal)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin, db: Session = Depends(SessionLocal)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }

# Project management
@app.get("/api/projects")
async def get_user_projects(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(SessionLocal)
):
    user = verify_token(credentials.credentials, db)
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    return {"projects": projects}

@app.post("/api/projects")
async def create_project(
    project_data: ProjectCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(SessionLocal)
):
    user = verify_token(credentials.credentials, db)
    
    project = Project(
        name=project_data.name,
        description=project_data.description,
        user_id=user.id,
        files=json.dumps({"main.py": "# Welcome to Python Web IDE!\nprint('Hello World')"})
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# Code execution endpoint
@app.post("/api/execute")
async def execute_code(
    execution: CodeExecution,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        # Create temporary file with Python code
        temp_file = f"/tmp/{uuid.uuid4()}.py"
        with open(temp_file, 'w') as f:
            f.write(execution.code)
        
        # Execute using local Python (без Docker)
        result = subprocess.run(
            ["python", temp_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        os.remove(temp_file)
        return {"output": result.stdout, "error": result.stderr}
        
    except subprocess.TimeoutExpired:
        return {"output": None, "error": "Execution timed out"}
    except Exception as e:
        return {"output": None, "error": str(e)}

# AI Assistant routes
@app.post("/api/chat/assistant")
async def chat_with_assistant(message: dict):
    """
    AI ассистент для помощи в программировании
    """
    try:
        user_message = message.get("message", "")
        
        # Используем базового ассистента (можно заменить на продвинутую версию)
        response = generate_ai_response(user_message)
        # Чтобы использовать OpenAI, раскомментируйте строку ниже:
        # response = generate_ai_response_advanced(user_message)
        
        return {
            "response": response,
            "type": "ai_assistant"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_ai_response(user_message: str) -> str:
    """
    Генерируем ответ AI-ассистента
    В будущем можно подключить OpenAI API, Claude, или локальную модель
    """
    message_lower = user_message.lower()
    
    # Базовые ответы ассистента
    if "ошибка" in message_lower or "error" in message_lower:
        return "Проверьте синтаксис Python. Убедитесь, что все скобки закрыты, отступы правильные, и переменные объявлены."
    
    elif "как сделать" in message_lower or "how to" in message_lower:
        return "Я могу помочь с примерами кода! Опишите конкретнее, что вы хотите сделать."
    
    elif "игра" in message_lower or "game" in message_lower:
        return """Для создания игры на Python используйте Pygame. Вот базовый шаблон:

import pygame
pygame.init()
screen = pygame.display.set_mode((800, 600))
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    screen.fill((0, 0, 0))
    pygame.display.flip()
pygame.quit()"""

    elif "список" in message_lower or "массив" в message_lower or "list" in message_lower:
        return "Для работы со списками в Python:\n\nmy_list = [1, 2, 3]\nmy_list.append(4)  # Добавить элемент\nfor item in my_list:  # Перебор элементов\n    print(item)"

    elif "функция" in message_lower or "function" in message_lower:
        return "Создание функции в Python:\n\ndef my_function(параметры):\n    '''Документация функции'''\n    # код функции\n    return результат"

    else:
        return "Я ваш AI-ассистент для программирования на Python! Могу помочь с:\n- Поиском ошибок в коде\n- Примеры кода\n- Объяснением концепций\n- Созданием игр на Pygame\n\nЗадайте вопрос о программировании!"

# Продвинутая версия AI-ассистента с OpenAI
import openai
import os

def generate_ai_response_advanced(user_message: str) -> str:
    """
    Используем OpenAI API для более умных ответов
    Требует установки: pip install openai
    И настройки API ключа: os.environ["OPENAI_API_KEY"]
    """
    try:
        # Раскомментируйте для использования OpenAI
        # openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # response = openai.ChatCompletion.create(
        #     model="gpt-3.5-turbo",
        #     messages=[
        #         {"role": "system", "content": "You are a helpful Python programming assistant."},
        #         {"role": "user", "content": user_message}
        #     ],
        #     max_tokens=500
        # )
        # return response.choices[0].message.content
        
        # Временно используем базовые ответы
        return generate_ai_response(user_message)
        
    except Exception as e:
        return f"Ошибка AI ассистента: {str(e)}"

# WebSocket for real-time collaboration
@app.websocket("/ws/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    active_connections[project_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast to other users in the same project
            for connection in active_connections.values():
                if connection != websocket:
                    await connection.send_text(data)
    except WebSocketDisconnect:
        del active_connections[project_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
