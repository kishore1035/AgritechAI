# AgriTech AI - IVR Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
pip install -r requirements-ivr.txt
```

### 2. Set Up Environment Variables
```bash
# Create .env file
OPENAI_API_KEY=sk-proj-xxxxx
WHISPER_API_KEY=sk-proj-yyyyy
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=authtoken
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Test Locally
```python
from src.modules.ivr_service import IVRService, IVRConfig

ivr = IVRService(IVRConfig())

# Test with audio file
transcription, response = ivr.handle_voice_call("test_audio.mp3")
print(f"Farmer: {transcription}")
print(f"IVR: {response.text}")
```

### 4. Deploy
```bash
gunicorn -w 4 -b 0.0.0.0:5000 src.modules.twilio_ivr_integration:app
```

---

## 📞 Voice Command Patterns

| Intent | Example Phrases | Detected By |
|--------|-----------------|-------------|
| **Crop Recommendation** | "What should I plant?", "Recommend crops", "What to grow?" | Keywords: crop, plant, grow, recommend |
| **Soil Health** | "How is my soil?", "Check pH", "Soil status" | Keywords: soil, health, pH, nitrogen |
| **Water Management** | "When irrigate?", "Is soil dry?", "Need water?" | Keywords: water, irrigate, moisture, dry |
| **Crop Rotation** | "Rotation plan?", "Next season crops?", "Rotate my field" | Keywords: rotation, rotate, next year, next season |
| **Weather** | "What's weather?", "Rain forecast?", "Temperature?" | Keywords: weather, rain, forecast, temperature |

---

## 🔗 API Endpoints

### Incoming Call
```http
POST /incoming_call
From: +1234567890
```
**Response**: TwiML with menu prompt

### Handle Menu Choice
```http
POST /handle_menu_choice
From: +1234567890
Digits: 1|2|3|4
```
**Response**: TwiML with follow-up prompt

### Process Voice Input
```http
POST /process_voice_input
From: +1234567890
SpeechResult: "What crops should I plant?"
```
**Response**: TwiML with answer

### Health Check
```http
GET /health
```
**Response**: `{"status": "healthy", "timestamp": "2026-04-07T10:30:00"}`

---

## 💻 Code Examples

### Example 1: Simple Voice Call Processing
```python
from src.modules.ivr_service import IVRService, IVRConfig

# Initialize
config = IVRConfig()
ivr = IVRService(config)

# Process call
transcription, response = ivr.handle_voice_call(
    audio_file_path="farmer_call.mp3",
    farmer_id="FARMER_001"
)

print(f"Transcription: {transcription.text}")
print(f"Response: {response.text}")
print(f"Action: {response.action}")
```

### Example 2: Route Voice Intent
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
        'weather': {'temperature': 28, 'rainfall_mm': 0},
        'soil_params': {'pH': 6.8, 'N': 150},
        'soil_moisture': 0.6
    }
)

print(response)
```

### Example 3: Flask Webhook
```python
from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse
from src.modules.ivr_service import IVRService
from src.modules.twilio_ivr_integration import TwilioIVRService

app = Flask(__name__)
ivr = IVRService()
twilio_ivr = TwilioIVRService(ivr)

@app.route("/incoming_call", methods=["POST"])
def incoming_call():
    caller = request.values.get("From")
    return twilio_ivr.handle_incoming_call(caller), 200, {"Content-Type": "text/xml"}

if __name__ == "__main__":
    app.run(debug=True)
```

---

## 🔧 Configuration Options

### IVRConfig Parameters
```python
class IVRConfig(BaseModel):
    whisper_api_key: str          # OpenAI Whisper key
    openai_api_key: str           # OpenAI GPT key
    model: str = "gpt-4o-mini"   # LLM model
    language: str = "en"          # Language (en, hi, etc.)
    max_call_duration: int = 3600 # Max call in seconds
    debug: bool = False           # Debug logging
```

### TwilioConfig Parameters
```python
class TwilioConfig(BaseModel):
    account_sid: str       # Twilio account SID
    auth_token: str        # Twilio auth token
    phone_number: str      # Twilio phone number
    twiml_base_url: str    # Base URL for webhooks
```

---

## 📊 Monitoring

### Check Call History
```python
# Get all calls for a farmer
history = ivr.get_call_history(farmer_id="FARMER_001", limit=10)

for call in history:
    print(f"Time: {call['timestamp']}")
    print(f"Said: {call['transcription']}")
    print(f"Response: {call['response']}")
    print(f"Action: {call['action']}")
```

### Log Levels
```python
import logging

logging.basicConfig(level=logging.DEBUG)  # Show all logs
logging.basicConfig(level=logging.INFO)   # Production
logging.basicConfig(level=logging.WARNING) # Errors only
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"API Key not configured"** | Check .env file has OPENAI_API_KEY & WHISPER_API_KEY |
| **"Whisper timeout"** | Reduce audio size, use MP3 format, check network |
| **"Twilio webhook not called"** | Verify webhook URL is public, check logs |
| **"Inaccurate transcription"** | Specify language parameter, improve audio quality |
| **"Slow response"** | Check API rate limits, optimize prompt |

---

## 📈 Performance Metrics

### Target Metrics
- **Call Success Rate**: >95%
- **Transcription Accuracy**: >85%
- **Response Time**: <2 seconds
- **Farmer NPS**: >60

### Monitor with
```python
import time

start = time.time()
response = orchestrator.route_voice_intent(...)
elapsed = time.time() - start

print(f"Response time: {elapsed:.2f}s")
```

---

## 🔐 Security Checklist

- [ ] .env file in .gitignore
- [ ] API keys rotated in last 90 days
- [ ] HTTPS enforced (production)
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive data
- [ ] Call recordings encrypted
- [ ] Privacy policy published
- [ ] Consent obtained before recording

---

## 📚 File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `src/modules/ivr_service.py` | Core IVR + Whisper integration | 350+ |
| `src/modules/ivr_integration.py` | Module routing + handlers | 300+ |
| `src/modules/twilio_ivr_integration.py` | Twilio webhooks + voice calls | 250+ |
| `IVR_INTEGRATION_GUIDE.md` | Complete documentation | 400+ |
| `IVR_INTEGRATION_COMPLETE.md` | Project summary | 250+ |
| `requirements-ivr.txt` | Dependencies | 30+ |

---

## 🎯 Success Criteria

### Phase 1 (Week 1-2)
- [ ] System deployed to production
- [ ] 10 test farmers on-boarded
- [ ] <2% error rate
- [ ] Transcription accuracy >85%

### Phase 2 (Week 3-4)
- [ ] 50 farmers on pilot
- [ ] NPS >50
- [ ] <1% error rate
- [ ] SMS alerts working

### Phase 3 (Month 2)
- [ ] 500 farmers active
- [ ] NPS >60
- [ ] Revenue break-even
- [ ] Multi-language support

---

## 📞 Support Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Flask Docs**: https://flask.palletsprojects.com
- **Pydantic Docs**: https://docs.pydantic.dev
- **GitHub Issues**: Report bugs with full error message

---

## 💡 Pro Tips

1. **Voice Quality**: Ask farmers to call from quiet environment
2. **API Cost**: Pre-calculate costs for volume pricing
3. **Error Recovery**: Repeat request if transcription confidence <70%
4. **User Experience**: Keep responses <30 seconds (fits on one call prompt)
5. **Analytics**: Log all calls for quality monitoring
6. **Language**: Support local languages for higher adoption
7. **Testing**: Use ngrok for local Twilio webhook testing:
   ```bash
   ngrok http 5000  # Creates public URL
   ```
8. **Rate Limiting**: Implement per-farmer quotas:
   ```python
   @limiter.limit("10 calls per hour per farmer")
   ```

---

## 🚀 One-Line Commands

```bash
# Install & test
pip install -r requirements-ivr.txt && python -c "from src.modules.ivr_service import IVRService; print('✅ IVR Ready')"

# Run locally
python -m flask --app src.modules.twilio_ivr_integration run

# Deploy
gunicorn -w 4 -b 0.0.0.0:5000 src.modules.twilio_ivr_integration:app

# Test endpoint
curl -X POST http://localhost:5000/health

# Check logs
tail -f logs/ivr.log
```

---

**Last Updated**: April 7, 2026  
**Status**: Production Ready ✅  
**Version**: 1.0.0
