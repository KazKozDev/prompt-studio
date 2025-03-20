import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from '@mui/icons-material/Info';

// Types for prompt components and categories
interface PromptComponent {
  id: string;
  name: string;
  description: string;
  template: string;
  tags: string[];
}

interface PromptCategory {
  id: string;
  name: string;
  components: PromptComponent[];
}

// Sample components data
const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'basic',
    name: 'Basic Components',
    components: [
      {
        id: 'system-role',
        name: 'System Role',
        description: 'Define the system role and context for the AI assistant',
        template: '#system: You are a helpful assistant that specializes in {{specialty}}. {{context}}',
        tags: ['role', 'system']
      },
      {
        id: 'user-query',
        name: 'User Query',
        description: 'Standard user query template',
        template: '#user: {{query}}',
        tags: ['query', 'user']
      },
      {
        id: 'assistant-response',
        name: 'Assistant Response',
        description: 'Standard assistant response template',
        template: '#assistant: {{response}}',
        tags: ['response', 'assistant']
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Techniques',
    components: [
      {
        id: 'cot',
        name: 'Chain of Thought',
        description: 'Prompt that encourages step-by-step reasoning',
        template: "#system: You are a helpful assistant that thinks through problems step by step.\\n\\n#user: {{problem}}\\n\\n#assistant: I\\'ll think about this step-by-step:\\n1. {{step_1}}\\n2. {{step_2}}\\n3. {{step_3}}\\n\\nTherefore, the answer is {{conclusion}}.",
        tags: ['reasoning', 'problem-solving']
      },
      {
        id: 'few-shot',
        name: 'Few-Shot Learning',
        description: 'Provide examples to guide the model',
        template: "#system: You will be given examples of inputs and their corresponding outputs. Learn from these examples and apply the same pattern to new inputs.\\n\\nExample 1:\\nInput: {{example_input_1}}\\nOutput: {{example_output_1}}\\n\\nExample 2:\\nInput: {{example_input_2}}\\nOutput: {{example_output_2}}\\n\\n#user: Input: {{new_input}}",
        tags: ['examples', 'learning']
      },
      {
        id: 'self-critique',
        name: 'Self-Critique',
        description: 'Model evaluates and improves its own response',
        template: "#system: You will generate a response, then critique that response for accuracy and completeness, and finally provide an improved response.\\n\\n#user: {{query}}\\n\\n#assistant: Initial response: {{initial_response}}\\n\\nCritique: {{critique}}\\n\\nImproved response: {{improved_response}}",
        tags: ['critique', 'improvement']
      }
    ]
  },
  {
    id: 'specialized',
    name: 'Specialized Templates',
    components: [
      {
        id: 'code-generation',
        name: 'Code Generation',
        description: 'Generate code based on requirements',
        template: "#system: You are an expert programmer with deep knowledge of {{language}}. Write clean, efficient, and well-documented code.\\n\\n#user: I need a {{language}} program that {{requirements}}. Please include comments and error handling.\\n\\n#assistant: Here\\'s a {{language}} implementation that meets your requirements:\\n\\n```{{language}}\\n{{code}}\\n```\\n\\nThis code works by {{explanation}}. I\\'ve included error handling for {{error_cases}}.",
        tags: ['code', 'programming']
      },
      {
        id: 'creative-writing',
        name: 'Creative Writing',
        description: 'Generate creative content in a specific style',
        template: "#system: You are a creative writer skilled in {{genre}} writing. Your tone is {{tone}} and your style is {{style}}.\\n\\n#user: Write a {{content_type}} about {{topic}}.\\n\\n#assistant: {{creative_content}}",
        tags: ['creative', 'writing']
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        description: 'Analyze and interpret data',
        template: "#system: You are a data analyst skilled in interpreting {{data_type}} data and extracting meaningful insights.\\n\\n#user: Here is the data:\\n{{data}}\\n\\nWhat insights can you extract about {{analysis_focus}}?\\n\\n#assistant: Based on the data provided, here are my key findings:\\n\\n1. {{finding_1}}\\n2. {{finding_2}}\\n3. {{finding_3}}\\n\\nIn conclusion, {{conclusion}}. For further analysis, I would recommend exploring {{recommendation}}.",
        tags: ['data', 'analysis']
      }
    ]
  }
];

interface ComponentLibraryProps {
  onInsertComponent: (template: string) => void;
}

/**
 * Component library for reusable prompt components
 */
const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ 
  onInsertComponent 
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<PromptComponent | null>(null);

  // Handle component selection
  const handleSelectComponent = (component: PromptComponent) => {
    onInsertComponent(component.template);
  };

  // Open component details
  const handleOpenDetails = (component: PromptComponent, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedComponent(component);
    setDetailsOpen(true);
  };

  // Close component details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  return (
    <Accordion elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&.Mui-expanded': {
            minHeight: 48,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <LibraryBooksIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            Component Library
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip 
            label={`${PROMPT_CATEGORIES.reduce((acc, cat) => acc + cat.components.length, 0)} Components`} 
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          />
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 0, maxHeight: '300px', overflow: 'auto' }}>
        {PROMPT_CATEGORIES.map((category) => (
          <Box key={category.id} sx={{ mb: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                p: 1, 
                backgroundColor: 'background.default',
                fontWeight: 'bold'
              }}
            >
              {category.name}
            </Typography>
            
            <List disablePadding dense>
              {category.components.map((component) => (
                <ListItem 
                  key={component.id} 
                  disablePadding
                  secondaryAction={
                    <Tooltip title="View Details">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => handleOpenDetails(component, e)}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton onClick={() => handleSelectComponent(component)}>
                    <ListItemText 
                      primary={component.name} 
                      secondary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {component.tags.map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      }
                    />
                    <Tooltip title="Insert Component">
                      <IconButton size="small">
                        <AddCircleIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            <Divider />
          </Box>
        ))}
      </AccordionDetails>

      {/* Component Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedComponent && (
          <>
            <DialogTitle>
              {selectedComponent.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedComponent.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedComponent.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Template
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'background.default',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {selectedComponent.template}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<AddCircleIcon />}
                onClick={() => {
                  onInsertComponent(selectedComponent.template);
                  handleCloseDetails();
                }}
              >
                Insert
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Accordion>
  );
};

export default ComponentLibrary; 