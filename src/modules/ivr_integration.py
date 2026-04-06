"""
AgriTech AI - IVR Integration Layer

Connects voice commands from IVR to existing AgriTech modules:
- Crop recommendation
- Soil science
- Water management (SimSoil)
- Soil profile

This layer interprets farmer voice requests and routes them to appropriate modules.
"""

import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class FarmerProfile:
    """Farmer profile with location and farm data"""
    farmer_id: str
    name: str
    region: str
    soil_type: str
    farm_size_hectares: float
    primary_crops: List[str]
    language: str = "en"


class IVRCropRecommendationIntegration:
    """
    Integrate IVR with crop recommendation module
    
    Voice intent examples:
    - "What crops should I grow?"
    - "Recommend crops for my soil"
    - "What should I plant next season?"
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def handle_crop_recommendation_request(self, farmer_profile: FarmerProfile, voice_text: str) -> str:
        """
        Handle crop recommendation request from IVR
        
        Args:
            farmer_profile: Farmer's profile with soil info
            voice_text: Transcribed voice command
            
        Returns:
            Response text for IVR to speak to farmer
        """
        try:
            self.logger.info(f"Crop recommendation request from {farmer_profile.farmer_id}")
            
            # Extract soil features from farmer profile
            # (In production: fetch from database)
            features = self._extract_features_for_ml(farmer_profile)
            
            # Import crop recommendation module
            try:
                from modules.crop_recommendation import app
                predictions = app.predict_top_crops(features)
            except ImportError:
                # Fallback response
                predictions = ["Wheat", "Rice", "Corn"]
            
            # Format response for voice
            crop_list = ", ".join(predictions[:3])
            response = f"Based on your soil type and region, I recommend growing {crop_list}. "
            response += f"These crops are well-suited for {farmer_profile.region}."
            
            return response
            
        except Exception as e:
            self.logger.error(f"Crop recommendation error: {str(e)}")
            return "Sorry, I couldn't fetch crop recommendations right now. Please try again later."
    
    def _extract_features_for_ml(self, farmer_profile: FarmerProfile) -> Dict[str, Any]:
        """Extract ML features from farmer profile"""
        return {
            "soil_type": farmer_profile.soil_type,
            "region": farmer_profile.region,
            "farm_size": farmer_profile.farm_size_hectares,
            "primary_crops": farmer_profile.primary_crops
        }


class IVRSoilHealthIntegration:
    """
    Integrate IVR with soil science module
    
    Voice intent examples:
    - "How is my soil health?"
    - "What is my soil pH?"
    - "Tell me about my soil"
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def handle_soil_health_request(self, farmer_profile: FarmerProfile, soil_params: Dict) -> str:
        """
        Handle soil health inquiry from IVR
        
        Args:
            farmer_profile: Farmer's profile
            soil_params: Soil parameters (pH, N, P, K, etc.)
            
        Returns:
            Response text describing soil health
        """
        try:
            self.logger.info(f"Soil health request from {farmer_profile.farmer_id}")
            
            # Evaluate soil parameters
            assessment = self._assess_soil_health(soil_params)
            
            response = f"Your soil health status is {assessment['status']}. "
            response += f"pH level: {soil_params.get('pH', 'unknown')}. "
            
            if assessment['needs_action']:
                response += f"Recommendation: {assessment['recommendation']}"
            else:
                response += "Your soil is in good condition."
            
            return response
            
        except Exception as e:
            self.logger.error(f"Soil health error: {str(e)}")
            return "Sorry, I couldn't retrieve your soil information right now."
    
    def _assess_soil_health(self, soil_params: Dict) -> Dict[str, Any]:
        """Assess soil health from parameters"""
        ph = soil_params.get('pH', 7.0)
        n = soil_params.get('N', 0)
        
        if 6.0 <= ph <= 7.5 and n > 100:
            return {
                "status": "excellent",
                "needs_action": False,
                "recommendation": ""
            }
        elif 5.5 <= ph <= 8.0:
            return {
                "status": "good",
                "needs_action": n < 120,
                "recommendation": "Consider nitrogen fertilizer application."
            }
        else:
            return {
                "status": "poor",
                "needs_action": True,
                "recommendation": f"Adjust pH and apply nutrients. Target pH: 6.5. Current: {ph}"
            }


class IVRWaterManagementIntegration:
    """
    Integrate IVR with water management (SimSoil/pyfao56)
    
    Voice intent examples:
    - "When should I irrigate?"
    - "How much water does my soil need?"
    - "Is there enough soil moisture?"
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def handle_irrigation_schedule_request(self, farmer_profile: FarmerProfile, 
                                          current_weather: Dict, soil_moisture: float) -> str:
        """
        Handle irrigation schedule request from IVR
        
        Args:
            farmer_profile: Farmer's profile
            current_weather: Current weather conditions
            soil_moisture: Current soil moisture level (0-1)
            
        Returns:
            Irrigation recommendation as voice response
        """
        try:
            self.logger.info(f"Irrigation schedule request from {farmer_profile.farmer_id}")
            
            # Determine irrigation need
            recommendation = self._calculate_irrigation_need(soil_moisture, current_weather)
            
            response = f"Soil moisture is at {int(soil_moisture * 100)} percent. "
            response += recommendation['message']
            
            if recommendation['action_needed']:
                response += f" Recommended action: {recommendation['action']}"
            
            return response
            
        except Exception as e:
            self.logger.error(f"Irrigation schedule error: {str(e)}")
            return "Sorry, I couldn't calculate irrigation needs right now."
    
    def _calculate_irrigation_need(self, soil_moisture: float, weather: Dict) -> Dict[str, Any]:
        """Calculate irrigation needs"""
        temp = weather.get('temperature', 25)
        rainfall = weather.get('rainfall_mm', 0)
        
        if soil_moisture < 0.3:
            return {
                "action_needed": True,
                "action": "Irrigate immediately - 25mm water recommended",
                "message": "Soil is dry and needs water urgently."
            }
        elif soil_moisture < 0.5:
            return {
                "action_needed": True,
                "action": "Irrigate within 12 hours - 15mm recommended",
                "message": "Soil moisture is low."
            }
        else:
            return {
                "action_needed": False,
                "action": "",
                "message": "Soil has adequate moisture."
            }


class IVRCropRotationIntegration:
    """
    Integrate IVR with crop rotation planning
    
    Voice intent examples:
    - "What should I plant next year?"
    - "Plan my crop rotation"
    - "Suggest a rotation schedule"
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def handle_rotation_planning_request(self, farmer_profile: FarmerProfile, 
                                        years: int = 3) -> str:
        """
        Handle crop rotation planning from IVR
        
        Args:
            farmer_profile: Farmer's profile with current crops
            years: Number of years to plan for
            
        Returns:
            Rotation schedule as voice response
        """
        try:
            self.logger.info(f"Rotation planning request from {farmer_profile.farmer_id}")
            
            # Generate rotation plan (simplified version)
            rotation_plan = self._generate_rotation_plan(farmer_profile.primary_crops, years)
            
            response = f"I recommend a {years}-year rotation plan. "
            for year, crops in rotation_plan.items():
                crop_str = ", ".join(crops)
                response += f"Year {year}: {crop_str}. "
            
            response += "This rotation improves soil health and reduces pests."
            
            return response
            
        except Exception as e:
            self.logger.error(f"Rotation planning error: {str(e)}")
            return "Sorry, I couldn't generate a rotation plan right now."
    
    def _generate_rotation_plan(self, current_crops: List[str], years: int) -> Dict[int, List[str]]:
        """Generate simple rotation plan"""
        base_rotation = {
            1: ["Rice", "Wheat"],
            2: ["Legumes", "Maize"],
            3: ["Vegetables", "Rice"]
        }
        
        plan = {}
        for year in range(1, years + 1):
            plan[year] = base_rotation.get(year, ["Rotation Crop"])
        
        return plan


class IVRWeatherAlertsIntegration:
    """
    Integrate IVR with weather alerts
    
    Voice intent examples:
    - "What's the weather forecast?"
    - "Will it rain tomorrow?"
    - "Any weather alerts?"
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def handle_weather_request(self, farmer_profile: FarmerProfile, weather_data: Dict) -> str:
        """
        Handle weather inquiry from IVR
        
        Args:
            farmer_profile: Farmer's profile (for location)
            weather_data: Weather forecast data
            
        Returns:
            Weather information as voice response
        """
        try:
            self.logger.info(f"Weather request from {farmer_profile.farmer_id}")
            
            temp = weather_data.get('temperature', 25)
            forecast = weather_data.get('forecast', 'unclear')
            rainfall = weather_data.get('rainfall_mm', 0)
            
            response = f"Current temperature in {farmer_profile.region} is {int(temp)} degrees. "
            response += f"Forecast: {forecast}. "
            
            if rainfall > 10:
                response += f"Expected rainfall: {rainfall}mm. Delay irrigation if needed."
            elif rainfall > 0:
                response += f"Light rainfall expected: {rainfall}mm."
            
            return response
            
        except Exception as e:
            self.logger.error(f"Weather request error: {str(e)}")
            return "Sorry, weather information is unavailable right now."


class IVRIntegrationOrchestrator:
    """
    Main orchestrator for IVR integration
    Routes voice commands to appropriate modules
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize integrations
        self.crop_recommendation = IVRCropRecommendationIntegration()
        self.soil_health = IVRSoilHealthIntegration()
        self.water_management = IVRWaterManagementIntegration()
        self.crop_rotation = IVRCropRotationIntegration()
        self.weather_alerts = IVRWeatherAlertsIntegration()
    
    def route_voice_intent(self, farmer_profile: FarmerProfile, voice_text: str, 
                          context_data: Dict[str, Any]) -> str:
        """
        Route voice command to appropriate handler
        
        Args:
            farmer_profile: Farmer's profile
            voice_text: Transcribed voice command
            context_data: Additional context (weather, soil params, etc.)
            
        Returns:
            Response to speak to farmer
        """
        voice_lower = voice_text.lower()
        
        # Detect intent and route
        if any(keyword in voice_lower for keyword in ["crop", "plant", "grow", "recommend"]):
            return self.crop_recommendation.handle_crop_recommendation_request(
                farmer_profile, voice_text
            )
        
        elif any(keyword in voice_lower for keyword in ["soil", "health", "pH", "nitrogen"]):
            return self.soil_health.handle_soil_health_request(
                farmer_profile, context_data.get('soil_params', {})
            )
        
        elif any(keyword in voice_lower for keyword in ["water", "irrigate", "moisture", "dry"]):
            return self.water_management.handle_irrigation_schedule_request(
                farmer_profile,
                context_data.get('weather', {}),
                context_data.get('soil_moisture', 0.5)
            )
        
        elif any(keyword in voice_lower for keyword in ["rotation", "rotate", "next year", "next season"]):
            return self.crop_rotation.handle_rotation_planning_request(farmer_profile)
        
        elif any(keyword in voice_lower for keyword in ["weather", "rain", "forecast", "temperature"]):
            return self.weather_alerts.handle_weather_request(
                farmer_profile, context_data.get('weather', {})
            )
        
        else:
            return "I didn't quite understand that. You can ask me about crop recommendations, soil health, irrigation, crop rotation, or weather. What would you like to know?"


# Example usage
if __name__ == "__main__":
    # Create sample farmer profile
    farmer = FarmerProfile(
        farmer_id="FARMER_001",
        name="Raj Kumar",
        region="Punjab",
        soil_type="loam",
        farm_size_hectares=5.0,
        primary_crops=["Wheat", "Rice"],
        language="en"
    )
    
    # Initialize orchestrator
    orchestrator = IVRIntegrationOrchestrator()
    
    # Example voice commands
    voice_commands = [
        "What crops should I grow?",
        "How is my soil health?",
        "When should I irrigate?",
        "Plan my crop rotation for next year",
        "What's the weather forecast?"
    ]
    
    # Process commands
    for command in voice_commands:
        response = orchestrator.route_voice_intent(
            farmer_profile=farmer,
            voice_text=command,
            context_data={
                'weather': {'temperature': 28, 'forecast': 'Sunny', 'rainfall_mm': 0},
                'soil_params': {'pH': 6.8, 'N': 150},
                'soil_moisture': 0.6
            }
        )
        print(f"Farmer: {command}")
        print(f"IVR: {response}\n")
