# Multimodal Prompt Studio API Reference

## Overview

The Multimodal Prompt Studio provides a comprehensive RESTful API for managing prompts, templates, tests, and analytics.

## Authentication

All API endpoints (except public template listing) require authentication.

### Authentication Endpoints

- **POST /api/auth/login**: Authenticate user and get JWT token
- **POST /api/auth/register**: Register a new user
- **GET /api/auth/me**: Get current user information

### Authentication Headers

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Prompt API

### Endpoints

- **GET /api/prompts**: List user's prompts
- **POST /api/prompts**: Create a new prompt
- **GET /api/prompts/{id}**: Get a specific prompt
- **PUT /api/prompts/{id}**: Update a prompt
- **DELETE /api/prompts/{id}**: Delete a prompt
- **GET /api/prompts/{id}/versions**: Get all versions of a prompt
- **POST /api/prompts/{id}/versions**: Create a new version of a prompt

### Prompt Schema

```json
{
  "name": "Example prompt",
  "description": "This is an example prompt",
  "content": [
    {
      "type": "text",
      "role": "user",
      "content": "Analyze this image:"
    },
    {
      "type": "image",
      "url": "https://example.com/image.jpg"
    }
  ],
  "template_id": null
}
```

## Template API

### Endpoints

- **GET /api/templates**: List user's templates and public templates
- **POST /api/templates**: Create a new template
- **GET /api/templates/public**: List public templates
- **GET /api/templates/{id}**: Get a specific template
- **PUT /api/templates/{id}**: Update a template
- **DELETE /api/templates/{id}**: Delete a template

## Testing API

### Endpoints

- **POST /api/testing/{prompt_id}/test**: Test a prompt with a specific provider
- **GET /api/testing/providers**: Get information about available LLM providers
- **GET /api/testing/providers/{provider_name}/models**: Get available models for a provider

## Test Management API

### Endpoints

- **GET /api/tests**: List user's tests
- **POST /api/tests**: Create a new A/B test
- **GET /api/tests/{id}**: Get a specific test
- **PUT /api/tests/{id}**: Update a test
- **DELETE /api/tests/{id}**: Delete a test
- **POST /api/tests/{id}/start**: Start a test
- **POST /api/tests/{id}/stop**: Stop a running test
- **POST /api/tests/{id}/variants/{variant_id}/run**: Run a specific variant

## Analytics API

### Endpoints

- **GET /api/analytics/usage/prompts**: Get prompt usage statistics
- **GET /api/analytics/usage/providers**: Get provider usage statistics  
- **GET /api/analytics/aggregated**: Get aggregated analytics data

## Export API

### Endpoints

- **GET /api/exports/{prompt_id}/json**: Export a prompt as JSON
- **GET /api/exports/{prompt_id}/curl**: Export a prompt as a curl command
- **GET /api/exports/{prompt_id}/python**: Export a prompt as Python code
