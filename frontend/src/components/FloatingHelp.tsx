import React, { useState } from 'react';
import {
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Zoom,
} from '@mui/material';
import {
  Help as HelpIcon,
  School as GuideIcon,
  Description as TemplateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface FloatingHelpProps {
  onShowHelp: () => void;
  onShowTemplates: () => void;
}

const FloatingHelp: React.FC<FloatingHelpProps> = ({ onShowHelp, onShowTemplates }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
      }}
    >
      <Tooltip title="Need help? Click for assistance" placement="left">
        <Zoom in={true}>
          <Fab
            color="primary"
            onClick={handleClick}
            sx={{
              '&:hover': {
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <HelpIcon />
          </Fab>
        </Zoom>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          sx: {
            mb: 1,
            boxShadow: 3,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuAction(onShowHelp)}>
          <ListItemIcon>
            <GuideIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Getting Started Guide"
            secondary="Step-by-step help for beginners"
          />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction(onShowTemplates)}>
          <ListItemIcon>
            <TemplateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Use a Template"
            secondary="Start with pre-built examples"
          />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Tips & Shortcuts"
            secondary="Keyboard shortcuts and tips"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FloatingHelp;
