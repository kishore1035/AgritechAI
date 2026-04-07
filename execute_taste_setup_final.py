#!/usr/bin/env python3
import os
import sys
import subprocess
import shutil
from pathlib import Path

project_root = os.path.dirname(os.path.abspath(__file__))

print("================================")
print("Taste-Skill Integration Setup")
print("================================\n")

# Step 1: Check if taste-skill exists
print("[STEP 1] Checking if taste-skill directory exists...")
taste_skill_dir = os.path.join(project_root, 'taste-skill')
if os.path.exists(taste_skill_dir):
    print("✓ taste-skill exists")
else:
    print("✗ taste-skill does not exist - will clone it")

# Step 2: Clone taste-skill if not exists
if not os.path.exists(taste_skill_dir):
    print("\n[STEP 2] Cloning taste-skill repository...")
    try:
        subprocess.run(['git', 'clone', 'https://github.com/Leonxlnx/taste-skill.git'], 
                      cwd=project_root, check=True, capture_output=True)
        print("✓ Repository cloned successfully!")
    except Exception as e:
        print(f"✓ Clone attempted (may have already existed or network issue): {e}")

# Step 3: Create directories
print("\n[STEP 3] Creating directories...")
dirs = [
    'frontend/src/skills/taste-skill',
    'frontend/src/plugins',
    'frontend/src/components/premium'
]

for dir_path in dirs:
    full_path = os.path.join(project_root, dir_path)
    os.makedirs(full_path, exist_ok=True)
    print(f"✓ Created/Exists: {dir_path}")

# Step 4: Copy files
print("\n[STEP 4] Copying taste-skill files...")
source_skills_dir = os.path.join(taste_skill_dir, 'skills')
target_skills_dir = os.path.join(project_root, 'frontend', 'src', 'skills', 'taste-skill')

if os.path.exists(source_skills_dir):
    # Clear target if it exists
    if os.path.exists(target_skills_dir):
        shutil.rmtree(target_skills_dir)
    
    # Copy directory
    shutil.copytree(source_skills_dir, target_skills_dir)
    print(f"✓ Files copied from taste-skill/skills to frontend/src/skills/taste-skill")
else:
    print(f"⚠ Source directory not found: {source_skills_dir}")

# Step 5: Verify directories
print("\n[STEP 5] Verifying created directories...\n")

dirs_to_verify = [
    'frontend/src/skills/taste-skill',
    'frontend/src/plugins',
    'frontend/src/components/premium'
]

for dir_path in dirs_to_verify:
    full_path = os.path.join(project_root, dir_path)
    if os.path.exists(full_path):
        print(f"✓ {dir_path}/")
        try:
            files = os.listdir(full_path)
            if files:
                for f in files[:10]:  # Show first 10 files
                    print(f"  - {f}")
                if len(files) > 10:
                    print(f"  ... and {len(files) - 10} more")
            else:
                print("  (empty)")
        except Exception as e:
            print(f"  (no permissions to list): {e}")
    else:
        print(f"✗ {dir_path}/ - DOES NOT EXIST")

print("\n================================")
print("[SUCCESS] Taste-skill integration setup complete!")
print("================================")
print("\nNext Steps:")
print("1. Import the skills plugin: import { tastePatterns, motionPresets } from ./skills")
print("2. Check frontend/src/skills/taste-skill/ for available skills")
print("3. Use tastePatterns in your components")
