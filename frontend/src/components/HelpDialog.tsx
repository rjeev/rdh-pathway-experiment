import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as StartIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  School as ExampleIcon,
  Help as TipIcon,
} from '@mui/icons-material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    label: 'Choose Your Starting Point',
    description: 'Select how you want to begin',
    content: (
      <Box>
        <Typography variant="body2" paragraph>
          You have two options to get started:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <ExampleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Use a Template"
              secondary="Start with pre-built configurations for common scenarios like nursing pathways, admissions, or certifications"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <EditIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Create from Scratch"
              secondary="Start with a blank file and build your own configuration"
            />
          </ListItem>
        </List>
      </Box>
    ),
  },
  {
    label: 'Choose Your Editing Method',
    description: 'Pick the editor that works best for you',
    content: (
      <Box>
        <Typography variant="body2" paragraph>
          We provide two ways to edit your YAML files:
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Recommended for non-technical users:</strong> Start with the Guided Editor
          </Typography>
        </Alert>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Guided" color="primary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Guided Editor"
              secondary="Form-based interface with dropdowns, text fields, and helpful hints. No coding required!"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Code" color="secondary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Code Editor"
              secondary="Direct YAML editing with syntax highlighting and validation. For advanced users."
            />
          </ListItem>
        </List>
      </Box>
    ),
  },
  {
    label: 'Fill in Your Information',
    description: 'Complete the required fields',
    content: (
      <Box>
        <Typography variant="body2" paragraph>
          In the Guided Editor, you'll see forms organized into sections:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Pathway Information"
              secondary="Basic details like name, type, and effective dates"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Requirements"
              secondary="Define what students need to complete (courses, certifications, etc.)"
            />
          </ListItem>
        </List>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Required fields are marked with colored chips. Fill these out first!
          </Typography>
        </Alert>
      </Box>
    ),
  },
  {
    label: 'Validate and Save',
    description: 'Check your work and save the file',
    content: (
      <Box>
        <Typography variant="body2" paragraph>
          Before saving, make sure your file is valid:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Check the validation panel"
              secondary="Look for green checkmarks and 'Valid YAML' status"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SaveIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Save your work"
              secondary="Use Ctrl+S (Cmd+S on Mac) or click the Save button"
            />
          </ListItem>
        </List>
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Success!</strong> Your YAML configuration is ready to use.
          </Typography>
        </Alert>
      </Box>
    ),
  },
];

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Getting Started Guide</Typography>
        <Button onClick={onClose} size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This guide will help you create and edit YAML configuration files for nursing pathways, 
            even if you're not familiar with technical file formats.
          </Typography>
        </Alert>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={index === steps.length - 1}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              You're all set!
            </Typography>
            <Typography variant="body2" paragraph>
              You now know the basics of using the YAML editor. Remember:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TipIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Use templates to get started quickly" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TipIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Try the Guided Editor first if you're new to YAML" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TipIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Always check the validation panel before saving" />
              </ListItem>
            </List>
            <Button onClick={handleReset} sx={{ mt: 2, mr: 1 }}>
              Review Guide
            </Button>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {activeStep < steps.length && (
          <Button onClick={() => setActiveStep(steps.length)} variant="text">
            Skip to End
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
