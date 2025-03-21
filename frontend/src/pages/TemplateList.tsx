import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, 
  Chip, TextField, InputAdornment, CircularProgress, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch,
  IconButton, Tooltip, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTemplates, fetchPublicTemplates, createTemplate, updateTemplate, 
  deleteTemplate, setCurrentTemplate, Template
} from '../store/slices/templateSlice';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { templates, publicTemplates, loading, error } = useAppSelector((state) => state.template);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    structure: {},
    is_public: false
  });

  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchPublicTemplates());
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open dialog for creating a new template
  const handleOpenDialog = () => {
    setNewTemplate({
      name: '',
      description: '',
      structure: {},
      is_public: false
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setNewTemplate({
      ...newTemplate,
      [name]: name === 'is_public' ? checked : value
    });
  };

  // Create or update template
  const handleSaveTemplate = () => {
    if (newTemplate.name) {
      // For simplicity, create a basic structure if none is provided
      const templateToSave = {
        ...newTemplate,
        structure: Object.keys(newTemplate.structure).length === 0 ? {
          text: {
            type: 'text',
            required: true,
            default_value: '',
            placeholder: 'Enter prompt text',
            description: 'Main prompt content'
          }
        } : newTemplate.structure
      };
      
      dispatch(createTemplate(templateToSave));
      handleCloseDialog();
    }
  };

  // Delete template
  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      dispatch(deleteTemplate(id));
    }
  };

  // Filter templates based on search query
  const filteredTemplates = (tabValue === 0 ? templates : publicTemplates)
    .filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Templates</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Template
          </Button>
        </Box>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search Templates"
          variant="outlined"
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
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Templates" />
          <Tab label="Public Templates" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTemplates.length > 0 ? (
        <>
          {tabValue === 1 && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h5" gutterBottom>
                Professional Prompt Templates for Business Applications
              </Typography>
              <Typography variant="body1">
                Below are ready-to-use templates for common business tasks. These templates follow best practices
                for prompt engineering and can be customized for your specific needs. Click "Use Template" to create
                a new prompt based on any template, or copy it to your templates collection.
              </Typography>
            </Paper>
          )}
          
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Chip 
                        icon={template.is_public ? <PublicIcon /> : <LockIcon />}
                        label={template.is_public ? 'Public' : 'Private'}
                        size="small"
                        color={template.is_public ? 'primary' : 'default'}
                      />
                    </Box>
                    
                    {template.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                      Elements: {Object.keys(template.structure).length}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Object.entries(template.structure).map(([key, value]: [string, any]) => (
                        <Chip 
                          key={key}
                          label={key}
                          size="small"
                          variant="outlined"
                          color={
                            value.type === 'text' ? 'primary' : 
                            value.type === 'image' ? 'secondary' : 
                            'default'
                          }
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/prompts/new?template=${template.id}`)}
                    >
                      Use Template
                    </Button>
                    
                    {tabValue === 0 && (
                      <>
                        <Tooltip title="Edit Template">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setNewTemplate({
                                ...template
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Template">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    {tabValue === 1 && (
                      <Tooltip title="Copy Template">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setNewTemplate({
                              name: `Copy of ${template.name}`,
                              description: template.description || '',
                              structure: template.structure,
                              is_public: false
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'No templates match your search.' : 'No templates available.'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Create Template
          </Button>
        </Paper>
      )}
      
      {/* New Template Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {newTemplate.id ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Template Name"
              name="name"
              value={newTemplate.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={newTemplate.description}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  name="is_public"
                  checked={newTemplate.is_public}
                  onChange={handleInputChange}
                />
              }
              label="Make this template public"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTemplate}
            variant="contained"
            disabled={!newTemplate.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateList;
