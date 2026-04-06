"""
AgriTech AI - IVR with Twilio Integration

Connects AgriTech IVR to Twilio for real voice calls.
Supports:
- Incoming voice calls from farmers
- SMS fallback
- Call recording and transcription
- Text-to-speech responses

Setup:
1. Install: pip install twilio flask
2. Set Twilio account SID and auth token in .env
3. Configure Twilio webhook URL to point to /incoming_call endpoint
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from urllib.parse import urljoin

from flask import Flask, request, render_string_response
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from pydantic import BaseModel

from ivr_service import IVRService, IVRConfig
from ivr_integration import IVRIntegrationOrchestrator, FarmerProfile


logger = logging.getLogger(__name__)


class TwilioConfig(BaseModel):
    """Twilio Configuration"""
    account_sid: str = ""
    auth_token: str = ""
    phone_number: str = ""  # Twilio phone number
    twiml_base_url: str = "https://yourdomain.com"
    
    class Config:
        env_file = ".env"


class TwilioIVRService:
    """
    Integrates AgriTech IVR with Twilio for real voice calls
    """
    
    def __init__(self, ivr_service: IVRService, twilio_config: Optional[TwilioConfig] = None):
        """
        Initialize Twilio IVR Service
        
        Args:
            ivr_service: AgriTech IVR service instance
            twilio_config: Twilio configuration
        """
        self.ivr_service = ivr_service
        self.twilio_config = twilio_config or TwilioConfig(
            account_sid=os.getenv("TWILIO_ACCOUNT_SID", ""),
            auth_token=os.getenv("TWILIO_AUTH_TOKEN", ""),
            phone_number=os.getenv("TWILIO_PHONE_NUMBER", "")
        )
        
        # Initialize Twilio client
        if not self.twilio_config.account_sid or not self.twilio_config.auth_token:
            raise ValueError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN not configured")
        
        self.client = Client(
            self.twilio_config.account_sid,
            self.twilio_config.auth_token
        )
        
        self.orchestrator = IVRIntegrationOrchestrator()
        self.farmer_database = {}  # In production: use database
        
        logger.info("Twilio IVR Service initialized")
    
    def handle_incoming_call(self, caller_number: str) -> str:
        """
        Handle incoming call from Twilio
        Returns TwiML response
        
        Args:
            caller_number: Caller's phone number
            
        Returns:
            TwiML XML response
        """
        logger.info(f"Incoming call from {caller_number}")
        
        response = VoiceResponse()
        
        # Get farmer info (lookup in database)
        farmer_profile = self._lookup_farmer(caller_number)
        
        if not farmer_profile:
            # Farmer not registered - send welcome message
            response.gather(
                num_digits=1,
                action="/handle_menu_choice",
                method="POST"
            ).say(
                "Welcome to AgriTech AI. Press 1 to get crop recommendations, "
                "2 for soil health, 3 for irrigation advice, or 4 to register.",
                language="en-IN"
            )
        else:
            # Registered farmer - offer services
            response.gather(
                num_digits=1,
                action="/handle_menu_choice",
                method="POST",
                timeout=10
            ).say(
                f"Hello {farmer_profile.name}. Press 1 for crop advice, "
                "2 for soil health, 3 for water management, or 4 for crop rotation.",
                language="en-IN"
            )
        
        return str(response)
    
    def handle_menu_choice(self, caller_number: str, digit: str) -> str:
        """
        Handle menu selection from caller
        
        Args:
            caller_number: Caller's phone number
            digit: Menu selection (1-4)
            
        Returns:
            TwiML response with appropriate action
        """
        logger.info(f"Menu choice from {caller_number}: {digit}")
        
        response = VoiceResponse()
        farmer_profile = self._lookup_farmer(caller_number)
        
        if not farmer_profile:
            response.say("I need to register you first. Hanging up.")
            return str(response)
        
        # Map menu choices to voices prompts
        if digit == "1":
            response.gather(
                num_digits=1,
                action="/process_voice_input",
                method="POST",
                timeout=15
            ).say(
                "Please tell me what crops you're interested in growing.",
                language="en-IN"
            )
        
        elif digit == "2":
            response.gather(
                num_digits=1,
                action="/process_voice_input",
                method="POST",
                timeout=15
            ).say(
                "Please tell me about your soil or ask about soil health.",
                language="en-IN"
            )
        
        elif digit == "3":
            response.gather(
                num_digits=1,
                action="/process_voice_input",
                method="POST",
                timeout=15
            ).say(
                "Please tell me about your water needs or irrigation questions.",
                language="en-IN"
            )
        
        elif digit == "4":
            response.gather(
                num_digits=1,
                action="/process_voice_input",
                method="POST",
                timeout=15
            ).say(
                "Tell me about your current crops and I'll suggest a rotation plan.",
                language="en-IN"
            )
        
        else:
            response.say("Invalid choice. Hanging up.")
        
        return str(response)
    
    def process_voice_input(self, caller_number: str, 
                           speech_text: str, recorded_url: Optional[str] = None) -> str:
        """
        Process voice input from farmer
        
        Args:
            caller_number: Caller's phone number
            speech_text: Transcribed speech (from Twilio Speech Recognition)
            recorded_url: URL to recorded audio if using transcription
            
        Returns:
            TwiML response with answer
        """
        logger.info(f"Processing voice input from {caller_number}: {speech_text}")
        
        response = VoiceResponse()
        farmer_profile = self._lookup_farmer(caller_number)
        
        if not farmer_profile:
            response.say("Registration required. Hanging up.")
            return str(response)
        
        try:
            # Get context data for farmer
            context_data = self._get_farmer_context(farmer_profile)
            
            # Route through orchestrator
            answer = self.orchestrator.route_voice_intent(
                farmer_profile=farmer_profile,
                voice_text=speech_text,
                context_data=context_data
            )
            
            # Speak the answer
            response.say(answer, language="en-IN")
            
            # Offer follow-up menu
            response.gather(
                num_digits=1,
                action="/handle_followup",
                method="POST",
                timeout=5
            ).say(
                "Press 1 to ask another question, 2 to speak with an agent, or hang up to end.",
                language="en-IN"
            )
            
            # Log interaction
            self._log_interaction(farmer_profile.farmer_id, speech_text, answer)
            
        except Exception as e:
            logger.error(f"Error processing voice input: {str(e)}")
            response.say("Sorry, I encountered an error. Please try again.")
        
        return str(response)
    
    def send_sms_alert(self, farmer_phone: str, message: str) -> bool:
        """
        Send SMS alert to farmer
        
        Args:
            farmer_phone: Farmer's phone number
            message: Message to send
            
        Returns:
            True if successful
        """
        try:
            self.client.messages.create(
                body=message,
                from_=self.twilio_config.phone_number,
                to=farmer_phone
            )
            logger.info(f"SMS sent to {farmer_phone}")
            return True
        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return False
    
    def send_sms_reminder(self, farmer_phone: str, reminder_type: str) -> bool:
        """
        Send contextual SMS reminder to farmer
        
        Args:
            farmer_phone: Farmer's phone number
            reminder_type: Type of reminder (irrigation, planting, harvest, etc.)
            
        Returns:
            True if successful
        """
        messages = {
            "irrigation": "Remember to check soil moisture and irrigate if needed. Reply with your soil condition.",
            "planting": "It's the right season to plant. Check weather forecast before planting.",
            "harvest": "Your crop is nearing harvest. Prepare your equipment and storage.",
            "fertilizer": "It's time to apply fertilizer. Contact us for recommendations.",
            "pest": "Watch for pests in your area. Use recommended prevention methods."
        }
        
        message = messages.get(reminder_type, "Reminder from AgriTech AI.")
        return self.send_sms_alert(farmer_phone, message)
    
    def _lookup_farmer(self, phone_number: str) -> Optional[FarmerProfile]:
        """
        Lookup farmer in database by phone number
        In production: query actual database
        """
        # Mock database lookup
        if phone_number in self.farmer_database:
            return self.farmer_database[phone_number]
        return None
    
    def _get_farmer_context(self, farmer_profile: FarmerProfile) -> Dict[str, Any]:
        """Get farmer's current context data"""
        # In production: fetch from database/API
        return {
            'weather': {
                'temperature': 28,
                'forecast': 'Sunny',
                'rainfall_mm': 0
            },
            'soil_params': {
                'pH': 6.8,
                'N': 150,
                'P': 80,
                'K': 120
            },
            'soil_moisture': 0.6,
            'last_irrigation': '2 days ago'
        }
    
    def _log_interaction(self, farmer_id: str, input_text: str, response_text: str):
        """Log IVR interaction for analytics"""
        logger.info(f"Interaction logged - Farmer: {farmer_id}")
        # In production: save to database for analytics


def create_flask_app(ivr_service: IVRService) -> Flask:
    """
    Create Flask app with Twilio webhooks
    
    Args:
        ivr_service: AgriTech IVR service
        
    Returns:
        Flask application
    """
    app = Flask(__name__)
    twilio_ivr = TwilioIVRService(ivr_service)
    
    @app.route("/incoming_call", methods=["POST"])
    def incoming_call():
        """Handle incoming call"""
        caller_number = request.values.get("From", "")
        return twilio_ivr.handle_incoming_call(caller_number), 200, {
            "Content-Type": "text/xml"
        }
    
    @app.route("/handle_menu_choice", methods=["POST"])
    def handle_menu_choice():
        """Handle menu selection"""
        caller_number = request.values.get("From", "")
        digits = request.values.get("Digits", "")
        return twilio_ivr.handle_menu_choice(caller_number, digits), 200, {
            "Content-Type": "text/xml"
        }
    
    @app.route("/process_voice_input", methods=["POST"])
    def process_voice_input():
        """Process voice input"""
        caller_number = request.values.get("From", "")
        speech_text = request.values.get("SpeechResult", "")
        recorded_url = request.values.get("RecordingUrl", None)
        
        return twilio_ivr.process_voice_input(
            caller_number, speech_text, recorded_url
        ), 200, {
            "Content-Type": "text/xml"
        }
    
    @app.route("/handle_followup", methods=["POST"])
    def handle_followup():
        """Handle follow-up menu"""
        caller_number = request.values.get("From", "")
        digits = request.values.get("Digits", "")
        
        response = VoiceResponse()
        
        if digits == "1":
            response.say("You can ask me any agricultural question.")
            response.redirect("/handle_menu_choice")
        elif digits == "2":
            response.say("Connecting you to an agent.")
            response.dial("+1234567890")  # Agent phone number
        else:
            response.hangup()
        
        return str(response), 200, {"Content-Type": "text/xml"}
    
    @app.route("/health", methods=["GET"])
    def health():
        """Health check endpoint"""
        return {"status": "healthy", "timestamp": datetime.now().isoformat()}, 200
    
    return app


if __name__ == "__main__":
    # This is for development only
    # For production: use Gunicorn or similar WSGI server
    
    # Initialize IVR service
    ivr_config = IVRConfig()
    ivr_service = IVRService(ivr_config)
    
    # Create Flask app
    app = create_flask_app(ivr_service)
    
    # Run development server
    app.run(host="0.0.0.0", port=5000, debug=True)
