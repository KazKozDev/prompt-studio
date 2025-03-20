import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BuildIcon from '@mui/icons-material/Build';
import SaveIcon from '@mui/icons-material/Save';

// Type definitions for variables
export type VariableType = 'text' | 'number' | 'boolean' | 'select';

export interface VariableOption {
  label: string;
  value: string;
}

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  value: string | number | boolean;
  options?: VariableOption[];
  description?: string;
}

export interface VariableSet {
  id: string;
  name: string;
  variables: Record<string, any>;
}

// Helper function to extract variable names from prompt text
export const extractVariables = (text: string): string[] => {
  const regex = /{{([a-zA-Z0-9_]+)}}/g;
  const matches = text.match(regex) || [];
  return matches.map(match => match.replace(/{{|}}/g, ''));
};

// Helper function to replace variables in text
export const replaceVariables = (text: string, variables: Record<string, any>): string => {
  return text.replace(/{{([a-zA-Z0-9_]+)}}/g, (match, variableName) => {
    if (variables.hasOwnProperty(variableName)) {
      return String(variables[variableName]);
    }
    return match;
  });
};

interface VariableManagerProps {
  variables: Variable[];
  variableSets: VariableSet[];
  activeSetId?: string;
  promptText: string;
  onVariableChange: (variables: Variable[]) => void;
  onVariableSetChange: (variableSets: VariableSet[]) => void;
  onActiveSetChange: (setId: string) => void;
  onApplyVariables: (variables: Record<string, any>) => void;
}

/**
 * Component for managing variables in prompts
 */
const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  variableSets,
  activeSetId,
  promptText,
  onVariableChange,
  onVariableSetChange,
  onActiveSetChange,
  onApplyVariables
}) => {
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [newSetName, setNewSetName] = useState('');
  
  // Extract variables from prompt
  useEffect(() => {
    const extractedVarNames = extractVariables(promptText);
    
    // Find variables in the prompt that are not yet defined
    const missingVars = extractedVarNames.filter(
      name => !variables.some(v => v.name === name)
    );
    
    // Create new variables for missing ones
    if (missingVars.length > 0) {
      const newVars = missingVars.map(name => ({
        id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        type: 'text' as VariableType,
        value: '',
        description: `Variable extracted from prompt`
      }));
      
      onVariableChange([...variables, ...newVars]);
    }
  }, [promptText, variables, onVariableChange]);
  
  // Get the active variable set
  const activeSet = variableSets.find(set => set.id === activeSetId) || 
    (variableSets.length > 0 ? variableSets[0] : null);
  
  // Open dialog to edit a variable
  const handleEditVariable = (variable: Variable) => {
    setEditingVariable({ ...variable });
    setDialogOpen(true);
  };
  
  // Add a new variable
  const handleAddVariable = () => {
    const newVar: Variable = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      type: 'text',
      value: '',
      description: ''
    };
    setEditingVariable(newVar);
    setDialogOpen(true);
  };
  
  // Save variable after editing
  const handleSaveVariable = () => {
    if (!editingVariable || !editingVariable.name) return;
    
    const updatedVariables = editingVariable.id
      ? variables.map(v => v.id === editingVariable.id ? editingVariable : v)
      : [...variables, editingVariable];
    
    onVariableChange(updatedVariables);
    setDialogOpen(false);
    setEditingVariable(null);
  };
  
  // Delete a variable
  const handleDeleteVariable = (id: string) => {
    onVariableChange(variables.filter(v => v.id !== id));
  };
  
  // Create a new variable set
  const handleCreateVariableSet = () => {
    if (!newSetName.trim()) return;
    
    // Create variable values map from current variables
    const variableValues: Record<string, any> = {};
    variables.forEach(v => {
      variableValues[v.name] = v.value;
    });
    
    const newSet: VariableSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newSetName,
      variables: variableValues
    };
    
    const updatedSets = [...variableSets, newSet];
    onVariableSetChange(updatedSets);
    onActiveSetChange(newSet.id);
    setNewSetName('');
  };
  
  // Delete a variable set
  const handleDeleteVariableSet = (id: string) => {
    const updatedSets = variableSets.filter(set => set.id !== id);
    onVariableSetChange(updatedSets);
    
    // If active set was deleted, select the first available
    if (activeSetId === id && updatedSets.length > 0) {
      onActiveSetChange(updatedSets[0].id);
    }
  };
  
  // Save current variable values to the active set
  const handleSaveToSet = () => {
    if (!activeSet) return;
    
    const variableValues: Record<string, any> = {};
    variables.forEach(v => {
      variableValues[v.name] = v.value;
    });
    
    const updatedSet = {
      ...activeSet,
      variables: variableValues
    };
    
    const updatedSets = variableSets.map(set => 
      set.id === updatedSet.id ? updatedSet : set
    );
    
    onVariableSetChange(updatedSets);
  };
  
  // Load values from a variable set
  const handleLoadFromSet = (setId: string) => {
    const set = variableSets.find(s => s.id === setId);
    if (!set) return;
    
    // Update active set
    onActiveSetChange(setId);
    
    // Apply variables to preview
    onApplyVariables(set.variables);
    
    // Update variable values in the editor
    const updatedVariables = variables.map(v => ({
      ...v,
      value: set.variables[v.name] !== undefined ? set.variables[v.name] : v.value
    }));
    
    onVariableChange(updatedVariables);
  };
  
  // Update a variable's value
  const handleUpdateVariableValue = (id: string, value: string | number | boolean) => {
    const updatedVariables = variables.map(v => 
      v.id === id ? { ...v, value } : v
    );
    
    onVariableChange(updatedVariables);
  };
  
  return (
    <Box>
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
            <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1">
              Variable Manager
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip 
              label={`${variables.length} Variables`} 
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            />
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          {/* Variable Sets Section */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">Variable Sets</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button 
                size="small" 
                startIcon={<SaveIcon />} 
                onClick={handleSaveToSet}
                disabled={!activeSet}
              >
                Save Current
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                size="small"
                label="New Set Name"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateVariableSet}
                disabled={!newSetName.trim()}
              >
                Create
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {variableSets.map(set => (
                <Chip
                  key={set.id}
                  label={set.name}
                  onClick={() => handleLoadFromSet(set.id)}
                  onDelete={() => handleDeleteVariableSet(set.id)}
                  color={activeSetId === set.id ? 'primary' : 'default'}
                  variant={activeSetId === set.id ? 'filled' : 'outlined'}
                />
              ))}
              {variableSets.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No variable sets defined yet.
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Variables Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">Variables</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddVariable}
              >
                Add Variable
              </Button>
            </Box>
            
            {variables.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {"No variables found in prompt. Add variables by using {{variableName}} syntax in your prompt."}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {variables.map(variable => (
                  <Paper key={variable.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {`{{${variable.name}}}`}
                      </Typography>
                      <Chip 
                        label={variable.type} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Edit variable">
                        <IconButton
                          size="small"
                          onClick={() => handleEditVariable(variable)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete variable">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteVariable(variable.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {variable.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {variable.description}
                      </Typography>
                    )}
                    
                    {/* Variable Value Editor based on type */}
                    {variable.type === 'text' && (
                      <TextField
                        fullWidth
                        size="small"
                        value={variable.value}
                        onChange={(e) => handleUpdateVariableValue(variable.id, e.target.value)}
                      />
                    )}
                    
                    {variable.type === 'number' && (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={variable.value}
                        onChange={(e) => handleUpdateVariableValue(variable.id, Number(e.target.value))}
                      />
                    )}
                    
                    {variable.type === 'boolean' && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(variable.value)}
                            onChange={(e) => handleUpdateVariableValue(variable.id, e.target.checked)}
                          />
                        }
                        label={Boolean(variable.value) ? "True" : "False"}
                      />
                    )}
                    
                    {variable.type === 'select' && variable.options && (
                      <FormControl fullWidth size="small">
                        <Select
                          value={variable.value}
                          onChange={(e) => handleUpdateVariableValue(variable.id, e.target.value)}
                        >
                          {variable.options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Edit Variable Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVariable?.id ? 'Edit Variable' : 'Add Variable'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Variable Name"
              fullWidth
              value={editingVariable?.name || ''}
              onChange={(e) => setEditingVariable(prev => prev ? { ...prev, name: e.target.value } : null)}
              helperText="Use only letters, numbers, and underscores"
            />
            
            <FormControl fullWidth>
              <InputLabel>Variable Type</InputLabel>
              <Select
                value={editingVariable?.type || 'text'}
                label="Variable Type"
                onChange={(e) => {
                  const newType = e.target.value as VariableType;
                  setEditingVariable(prev => {
                    if (!prev) return null;
                    
                    // Set default value based on type
                    let defaultValue: string | number | boolean = '';
                    if (newType === 'number') defaultValue = 0;
                    if (newType === 'boolean') defaultValue = false;
                    
                    return {
                      ...prev,
                      type: newType,
                      value: defaultValue,
                      options: newType === 'select' ? (prev.options || []) : undefined
                    };
                  });
                }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="select">Select</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={editingVariable?.description || ''}
              onChange={(e) => setEditingVariable(prev => prev ? { ...prev, description: e.target.value } : null)}
            />
            
            {/* Select options editor */}
            {editingVariable?.type === 'select' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Options
                </Typography>
                {editingVariable.options?.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      label="Label"
                      size="small"
                      value={option.label}
                      onChange={(e) => {
                        setEditingVariable(prev => {
                          if (!prev || !prev.options) return prev;
                          const newOptions = [...prev.options];
                          newOptions[index] = { ...newOptions[index], label: e.target.value };
                          return { ...prev, options: newOptions };
                        });
                      }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      size="small"
                      value={option.value}
                      onChange={(e) => {
                        setEditingVariable(prev => {
                          if (!prev || !prev.options) return prev;
                          const newOptions = [...prev.options];
                          newOptions[index] = { ...newOptions[index], value: e.target.value };
                          return { ...prev, options: newOptions };
                        });
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingVariable(prev => {
                          if (!prev || !prev.options) return prev;
                          const newOptions = prev.options.filter((_, i) => i !== index);
                          return { ...prev, options: newOptions };
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingVariable(prev => {
                      if (!prev) return prev;
                      const newOption: VariableOption = { label: '', value: '' };
                      const newOptions = [...(prev.options || []), newOption];
                      return { ...prev, options: newOptions };
                    });
                  }}
                >
                  Add Option
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveVariable} 
            variant="contained"
            disabled={!editingVariable?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VariableManager; 