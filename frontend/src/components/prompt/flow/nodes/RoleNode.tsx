import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface RoleNodeData {
  type: 'role';
  role: string;
  roleType: 'system' | 'user' | 'assistant';
}

const RoleNode: React.FC<NodeProps<RoleNodeData>> = ({ data }) => {
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
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <PersonIcon fontSize="small" />
        <Typography variant="subtitle2">{data.roleType}</Typography>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {data.role}
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

export default memo(RoleNode); 