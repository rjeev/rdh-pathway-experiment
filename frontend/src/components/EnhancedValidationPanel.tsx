import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Help as HelpIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';
import { ValidationResult } from '../types/api';

interface ValidationPanelProps {
  validation: ValidationResult | null;
  isValidating: boolean;
  onShowJSON?: () => void;
}

const commonErrorSolutions: Record<string, string> = {
  'mapping values are not allowed here': 'Check for incorrect indentation or missing colons after keys',
  'expected <block end>, but found': 'Check for missing quotes around values or incorrect YAML structure',
  'found undefined alias': 'Check for typos in references or missing definitions',
  'duplicated mapping key': 'Remove duplicate keys in the same section',
  'found character': 'Check for special characters that need to be quoted',
  'expected \':\' not found': 'Add a colon (:) after the key name',
  'mapping key not found': 'Check that all required fields are present',
};

const getErrorSuggestion = (error: string): string => {
  const lowerError = error.toLowerCase();
  for (const [pattern, solution] of Object.entries(commonErrorSolutions)) {
    if (lowerError.includes(pattern.toLowerCase())) {
      return solution;
    }
  }
  return 'Check YAML syntax and structure';
};

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isValidating,
  onShowJSON,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [showTips, setShowTips] = React.useState(false);

  if (isValidating) {
    return (
      <Paper sx={{ p: 2, m: 1, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="info" />
          <Typography variant="body2">Validating YAML...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!validation) {
    return (
      <Paper sx={{ p: 2, m: 1, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="disabled" />
          <Typography variant="body2" color="text.secondary">
            No validation results yet
          </Typography>
        </Box>
      </Paper>
    );
  }

  const hasErrors = validation.errors && validation.errors.length > 0;

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      {/* Main Status */}
      <Paper sx={{ m: 1, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {validation.valid ? (
              <>
                <SuccessIcon color="success" />
                <Typography variant="body1" color="success.main" fontWeight="medium">
                  Valid YAML
                </Typography>
                <Chip label="Ready to save" size="small" color="success" />
              </>
            ) : (
              <>
                <ErrorIcon color="error" />
                <Typography variant="body1" color="error.main" fontWeight="medium">
                  Invalid YAML
                </Typography>
                <Chip 
                  label={`${validation.errors?.length || 0} error${(validation.errors?.length || 0) !== 1 ? 's' : ''}`} 
                  size="small" 
                  color="error" 
                />
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {validation.valid && onShowJSON && (
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={onShowJSON}
                variant="outlined"
              >
                Preview JSON
              </Button>
            )}
            
            {hasErrors && (
              <IconButton
                size="small"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            )}

            <Tooltip title="Show tips for writing better YAML">
              <IconButton
                size="small"
                onClick={() => setShowTips(!showTips)}
                color={showTips ? 'primary' : 'default'}
              >
                <TipIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error Details */}
        <Collapse in={showDetails && hasErrors}>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box>
              <Typography variant="subtitle2" color="error" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon fontSize="small" />
                Errors
              </Typography>
              <List dense>
                {validation.errors!.map((error, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error}
                      secondary={getErrorSuggestion(error)}
                      primaryTypographyProps={{ variant: 'body2', color: 'error' }}
                      secondaryTypographyProps={{ variant: 'caption', style: { fontStyle: 'italic' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Collapse>

        {/* Tips Panel */}
        <Collapse in={showTips}>
          <Divider />
          <Card sx={{ m: 2, bgcolor: 'primary.50' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TipIcon color="primary" fontSize="small" />
                YAML Writing Tips for Users
              </Typography>
              <List dense>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <HelpIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Use consistent indentation (2 spaces recommended)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <HelpIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Put quotes around text values that contain special characters"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <HelpIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Use the Guided Editor tab for form-based editing"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <HelpIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Save frequently and check validation status regularly"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ValidationPanel;
