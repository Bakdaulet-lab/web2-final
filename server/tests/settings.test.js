const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/Users');

describe('Settings API', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI);
        
        // Create test user
        testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            emailNotifications: true,
            pushNotifications: true
        });

        // Get auth token
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });
        
        authToken = response.body.accessToken;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test('GET /api/settings - should get user settings', async () => {
        const response = await request(app)
            .get('/api/settings')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.settings).toHaveProperty('emailNotifications');
        expect(response.body.settings).toHaveProperty('pushNotifications');
    });

    test('PUT /api/settings - should update user settings', async () => {
        const newSettings = {
            emailNotifications: false,
            pushNotifications: true
        };

        const response = await request(app)
            .put('/api/settings')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newSettings);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.settings).toMatchObject(newSettings);

        // Verify settings were actually updated in database
        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser.emailNotifications).toBe(newSettings.emailNotifications);
        expect(updatedUser.pushNotifications).toBe(newSettings.pushNotifications);
    });

    test('GET /api/settings - should fail without auth token', async () => {
        const response = await request(app)
            .get('/api/settings');

        expect(response.status).toBe(401);
    });

    test('PUT /api/settings - should fail with invalid data', async () => {
        const response = await request(app)
            .put('/api/settings')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                emailNotifications: 'invalid'
            });

        expect(response.status).toBe(500);
    });
});

exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('emailNotifications pushNotifications');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            settings: {
                emailNotifications: user.emailNotifications,
                pushNotifications: user.pushNotifications
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { emailNotifications, pushNotifications } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                emailNotifications,
                pushNotifications
            },
            { new: true }
        ).select('emailNotifications pushNotifications');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            settings: {
                emailNotifications: user.emailNotifications,
                pushNotifications: user.pushNotifications
            }
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
};