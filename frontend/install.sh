#!/bin/bash

echo "🔧 Setting up YAML Editor Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

echo "📦 Clearing npm cache..."
npm cache clean --force

echo "🗑️  Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "📥 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully!"
    echo "🚀 You can now run 'npm start' to start the development server"
else
    echo "❌ Installation failed. Trying alternative approaches..."
    
    echo "🔄 Trying with --legacy-peer-deps..."
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed successfully with legacy peer deps!"
    else
        echo "❌ Installation still failed. Trying yarn..."
        
        # Check if yarn is installed
        if command -v yarn &> /dev/null; then
            echo "🧶 Using yarn instead..."
            yarn install
            
            if [ $? -eq 0 ]; then
                echo "✅ Frontend dependencies installed successfully with yarn!"
            else
                echo "❌ Yarn installation also failed."
                echo "Please check your Node.js version and try again."
                echo "Required: Node.js 16+ and npm 8+"
                node --version
                npm --version
            fi
        else
            echo "❌ Yarn not found. Please install yarn or fix npm issues."
            echo "Node.js version:"
            node --version
            echo "npm version:"
            npm --version
        fi
    fi
fi

echo "Done!"
