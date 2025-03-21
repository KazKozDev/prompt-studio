import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Card, CardContent, 
  IconButton, MenuItem, Select, FormControl, InputLabel, CircularProgress, 
  Alert, Divider, Chip, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails 
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
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import RagSelector from '../components/prompt/RagSelector';

// Интерфейс для элемента модальности
interface ModalityElement {
  type: string;
  [key: string]: any;
}

// Интерфейс для данных промпта
interface PromptData {
  name: string;
  description: string;
  content: ModalityElement[];
  template_id: number | null;
}

// Интерфейс для данных оптимизации
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

// Интерфейс для данных альтернатив
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

// Расширенный интерфейс для Prompt с полем versions
interface ExtendedPrompt extends Prompt {
  versions?: any[];
  version?: any;
}

// Интерфейс для данных провайдера
interface Provider {
  id: string;
  name: string;
  models: string[];
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

// Интерфейс для настроек вида редактора
interface EditorViewSettings {
  mode: 'visual' | 'classic';
}

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
  
  // Fetch providers and models
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_API_BASE_URL;
        const API_URL = BASE_URL?.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
        const response = await axios.get(`${API_URL}/testing/providers`);
        if (response.data && response.data.providers) {
          setProviders(response.data.providers);
          
          // Установим доступные модели для выбранного провайдера
          const selectedProvider = response.data.providers.find((p: Provider) => p.id === testProvider);
          if (selectedProvider) {
            setAvailableModels(selectedProvider.models);
            // Установим модель по умолчанию, если она еще не выбрана
            if (!testModel && selectedProvider.models.length > 0) {
              setTestModel(selectedProvider.models[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
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
        // Добавляем контекст как параметр модели, если он существует
        if (typeof testVariables === 'object') {
          (testVariables as any).context = ragContext;
        }
      }
      
      dispatch(testPrompt({
        promptId: parseInt(id),
        provider: testProvider,
        model: testModel,
        parameters: testVariables  // Используем оригинальное имя параметра
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

  // Обработчик переключения режима редактора
  const handleViewModeChange = () => {
    setEditorView({
      mode: editorView.mode === 'classic' ? 'visual' : 'classic'
    });
  };
  
  // Обработчик перетаскивания элементов (drag-and-drop)
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

  // Компонент визуального редактора промптов
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

  // Функция для оптимизации промпта
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
  
  // Функция для генерации альтернативных версий промпта
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

  // Функция для обработки изменений контекста из RAG
  const handleRagContextChange = (context: string) => {
    setRagContext(context);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Prompt' : 'Create New Prompt'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prompt Name"
              name="name"
              value={promptData.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={promptData.description}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Editor" />
          <Tab label="Test" />
          {id && <Tab label="Versions" />}
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <>
          {/* Отображаем визуальный или классический редактор в зависимости от режима */}
          {editorView.mode === 'visual' ? (
            <VisualPromptEditor />
          ) : (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Prompt Content</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<ViewModuleIcon />}
                  onClick={handleViewModeChange}
                >
                  Switch to Visual Mode
                </Button>
              </Box>
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                {MODALITY_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addModalityElement(type.value)}
                  >
                    Add {type.label}
                  </Button>
                ))}
              </Box>
              
              {promptData.content.map((element, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Modify Type</InputLabel>
                      <Select
                        value={element.type}
                        label="Modify Type"
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
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={element.type === 'text' ? element.content : ''}
                      onChange={(e) => handleModalityChange(index, 'content', e.target.value)}
                      placeholder="Enter content..."
                      size="small"
                      sx={{
                        '& .MuiInputBase-root': {
                          minHeight: '120px',
                          alignItems: 'flex-start'
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeModalityElement(index)}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
                Delete
              </Button>
            )}
          </Box>
        </>
      )}
      
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Prompt
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={testProvider}
                  label="Provider"
                  onChange={(e) => setTestProvider(e.target.value as string)}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>{provider.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={testModel}
                  label="Model"
                  onChange={(e) => setTestModel(e.target.value as string)}
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                fullWidth 
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={runTest}
                disabled={loading || !id}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Test'}
              </Button>
            </Grid>
          </Grid>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Test Parameters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Temperature"
                    value={testParameters.temperature}
                    onChange={(e) => setTestParameters({
                      ...testParameters,
                      temperature: parseFloat(e.target.value)
                    })}
                    inputProps={{
                      min: 0,
                      max: 1,
                      step: 0.1
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Tokens"
                    value={testParameters.max_tokens}
                    onChange={(e) => setTestParameters({
                      ...testParameters,
                      max_tokens: parseInt(e.target.value)
                    })}
                    inputProps={{
                      min: 1,
                      step: 1
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : testResults ? (
              <>
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                  <Typography whiteSpace="pre-wrap">
                    {testResults.response}
                  </Typography>
                </Paper>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Response Metadata</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre>{JSON.stringify(testResults.metadata, null, 2)}</pre>
                  </AccordionDetails>
                </Accordion>
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Run a test to see the LLM response here.
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Добавляем кнопки для оптимизации и генерации альтернатив рядом с кнопкой тестирования */}
          <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ViewModuleIcon />}
              onClick={handleOptimizePrompt}
              disabled={!currentPrompt?.id || optimizing}
            >
              {optimizing ? <CircularProgress size={24} /> : 'Оптимизировать промпт'}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ViewListIcon />}
              onClick={handleGenerateAlternatives}
              disabled={!currentPrompt?.id || generating}
            >
              {generating ? <CircularProgress size={24} /> : 'Создать альтернативы'}
            </Button>
          </Box>
          
          {/* Отображение результатов оптимизации */}
          {optimizationError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {optimizationError}
            </Alert>
          )}
          
          {optimizationResult && (
            <Accordion sx={{ mt: 2, mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Рекомендации по оптимизации</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {optimizationResult.optimization_recommendations}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Время выполнения: {optimizationResult.metrics.execution_time.toFixed(2)}s | 
                    Модель: {optimizationResult.metrics.provider}/{optimizationResult.metrics.model} | 
                    Токены: {optimizationResult.metrics.usage?.total_tokens || 'N/A'}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          
          {/* Отображение результатов генерации альтернатив */}
          {generationError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {generationError}
            </Alert>
          )}
          
          {alternativesResult && (
            <Accordion sx={{ mt: 2, mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Альтернативные версии промпта</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {alternativesResult.generated_alternatives}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Время выполнения: {alternativesResult.metrics.execution_time.toFixed(2)}s | 
                    Модель: {alternativesResult.metrics.provider}/{alternativesResult.metrics.model} | 
                    Токены: {alternativesResult.metrics.usage?.total_tokens || 'N/A'}
                  </Typography>
                </Box>
                {alternativesResult.saved_versions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Сохраненные версии:</Typography>
                    {alternativesResult.saved_versions.map((version) => (
                      <Chip 
                        key={version.version_id}
                        label={`Версия ${version.version_number}: ${version.title}`}
                        color="primary"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}
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
      
      {/* Добавляем RagSelector перед секцией с кнопками управления */}
      <RagSelector onContextChange={handleRagContextChange} />
      
      {/* Секция с кнопками управления */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={savePrompt}
            disabled={promptData.name.trim() === ''}
            sx={{ mr: 1 }}
          >
            {id ? 'Обновить' : 'Создать'}
          </Button>
          
          {/* ... остальные кнопки ... */}
        </Box>
      </Box>
    </Box>
  );
};

export default PromptEditor;
