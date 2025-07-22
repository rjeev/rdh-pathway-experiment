# YAML Editor Application

A full-stack web application for editing and validating YAML configuration files for nursing pathway configurations.

## Features

### 🔍 **Validation & Syntax Checking**
- Real-time YAML syntax validation
- Nursing pathway structure validation
- Error highlighting and detailed error messages
- JSON preview generation

### ✏️ **Advanced Editor**
- Monaco Editor with YAML syntax highlighting
- Auto-completion and IntelliSense
- Keyboard shortcuts (Ctrl/Cmd+S to save)
- Line numbers and code folding
- Find and replace functionality

### 📁 **File Management**
- Browse and select YAML files
- Create new files from templates
- Upload existing YAML files
- Save and Save As functionality
- Download files locally

### 🔄 **YAML to JSON Conversion**
- Convert validated YAML files to JSON
- Automatic metadata injection
- Preserve file structure and formatting

### 💡 **User-Friendly Interface**
- Clean, modern Material-UI design
- Responsive layout
- File browser with metadata
- Validation status indicators
- Toast notifications for user feedback

## Tech Stack

### Backend (FastAPI)
- **FastAPI**: Modern, fast web framework for APIs
- **Pydantic**: Data validation and serialization
- **PyYAML**: YAML parsing and validation
- **Uvicorn**: ASGI server for production

### Frontend (React TypeScript)
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: React component library
- **Monaco Editor**: VS Code editor in the browser
- **React Query**: Data fetching and caching
- **Axios**: HTTP client

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 🚀 One-Command Startup
```bash
./start.sh
```

The startup script will:
1. Create Python virtual environment
2. Install all dependencies
3. Start the FastAPI backend on port 8001
4. Start the React frontend on port 3000
5. Open your browser to the application

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

### 1. **Select or Create Files**
- Browse existing YAML files in the file list
- Click "New File" to create from template
- Use "Upload" to add existing files

### 2. **Edit YAML Content**
- Use the Monaco editor with syntax highlighting
- Real-time validation shows errors instantly
- Auto-completion helps with structure

### 3. **Validate and Save**
- Validation panel shows errors and warnings
- Fix any issues before saving
- Use Ctrl/Cmd+S or the Save button

### 4. **Convert to JSON**
- Click "Convert to JSON" for validated files
- Generated JSON includes metadata
- Both files are updated automatically

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List all YAML files |
| GET | `/api/files/{filename}` | Get file content |
| POST | `/api/validate` | Validate YAML content |
| POST | `/api/save` | Save YAML file |
| POST | `/api/convert/{filename}` | Convert YAML to JSON |
| POST | `/api/upload` | Upload new file |

## Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8001)

### Backend Configuration
- Modify `YAML_FILES_DIR` in `backend/main.py` to change file directory
- Add custom validation rules in `validate_nursing_pathway_structure()`

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Run backend in production
cd backend
uvicorn main:app --host 0.0.0.0 --port 8001
```

## File Structure

```
yaml-editor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main application
│   │   └── index.tsx       # Entry point
│   ├── package.json        # Node dependencies
│   └── tsconfig.json       # TypeScript config
├── start.sh                # Startup script
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Python and Node.js versions meet requirements
4. Check that ports 3000 and 8001 are available
