import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

interface ContentNodeData {
  type: 'content';
  content: string;
  contentType: 'user' | 'assistant';
}

const ContentNode: React.FC<NodeProps<ContentNodeData>> = ({ data }) => {
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
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ChatIcon fontSize="small" />
        <Typography variant="subtitle2">{data.contentType}</Typography>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {data.content}
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

export default memo(ContentNode); 