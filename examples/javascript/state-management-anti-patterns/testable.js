/**
 * This example demonstrates proper state management:
 * 
 * 1. Encapsulated state
 * 2. Immutable state updates
 * 3. Clear state boundaries
 * 4. Predictable state changes
 * 5. State isolation
 * 6. Atomic state updates
 */

/**
 * Immutable user state
 */
class UserState {
    constructor(user = null, preferences = {}, lastActivity = null) {
        this.user = user;
        this.preferences = preferences;
        this.lastActivity = lastActivity;
    }

    withUser(user) {
        return new UserState(user, this.preferences, this.lastActivity);
    }

    withPreferences(preferences) {
        return new UserState(this.user, preferences, this.lastActivity);
    }

    withLastActivity(lastActivity) {
        return new UserState(this.user, this.preferences, lastActivity);
    }

    clear() {
        return new UserState();
    }
}

/**
 * Immutable error state
 */
class ErrorState {
    constructor(count = 0) {
        this.count = count;
    }

    increment() {
        return new ErrorState(this.count + 1);
    }

    reset() {
        return new ErrorState();
    }
}

/**
 * Testable user service with proper state management
 */
class UserService {
    constructor(db, stateManager) {
        this.db = db;
        this.stateManager = stateManager;
    }

    /**
     * Atomic state update with clear boundaries
     */
    async login(username, password) {
        try {
            const user = await this.db.findOne('users', { username, password });
            
            if (user) {
                // Atomic state update
                await this.stateManager.updateState(async (state) => {
                    const preferences = await this.db.findOne('preferences', { userId: user.id });
                    return state
                        .withUser(user)
                        .withPreferences(preferences || {})
                        .withLastActivity(new Date());
                });
                
                return true;
            }
            
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            return false;
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }

    /**
     * Predictable state update
     */
    async loadUserPreferences() {
        const state = await this.stateManager.getState();
        if (!state.user) {
            throw new Error('User not logged in');
        }

        try {
            const preferences = await this.db.findOne('preferences', { userId: state.user.id });
            
            // Atomic state update
            await this.stateManager.updateState(state => 
                state.withPreferences(preferences || {})
            );
            
            return preferences || {};
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }

    /**
     * Atomic state update
     */
    async updatePreferences(preferences) {
        const state = await this.stateManager.getState();
        if (!state.user) {
            throw new Error('User not logged in');
        }

        try {
            await this.db.updateOne(
                'preferences',
                { userId: state.user.id },
                { $set: preferences },
                { upsert: true }
            );
            
            // Atomic state update
            await this.stateManager.updateState(state => 
                state.withPreferences({ ...state.preferences, ...preferences })
            );
            
            return true;
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }

    /**
     * Atomic state update
     */
    async logout() {
        const state = await this.stateManager.getState();
        if (!state.user) {
            return false;
        }

        try {
            await this.db.updateOne(
                'users',
                { id: state.user.id },
                { $set: { lastLogout: new Date() } }
            );
            
            // Atomic state update
            await this.stateManager.updateState(state => state.clear());
            
            return true;
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }
}

/**
 * Testable activity service with proper state management
 */
class ActivityService {
    constructor(db, stateManager) {
        this.db = db;
        this.stateManager = stateManager;
    }

    /**
     * Atomic state update
     */
    async recordActivity(activity) {
        const state = await this.stateManager.getState();
        if (!state.user) {
            throw new Error('User not logged in');
        }

        try {
            await this.db.insertOne('activities', {
                userId: state.user.id,
                activity,
                timestamp: new Date()
            });
            
            // Atomic state update
            await this.stateManager.updateState(state => 
                state.withLastActivity(new Date())
            );
            
            return true;
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }

    /**
     * Read-only operation
     */
    async getRecentActivity() {
        const state = await this.stateManager.getState();
        if (!state.user) {
            throw new Error('User not logged in');
        }

        try {
            return await this.db.find('activities', { userId: state.user.id })
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();
        } catch (error) {
            // Atomic error state update
            await this.stateManager.updateErrorState(state => state.increment());
            throw error;
        }
    }
}

/**
 * State manager for atomic updates
 */
class StateManager {
    constructor() {
        this.state = new UserState();
        this.errorState = new ErrorState();
    }

    async getState() {
        return this.state;
    }

    async getErrorState() {
        return this.errorState;
    }

    async updateState(updateFn) {
        this.state = await updateFn(this.state);
    }

    async updateErrorState(updateFn) {
        this.errorState = await updateFn(this.errorState);
    }
}

/**
 * Factory function to create configured services
 */
async function createServices(dbConnection) {
    const db = new Database(dbConnection);
    const stateManager = new StateManager();
    
    return {
        userService: new UserService(db, stateManager),
        activityService: new ActivityService(db, stateManager),
        stateManager
    };
}

module.exports = {
    UserState,
    ErrorState,
    UserService,
    ActivityService,
    StateManager,
    createServices
}; 