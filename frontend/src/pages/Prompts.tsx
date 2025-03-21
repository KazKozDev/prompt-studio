import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip,
  CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Preview as PreviewIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPrompts, deletePrompt } from '../store/slices/promptSlice';
import GroupIcon from '@mui/icons-material/Group';

const Prompts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prompts, loading, error } = useAppSelector((state) => state.prompt);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Фильтрация промптов по поисковому запросу
  const filteredPrompts = prompts?.filter(prompt => 
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Prompts</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/prompts/new')}
          >
            New Prompt
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom>
          Prompt Development
        </Typography>
        <Typography variant="body1">
          Create, edit, and manage your AI prompts in one place. Build powerful prompts using our advanced editor with 
          multimodal support, test them with different AI models, and collaborate with your team. Use templates to 
          quickly create effective prompts or start from scratch with your own custom design.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredPrompts?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {searchQuery ? 'No prompts found matching your search' : 'No prompts found'}
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
                    <TableCell width={50}>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrompts?.map((prompt, index) => (
                    <TableRow 
                      key={prompt.id} 
                      hover
                      onClick={() => handleEditPrompt(prompt.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{index + 1}</TableCell>
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
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation(); // Предотвращаем всплытие события
                            handleDeletePrompt(prompt.id);
                          }}
                          title="Delete prompt"
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