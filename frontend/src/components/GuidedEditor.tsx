import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Alert,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  Code as CodeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
// Date picker functionality will use regular input fields for better compatibility
import * as yaml from 'js-yaml';

interface PathwayConfig {
  pathwayInfo: {
    id: string;
    version: string;
    name: string;
    type: string;
    issuingOrganizationId: string;
    effectiveDate: string;
    expirationDate: string | null;
    rulesFile?: string;
    rulesFileJson?: string;
  };
  requirements: Record<string, any>;
}

interface GuidedEditorProps {
  content: string;
  onChange: (content: string) => void;
  isVisible: boolean;
}

const pathwayTypes = [
  { value: 'career', label: 'Career Pathway', description: 'Professional career development pathway' },
  { value: 'admission', label: 'Admission Pathway', description: 'Student admission requirements' },
  { value: 'course', label: 'Course Pathway', description: 'Academic course progression' },
  { value: 'certification', label: 'Certification Pathway', description: 'Professional certification requirements' },
];

const requirementTypes = [
  { value: 'coursework', label: 'Coursework', description: 'Required courses or academic work' },
  { value: 'certification', label: 'Certification', description: 'Professional certifications or licenses' },
  { value: 'admission', label: 'Admission', description: 'Prerequisites or admission requirements' },
  { value: 'assessment', label: 'Assessment', description: 'Tests, exams, or evaluations' },
  { value: 'experience', label: 'Experience', description: 'Work experience or practical hours' },
];

const GuidedEditor: React.FC<GuidedEditorProps> = ({ content, onChange, isVisible }) => {
  const [config, setConfig] = useState<PathwayConfig | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['pathwayInfo']);

  useEffect(() => {
    try {
      if (content.trim()) {
        const parsed = yaml.load(content) as PathwayConfig;
        
        // Ensure we have a valid config structure
        const defaultConfig: PathwayConfig = {
          pathwayInfo: {
            id: '',
            version: '1.0.0',
            name: '',
            type: 'career',
            issuingOrganizationId: '',
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: null,
          },
          requirements: {},
        };

        if (parsed && typeof parsed === 'object') {
          setConfig({
            pathwayInfo: {
              ...defaultConfig.pathwayInfo,
              ...(parsed.pathwayInfo || {}),
            },
            requirements: parsed.requirements || {},
          });
        } else {
          setConfig(defaultConfig);
        }
        setParseError(null);
      } else {
        // Empty content - set default config
        setConfig({
          pathwayInfo: {
            id: '',
            version: '1.0.0',
            name: '',
            type: 'career',
            issuingOrganizationId: '',
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: null,
          },
          requirements: {},
        });
        setParseError(null);
      }
    } catch (error) {
      setParseError((error as Error).message);
    }
  }, [content]);

  const updateConfig = (newConfig: PathwayConfig) => {
    setConfig(newConfig);
    try {
      const yamlContent = yaml.dump(newConfig, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
      });
      onChange(yamlContent);
    } catch (error) {
      console.error('Error converting to YAML:', error);
    }
  };

  const handlePathwayInfoChange = (field: string, value: any) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      pathwayInfo: {
        ...config.pathwayInfo,
        [field]: value,
      },
    };
    updateConfig(newConfig);
  };

  const addRequirement = () => {
    if (!config) return;
    
    const requirementKey = `requirement_${Date.now()}`;
    const newConfig = {
      ...config,
      requirements: {
        ...config.requirements,
        [requirementKey]: {
          taskName: '',
          required: true,
          description: '',
          entities: [],
          fields: [],
        },
      },
    };
    updateConfig(newConfig);
    setExpandedSections([...expandedSections, requirementKey]);
  };

  const updateRequirement = (key: string, field: string, value: any) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      requirements: {
        ...config.requirements,
        [key]: {
          ...config.requirements[key],
          [field]: value,
        },
      },
    };
    updateConfig(newConfig);
  };

  const deleteRequirement = (key: string) => {
    if (!config) return;
    
    const newRequirements = { ...config.requirements };
    delete newRequirements[key];
    
    const newConfig = {
      ...config,
      requirements: newRequirements,
    };
    updateConfig(newConfig);
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!isVisible) return null;

  if (parseError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">YAML Parse Error</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {parseError}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Please fix the YAML syntax in the code editor to use the guided editor.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Loading guided editor...
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 2,
          maxHeight: '100%',
          '&::-webkit-scrollbar': {
            width: '12px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '6px',
            border: '2px solid #f1f1f1',
            '&:hover': {
              backgroundColor: '#555',
            },
          },
          // For Firefox
          scrollbarWidth: 'auto',
          scrollbarColor: '#888 #f1f1f1',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <EditIcon color="primary" />
          <Typography variant="h5">Guided YAML Editor</Typography>
          <Tooltip title="This editor helps you create and edit YAML files using forms instead of code">
            <IconButton size="small">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Pathway Information */}
        <Accordion 
          expanded={expandedSections.includes('pathwayInfo')}
          onChange={() => handleSectionToggle('pathwayInfo')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Pathway Information
              <Chip label="Required" size="small" color="primary" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="Pathway ID"
                fullWidth
                value={config?.pathwayInfo?.id || ''}
                onChange={(e) => handlePathwayInfoChange('id', e.target.value)}
                helperText="Unique identifier for this pathway (e.g., pathway_college_nursing_2025)"
                placeholder="pathway_college_nursing_2025F"
              />
              
              <TextField
                label="Pathway Name"
                fullWidth
                value={config?.pathwayInfo?.name || ''}
                onChange={(e) => handlePathwayInfoChange('name', e.target.value)}
                helperText="Human-readable name for this pathway"
                placeholder="College Nursing Career Pathway"
              />
              
              <FormControl fullWidth>
                <InputLabel>Pathway Type</InputLabel>
                <Select
                  value={config?.pathwayInfo?.type || 'career'}
                  label="Pathway Type"
                  onChange={(e) => handlePathwayInfoChange('type', e.target.value)}
                >
                  {pathwayTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography>{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Issuing Organization ID"
                fullWidth
                value={config?.pathwayInfo?.issuingOrganizationId || ''}
                onChange={(e) => handlePathwayInfoChange('issuingOrganizationId', e.target.value)}
                helperText="ID of the organization that issues this pathway"
                placeholder="org_dallasCollege"
              />
              
              <TextField
                label="Version"
                fullWidth
                value={config?.pathwayInfo?.version || '1.0.0'}
                onChange={(e) => handlePathwayInfoChange('version', e.target.value)}
                helperText="Version number (semantic versioning recommended)"
                placeholder="1.0.0"
              />
              
              <TextField
                label="Effective Date"
                fullWidth
                type="date"
                value={config?.pathwayInfo?.effectiveDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => handlePathwayInfoChange('effectiveDate', e.target.value)}
                helperText="When this pathway becomes active"
                InputLabelProps={{ shrink: true }}
              />
              
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config?.pathwayInfo?.expirationDate !== null}
                      onChange={(e) => 
                        handlePathwayInfoChange(
                          'expirationDate', 
                          e.target.checked ? new Date().toISOString().split('T')[0] : null
                        )
                      }
                    />
                  }
                  label="Set Expiration Date"
                />
                {config?.pathwayInfo?.expirationDate && (
                  <TextField
                    label="Expiration Date"
                    fullWidth
                    type="date"
                    value={config.pathwayInfo.expirationDate}
                    onChange={(e) => handlePathwayInfoChange('expirationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Requirements */}
        <Accordion 
          expanded={expandedSections.includes('requirements')}
          onChange={() => handleSectionToggle('requirements')}
          sx={{ mt: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Requirements
              <Chip 
                label={`${Object.keys(config?.requirements || {}).length} items`} 
                size="small" 
                variant="outlined" 
              />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Define what students need to complete for this pathway
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={addRequirement}
                  size="small"
                >
                  Add Requirement
                </Button>
              </Box>
              
              {Object.entries(config?.requirements || {}).map(([key, requirement]) => (
                <Card key={key} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <TextField
                        label="Requirement Name"
                        value={key}
                        size="small"
                        InputProps={{ readOnly: true }}
                        helperText="Auto-generated identifier"
                      />
                      <IconButton
                        onClick={() => deleteRequirement(key)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Stack spacing={2}>
                      <TextField
                        label="Task Name"
                        fullWidth
                        value={requirement.taskName || ''}
                        onChange={(e) => updateRequirement(key, 'taskName', e.target.value)}
                        placeholder="task_coursework_nursing101"
                        helperText="Unique task identifier for this requirement"
                      />
                      
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={requirement.description || ''}
                        onChange={(e) => updateRequirement(key, 'description', e.target.value)}
                        placeholder="Describe what this requirement entails..."
                        helperText="Optional description for this requirement"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={requirement.required !== false}
                            onChange={(e) => updateRequirement(key, 'required', e.target.checked)}
                          />
                        }
                        label="Required"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              
              {Object.keys(config?.requirements || {}).length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    No requirements defined yet. Click "Add Requirement" to get started.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Tips and Help */}
        <Card sx={{ mt: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HelpIcon color="primary" />
              Tips for Non-Technical Users
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Use the <strong>Code Editor</strong> tab for advanced YAML editing
              </Typography>
              <Typography variant="body2">
                • All changes are automatically converted to YAML format
              </Typography>
              <Typography variant="body2">
                • Required fields are marked with colored chips
              </Typography>
              <Typography variant="body2">
                • Hover over help icons (?) for additional information
              </Typography>
              <Typography variant="body2">
                • Save your work frequently using Ctrl+S (Cmd+S on Mac)
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GuidedEditor;
