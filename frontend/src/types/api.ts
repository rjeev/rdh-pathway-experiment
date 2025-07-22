export interface YAMLFile {
  name: string;
  size: number;
  modified: string;
  path: string;
}

export interface FileContent {
  filename: string;
  content: string;
  size: number;
  modified: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  parsed_data?: any;
  json_preview?: string;
}

export interface SaveRequest {
  content: string;
  filename: string;
}

export interface SaveResponse {
  success: boolean;
  message: string;
  filename: string;
  size: number;
  modified: string;
}

export interface ConvertResponse {
  success: boolean;
  message: string;
  yaml_file: string;
  json_file: string;
  json_content: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  size: number;
}

export interface APIError {
  detail: string;
}
