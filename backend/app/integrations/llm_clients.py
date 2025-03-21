"""
Universal clients for various LLM providers.
This module provides a unified interface for different language model providers.
"""
from typing import Dict, List, Any, Optional, Union
import os
import json
import time
import logging
from app.core.config import settings

class LLMClientBase:
    """Base class for all LLM clients"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.client = None
        self._setup_client()
    
    def _setup_client(self):
        """Setup the client - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def process_prompt(self, prompt_data, model, parameters):
        """Process a prompt - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def format_response(self, response):
        """Format the response - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def get_available_models(self):
        """Get available models - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement this method")

class OpenAIClient(LLMClientBase):
    """Client for OpenAI API"""
    
    def _setup_client(self):
        """Setup the OpenAI client"""
        try:
            import openai
            self.api_key = self.api_key or settings.OPENAI_API_KEY
            self.client = openai.Client(api_key=self.api_key)
        except Exception as e:
            logging.error(f"Failed to initialize OpenAI client: {str(e)}")
            self.client = None
    
    def process_prompt(self, prompt_data, model, parameters):
        """Process a prompt using OpenAI API"""
        if not self.client:
            raise ValueError("OpenAI client not initialized")
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=prompt_data,
                **parameters
            )
            return response
        except Exception as e:
            logging.error(f"Error calling OpenAI API: {str(e)}")
            raise
    
    def format_response(self, response):
        """Format OpenAI response to standardized format"""
        return {
            "content": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
    
    def get_available_models(self):
        """Get available OpenAI models"""
        if not self.api_key:
            return []
            
        if not self.client:
            return []
        
        try:
            models = self.client.models.list()
            return [model.id for model in models.data]
        except Exception as e:
            logging.error(f"Error fetching OpenAI models: {str(e)}")
            return [
                "gpt-4",
                "gpt-4-vision-preview",
                "gpt-4-turbo",
                "gpt-4",
                "gpt-3.5-turbo"
            ]

class AnthropicClient(LLMClientBase):
    """Client for Anthropic API"""
    
    def _setup_client(self):
        """Setup the Anthropic client"""
        try:
            import anthropic
            self.api_key = self.api_key or settings.ANTHROPIC_API_KEY
            self.client = anthropic.Anthropic(api_key=self.api_key)
        except Exception as e:
            logging.error(f"Failed to initialize Anthropic client: {str(e)}")
            self.client = None
    
    def process_prompt(self, prompt_data, model, parameters):
        """Process a prompt using Anthropic API"""
        if not self.client:
            raise ValueError("Anthropic client not initialized")
        
        try:
            # Extract system message if present
            system = ""
            messages = []
            
            for item in prompt_data:
                if item.get("role") == "system":
                    system += item.get("content", "") + "\n"
                else:
                    messages.append({
                        "role": item.get("role", "user"),
                        "content": item.get("content", "")
                    })
            
            response = self.client.messages.create(
                model=model,
                max_tokens=parameters.get("max_tokens", 1000),
                temperature=parameters.get("temperature", 0.7),
                system=system if system else None,
                messages=messages
            )
            return response
        except Exception as e:
            logging.error(f"Error calling Anthropic API: {str(e)}")
            raise
    
    def format_response(self, response):
        """Format Anthropic response to standardized format"""
        return {
            "content": response.content[0].text,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
                "total_tokens": response.usage.input_tokens + response.usage.output_tokens
            }
        }
    
    def get_available_models(self):
        """Get available Anthropic models"""
        if not self.api_key:
            return []
            
        return [
            "claude-3-5-sonnet-20240620",
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0"
        ]

class MistralClient(LLMClientBase):
    """Client for Mistral API"""
    
    def _setup_client(self):
        """Setup the Mistral client"""
        try:
            from mistralai.client import MistralClient
            self.api_key = self.api_key or settings.MISTRAL_API_KEY
            self.client = MistralClient(api_key=self.api_key)
        except Exception as e:
            logging.error(f"Failed to initialize Mistral client: {str(e)}")
            self.client = None
    
    def process_prompt(self, prompt_data, model, parameters):
        """Process a prompt using Mistral API"""
        if not self.client:
            raise ValueError("Mistral client not initialized")
        
        try:
            from mistralai.models.chat_completion import ChatMessage
            
            messages = [
                ChatMessage(role=item.get("role", "user"), content=item.get("content", ""))
                for item in prompt_data
            ]
            
            response = self.client.chat(
                model=model,
                messages=messages,
                temperature=parameters.get("temperature", 0.7),
                max_tokens=parameters.get("max_tokens", 1000)
            )
            return response
        except Exception as e:
            logging.error(f"Error calling Mistral API: {str(e)}")
            raise
    
    def format_response(self, response):
        """Format Mistral response to standardized format"""
        return {
            "content": response.choices[0].message.content,
            "usage": {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.prompt_tokens + response.usage.completion_tokens
            }
        }
    
    def get_available_models(self):
        """Get available Mistral models"""
        if not self.api_key:
            return []
            
        return [
            "mistral-large-latest",
            "mistral-small-latest",
            "mistral-medium-latest"
        ]

class GoogleAIClient(LLMClientBase):
    """Client for Google AI API"""
    
    def _setup_client(self):
        """Setup the Google AI client"""
        try:
            import google.generativeai as genai
            self.api_key = self.api_key or settings.GOOGLE_AI_API_KEY
            genai.configure(api_key=self.api_key)
            self.client = genai
        except Exception as e:
            logging.error(f"Failed to initialize Google AI client: {str(e)}")
            self.client = None
    
    def process_prompt(self, prompt_data, model, parameters):
        """Process a prompt using Google AI API"""
        if not self.client:
            raise ValueError("Google AI client not initialized")
        
        try:
            # Extract content for Google AI format
            prompt = ""
            system_message = ""
            
            for item in prompt_data:
                if item.get("role") == "system":
                    system_message += item.get("content", "") + "\n"
                elif item.get("role") == "user":
                    prompt += item.get("content", "") + "\n"
            
            # Configure model parameters
            model_config = {
                "temperature": parameters.get("temperature", 0.7),
                "max_output_tokens": parameters.get("max_tokens", 1000),
                "top_p": parameters.get("top_p", 0.95),
            }
            
            # Initialize model
            model = self.client.GenerativeModel(model_name=model)
            
            # Create chat
            chat = model.start_chat(history=[])
            
            # Add system message if present
            if system_message:
                chat.send_message(system_message)
            
            # Send user message and get response
            response = chat.send_message(prompt)
            return response
        except Exception as e:
            logging.error(f"Error calling Google AI API: {str(e)}")
            raise
    
    def format_response(self, response):
        """Format Google AI response to standardized format"""
        return {
            "content": response.text,
            "usage": {}  # Google AI doesn't provide token usage info
        }
    
    def get_available_models(self):
        """Get available Google AI models"""
        if not self.api_key:
            return []
            
        return [
            "gemini-pro",
            "gemini-pro-vision"
        ]

# Factory to create appropriate client instance
def get_llm_client(provider: str, api_key: Optional[str] = None):
    """
    Factory function to create an LLM client based on provider
    
    Args:
        provider: The LLM provider (openai, anthropic, mistral, google)
        api_key: Optional API key to override settings
        
    Returns:
        An LLM client instance
    """
    clients = {
        "openai": OpenAIClient,
        "anthropic": AnthropicClient,
        "mistral": MistralClient,
        "google": GoogleAIClient,
    }
    
    client_class = clients.get(provider.lower())
    if not client_class:
        raise ValueError(f"Unsupported provider: {provider}")
    
    return client_class(api_key) 