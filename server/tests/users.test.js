const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/Users');

describe('User API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);

    const user = await User.findOne({ email: userData.email });
    expect(user).toBeTruthy();
    expect(user.username).toBe(userData.username);
  });

  test('should not create user with duplicate email', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    await User.create(userData);

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});