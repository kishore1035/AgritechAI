"""
AgriTech AI - IVR (Interactive Voice Response) Service

Integrates Whisper API for speech-to-text and OpenAI for voice interactions.
Allows farmers to interact with the platform using voice commands.

SECURITY WARNING: Never commit API keys to version control.
Use environment variables (.env file) instead.
"""

import os
from typing import Optional, Tuple
from datetime import datetime
import logging
from pathlib import Path

# Third-party imports
from openai import OpenAI
import numpy as np
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IVRConfig(BaseModel):
    """IVR Configuration"""
    whisper_api_key: str = Field(default_factory=lambda: os.getenv("WHISPER_API_KEY", ""))
    openai_api_key: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    model: str = "gpt-4o-mini"
    language: str = "en"
    max_call_duration: int = 3600  # seconds
    debug: bool = False
    
    class Config:
        env_file = ".env"


class TranscriptionResult(BaseModel):
    """Transcription result from Whisper"""
    text: str
    language: str
    duration: float
    confidence: Optional[float] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class IVRResponse(BaseModel):
    """IVR Response to farmer"""
    text: str
    action: str  # "continue", "transfer", "end_call"
    audio_url: Optional[str] = None
    recommended_action: Optional[str] = None


class WhisperTranscriber:
    """
    Wrapper for OpenAI Whisper API
    Converts speech to text with language detection
    """
    
    def __init__(self, api_key: str, language: str = "en"):
        """
        Initialize Whisper transcriber
        
        Args:
            api_key: OpenAI API key
            language: Language code (en, hi, etc.)
        """
        if not api_key:
            raise ValueError("WHISPER_API_KEY not provided. Set in .env file.")
        
        self.client = OpenAI(api_key=api_key)
        self.language = language
        logger.info(f"Whisper initialized for language: {language}")
    
    def transcribe_audio_file(self, audio_file_path: str) -> TranscriptionResult:
        """
        Transcribe audio file using Whisper
        
        Args:
            audio_file_path: Path to audio file (mp3, m4a, wav, etc.)
            
        Returns:
            TranscriptionResult with transcribed text
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                logger.info(f"Transcribing: {audio_file_path}")
                
                response = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=self.language,
                    response_format="verbose_json"
                )
            
            result = TranscriptionResult(
                text=response.text,
                language=self.language,
                duration=response.duration if hasattr(response, 'duration') else 0.0,
                confidence=getattr(response, 'confidence', None)
            )
            
            logger.info(f"Transcription successful: {result.text[:100]}...")
            return result
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise
    
    def transcribe_audio_stream(self, audio_data: bytes) -> TranscriptionResult:
        """
        Transcribe audio from byte stream
        
        Args:
            audio_data: Audio data as bytes
            
        Returns:
            TranscriptionResult
        """
        try:
            logger.info("Transcribing audio stream...")
            
            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=("audio.wav", audio_data, "audio/wav"),
                language=self.language,
                response_format="verbose_json"
            )
            
            result = TranscriptionResult(
                text=response.text,
                language=self.language,
                duration=getattr(response, 'duration', 0.0)
            )
            
            logger.info(f"Stream transcription successful: {result.text[:100]}...")
            return result
            
        except Exception as e:
            logger.error(f"Stream transcription failed: {str(e)}")
            raise


class VoiceCommandProcessor:
    """
    Process voice commands and generate responses
    Uses OpenAI to understand farmer intent
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        """
        Initialize voice command processor
        
        Args:
            api_key: OpenAI API key
            model: Model to use (gpt-4o-mini, gpt-4, etc.)
        """
        if not api_key:
            raise ValueError("OPENAI_API_KEY not provided. Set in .env file.")
        
        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.context = {}
        logger.info(f"Voice processor initialized with model: {model}")
    
    # System prompt for IVR context
    SYSTEM_PROMPT = """You are a helpful agricultural assistant for an Indian farming platform called AgriTech AI.
You help farmers with:
1. Crop recommendations based on soil conditions
2. Irrigation scheduling and water management
3. Soil health monitoring
4. Crop rotation planning
5. Weather updates and alerts
6. General farming advice

Respond concisely in the farmer's language (Hindi or English).
If the farmer asks about something outside agriculture, politely redirect.
Always provide actionable advice.
Format responses for voice: Clear, short sentences (< 20 words each).
"""
    
    def process_command(self, voice_text: str, farmer_id: Optional[str] = None) -> IVRResponse:
        """
        Process voice command and generate response
        
        Args:
            voice_text: Transcribed voice command
            farmer_id: Optional farmer ID for context
            
        Returns:
            IVRResponse with text and action
        """
        try:
            logger.info(f"Processing command: {voice_text}")
            
            # Build context if farmer_id available
            context_msg = ""
            if farmer_id:
                context_msg = f"[Farmer ID: {farmer_id}] "
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": f"{context_msg}{voice_text}"}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            response_text = response.choices[0].message.content
            logger.info(f"Generated response: {response_text[:100]}...")
            
            # Determine action based on response
            action = self._determine_action(response_text)
            
            return IVRResponse(
                text=response_text,
                action=action,
                recommended_action=self._extract_recommendation(response_text)
            )
            
        except Exception as e:
            logger.error(f"Command processing failed: {str(e)}")
            return IVRResponse(
                text="Sorry, I couldn't process that. Please try again.",
                action="continue"
            )
    
    def _determine_action(self, response_text: str) -> str:
        """Determine next action based on response"""
        text_lower = response_text.lower()
        
        if any(word in text_lower for word in ["goodbye", "thank you", "bye", "end call"]):
            return "end_call"
        elif any(word in text_lower for word in ["transfer", "agent", "specialist"]):
            return "transfer"
        else:
            return "continue"
    
    def _extract_recommendation(self, response_text: str) -> Optional[str]:
        """Extract actionable recommendation from response"""
        lines = response_text.split(".")
        for line in lines:
            if any(action in line.lower() for action in ["recommend", "suggest", "should", "need to"]):
                return line.strip()
        return None


class IVRService:
    """
    Main IVR Service
    Orchestrates transcription, processing, and response generation
    """
    
    def __init__(self, config: Optional[IVRConfig] = None):
        """
        Initialize IVR Service
        
        Args:
            config: IVRConfig object (uses defaults from .env if not provided)
        """
        self.config = config or IVRConfig()
        
        # Validate API keys
        if not self.config.whisper_api_key:
            raise ValueError("WHISPER_API_KEY not set in environment")
        if not self.config.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")
        
        # Initialize components
        self.transcriber = WhisperTranscriber(
            api_key=self.config.whisper_api_key,
            language=self.config.language
        )
        self.processor = VoiceCommandProcessor(
            api_key=self.config.openai_api_key,
            model=self.config.model
        )
        
        self.call_history = []
        logger.info("IVR Service initialized successfully")
    
    def handle_voice_call(self, audio_file_path: str, farmer_id: Optional[str] = None) -> Tuple[str, IVRResponse]:
        """
        Handle complete voice call
        
        Args:
            audio_file_path: Path to recorded voice call
            farmer_id: Optional farmer identifier
            
        Returns:
            Tuple of (transcribed_text, IVRResponse)
        """
        try:
            # Step 1: Transcribe audio
            logger.info("Step 1: Transcribing audio...")
            transcription = self.transcriber.transcribe_audio_file(audio_file_path)
            
            # Step 2: Process command
            logger.info("Step 2: Processing voice command...")
            response = self.processor.process_command(
                voice_text=transcription.text,
                farmer_id=farmer_id
            )
            
            # Step 3: Log call
            self.call_history.append({
                "timestamp": datetime.now(),
                "farmer_id": farmer_id,
                "audio_file": audio_file_path,
                "transcription": transcription.text,
                "response": response.text,
                "action": response.action
            })
            
            return transcription.text, response
            
        except Exception as e:
            logger.error(f"Voice call handling failed: {str(e)}")
            raise
    
    def handle_voice_stream(self, audio_bytes: bytes, farmer_id: Optional[str] = None) -> Tuple[str, IVRResponse]:
        """
        Handle real-time voice stream (e.g., from Twilio, Asterisk)
        
        Args:
            audio_bytes: Audio data as bytes
            farmer_id: Optional farmer identifier
            
        Returns:
            Tuple of (transcribed_text, IVRResponse)
        """
        try:
            # Step 1: Transcribe stream
            logger.info("Transcribing audio stream...")
            transcription = self.transcriber.transcribe_audio_stream(audio_bytes)
            
            # Step 2: Process command
            logger.info("Processing voice command from stream...")
            response = self.processor.process_command(
                voice_text=transcription.text,
                farmer_id=farmer_id
            )
            
            # Step 3: Log call
            self.call_history.append({
                "timestamp": datetime.now(),
                "farmer_id": farmer_id,
                "stream": True,
                "transcription": transcription.text,
                "response": response.text,
                "action": response.action
            })
            
            return transcription.text, response
            
        except Exception as e:
            logger.error(f"Stream handling failed: {str(e)}")
            raise
    
    def get_call_history(self, farmer_id: Optional[str] = None, limit: int = 10):
        """Get call history"""
        if farmer_id:
            return [c for c in self.call_history if c.get("farmer_id") == farmer_id][-limit:]
        return self.call_history[-limit:]


# Example usage
if __name__ == "__main__":
    # Initialize IVR service
    try:
        ivr = IVRService()
        
        # Example: Process voice call from file
        # result_text, response = ivr.handle_voice_call(
        #     audio_file_path="farmer_call.mp3",
        #     farmer_id="FARMER_001"
        # )
        
        # print(f"Farmer said: {result_text}")
        # print(f"Assistant: {response.text}")
        # print(f"Action: {response.action}")
        
    except ValueError as e:
        print(f"Configuration error: {e}")
        print("Please set WHISPER_API_KEY and OPENAI_API_KEY in .env file")
