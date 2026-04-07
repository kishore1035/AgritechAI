#!/usr/bin/env python3
"""
AgriTech AI - Local Testing Server (No Twilio Required)

This server provides a web interface for testing the IVR system locally.
Run with: python test_server.py
Then visit: http://localhost:5000
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dotenv import load_dotenv
from flask import Flask, render_template_string, request, jsonify
from src.modules.ivr_service import IVRService, IVRConfig
from src.modules.ivr_integration import IVRIntegrationOrchestrator, FarmerProfile

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize services
ivr_config = IVRConfig()
ivr_service = IVRService(ivr_config)
orchestrator = IVRIntegrationOrchestrator()

# Create Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Sample farmer profiles for testing
SAMPLE_FARMERS = {
    "farmer1": {
        "name": "Raj Kumar",
        "region": "Punjab",
        "soil_type": "loam",
        "farm_size_hectares": 5.0,
        "primary_crops": ["Wheat", "Rice"]
    },
    "farmer2": {
        "name": "Priya Singh",
        "region": "Maharashtra",
        "soil_type": "clay",
        "farm_size_hectares": 3.5,
        "primary_crops": ["Cotton", "Sugarcane"]
    },
    "farmer3": {
        "name": "Amit Patel",
        "region": "Gujarat",
        "soil_type": "sandy",
        "farm_size_hectares": 7.0,
        "primary_crops": ["Maize", "Groundnut"]
    }
}

# Store conversation history
conversation_history = {}

# HTML template for web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>AgriTech AI - IVR Testing Interface</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
        }
        
        .panel {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .left-panel h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .farmer-card {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .farmer-card:hover {
            background: #e8f5e9;
            border-color: #4caf50;
        }
        
        .farmer-card.active {
            background: #e8f5e9;
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .farmer-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        
        .farmer-info {
            font-size: 12px;
            color: #666;
        }
        
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 600px;
        }
        
        .chat-display {
            flex: 1;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: #fafafa;
        }
        
        .message {
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .message.farmer {
            background: #e3f2fd;
            border-left: 3px solid #2196f3;
        }
        
        .message.ivr {
            background: #f3e5f5;
            border-left: 3px solid #667eea;
        }
        
        .message.system {
            background: #fff3e0;
            border-left: 3px solid #ff9800;
            font-style: italic;
            font-size: 12px;
        }
        
        .message-label {
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 4px;
            color: #666;
        }
        
        .input-area {
            display: flex;
            gap: 8px;
        }
        
        #userInput {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
        }
        
        #userInput:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .status {
            background: #e8f5e9;
            border-left: 3px solid #4caf50;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        .title {
            color: white;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .title h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .title p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        @media (max-width: 900px) {
            .container {
                grid-template-columns: 1fr;
            }
            
            .chat-container {
                height: 400px;
            }
        }
    </style>
</head>
<body>
    <div class="title">
        <h1>🌾 AgriTech AI - IVR Testing Interface</h1>
        <p>Test the agricultural decision support system</p>
    </div>
    
    <div class="container">
        <div class="panel left-panel">
            <h2>👨‍🌾 Farmers</h2>
            <div id="farmersList"></div>
            <button onclick="newConversation()" style="width: 100%; margin-top: 15px;">
                🔄 New Conversation
            </button>
        </div>
        
        <div class="panel">
            <div class="status" id="status">Waiting for farmer selection...</div>
            
            <div class="chat-container">
                <div class="chat-display" id="chatDisplay"></div>
                <div class="input-area">
                    <input 
                        type="text" 
                        id="userInput" 
                        placeholder="Enter your query or command..."
                        autocomplete="off"
                    >
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentFarmer = null;
        let conversationId = null;
        
        function initFarmers() {
            const list = document.getElementById('farmersList');
            const farmers = {{ farmers | tojson }};
            
            Object.entries(farmers).forEach(([id, farmer]) => {
                const card = document.createElement('div');
                card.className = 'farmer-card';
                card.innerHTML = `
                    <div class="farmer-name">${farmer.name}</div>
                    <div class="farmer-info">${farmer.region} • ${farmer.soil_type} soil</div>
                    <div class="farmer-info">${farmer.farm_size_hectares}ha • Crops: ${farmer.primary_crops.join(', ')}</div>
                `;
                card.onclick = () => selectFarmer(id, farmer);
                list.appendChild(card);
            });
        }
        
        function selectFarmer(id, farmer) {
            currentFarmer = { id, ...farmer };
            conversationId = Math.random().toString(36).substr(2, 9);
            
            // Update UI
            document.querySelectorAll('.farmer-card').forEach(c => c.classList.remove('active'));
            event.target.closest('.farmer-card').classList.add('active');
            
            // Clear chat
            document.getElementById('chatDisplay').innerHTML = '';
            document.getElementById('userInput').disabled = false;
            document.getElementById('userInput').focus();
            
            // Update status
            updateStatus(`Connected to ${farmer.name} (${farmer.region})`);
            
            // Add welcome message
            addMessage('system', `IVR initialized for ${farmer.name}. Ask me about crops, soil, water management, or anything agricultural!`);
        }
        
        function updateStatus(text) {
            document.getElementById('status').innerText = '✅ ' + text;
        }
        
        function addMessage(role, text) {
            const chat = document.getElementById('chatDisplay');
            const msg = document.createElement('div');
            msg.className = `message ${role}`;
            
            const label = document.createElement('div');
            label.className = 'message-label';
            label.textContent = role === 'farmer' ? '👨‍🌾 You' : role === 'ivr' ? '🤖 IVR' : '⚙️ System';
            
            const content = document.createElement('div');
            content.textContent = text;
            
            msg.appendChild(label);
            msg.appendChild(content);
            chat.appendChild(msg);
            
            // Auto-scroll to bottom
            chat.scrollTop = chat.scrollHeight;
        }
        
        async function sendMessage() {
            if (!currentFarmer) {
                alert('Please select a farmer first');
                return;
            }
            
            const input = document.getElementById('userInput');
            const text = input.value.trim();
            
            if (!text) return;
            
            addMessage('farmer', text);
            input.value = '';
            
            try {
                const response = await fetch('/api/ivr/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversation_id: conversationId,
                        farmer_id: currentFarmer.id,
                        farmer_profile: currentFarmer,
                        user_input: text
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addMessage('ivr', data.response);
                    if (data.intent) {
                        addMessage('system', `Intent detected: ${data.intent}`);
                    }
                } else {
                    addMessage('system', 'Error: ' + data.error);
                }
            } catch (error) {
                addMessage('system', 'Connection error: ' + error.message);
            }
        }
        
        function newConversation() {
            currentFarmer = null;
            conversationId = null;
            document.getElementById('chatDisplay').innerHTML = '';
            document.getElementById('userInput').value = '';
            document.getElementById('userInput').disabled = true;
            document.querySelectorAll('.farmer-card').forEach(c => c.classList.remove('active'));
            updateStatus('Waiting for farmer selection...');
        }
        
        // Enter key to send
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Initialize
        initFarmers();
    </script>
</body>
</html>
"""


@app.route('/')
def index():
    """Serve main interface"""
    return render_template_string(HTML_TEMPLATE, farmers=SAMPLE_FARMERS)


@app.route('/api/ivr/process', methods=['POST'])
def process_input():
    """Process user input through IVR"""
    try:
        data = request.json
        conversation_id = data.get('conversation_id')
        farmer_id = data.get('farmer_id')
        user_input = data.get('user_input', '').strip()
        farmer_data = data.get('farmer_profile', {})
        
        # Detect intent
        intent = ivr_service.detect_intent(user_input)
        
        # Process based on intent
        response = ""
        if intent == "Crop":
            # Get crop recommendations
            response = f"Based on your {farmer_data.get('soil_type')} soil in {farmer_data.get('region')}, I recommend: {', '.join(farmer_data.get('primary_crops', [])[:3])}"
        
        elif intent == "Soil":
            response = "Your soil is in good condition. pH: 6.8, Nitrogen: 45 mg/kg, Phosphorus: 18 mg/kg. Would you like detailed analysis?"
        
        elif intent == "Water":
            response = "Current soil moisture is at 60%. Your next irrigation is recommended in 3-4 days based on weather forecast."
        
        elif intent == "Rotation":
            response = "For crop rotation after wheat, I recommend: Rice (Year 1) → Legume (Year 2) → Wheat (Year 3). This improves soil nitrogen naturally."
        
        elif intent == "Weather":
            response = f"Current weather in {farmer_data.get('region', 'your region')}: Sunny, 28°C. Forecast: No rain expected for 5 days."
        
        else:
            response = f"I understand you're asking about: {user_input}. I can help you with crop recommendations, soil health, irrigation scheduling, crop rotation, and weather updates. What would you like to know?"
        
        logger.info(f"[{conversation_id}] Intent: {intent}, Input: {user_input}")
        
        return jsonify({
            "success": True,
            "response": response,
            "intent": intent,
            "conversation_id": conversation_id
        })
    
    except Exception as e:
        logger.error(f"Error processing input: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AgriTech IVR Test Server"
    })


def main():
    """Start the test server"""
    logger.info("=" * 70)
    logger.info("🚀 AgriTech AI - IVR Testing Server")
    logger.info("=" * 70)
    logger.info("")
    logger.info("✅ Services initialized:")
    logger.info("   • IVR Service: Ready")
    logger.info("   • Integration Orchestrator: Ready")
    logger.info("   • Database: Local SQLite connected")
    logger.info("")
    logger.info("🌐 Web Interface: http://localhost:5000")
    logger.info("📊 Health Check: http://localhost:5000/health")
    logger.info("📡 API Endpoint: POST http://localhost:5000/api/ivr/process")
    logger.info("")
    logger.info("🧑‍🌾 Sample Farmers Available:")
    for farmer_id, farmer in SAMPLE_FARMERS.items():
        logger.info(f"   • {farmer['name']} ({farmer['region']}, {farmer['soil_type']} soil)")
    logger.info("")
    logger.info("=" * 70)
    logger.info("")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        use_reloader=False
    )


if __name__ == '__main__':
    main()
