#!/bin/bash

# YAML Editor Startup Script
# This script starts both the FastAPI backend and React frontend

set -e

echo "🚀 Starting YAML Editor Application"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed${NC}"
    exit 1
fi

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM

# Navigate to the project directory
cd "$(dirname "$0")"

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
cd ..

# Install frontend dependencies
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
cd frontend
npm install --silent
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Start backend
echo -e "${BLUE}🐍 Starting FastAPI backend...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8001/ > /dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    cleanup
fi

echo -e "${GREEN}✅ Backend started on http://localhost:8001${NC}"

# Start frontend
echo -e "${BLUE}⚛️  Starting React frontend...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Frontend starting on http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}🎉 YAML Editor is now running!${NC}"
echo -e "${BLUE}📝 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend API: http://localhost:8001${NC}"
echo -e "${BLUE}📚 API Docs: http://localhost:8001/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for processes to finish
wait
