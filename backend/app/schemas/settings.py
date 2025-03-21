from pydantic import BaseModel

class APIKeys(BaseModel):
    openai: str = ""
    anthropic: str = ""
    mistral: str = ""
    google: str = "" 