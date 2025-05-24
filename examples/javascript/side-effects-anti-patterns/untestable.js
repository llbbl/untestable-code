/**
 * This example demonstrates common side effects anti-patterns that make testing difficult:
 * 
 * 1. Hidden side effects
 * 2. Global state mutation
 * 3. Impure functions
 * 4. Uncontrolled side effects
 * 5. Mixed responsibilities
 * 6. Temporal coupling
 */

// Anti-pattern: Global state
let userCache = new Map();
let requestCount = 0;
let lastRequestTime = null;

/**
 * Anti-pattern: Service with side effects
 */
class UserService {
    constructor() {
        // Anti-pattern: Direct dependency on external service
        this.db = require('mongodb').connect('mongodb://localhost:27017');
        // Anti-pattern: Direct dependency on external service
        this.redis = require('redis').createClient();
        // Anti-pattern: Direct dependency on external service
        this.logger = require('winston').createLogger();
    }

    /**
     * Anti-pattern: Hidden side effects
     */
    async getUser(userId) {
        // Anti-pattern: Global state mutation
        requestCount++;
        lastRequestTime = new Date();

        // Anti-pattern: Hidden side effect (logging)
        this.logger.info(`Fetching user ${userId}`);

        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            
            // Anti-pattern: Hidden side effect (caching)
            if (user) {
                userCache.set(userId, user);
            }
            
            return user;
        } catch (error) {
            // Anti-pattern: Hidden side effect (error logging)
            this.logger.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Impure function with side effects
     */
    async updateUser(userId, data) {
        // Anti-pattern: Global state mutation
        requestCount++;
        lastRequestTime = new Date();

        // Anti-pattern: Hidden side effect (logging)
        this.logger.info(`Updating user ${userId}`);

        try {
            const db = await this.db;
            await db.collection('users').updateOne(
                { id: userId },
                { $set: data }
            );
            
            // Anti-pattern: Hidden side effect (cache invalidation)
            userCache.delete(userId);
            
            // Anti-pattern: Hidden side effect (event emission)
            require('event-bus').emit('user:updated', { userId, data });
            
            return true;
        } catch (error) {
            // Anti-pattern: Hidden side effect (error logging)
            this.logger.error(`Error updating user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Uncontrolled side effects
     */
    async deleteUser(userId) {
        // Anti-pattern: Global state mutation
        requestCount++;
        lastRequestTime = new Date();

        // Anti-pattern: Hidden side effect (logging)
        this.logger.info(`Deleting user ${userId}`);

        try {
            const db = await this.db;
            const result = await db.collection('users').deleteOne({ id: userId });
            
            if (result.deletedCount > 0) {
                // Anti-pattern: Multiple side effects
                userCache.delete(userId);
                await this.redis.del(`user:${userId}`);
                require('event-bus').emit('user:deleted', { userId });
            }
            
            return result.deletedCount > 0;
        } catch (error) {
            // Anti-pattern: Hidden side effect (error logging)
            this.logger.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Mixed responsibilities
     */
    async validateUser(userId) {
        // Anti-pattern: Global state mutation
        requestCount++;
        lastRequestTime = new Date();

        // Anti-pattern: Hidden side effect (logging)
        this.logger.info(`Validating user ${userId}`);

        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            
            if (!user) {
                // Anti-pattern: Hidden side effect (error logging)
                this.logger.warn(`User not found: ${userId}`);
                return false;
            }

            // Anti-pattern: Mixed responsibilities (validation + side effects)
            if (user.status === 'inactive') {
                // Anti-pattern: Hidden side effect (event emission)
                require('event-bus').emit('user:inactive', { userId });
                return false;
            }

            // Anti-pattern: Hidden side effect (cache update)
            userCache.set(userId, user);
            
            return true;
        } catch (error) {
            // Anti-pattern: Hidden side effect (error logging)
            this.logger.error(`Error validating user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Temporal coupling
     */
    async getUserWithOrders(userId) {
        // Anti-pattern: Global state mutation
        requestCount++;
        lastRequestTime = new Date();

        // Anti-pattern: Hidden side effect (logging)
        this.logger.info(`Fetching user ${userId} with orders`);

        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            
            if (!user) {
                // Anti-pattern: Hidden side effect (error logging)
                this.logger.warn(`User not found: ${userId}`);
                return null;
            }

            // Anti-pattern: Temporal coupling (order depends on user)
            const orders = await db.collection('orders').find({ userId }).toArray();
            
            // Anti-pattern: Hidden side effect (cache update)
            userCache.set(userId, { ...user, orders });
            
            return {
                ...user,
                orders
            };
        } catch (error) {
            // Anti-pattern: Hidden side effect (error logging)
            this.logger.error(`Error fetching user ${userId} with orders:`, error);
            throw error;
        }
    }
}

// Anti-pattern: Global state access
function getRequestStats() {
    return {
        count: requestCount,
        lastRequest: lastRequestTime
    };
}

// Anti-pattern: Global state mutation
function clearCache() {
    userCache.clear();
}

module.exports = {
    UserService,
    getRequestStats,
    clearCache
}; 