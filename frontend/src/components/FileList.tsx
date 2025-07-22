import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Description as FileIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import { yamlApi } from '../services/api';
import { YAMLFile } from '../types/api';
import toast from 'react-hot-toast';

interface FileListProps {
  selectedFile: string | null;
  onFileSelect: (filename: string) => void;
  onUploadFile: (file: File) => void;
  onCreateNew: () => void;
}

const FileList: React.FC<FileListProps> = ({
  selectedFile,
  onFileSelect,
  onUploadFile,
  onCreateNew,
}) => {
  const [uploadInput, setUploadInput] = useState<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery<YAMLFile[], Error>(['files'], yamlApi.getFiles, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    // Create hidden file input for upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.style.display = 'none';
    input.addEventListener('change', handleFileUpload);
    document.body.appendChild(input);
    setUploadInput(input);

    return () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
  }, []);

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      try {
        await onUploadFile(file);
        await refetch();
        input.value = ''; // Reset input
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleUploadClick = () => {
    uploadInput?.click();
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('File list refreshed');
    } catch (error) {
      toast.error('Failed to refresh file list');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Error loading files: {error.message}
        </Typography>
        <Button onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="h2">
            YAML Files
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
            fullWidth
          >
            New File
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
            fullWidth
          >
            Upload
          </Button>
        </Box>
      </Box>

      {/* File List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Typography>Loading files...</Typography>
          </Box>
        ) : files.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No YAML files found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Upload a file or create a new one to get started
            </Typography>
          </Box>
        ) : (
          <List dense>
            {files.map((file, index) => (
              <React.Fragment key={file.name}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedFile === file.name}
                    onClick={() => onFileSelect(file.name)}
                    sx={{
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <FileIcon color={selectedFile === file.name ? 'inherit' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatFileSize(file.size)}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(file.modified)}
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: selectedFile === file.name ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < files.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Chip
          size="small"
          label={`${files.length} file${files.length !== 1 ? 's' : ''}`}
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

export default FileList;
