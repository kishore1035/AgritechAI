from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Crop nutrient requirements (N, P, K in kg/acre)
CROP_NUTRIENTS = {
    'rice': {'N': 80, 'P': 40, 'K': 40},
    'wheat': {'N': 120, 'P': 60, 'K': 40},
    'sugarcane': {'N': 300, 'P': 100, 'K': 200},
    'cotton': {'N': 120, 'P': 60, 'K': 60},
    'maize': {'N': 120, 'P': 60, 'K': 40},
    'soybean': {'N': 30, 'P': 60, 'K': 40, 'N_replenish': 50},  # Legume - adds N
    'chickpea': {'N': 20, 'P': 40, 'K': 20, 'N_replenish': 40},
    'pigeon_pea': {'N': 25, 'P': 50, 'K': 25, 'N_replenish': 45},
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'ML Service Running'})

@app.route('/predict/nutrient-depletion', methods=['POST'])
def predict_nutrient_depletion():
    """Calculate nutrient depletion based on cropping history"""
    try:
        data = request.json
        current_soil = data['currentSoilHealth']
        cropping_history = data['croppingHistory']
        
        # Calculate cumulative nutrient extraction
        total_extraction = {'N': 0, 'P': 0, 'K': 0}
        total_replenishment = {'N': 0, 'P': 0, 'K': 0}
        
        for entry in cropping_history:
            crop = entry['crop'].lower().replace(' ', '_')
            if crop in CROP_NUTRIENTS:
                nutrients = CROP_NUTRIENTS[crop]
                total_extraction['N'] += nutrients['N']
                total_extraction['P'] += nutrients['P']
                total_extraction['K'] += nutrients['K']
                
                # Add replenishment for legumes
                if 'N_replenish' in nutrients:
                    total_replenishment['N'] += nutrients['N_replenish']
        
        # Project future depletion (3 seasons ahead)
        projected_N = [current_soil['N']]
        projected_P = [current_soil['P']]
        projected_K = [current_soil['K']]
        
        avg_n_loss = total_extraction['N'] / max(len(cropping_history), 1)
        avg_p_loss = total_extraction['P'] / max(len(cropping_history), 1)
        avg_k_loss = total_extraction['K'] / max(len(cropping_history), 1)
        
        for i in range(3):
            projected_N.append(max(0, projected_N[-1] - avg_n_loss * 0.6))
            projected_P.append(max(0, projected_P[-1] - avg_p_loss * 0.5))
            projected_K.append(max(0, projected_K[-1] - avg_k_loss * 0.5))
        
        # Calculate risk score
        risk_scores = []
        for n, p, k in zip(projected_N, projected_P, projected_K):
            risk = 0
            if n < 200: risk += 1
            if n < 100: risk += 1
            if p < 15: risk += 1
            if p < 8: risk += 1
            if k < 100: risk += 1
            if k < 50: risk += 1
            risk_scores.append(risk)
        
        risk_level = 'Low'
        if risk_scores[-1] >= 5:
            risk_level = 'Critical'
        elif risk_scores[-1] >= 3:
            risk_level = 'High'
        elif risk_scores[-1] >= 2:
            risk_level = 'Medium'
        
        return jsonify({
            'riskScore': risk_level,
            'nutrientDepletion': {
                'N': {'current': current_soil['N'], 'projected': projected_N[1:]},
                'P': {'current': current_soil['P'], 'projected': projected_P[1:]},
                'K': {'current': current_soil['K'], 'projected': projected_K[1:]}
            },
            'yieldDeclineProbability': min(100, risk_scores[-1] * 15),
            'economicLoss': risk_scores[-1] * 5000,  # ₹ per acre
            'soilRecoveryTimeline': max(6, risk_scores[-1] * 3)  # months
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend/rotation', methods=['POST'])
def recommend_rotation():
    """Recommend crop rotation based on soil health"""
    try:
        data = request.json
        current_soil = data['currentSoilHealth']
        cropping_history = data['croppingHistory']
        region = data.get('region', '')
        
        # Get recently grown crops
        recent_crops = [entry['crop'].lower().replace(' ', '_') for entry in cropping_history[-3:]]
        
        recommendations = []
        
        # If N is low, recommend legumes
        if current_soil['N'] < 150:
            recommendations.append({
                'season': 'Rabi',
                'crop': 'Chickpea',
                'reason': 'Legume crop will replenish nitrogen naturally'
            })
            recommendations.append({
                'season': 'Kharif',
                'crop': 'Soybean',
                'reason': 'High nitrogen fixation, improves soil organic matter'
            })
        
        # If nutrients are moderate, rotate with less demanding crops
        if current_soil['N'] > 150 and 'rice' not in recent_crops:
            recommendations.append({
                'season': 'Kharif',
                'crop': 'Rice',
                'reason': 'Moderate nutrient demand, good for crop diversification'
            })
        
        # Add wheat for winter season
        if 'wheat' not in recent_crops:
            recommendations.append({
                'season': 'Rabi',
                'crop': 'Wheat',
                'reason': 'Complements summer crops, good market demand'
            })
        
        # Always suggest green manure
        recommendations.append({
            'season': 'Zaid',
            'crop': 'Green Manure (Sunhemp)',
            'reason': 'Improves soil structure and adds organic matter'
        })
        
        return jsonify({
            'recommendations': recommendations[:5]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
