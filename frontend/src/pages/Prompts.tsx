import React, { useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip,
  CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Preview as PreviewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPrompts, deletePrompt } from '../store/slices/promptSlice';
import GroupIcon from '@mui/icons-material/Group';

const Prompts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prompts, loading, error } = useAppSelector((state) => state.prompt);

  useEffect(() => {
    // Загружаем список промптов при монтировании компонента
    dispatch(fetchPrompts());
  }, [dispatch]);

  const handleCreatePrompt = () => {
    navigate('/prompts/new');
  };

  const handleEditPrompt = (id: number) => {
    navigate(`/prompts/${id}`);
  };

  const handleDeletePrompt = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот промпт?')) {
      dispatch(deletePrompt(id));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Prompts</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => navigate('/collaborative')}
          >
            Collaboration
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/prompts/new')}
          >
            New Prompt
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {prompts?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No prompts found
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreatePrompt}
                sx={{ mt: 2 }}
              >
                Create your first prompt
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prompts?.map((prompt) => (
                    <TableRow key={prompt.id} hover>
                      <TableCell>{prompt.name}</TableCell>
                      <TableCell>{prompt.description || '-'}</TableCell>
                      <TableCell>
                        {prompt.created_at 
                          ? new Date(prompt.created_at).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {prompt.updated_at 
                          ? new Date(prompt.updated_at).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditPrompt(prompt.id)}
                          title="Edit prompt"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation(); // Предотвращаем всплытие события
                            handleDeletePrompt(prompt.id);
                          }}
                          title="Удалить промпт"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default Prompts; 