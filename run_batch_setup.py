#!/usr/bin/env python3

import subprocess
import os
import sys

os.chdir('C:\\Users\\PREETHI\\Downloads\\agritech-ai')

print('=' * 50)
print('Taste-Skill Integration Setup')
print('=' * 50)
print()

# Run the batch file
print('[EXECUTING] setup-taste-skill.bat\n')
result = subprocess.run(['cmd', '/c', 'setup-taste-skill.bat'], 
                       capture_output=False, text=True)

print('\n' + '=' * 50)
print('VERIFICATION')
print('=' * 50)
print()

# Check directories
dirs_to_check = [
    'frontend\\src\\skills\\taste-skill',
    'frontend\\src\\plugins',
    'frontend\\src\\components\\premium',
    'frontend\\src\\components',
    'frontend\\src\\skills'
]

files_to_check = [
    'frontend\\src\\skills\\index.js',
    'frontend\\src\\skills\\taste-config.json',
    'frontend\\src\\components\\PremiumDashboardCard.jsx'
]

print('Checking directories:')
for dir_path in dirs_to_check:
    full_path = os.path.join('C:\\Users\\PREETHI\\Downloads\\agritech-ai', dir_path)
    exists = os.path.isdir(full_path)
    status = '✓ EXISTS' if exists else '✗ MISSING'
    print(f'  {dir_path}: {status}')

print('\nChecking files:')
for file_path in files_to_check:
    full_path = os.path.join('C:\\Users\\PREETHI\\Downloads\\agritech-ai', file_path)
    exists = os.path.isfile(full_path)
    status = '✓ EXISTS' if exists else '✗ MISSING'
    print(f'  {file_path}: {status}')

# Check if taste-skill repo was cloned
print('\nRepository status:')
if os.path.isdir('taste-skill'):
    print('  taste-skill: ✓ CLONED')
else:
    print('  taste-skill: ✗ NOT FOUND')

print('\nSetup process completed!')
