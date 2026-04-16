#!/bin/bash

echo "🎮 Game Reco Frontend - Quick Start Script 🎮"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=============================================="
echo "✨ Setup complete! ✨"
echo "=============================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://localhost:5173"
echo ""
echo "Make sure your backend API is running at: http://localhost:3000"
echo ""
echo "Happy gaming! 🎮"
