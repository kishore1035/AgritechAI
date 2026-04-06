const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  console.log('📥 Registration request received:', {
    body: { ...req.body, password: '[HIDDEN]' },
    headers: { 'content-type': req.headers['content-type'] }
  });

  try {
    const { name, phone, password, district, state, village, language } = req.body;
    
    console.log('🔍 Validating required fields...');
    if (!name || !phone || !password || !district || !state) {
      console.log('❌ Missing required fields:', { name: !!name, phone: !!phone, password: !!password, district: !!district, state: !!state });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log('❌ Phone number already registered:', phone);
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('💾 Creating new user...');
    const newUser = await User.create({
      name, phone, password: hashedPassword, district, state, village, language: language || 'en'
    });
    
    console.log('✅ User created successfully:', { id: newUser._id, name: newUser.name, phone: newUser.phone });
    
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    console.log('✅ Registration complete, sending response...');
    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { id: newUser._id, name: newUser.name, phone: newUser.phone, language: newUser.language }
    });
  } catch (error) {
    console.error('💥 Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, phone: user.phone, language: user.language }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

module.exports = router;
