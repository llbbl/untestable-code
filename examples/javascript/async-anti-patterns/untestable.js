/**
 * This example demonstrates common asynchronous code anti-patterns that make testing difficult:
 * 
 * 1. Callback hell and nested callbacks
 * 2. Unhandled promise rejections
 * 3. Race conditions
 * 4. Timeout handling issues
 * 5. Mixed async patterns
 * 6. Uncontrolled side effects
 */

// Global state for tracking operations
let activeOperations = new Set();
let operationResults = new Map();

/**
 * Data fetcher with multiple anti-patterns
 */
class DataFetcher {
    constructor() {
        this.cache = new Map();
        this.timeouts = new Map();
    }

    /**
     * Anti-pattern: Callback hell, unhandled rejections, race conditions
     */
    fetchDataWithCallbacks(userId, callback) {
        // Anti-pattern: Global state mutation
        activeOperations.add(userId);

        // Anti-pattern: Nested callbacks
        this.validateUser(userId, (isValid) => {
            if (!isValid) {
                callback(new Error('Invalid user'));
                return;
            }

            // Anti-pattern: Race condition with cache
            if (this.cache.has(userId)) {
                callback(null, this.cache.get(userId));
                return;
            }

            // Anti-pattern: Unhandled promise rejection
            fetch(`https://api.example.com/users/${userId}`)
                .then(response => response.json())
                .then(data => {
                    // Anti-pattern: Global state mutation
                    this.cache.set(userId, data);
                    operationResults.set(userId, data);
                    callback(null, data);
                })
                .catch(error => {
                    // Anti-pattern: Swallowed error
                    console.error('Error fetching data:', error);
                    callback(error);
                })
                .finally(() => {
                    // Anti-pattern: Global state mutation
                    activeOperations.delete(userId);
                });
        });
    }

    /**
     * Anti-pattern: Mixed async patterns, timeout issues
     */
    async fetchDataWithMixedPatterns(userId) {
        // Anti-pattern: Global state mutation
        activeOperations.add(userId);

        // Anti-pattern: Uncontrolled timeout
        const timeoutId = setTimeout(() => {
            // Anti-pattern: Side effect after timeout
            this.cache.delete(userId);
            activeOperations.delete(userId);
        }, 5000);

        this.timeouts.set(userId, timeoutId);

        try {
            // Anti-pattern: Mixed async patterns (Promise + callback)
            return new Promise((resolve, reject) => {
                this.validateUser(userId, (isValid) => {
                    if (!isValid) {
                        reject(new Error('Invalid user'));
                        return;
                    }

                    // Anti-pattern: Race condition with cache
                    if (this.cache.has(userId)) {
                        resolve(this.cache.get(userId));
                        return;
                    }

                    // Anti-pattern: Unhandled promise rejection
                    fetch(`https://api.example.com/users/${userId}`)
                        .then(response => response.json())
                        .then(data => {
                            // Anti-pattern: Global state mutation
                            this.cache.set(userId, data);
                            operationResults.set(userId, data);
                            resolve(data);
                        })
                        .catch(error => {
                            // Anti-pattern: Swallowed error
                            console.error('Error fetching data:', error);
                            reject(error);
                        })
                        .finally(() => {
                            // Anti-pattern: Global state mutation
                            activeOperations.delete(userId);
                            clearTimeout(this.timeouts.get(userId));
                            this.timeouts.delete(userId);
                        });
                });
            });
        } catch (error) {
            // Anti-pattern: Swallowed error
            console.error('Error in fetchDataWithMixedPatterns:', error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Uncontrolled side effects, no error handling
     */
    validateUser(userId, callback) {
        // Anti-pattern: Direct database access
        const db = require('./database');
        
        // Anti-pattern: Callback without error handling
        db.query(`SELECT * FROM users WHERE id = ${userId}`, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                callback(false);
                return;
            }
            callback(results.length > 0);
        });
    }

    /**
     * Anti-pattern: Exposed internal state
     */
    getActiveOperations() {
        return Array.from(activeOperations);
    }

    getOperationResults() {
        return Object.fromEntries(operationResults);
    }
}

module.exports = DataFetcher; 