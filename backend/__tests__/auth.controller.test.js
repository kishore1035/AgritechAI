/**
 * Auth Controller Unit Tests
 * Tests registration, login, token validation
 */

const request = require('supertest');
const express = require('express');
const authRoute = require('../../routes/auth');
const { ValidationError, AuthenticationError } = require('../../utils/AppError');

// Mock the local database
jest.mock('../../config/localDb', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

describe('Authentication Controller', () => {
  let app;
  let localDb;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoute);
    localDb = require('../../config/localDb');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      localDb.readDb.mockReturnValue({ users: [] });
      localDb.writeDb.mockReturnValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          phone: '+919998887776',
          password: 'SecurePass123!',
          location: 'Bangalore'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject registration with missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '+919998887776',
          password: 'SecurePass123!',
          location: 'Bangalore'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          phone: 'invalid-phone',
          password: 'SecurePass123!',
          location: 'Bangalore'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          phone: '+919998887776',
          password: 'short',
          location: 'Bangalore'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate phone registration', async () => {
      localDb.readDb.mockReturnValue({
        users: [
          { phone: '9998887776', name: 'Existing User' }
        ]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          phone: '+919998887776',
          password: 'SecurePass123!',
          location: 'Bangalore'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should hash password before storing', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');

      localDb.readDb.mockReturnValue({ users: [] });
      localDb.writeDb.mockReturnValue(true);

      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Farmer',
          phone: '+919998887776',
          password: 'SecurePass123!',
          location: 'Bangalore'
        });

      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const hashedPassword = await bcrypt.hash('password123', 10);
      localDb.readDb.mockReturnValue({
        users: [
          { _id: 'user1', phone: '9998887776', password: hashedPassword }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9998887776',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject login with invalid phone', async () => {
      localDb.readDb.mockReturnValue({ users: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9999999999',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject login with wrong password', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const hashedPassword = await bcrypt.hash('password123', 10);
      localDb.readDb.mockReturnValue({
        users: [
          { _id: 'user1', phone: '9998887776', password: hashedPassword }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9998887776',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9998887776'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return JWT token with correct format', async () => {
      const jwt = require('jsonwebtoken');
      const bcrypt = require('bcryptjs');

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const hashedPassword = await bcrypt.hash('password123', 10);

      localDb.readDb.mockReturnValue({
        users: [
          { _id: 'user1', phone: '9998887776', password: hashedPassword, name: 'Test' }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9998887776',
          password: 'password123'
        });

      expect(response.body.data.token).toBeDefined();
      
      // Verify token format
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user1');
      expect(decoded.phone).toBe('9998887776');
    });
  });

  describe('Error Handling', () => {
    it('should handle database read errors gracefully', async () => {
      localDb.readDb.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '9998887776',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return standardized error format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: 'invalid',
          password: 'pass'
        });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });
});
