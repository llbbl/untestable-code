/**
 * This example demonstrates common error handling anti-patterns that make testing difficult:
 * 
 * 1. Swallowing errors
 * 2. Generic error handling
 * 3. Inconsistent error handling
 * 4. Error type confusion
 * 5. Error propagation issues
 * 6. Missing error context
 */

/**
 * Anti-pattern: Class with poor error handling
 */
class UserService {
    constructor() {
        this.db = require('mongodb').connect('mongodb://localhost:27017/myapp');
        this.logger = require('./logger');
        this.emailService = require('./email-service');
        this.cache = new Map();
    }

    /**
     * Anti-pattern: Swallowing errors
     */
    async getUser(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            return user;
        } catch (error) {
            // Anti-pattern: Swallowing error
            console.log('Error getting user:', error.message);
            return null;
        }
    }

    /**
     * Anti-pattern: Generic error handling
     */
    async createUser(userData) {
        try {
            const db = await this.db;
            const result = await db.collection('users').insertOne(userData);
            
            // Anti-pattern: Inconsistent error handling
            if (!result.insertedId) {
                throw new Error('Failed to create user');
            }

            // Anti-pattern: Missing error context
            await this.emailService.sendWelcomeEmail(userData.email);
            await this.logger.log('User created', { userId: result.insertedId });

            return result.insertedId;
        } catch (error) {
            // Anti-pattern: Generic error handling
            throw new Error('An error occurred');
        }
    }

    /**
     * Anti-pattern: Error type confusion
     */
    async updateUser(userId, updates) {
        try {
            const db = await this.db;
            const result = await db.collection('users').updateOne(
                { id: userId },
                { $set: updates }
            );

            // Anti-pattern: Error type confusion
            if (result.matchedCount === 0) {
                throw 'User not found';
            }

            // Anti-pattern: Inconsistent error handling
            if (result.modifiedCount === 0) {
                throw new Error('No changes made');
            }

            this.cache.delete(userId);
            return true;
        } catch (error) {
            // Anti-pattern: Generic error handling
            if (error === 'User not found') {
                return false;
            }
            throw new Error('Failed to update user');
        }
    }

    /**
     * Anti-pattern: Error propagation issues
     */
    async deleteUser(userId) {
        try {
            const db = await this.db;
            const user = await this.getUser(userId);

            // Anti-pattern: Missing error context
            if (!user) {
                throw new Error('User not found');
            }

            // Anti-pattern: Inconsistent error handling
            if (user.status === 'active') {
                throw new Error('Cannot delete active user');
            }

            await db.collection('users').deleteOne({ id: userId });
            this.cache.delete(userId);

            // Anti-pattern: Swallowing errors
            try {
                await this.emailService.sendGoodbyeEmail(user.email);
            } catch (error) {
                console.log('Failed to send goodbye email:', error.message);
            }

            return true;
        } catch (error) {
            // Anti-pattern: Generic error handling
            throw new Error('Failed to delete user');
        }
    }

    /**
     * Anti-pattern: Missing error context
     */
    async getUserWithOrders(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });

            // Anti-pattern: Missing error context
            if (!user) {
                throw new Error('User not found');
            }

            const orders = await db.collection('orders')
                .find({ userId })
                .toArray();

            // Anti-pattern: Inconsistent error handling
            if (orders.length === 0) {
                return { user, orders: [] };
            }

            return { user, orders };
        } catch (error) {
            // Anti-pattern: Generic error handling
            throw new Error('Failed to get user with orders');
        }
    }

    /**
     * Anti-pattern: Error type confusion
     */
    async validateUser(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });

            // Anti-pattern: Error type confusion
            if (!user) {
                return false;
            }

            // Anti-pattern: Inconsistent error handling
            if (user.status !== 'active') {
                throw 'User is not active';
            }

            return true;
        } catch (error) {
            // Anti-pattern: Generic error handling
            if (error === 'User is not active') {
                return false;
            }
            throw new Error('Failed to validate user');
        }
    }

    /**
     * Anti-pattern: Error propagation issues
     */
    async getUserPreferences(userId) {
        try {
            // Anti-pattern: Swallowing errors
            if (this.cache.has(userId)) {
                return this.cache.get(userId);
            }

            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });

            // Anti-pattern: Missing error context
            if (!user) {
                throw new Error('User not found');
            }

            const preferences = await db.collection('preferences')
                .findOne({ userId });

            // Anti-pattern: Inconsistent error handling
            if (!preferences) {
                return { theme: 'default', notifications: true };
            }

            this.cache.set(userId, preferences);
            return preferences;
        } catch (error) {
            // Anti-pattern: Generic error handling
            throw new Error('Failed to get user preferences');
        }
    }
}

module.exports = UserService; 