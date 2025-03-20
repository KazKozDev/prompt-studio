import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Monaco editor options for the enhanced prompt editor
const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbers: 'on',
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  wrappingIndent: 'same',
  suggest: {
    showWords: true,
  }
};

// Define language for AI prompts
const defineAIPromptLanguage = (monaco: Monaco) => {
  // Register a new language
  monaco.languages.register({ id: 'aiprompt' });

  // Define the language tokens (for syntax highlighting)
  monaco.languages.setMonarchTokensProvider('aiprompt', {
    tokenizer: {
      root: [
        // System messages
        [/#system:.*$/, 'keyword'],
        
        // User messages
        [/#user:.*$/, 'string'],
        
        // Assistant messages
        [/#assistant:.*$/, 'comment'],
        
        // Variables
        [/{{[a-zA-Z0-9_]+}}/, 'variable'],
        
        // Commands and special sections
        [/#[a-zA-Z0-9_]+/, 'type'],
      ]
    }
  });

  // Define the language configuration
  monaco.languages.setLanguageConfiguration('aiprompt', {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '{{', close: '}}' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '{{', close: '}}' },
    ]
  });
};

// Set colors for our custom language
const defineTheme = (monaco: Monaco, isDarkMode: boolean) => {
  monaco.editor.defineTheme('aiprompt-theme', {
    base: isDarkMode ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },   // System prompts
      { token: 'string', foreground: '4EC9B0', fontStyle: 'bold' },    // User prompts
      { token: 'comment', foreground: 'CE9178', fontStyle: 'bold' },   // Assistant prompts
      { token: 'variable', foreground: 'DCDCAA' },                     // Variables
      { token: 'type', foreground: '3DC9B0' },                         // Commands
    ],
    colors: {
      'editor.background': isDarkMode ? '#1E1E1E' : '#FFFFFF',
      'editor.foreground': isDarkMode ? '#D4D4D4' : '#000000',
    }
  });
};

// Configure autocompletion for our custom language
const configureAutoCompletion = (monacoInstance: Monaco) => {
  monacoInstance.languages.registerCompletionItemProvider('aiprompt', {
    provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions = [
        {
          label: '#system',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '#system: ${1:Define the system behavior}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define system behavior and context',
          range: range
        },
        {
          label: '#user',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '#user: ${1:User message}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Add a user message',
          range: range
        },
        {
          label: '#assistant',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '#assistant: ${1:Assistant response}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Add an assistant response',
          range: range
        },
        {
          label: 'variable',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '{{${1:variable_name}}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a variable',
          range: range
        }
      ];

      return { suggestions: suggestions };
    }
  });
};

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorPositionChange?: (position: { lineNumber: number; column: number }) => void;
}

/**
 * Enhanced editor with syntax highlighting and autocompletion for prompts
 */
const EnhancedEditor: React.FC<EnhancedEditorProps> = ({ 
  value, 
  onChange,
  onCursorPositionChange
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Handle editor initialization
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    
    // Define language features
    defineAIPromptLanguage(monacoInstance);
    defineTheme(monacoInstance, isDarkMode);
    configureAutoCompletion(monacoInstance);
    
    // Set theme
    monacoInstance.editor.setTheme('aiprompt-theme');

    // Set up cursor position change handler
    if (onCursorPositionChange) {
      editor.onDidChangeCursorPosition((e: monaco.editor.ICursorPositionChangedEvent) => {
        onCursorPositionChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      });
    }
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 1,
        '& .monaco-editor': {
          paddingTop: 1,
          paddingBottom: 1
        }
      }}
    >
      <Editor
        height="100%"
        defaultLanguage="aiprompt"
        value={value}
        options={EDITOR_OPTIONS}
        onChange={(value: string | undefined) => onChange(value || '')}
        onMount={handleEditorDidMount}
      />
    </Paper>
  );
};

export default EnhancedEditor; 