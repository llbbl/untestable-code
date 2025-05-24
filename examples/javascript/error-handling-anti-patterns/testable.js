/**
 * This example demonstrates proper error handling patterns:
 * 
 * 1. Custom error classes
 * 2. Consistent error handling
 * 3. Proper error propagation
 * 4. Error context preservation
 * 5. Promise error handling
 * 6. Error boundaries
 */

/**
 * Custom error classes for different error types
 */
class UserError extends Error {
    constructor(message, code, cause) {
        super(message);
        this.name = 'UserError';
        this.code = code;
        this.cause = cause;
    }
}

class DatabaseError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'DatabaseError';
        this.cause = cause;
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
 * Testable user service with proper error handling
 */
class UserService {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    /**
     * Proper error handling with custom error class
     */
    async getUser(userId) {
        try {
            const user = await this.db.findOne('users', { id: userId });
            if (!user) {
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }
            return user;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to get user: ${userId}`,
                'GET_USER_ERROR',
                error
            );
        }
    }

    /**
     * Proper error handling with result type
     */
    async updateUser(userId, data) {
        try {
            const result = await this.db.updateOne(
                'users',
                { id: userId },
                { $set: data }
            );
            
            if (result.matchedCount === 0) {
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }
            
            return {
                success: true,
                updated: result.modifiedCount > 0
            };
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to update user: ${userId}`,
                'UPDATE_USER_ERROR',
                error
            );
        }
    }

    /**
     * Proper error handling with consistent pattern
     */
    async deleteUser(userId) {
        try {
            const result = await this.db.deleteOne('users', { id: userId });
            
            if (result.deletedCount === 0) {
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }
            
            return {
                success: true,
                deleted: true
            };
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to delete user: ${userId}`,
                'DELETE_USER_ERROR',
                error
            );
        }
    }

    /**
     * Proper error handling with logging
     */
    async validateUser(userId) {
        try {
            const user = await this.db.findOne('users', { id: userId });
            if (!user) {
                this.logger.warn(`User validation failed: ${userId}`);
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }
            return {
                valid: true,
                user
            };
        } catch (error) {
            this.logger.error(`User validation error: ${error.message}`);
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to validate user: ${userId}`,
                'VALIDATION_ERROR',
                error
            );
        }
    }

    /**
     * Proper promise error handling
     */
    async getUserWithOrders(userId) {
        try {
            const [user, orders] = await Promise.all([
                this.db.findOne('users', { id: userId }),
                this.db.query('orders', { userId })
            ]);

            if (!user) {
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }

            return {
                ...user,
                orders
            };
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to get user with orders: ${userId}`,
                'GET_USER_ORDERS_ERROR',
                error
            );
        }
    }

    /**
     * Proper error propagation with context
     */
    async getUserWithProfile(userId) {
        try {
            const [user, profile] = await Promise.all([
                this.db.findOne('users', { id: userId }),
                this.getUserProfile(userId)
            ]);

            if (!user) {
                throw new UserError(
                    `User not found: ${userId}`,
                    'USER_NOT_FOUND'
                );
            }

            return {
                ...user,
                profile
            };
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to get user with profile: ${userId}`,
                'GET_USER_PROFILE_ERROR',
                error
            );
        }
    }

    /**
     * Proper error handling with clear boundaries
     */
    async getUserProfile(userId) {
        try {
            const profile = await this.db.findOne('profiles', { userId });
            if (!profile) {
                throw new UserError(
                    `Profile not found for user: ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }
            return profile;
        } catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            throw new UserError(
                `Failed to get user profile: ${userId}`,
                'GET_PROFILE_ERROR',
                error
            );
        }
    }
}

/**
 * Factory function to create a configured user service
 */
async function createUserService(dbConnection, logger) {
    const db = new Database(dbConnection);
    return new UserService(db, logger);
}

module.exports = {
    UserError,
    DatabaseError,
    Database,
    UserService,
    createUserService
}; 