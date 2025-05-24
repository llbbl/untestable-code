/**
 * This example demonstrates how to make the same code testable by:
 * 
 * 1. Using dependency injection
 * 2. Encapsulating state
 * 3. Making dependencies explicit
 * 4. Allowing for easy mocking
 */

/**
 * Configuration interface
 */
class Config {
    constructor(apiKey, baseUrl, timeout) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }
}

/**
 * Cache interface
 */
class Cache {
    constructor() {
        this.data = new Map();
    }

    get(key) {
        return this.data.get(key);
    }

    set(key, value) {
        this.data.set(key, value);
    }

    clear() {
        this.data.clear();
    }
}

/**
 * Database interface
 */
class Database {
    constructor(connection) {
        this.connection = connection;
    }

    async updateUser(userId, user) {
        return this.connection.collection('users').updateOne(
            { id: userId },
            { $set: user },
            { upsert: true }
        );
    }
}

/**
 * User service with proper dependency injection
 * This is testable because:
 * 1. All dependencies are injected
 * 2. State is encapsulated
 * 3. Dependencies are explicit
 * 4. Easy to mock for testing
 */
class UserService {
    constructor(config, cache, db) {
        this.config = config;
        this.cache = cache;
        this.db = db;
        this.requestStats = {
            count: 0,
            lastRequestTime: null
        };
    }

    async getUser(userId) {
        // Update encapsulated state
        this.requestStats.count++;
        this.requestStats.lastRequestTime = new Date();

        // Check cache first
        const cachedUser = this.cache.get(userId);
        if (cachedUser) {
            return cachedUser;
        }

        try {
            // Make API call using injected config
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
            
            // Update cache
            this.cache.set(userId, user);
            
            // Update database if available
            if (this.db) {
                await this.db.updateUser(userId, user);
            }

            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    getRequestStats() {
        return { ...this.requestStats };
    }
}

// Factory function to create a configured service
async function createUserService(config, dbConnection = null) {
    const cache = new Cache();
    const db = dbConnection ? new Database(dbConnection) : null;
    return new UserService(config, cache, db);
}

// Example usage
async function main() {
    const config = new Config(
        process.env.API_KEY,
        process.env.API_BASE_URL,
        parseInt(process.env.API_TIMEOUT)
    );
    
    const dbConnection = await connectToDatabase();
    const userService = await createUserService(config, dbConnection);
    
    // Use the service
    const user = await userService.getUser('123');
    console.log(user);
}

// Export for testing
module.exports = {
    UserService,
    Config,
    Cache,
    Database,
    createUserService
}; 