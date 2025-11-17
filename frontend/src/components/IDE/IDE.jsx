import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Bot, User, Code, Lightbulb, Play, Download, Save } from 'lucide-react';

// Компонент чата AI-ассистента
const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Привет! Я ваш AI-ассистент для программирования на Python. Чем могу помочь?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Извините, произошла ошибка. Попробуйте еще раз.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Как исправить синтаксическую ошибку?",
    "Покажи пример игры на Pygame",
    "Как работать со списками в Python?",
    "Как создать функцию?"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Ассистент</h3>
            <p className="text-xs text-gray-400">Помощь в программировании</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === 'bot' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-sm">
                {message.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span className="text-xs opacity-70">Ассистент печатает...</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-xs text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задайте вопрос о программировании..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors self-end"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const IDE = () => {
  const { projectId } = useParams();
  const { user, token } = useAuth();
  const [code, setCode] = useState('# Welcome to Python Web IDE!\nprint("Hello World")');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('main.py');
  const socketRef = useRef();

  useEffect(() => {
    // Connect to WebSocket for real-time collaboration
    socketRef.current = io('http://localhost:8000');
    socketRef.current.emit('join_project', projectId);

    socketRef.current.on('code_update', (data) => {
      if (data.userId !== user.id) {
        setCode(data.code);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, user.id]);

  const handleCodeChange = (value) => {
    setCode(value);
    // Broadcast changes to other users
    socketRef.current.emit('code_update', {
      projectId,
      code: value,
      userId: user.id
    });
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running...');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/execute',
        { code, project_id: projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        setOutput(`Error: ${response.data.error}`);
      } else {
        setOutput(response.data.output);
      }
    } catch (error) {
      setOutput(`Execution error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runGameCode = () => {
    const gameCode = `
import pygame
import sys

# Initialize Pygame
pygame.init()

# Set up the display
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Python Game")

# Colors
WHITE = (255, 255, 255)
BLUE = (0, 0, 255)
RED = (255, 0, 0)

# Player
player_size = 50
player_x = WIDTH // 2 - player_size // 2
player_y = HEIGHT - player_size - 20
player_speed = 5

# Game loop
clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Player movement
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and player_x > 0:
        player_x -= player_speed
    if keys[pygame.K_RIGHT] and player_x < WIDTH - player_size:
        player_x += player_speed

    # Drawing
    screen.fill((0, 0, 0))  # Black background
    pygame.draw.rect(screen, BLUE, (player_x, player_y, player_size, player_size))
    
    # Draw some obstacles
    for i in range(0, WIDTH, 100):
        pygame.draw.rect(screen, RED, (i, 300, 50, 20))
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
    `;
    setCode(gameCode);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Project Files</h2>
          <div className="space-y-2">
            <button
              className={`w-full text-left px-3 py-2 rounded flex items-center space-x-2 ${
                activeFile === 'main.py' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFile('main.py')}
            >
              <Code className="w-4 h-4" />
              <span>main.py</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex space-x-4">
            <button
              onClick={executeCode}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 flex items-center space-x-2 text-white transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            <button
              onClick={runGameCode}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center space-x-2 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Load Game Template</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-2 text-white transition-colors">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Editor, Output and Chat */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
          
          {/* Right Panel - Output and Chat */}
          <div className="w-1/3 flex flex-col border-l border-gray-700">
            {/* Output Panel */}
            <div className="flex-1 bg-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white">Output</h3>
              </div>
              <div className="flex-1 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto text-white">
                {output}
              </div>
            </div>
            
            {/* AI Assistant Chat */}
            <div className="h-1/2 border-t border-gray-700">
              <ChatAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE;
