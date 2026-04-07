@echo off
cd /d "C:\Users\PREETHI\Downloads\agritech-ai\frontend\src"
if not exist "services" mkdir "services"
if not exist "contexts" mkdir "contexts"
echo Created directories successfully
dir /b /ad
