from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, ValidationError
from typing import Dict, Any, List, Optional
import yaml
import json
import os
import aiofiles
from datetime import datetime
import traceback

app = FastAPI(title="YAML Editor API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class YAMLValidationRequest(BaseModel):
    content: str
    filename: Optional[str] = "untitled.yaml"

class YAMLSaveRequest(BaseModel):
    content: str
    filename: str

class YAMLValidationResponse(BaseModel):
    valid: bool
    errors: List[str] = []
    parsed_data: Optional[Dict[Any, Any]] = None
    json_preview: Optional[str] = None

class FileListResponse(BaseModel):
    files: List[Dict[str, Any]]

import pathlib
# Configuration
BACKEND_DIR = pathlib.Path(__file__).parent.resolve()
YAML_FILES_DIR = str(BACKEND_DIR / "nursing")  # Absolute path to nursing folder
ALLOWED_EXTENSIONS = {".yaml", ".yml"}

def get_yaml_files():
    """Get list of YAML files in the nursing directory (and subfolders if needed)"""
    files = []
    try:
        for root, dirs, filenames in os.walk(YAML_FILES_DIR):
            for filename in filenames:
                if any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
                    filepath = os.path.join(root, filename)
                    relpath = os.path.relpath(filepath, start=YAML_FILES_DIR)
                    try:
                        stats = os.stat(filepath)
                        files.append({
                            "name": filename,
                            "size": stats.st_size,
                            "modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                            "path": os.path.join('nursing', relpath).replace('\\', '/')
                        })
                    except OSError:
                        continue
    except OSError:
        pass
    return sorted(files, key=lambda x: x["name"])

@app.get("/")
async def root():
    """API health check"""
    return {"message": "YAML Editor API is running", "version": "1.0.0"}

@app.get("/api/files", response_model=FileListResponse)
async def list_files():
    """List all YAML files in the directory"""
    try:
        files = get_yaml_files()
        return FileListResponse(files=files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@app.get("/api/files/{filename}")
async def get_file(filename: str):
    """Get content of a specific YAML file"""
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    # Support subfolders: filename may be nursing/...
    filepath = os.path.join(YAML_FILES_DIR, filename)
    if not os.path.exists(filepath):
        # Try relative to backend root (for legacy or direct path)
        filepath = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        async with aiofiles.open(filepath, 'r', encoding='utf-8') as file:
            content = await file.read()
        
        return {
            "filename": filename,
            "content": content,
            "size": len(content.encode('utf-8')),
            "modified": datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.post("/api/validate", response_model=YAMLValidationResponse)
async def validate_yaml(request: YAMLValidationRequest):
    """Validate YAML content and return parsed data"""
    errors = []
    parsed_data = None
    json_preview = None
    
    try:
        # Parse YAML
        parsed_data = yaml.safe_load(request.content)
        
        # Generate JSON preview
        if parsed_data is not None:
            json_preview = json.dumps(parsed_data, indent=2, ensure_ascii=False)
        
        # Additional validation for nursing pathway files
        if request.filename and "nursing" in request.filename.lower():
            validation_errors = validate_nursing_pathway_structure(parsed_data)
            errors.extend(validation_errors)
        
        return YAMLValidationResponse(
            valid=len(errors) == 0,
            errors=errors,
            parsed_data=parsed_data,
            json_preview=json_preview
        )
        
    except yaml.YAMLError as e:
        error_msg = f"YAML parsing error: {str(e)}"
        if hasattr(e, 'problem_mark'):
            mark = e.problem_mark
            error_msg += f" at line {mark.line + 1}, column {mark.column + 1}"
        errors.append(error_msg)
        
    except Exception as e:
        errors.append(f"Unexpected error: {str(e)}")
    
    return YAMLValidationResponse(
        valid=False,
        errors=errors,
        parsed_data=None,
        json_preview=None
    )

def validate_nursing_pathway_structure(data):
    """Validate nursing pathway specific structure"""
    errors = []
    
    if not isinstance(data, dict):
        return ["Root element must be an object"]
    
    # Check for required fields based on file type
    if "pathwayInfo" in data:
        # Config file validation
        pathway_info = data["pathwayInfo"]
        required_fields = ["id", "version", "name", "type"]
        for field in required_fields:
            if field not in pathway_info:
                errors.append(f"Missing required field: pathwayInfo.{field}")
        
        if "requirements" not in data:
            errors.append("Missing required field: requirements")
    
    elif "ruleset" in data:
        # Rules file validation
        required_fields = ["ruleset", "version", "rules"]
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")
        
        if "rules" in data and isinstance(data["rules"], list):
            for i, rule in enumerate(data["rules"]):
                if not isinstance(rule, dict):
                    errors.append(f"Rule {i} must be an object")
                    continue
                
                if "name" not in rule:
                    errors.append(f"Rule {i} missing required field: name")
                if "conditions" not in rule:
                    errors.append(f"Rule {i} missing required field: conditions")
                if "action" not in rule:
                    errors.append(f"Rule {i} missing required field: action")
    
    return errors

@app.post("/api/save")
async def save_file(request: YAMLSaveRequest):
    """Save YAML content to file"""
    if not any(request.filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    # Support subfolders: filename may be nursing/...
    filepath = os.path.join(YAML_FILES_DIR, request.filename)
    if not os.path.exists(filepath):
        # Try relative to backend root (for legacy or direct path)
        filepath = os.path.join(os.path.dirname(__file__), request.filename)
    if not os.path.exists(filepath):
        # If saving, just use the default path
        filepath = os.path.join(YAML_FILES_DIR, request.filename)
    
    try:
        # Validate YAML before saving
        yaml.safe_load(request.content)
        
        # Create backup of existing file
        if os.path.exists(filepath):
            backup_path = f"{filepath}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(filepath, backup_path)
        
        # Save new content
        async with aiofiles.open(filepath, 'w', encoding='utf-8') as file:
            await file.write(request.content)
        
        return {
            "success": True,
            "message": f"File '{request.filename}' saved successfully",
            "filename": request.filename,
            "size": len(request.content.encode('utf-8')),
            "modified": datetime.now().isoformat()
        }
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

@app.post("/api/convert/{filename}")
async def convert_to_json(filename: str):
    """Convert YAML file to JSON"""
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    # Support subfolders: filename may be nursing/...
    yaml_path = os.path.join(YAML_FILES_DIR, filename)
    if not os.path.exists(yaml_path):
        # Try relative to backend root (for legacy or direct path)
        yaml_path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(yaml_path):
        raise HTTPException(status_code=404, detail="File not found")
    json_filename = filename.replace('.yaml', '.json').replace('.yml', '.json')
    json_path = os.path.join(YAML_FILES_DIR, json_filename)
    
    if not os.path.exists(yaml_path):
        raise HTTPException(status_code=404, detail="YAML file not found")
    
    try:
        async with aiofiles.open(yaml_path, 'r', encoding='utf-8') as file:
            yaml_content = await file.read()
        
        # Parse YAML
        data = yaml.safe_load(yaml_content)
        
        # Add generation metadata
        if isinstance(data, dict):
            data['_metadata'] = {
                'generatedFrom': filename,
                'generatedAt': datetime.now().isoformat(),
                'generatedBy': 'yaml-editor-api'
            }
        
        # Save JSON
        json_content = json.dumps(data, indent=2, ensure_ascii=False)
        async with aiofiles.open(json_path, 'w', encoding='utf-8') as file:
            await file.write(json_content)
        
        return {
            "success": True,
            "message": f"Converted {filename} to {json_filename}",
            "yaml_file": filename,
            "json_file": json_filename,
            "json_content": json_content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting file: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a new YAML file"""
    if not any(file.filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file extension. Only .yaml and .yml files are allowed.")
    
    # Support subfolders: filename may be nursing/...
    filepath = os.path.join(YAML_FILES_DIR, file.filename)
    
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Validate YAML
        yaml.safe_load(content_str)
        
        # Save file
        async with aiofiles.open(filepath, 'w', encoding='utf-8') as f:
            await f.write(content_str)
        
        return {
            "success": True,
            "message": f"File '{file.filename}' uploaded successfully",
            "filename": file.filename,
            "size": len(content)
        }
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML file: {str(e)}")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be valid UTF-8 text")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
