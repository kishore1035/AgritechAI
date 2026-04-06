#!/usr/bin/env python3
"""
AgriTech AI - IVR Server Startup Script

This script starts the IVR server with all components.
Run with: python run_ivr.py
"""

import os
import sys
import logging
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dotenv import load_dotenv
from src.modules.ivr_service import IVRService, IVRConfig
from src.modules.twilio_ivr_integration import create_flask_app

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_environment():
    """Check if all required environment variables are set"""
    required_keys = [
        'OPENAI_API_KEY',
        'WHISPER_API_KEY',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER'
    ]
    
    missing = []
    for key in required_keys:
        if not os.getenv(key) or os.getenv(key).startswith('replace-'):
            missing.append(key)
    
    if missing:
        logger.warning(f"⚠️  Missing or placeholder values for: {', '.join(missing)}")
        logger.info("Please set these in .env file")
        logger.info("Quick setup:")
        logger.info("1. Get OpenAI key from https://platform.openai.com/account/api-keys")
        logger.info("2. Get Twilio credentials from https://console.twilio.com")
        logger.info("3. Update .env file")
        logger.info("4. Restart server")
        return False
    return True


def main():
    """Start the IVR server"""
    logger.info("🚀 Starting AgriTech AI - IVR Server")
    
    try:
        # Check environment
        logger.info("🔍 Checking environment configuration...")
        env_ok = check_environment()
        
        if not env_ok:
            logger.warning("⚠️  Running in DEMO mode with placeholder API keys")
            logger.warning("Production deployment requires valid API keys")
        
        # Initialize IVR service
        logger.info("📱 Initializing IVR Service...")
        config = IVRConfig()
        ivr_service = IVRService(config) if env_ok else None
        
        # Create Flask app
        logger.info("🌐 Creating Flask application...")
        if env_ok:
            app = create_flask_app(ivr_service)
            logger.info("✅ Flask app created successfully")
        else:
            logger.warning("⚠️  Skipping Flask creation due to missing credentials")
            logger.info("Once you add credentials to .env, restart the server")
            return
        
        # Print startup info
        logger.info("=" * 60)
        logger.info("✅ AgriTech AI - IVR Server Ready")
        logger.info("=" * 60)
        logger.info("")
        logger.info("📊 Configuration:")
        logger.info(f"  • Model: {config.model}")
        logger.info(f"  • Language: {config.language}")
        logger.info(f"  • Debug: {config.debug}")
        logger.info("")
        logger.info("🌐 Endpoints:")
        logger.info("  • GET  /health                 - Health check")
        logger.info("  • POST /incoming_call          - Incoming voice call")
        logger.info("  • POST /handle_menu_choice     - Handle menu selection")
        logger.info("  • POST /process_voice_input    - Process voice input")
        logger.info("  • POST /handle_followup        - Handle follow-up")
        logger.info("")
        logger.info("🔗 Twilio Configuration:")
        logger.info("  1. Go to https://console.twilio.com")
        logger.info("  2. Select your phone number")
        logger.info("  3. Set 'A Call Comes In' webhook to:")
        logger.info("     http://yourdomain.com/incoming_call")
        logger.info("  4. Method: HTTP POST")
        logger.info("")
        logger.info("📱 Test Locally:")
        logger.info("  • Use ngrok: ngrok http 5000")
        logger.info("  • Then use ngrok URL in Twilio webhook")
        logger.info("")
        logger.info("🚀 Running on http://0.0.0.0:5000")
        logger.info("=" * 60)
        logger.info("")
        
        # Run the app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False
        )
        
    except Exception as e:
        logger.error(f"❌ Error starting server: {str(e)}")
        logger.exception("Full traceback:")
        sys.exit(1)


if __name__ == '__main__':
    main()
