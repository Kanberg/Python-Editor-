#!/bin/bash

echo ">>> Starting environment setup..."

# Install Node.js for the frontend (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18

# Install backend Python dependencies
echo ">>> Installing Python dependencies..."
pip3 install -r backend/requirements.txt

echo ">>> Setup complete!"
