#!/bin/bash

echo "🔍 YAML Editor Troubleshooting"
echo "================================"

# Check Node.js version
echo "📋 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
    
    # Check if version is 16 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        echo "✅ Node.js version is compatible (16+)"
    else
        echo "❌ Node.js version is too old. Please upgrade to 16+"
        echo "💡 Visit: https://nodejs.org/"
    fi
else
    echo "❌ Node.js not found. Please install Node.js 16+"
    echo "💡 Visit: https://nodejs.org/"
fi

# Check npm version
echo "📋 Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
fi

# Check yarn availability
echo "📋 Checking yarn availability..."
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    echo "✅ yarn: $YARN_VERSION (alternative available)"
else
    echo "ℹ️  yarn not found (optional)"
fi

echo ""
echo "🔧 Quick Fixes:"
echo "1. Clear npm cache: npm cache clean --force"
echo "2. Delete node_modules: rm -rf node_modules package-lock.json"
echo "3. Reinstall: npm install"
echo "4. Use legacy peer deps: npm install --legacy-peer-deps"
echo "5. Use yarn: yarn install"
echo ""
echo "📁 Current directory: $(pwd)"

# Check if we're in the right directory
if [ -f "package.json" ]; then
    echo "✅ package.json found in current directory"
else
    echo "❌ package.json not found. Navigate to frontend directory first:"
    echo "   cd yaml-editor/frontend"
fi
