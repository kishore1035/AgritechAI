#!/usr/bin/env python3
"""Quick database verification"""
import sqlite3
import os

DB_PATH = "agritech_local.db"

if os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print(f"✅ Database verified: {len(tables)} tables\n")
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {t[0]}")
        count = cursor.fetchone()[0]
        print(f"   • {t[0]:35} ({count} records)")
    
    conn.close()
else:
    print("❌ Database not found!")
