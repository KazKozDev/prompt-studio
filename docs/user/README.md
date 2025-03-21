# Multimodal Prompt Studio User Guide

## Getting Started

### Account Creation and Login

1. Navigate to the application URL
2. Click "Sign Up" to create a new account
3. Provide your email, name, and password
4. Login with your credentials

### Dashboard

The dashboard provides an overview of your prompts, templates, tests, and analytics. Use the sidebar to navigate between different sections of the application.

## Working with Prompts

### Creating a New Prompt

1. Navigate to the Prompts section
2. Click "New Prompt"
3. Enter a name and description for your prompt
4. Add prompt elements using the toolbar:
   - Text elements with roles (user, assistant, system)
   - Image elements (upload or URL)
   - Audio elements (upload or URL)
5. Arrange elements in the desired sequence
6. Click "Save" to create the prompt

### Editing a Prompt

1. Navigate to the Prompts section
2. Select the prompt you want to edit
3. Make your changes to the prompt structure
4. Click "Save" to update the prompt
5. A new version will be created automatically

### Versioning

1. View prompt versions by clicking the "Versions" tab
2. Compare different versions to see changes
3. Restore a previous version if needed

## Templates

### Using Templates

1. Navigate to the Templates section
2. Browse available templates
3. Click "Use Template" to create a new prompt based on the template
4. Fill in the required fields according to the template structure
5. Customize as needed
6. Save as a new prompt

### Creating Templates

1. Navigate to the Templates section
2. Click "New Template"
3. Define the template structure:
   - Add modality types (text, image, audio)
   - Set required fields
   - Add placeholders and default values
4. Specify whether the template should be public or private
5. Save the template

## Testing Prompts

### Quick Testing

1. Open a prompt
2. Click "Test" in the toolbar
3. Select an LLM provider (OpenAI, Anthropic, Mistral)
4. Choose a model
5. Adjust parameters if needed (temperature, max tokens, etc.)
6. Click "Run Test"
7. View the response from the LLM

### A/B Testing

1. Navigate to the Tests section
2. Click "New Test"
3. Select a base prompt
4. Create multiple variants by modifying the prompt
5. Configure test parameters:
   - Number of runs
   - Models to test against
   - Metrics to track
6. Click "Start Test"
7. View results in the test dashboard

## Analytics

### Viewing Analytics

1. Navigate to the Analytics section
2. View prompt usage statistics:
   - Total runs
   - Token usage
   - Cost estimates
3. Compare performance across different prompts
4. Filter by date range or provider

### Reports

1. Generate analytics reports from the Analytics section
2. Export data in CSV or JSON format
3. View historical performance trends

## Exporting Prompts

### Export Options

1. Open a prompt
2. Click "Export"
3. Choose an export format:
   - JSON: Raw prompt data
   - cURL: Command-line format for direct API calls
   - Python: Code snippet for using the prompt programmatically

## Account Management

### Profile Settings

1. Click your username in the top-right corner
2. Select "Profile"
3. Update your information
4. Change password if needed

### API Keys

1. Go to Profile > API Keys
2. Add provider API keys:
   - OpenAI API key
   - Anthropic API key
   - Mistral API key
3. Save changes
