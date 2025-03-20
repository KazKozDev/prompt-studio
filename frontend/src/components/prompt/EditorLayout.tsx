import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Divider, 
  IconButton, 
  Tooltip, 
  Typography,
  Slider,
  CircularProgress,
  Badge,
  Chip
} from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import SettingsIcon from '@mui/icons-material/Settings';
import TokenIcon from '@mui/icons-material/Token';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Token counter component that shows tokens used
const TokenCounter: React.FC<{ content: string }> = ({ content }) => {
  // Simple token counting logic (approximate)
  const countTokens = (text: string): number => {
    if (!text) return 0;
    // Simple approximation - in a real app, use a proper tokenizer
    return Math.ceil(text.split(/\s+/).length * 1.3);
  };
  
  const tokens = countTokens(content);
  const maxTokens = 4096; // Example max token limit
  const percentage = Math.min((tokens / maxTokens) * 100, 100);
  
  // Determine color based on usage
  const getColor = () => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'error';
  };
  
  return (
    <Tooltip title={`${tokens} / ${maxTokens} tokens used`}>
      <Badge 
        badgeContent={tokens} 
        color={getColor() as 'success' | 'warning' | 'error'} 
        max={maxTokens}
        sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
      >
        <TokenIcon color="action" fontSize="small" />
      </Badge>
    </Tooltip>
  );
};

interface EditorLayoutProps {
  editor: React.ReactNode;
  preview?: React.ReactNode;
  isLoading?: boolean;
  promptContent?: string;
  onSplitChange?: (ratio: number) => void;
}

/**
 * Split-screen layout component for the prompt editor
 */
const EditorLayout: React.FC<EditorLayoutProps> = ({
  editor,
  preview,
  isLoading = false,
  promptContent = '',
  onSplitChange
}) => {
  // State for the split ratio (percentage for left panel)
  const [splitRatio, setSplitRatio] = useState<number>(50);
  // State to track if preview is visible
  const [showPreview, setShowPreview] = useState<boolean>(true);
  // State to track active role (user/assistant) for styling
  const [activeRole, setActiveRole] = useState<'user' | 'assistant'>('user');
  
  // Ref for the drag handle
  const dragHandleRef = useRef<HTMLDivElement>(null);
  // Ref for container width
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle resize functionality
  useEffect(() => {
    const dragHandle = dragHandleRef.current;
    const container = containerRef.current;
    
    if (!dragHandle || !container) return;
    
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = container.getBoundingClientRect().width * (splitRatio / 100);
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const containerWidth = container.getBoundingClientRect().width;
      const newWidth = startWidth + (e.clientX - startX);
      const newRatio = Math.max(20, Math.min(80, (newWidth / containerWidth) * 100));
      
      setSplitRatio(newRatio);
      
      if (onSplitChange) {
        onSplitChange(newRatio);
      }
    };
    
    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    dragHandle.addEventListener('mousedown', onMouseDown);
    
    return () => {
      dragHandle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [splitRatio, onSplitChange]);
  
  // Toggle preview panel
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
    
    // When toggling preview off, set split to 100% for editor
    // When toggling preview on, set split to previous or default value
    setSplitRatio(showPreview ? 100 : 50);
    
    if (onSplitChange) {
      onSplitChange(showPreview ? 100 : 50);
    }
  };
  
  // Calculate grid template columns based on preview visibility and split ratio
  const gridTemplateColumns = showPreview
    ? `${splitRatio}% auto`
    : '100% 0';
  
  // Toggle between user and assistant roles
  const toggleRole = () => {
    setActiveRole(activeRole === 'user' ? 'assistant' : 'user');
  };
  
  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'grid',
        gridTemplateColumns,
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: showPreview ? 'none' : 'grid-template-columns 0.3s ease',
      }}
    >
      {/* Editor Panel */}
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          overflow: 'auto',
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Editor Toolbar */}
        <Box sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <Tooltip title={activeRole === 'user' ? 'User prompt' : 'Assistant response'}>
            <Chip
              icon={activeRole === 'user' ? <PersonIcon /> : <SmartToyIcon />}
              label={activeRole === 'user' ? 'User' : 'Assistant'}
              color={activeRole === 'user' ? 'primary' : 'secondary'}
              size="small"
              onClick={toggleRole}
              sx={{ mr: 1 }}
            />
          </Tooltip>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <TokenCounter content={promptContent} />
          
          <Tooltip title="AI Suggestions">
            <IconButton size="small" sx={{ ml: 1 }}>
              <AutoFixHighIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editor Settings">
            <IconButton size="small" sx={{ ml: 1 }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Editor Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {editor}
        </Box>
      </Paper>
      
      {/* Drag Handle */}
      <Box
        ref={dragHandleRef}
        sx={{
          position: 'absolute',
          left: `calc(${splitRatio}% - 8px)`,
          top: 0,
          bottom: 0,
          width: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'col-resize',
          transition: showPreview ? 'none' : 'left 0.3s ease',
          opacity: showPreview ? 1 : 0,
          pointerEvents: showPreview ? 'auto' : 'none',
        }}
      >
        <Box
          sx={{
            height: '50px',
            width: '4px',
            backgroundColor: 'action.hover',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: 'primary.main',
            },
          }}
        />
      </Box>
      
      {/* Preview Panel */}
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          overflow: 'auto',
          borderRadius: 0,
          transition: 'all 0.3s ease',
          visibility: showPreview ? 'visible' : 'hidden',
          opacity: showPreview ? 1 : 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Preview Toolbar */}
        <Box sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper' 
        }}>
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            Preview
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title={showPreview ? "Hide Preview" : "Show Preview"}>
            <IconButton size="small" onClick={handleTogglePreview}>
              {showPreview ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Preview Content */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isLoading ? 'center' : 'flex-start',
            alignItems: isLoading ? 'center' : 'stretch',
            p: 2
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Generating response...
              </Typography>
            </Box>
          ) : preview}
        </Box>
      </Paper>
    </Box>
  );
};

export default EditorLayout; 