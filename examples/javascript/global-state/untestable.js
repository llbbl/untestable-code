/**
 * This example demonstrates how global state and module scope pollution
 * makes code difficult to test. The main issues are:
 * 
 * 1. Global state affects test isolation
 * 2. State leaks between tests
 * 3. Order-dependent test execution
 * 4. Difficult to mock global dependencies
 */

// Global configuration object
const config = {
    apiKey: "secret-key",
    baseUrl: "https://api.example.com",
    timeout: 5000
};

// Global cache
let cache = {};

// Global database connection
let dbConnection = null;

// Module-level state
let requestCount = 0;
let lastRequestTime = null;

/**
 * User service that depends on global state
 * This is difficult to test because:
 * 1. It uses global config
 * 2. It maintains module-level state
 * 3. It uses a global cache
 * 4. It depends on a global database connection
 */
class UserService {
    constructor() {
        // No dependency injection, uses global state
        this.config = config;
        this.cache = cache;
        this.db = dbConnection;
    }

    async getUser(userId) {
        // Update module-level state
        requestCount++;
        lastRequestTime = new Date();

        // Check cache first
        if (this.cache[userId]) {
            return this.cache[userId];
        }

        try {
            // Make API call using global config
            const response = await fetch(`${this.config.baseUrl}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                timeout: this.config.timeout
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }

            const user = await response.json();
            
            // Update global cache
            this.cache[userId] = user;
            
            // Update global database
            if (this.db) {
                await this.db.collection('users').updateOne(
                    { id: userId },
                    { $set: user },
                    { upsert: true }
                );
            }

            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    getRequestStats() {
        // Returns module-level state
        return {
            requestCount,
            lastRequestTime
        };
    }
}

// Initialize global database connection
async function initializeDatabase() {
    dbConnection = await connectToDatabase();
}

// Export the service
module.exports = {
    UserService,
    initializeDatabase
}; 