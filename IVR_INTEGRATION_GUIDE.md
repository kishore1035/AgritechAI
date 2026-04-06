# AgriTech AI - IVR (Interactive Voice Response) Integration

## Overview

The IVR system enables farmers to interact with AgriTech AI using voice calls and SMS. Farmers can:
- Get crop recommendations via phone
- Check soil health status
- Receive irrigation scheduling advice
- Plan crop rotation
- Get weather updates and alerts

All integrated with Whisper API (speech-to-text) and OpenAI (NLP).

---

## Architecture

```
Farmer Voice Call
       ↓
   Twilio (Phone Provider)
       ↓
   Twilio IVR Service
       ↓
   Whisper API (Transcription: Audio → Text)
       ↓
   IVR Service (Audio Processing)
       ↓
   Voice Command Processor (OpenAI LLM)
       ↓
   IVR Integration Orchestrator
       ↓
   ├─ Crop Recommendation Module
   ├─ Soil Health Module (soil-science)
   ├─ Water Management Module (SimSoil)
   ├─ Crop Rotation Module
   └─ Weather Alerts Module
       ↓
   Response Generation
       ↓
   Text-to-Speech (Twilio)
       ↓
   Farmer Hears Response
```

---

## Component Breakdown

### 1. IVR Service (`ivr_service.py`)

Core IVR functionality with 3 main classes:

#### WhisperTranscriber
Converts audio to text using OpenAI Whisper API.

```python
from src.modules.ivr_service import WhisperTranscriber

transcriber = WhisperTranscriber(
    api_key="your_api_key",
    language="en"  # or "hi" for Hindi
)

# Transcribe audio file
result = transcriber.transcribe_audio_file("farmer_call.mp3")
print(result.text)  # "What crops should I grow?"
print(result.duration)  # 12.5 seconds
```

#### VoiceCommandProcessor
Processes commands using OpenAI to understand farmer intent.

```python
from src.modules.ivr_service import VoiceCommandProcessor

processor = VoiceCommandProcessor(
    api_key="your_openai_key",
    model="gpt-4o-mini"
)

response = processor.process_command(
    voice_text="What crops should I grow?",
    farmer_id="FARMER_001"
)

print(response.text)  # AI-generated response
print(response.action)  # "continue", "transfer", or "end_call"
```

#### IVRService
Main orchestrator combining transcription + processing.

```python
from src.modules.ivr_service import IVRService, IVRConfig

config = IVRConfig()  # Reads from .env
ivr = IVRService(config)

# Handle voice call from file
transcription, response = ivr.handle_voice_call(
    audio_file_path="farmer_call.mp3",
    farmer_id="FARMER_001"
)

print(f"Farmer said: {transcription}")
print(f"IVR responds: {response.text}")

# Handle real-time audio stream
transcription, response = ivr.handle_voice_stream(
    audio_bytes=audio_bytes,
    farmer_id="FARMER_001"
)
```

---

### 2. IVR Integration (`ivr_integration.py`)

Routes voice commands to specific AgriTech modules.

#### IVRIntegrationOrchestrator
Main router that detects intent and delegates to handlers.

```python
from src.modules.ivr_integration import IVRIntegrationOrchestrator, FarmerProfile

# Create farmer profile
farmer = FarmerProfile(
    farmer_id="FARMER_001",
    name="Raj Kumar",
    region="Punjab",
    soil_type="loam",
    farm_size_hectares=5.0,
    primary_crops=["Wheat", "Rice"]
)

# Initialize orchestrator
orchestrator = IVRIntegrationOrchestrator()

# Route voice command
response = orchestrator.route_voice_intent(
    farmer_profile=farmer,
    voice_text="What crops should I grow?",
    context_data={
        'weather': {'temperature': 28, 'forecast': 'Sunny'},
        'soil_params': {'pH': 6.8, 'N': 150},
        'soil_moisture': 0.6
    }
)

print(response)
# "Based on your soil type and region, I recommend growing Wheat, Rice..."
```

#### Module Handlers

1. **IVRCropRecommendationIntegration** - Crop suggestion
2. **IVRSoilHealthIntegration** - Soil analysis
3. **IVRWaterManagementIntegration** - Irrigation scheduling
4. **IVRCropRotationIntegration** - Rotation planning
5. **IVRWeatherAlertsIntegration** - Weather updates

Voice intents detected:
- "What crops should I grow?" → Crop Recommendation
- "How is my soil?" → Soil Health
- "When to irrigate?" → Water Management
- "Crop rotation?" → Rotation Planning
- "Weather forecast?" → Weather Alerts

---

### 3. Twilio Integration (`twilio_ivr_integration.py`)

Connects IVR to real phone calls via Twilio.

#### Setup Steps

1. **Create Twilio Account**: https://www.twilio.com
2. **Get Credentials**:
   - Account SID
   - Auth Token
   - Phone Number (the IVR number farmers call)
3. **Configure Webhook**: Point Twilio incoming call to your `/incoming_call` endpoint
4. **Add to .env**:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

#### Usage

```python
from src.modules.ivr_service import IVRService, IVRConfig
from src.modules.twilio_ivr_integration import create_flask_app

# Initialize
ivr_service = IVRService(IVRConfig())
app = create_flask_app(ivr_service)

# Deploy with Gunicorn:
# gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/incoming_call` | POST | Handle incoming voice call |
| `/handle_menu_choice` | POST | Process menu selection (1-4) |
| `/process_voice_input` | POST | Process farmer's voice response |
| `/handle_followup` | POST | Handle follow-up menu |
| `/health` | GET | Health check |

#### Call Flow

```
1. Farmer calls AgriTech phone number
   ↓
2. /incoming_call endpoint triggered
   ↓
3. IVR greets and presents menu:
   "Press 1 for crop advice, 2 for soil health, 3 for water management, 4 for crop rotation"
   ↓
4. Farmer presses digit or speaks
   ↓
5. /handle_menu_choice or /process_voice_input triggered
   ↓
6. Voice processed through Whisper + OpenAI
   ↓
7. Response generated through module handlers
   ↓
8. Response played via text-to-speech
   ↓
9. Follow-up menu offered
```

---

## Voice Command Examples

### Example 1: Crop Recommendation

**Farmer**: "What should I plant? I have loam soil in Punjab."

**IVR Flow**:
1. Transcribe: "What should I plant? I have loam soil in Punjab."
2. Detect intent: Crop recommendation
3. Route to: IVRCropRecommendationIntegration
4. Extract features: soil_type=loam, region=Punjab
5. Call ML model: RandomForest crop predictor
6. Generate response: "I recommend Wheat, Rice, or Maize for your soil and region"
7. Speak: "I recommend Wheat, Rice, or Maize for your soil and region. These crops are well-suited for Punjab"

**Farmer**: "Press 1 or say 'Tell me more about Wheat'"

### Example 2: Irrigation Scheduling

**Farmer**: "My soil is very dry. When should I irrigate?"

**IVR Flow**:
1. Transcribe: "My soil is very dry"
2. Detect intent: Water management
3. Route to: IVRWaterManagementIntegration
4. Get context: soil_moisture=0.25, temp=32°C
5. Calculate need: "Soil very dry, urgent irrigation needed"
6. Generate response: "Irrigate immediately with 25mm water. Check back in 2 days"
7. Speak: "Your soil is very dry. Irrigate immediately with 25mm water. Check back in 2 days"

### Example 3: Soil Health

**Farmer**: "What's my soil pH?"

**IVR Flow**:
1. Transcribe: "What's my soil pH?"
2. Detect intent: Soil health
3. Route to: IVRSoilHealthIntegration
4. Get soil params: pH=6.8, N=150, P=80
5. Assess: "Good pH, excellent nitrogen"
6. Generate response: "Your soil pH is 6.8, which is excellent. Nitrogen levels are 150, very good."
7. Speak: "Your soil pH is 6.8, which is excellent. Nitrogen levels are very good."

---

## Setup & Configuration

### 1. Installation

```bash
# Install dependencies
pip install openai twilio flask pydantic python-dotenv

# For audio processing (optional)
pip install pydub librosa soundfile
```

### 2. Environment Setup

Create `.env` file (copy from `.env.example`):

```bash
# OpenAI Keys
WHISPER_API_KEY=sk-proj-XXXXXXX
OPENAI_API_KEY=sk-proj-YYYYYYY

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Configuration
IVR_MODEL=gpt-4o-mini
IVR_LANGUAGE=en
```

### 3. Get API Keys

**OpenAI/Whisper API**:
1. Go to https://platform.openai.com/account/api-keys
2. Create new API key
3. Add to `.env` as `OPENAI_API_KEY` and `WHISPER_API_KEY`

**Twilio**:
1. Go to https://www.twilio.com/console
2. Get Account SID and Auth Token
3. Get Twilio phone number
4. Add to `.env`

### 4. Deploy with Gunicorn

```bash
# Install Gunicorn
pip install gunicorn

# Run production server
gunicorn -w 4 -b 0.0.0.0:5000 twilio_ivr_integration:app

# With auto-reload
gunicorn -w 4 -b 0.0.0.0:5000 --reload twilio_ivr_integration:app
```

### 5. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers
2. Select your number
3. Under "Voice & Fax":
   - Set "A Call Comes In" webhook to: `https://yourdomain.com/incoming_call`
   - Method: HTTP POST
4. Save

---

## Cost Analysis

### OpenAI Costs (per minute of speech)

| Service | Rate | Example |
|---------|------|---------|
| Whisper | $0.02 / min | 5-min call = $0.10 |
| GPT-4o mini | $0.15 / 1M tokens | ~500 tokens per call = $0.00008 |
| Text-to-speech | $0.15 / 1M chars | 1000 chars = $0.00015 |

**Per-call cost**: ~$0.10 (dominated by Whisper)

### Twilio Costs (per minute)

| Component | Rate |
|-----------|------|
| Incoming calls | $0.0085 / min |
| Outgoing calls | $0.013 / min |
| SMS | $0.0075 per message |

**5-minute call**: $0.0425 (inbound)

**Total per 5-min call**: ~$0.14 (OpenAI + Twilio)

### Economics

- 100 calls/day × 5 min = $7/day = $210/month
- 1000 calls/day = $70/day = $2,100/month
- 10,000 calls/day = $700/day = $21,000/month

---

## Security Best Practices

### 1. API Key Protection

❌ **Never do this**:
```python
openai.api_key = "sk-proj-xxxxx"  # EXPOSED!
```

✅ **Do this**:
```python
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")  # From .env
```

### 2. .env File Management

```bash
# Add to .gitignore
echo ".env" >> .gitignore

# Copy template for other developers
cp .env.example .env.template
```

### 3. Rotate Compromised Keys

If keys are exposed:
1. Immediately regenerate in OpenAI/Twilio console
2. Update .env file
3. Restart services
4. Audit for unauthorized usage

### 4. Rate Limiting

Implement rate limiting to prevent abuse:

```python
from flask_limiter import Limiter

limiter = Limiter(app)

@app.route("/incoming_call", methods=["POST"])
@limiter.limit("100 per hour")  # 100 calls per hour per IP
def incoming_call():
    # ...
```

### 5. Call Recording Compliance

Before recording:
- ✅ Inform farmer: "This call may be recorded"
- ✅ Check local laws (India, US, etc.)
- ✅ Store securely with encryption
- ✅ Provide privacy policy

---

## Testing

### Test 1: Unit Test - Whisper Transcription

```python
import pytest
from src.modules.ivr_service import WhisperTranscriber

def test_transcribe_audio():
    transcriber = WhisperTranscriber(api_key="test_key")
    # Would need mock or test audio file
    # result = transcriber.transcribe_audio_file("test_audio.mp3")
    # assert "What crops" in result.text
```

### Test 2: Unit Test - Intent Detection

```python
from src.modules.ivr_integration import IVRIntegrationOrchestrator

def test_crop_recommendation_intent():
    orchestrator = IVRIntegrationOrchestrator()
    response = orchestrator.route_voice_intent(
        farmer_profile=farmer,
        voice_text="What should I plant?",
        context_data={}
    )
    assert "crop" in response.lower() or "plant" in response.lower()
```

### Test 3: Integration Test - Full Flow

```python
def test_full_voice_call_flow():
    # Mock audio file
    audio_path = "test_calls/farmer_question.mp3"
    
    # Process through full IVR
    ivr = IVRService()
    transcription, response = ivr.handle_voice_call(audio_path)
    
    # Verify response
    assert len(response.text) > 0
    assert response.action in ["continue", "transfer", "end_call"]
```

---

## Troubleshooting

### Issue 1: "API Key not configured"

**Solution**:
```bash
# Check .env file exists and has OPENAI_API_KEY
cat .env | grep OPENAI_API_KEY

# Verify key is active on https://platform.openai.com
```

### Issue 2: "Whisper API timeout"

**Solution**:
- Audio file too large → convert to MP3 (< 25MB)
- Network issue → retry with exponential backoff
- Rate limit → implement queue system

### Issue 3: "Twilio webhook not triggering"

**Solution**:
- Check webhook URL is public (not localhost)
- Verify webhook method is POST
- Check logs for errors
- Test with `curl -X POST https://yourdomain.com/incoming_call`

### Issue 4: "Inaccurate transcription"

**Solution**:
- Improve audio quality (reduce background noise)
- Specify language: `language="hi"` for Hindi
- Use context in prompt to help model
- Add voice activity detection (VAD)

---

## Future Enhancements

1. **Multi-language Support**
   - Hindi, Tamil, Telugu, Marathi
   - Language detection for automatic routing

2. **Advanced NLP**
   - Entity extraction (crop names, quantities)
   - Sentiment analysis (farmer satisfaction)
   - Dialog management for multi-turn conversations

3. **Integration Expansion**
   - Pest identification from photos
   - Price predictions from market data
   - Credit recommendations

4. **Analytics Dashboard**
   - Call volume trends
   - Most common questions
   - Farmer satisfaction scores
   - ROI tracking

5. **Accessibility**
   - WhatsApp integration
   - SMS-only mode for basic phones
   - USSD protocol for feature phones

---

## References

- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI Chat API](https://platform.openai.com/docs/guides/gpt)
- [Twilio Voice API](https://www.twilio.com/docs/voice)
- [TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Pydantic Documentation](https://docs.pydantic.dev)

---

## Support

For issues or questions:
- Check logs: `tail -f logs/ivr.log`
- Check API status: https://status.openai.com
- Contact Twilio support: https://support.twilio.com
