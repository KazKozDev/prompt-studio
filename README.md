# Multimodal Prompt Studio

A comprehensive development environment for creating, testing, and optimizing multimodal prompts for LLM systems.

## Features

- **Multimodal Prompt Editor**: Create prompts with text, images, and audio
- **Version Control**: Track changes to prompts with versioning
- **Templates**: Use and share reusable prompt templates
- **A/B Testing**: Compare different prompt variants
- **Analytics**: Track prompt performance and usage
- **LLM Provider Integration**: Support for OpenAI, Anthropic, and Mistral APIs

## Architecture

The application follows a modern microservices architecture:

- **Frontend**: React with TypeScript, Redux for state management
- **Backend**: Python FastAPI RESTful services
- **Database**: PostgreSQL for data persistence
- **Deployment**: Docker containers for easy deployment

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multimodal-prompt-studio.git
   cd multimodal-prompt-studio
   ```

2. Create environment files:
   ```bash
   cp .env.example .env
   ```

3. Start development environment:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```

4. Initialize the database:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml exec backend python init_db.py
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/api/docs

### Production Deployment

1. Set up production environment:
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod to set production values
   ```

2. Build and start production containers:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml up -d
   ```

## Usage

### Authentication

- Create an account or use the default admin credentials:
  - Email: admin@example.com
  - Password: adminpassword

### Creating Prompts

1. Navigate to Prompts in the sidebar
2. Click "New Prompt"
3. Add prompt elements (text, image, audio)
4. Set variables and structure
5. Save prompt

### Testing Prompts

1. Navigate to the Testing tab
2. Select a prompt to test
3. Choose an LLM provider (OpenAI, Anthropic, Mistral)
4. Set parameters (model, temperature, etc.)
5. Run test and view results

### Running A/B Tests

1. Create a new test
2. Add multiple prompt variants
3. Configure test parameters
4. Run test against selected LLM providers
5. View and compare results

## API Reference

Comprehensive API documentation is available at `/api/docs` when the backend is running.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright 2024 Multimodal Prompt Studio

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
