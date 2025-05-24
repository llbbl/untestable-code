/**
 * This example demonstrates proper handling of side effects:
 * 
 * 1. Explicit side effects
 * 2. Pure functions
 * 3. Controlled side effects
 * 4. Single responsibility
 * 5. Dependency injection
 * 6. Immutable state
 */

/**
 * Pure function for user validation
 */
function validateUser(user) {
    if (!user) {
        return {
            valid: false,
            reason: 'USER_NOT_FOUND'
        };
    }

    if (user.status === 'inactive') {
        return {
            valid: false,
            reason: 'USER_INACTIVE'
        };
    }

    return {
        valid: true,
        user
    };
}

/**
 * Immutable request stats
 */
class RequestStats {
    constructor(count = 0, lastRequest = null) {
        this.count = count;
        this.lastRequest = lastRequest;
    }

    increment() {
        return new RequestStats(
            this.count + 1,
            new Date()
        );
    }
}

/**
 * Immutable cache
 */
class Cache {
    constructor(store = new Map()) {
        this.store = new Map(store);
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        const newStore = new Map(this.store);
        newStore.set(key, value);
        return new Cache(newStore);
    }

    delete(key) {
        const newStore = new Map(this.store);
        newStore.delete(key);
        return new Cache(newStore);
    }

    clear() {
        return new Cache();
    }
}

/**
 * Testable user service with proper side effect handling
 */
class UserService {
    constructor(db, cache, logger, eventBus) {
        this.db = db;
        this.cache = cache;
        this.logger = logger;
        this.eventBus = eventBus;
        this.stats = new RequestStats();
    }

    /**
     * Pure function with explicit side effects
     */
    async getUser(userId) {
        // Explicit side effect: Logging
        this.logger.info(`Fetching user ${userId}`);

        // Update stats (immutable)
        this.stats = this.stats.increment();

        try {
            // Check cache first
            const cachedUser = this.cache.get(userId);
            if (cachedUser) {
                return cachedUser;
            }

            // Fetch from database
            const user = await this.db.findOne('users', { id: userId });
            
            // Update cache if user found
            if (user) {
                this.cache = this.cache.set(userId, user);
            }
            
            return user;
        } catch (error) {
            // Explicit side effect: Error logging
            this.logger.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Pure function with explicit side effects
     */
    async updateUser(userId, data) {
        // Explicit side effect: Logging
        this.logger.info(`Updating user ${userId}`);

        // Update stats (immutable)
        this.stats = this.stats.increment();

        try {
            const result = await this.db.updateOne(
                'users',
                { id: userId },
                { $set: data }
            );
            
            if (result.matchedCount > 0) {
                // Explicit side effects
                this.cache = this.cache.delete(userId);
                this.eventBus.emit('user:updated', { userId, data });
            }
            
            return {
                success: result.matchedCount > 0,
                updated: result.modifiedCount > 0
            };
        } catch (error) {
            // Explicit side effect: Error logging
            this.logger.error(`Error updating user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Pure function with explicit side effects
     */
    async deleteUser(userId) {
        // Explicit side effect: Logging
        this.logger.info(`Deleting user ${userId}`);

        // Update stats (immutable)
        this.stats = this.stats.increment();

        try {
            const result = await this.db.deleteOne('users', { id: userId });
            
            if (result.deletedCount > 0) {
                // Explicit side effects
                this.cache = this.cache.delete(userId);
                await this.redis.del(`user:${userId}`);
                this.eventBus.emit('user:deleted', { userId });
            }
            
            return {
                success: result.deletedCount > 0
            };
        } catch (error) {
            // Explicit side effect: Error logging
            this.logger.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Pure function with explicit side effects
     */
    async validateUser(userId) {
        // Explicit side effect: Logging
        this.logger.info(`Validating user ${userId}`);

        // Update stats (immutable)
        this.stats = this.stats.increment();

        try {
            const user = await this.db.findOne('users', { id: userId });
            const validation = validateUser(user);
            
            if (!validation.valid) {
                // Explicit side effect: Warning logging
                this.logger.warn(`User validation failed: ${validation.reason}`);
                return validation;
            }

            // Explicit side effect: Cache update
            this.cache = this.cache.set(userId, validation.user);
            
            return validation;
        } catch (error) {
            // Explicit side effect: Error logging
            this.logger.error(`Error validating user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Pure function with explicit side effects
     */
    async getUserWithOrders(userId) {
        // Explicit side effect: Logging
        this.logger.info(`Fetching user ${userId} with orders`);

        // Update stats (immutable)
        this.stats = this.stats.increment();

        try {
            // Parallel requests for better performance
            const [user, orders] = await Promise.all([
                this.db.findOne('users', { id: userId }),
                this.db.query('orders', { userId })
            ]);
            
            if (!user) {
                // Explicit side effect: Warning logging
                this.logger.warn(`User not found: ${userId}`);
                return null;
            }

            const result = {
                ...user,
                orders
            };

            // Explicit side effect: Cache update
            this.cache = this.cache.set(userId, result);
            
            return result;
        } catch (error) {
            // Explicit side effect: Error logging
            this.logger.error(`Error fetching user ${userId} with orders:`, error);
            throw error;
        }
    }

    /**
     * Get current request stats
     */
    getRequestStats() {
        return {
            count: this.stats.count,
            lastRequest: this.stats.lastRequest
        };
    }
}

/**
 * Factory function to create a configured user service
 */
async function createUserService(dbConnection, cacheStore, logger, eventBus) {
    const db = new Database(dbConnection);
    const cache = new Cache(cacheStore);
    return new UserService(db, cache, logger, eventBus);
}

module.exports = {
    validateUser,
    RequestStats,
    Cache,
    UserService,
    createUserService
}; 