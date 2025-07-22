import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Tooltip,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Code as CodeIcon,
  Edit as EditIcon,
  Help as HelpIcon,
  AutoFixHigh as WizardIcon,
} from '@mui/icons-material';
import YAMLEditor from './YAMLEditor';
import GuidedEditor from './GuidedEditor';
import { ValidationResult } from '../types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      style={{ 
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          height: '100%',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `editor-tab-${index}`,
    'aria-controls': `editor-tabpanel-${index}`,
  };
}

interface EnhancedYAMLEditorProps {
  content: string;
  onChange: (value: string) => void;
  onValidation?: (result: ValidationResult | null) => void;
  isLoading?: boolean;
  filename?: string;
}

const EnhancedYAMLEditor: React.FC<EnhancedYAMLEditorProps> = ({
  content,
  onChange,
  onValidation,
  isLoading = false,
  filename,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const isYAMLFile = filename?.endsWith('.yaml') || filename?.endsWith('.yml');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Headers */}
      <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ px: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="YAML editor tabs">
            <Tab
              icon={<WizardIcon />}
              label="Guided Editor"
              {...a11yProps(0)}
              disabled={!isYAMLFile}
            />
            <Tab
              icon={<CodeIcon />}
              label="Code Editor"
              {...a11yProps(1)}
            />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isYAMLFile && (
              <Typography variant="caption" color="text.secondary">
                Guided editor available for .yaml files only
              </Typography>
            )}
            <Tooltip title="The Guided Editor helps you edit YAML files using forms, while the Code Editor gives you direct access to the YAML syntax">
              <IconButton size="small">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={activeTab} index={0}>
          {!isYAMLFile ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">
                <AlertTitle>Guided Editor Not Available</AlertTitle>
                The guided editor is only available for YAML files (.yaml or .yml extensions).
                Please use the Code Editor tab for other file types.
              </Alert>
            </Box>
          ) : (
            <GuidedEditor
              content={content}
              onChange={onChange}
              isVisible={activeTab === 0}
            />
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <YAMLEditor
            content={content}
            onChange={onChange}
            onValidation={onValidation}
            isLoading={isLoading}
            filename={filename}
          />
        </TabPanel>
      </Box>

      {/* Help Footer */}
      {activeTab === 0 && isYAMLFile && (
        <Paper sx={{ p: 2, borderRadius: 0, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon fontSize="small" />
            <strong>Tip:</strong> Changes made in the Guided Editor are automatically reflected in the Code Editor and vice versa.
            Switch between tabs to see how your form inputs translate to YAML syntax.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedYAMLEditor;
