#!/bin/bash

echo "=== Setting up Python Web IDE ==="

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd ../frontend
npm install

echo "=== Setup complete! ==="
echo "To start the application:"
echo "Terminal 1: cd backend && python3 -m uvicorn app:app --host 0.0.0.0 --port 8000"
echo "Terminal 2: cd frontend && npm run dev"
