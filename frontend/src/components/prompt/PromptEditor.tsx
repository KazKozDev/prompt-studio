import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import EditorLayout from './EditorLayout';
import EnhancedEditor from './EnhancedEditor';
import VariableManager, { 
  Variable, 
  VariableSet, 
  replaceVariables
} from './VariableManager';
import ComponentLibrary from './ComponentLibrary';
import FlowEditor from './FlowEditor';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface PromptEditorProps {
  initialPrompt?: string;
  readOnly?: boolean;
  onSave?: (prompt: string) => void;
}

/**
 * Enhanced Prompt Editor Component with preview, variables, and component library
 */
const PromptEditor: React.FC<PromptEditorProps> = ({
  initialPrompt = '',
  readOnly = false,
  onSave
}) => {
  // State for prompt content
  const [promptContent, setPromptContent] = useState(initialPrompt);
  
  // State for preview generation
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for variables
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableSets, setVariableSets] = useState<VariableSet[]>([]);
  const [activeVariableSetId, setActiveVariableSetId] = useState<string>('');
  
  // State for editor view
  const [editorView, setEditorView] = useState<'text' | 'visual'>('text');
  
  // Generate preview with replaced variables
  const handleGeneratePreview = () => {
    setIsGenerating(true);
    
    // Find active variable set or create one from current variables
    let variableValues: Record<string, any> = {};
    
    if (activeVariableSetId) {
      const activeSet = variableSets.find(set => set.id === activeVariableSetId);
      if (activeSet) {
        variableValues = activeSet.variables;
      }
    } else {
      // Use current variable values
      variables.forEach(variable => {
        variableValues[variable.name] = variable.value;
      });
    }
    
    // Replace variables in the prompt
    const processedPrompt = replaceVariables(promptContent, variableValues);
    
    // Simulate AI response delay
    setTimeout(() => {
      setPreviewContent(processedPrompt);
      setIsGenerating(false);
    }, 1000);
    
    // In a real implementation, here you would:
    // 1. Send the processed prompt to an AI API
    // 2. Get the response and set it as preview content
    // 3. Handle errors appropriately
  };
  
  // Handle applying variables to preview
  const handleApplyVariables = (variableValues: Record<string, any>) => {
    // Apply variables and update preview
    const processedPrompt = replaceVariables(promptContent, variableValues);
    setPreviewContent(processedPrompt);
  };
  
  // Handle editor content change
  const handleEditorChange = (content: string) => {
    setPromptContent(content);
  };
  
  // Handle cursor position change
  const handleCursorPositionChange = (position: { lineNumber: number; column: number }) => {
    console.log('Cursor position:', position);
  };
  
  // Handle node selection in visual editor
  const handleNodeSelect = (nodeId: string) => {
    console.log('Selected node:', nodeId);
  };
  
  // Save the prompt
  const handleSave = () => {
    if (onSave) {
      onSave(promptContent);
    }
  };
  
  // Insert a component template at cursor position
  const handleInsertComponent = (template: string) => {
    // In a real implementation, we would:
    // 1. Find cursor position in the editor
    // 2. Insert the template at that position
    
    // For this example, we'll simply append it
    setPromptContent(prev => prev + '\n\n' + template);
  };
  
  // Render the preview content
  const renderPreview = () => {
    return (
      <Box 
        sx={{ 
          whiteSpace: 'pre-wrap', 
          fontFamily: 'monospace',
          fontSize: '14px',
          p: 1
        }}
      >
        {previewContent || "Click 'Generate Preview' to see your prompt with variables replaced."}
      </Box>
    );
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Variable Manager */}
      <VariableManager 
        variables={variables}
        variableSets={variableSets}
        activeSetId={activeVariableSetId}
        promptText={promptContent}
        onVariableChange={setVariables}
        onVariableSetChange={setVariableSets}
        onActiveSetChange={setActiveVariableSetId}
        onApplyVariables={handleApplyVariables}
      />
      
      {/* Component Library */}
      <ComponentLibrary onInsertComponent={handleInsertComponent} />
      
      {/* Editor View Toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        p: 1, 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <ToggleButtonGroup
          value={editorView}
          exclusive
          onChange={(e, value) => value && setEditorView(value)}
          size="small"
        >
          <ToggleButton value="text">
            <Tooltip title="Text Editor">
              <TextFieldsIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="visual">
            <Tooltip title="Visual Editor">
              <AccountTreeIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Editor and Preview */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <EditorLayout
          editor={
            editorView === 'text' ? (
              <EnhancedEditor
                value={promptContent}
                onChange={handleEditorChange}
                onCursorPositionChange={handleCursorPositionChange}
              />
            ) : (
              <FlowEditor
                value={promptContent}
                onChange={handleEditorChange}
                onNodeSelect={handleNodeSelect}
              />
            )
          }
          preview={renderPreview()}
          isLoading={isGenerating}
          promptContent={promptContent}
        />
      </Box>
      
      {/* Action Buttons */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
          disabled={readOnly}
        >
          Save Prompt
        </Button>
        
        <Button 
          variant="outlined"
          onClick={handleGeneratePreview}
          disabled={isGenerating}
          startIcon={isGenerating ? <CircularProgress size={20} /> : undefined}
        >
          {isGenerating ? 'Generating...' : 'Generate Preview'}
        </Button>
      </Box>
    </Box>
  );
};

export default PromptEditor; 