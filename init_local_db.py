#!/usr/bin/env python3
"""
Initialize Local SQLite Database for AgriTech AI Phases 1-5
Creates all tables and populates with sample data
"""

import sqlite3
import os
from datetime import datetime
import json

DB_PATH = "agritech_local.db"

# SQL Schema for all phases
SCHEMA = {
    # Phase 1: SimpleSoilProfile
    "soil_profiles": """
        CREATE TABLE IF NOT EXISTS soil_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            depth_cm INTEGER DEFAULT 200,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """,
    
    "soil_layers": """
        CREATE TABLE IF NOT EXISTS soil_layers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            layer_number INTEGER,
            depth_from_cm REAL,
            depth_to_cm REAL,
            texture TEXT,
            sand_percent REAL,
            silt_percent REAL,
            clay_percent REAL,
            organic_matter_percent REAL,
            bulk_density REAL,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "van_genuchten_params": """
        CREATE TABLE IF NOT EXISTS van_genuchten_params (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            layer_id INTEGER NOT NULL,
            theta_r REAL,
            theta_s REAL,
            alpha REAL,
            n REAL,
            ks REAL,
            FOREIGN KEY (layer_id) REFERENCES soil_layers(id)
        )
    """,
    
    # Phase 2: Soil Science
    "soil_physics_params": """
        CREATE TABLE IF NOT EXISTS soil_physics_params (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            thermal_conductivity REAL,
            heat_capacity REAL,
            porosity REAL,
            tortuosity REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "hydrology_curves": """
        CREATE TABLE IF NOT EXISTS hydrology_curves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            matric_potential REAL,
            volumetric_water_content REAL,
            capillary_rise_cm REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "nutrient_cycles": """
        CREATE TABLE IF NOT EXISTS nutrient_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            nitrogen_mg_kg REAL,
            phosphorus_mg_kg REAL,
            potassium_mg_kg REAL,
            microbial_biomass REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "erosion_data": """
        CREATE TABLE IF NOT EXISTS erosion_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            rainfall_mm REAL,
            slope_percent REAL,
            k_factor REAL,
            c_factor REAL,
            p_factor REAL,
            erosion_loss_tons_ha REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    # Phase 3: SimSoil
    "simsoil_simulations": """
        CREATE TABLE IF NOT EXISTS simsoil_simulations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            simulation_name TEXT,
            start_date DATE,
            end_date DATE,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "simsoil_results_hourly": """
        CREATE TABLE IF NOT EXISTS simsoil_results_hourly (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simulation_id INTEGER NOT NULL,
            datetime TIMESTAMP,
            water_content_cm3_cm3 REAL,
            matric_potential_cm REAL,
            transpiration_mm REAL,
            drainage_mm REAL,
            FOREIGN KEY (simulation_id) REFERENCES simsoil_simulations(id)
        )
    """,
    
    "simsoil_calibration": """
        CREATE TABLE IF NOT EXISTS simsoil_calibration (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simulation_id INTEGER NOT NULL,
            parameter_name TEXT,
            initial_value REAL,
            calibrated_value REAL,
            rmse REAL,
            FOREIGN KEY (simulation_id) REFERENCES simsoil_simulations(id)
        )
    """,
    
    # Phase 4: PyFAO56
    "fao56_schedules": """
        CREATE TABLE IF NOT EXISTS fao56_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            crop_type TEXT,
            planting_date DATE,
            harvest_date DATE,
            kc_initial REAL,
            kc_mid REAL,
            kc_end REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "fao56_daily_schedule": """
        CREATE TABLE IF NOT EXISTS fao56_daily_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            date DATE,
            et0_mm REAL,
            kc REAL,
            etc_mm REAL,
            rainfall_mm REAL,
            irrigation_mm REAL,
            status TEXT,
            FOREIGN KEY (schedule_id) REFERENCES fao56_schedules(id)
        )
    """,
    
    "crop_coefficients": """
        CREATE TABLE IF NOT EXISTS crop_coefficients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_name TEXT UNIQUE,
            kc_initial REAL,
            kc_mid REAL,
            kc_end REAL,
            growth_days INTEGER,
            max_root_depth_m REAL,
            source TEXT
        )
    """,
    
    # Phase 5: Crop Recommendation
    "crop_recommendations": """
        CREATE TABLE IF NOT EXISTS crop_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            crop_name TEXT,
            suitability_score REAL,
            yield_potential_kg_ha REAL,
            water_requirement_mm REAL,
            nitrogen_requirement_kg_ha REAL,
            recommendation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    "crop_rotation_plans": """
        CREATE TABLE IF NOT EXISTS crop_rotation_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            current_crop TEXT,
            year_1_crop TEXT,
            year_2_crop TEXT,
            year_3_crop TEXT,
            rotation_benefit_tons_ha REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
        )
    """,
    
    # Common tables
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE,
            name TEXT,
            village TEXT,
            region TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """,
    
    "ivr_calls": """
        CREATE TABLE IF NOT EXISTS ivr_calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            call_duration_seconds INTEGER,
            intent TEXT,
            response TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """
}


def init_database():
    """Initialize database with schema"""
    print("🗄️  Initializing AgriTech AI Local Database...")
    print(f"📍 Database: {DB_PATH}\n")
    
    # Remove existing database for fresh start
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("✓ Removed existing database")
    
    # Connect and create schema
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n📋 Creating database schema:\n")
    for table_name, schema_sql in SCHEMA.items():
        try:
            cursor.execute(schema_sql)
            print(f"  ✓ {table_name}")
        except Exception as e:
            print(f"  ✗ {table_name}: {e}")
    
    conn.commit()
    print("\n✓ Schema created successfully")
    
    # Populate with sample data
    populate_sample_data(cursor, conn)
    
    # Create indexes for better performance
    create_indexes(cursor, conn)
    
    conn.close()
    print(f"\n✅ Database initialized: {DB_PATH}")
    print(f"📊 Size: {os.path.getsize(DB_PATH) / 1024:.2f} KB\n")


def populate_sample_data(cursor, conn):
    """Populate database with sample data"""
    print("\n📝 Populating sample data:\n")
    
    # Sample soil profile
    cursor.execute("""
        INSERT INTO soil_profiles (name, location, latitude, longitude)
        VALUES (?, ?, ?, ?)
    """, ("Farm 1 - Wheat Field", "Maharashtra, India", 19.0760, 72.8777))
    profile_id = cursor.lastrowid
    print(f"  ✓ Sample soil profile (ID: {profile_id})")
    
    # Sample soil layers
    layers_data = [
        (profile_id, 1, 0, 30, "Loam", 40, 40, 20, 2.5, 1.35),
        (profile_id, 2, 30, 60, "Clay Loam", 35, 35, 30, 2.0, 1.42),
        (profile_id, 3, 60, 90, "Clay", 20, 30, 50, 1.5, 1.50),
        (profile_id, 4, 90, 120, "Clay", 20, 30, 50, 1.2, 1.52),
        (profile_id, 5, 120, 160, "Sandy Clay", 45, 25, 30, 0.8, 1.40),
        (profile_id, 6, 160, 200, "Sandy Loam", 60, 20, 20, 0.5, 1.30),
    ]
    
    for layer_data in layers_data:
        cursor.execute("""
            INSERT INTO soil_layers 
            (profile_id, layer_number, depth_from_cm, depth_to_cm, texture, 
             sand_percent, silt_percent, clay_percent, organic_matter_percent, bulk_density)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, layer_data)
    print(f"  ✓ 6 soil layers")
    
    # Sample van Genuchten parameters
    vg_params = [
        (1, 0.08, 0.45, 0.02, 1.4, 0.8),
        (2, 0.10, 0.48, 0.015, 1.3, 0.5),
        (3, 0.12, 0.50, 0.008, 1.25, 0.3),
    ]
    
    for layer_id, theta_r, theta_s, alpha, n, ks in vg_params:
        cursor.execute("""
            INSERT INTO van_genuchten_params 
            (layer_id, theta_r, theta_s, alpha, n, ks)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (layer_id, theta_r, theta_s, alpha, n, ks))
    print(f"  ✓ Van Genuchten parameters")
    
    # Sample soil physics
    cursor.execute("""
        INSERT INTO soil_physics_params 
        (profile_id, thermal_conductivity, heat_capacity, porosity, tortuosity)
        VALUES (?, ?, ?, ?, ?)
    """, (profile_id, 1.8, 2.5, 0.45, 0.7))
    print(f"  ✓ Soil physics parameters")
    
    # Sample nutrition data
    cursor.execute("""
        INSERT INTO nutrient_cycles 
        (profile_id, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, microbial_biomass)
        VALUES (?, ?, ?, ?, ?)
    """, (profile_id, 45, 18, 250, 320))
    print(f"  ✓ Nutrient cycle data")
    
    # Sample erosion data
    cursor.execute("""
        INSERT INTO erosion_data 
        (profile_id, rainfall_mm, slope_percent, k_factor, c_factor, p_factor, erosion_loss_tons_ha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (profile_id, 85, 5, 0.25, 0.3, 0.5, 0.95))
    print(f"  ✓ Erosion assessment data")
    
    # Sample SimSoil simulation
    cursor.execute("""
        INSERT INTO simsoil_simulations 
        (profile_id, simulation_name, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?)
    """, (profile_id, "2026-01-01 to 2026-12-31", "2026-01-01", "2026-12-31", "completed"))
    sim_id = cursor.lastrowid
    print(f"  ✓ SimSoil simulation record")
    
    # Sample FAO56 schedule
    cursor.execute("""
        INSERT INTO fao56_schedules 
        (profile_id, crop_type, planting_date, harvest_date, kc_initial, kc_mid, kc_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (profile_id, "Wheat", "2026-11-15", "2027-04-15", 0.3, 1.15, 0.4))
    schedule_id = cursor.lastrowid
    print(f"  ✓ FAO56 irrigation schedule")
    
    # Sample crop coefficients
    crops_data = [
        ("Wheat", 0.3, 1.15, 0.4, 180, 1.5, "FAO-56"),
        ("Rice", 1.05, 1.20, 0.90, 150, 0.5, "FAO-56"),
        ("Maize", 0.3, 1.20, 0.5, 150, 1.7, "FAO-56"),
        ("Cotton", 0.35, 1.15, 0.75, 195, 1.65, "FAO-56"),
        ("Sugarcane", 0.4, 1.30, 0.90, 365, 2.5, "FAO-56"),
    ]
    
    for crop_data in crops_data:
        cursor.execute("""
            INSERT OR IGNORE INTO crop_coefficients 
            (crop_name, kc_initial, kc_mid, kc_end, growth_days, max_root_depth_m, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, crop_data)
    print(f"  ✓ 5 crop coefficient references")
    
    # Sample crop recommendations
    cursor.execute("""
        INSERT INTO crop_recommendations 
        (profile_id, crop_name, suitability_score, yield_potential_kg_ha, 
         water_requirement_mm, nitrogen_requirement_kg_ha)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (profile_id, "Wheat", 0.88, 4500, 450, 120))
    print(f"  ✓ Crop recommendation")
    
    # Sample crop rotation
    cursor.execute("""
        INSERT INTO crop_rotation_plans 
        (profile_id, current_crop, year_1_crop, year_2_crop, year_3_crop, rotation_benefit_tons_ha)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (profile_id, "Wheat", "Rice", "Legume", "Wheat", 2.5))
    print(f"  ✓ Crop rotation plan")
    
    # Sample users
    cursor.execute("""
        INSERT INTO users (phone_number, name, village, region)
        VALUES (?, ?, ?, ?)
    """, ("9876543210", "Farmer Ramesh", "Nashik", "Maharashtra"))
    user_id = cursor.lastrowid
    print(f"  ✓ Sample user")
    
    # Sample IVR call
    cursor.execute("""
        INSERT INTO ivr_calls (user_id, call_duration_seconds, intent, response, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, 245, "crop_recommendation", "Wheat recommended for your soil", datetime.now()))
    print(f"  ✓ Sample IVR call record")
    
    conn.commit()


def create_indexes(cursor, conn):
    """Create indexes for better query performance"""
    print("\n📑 Creating indexes:\n")
    
    indexes = {
        "idx_soil_layers_profile": "CREATE INDEX IF NOT EXISTS idx_soil_layers_profile ON soil_layers(profile_id)",
        "idx_soil_physics_profile": "CREATE INDEX IF NOT EXISTS idx_soil_physics_profile ON soil_physics_params(profile_id)",
        "idx_simsoil_results_sim": "CREATE INDEX IF NOT EXISTS idx_simsoil_results_sim ON simsoil_results_hourly(simulation_id)",
        "idx_fao56_daily_schedule": "CREATE INDEX IF NOT EXISTS idx_fao56_daily_schedule ON fao56_daily_schedule(schedule_id)",
        "idx_crop_recommendations_profile": "CREATE INDEX IF NOT EXISTS idx_crop_recommendations_profile ON crop_recommendations(profile_id)",
        "idx_ivr_calls_user": "CREATE INDEX IF NOT EXISTS idx_ivr_calls_user ON ivr_calls(user_id)",
        "idx_users_phone": "CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)",
    }
    
    for index_name, index_sql in indexes.items():
        try:
            cursor.execute(index_sql)
            print(f"  ✓ {index_name}")
        except Exception as e:
            print(f"  ✗ {index_name}: {e}")
    
    conn.commit()


def print_summary():
    """Print database summary"""
    print("\n" + "="*70)
    print("DATABASE INITIALIZATION COMPLETE")
    print("="*70)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get table count
    cursor.execute("""
        SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    """)
    table_count = cursor.fetchone()[0]
    
    print(f"\n📊 Database Statistics:")
    print(f"   Total Tables: {table_count}")
    print(f"   Database File: {DB_PATH}")
    print(f"   Size: {os.path.getsize(DB_PATH) / 1024:.2f} KB")
    
    # Get record counts
    print(f"\n📈 Sample Data Loaded:")
    tables_to_count = [
        "soil_profiles", "soil_layers", "van_genuchten_params",
        "crop_coefficients", "users", "ivr_calls"
    ]
    
    for table in tables_to_count:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"   {table}: {count} records")
    
    conn.close()
    
    print("\n" + "="*70)
    print("✅ Ready for Production!")
    print("="*70)
    print("\n📌 Next Steps:")
    print("   1. Verify database: sqlite3 agritech_local.db '.tables'")
    print("   2. Update .env with DATABASE_URL if needed")
    print("   3. Run: python integrate_phases_1_to_5.py")
    print("   4. Start IVR: python run_ivr.py")
    print("\n")


if __name__ == "__main__":
    init_database()
    print_summary()
