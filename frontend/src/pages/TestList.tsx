import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, 
  Chip, TextField, InputAdornment, CircularProgress, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Tooltip, LinearProgress, Badge,
  Tabs, Tab
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTests, fetchTestDetails, createTest, startTest, stopTest, 
  deleteTest, setCurrentTest, fetchTestResults, Test
} from '../store/slices/testSlice';
import { fetchPrompts } from '../store/slices/promptSlice';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SpeedIcon from '@mui/icons-material/Speed';
import AdvancedTestingFramework from '../components/test/AdvancedTestingFramework';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TestList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { tests, currentTest, loading, error } = useAppSelector((state) => state.test) as { 
    tests: Test[],
    currentTest: Test | null,
    loading: boolean,
    error: string | null
  };
  const { prompts } = useAppSelector((state) => state.prompt);
  
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState<any>({
    name: '',
    description: '',
    prompt_id: '',
    test_config: {
      runs_per_variant: 1,
      variants_count: 2
    },
    variants: [
      { name: 'Variant A', content: [] },
      { name: 'Variant B', content: [] }
    ]
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    if (newValue === 1) {
      navigate('/tests?tab=advanced', { replace: true });
    } else {
      navigate('/tests', { replace: true });
    }
  };

  useEffect(() => {
    dispatch(fetchTests(null));
    dispatch(fetchPrompts());
  }, [dispatch]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam === 'advanced') {
      setTabValue(1);
    }
  }, [location]);

  const handleOpenDialog = () => {
    setNewTest({
      name: '',
      description: '',
      prompt_id: '',
      test_config: {
        runs_per_variant: 1,
        variants_count: 2
      },
      variants: [
        { name: 'Variant A', content: [] },
        { name: 'Variant B', content: [] }
      ]
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDetailsDialog = (testId: number) => {
    dispatch(fetchTestDetails(testId))
      .then(() => {
        setDetailsDialogOpen(true);
      });
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  const handleOpenResultsDialog = (testId: number) => {
    dispatch(fetchTestResults(testId))
      .then(() => {
        setResultsDialogOpen(true);
      });
  };

  const handleCloseResultsDialog = () => {
    setResultsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTest({
      ...newTest,
      [name]: value
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'prompt_id') {
      const selectedPrompt = prompts.find(p => p.id === value);
      
      if (selectedPrompt) {
        setNewTest({
          ...newTest,
          prompt_id: value,
          variants: [
            { name: 'Variant A', content: selectedPrompt.content ? [...selectedPrompt.content] : [] },
            { name: 'Variant B', content: selectedPrompt.content ? [...selectedPrompt.content] : [] }
          ]
        });
      } else {
        setNewTest({
          ...newTest,
          prompt_id: value
        });
      }
    } else {
      setNewTest({
        ...newTest,
        [name as string]: value
      });
    }
  };

  const handleCreateTest = () => {
    if (newTest.name && newTest.prompt_id) {
      dispatch(createTest(newTest))
        .then((action) => {
          if (createTest.fulfilled.match(action)) {
            handleCloseDialog();
          }
        });
    }
  };

  const handleStartTest = (id: number) => {
    dispatch(startTest(id));
  };

  const handleStopTest = (id: number) => {
    dispatch(stopTest(id));
  };

  const handleDeleteTest = (id: number) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      dispatch(deleteTest(id));
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'completed':
        return 'info';
      case 'stopped':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const StandardTestingComponent = () => (
    <>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search tests"
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Test
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTests.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Typography variant="body1">{test.name}</Typography>
                    {test.description && (
                      <Typography variant="caption" color="text.secondary">
                        {test.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {test.variants?.length || 0}
                  </TableCell>
                  <TableCell>
                    {test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Детали">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenDetailsDialog(test.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Результаты">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => handleOpenResultsDialog(test.id)}
                        >
                          <Badge 
                            badgeContent={test.results?.length || 0} 
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.5rem',
                                height: '16px',
                                minWidth: '16px'
                              }
                            }}
                          >
                            <AssessmentIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                      
                      {test.status === 'draft' || test.status === 'stopped' ? (
                        <Tooltip title="Запустить тест">
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => handleStartTest(test.id)}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : test.status === 'running' ? (
                        <Tooltip title="Остановить тест">
                          <IconButton 
                            size="small"
                            color="warning"
                            onClick={() => handleStopTest(test.id)}
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      
                      <Tooltip title="Удалить тест">
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Тесты не найдены.' : 'Нет доступных тестов.'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Создать тест
          </Button>
        </Paper>
      )}
      
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Создание нового A/B теста
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Название теста"
                  name="name"
                  value={newTest.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Базовый промпт</InputLabel>
                  <Select
                    name="prompt_id"
                    value={newTest.prompt_id}
                    label="Базовый промпт"
                    onChange={handleSelectChange as any}
                    required
                  >
                    {prompts.map(prompt => (
                      <MenuItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Описание"
                  name="description"
                  value={newTest.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Конфигурация теста
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Запусков на вариант"
                      name="test_config.runs_per_variant"
                      value={newTest.test_config.runs_per_variant}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        test_config: {
                          ...newTest.test_config,
                          runs_per_variant: parseInt(e.target.value)
                        }
                      })}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Варианты
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Измените базовый промпт, чтобы создать различные варианты для тестирования. Исходные варианты основаны на выбранном промпте.
            </Typography>
            
            {newTest.variants.map((variant: any, index: number) => (
              <Box key={index} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={`Название варианта ${index + 1}`}
                  value={variant.name}
                  onChange={(e) => {
                    const updatedVariants = [...newTest.variants];
                    updatedVariants[index].name = e.target.value;
                    setNewTest({
                      ...newTest,
                      variants: updatedVariants
                    });
                  }}
                  sx={{ mb: 1 }}
                />
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="caption" color="text.secondary">
                    Этот вариант содержит {variant.content.length} элементов промпта, которые будут изменены на следующем шаге.
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleCreateTest}
            variant="contained"
            disabled={!newTest.name || !newTest.prompt_id}
          >
            Создать тест
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Детали теста
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentTest ? (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{currentTest.name}</Typography>
                  {currentTest.description && (
                    <Typography variant="body2" color="text.secondary">
                      {currentTest.description}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip 
                      label={currentTest.status}
                      color={getStatusColor(currentTest.status)}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Конфигурация теста
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Создан</strong></TableCell>
                        <TableCell>{currentTest.created_at ? new Date(currentTest.created_at).toLocaleString() : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Статус</strong></TableCell>
                        <TableCell>{currentTest.status}</TableCell>
                      </TableRow>
                      {currentTest.start_date && (
                        <TableRow>
                          <TableCell><strong>Запущен</strong></TableCell>
                          <TableCell>{new Date(currentTest.start_date).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {currentTest.end_date && (
                        <TableRow>
                          <TableCell><strong>Завершен</strong></TableCell>
                          <TableCell>{new Date(currentTest.end_date).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell><strong>Запусков на вариант</strong></TableCell>
                        <TableCell>{currentTest.test_config?.runs_per_variant || 1}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Варианты ({currentTest?.variants?.length || 0})
                </Typography>
                <Grid container spacing={2}>
                  {currentTest?.variants?.map((variant: any) => (
                    <Grid item xs={12} sm={6} key={variant.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{variant.name}</Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {variant.content?.length || 0} элементов промпта
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Результаты ({currentTest?.results?.length || 0})
                </Typography>
                {currentTest?.results?.length ? (
                  <Box sx={{ mb: 3 }}>
                    <Button 
                      variant="outlined"
                      onClick={() => {
                        handleCloseDetailsDialog();
                        handleOpenResultsDialog(currentTest.id);
                      }}
                      startIcon={<AssessmentIcon />}
                    >
                      Просмотр детальных результатов
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Результаты недоступны. Запустите тест для получения результатов.
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Детали теста недоступны.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Закрыть</Button>
          {currentTest && (
            <>
              {currentTest.status === 'draft' || currentTest.status === 'stopped' ? (
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => {
                    handleStartTest(currentTest.id);
                    handleCloseDetailsDialog();
                  }}
                >
                  Запустить тест
                </Button>
              ) : currentTest.status === 'running' ? (
                <Button 
                  variant="contained" 
                  color="warning"
                  startIcon={<StopIcon />}
                  onClick={() => {
                    handleStopTest(currentTest.id);
                    handleCloseDetailsDialog();
                  }}
                >
                  Остановить тест
                </Button>
              ) : null}
            </>
          )}
        </DialogActions>
      </Dialog>
      
      <Dialog 
        open={resultsDialogOpen} 
        onClose={handleCloseResultsDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Результаты теста
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentTest ? (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {currentTest.name} - Сводка результатов
              </Typography>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Метрики производительности
                </Typography>
                
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Здесь будет реализована подробная визуализация аналитики.
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Всего запусков: {currentTest?.results?.length || 0}
                  </Typography>
                  
                  {currentTest?.variants?.map((variant: any) => {
                    const variantResults = currentTest?.results?.filter((r: any) => r.variant_id === variant.id) || [];
                    const completionRate = (variantResults.length / (currentTest?.test_config?.runs_per_variant || 1)) * 100;
                    
                    return (
                      <Box key={variant.id} sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          {variant.name}: {variantResults.length} запусков ({completionRate.toFixed(0)}% завершено)
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={completionRate} 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
              
              <Typography variant="subtitle1" gutterBottom>
                Детальные результаты
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Вариант</TableCell>
                      <TableCell>Провайдер</TableCell>
                      <TableCell>Модель</TableCell>
                      <TableCell>Токены</TableCell>
                      <TableCell>Создан</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentTest?.results?.slice(0, 10).map((result: any, index: number) => {
                      const variant = currentTest?.variants?.find((v: any) => v.id === result.variant_id);
                      const metrics = result.metrics || {};
                      const usage = metrics.usage || {};
                      const tokens = {
                        input: usage.prompt_tokens || usage.input_tokens || 0,
                        output: usage.completion_tokens || usage.output_tokens || 0
                      };
                      
                      return (
                        <TableRow key={result.id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{variant ? variant.name : 'Неизвестно'}</TableCell>
                          <TableCell>{metrics.provider || 'Н/Д'}</TableCell>
                          <TableCell>{metrics.model || 'Н/Д'}</TableCell>
                          <TableCell>{tokens.input + tokens.output}</TableCell>
                          <TableCell>{result.created_at ? new Date(result.created_at).toLocaleString() : 'Н/Д'}</TableCell>
                        </TableRow>
                      );
                    })}
                    {currentTest?.results && currentTest.results.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            И еще {currentTest.results.length - 10} результатов...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Результаты теста недоступны.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultsDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Testing System</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Test
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="testing tabs">
          <Tab 
            label="Basic A/B Tests" 
            id="test-tab-0" 
            aria-controls="test-tabpanel-0" 
          />
          <Tab 
            label="Advanced Analytics" 
            id="test-tab-1" 
            aria-controls="test-tabpanel-1"
            icon={<SpeedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <StandardTestingComponent />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AdvancedTestingFramework />
      </TabPanel>
    </Box>
  );
};

export default TestList;
