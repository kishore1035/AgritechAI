#!/usr/bin/env python3
"""
Taste-Skill Integration Setup for AgriTech AI Frontend
Creates directory structure and copies taste-skill files
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def main():
    base_dir = Path("C:\\Users\\PREETHI\\Downloads\\agritech-ai")
    frontend_src = base_dir / "frontend" / "src"
    
    print("\n" + "="*50)
    print("Taste-Skill Integration Setup")
    print("="*50 + "\n")
    
    try:
        # Step 1: Clone taste-skill if needed
        print("[1/4] Checking taste-skill repository...")
        taste_skill_dir = base_dir / "taste-skill"
        
        if not taste_skill_dir.exists():
            print("      Cloning taste-skill repository...")
            subprocess.run(
                ["git", "clone", "https://github.com/Leonxlnx/taste-skill.git"],
                cwd=str(base_dir),
                check=True
            )
            print("      ✓ Repository cloned\n")
        else:
            print("      ✓ Repository already exists\n")
        
        # Step 2: Create directory structure
        print("[2/4] Creating directory structure...")
        
        dirs_to_create = [
            frontend_src / "skills",
            frontend_src / "skills" / "taste-skill",
            frontend_src / "plugins",
            frontend_src / "components" / "premium"
        ]
        
        for dir_path in dirs_to_create:
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"      ✓ {dir_path.relative_to(base_dir)}")
        print()
        
        # Step 3: Copy taste-skill files
        print("[3/4] Copying taste-skill files...")
        skills_src = taste_skill_dir / "skills"
        skills_dest = frontend_src / "skills" / "taste-skill"
        
        if skills_src.exists():
            for file in skills_src.iterdir():
                if file.is_file():
                    shutil.copy2(file, skills_dest / file.name)
                    print(f"      ✓ Copied {file.name}")
        else:
            print(f"      ⚠ Warning: {skills_src} not found")
        print()
        
        # Step 4: Verify setup
        print("[4/4] Verifying setup...")
        
        all_exist = True
        for dir_path in dirs_to_create:
            if dir_path.exists():
                print(f"      ✓ {dir_path.relative_to(base_dir)}")
            else:
                print(f"      ✗ {dir_path.relative_to(base_dir)} MISSING")
                all_exist = False
        
        print("\n" + "="*50)
        if all_exist:
            print("✓ Setup Complete!")
        else:
            print("✗ Setup had some issues")
        print("="*50 + "\n")
        
        print("Created directories:")
        print("  • frontend/src/skills/")
        print("  • frontend/src/skills/taste-skill/")
        print("  • frontend/src/plugins/")
        print("  • frontend/src/components/premium/\n")
        
        return 0 if all_exist else 1
        
    except Exception as e:
        print(f"\n✗ Error: {e}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
