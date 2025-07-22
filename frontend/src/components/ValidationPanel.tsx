import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Chip, Button, Collapse } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { ValidationResult } from '../types/api';

interface ValidationPanelProps {
  validation: ValidationResult | null;
  isValidating: boolean;
  onShowJSON: () => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isValidating,
  onShowJSON,
}) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getStatusColor = (): 'success' | 'error' | 'warning' => {
    if (!validation) return 'warning';
    return validation.valid ? 'success' : 'error';
  };

  const getStatusIcon = () => {
    if (!validation) return <WarningIcon />;
    return validation.valid ? <SuccessIcon /> : <ErrorIcon />;
  };

  const getStatusText = (): string => {
    if (isValidating) return 'Validating...';
    if (!validation) return 'No validation performed';
    return validation.valid ? 'Valid YAML' : `${validation.errors.length} error(s) found`;
  };

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'grey.100',
          },
        }}
        onClick={toggleExpanded}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="subtitle2" fontWeight="bold">
            Validation Results
          </Typography>
          <Chip
            size="small"
            label={getStatusText()}
            color={getStatusColor()}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {validation?.valid && validation.json_preview && (
            <Button
              size="small"
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                onShowJSON();
              }}
            >
              View JSON
            </Button>
          )}
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          {isValidating ? (
            <Alert severity="info">
              Validating YAML syntax and structure...
            </Alert>
          ) : !validation ? (
            <Alert severity="warning">
              Start editing to see validation results
            </Alert>
          ) : validation.valid ? (
            <Alert severity="success">
              <Box>
                <Typography variant="body2" gutterBottom>
                  ✅ YAML is valid and well-formed
                </Typography>
                {validation.parsed_data && (
                  <Typography variant="caption" color="text.secondary">
                    Successfully parsed {Object.keys(validation.parsed_data).length} top-level keys
                  </Typography>
                )}
              </Box>
            </Alert>
          ) : (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  ❌ YAML validation failed with {validation.errors.length} error(s):
                </Typography>
              </Alert>
              
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {validation.errors.map((error, index) => (
                  <Alert 
                    key={index}
                    severity="error"
                    sx={{ 
                      mb: 1,
                      '& .MuiAlert-message': {
                        width: '100%',
                      },
                    }}
                  >
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {error}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ValidationPanel;
