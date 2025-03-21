import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPrompts } from '../store/slices/promptSlice';
import { fetchTemplates } from '../store/slices/templateSlice';
import { fetchTests } from '../store/slices/testSlice';
import { fetchAggregatedAnalytics } from '../store/slices/analyticsSlice';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';

// Release date for new features (for two-week display period)
const FEATURES_RELEASE_DATE = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
const DISPLAY_PERIOD_DAYS = 14; // Show banner for 14 days

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { prompts } = useAppSelector((state) => state.prompt);
  const { templates } = useAppSelector((state) => state.template);
  const { tests } = useAppSelector((state) => state.test);
  const { aggregatedData, loading, error } = useAppSelector((state) => state.analytics);
  
  // State to track if the announcement banner is dismissed
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  
  useEffect(() => {
    dispatch(fetchPrompts());
    dispatch(fetchTemplates());
    dispatch(fetchTests(null));
    dispatch(fetchAggregatedAnalytics('month'));
    
    // Check if banner should be shown
    const shouldShowBanner = () => {
      // Check if user has previously dismissed the banner
      const dismissedStatus = localStorage.getItem('announcementDismissed');
      if (dismissedStatus === 'true') {
        return false;
      }
      
      // Check if two-week period has expired
      const releaseDate = new Date(FEATURES_RELEASE_DATE);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - releaseDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      // Show banner only if less than DISPLAY_PERIOD_DAYS have passed
      return daysDiff <= DISPLAY_PERIOD_DAYS;
    };
    
    setShowAnnouncement(shouldShowBanner());
  }, [dispatch]);
  
  // Function to handle dismissing the announcement
  const handleDismissAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem('announcementDismissed', 'true');
  };

  // Main statistic cards
  const statCards = [
    {
      title: 'Prompts',
      count: prompts?.length || 0,
      description: 'Create and manage multimodal prompts with text, images, and audio.',
      action: () => navigate('/prompts')
    },
    {
      title: 'Templates',
      count: templates?.length || 0,
      description: 'Manage reusable prompt templates for different use cases.',
      action: () => navigate('/templates')
    },
    {
      title: 'Tests',
      count: tests?.length || 0,
      description: 'Run A/B tests with different prompt variants and analyze results.',
      action: () => navigate('/tests')
    },
    {
      title: 'Analytics',
      count: aggregatedData?.total_runs || 0,
      description: 'View prompt performance metrics and usage statistics.',
      action: () => navigate('/analytics')
    }
  ];

  // New advanced features
  const advancedFeatures = [
    {
      title: 'Advanced Testing',
      icon: <SpeedIcon fontSize="large" color="primary" />,
      description: 'Comprehensive A/B testing with statistical significance analysis and multivariate testing for complex prompt optimization.',
      action: () => navigate('/tests?tab=advanced')
    },
    {
      title: 'Collaboration',
      icon: <GroupIcon fontSize="large" color="primary" />,
      description: 'Team collaboration features with comments, version control, approval workflows, and real-time collaborative editing.',
      action: () => navigate('/collaborative')
    },
    {
      title: 'Learning System',
      icon: <SchoolIcon fontSize="large" color="primary" />,
      description: 'Interactive tutorials, prompt techniques library, challenges, and context-sensitive assistance for learning prompt engineering.',
      action: () => navigate('/learning')
    },
    {
      title: 'Optimization Engine',
      icon: <PsychologyIcon fontSize="large" color="primary" />,
      description: 'AI-assisted prompt optimization with automated analysis, improvement suggestions, and one-click fixes for common issues.',
      action: () => navigate('/optimization')
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {/* Temporary and dismissible announcement banner */}
      {showAnnouncement && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(to right, #3f51b5, #5c6bc0)',
            color: 'white',
            position: 'relative',
          }}
        >
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
            onClick={handleDismissAnnouncement}
            aria-label="Dismiss announcement"
          >
            <CloseIcon />
          </IconButton>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                New advanced features available!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enhance your prompt workflow with A/B testing, team collaboration, 
                learning resources, and automatic optimization.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={() => document.getElementById('advanced-features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn more
              </Button>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box
                component="img"
                src="/illustrations/prompt-engineering.svg"
                alt="Prompt Engineering"
                sx={{ 
                  maxWidth: '100%', 
                  height: 140,
                  filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.5))'
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {statCards.map((card) => (
              <Grid item xs={12} md={6} lg={3} key={card.title}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 220,
                    justifyContent: 'space-between',
                    boxShadow: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {card.count}
                    </Typography>
                    <Typography variant="body2" sx={{ height: 60, overflow: 'hidden' }}>
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                    <Button variant="contained" onClick={card.action}>
                      View {card.title}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <div id="advanced-features">
            <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Advanced Features</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Explore powerful new tools to enhance your prompt engineering workflow
            </Typography>
            
            <Grid container spacing={3}>
              {advancedFeatures.map((feature) => (
                <Grid item xs={12} md={6} key={feature.title}>
                  <Paper
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 220,
                      justifyContent: 'space-between',
                      boxShadow: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {feature.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ height: 80, overflow: 'hidden' }}>
                        {feature.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                      <Button variant="contained" color="secondary" onClick={feature.action}>
                        Explore {feature.title}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
