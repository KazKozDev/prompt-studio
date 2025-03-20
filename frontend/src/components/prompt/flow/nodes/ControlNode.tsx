import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface ControlNodeData {
  type: 'control';
  controlType: string;
  parameters: string;
}

const ControlNode: React.FC<NodeProps<ControlNodeData>> = ({ data }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        minWidth: 200,
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: 'error.main',
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <SettingsIcon fontSize="small" />
        <Typography variant="subtitle2">{data.controlType}</Typography>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {data.parameters}
        </Typography>
      </Box>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export default memo(ControlNode); 