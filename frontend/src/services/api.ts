import axios from 'axios';
import {
  YAMLFile,
  FileContent,
  ValidationResult,
  SaveRequest,
  SaveResponse,
  ConvertResponse,
  UploadResponse,
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
);

export const yamlApi = {
  // Get list of YAML files
  async getFiles(): Promise<YAMLFile[]> {
    const response = await api.get('/api/files');
    return response.data.files;
  },

  // Get file content
  async getFile(filename: string): Promise<FileContent> {
    const response = await api.get(`/api/files/${filename}`);
    return response.data;
  },

  // Validate YAML content
  async validateYAML(content: string, filename?: string): Promise<ValidationResult> {
    const response = await api.post('/api/validate', {
      content,
      filename: filename || 'untitled.yaml',
    });
    return response.data;
  },

  // Save YAML file
  async saveFile(request: SaveRequest): Promise<SaveResponse> {
    const response = await api.post('/api/save', request);
    return response.data;
  },

  // Convert YAML to JSON
  async convertToJSON(filename: string): Promise<ConvertResponse> {
    const response = await api.post(`/api/convert/${filename}`);
    return response.data;
  },

  // Upload new YAML file
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ message: string; version: string }> {
    const response = await api.get('/');
    return response.data;
  },
};

export default yamlApi;
