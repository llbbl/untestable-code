/**
 * This example demonstrates proper error handling with:
 * 
 * 1. Custom error classes
 * 2. Consistent error handling
 * 3. Error context preservation
 * 4. Proper error propagation
 * 5. Error type safety
 * 6. Error recovery strategies
 */

/**
 * Custom error classes for different error types
 */
class UserError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = 'UserError';
        this.context = context;
    }
}

class ValidationError extends UserError {
    constructor(message, context = {}) {
        super(message, context);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends UserError {
    constructor(message, context = {}) {
        super(message, context);
        this.name = 'NotFoundError';
    }
}

class DatabaseError extends UserError {
    constructor(message, context = {}) {
        super(message, context);
        this.name = 'DatabaseError';
    }
}

/**
 * Error boundary for database operations
 */
class Database {
    constructor(connection) {
        this.connection = connection;
    }

    async query(collection, query) {
        try {
            const db = await this.connection;
            return await db.collection(collection).find(query).toArray();
        } catch (error) {
            throw new DatabaseError(
                `Failed to query ${collection}`,
                error
            );
        }
    }

    async findOne(collection, query) {
        try {
            const db = await this.connection;
            return await db.collection(collection).findOne(query);
        } catch (error) {
            throw new DatabaseError(
                `Failed to find document in ${collection}`,
                error
            );
        }
    }

    async updateOne(collection, query, update) {
        try {
            const db = await this.connection;
            return await db.collection(collection).updateOne(query, update);
        } catch (error) {
            throw new DatabaseError(
                `Failed to update document in ${collection}`,
                error
            );
        }
    }

    async deleteOne(collection, query) {
        try {
            const db = await this.connection;
            return await db.collection(collection).deleteOne(query);
        } catch (error) {
            throw new DatabaseError(
                `Failed to delete document from ${collection}`,
                error
            );
        }
    }
}

/**
 * Class for handling user operations with proper error handling
 */
class UserService {
    constructor(dependencies) {
        this.db = dependencies.db;
        this.logger = dependencies.logger;
        this.emailService = dependencies.emailService;
        this.cache = dependencies.cache;
    }

    /**
     * Get user with proper error handling
     */
    async getUser(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });

            if (!user) {
                throw new NotFoundError('User not found', { userId });
            }

            return user;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to get user', { userId, cause: error });
        }
    }

    /**
     * Create user with proper error handling
     */
    async createUser(userData) {
        try {
            // Validate user data
            this.validateUserData(userData);

            const db = await this.db;
            const result = await db.collection('users').insertOne(userData);

            if (!result.insertedId) {
                throw new DatabaseError('Failed to create user', { userData });
            }

            // Send welcome email
            try {
                await this.emailService.sendWelcomeEmail(userData.email);
            } catch (error) {
                this.logger.warn('Failed to send welcome email', {
                    userId: result.insertedId,
                    error: error.message
                });
            }

            this.logger.info('User created', { userId: result.insertedId });
            return result.insertedId;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to create user', { userData, cause: error });
        }
    }

    /**
     * Update user with proper error handling
     */
    async updateUser(userId, updates) {
        try {
            // Validate updates
            this.validateUserUpdates(updates);

            const db = await this.db;
            const result = await db.collection('users').updateOne(
                { id: userId },
                { $set: updates }
            );

            if (result.matchedCount === 0) {
                throw new NotFoundError('User not found', { userId });
            }

            if (result.modifiedCount === 0) {
                throw new ValidationError('No changes made', { userId, updates });
            }

            this.cache.delete(userId);
            return true;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to update user', { userId, updates, cause: error });
        }
    }

    /**
     * Delete user with proper error handling
     */
    async deleteUser(userId) {
        try {
            const user = await this.getUser(userId);

            if (user.status === 'active') {
                throw new ValidationError('Cannot delete active user', { userId });
            }

            const db = await this.db;
            const result = await db.collection('users').deleteOne({ id: userId });

            if (result.deletedCount === 0) {
                throw new DatabaseError('Failed to delete user', { userId });
            }

            this.cache.delete(userId);

            // Send goodbye email
            try {
                await this.emailService.sendGoodbyeEmail(user.email);
            } catch (error) {
                this.logger.warn('Failed to send goodbye email', {
                    userId,
                    error: error.message
                });
            }

            return true;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to delete user', { userId, cause: error });
        }
    }

    /**
     * Get user with orders with proper error handling
     */
    async getUserWithOrders(userId) {
        try {
            const user = await this.getUser(userId);
            const db = await this.db;

            const orders = await db.collection('orders')
                .find({ userId })
                .toArray();

            return { user, orders };
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to get user with orders', { userId, cause: error });
        }
    }

    /**
     * Validate user with proper error handling
     */
    async validateUser(userId) {
        try {
            const user = await this.getUser(userId);

            if (user.status !== 'active') {
                throw new ValidationError('User is not active', { userId });
            }

            return true;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to validate user', { userId, cause: error });
        }
    }

    /**
     * Get user preferences with proper error handling
     */
    async getUserPreferences(userId) {
        try {
            // Check cache first
            const cachedPreferences = await this.cache.get(userId);
            if (cachedPreferences) {
                return cachedPreferences;
            }

            const user = await this.getUser(userId);
            const db = await this.db;

            const preferences = await db.collection('preferences')
                .findOne({ userId });

            if (!preferences) {
                return { theme: 'default', notifications: true };
            }

            await this.cache.set(userId, preferences);
            return preferences;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new DatabaseError('Failed to get user preferences', { userId, cause: error });
        }
    }

    /**
     * Validate user data
     */
    validateUserData(userData) {
        if (!userData.email) {
            throw new ValidationError('Email is required', { userData });
        }
        if (!userData.name) {
            throw new ValidationError('Name is required', { userData });
        }
    }

    /**
     * Validate user updates
     */
    validateUserUpdates(updates) {
        if (updates.email && !this.isValidEmail(updates.email)) {
            throw new ValidationError('Invalid email format', { updates });
        }
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

/**
 * Factory function for creating UserService
 */
const createUserService = (dependencies) => {
    return new UserService(dependencies);
};

module.exports = {
    createUserService,
    UserError,
    ValidationError,
    NotFoundError,
    DatabaseError
}; 