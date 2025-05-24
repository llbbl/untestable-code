/**
 * This example demonstrates how to write testable asynchronous code by:
 * 
 * 1. Using consistent async patterns (Promises)
 * 2. Proper error handling
 * 3. Controlled timeouts
 * 4. Dependency injection
 * 5. Isolated state
 * 6. Clear boundaries
 */

/**
 * Database interface for dependency injection
 */
class Database {
    constructor(connection) {
        this.connection = connection;
    }

    async queryUser(userId) {
        return this.connection.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
    }
}

/**
 * Cache interface for dependency injection
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

    delete(key) {
        this.data.delete(key);
    }

    clear() {
        this.data.clear();
    }
}

/**
 * Testable data fetcher with proper async patterns
 */
class DataFetcher {
    constructor(config, db, cache) {
        this.config = config;
        this.db = db;
        this.cache = cache;
        this.activeOperations = new Set();
        this.operationResults = new Map();
    }

    /**
     * Fetch data using proper async/await pattern
     */
    async fetchData(userId) {
        try {
            // Track operation
            this.activeOperations.add(userId);

            // Validate user
            const isValid = await this.validateUser(userId);
            if (!isValid) {
                throw new Error('Invalid user');
            }

            // Check cache
            const cachedData = this.cache.get(userId);
            if (cachedData) {
                return cachedData;
            }

            // Fetch data with timeout
            const data = await this.fetchWithTimeout(
                `https://api.example.com/users/${userId}`,
                this.config.timeout
            );

            // Update cache and results
            this.cache.set(userId, data);
            this.operationResults.set(userId, data);

            return data;
        } catch (error) {
            // Proper error handling
            throw new Error(`Failed to fetch data: ${error.message}`);
        } finally {
            // Cleanup
            this.activeOperations.delete(userId);
        }
    }

    /**
     * Validate user with proper error handling
     */
    async validateUser(userId) {
        try {
            const results = await this.db.queryUser(userId);
            return results.length > 0;
        } catch (error) {
            throw new Error(`Failed to validate user: ${error.message}`);
        }
    }

    /**
     * Fetch with timeout using proper Promise pattern
     */
    async fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Get active operations (immutable)
     */
    getActiveOperations() {
        return Array.from(this.activeOperations);
    }

    /**
     * Get operation results (immutable)
     */
    getOperationResults() {
        return Object.fromEntries(this.operationResults);
    }
}

/**
 * Factory function to create a configured fetcher
 */
async function createDataFetcher(config, dbConnection) {
    const db = new Database(dbConnection);
    const cache = new Cache();
    return new DataFetcher(config, db, cache);
}

module.exports = {
    DataFetcher,
    Database,
    Cache,
    createDataFetcher
}; 