#!/usr/bin/env node

// Execute the taste-skill setup script directly
const path = require('path');
const scriptPath = path.join(__dirname, 'taste-skill-complete-setup.js');

// Load and execute the setup script
require(scriptPath);
