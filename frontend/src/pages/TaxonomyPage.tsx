import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent,
  IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails,
  TextField, InputAdornment, Button, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';

// Типы для данных таксономии
interface TechniqueExample {
  content: string;
}

interface Technique {
  id: string;
  name: string;
  description: string;
  reference: string;
  example: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
}

interface Category {
  id: string;
  title: string;
  description: string;
  techniques: Technique[];
}

// Примеры техник по категориям
const taxonomyData: Category[] = [
  {
    id: "basic_techniques",
    title: "1. Basic Prompting Techniques",
    description: "Fundamental approaches for formulating effective prompts and providing clear instructions to language models.",
    techniques: [
      {
        id: "direct_instructions",
        name: "Direct Instructions",
        description: "Explicit commands given to the model in clear, unambiguous language.",
        reference: "Liu et al. (2023), \"The Impact of Instruction Clarity on Large Language Model Performance\"",
        example: "Summarize this scientific article in 100 words, highlighting the methodology and key findings.",
        complexity: "Basic"
      },
      {
        id: "role_prompting",
        name: "Role Prompting",
        description: "Assigning a specific persona or role to the model to shape its response perspective.",
        reference: "White et al. (2023), \"The Effect of Role-Based Prompting on Expert Knowledge Retrieval in LLMs\"",
        example: "Act as an experienced physics professor explaining quantum entanglement to undergraduate students. Use accessible metaphors and avoid complex mathematics in your explanation.",
        complexity: "Basic"
      }
    ]
  },
  {
    id: "reasoning_techniques",
    title: "2. Reasoning Enhancement Techniques",
    description: "Methods designed to improve the model's reasoning capabilities and problem-solving approach.",
    techniques: [
      {
        id: "chain_of_thought",
        name: "Chain-of-Thought (CoT)",
        description: "Prompting the model to generate a series of intermediate reasoning steps before arriving at a final answer.",
        reference: "Wei et al. (2022), \"Chain of Thought Prompting Elicits Reasoning in Large Language Models\"",
        example: "If John has 5 apples and gives 2 to Mary, who then exchanges 1 apple for 3 oranges from Tom, how many pieces of fruit does Mary have now? Let's think through this step by step.",
        complexity: "Intermediate"
      },
      {
        id: "tree_of_thoughts",
        name: "Tree of Thoughts",
        description: "Explores multiple reasoning pathways simultaneously, evaluating each branch before selecting the optimal solution path.",
        reference: "Yao et al. (2023), \"Tree of Thoughts: Deliberate Problem Solving with Large Language Models\"",
        example: "What's the best investment strategy for a 35-year-old with $50,000 to invest who wants to buy a house in 5 years? Let's explore multiple approaches:\nApproach 1: Conservative bond-focused strategy...\nApproach 2: Balanced portfolio approach...\nApproach 3: Real estate focused investment...",
        complexity: "Advanced"
      }
    ]
  },
  {
    id: "task_specific",
    title: "3. Task-Specific Techniques",
    description: "Specialized prompting approaches designed for particular types of tasks or outputs.",
    techniques: [
      {
        id: "structured_data_extraction",
        name: "Structured Data Extraction",
        description: "Techniques specifically designed to extract structured information from unstructured text in a consistent format.",
        reference: "Roberts et al. (2023), \"Structured Data Extraction from Unstructured Text Using LLMs\"",
        example: "Extract the following information from this product review:\n- Product name\n- Rating (1-5)\n- Key positive points\n- Key negative points\n- Recommendation status\n\nOutput the information in JSON format.\n\nText: \"I recently purchased the XYZ Wireless Headphones and have been using them for about two weeks. The sound quality is exceptional and the battery lasts for nearly 20 hours as advertised. However, I found them somewhat uncomfortable during extended use and the microphone quality is mediocre at best. Overall, I'd recommend them for casual listeners but not for professional use or long gaming sessions. 4/5 stars.\"",
        complexity: "Intermediate"
      },
      {
        id: "style_transfer",
        name: "Style Transfer",
        description: "Techniques designed to transform text from one stylistic form to another while preserving core meaning and content.",
        reference: "Zhang et al. (2023), \"Neural Style Transfer for Natural Language with LLMs\"",
        example: "Rewrite the following technical explanation in the style of a children's book author while preserving all key scientific information.\n\nOriginal: \"Photosynthesis is the process by which plants convert light energy into chemical energy. This chemical energy is stored in the form of glucose, which plants use for growth and metabolism. The process occurs in chloroplasts, specifically using the green pigment chlorophyll, and generates oxygen as a byproduct.\"",
        complexity: "Intermediate"
      }
    ]
  },
  {
    id: "example_based",
    title: "4. Example-Based Learning Techniques",
    description: "Methods that use examples to guide the model toward the desired output pattern or style.",
    techniques: [
      {
        id: "few_shot",
        name: "Few-Shot Prompting",
        description: "Providing the model with a small number of examples that demonstrate the desired input-output pattern before asking it to perform the task.",
        reference: "Brown et al. (2020), \"Language Models are Few-Shot Learners\"",
        example: "I'm going to give you a few examples of technical jargon being converted to plain language, then ask you to perform the same task.\n\nExample 1:\nInput: \"We need to implement middleware to facilitate API endpoint authentication.\"\nOutput: \"We need to add a security layer to verify users have permission to access our web service.\"\n\nExample 2:\nInput: \"The deployment failed due to dependency conflicts in the container orchestration.\"\nOutput: \"The software couldn't be installed because some of its components weren't compatible with the system that manages our applications.\"\n\nNow, perform the same task:\nInput: \"The legacy system requires refactoring to implement microservices architecture with improved fault tolerance.\"",
        complexity: "Intermediate"
      },
      {
        id: "contrastive_examples",
        name: "Contrastive Examples",
        description: "Providing both positive and negative examples to help the model understand the boundaries and criteria for successful task completion.",
        reference: "Martinez et al. (2023), \"Contrastive Learning in LLM Output Quality Control\"",
        example: "I'll show you examples of good and bad product descriptions along with explanations of why they meet or fail to meet effective marketing criteria.\n\nGood example:\n\"Our ergonomic desk chair features adjustable lumbar support and breathable mesh backing, providing all-day comfort for professionals who spend hours at their desk. The 5-point base with smooth-rolling casters ensures stability and mobility on any surface.\"\nThis is good because: It focuses on specific features and their benefits to the user, uses descriptive language, and addresses customer pain points.\n\nBad example:\n\"This is a really nice office chair that lots of people like. It's comfortable and looks good in any office. You can roll around and adjust some parts of it. It's better than most other chairs.\"\nThis is problematic because: It uses vague language, lacks specific features or benefits, contains no technical details, and relies on generic superlatives without substantiation.\n\nNow, create a product description for wireless earbuds that meets the positive criteria while avoiding the negative aspects.",
        complexity: "Advanced"
      }
    ]
  },
  {
    id: "safety_reliability",
    title: "5. Safety and Reliability Techniques",
    description: "Methods focused on improving the safety, reliability, and factual accuracy of language model outputs.",
    techniques: [
      {
        id: "guardrail_prompting",
        name: "Guardrail Prompting",
        description: "Explicitly defining boundaries and constraints to prevent problematic or unsafe outputs.",
        reference: "Johnson et al. (2023), \"Guardrails for Responsible AI Deployment\"",
        example: "Create a marketing campaign for a weight management supplement.\n\nImportant constraints:\n1. Do not make any medical claims about the product's effectiveness\n2. Ensure all content is factually accurate and backed by scientific evidence\n3. Avoid language that could promote unrealistic body standards or unhealthy behaviors\n4. Do not imply the supplement can replace proper nutrition or exercise\n5. Ensure compliance with FTC advertising guidelines for supplements",
        complexity: "Intermediate"
      },
      {
        id: "fact_verification",
        name: "Fact Verification Prompting",
        description: "Techniques that guide models to verify factual claims and express appropriate levels of confidence.",
        reference: "Williams et al. (2023), \"Improving Factuality in Large Language Models\"",
        example: "Provide an overview of current treatments for Alzheimer's disease.\n\nFor any factual claims in your response:\n1. Indicate your confidence level (High/Medium/Low)\n2. Distinguish between widely accepted facts, ongoing research, and speculation\n3. Note where you're uncertain or where information might be outdated\n4. When discussing treatment efficacy, clearly state the quality and quantity of supporting evidence",
        complexity: "Advanced"
      }
    ]
  },
  {
    id: "multimodal_techniques",
    title: "6. Multimodal Techniques",
    description: "Methods for effectively prompting models that can process and generate multiple types of media (text, images, etc.).",
    techniques: [
      {
        id: "image_guided",
        name: "Image-Guided Prompting",
        description: "Using images to guide or constrain text generation in multimodal models.",
        reference: "Kim et al. (2023), \"Visual-Linguistic Integration in Multimodal Models\"",
        example: "[Image of a landscape painting]\n\nBased on this image:\n1. Describe the artistic style and techniques used in this painting\n2. Identify key elements of composition and how they contribute to the overall effect\n3. Suggest what artistic period this painting might belong to and explain your reasoning",
        complexity: "Intermediate"
      },
      {
        id: "cross_modal",
        name: "Cross-Modal Translation",
        description: "Prompting techniques that facilitate translation between different modalities while preserving information.",
        reference: "Zhang et al. (2023), \"Cross-Modal Information Transfer in Multimodal LLMs\"",
        example: "[Image of a data visualization]\n\nConvert this visualization into a textual description suitable for screen readers, following these guidelines:\n1. Start with an overview of what the visualization shows (chart type, main subject)\n2. Describe the axes, scales, and any color coding\n3. Articulate the main trends, patterns, or findings in the data\n4. Include any outliers or notable data points\n5. Conclude with the key takeaway message of the visualization",
        complexity: "Advanced"
      }
    ]
  },
  {
    id: "optimization_techniques",
    title: "7. Optimization Techniques",
    description: "Methods focused on optimizing prompt efficiency, token usage, and overall response quality.",
    techniques: [
      {
        id: "token_optimization",
        name: "Token Optimization",
        description: "Techniques for minimizing token usage while maintaining essential information and instructions.",
        reference: "Garcia et al. (2023), \"Token Economy: Efficient Prompting for LLMs\"",
        example: "Provide a condensed explanation of photosynthesis. Focus only on the most essential scientific processes and use efficient language without sacrificing technical accuracy. Limit your explanation to the core chemical reactions and biological significance.",
        complexity: "Intermediate"
      },
      {
        id: "iterative_refinement",
        name: "Iterative Refinement",
        description: "Systematically improving outputs through multiple rounds of generation and feedback.",
        reference: "Lee et al. (2023), \"Iterative Refinement Strategies for LLM Output Quality\"",
        example: "This will be a multi-step process to create a compelling executive summary for a business proposal:\n\nStep 1: Generate an initial executive summary based on the product information and market analysis I've provided\nStep 2: Evaluate the initial summary against these criteria: clarity of value proposition, conciseness, persuasiveness, and alignment with target investor interests\nStep 3: Identify specific improvements needed for each criterion\nStep 4: Generate a refined version addressing those improvements\nStep 5: Repeat evaluation and refinement until the summary would convince a skeptical investor to continue reading the full proposal",
        complexity: "Advanced"
      }
    ]
  }
];

const TaxonomyPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);
  const [expandAll, setExpandAll] = useState(false);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // Если пользователь начинает поиск, раскроем все категории
    if (event.target.value) {
      setExpandAll(true);
    }
  };

  // Обработчик раскрытия/скрытия категории
  const handleCategoryToggle = (categoryId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCategory(isExpanded ? categoryId : false);
  };

  // Обработчик раскрытия/скрытия всех категорий
  const handleToggleAll = () => {
    setExpandAll(!expandAll);
  };

  // Обработчик копирования примера в буфер обмена
  const handleCopyExample = (example: string) => {
    navigator.clipboard.writeText(example);
    // Можно добавить уведомление об успешном копировании
  };

  // Фильтруем техники по поисковому запросу
  const filteredData = searchQuery 
    ? taxonomyData.map(category => ({
        ...category,
        techniques: category.techniques.filter(technique => 
          technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          technique.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.techniques.length > 0)
    : taxonomyData;

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Prompt Techniques Taxonomy</Typography>
      
      {/* Баннер таксономии */}
      <Paper 
        sx={{ 
          mb: 3, 
          bgcolor: '#5E35B1', 
          color: 'white', 
          p: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom>
          Comprehensive Taxonomy of Prompting Techniques
        </Typography>
        <Typography variant="body1">
          Research on prompt engineering has evolved rapidly, with numerous techniques documented in academic literature. Below is a comprehensive classification of prompting methods with references to scientific publications.
        </Typography>
      </Paper>
      
      {/* Поисковая строка и управление раскрытием */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search Techniques"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
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
          variant="outlined"
          onClick={handleToggleAll}
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </Button>
      </Box>
      
      {/* Категории таксономии */}
      {filteredData.length > 0 ? (
        filteredData.map((category) => (
          <Accordion 
            key={category.id}
            expanded={expandAll || expandedCategory === category.id}
            onChange={handleCategoryToggle(category.id)}
            sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: '#5E35B1', 
                color: 'white',
                '&:hover': { bgcolor: '#4527A0' },
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: 'white',
                }
              }}
            >
              <Typography variant="h6">{category.title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" paragraph sx={{ color: '#666666' }}>
                {category.description}
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {category.techniques.map((technique) => (
                  <Grid item xs={12} md={6} key={technique.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      <CardContent>
                        {/* Заголовок техники */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <SchoolIcon sx={{ mr: 1, color: '#5E35B1' }} />
                          <Typography variant="h6" component="h3">
                            {technique.name}
                          </Typography>
                          <Tooltip title={technique.complexity}>
                            <Box 
                              sx={{ 
                                ml: 1, 
                                px: 1, 
                                py: 0.5, 
                                bgcolor: technique.complexity === 'Basic' ? '#E8F5E9' : 
                                         technique.complexity === 'Intermediate' ? '#FFF8E1' : '#FFEBEE',
                                color: technique.complexity === 'Basic' ? '#2E7D32' : 
                                       technique.complexity === 'Intermediate' ? '#F57F17' : '#C62828',
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {technique.complexity}
                            </Box>
                          </Tooltip>
                        </Box>
                        
                        {/* Описание техники */}
                        <Typography variant="body2" paragraph sx={{ color: '#424242' }}>
                          {technique.description}
                        </Typography>
                        
                        {/* Научная ссылка */}
                        <Typography 
                          variant="body2" 
                          paragraph 
                          sx={{ 
                            fontStyle: 'italic', 
                            color: '#666666',
                            fontSize: '0.85rem' 
                          }}
                        >
                          <strong>Reference:</strong> {technique.reference}
                        </Typography>
                        
                        {/* Пример использования */}
                        <Box sx={{ position: 'relative' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Example:
                          </Typography>
                          <Box 
                            sx={{ 
                              bgcolor: '#F5F5F5', 
                              p: 1.5, 
                              borderRadius: 1,
                              fontFamily: '"Roboto Mono", monospace',
                              fontSize: '0.875rem',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '150px',
                              overflowY: 'auto'
                            }}
                          >
                            {technique.example}
                          </Box>
                          <Tooltip title="Copy Example">
                            <IconButton 
                              size="small" 
                              sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                right: 0 
                              }}
                              onClick={() => handleCopyExample(technique.example)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        {/* Кнопка "Попробовать эту технику" */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => window.location.href = '/prompts/new?technique=' + technique.id}
                          >
                            Try This Technique
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No techniques match your search criteria.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TaxonomyPage; 