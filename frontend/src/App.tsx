import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Transform as ConvertIcon,
  MoreVert as MoreIcon,
  Add as NewIcon,
  Description as TemplateIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import FileList from './components/FileList';
import EnhancedYAMLEditor from './components/EnhancedYAMLEditor';
import EnhancedValidationPanel from './components/EnhancedValidationPanel';
import TemplateDialog from './components/TemplateDialog';
import HelpDialog from './components/HelpDialog';
import FloatingHelp from './components/FloatingHelp';
import { yamlApi } from './services/api';
import { ValidationResult, FileContent } from './types/api';

const DEFAULT_YAML_CONTENT = `# New YAML Configuration
# Version: 1.0.0
# Created: ${new Date().toISOString().split('T')[0]}

pathwayInfo:
  id: pathway_example_2025F
  version: "1.0.0"
  name: Example Pathway
  type: configuration
  issuingOrganizationId: org_example
  effectiveDate: "${new Date().toISOString().split('T')[0]}"
  expirationDate: null

requirements:
  # Add your requirements here
`;

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showJSONDialog, setShowJSONDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const queryClient = useQueryClient();

  // Load file content when a file is selected
  const { data: fileContent, isLoading: loadingFile } = useQuery<FileContent, Error>(
    ['file-content', selectedFile],
    () => yamlApi.getFile(selectedFile!),
    {
      enabled: !!selectedFile,
      onSuccess: (data) => {
        setEditorContent(data.content);
        setHasUnsavedChanges(false);
        validateContent(data.content);
      },
    }
  );

  // Save file mutation
  const saveMutation = useMutation(yamlApi.saveFile, {
    onSuccess: (data) => {
      toast.success(data.message);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries(['files']);
      queryClient.invalidateQueries(['file-content', selectedFile]);
    },
    onError: (error: Error) => {
      toast.error(`Save failed: ${error.message}`);
    },
  });

  // Convert to JSON mutation
  const convertMutation = useMutation(yamlApi.convertToJSON, {
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['files']);
    },
    onError: (error: Error) => {
      toast.error(`Conversion failed: ${error.message}`);
    },
  });

  // Upload file mutation
  const uploadMutation = useMutation(yamlApi.uploadFile, {
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['files']);
      setSelectedFile(data.filename);
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const validateContent = useCallback(async (content: string) => {
    if (!content.trim()) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await yamlApi.validateYAML(content, selectedFile || 'untitled.yaml');
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        valid: false,
        errors: [(error as Error).message],
      });
    } finally {
      setIsValidating(false);
    }
  }, [selectedFile]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setHasUnsavedChanges(true);
    
    // Debounced validation
    const timeoutId = setTimeout(() => {
      validateContent(content);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setShowNewFileDialog(true);
      return;
    }

    if (!validation?.valid) {
      toast.error('Cannot save file with validation errors');
      return;
    }

    saveMutation.mutate({
      content: editorContent,
      filename: selectedFile,
    });
  };

  const handleSaveAs = () => {
    setNewFileName(selectedFile || '');
    setShowNewFileDialog(true);
  };

  const handleNewFile = () => {
    setShowTemplateDialog(true);
  };

  const handleCreateFromTemplate = (templateContent: string) => {
    setSelectedFile(null);
    setEditorContent(templateContent);
    setHasUnsavedChanges(true);
    setValidation(null);
    validateContent(templateContent);
  };

  const handleCreateBlankFile = () => {
    setSelectedFile(null);
    setEditorContent(DEFAULT_YAML_CONTENT);
    setHasUnsavedChanges(true);
    setValidation(null);
    validateContent(DEFAULT_YAML_CONTENT);
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a filename');
      return;
    }

    const filename = newFileName.endsWith('.yaml') ? newFileName : `${newFileName}.yaml`;
    
    try {
      await saveMutation.mutateAsync({
        content: editorContent,
        filename,
      });
      setSelectedFile(filename);
      setShowNewFileDialog(false);
      setNewFileName('');
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const handleConvertToJSON = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to convert');
      return;
    }

    if (!validation?.valid) {
      toast.error('Cannot convert file with validation errors');
      return;
    }

    convertMutation.mutate(selectedFile);
  };

  const handleDownload = () => {
    if (!selectedFile || !editorContent) return;

    const blob = new Blob([editorContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    const handleEditorSave = () => {
      handleSave();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('editor-save', handleEditorSave);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('editor-save', handleEditorSave);
    };
  }, [selectedFile, editorContent, validation]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            YAML Editor - Nursing Pathway
            {selectedFile && (
              <>
                {' - '}
                <Chip
                  label={selectedFile}
                  size="small"
                  sx={{ ml: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                {hasUnsavedChanges && (
                  <Chip
                    label="●"
                    size="small"
                    sx={{ ml: 1, backgroundColor: 'orange', minWidth: 20 }}
                  />
                )}
              </>
            )}
          </Typography>

          <ButtonGroup variant="contained" size="small" sx={{ mr: 2 }}>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!editorContent || saveMutation.isLoading}
            >
              Save
            </Button>
            <Button
              startIcon={<ConvertIcon />}
              onClick={handleConvertToJSON}
              disabled={!selectedFile || !validation?.valid || convertMutation.isLoading}
            >
              Convert to JSON
            </Button>
          </ButtonGroup>

          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => setShowHelpDialog(true)}
            sx={{ mr: 2 }}
          >
            Help
          </Button>

          <IconButton color="inherit" onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { setShowTemplateDialog(true); handleMenuClose(); }}>
              <TemplateIcon sx={{ mr: 1 }} />
              New from Template
            </MenuItem>
            <MenuItem onClick={() => { handleCreateBlankFile(); handleMenuClose(); }}>
              <NewIcon sx={{ mr: 1 }} />
              New Blank File
            </MenuItem>
            <MenuItem onClick={() => { handleSaveAs(); handleMenuClose(); }}>
              <SaveIcon sx={{ mr: 1 }} />
              Save As...
            </MenuItem>
            <MenuItem 
              onClick={() => { handleDownload(); handleMenuClose(); }}
              disabled={!editorContent}
            >
              <DownloadIcon sx={{ mr: 1 }} />
              Download
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* File List */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
          <FileList
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onUploadFile={(file) => uploadMutation.mutate(file)}
            onCreateNew={() => setShowTemplateDialog(true)}
          />
        </Box>

        {/* Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            <EnhancedYAMLEditor
              content={editorContent}
              onChange={handleEditorChange}
              onValidation={setValidation}
              isLoading={loadingFile}
              filename={selectedFile || 'untitled.yaml'}
            />
          </Box>

          {/* Validation Panel */}
          <EnhancedValidationPanel
            validation={validation}
            isValidating={isValidating}
            onShowJSON={() => setShowJSONDialog(true)}
          />
        </Box>
      </Box>

      {/* JSON Preview Dialog */}
      <Dialog
        open={showJSONDialog}
        onClose={() => setShowJSONDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>JSON Preview</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {validation?.json_preview || 'No JSON preview available'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJSONDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New File Dialog */}
      <Dialog
        open={showNewFileDialog}
        onClose={() => setShowNewFileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedFile ? 'Save As...' : 'Create New File'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Filename"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="example.yaml"
            helperText="Enter filename with .yaml extension"
          />
          {!validation?.valid && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please fix validation errors before saving
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFileDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNewFile}
            disabled={!newFileName.trim() || !validation?.valid || saveMutation.isLoading}
            variant="contained"
          >
            {saveMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <TemplateDialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelectTemplate={handleCreateFromTemplate}
      />

      {/* Help Dialog */}
      <HelpDialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
      />

      {/* Floating Help Button */}
      <FloatingHelp
        onShowHelp={() => setShowHelpDialog(true)}
        onShowTemplates={() => setShowTemplateDialog(true)}
      />
    </Box>
  );
};

export default App;
