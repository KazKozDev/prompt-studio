import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

interface VariableNodeData {
  type: 'variable';
  name: string;
}

const VariableNode: React.FC<NodeProps<VariableNodeData>> = ({ data }) => {
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
          bgcolor: 'warning.main',
          color: 'warning.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CodeIcon fontSize="small" />
        <Typography variant="subtitle2">Variable</Typography>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {data.name}
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

export default memo(VariableNode); 