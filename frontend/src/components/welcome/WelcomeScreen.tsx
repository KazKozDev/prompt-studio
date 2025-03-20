import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogContent,
  DialogActions, 
  IconButton, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  Checkbox,
  FormControlLabel,
  Fade,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import AnalyticsIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import TemplateIcon from '@mui/icons-material/ViewQuilt';
import { useNavigate } from 'react-router-dom';

// Структура данных для шагов обучения
interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  actionButton?: {
    text: string;
    action: () => void;
  };
}

interface WelcomeScreenProps {
  open?: boolean;
  onClose?: () => void;
}

// Компонент экрана приветствия
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ open: externalOpen, onClose: externalOnClose }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [doNotShow, setDoNotShow] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Определяем, использовать внешнее или внутреннее состояние
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  // Проверяем, показывать ли экран приветствия при загрузке
  useEffect(() => {
    // Если компонент контролируется извне, пропускаем автоматическое открытие
    if (externalOpen !== undefined) return;

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
    if (!hasSeenWelcome) {
      setInternalOpen(true);
    }
  }, [externalOpen]);

  // Обработчик закрытия
  const handleClose = () => {
    if (doNotShow) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  // Переход к следующему шагу
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Переход к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Пропуск всего обучения
  const handleSkip = () => {
    if (doNotShow) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    handleClose();
  };

  // Переход к созданию промпта
  const handleCreatePrompt = () => {
    handleClose();
    navigate('/prompts/new');
  };

  // Переход к шаблонам
  const handleExploreTemplates = () => {
    handleClose();
    navigate('/templates');
  };

  // Переход к таксономии
  const handleExploreTaxonomy = () => {
    handleClose();
    navigate('/taxonomy');
  };

  // Определение шагов обучения
  const steps: TutorialStep[] = [
    {
      title: 'Welcome to Multimodal Prompt Studio!',
      description: 'Your tool for creating, testing, and optimizing prompts for artificial intelligence. This step-by-step guide will help you get started with the application.'
    },
    {
      title: 'Navigating the Application',
      description: 'Navigation is simple. Use the sidebar menu to access the main functions: Dashboard, Prompts, Templates, Tests, Documents, Analytics, and Prompt Techniques Taxonomy.'
    },
    {
      title: 'Creating Your First Prompt',
      description: 'Start by creating a new prompt. Click the "NEW PROMPT" button in the top right corner to open the editor.',
      actionButton: {
        text: 'Create My First Prompt',
        action: handleCreatePrompt
      }
    },
    {
      title: 'Using the Multimodal Editor',
      description: 'Our editor supports combining text, images, and audio to create multimodal prompts. Use the corresponding buttons to add different types of content.'
    },
    {
      title: 'Testing and Analysis',
      description: 'After creating your prompt, test it and analyze the results for optimization. You can create test sets and track the effectiveness of your prompts.'
    },
    {
      title: 'Using Templates and Taxonomy',
      description: 'Use ready-made templates and the scientific taxonomy of prompting techniques to speed up your work and improve the quality of your prompts.'
    },
    {
      title: 'Congratulations!',
      description: 'You are ready to create effective prompts in Multimodal Prompt Studio. Choose what you want to do next:',
      actionButton: {
        text: 'Create First Prompt',
        action: handleCreatePrompt
      }
    }
  ];

  return (
    <Dialog 
      open={isOpen} 
      maxWidth="md" 
      fullWidth 
      onClose={handleClose}
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'visible'
        }
      }}
    >
      {/* Заголовок с фирменным фиолетовым цветом */}
      <Box 
        sx={{ 
          bgcolor: '#5E35B1', 
          p: 2, 
          color: 'white',
          position: 'relative',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h5">{steps[activeStep].title}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, minHeight: '400px' }}>
        {/* Индикатор шагов */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((_, index) => (
            <Step key={index}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Контент текущего шага */}
        <Fade in={true} key={activeStep}>
          <Box>
            {activeStep === 0 && (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    mb: 4, 
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' },
                    }
                  }}
                >
                  <Typography variant="h4" color="primary" gutterBottom>
                    Multimodal Prompt Studio
                  </Typography>
                  <Box
                    component="img"
                    src="/logo192.png"
                    alt="Logo"
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mb: 2,
                      borderRadius: '50%',
                      boxShadow: '0 4px 20px rgba(94, 53, 177, 0.3)',
                    }}
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      width: 120,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <TextFieldsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Prompt Creation</Typography>
                  </Paper>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      width: 120,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <TemplateIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Templates</Typography>
                  </Paper>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      width: 120,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CategoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Technique Taxonomy</Typography>
                  </Paper>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 3 }}>
                  {[
                    { icon: <DashboardIcon />, text: 'Dashboard' },
                    { icon: <TextFieldsIcon />, text: 'Prompts' },
                    { icon: <TemplateIcon />, text: 'Templates' },
                    { icon: <AnalyticsIcon />, text: 'Analytics' },
                    { icon: <CategoryIcon />, text: 'Taxonomy' }
                  ].map((item, index) => (
                    <Paper 
                      key={index} 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        width: 200,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        animation: `fadeIn 0.5s ${index * 0.1}s both`,
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateX(-10px)' },
                          to: { opacity: 1, transform: 'translateX(0)' },
                        }
                      }}
                    >
                      <Box sx={{ color: 'primary.main' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2">{item.text}</Typography>
                    </Paper>
                  ))}
                </Box>
                <Box sx={{ 
                  mt: 4, 
                  p: 2, 
                  border: '1px dashed #5E35B1',
                  borderRadius: 2,
                  bgcolor: 'rgba(94, 53, 177, 0.05)'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tip:</strong> The sidebar navigation is always available, even when you're deep into working on a prompt. Use it for quick access to all application features.
                  </Typography>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 3, 
                  mb: 4,
                  position: 'relative',
                  p: 3
                }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    size="large"
                    sx={{ 
                      boxShadow: '0 0 20px rgba(94, 53, 177, 0.5)',
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(94, 53, 177, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(94, 53, 177, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(94, 53, 177, 0)' },
                      }
                    }}
                  >
                    NEW PROMPT
                  </Button>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: '25%',
                      animation: 'bounce 1s infinite',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                      }
                    }}
                  >
                    <ArrowForwardIcon 
                      sx={{ 
                        transform: 'rotate(-45deg)', 
                        color: 'primary.main',
                        fontSize: 40
                      }} 
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                  {steps[activeStep].actionButton && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={() => {
                        const actionButton = steps[activeStep].actionButton;
                        if (actionButton && actionButton.action) {
                          actionButton.action();
                        }
                      }}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {steps[activeStep].actionButton?.text || "Continue"}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {activeStep === 3 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    mt: 3, 
                    mb: 4, 
                    border: '1px solid #e0e0e0',
                    bgcolor: '#f9f9f9'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Multimodal Editor
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    my: 3
                  }}>
                    {[
                      { icon: <TextFieldsIcon />, text: 'Add Text', color: '#3f51b5' },
                      { icon: <ImageIcon />, text: 'Add Image', color: '#4caf50' },
                      { icon: <AudiotrackIcon />, text: 'Add Audio', color: '#ff9800' }
                    ].map((item, index) => (
                      <Paper 
                        key={index} 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          gap: 1,
                          flex: 1,
                          borderTop: `3px solid ${item.color}`,
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      >
                        <Box sx={{ color: item.color, fontSize: 40 }}>
                          {item.icon}
                        </Box>
                        <Typography variant="body2">{item.text}</Typography>
                      </Paper>
                    ))}
                  </Box>
                  <Box 
                    sx={{ 
                      height: 100, 
                      border: '1px dashed #aaa', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      Here you can combine different types of content to create powerful multimodal prompts
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            {activeStep === 4 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mt: 3, 
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: 250,
                      maxWidth: 350
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                      Testing
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Test your prompt with various inputs to evaluate performance
                    </Typography>
                    <Box 
                      sx={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1, 
                        p: 1.5,
                        bgcolor: '#f5f5f5',
                        mt: 2,
                        minHeight: 100
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1,
                        flexWrap: 'wrap',
                        gap: 1
                      }}>
                        {['Test 1', 'Test 2', 'Test 3'].map(test => (
                          <Paper 
                            key={test} 
                            sx={{ 
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              bgcolor: 'white'
                            }}
                          >
                            {test}
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                  
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: 250,
                      maxWidth: 350
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                      Analysis
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Get detailed analytics on your prompt performance
                    </Typography>
                    <Box 
                      sx={{ 
                        height: 100, 
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Box sx={{ 
                        width: '80%', 
                        height: 50, 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between'
                      }}>
                        {[0.6, 0.85, 0.7, 0.9, 0.75].map((height, index) => (
                          <Box 
                            key={index}
                            sx={{
                              width: 15,
                              height: `${height * 100}%`,
                              bgcolor: 'primary.main',
                              opacity: 0.7,
                              borderRadius: '2px 2px 0 0'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

            {activeStep === 5 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mt: 3, 
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
                }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>
                      Prompt Templates
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      Use ready-made templates for a quick start
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      onClick={handleExploreTemplates}
                    >
                      Explore Templates
                    </Button>
                  </Paper>
                  
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      flex: 1, 
                      minWidth: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>
                      Technique Taxonomy
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      Learn scientific prompting techniques
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      onClick={handleExploreTaxonomy}
                    >
                      Open Taxonomy
                    </Button>
                  </Paper>
                </Box>
              </Box>
            )}

            {activeStep === 6 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'success.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'scaleUp 0.5s ease-out',
                      '@keyframes scaleUp': {
                        from: { transform: 'scale(0)' },
                        to: { transform: 'scale(1)' },
                      }
                    }}
                  >
                    <Box component="span" sx={{ fontSize: 40, color: 'white' }}>
                      ✓
                    </Box>
                  </Box>
                </Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  Congratulations!
                </Typography>
                <Typography variant="body1" paragraph>
                  {steps[activeStep].description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  mt: 4, 
                  mx: 'auto',
                  maxWidth: 400
                }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    onClick={handleCreatePrompt}
                  >
                    Create First Prompt
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleExploreTemplates}
                  >
                    Explore Templates
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleExploreTaxonomy}
                  >
                    Learn Prompting Techniques
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 2, 
          justifyContent: 'space-between',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Box>
          {activeStep !== steps.length - 1 && (
            <Button onClick={handleSkip} color="inherit">
              Skip Tutorial
            </Button>
          )}
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={doNotShow}
                onChange={(e) => setDoNotShow(e.target.checked)}
                color="primary"
              />
            }
            label="Don't show again"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleClose}
              variant="contained"
              color="primary"
            >
              Finish
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              variant="contained" 
              color="primary"
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeScreen; 