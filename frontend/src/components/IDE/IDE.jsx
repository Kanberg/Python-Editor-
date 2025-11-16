import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';

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
          <h2 className="text-lg font-semibold mb-4">Project Files</h2>
          <div className="space-y-2">
            <button
              className={`w-full text-left px-3 py-2 rounded ${
                activeFile === 'main.py' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => setActiveFile('main.py')}
            >
              main.py
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={runGameCode}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Load Game Template
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Save
            </button>
          </div>
        </div>

        {/* Editor and Output */}
        <div className="flex-1 flex">
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
          
          {/* Output Panel */}
          <div className="w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Output</h3>
            </div>
            <div className="flex-1 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE;
