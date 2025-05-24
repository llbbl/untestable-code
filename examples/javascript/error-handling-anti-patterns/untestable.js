/**
 * This example demonstrates common error handling anti-patterns that make testing difficult:
 * 
 * 1. Swallowing errors
 * 2. Generic error handling
 * 3. Inconsistent error handling
 * 4. Error state mutation
 * 5. Unhandled promise rejections
 * 6. Error propagation issues
 */

// Anti-pattern: Global error state
let lastError = null;
let errorCount = 0;

/**
 * Anti-pattern: Service with poor error handling
 */
class UserService {
    constructor() {
        // Anti-pattern: Direct dependency on external service
        this.db = require('mongodb').connect('mongodb://localhost:27017');
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
            console.error('Error fetching user:', error);
            return null;
        }
    }

    /**
     * Anti-pattern: Generic error handling
     */
    async updateUser(userId, data) {
        try {
            const db = await this.db;
            await db.collection('users').updateOne(
                { id: userId },
                { $set: data }
            );
            return true;
        } catch (error) {
            // Anti-pattern: Generic error handling
            console.error('An error occurred:', error);
            return false;
        }
    }

    /**
     * Anti-pattern: Inconsistent error handling
     */
    async deleteUser(userId) {
        try {
            const db = await this.db;
            const result = await db.collection('users').deleteOne({ id: userId });
            if (result.deletedCount === 0) {
                // Anti-pattern: Inconsistent error handling
                throw new Error('User not found');
            }
            return true;
        } catch (error) {
            // Anti-pattern: Different error handling pattern
            if (error.message === 'User not found') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Anti-pattern: Error state mutation
     */
    async validateUser(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            if (!user) {
                // Anti-pattern: Mutating global state
                lastError = new Error('User not found');
                errorCount++;
                return false;
            }
            return true;
        } catch (error) {
            // Anti-pattern: Mutating global state
            lastError = error;
            errorCount++;
            return false;
        }
    }

    /**
     * Anti-pattern: Unhandled promise rejections
     */
    async getUserWithOrders(userId) {
        const db = await this.db;
        const user = await db.collection('users').findOne({ id: userId });
        
        // Anti-pattern: Unhandled promise rejection
        const orders = db.collection('orders').find({ userId }).toArray();
        
        return {
            ...user,
            orders
        };
    }

    /**
     * Anti-pattern: Error propagation issues
     */
    async getUserWithProfile(userId) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ id: userId });
            
            // Anti-pattern: Error propagation issues
            const profile = await this.getUserProfile(userId);
            
            return {
                ...user,
                profile
            };
        } catch (error) {
            // Anti-pattern: Losing error context
            throw new Error('Failed to get user with profile');
        }
    }

    /**
     * Anti-pattern: Hidden error handling
     */
    async getUserProfile(userId) {
        const db = await this.db;
        return db.collection('profiles').findOne({ userId });
    }
}

// Anti-pattern: Global error handler
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    // Anti-pattern: Swallowing unhandled rejections
});

module.exports = {
    UserService,
    getLastError: () => lastError,
    getErrorCount: () => errorCount
}; 