"""
Genetic Algorithm for Crop Rotation Optimization
Optimizes multi-year crop rotation plans for soil health, yield, and sustainability
"""

import numpy as np
import pandas as pd
from deap import base, creator, tools, algorithms
import random
from typing import List, Tuple, Dict
import json

# Crop database with soil impact and requirements
CROP_DATABASE = {
    'Wheat': {'yield': 85, 'nitrogen': -10, 'phosphorus': 5, 'potassium': 10, 'soil_type': ['loam', 'clay'], 'season': 'winter'},
    'Rice': {'yield': 90, 'nitrogen': -5, 'phosphorus': 8, 'potassium': 12, 'soil_type': ['clay', 'loam'], 'season': 'summer'},
    'Pulses': {'yield': 60, 'nitrogen': 30, 'phosphorus': 10, 'potassium': 8, 'soil_type': ['loam', 'sandy'], 'season': 'winter'},
    'Maize': {'yield': 80, 'nitrogen': -15, 'phosphorus': 6, 'potassium': 12, 'soil_type': ['loam'], 'season': 'summer'},
    'Cotton': {'yield': 70, 'nitrogen': -20, 'phosphorus': 4, 'potassium': 8, 'soil_type': ['loam', 'sandy'], 'season': 'summer'},
    'Groundnut': {'yield': 65, 'nitrogen': 20, 'phosphorus': 12, 'potassium': 10, 'soil_type': ['sandy', 'loam'], 'season': 'summer'},
    'Sugarcane': {'yield': 95, 'nitrogen': -25, 'phosphorus': 8, 'potassium': 15, 'soil_type': ['loam', 'clay'], 'season': 'year-round'},
    'Soybean': {'yield': 75, 'nitrogen': 25, 'phosphorus': 10, 'potassium': 12, 'soil_type': ['loam'], 'season': 'summer'},
    'Vegetables': {'yield': 70, 'nitrogen': -5, 'phosphorus': 12, 'potassium': 14, 'soil_type': ['loam'], 'season': 'spring/fall'},
    'Herbs': {'yield': 50, 'nitrogen': 5, 'phosphorus': 8, 'potassium': 6, 'soil_type': ['loam', 'sandy'], 'season': 'spring'},
}

class CropRotationGA:
    """Genetic Algorithm for crop rotation optimization"""
    
    def __init__(self, years: int = 3, num_crops: int = 3, soil_type: str = 'loam', market_prices: Dict = None):
        """
        Initialize GA for crop rotation
        
        Args:
            years: Number of years to plan (2-5)
            num_crops: Number of different crops to grow (1-4)
            soil_type: Type of soil (loam, clay, sandy)
            market_prices: Dict with crop prices {crop_name: price_per_quintal}
        """
        self.years = years
        self.num_crops = num_crops
        self.soil_type = soil_type
        self.market_prices = market_prices or {}
        self.population_size = 50
        self.generations = 100
        
        # Setup DEAP fitness and individual
        self._setup_deap()
    
    def _setup_deap(self):
        """Setup DEAP framework"""
        # Minimize cost (but we maximize yield + sustainability, so negate)
        if hasattr(creator, "FitnessMulti"):
            del creator.FitnessMulti
        if hasattr(creator, "Individual"):
            del creator.Individual
            
        creator.create("FitnessMulti", base.Fitness, weights=(1.0, 1.0, 1.0))  # Max yield, soil health, ROI
        creator.create("Individual", list, fitness=creator.FitnessMulti)
        
        self.toolbox = base.Toolbox()
        # Attribute: crop index (0-9)
        self.toolbox.register("crop", random.randint, 0, len(CROP_DATABASE) - 1)
        # Individual: years * num_crops genes
        self.toolbox.register("individual", tools.initRepeat, creator.Individual,
                            self.toolbox.crop, self.years * self.num_crops)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        
        # Genetic operators
        self.toolbox.register("evaluate", self.evaluate_rotation)
        self.toolbox.register("mate", tools.cxBlend, alpha=0.5)
        self.toolbox.register("mutate", self._mutate_crop, indpb=0.1)
        self.toolbox.register("select", tools.selTournament, tournsize=3)
        
        # Bounds for mutation
        self.toolbox.decorate("mate", tools.DeltaFitness)
        self.toolbox.decorate("mutate", tools.DeltaFitness)
    
    def _mutate_crop(self, individual, indpb):
        """Mutate crop genes"""
        for i in range(len(individual)):
            if random.random() < indpb:
                individual[i] = random.randint(0, len(CROP_DATABASE) - 1)
        return (individual,)
    
    def evaluate_rotation(self, individual) -> Tuple[float, float, float]:
        """
        Evaluate crop rotation plan
        Returns: (total_yield_score, soil_health_score, roi_score)
        """
        crops_list = list(CROP_DATABASE.keys())
        rotation_plan = [crops_list[idx] for idx in individual]
        
        # Calculate metrics
        total_yield = 0
        soil_nitrogen = 0
        soil_phosphorus = 0
        soil_potassium = 0
        total_roi = 0
        
        for i, crop in enumerate(rotation_plan):
            crop_data = CROP_DATABASE[crop]
            
            # Yield contribution
            total_yield += crop_data['yield']
            
            # Soil impact (nutrient cycling)
            soil_nitrogen += crop_data['nitrogen']
            soil_phosphorus += crop_data['phosphorus']
            soil_potassium += crop_data['potassium']
            
            # ROI (market price if available)
            if crop in self.market_prices:
                total_roi += self.market_prices[crop] * (crop_data['yield'] / 100)
        
        # Normalize scores (0-100)
        yield_score = min(100, (total_yield / 100)) * 100
        
        # Soil health: prefer balanced nutrients (penalize extreme positive/negative)
        soil_balance = 100 - (abs(soil_nitrogen) + abs(soil_phosphorus) + abs(soil_potassium)) / 3
        soil_health_score = max(0, soil_balance)
        
        # ROI score
        roi_score = min(100, total_roi / 50) * 100 if total_roi > 0 else 50
        
        # Penalize monoculture (reward crop diversity)
        unique_crops = len(set(rotation_plan))
        diversity_bonus = (unique_crops / len(rotation_plan)) * 20
        
        final_yield = yield_score + diversity_bonus
        
        return (final_yield, soil_health_score, roi_score)
    
    def optimize(self) -> List[Dict]:
        """
        Run genetic algorithm to find optimal crop rotation
        Returns: List of best rotation plans with metrics
        """
        # Create population
        pop = self.toolbox.population(n=self.population_size)
        hof = tools.HallOfFame(5)  # Track top 5 solutions
        
        # Run algorithm
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean, axis=0)
        stats.register("max", np.max, axis=0)
        
        pop, logbook = algorithms.eaSimple(
            pop, self.toolbox,
            cxpb=0.7,  # Crossover probability
            mutpb=0.3,  # Mutation probability
            ngen=self.generations,
            stats=stats,
            halloffame=hof,
            verbose=False
        )
        
        # Convert top solutions to readable format
        crops_list = list(CROP_DATABASE.keys())
        results = []
        
        for individual in hof:
            rotation = [crops_list[idx] for idx in individual]
            yield_score, soil_health, roi_score = individual.fitness.values
            
            # Reshape into year-by-year plan
            yearly_plan = []
            for year in range(self.years):
                year_crops = rotation[year * self.num_crops:(year + 1) * self.num_crops]
                yearly_plan.append(year_crops)
            
            results.append({
                'yearly_plan': yearly_plan,
                'yield_score': float(yield_score),
                'soil_health_score': float(soil_health),
                'roi_score': float(roi_score),
                'overall_score': float((yield_score + soil_health + roi_score) / 3),
                'diversity': len(set(rotation)),
                'recommendation': self._generate_recommendation(rotation, yield_score, soil_health, roi_score)
            })
        
        return results
    
    def _generate_recommendation(self, rotation: List[str], yield_score: float, 
                                 soil_health: float, roi_score: float) -> str:
        """Generate human-readable recommendation"""
        if soil_health > 85 and yield_score > 80:
            return "Excellent rotation plan - balanced yield and soil health"
        elif yield_score > 85:
            return "High yield potential - monitor soil nutrients"
        elif soil_health > 85:
            return "Strong soil health - focus on yield optimization"
        elif roi_score > 85:
            return "Profitable rotation - good market opportunities"
        else:
            return "Moderate rotation plan - consider market conditions"
    
    def get_next_year_recommendation(self, current_soil: Dict, 
                                     last_crop: str) -> Dict:
        """
        Recommend next year's crop based on current soil conditions
        
        Args:
            current_soil: {nitrogen: value, phosphorus: value, potassium: value, ph: value}
            last_crop: Previous year's crop name
        
        Returns:
            {recommended_crop: str, reason: str, soil_benefit: str}
        """
        best_score = -float('inf')
        best_crop = None
        best_reason = ""
        
        for crop_name, crop_data in CROP_DATABASE.items():
            # Skip if same crop (monoculture penalty)
            if crop_name == last_crop:
                continue
            
            # Calculate compatibility score
            score = 0
            
            # Nitrogen preference
            if crop_data['nitrogen'] > 0 and current_soil['nitrogen'] < 40:
                score += 30  # Crop needs nitrogen, soil has deficit
            elif crop_data['nitrogen'] < 0 and current_soil['nitrogen'] > 50:
                score += 30  # Crop depletes nitrogen, soil has surplus
            
            # Phosphorus
            if crop_data['phosphorus'] > 0 and current_soil['phosphorus'] < 20:
                score += 20
            elif crop_data['phosphorus'] < 0 and current_soil['phosphorus'] > 30:
                score += 20
            
            # Potassium
            if crop_data['potassium'] > 0 and current_soil['potassium'] < 30:
                score += 20
            elif crop_data['potassium'] < 0 and current_soil['potassium'] > 50:
                score += 20
            
            # Market price bonus
            if crop_name in self.market_prices and self.market_prices[crop_name] > 3000:
                score += 10
            
            # Yield bonus
            score += crop_data['yield'] / 10
            
            if score > best_score:
                best_score = score
                best_crop = crop_name
                soil_benefit = f"N{crop_data['nitrogen']:+d}, P{crop_data['phosphorus']:+d}, K{crop_data['potassium']:+d}"
                best_reason = f"Balances soil nutrients and provides {crop_data['yield']}% yield"
        
        return {
            'recommended_crop': best_crop,
            'reason': best_reason,
            'soil_benefit': soil_benefit,
            'confidence': min(100, best_score)
        }


def optimize_crop_rotation(years: int = 3, num_crops: int = 3, 
                           soil_type: str = 'loam',
                           market_prices: Dict = None) -> List[Dict]:
    """
    Convenience function to optimize crop rotation
    
    Args:
        years: 2-5 year plan
        num_crops: 1-4 crops per year
        soil_type: loam, clay, or sandy
        market_prices: Market prices for crops
    
    Returns:
        Top 5 optimized rotation plans with scores
    """
    ga = CropRotationGA(years, num_crops, soil_type, market_prices)
    return ga.optimize()


if __name__ == '__main__':
    # Example usage
    market_prices = {
        'Wheat': 2100,
        'Rice': 2500,
        'Pulses': 5000,
        'Maize': 1800,
        'Cotton': 5200,
    }
    
    results = optimize_crop_rotation(
        years=3,
        num_crops=3,
        soil_type='loam',
        market_prices=market_prices
    )
    
    print("Top Crop Rotation Plans:")
    for i, plan in enumerate(results):
        print(f"\nPlan {i+1} - Overall Score: {plan['overall_score']:.1f}/100")
        print(f"Yearly Rotation: {plan['yearly_plan']}")
        print(f"Yield: {plan['yield_score']:.1f} | Soil Health: {plan['soil_health_score']:.1f} | ROI: {plan['roi_score']:.1f}")
        print(f"Recommendation: {plan['recommendation']}")
