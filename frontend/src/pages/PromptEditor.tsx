import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Card, CardContent, 
  IconButton, MenuItem, Select, FormControl, InputLabel, CircularProgress, 
  Alert, Divider, Chip, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchPrompts, createPrompt, updatePrompt, deletePrompt, setCurrentPrompt, testPrompt, Prompt 
} from '../store/slices/promptSlice';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import RagSelector from '../components/prompt/RagSelector';

// Interface for modality element
interface ModalityElement {
  type: string;
  [key: string]: any;
}

// Interface for prompt data
interface PromptData {
  name: string;
  description: string;
  content: ModalityElement[];
  template_id: number | null;
}

// Interface for optimization data
interface OptimizationResult {
  prompt_id: number;
  prompt_name: string;
  optimization_recommendations: string;
  metrics: {
    execution_time: number;
    provider: string;
    model: string;
    usage: any;
  };
}

// Interface for alternatives data
interface AlternativesResult {
  prompt_id: number;
  prompt_name: string;
  generated_alternatives: string;
  saved_versions: Array<{
    version_id: number;
    version_number: number;
    title: string;
  }>;
  metrics: {
    execution_time: number;
    provider: string;
    model: string;
    usage: any;
  };
}

// Extended interface for Prompt with versions field
interface ExtendedPrompt extends Prompt {
  versions?: any[];
  version?: any;
}

// Interface for provider data
interface Provider {
  id: string;
  name: string;
  models: string[];
}

// Interface for editor view settings
interface EditorViewSettings {
  mode: 'visual' | 'classic';
}

// Modality types
const MODALITY_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' }
];

// Text roles
const TEXT_ROLES = [
  { value: 'system', label: 'System' },
  { value: 'user', label: 'User' },
  { value: 'assistant', label: 'Assistant' }
];

const PromptEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prompts, loading, error, testResults } = useAppSelector((state) => state.prompt);
  const { currentPrompt } = useAppSelector((state) => state.prompt) as { currentPrompt: ExtendedPrompt | null };
  
  // State for the prompt being edited
  const [promptData, setPromptData] = useState<PromptData>({
    name: '',
    description: '',
    content: [],
    template_id: null
  });
  
  // State for the test panel
  const [testProvider, setTestProvider] = useState('openai');
  const [testModel, setTestModel] = useState('');
  const [testParameters, setTestParameters] = useState({
    temperature: 0.7,
    max_tokens: 500
  });
  
  // State for providers and models
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  const [editorView, setEditorView] = useState<EditorViewSettings>({
    mode: 'classic'
  });
  
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [alternativesResult, setAlternativesResult] = useState<AlternativesResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [ragContext, setRagContext] = useState<string>('');
  const [ragSearchOpen, setRagSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [tokenCounts, setTokenCounts] = useState<{ [key: number]: number }>({});

  // Fetch providers and models
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
        const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
        
        console.log('Fetching providers from:', `${API_URL}/testing/providers`);
        const response = await axios.get(`${API_URL}/testing/providers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.providers) {
          console.log('Providers data:', response.data.providers);
          setProviders(response.data.providers);
          
          // Set available models for the selected provider
          const selectedProvider = response.data.providers.find((p: Provider) => p.id === testProvider);
          if (selectedProvider) {
            setAvailableModels(selectedProvider.models);
            // Set default model if not selected yet
            if (!testModel && selectedProvider.models.length > 0) {
              setTestModel(selectedProvider.models[0]);
            }
          } else if (response.data.providers.length > 0) {
            // If the selected provider is not available, use the first one
            setTestProvider(response.data.providers[0].id);
            setAvailableModels(response.data.providers[0].models);
            if (response.data.providers[0].models.length > 0) {
              setTestModel(response.data.providers[0].models[0]);
            }
          }
        } else {
          console.warn('No providers returned from API');
          // Set default providers if none returned
          const defaultProviders = [
            { id: 'openai', name: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4'] },
            { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] },
            { id: 'mistral', name: 'Mistral', models: ['mistral-medium', 'mistral-large'] }
          ];
          setProviders(defaultProviders);
          
          // Set default model
          setAvailableModels(defaultProviders[0].models);
          setTestModel(defaultProviders[0].models[0]);
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        // Set default providers on error
        const defaultProviders = [
          { id: 'openai', name: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4'] },
          { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] },
          { id: 'mistral', name: 'Mistral', models: ['mistral-medium', 'mistral-large'] }
        ];
        setProviders(defaultProviders);
        
        // Set default model
        setAvailableModels(defaultProviders[0].models);
        setTestModel(defaultProviders[0].models[0]);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Update available models when provider changes
  useEffect(() => {
    const selectedProvider = providers.find(p => p.id === testProvider);
    if (selectedProvider) {
      setAvailableModels(selectedProvider.models);
      // Set default model if not selected yet or if previous model is not available for this provider
      if (!testModel || !selectedProvider.models.includes(testModel)) {
        setTestModel(selectedProvider.models[0] || '');
      }
    }
  }, [testProvider, providers]);

  // Initialize data from currentPrompt or reset for new prompt
  useEffect(() => {
    // If editing an existing prompt
    if (id) {
      const promptToEdit = prompts.find(p => p.id === parseInt(id));
      
      if (promptToEdit) {
        dispatch(setCurrentPrompt(promptToEdit));
        setPromptData({
          name: promptToEdit.name,
          description: promptToEdit.description || '',
          content: promptToEdit.content || [],
          template_id: promptToEdit.template_id || null
        });
      } else {
        // If prompt not found in state, fetch it
        dispatch(fetchPrompts());
      }
    } else {
      // Clear for new prompt
      dispatch(setCurrentPrompt(null));
      setPromptData({
        name: '',
        description: '',
        content: [],
        template_id: null
      });
    }
  }, [id, dispatch, prompts]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPromptData({
      ...promptData,
      [name]: value
    });
  };

  // Function to count tokens
  const countTokens = async (text: string, index: number) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/prompts/count-tokens`,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setTokenCounts(prev => ({
        ...prev,
        [index]: response.data.token_count
      }));
    } catch (error) {
      console.error('Error counting tokens:', error);
    }
  };

  // Handle modality content changes
  const handleModalityChange = (index: number, field: string, value: any) => {
    const updatedContent = [...promptData.content];
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value
    };
    setPromptData({
      ...promptData,
      content: updatedContent
    });

    // Count tokens for text content
    if (field === 'content' && updatedContent[index].type === 'text') {
      countTokens(value, index);
    }
  };

  // Add a new modality element
  const addModalityElement = (type: string) => {
    let newElement;
    
    switch (type) {
      case 'text':
        newElement = { type: 'text', content: '', role: 'user' };
        break;
      case 'image':
        newElement = { type: 'image', url: '', alt_text: '' };
        break;
      case 'audio':
        newElement = { type: 'audio', url: '', duration: 0 };
        break;
      default:
        return;
    }
    
    setPromptData({
      ...promptData,
      content: [...promptData.content, newElement]
    });
  };

  // Remove a modality element
  const removeModalityElement = (index: number) => {
    const updatedContent = [...promptData.content];
    updatedContent.splice(index, 1);
    setPromptData({
      ...promptData,
      content: updatedContent
    });
  };

  // Save the prompt
  const savePrompt = () => {
    if (id) {
      dispatch(updatePrompt({ id: parseInt(id), data: promptData }));
    } else {
      dispatch(createPrompt(promptData))
        .then((action) => {
          if (createPrompt.fulfilled.match(action)) {
            navigate(`/prompts/${action.payload.id}`);
          }
        });
    }
  };

  // Delete the prompt
  const handleDeletePrompt = () => {
    if (id && window.confirm('Are you sure you want to delete this prompt?')) {
      dispatch(deletePrompt(parseInt(id)))
        .then((action) => {
          if (deletePrompt.fulfilled.match(action)) {
            navigate('/prompts');
          }
        });
    }
  };

  // Run test against provider
  const runTest = () => {
    if (id) {
      const testVariables = testParameters;
      if (ragContext) {
        // Add context as a model parameter if it exists
        if (typeof testVariables === 'object') {
          (testVariables as any).context = ragContext;
        }
      }
      
      dispatch(testPrompt({
        promptId: parseInt(id),
        provider: testProvider,
        model: testModel,
        parameters: testVariables  // Use original parameter name
      }));
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Render different modality inputs based on type
  const renderModalityInput = (element: any, index: number) => {
    switch (element.type) {
      case 'text':
        return (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={element.role || 'user'}
                onChange={(e) => handleModalityChange(index, 'role', e.target.value)}
                label="Role"
              >
                {TEXT_ROLES.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={1}
              value={element.content || ''}
              onChange={(e) => handleModalityChange(index, 'content', e.target.value)}
              placeholder="Enter text content..."
              size="small"
            />
          </Box>
        );
        
      case 'image':
        return (
          <Box sx={{ mb: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={element.url || ''}
                  onChange={(e) => handleModalityChange(index, 'url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alt Text"
                  value={element.alt_text || ''}
                  onChange={(e) => handleModalityChange(index, 'alt_text', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'audio':
        return (
          <Box sx={{ mb: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Audio URL"
                  value={element.url || ''}
                  onChange={(e) => handleModalityChange(index, 'url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (seconds)"
                  value={element.duration || 0}
                  onChange={(e) => handleModalityChange(index, 'duration', parseFloat(e.target.value))}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  // Handle editor mode switch
  const handleViewModeChange = () => {
    setEditorView({
      mode: editorView.mode === 'classic' ? 'visual' : 'classic'
    });
  };
  
  // Handle drag and drop of elements
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(promptData.content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPromptData({
      ...promptData,
      content: items
    });
  };

  // Visual prompt editor component
  const VisualPromptEditor = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Visual Prompt Editor</Typography>
          <Button 
            variant="outlined" 
            startIcon={editorView.mode === 'visual' ? <ViewListIcon /> : <ViewModuleIcon />}
            onClick={handleViewModeChange}
          >
            {editorView.mode === 'visual' ? 'Switch to Classic Mode' : 'Switch to Visual Mode'}
          </Button>
        </Box>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<TextFieldsIcon />}
              onClick={() => addModalityElement('text')}
            >
              Add Text
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ImageIcon />}
              onClick={() => addModalityElement('image')}
            >
              Add Image
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<MicIcon />}
              onClick={() => addModalityElement('audio')}
            >
              Add Audio
            </Button>
          </Box>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="prompt-elements">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ width: '100%' }}
                >
                  {promptData.content.map((element, index) => (
                    <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ 
                            mb: 2, 
                            border: '1px solid #e0e0e0',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>
                                <DragIndicatorIcon />
                              </Box>
                              <Chip 
                                label={element.type.toUpperCase()} 
                                color={
                                  element.type === 'text' ? 'primary' : 
                                  element.type === 'image' ? 'success' : 'secondary'
                                }
                                size="small"
                              />
                              <Box sx={{ flexGrow: 1 }} />
                              <IconButton 
                                size="small" 
                                onClick={() => removeModalityElement(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            {renderModalityInput(element, index)}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      </Box>
    );
  };

  // Function to optimize prompt
  const handleOptimizePrompt = async () => {
    if (!currentPrompt?.id) return;
    
    setOptimizing(true);
    setOptimizationError(null);
    setOptimizationResult(null);
    
    try {
      const response = await axios.post<OptimizationResult>(
        `${process.env.REACT_APP_API_BASE_URL}/api/prompts/${currentPrompt.id}/optimize`, 
        {},
        {
          params: {
            provider: testProvider,
            model: testModel,
            focus_areas: ['clarity', 'efficiency', 'cost'],
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setOptimizationResult(response.data);
      
    } catch (error: any) {
      console.error('Error optimizing prompt:', error);
      setOptimizationError(error.response?.data?.detail || 'Failed to optimize prompt');
    } finally {
      setOptimizing(false);
    }
  };
  
  // Function to generate alternative prompt versions
  const handleGenerateAlternatives = async () => {
    if (!currentPrompt?.id) return;
    
    setGenerating(true);
    setGenerationError(null);
    setAlternativesResult(null);
    
    try {
      const response = await axios.post<AlternativesResult>(
        `${process.env.REACT_APP_API_BASE_URL}/api/prompts/${currentPrompt.id}/generate-alternatives`, 
        {},
        {
          params: {
            provider: testProvider,
            model: testModel,
            num_alternatives: 3,
            variation_factors: ['tone', 'structure', 'conciseness'],
            save_as_versions: false
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAlternativesResult(response.data);
      
    } catch (error: any) {
      console.error('Error generating alternatives:', error);
      setGenerationError(error.response?.data?.detail || 'Failed to generate alternatives');
    } finally {
      setGenerating(false);
    }
  };

  // Function to handle RAG context changes
  const handleRagContextChange = (context: string) => {
    setRagContext(context);
  };

  // Function to handle RAG search
  const handleRagSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/rag/search`,
        { query: searchQuery },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setSearching(false);
    }
  };

  // Function to handle selecting search result
  const handleSelectResult = (result: any) => {
    handleRagContextChange(result.content);
    setRagSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Prompt' : 'Create New Prompt'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              label="Prompt Name"
              name="name"
              value={promptData.name}
              onChange={handleInputChange}
              required
              sx={{
                '& .MuiInputBase-root': {
                  alignItems: 'flex-start'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              label="Description"
              name="description"
              value={promptData.description}
              onChange={handleInputChange}
              sx={{
                '& .MuiInputBase-root': {
                  alignItems: 'flex-start'
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Editor" />
          <Tab label="RUN" />
          {id && <Tab label="Versions" />}
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <>
          {editorView.mode === 'visual' ? (
            <VisualPromptEditor />
          ) : (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                {/* Block Management Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Add new prompt block:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {MODALITY_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outlined"
                      startIcon={
                        type.value === 'text' ? <TextFieldsIcon /> :
                        type.value === 'image' ? <ImageIcon /> :
                        <MicIcon />
                      }
                      onClick={() => addModalityElement(type.value)}
                      sx={{ minWidth: '120px' }}
                    >
                      Add {type.label}
                    </Button>
                  ))}
                </Box>
              </Paper>

              {/* Prompt Blocks */}
              {promptData.content.map((element, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 3, 
                    mb: 2, 
                    position: 'relative',
                    borderLeft: '4px solid',
                    borderColor: element.type === 'text' 
                      ? 'primary.main'
                      : element.type === 'image' 
                      ? 'success.main'
                      : 'secondary.main'
                  }}
                >
                  {/* Block Configuration Area */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      Current block configuration:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={element.type}
                          label="Type"
                          onChange={(e) => handleModalityChange(index, 'type', e.target.value)}
                        >
                          {MODALITY_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {element.type === 'text' && (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={element.role || 'user'}
                            onChange={(e) => handleModalityChange(index, 'role', e.target.value)}
                            label="Role"
                          >
                            {TEXT_ROLES.map(role => (
                              <MenuItem key={role.value} value={role.value}>
                                {role.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {element.type === 'text' && (
                        <>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<ViewModuleIcon />}
                            onClick={handleOptimizePrompt}
                            disabled={!currentPrompt?.id || optimizing}
                            sx={{ 
                              height: '40px',
                              minWidth: '150px'
                            }}
                          >
                            {optimizing ? <CircularProgress size={20} /> : 'Optimize Prompt'}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<ViewListIcon />}
                            onClick={handleGenerateAlternatives}
                            disabled={!currentPrompt?.id || generating}
                            sx={{ 
                              height: '40px',
                              minWidth: '150px'
                            }}
                          >
                            {generating ? <CircularProgress size={20} /> : 'Generate Alternatives'}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        startIcon={<SearchIcon />}
                        onClick={() => setRagSearchOpen(true)}
                        sx={{ 
                          height: '40px',
                          minWidth: '150px'
                        }}
                      >
                        RAG Search
                      </Button>
                      
                      <Box sx={{ flexGrow: 1 }} />
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeModalityElement(index)}
                        sx={{ 
                          bgcolor: 'error.lighter',
                          '&:hover': {
                            bgcolor: 'error.light',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Content Editing Area */}
                  {element.type === 'text' ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={element.content || ''}
                      onChange={(e) => handleModalityChange(index, 'content', e.target.value)}
                      placeholder="Enter content..."
                      size="small"
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: '120px',
                          alignItems: 'flex-start',
                          bgcolor: 'background.paper'
                        }
                      }}
                      helperText={
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption">
                            {`${element.content?.length || 0} characters`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            •
                          </Typography>
                          <Typography variant="caption">
                            {`${tokenCounts[index] || 0} tokens`}
                          </Typography>
                        </Box>
                      }
                    />
                  ) : element.type === 'image' ? (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Image URL"
                        value={element.url || ''}
                        onChange={(e) => handleModalityChange(index, 'url', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Alt Text"
                        value={element.alt_text || ''}
                        onChange={(e) => handleModalityChange(index, 'alt_text', e.target.value)}
                      />
                      {element.url && (
                        <Box sx={{ mt: 2, maxWidth: '300px' }}>
                          <img 
                            src={element.url} 
                            alt={element.alt_text || 'Preview'} 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: '4px' 
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Audio URL"
                        value={element.url || ''}
                        onChange={(e) => handleModalityChange(index, 'url', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="Duration (seconds)"
                        value={element.duration || 0}
                        onChange={(e) => handleModalityChange(index, 'duration', parseFloat(e.target.value))}
                      />
                      {element.url && (
                        <Box sx={{ mt: 2 }}>
                          <audio 
                            controls 
                            src={element.url}
                            style={{ width: '100%' }}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  onClick={savePrompt}
                  disabled={loading || !promptData.name}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Prompt'}
                </Button>
                
                {id && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeletePrompt}
                    disabled={loading}
                  >
                    Delete Prompt
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
      
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Prompt
          </Typography>
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <FormControl sx={{ minWidth: 200, mr: 2 }}>
                <InputLabel id="provider-label">Provider</InputLabel>
                <Select
                  labelId="provider-label"
                  value={testProvider}
                  label="Provider"
                  onChange={(e) => setTestProvider(e.target.value)}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 250, mr: 2 }}>
                <InputLabel id="model-label">Model</InputLabel>
                <Select
                  labelId="model-label"
                  value={testModel}
                  label="Model"
                  onChange={(e) => setTestModel(e.target.value)}
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    type="number"
                    value={testParameters.temperature}
                    onChange={(e) => setTestParameters({
                      ...testParameters,
                      temperature: parseFloat(e.target.value)
                    })}
                    inputProps={{
                      step: 0.1,
                      min: 0,
                      max: 1
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Tokens"
                    type="number"
                    value={testParameters.max_tokens}
                    onChange={(e) => setTestParameters({
                      ...testParameters,
                      max_tokens: parseInt(e.target.value)
                    })}
                    inputProps={{
                      step: 1,
                      min: 1
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={runTest}
                disabled={!currentPrompt?.id}
                startIcon={<PlayArrowIcon />}
              >
                Run Test
              </Button>
            </Box>
            
            {testResults && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Results
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      {tabValue === 2 && id && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Version History
          </Typography>
          
          {currentPrompt?.versions?.length ? (
            currentPrompt.versions.map((version, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    Version {version.version_number}
                    {version.version_number === currentPrompt.version && (
                      <Chip label="Current" color="primary" size="small" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(version.created_at).toLocaleString()}
                  </Typography>
                  {version.commit_message && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {version.commit_message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No version history available.
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* RAG Search Dialog */}
      <Dialog 
        open={ragSearchOpen} 
        onClose={() => setRagSearchOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Search Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Search Query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRagSearch();
                }
              }}
            />
          </Box>
          
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : searchResults.length > 0 ? (
            <Box>
              {searchResults.map((result, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => handleSelectResult(result)}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {result.title || 'Document Fragment'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.content.substring(0, 200)}...
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : searchQuery && !searching && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No results found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRagSearchOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRagSearch}
            disabled={!searchQuery.trim() || searching}
          >
            {searching ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptEditor;
