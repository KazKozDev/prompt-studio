import React, { useState } from 'react';
import { IconButton, Tooltip, Fab } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import WelcomeScreen from './WelcomeScreen';

interface HelpButtonProps {
  variant?: 'fab' | 'icon';
  position?: 'fixed' | 'relative';
}

/**
 * Компонент кнопки помощи, открывающий экран приветствия
 */
const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'fab', 
  position = 'fixed' 
}) => {
  const [showWelcome, setShowWelcome] = useState(false);

  const handleOpen = () => {
    setShowWelcome(true);
  };

  const handleClose = () => {
    setShowWelcome(false);
  };

  if (variant === 'fab') {
    return (
      <>
        <Fab 
          color="primary" 
          size="medium" 
          aria-label="help" 
          onClick={handleOpen}
          sx={{ 
            position: position,
            bottom: 20, 
            right: 20,
            zIndex: 1000,
            opacity: 0.9,
            '&:hover': { 
              opacity: 1,
              transform: 'scale(1.05)' 
            },
            transition: 'all 0.3s'
          }}
        >
          <HelpIcon />
        </Fab>
        
        {showWelcome && <WelcomeScreen open={showWelcome} onClose={handleClose} />}
      </>
    );
  }

  return (
    <>
      <Tooltip title="Help & Tutorial">
        <IconButton
          color="inherit"
          aria-label="help"
          onClick={handleOpen}
          size="large"
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {showWelcome && <WelcomeScreen open={showWelcome} onClose={handleClose} />}
    </>
  );
};

export default HelpButton; 