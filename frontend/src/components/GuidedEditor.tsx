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

// Interface for pathway config structure
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

// Interface for rules file structure
interface RulesConfig {
  ruleset: string;
  version?: string;
  configFile?: string;
  rules: Array<{
    name: string;
    conditions: Array<any>;
    action: {
      type: string;
      data: Record<string, any>;
    };
  }>;
}

// Union type for config files
type YAMLConfig = PathwayConfig | RulesConfig;

interface GuidedEditorProps {
  content: string;
  onChange: (content: string) => void;
  isVisible: boolean;
  filename?: string;
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

const actionTypes = [
  { value: 'assertion', label: 'Assertion', description: 'Make an assertion about data' },
  { value: 'notification', label: 'Notification', description: 'Trigger a notification' },
  { value: 'workflow', label: 'Workflow', description: 'Trigger a workflow step' },
];

const operatorOptions = [
  { value: '==', label: 'Equals (==)' },
  { value: '!=', label: 'Not Equals (!=)' },
  { value: '>', label: 'Greater Than (>)' },
  { value: '>=', label: 'Greater Than or Equal (>=)' },
  { value: '<', label: 'Less Than (<)' },
  { value: '<=', label: 'Less Than or Equal (<=)' },
  { value: 'in', label: 'In (in)' },
  { value: 'nin', label: 'Not In (nin)' },
  { value: 'contains', label: 'Contains (contains)' },
];

const GuidedEditor: React.FC<GuidedEditorProps> = ({ content, onChange, isVisible, filename }) => {
  const [config, setConfig] = useState<YAMLConfig | null>(null);
  const [configType, setConfigType] = useState<'pathway' | 'rules' | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['pathwayInfo']);

  useEffect(() => {
    try {
      if (content.trim()) {
        const parsed = yaml.load(content) as YAMLConfig;
        
        // Default configs
        const defaultPathwayConfig: PathwayConfig = {
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
        
        const defaultRulesConfig: RulesConfig = {
          ruleset: '',
          rules: [],
        };

        if (parsed && typeof parsed === 'object') {
          // Determine the type of config
          if ('ruleset' in parsed && 'rules' in parsed) {
            setConfigType('rules');
            setConfig(parsed as RulesConfig);
            // Set expanded sections based on ruleset structure
            setExpandedSections(['ruleset', ...parsed.rules.map((_, index) => `rule_${index}`)]);
          } else if ('pathwayInfo' in parsed) {
            setConfigType('pathway');
            setConfig({
              pathwayInfo: {
                ...defaultPathwayConfig.pathwayInfo,
                ...(parsed.pathwayInfo || {}),
              },
              requirements: parsed.requirements || {},
            });
            setExpandedSections(['pathwayInfo']);
          } else {
            // Handle unknown structure - default to pathway
            setConfigType('pathway');
            setConfig(defaultPathwayConfig);
          }
        } else {
          // Default based on filename
          if (filename?.toLowerCase().includes('rule')) {
            setConfigType('rules');
            setConfig(defaultRulesConfig);
            setExpandedSections(['ruleset']);
          } else {
            setConfigType('pathway');
            setConfig(defaultPathwayConfig);
            setExpandedSections(['pathwayInfo']);
          }
        }
        setParseError(null);
      } else {
        // Empty content - set default config based on filename
        if (filename?.toLowerCase().includes('rule')) {
          setConfigType('rules');
          setConfig({
            ruleset: '',
            rules: [],
          });
          setExpandedSections(['ruleset']);
        } else {
          setConfigType('pathway');
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
          setExpandedSections(['pathwayInfo']);
        }
        setParseError(null);
      }
    } catch (error) {
      setParseError((error as Error).message);
    }
  }, [content, filename]);

  const updateConfig = (newConfig: YAMLConfig) => {
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
    if (!config || configType !== 'pathway') return;
    
    const pathwayConfig = config as PathwayConfig;
    const newConfig = {
      ...pathwayConfig,
      pathwayInfo: {
        ...pathwayConfig.pathwayInfo,
        [field]: value,
      },
    };
    updateConfig(newConfig);
  };
  
  const handleRulesetChange = (value: string) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const newConfig = {
      ...rulesConfig,
      ruleset: value,
    };
    updateConfig(newConfig);
  };

  const addRequirement = () => {
    if (!config || configType !== 'pathway') return;
    
    const pathwayConfig = config as PathwayConfig;
    const requirementKey = `requirement_${Date.now()}`;
    const newConfig = {
      ...pathwayConfig,
      requirements: {
        ...pathwayConfig.requirements,
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
    if (!config || configType !== 'pathway') return;
    
    const pathwayConfig = config as PathwayConfig;
    const newConfig = {
      ...pathwayConfig,
      requirements: {
        ...pathwayConfig.requirements,
        [key]: {
          ...pathwayConfig.requirements[key],
          [field]: value,
        },
      },
    };
    updateConfig(newConfig);
  };

  const deleteRequirement = (key: string) => {
    if (!config || configType !== 'pathway') return;
    
    const pathwayConfig = config as PathwayConfig;
    const newRequirements = { ...pathwayConfig.requirements };
    delete newRequirements[key];
    
    const newConfig = {
      ...pathwayConfig,
      requirements: newRequirements,
    };
    updateConfig(newConfig);
  };

  // Rules management functions
  const addRule = () => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const newRule = {
      name: `rule_${Date.now()}`,
      conditions: [
        { field: 'entity', operator: '==', value: '' }
      ],
      action: {
        type: 'assertion',
        data: {
          status: 'pending'
        }
      }
    };
    
    const newConfig = {
      ...rulesConfig,
      rules: [...rulesConfig.rules, newRule]
    };
    
    updateConfig(newConfig);
    // Expand the newly added rule
    const newRuleIndex = newConfig.rules.length - 1;
    setExpandedSections([...expandedSections, `rule_${newRuleIndex}`]);
  };

  const updateRule = (index: number, field: string, value: any) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = [...rulesConfig.rules];
    
    if (field === 'name') {
      updatedRules[index] = {
        ...updatedRules[index],
        name: value
      };
    } else if (field === 'action.type') {
      updatedRules[index] = {
        ...updatedRules[index],
        action: {
          ...updatedRules[index].action,
          type: value
        }
      };
    }
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
  };

  const updateRuleCondition = (ruleIndex: number, conditionIndex: number, field: string, value: any) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = [...rulesConfig.rules];
    const updatedConditions = [...updatedRules[ruleIndex].conditions];
    
    updatedConditions[conditionIndex] = {
      ...updatedConditions[conditionIndex],
      [field]: value
    };
    
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      conditions: updatedConditions
    };
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
  };

  const addRuleCondition = (ruleIndex: number) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = [...rulesConfig.rules];
    
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      conditions: [
        ...updatedRules[ruleIndex].conditions,
        { field: '', operator: '==', value: '' }
      ]
    };
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
  };

  const deleteRuleCondition = (ruleIndex: number, conditionIndex: number) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = [...rulesConfig.rules];
    const updatedConditions = updatedRules[ruleIndex].conditions.filter(
      (_, index) => index !== conditionIndex
    );
    
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      conditions: updatedConditions
    };
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
  };

  const updateRuleActionData = (ruleIndex: number, field: string, value: any) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = [...rulesConfig.rules];
    
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      action: {
        ...updatedRules[ruleIndex].action,
        data: {
          ...updatedRules[ruleIndex].action.data,
          [field]: value
        }
      }
    };
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
  };

  const deleteRule = (index: number) => {
    if (!config || configType !== 'rules') return;
    
    const rulesConfig = config as RulesConfig;
    const updatedRules = rulesConfig.rules.filter((_, i) => i !== index);
    
    const newConfig = {
      ...rulesConfig,
      rules: updatedRules
    };
    
    updateConfig(newConfig);
    
    // Remove the rule from expanded sections
    setExpandedSections(expandedSections.filter(section => section !== `rule_${index}`));
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // --- RENDERERS ---
  const renderPathwayEditor = () => {
    if (configType !== 'pathway' || !config) return null;
    const pathwayConfig = config as PathwayConfig;
    return (
      <>
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
                value={pathwayConfig.pathwayInfo?.id || ''}
                onChange={(e) => handlePathwayInfoChange('id', e.target.value)}
                helperText="Unique identifier for this pathway (e.g., pathway_college_nursing_2025)"
                placeholder="pathway_college_nursing_2025F"
              />
              <TextField
                label="Pathway Name"
                fullWidth
                value={pathwayConfig.pathwayInfo?.name || ''}
                onChange={(e) => handlePathwayInfoChange('name', e.target.value)}
                helperText="Human-readable name for this pathway"
                placeholder="College Nursing Career Pathway"
              />
              <FormControl fullWidth>
                <InputLabel>Pathway Type</InputLabel>
                <Select
                  value={pathwayConfig.pathwayInfo?.type || 'career'}
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
                value={pathwayConfig.pathwayInfo?.issuingOrganizationId || ''}
                onChange={(e) => handlePathwayInfoChange('issuingOrganizationId', e.target.value)}
                helperText="ID of the organization that issues this pathway"
                placeholder="org_dallasCollege"
              />
              <TextField
                label="Version"
                fullWidth
                value={pathwayConfig.pathwayInfo?.version || '1.0.0'}
                onChange={(e) => handlePathwayInfoChange('version', e.target.value)}
                helperText="Version number (semantic versioning recommended)"
                placeholder="1.0.0"
              />
              <TextField
                label="Effective Date"
                fullWidth
                type="date"
                value={pathwayConfig.pathwayInfo?.effectiveDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => handlePathwayInfoChange('effectiveDate', e.target.value)}
                helperText="When this pathway becomes active"
                InputLabelProps={{ shrink: true }}
              />
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pathwayConfig.pathwayInfo?.expirationDate !== null}
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
                {pathwayConfig.pathwayInfo?.expirationDate && (
                  <TextField
                    label="Expiration Date"
                    fullWidth
                    type="date"
                    value={pathwayConfig.pathwayInfo.expirationDate}
                    onChange={(e) => handlePathwayInfoChange('expirationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
              <TextField
                label="Rules File"
                fullWidth
                value={pathwayConfig.pathwayInfo?.rulesFile || ''}
                onChange={(e) => handlePathwayInfoChange('rulesFile', e.target.value)}
                helperText="Associated rules YAML file (optional)"
                placeholder="nursing_rules.yaml"
              />
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
                label={`${Object.keys(pathwayConfig.requirements || {}).length} items`} 
                size="small" 
                variant="outlined" 
              />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Add and manage requirements for this pathway
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={addRequirement}
                  size="small"
                >
                  Add Requirement
                </Button>
              </Box>
              {Object.entries(pathwayConfig.requirements || {}).map(([key, requirement]) => (
                <Accordion
                  key={key}
                  expanded={expandedSections.includes(key)}
                  onChange={() => handleSectionToggle(key)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>
                        {requirement.taskName || key}
                        {requirement.required && (
                          <Chip 
                            label="Required" 
                            size="small" 
                            color="secondary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRequirement(key);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Task Name"
                        fullWidth
                        value={requirement.taskName || ''}
                        onChange={(e) => updateRequirement(key, 'taskName', e.target.value)}
                        placeholder="e.g., task_coursework_completion"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!requirement.required}
                            onChange={(e) => updateRequirement(key, 'required', e.target.checked)}
                          />
                        }
                        label="Required for pathway completion"
                      />
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={requirement.description || ''}
                        onChange={(e) => updateRequirement(key, 'description', e.target.value)}
                        placeholder="Describe this requirement"
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
              {Object.keys(pathwayConfig.requirements || {}).length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No requirements defined. Click "Add Requirement" to create one.
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </>
    );
  };

  const renderRulesEditor = () => {
    if (configType !== 'rules' || !config) return null;
    const rulesConfig = config as RulesConfig;
    return (
      <>
        <Accordion expanded={expandedSections.includes('ruleset')} onChange={() => handleSectionToggle('ruleset')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Ruleset Information
              <Chip label="Required" size="small" color="primary" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                label="Ruleset ID"
                fullWidth
                value={rulesConfig.ruleset || ''}
                onChange={(e) => handleRulesetChange(e.target.value)}
                helperText="Unique identifier for this ruleset (e.g., pathway_dallasCollege_nursingCareer_2025F)"
                placeholder="pathway_dallasCollege_nursingCareer_2025F"
              />
              {rulesConfig.version && (
                <TextField
                  label="Version"
                  fullWidth
                  value={rulesConfig.version || '1.0.0'}
                  onChange={(e) => updateConfig({ ...rulesConfig, version: e.target.value })}
                  helperText="Version number (semantic versioning recommended)"
                  placeholder="1.0.0"
                />
              )}
              {rulesConfig.configFile && (
                <TextField
                  label="Config File"
                  fullWidth
                  value={rulesConfig.configFile || ''}
                  onChange={(e) => updateConfig({ ...rulesConfig, configFile: e.target.value })}
                  helperText="Associated configuration YAML file"
                  placeholder="nursing_config.yaml"
                />
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedSections.includes('rules')} onChange={() => handleSectionToggle('rules')} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Rules
              <Chip label={`${rulesConfig.rules.length} items`} size="small" variant="outlined" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Add and manage rules for this pathway
                </Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addRule} size="small">
                  Add Rule
                </Button>
              </Box>
              {rulesConfig.rules.map((rule, ruleIndex) => (
                <Accordion key={`rule_${ruleIndex}`} expanded={expandedSections.includes(`rule_${ruleIndex}`)} onChange={() => handleSectionToggle(`rule_${ruleIndex}`)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>{rule.name || `Rule ${ruleIndex + 1}`}</Typography>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); deleteRule(ruleIndex); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      <TextField
                        label="Rule Name"
                        fullWidth
                        value={rule.name || ''}
                        onChange={e => updateRule(ruleIndex, 'name', e.target.value)}
                        placeholder="e.g., rule_graduation_on_track"
                        helperText="A unique identifier for this rule"
                      />
                      {/* Conditions */}
                      <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Conditions
                          <Chip label={`${rule.conditions.length} items`} size="small" variant="outlined" />
                        </Typography>
                        {rule.conditions.map((condition, conditionIndex) => (
                          <Paper key={`condition_${ruleIndex}_${conditionIndex}`} elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'grey.50', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                              <IconButton size="small" onClick={() => deleteRuleCondition(ruleIndex, conditionIndex)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
                              <TextField
                                label="Field"
                                fullWidth
                                value={condition.field || ''}
                                onChange={e => updateRuleCondition(ruleIndex, conditionIndex, 'field', e.target.value)}
                                placeholder="e.g., entity, courseCode"
                                size="small"
                              />
                              <FormControl fullWidth size="small">
                                <InputLabel>Operator</InputLabel>
                                <Select
                                  value={condition.operator || '=='}
                                  label="Operator"
                                  onChange={e => updateRuleCondition(ruleIndex, conditionIndex, 'operator', e.target.value)}
                                >
                                  {operatorOptions.map(op => (
                                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <TextField
                                label="Value"
                                fullWidth
                                value={condition.value !== undefined ? (typeof condition.value === 'object' ? JSON.stringify(condition.value) : condition.value) : ''}
                                onChange={e => {
                                  let value = e.target.value;
                                  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
                                    try { value = JSON.parse(value); } catch (e) { }
                                  }
                                  updateRuleCondition(ruleIndex, conditionIndex, 'value', value);
                                }}
                                placeholder="e.g., rdhccmr, Y, 3"
                                size="small"
                              />
                            </Stack>
                          </Paper>
                        ))}
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addRuleCondition(ruleIndex)} size="small" sx={{ mt: 1 }}>
                          Add Condition
                        </Button>
                      </Box>
                      {/* Action */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Action</Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Stack spacing={2}>
                            <FormControl fullWidth>
                              <InputLabel>Action Type</InputLabel>
                              <Select
                                value={rule.action.type || 'assertion'}
                                label="Action Type"
                                onChange={e => updateRule(ruleIndex, 'action.type', e.target.value)}
                              >
                                {actionTypes.map(type => (
                                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="subtitle2" gutterBottom>Action Data</Typography>
                            {Object.entries(rule.action.data).map(([key, value]) => (
                              <TextField
                                key={`action_data_${ruleIndex}_${key}`}
                                label={key}
                                fullWidth
                                value={value !== undefined ? String(value) : ''}
                                onChange={e => updateRuleActionData(ruleIndex, key, e.target.value)}
                                size="small"
                              />
                            ))}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <TextField label="New Key" fullWidth placeholder="e.g., status, taskName" size="small" id={`new_key_${ruleIndex}`} />
                              <TextField label="New Value" fullWidth placeholder="e.g., completed, at_risk" size="small" id={`new_value_${ruleIndex}`} />
                              <Button variant="outlined" size="small" onClick={() => {
                                const keyInput = document.getElementById(`new_key_${ruleIndex}`) as HTMLInputElement;
                                const valueInput = document.getElementById(`new_value_${ruleIndex}`) as HTMLInputElement;
                                if (keyInput && valueInput && keyInput.value) {
                                  updateRuleActionData(ruleIndex, keyInput.value, valueInput.value);
                                  keyInput.value = '';
                                  valueInput.value = '';
                                }
                              }}>Add</Button>
                            </Box>
                          </Stack>
                        </Paper>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
              {rulesConfig.rules.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No rules defined. Click "Add Rule" to create one.
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </>
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
          <Typography variant="h5">{configType === 'rules' ? 'Rules Editor' : 'Pathway Editor'}</Typography>
          <Chip label={configType === 'rules' ? 'Rules YAML' : 'Config YAML'} size="small" color={configType === 'rules' ? 'secondary' : 'primary'} />
          <Tooltip title="This editor helps you create and edit YAML files using forms instead of code">
            <IconButton size="small">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Conditional Rendering Based on Config Type */}
        {configType === 'pathway' ? renderPathwayEditor() : renderRulesEditor()}

        {/* Tips and Help */}
        <Card sx={{ mt: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HelpIcon color="primary" />
              Tips for Users
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
                • The editor adapts to {configType === 'rules' ? 'rules' : 'pathway config'} file structure
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GuidedEditor;
