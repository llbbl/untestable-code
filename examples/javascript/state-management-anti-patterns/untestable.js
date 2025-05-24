/**
 * This example demonstrates common state management anti-patterns that make testing difficult:
 * 
 * 1. Global mutable state
 * 2. Shared state between components
 * 3. Implicit state dependencies
 * 4. State mutation without boundaries
 * 5. Inconsistent state updates
 * 6. Race conditions
 */

// Anti-pattern: Global mutable state
let currentUser = null;
let isAuthenticated = false;
let userPreferences = {};
let lastActivity = null;
let errorCount = 0;

/**
 * Anti-pattern: Service with global state dependencies
 */
class UserService {
    constructor() {
        // Anti-pattern: Direct dependency on global state
        this.db = require('mongodb').connect('mongodb://localhost:27017');
    }

    /**
     * Anti-pattern: Implicit state dependencies
     */
    async login(username, password) {
        try {
            const db = await this.db;
            const user = await db.collection('users').findOne({ username, password });
            
            if (user) {
                // Anti-pattern: Global state mutation
                currentUser = user;
                isAuthenticated = true;
                lastActivity = new Date();
                errorCount = 0;
                
                // Anti-pattern: Implicit state dependency
                await this.loadUserPreferences();
                
                return true;
            }
            
            // Anti-pattern: Global state mutation
            errorCount++;
            return false;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }

    /**
     * Anti-pattern: Implicit state dependencies
     */
    async loadUserPreferences() {
        if (!currentUser) {
            throw new Error('User not logged in');
        }

        try {
            const db = await this.db;
            const preferences = await db.collection('preferences')
                .findOne({ userId: currentUser.id });
            
            // Anti-pattern: Global state mutation
            userPreferences = preferences || {};
            
            return userPreferences;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }

    /**
     * Anti-pattern: Inconsistent state updates
     */
    async updatePreferences(preferences) {
        if (!currentUser) {
            throw new Error('User not logged in');
        }

        try {
            const db = await this.db;
            await db.collection('preferences').updateOne(
                { userId: currentUser.id },
                { $set: preferences },
                { upsert: true }
            );
            
            // Anti-pattern: Inconsistent state update
            userPreferences = { ...userPreferences, ...preferences };
            
            return true;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }

    /**
     * Anti-pattern: Race conditions
     */
    async logout() {
        if (!currentUser) {
            return false;
        }

        try {
            const db = await this.db;
            await db.collection('users').updateOne(
                { id: currentUser.id },
                { $set: { lastLogout: new Date() } }
            );
            
            // Anti-pattern: Race condition in state updates
            currentUser = null;
            isAuthenticated = false;
            userPreferences = {};
            lastActivity = null;
            
            return true;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }
}

/**
 * Anti-pattern: Service with shared state
 */
class ActivityService {
    constructor() {
        // Anti-pattern: Direct dependency on global state
        this.db = require('mongodb').connect('mongodb://localhost:27017');
    }

    /**
     * Anti-pattern: Shared state between components
     */
    async recordActivity(activity) {
        if (!currentUser) {
            throw new Error('User not logged in');
        }

        try {
            const db = await this.db;
            await db.collection('activities').insertOne({
                userId: currentUser.id,
                activity,
                timestamp: new Date()
            });
            
            // Anti-pattern: Shared state mutation
            lastActivity = new Date();
            
            return true;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }

    /**
     * Anti-pattern: Implicit state dependencies
     */
    async getRecentActivity() {
        if (!currentUser) {
            throw new Error('User not logged in');
        }

        try {
            const db = await this.db;
            const activities = await db.collection('activities')
                .find({ userId: currentUser.id })
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();
            
            return activities;
        } catch (error) {
            // Anti-pattern: Global state mutation
            errorCount++;
            throw error;
        }
    }
}

// Anti-pattern: Global state access
function getCurrentUser() {
    return currentUser;
}

// Anti-pattern: Global state access
function isUserAuthenticated() {
    return isAuthenticated;
}

// Anti-pattern: Global state access
function getUserPreferences() {
    return userPreferences;
}

// Anti-pattern: Global state access
function getLastActivity() {
    return lastActivity;
}

// Anti-pattern: Global state access
function getErrorCount() {
    return errorCount;
}

module.exports = {
    UserService,
    ActivityService,
    getCurrentUser,
    isUserAuthenticated,
    getUserPreferences,
    getLastActivity,
    getErrorCount
}; 