/**
 * This example demonstrates how to test code with proper state management:
 * 
 * 1. Testing state updates
 * 2. Testing state isolation
 * 3. Testing atomic operations
 * 4. Testing error states
 * 5. Testing state boundaries
 */

const {
    UserState,
    ErrorState,
    UserService,
    ActivityService,
    StateManager,
    createServices
} = require('./testable');

describe('UserState', () => {
    test('creates new instance with default values', () => {
        const state = new UserState();
        expect(state.user).toBeNull();
        expect(state.preferences).toEqual({});
        expect(state.lastActivity).toBeNull();
    });

    test('creates new instance with provided values', () => {
        const user = { id: 1, name: 'Test User' };
        const preferences = { theme: 'dark' };
        const lastActivity = new Date();
        
        const state = new UserState(user, preferences, lastActivity);
        
        expect(state.user).toBe(user);
        expect(state.preferences).toBe(preferences);
        expect(state.lastActivity).toBe(lastActivity);
    });

    test('withUser creates new instance', () => {
        const state = new UserState();
        const user = { id: 1, name: 'Test User' };
        
        const newState = state.withUser(user);
        
        expect(newState).not.toBe(state);
        expect(newState.user).toBe(user);
        expect(newState.preferences).toBe(state.preferences);
        expect(newState.lastActivity).toBe(state.lastActivity);
    });

    test('withPreferences creates new instance', () => {
        const state = new UserState();
        const preferences = { theme: 'dark' };
        
        const newState = state.withPreferences(preferences);
        
        expect(newState).not.toBe(state);
        expect(newState.user).toBe(state.user);
        expect(newState.preferences).toBe(preferences);
        expect(newState.lastActivity).toBe(state.lastActivity);
    });

    test('clear creates new instance', () => {
        const state = new UserState(
            { id: 1 },
            { theme: 'dark' },
            new Date()
        );
        
        const newState = state.clear();
        
        expect(newState).not.toBe(state);
        expect(newState.user).toBeNull();
        expect(newState.preferences).toEqual({});
        expect(newState.lastActivity).toBeNull();
    });
});

describe('ErrorState', () => {
    test('increment creates new instance', () => {
        const state = new ErrorState(5);
        const newState = state.increment();
        
        expect(newState).not.toBe(state);
        expect(newState.count).toBe(6);
    });

    test('reset creates new instance', () => {
        const state = new ErrorState(5);
        const newState = state.reset();
        
        expect(newState).not.toBe(state);
        expect(newState.count).toBe(0);
    });
});

describe('UserService', () => {
    let userService;
    let mockDb;
    let mockStateManager;

    beforeEach(() => {
        mockDb = {
            findOne: jest.fn(),
            updateOne: jest.fn()
        };
        mockStateManager = {
            getState: jest.fn(),
            updateState: jest.fn(),
            updateErrorState: jest.fn()
        };
        userService = new UserService(mockDb, mockStateManager);
    });

    describe('login', () => {
        test('updates state on successful login', async () => {
            const user = { id: 1, name: 'Test User' };
            const preferences = { theme: 'dark' };
            
            mockDb.findOne
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(preferences);
            
            const result = await userService.login('test', 'password');
            
            expect(result).toBe(true);
            expect(mockStateManager.updateState).toHaveBeenCalled();
            expect(mockStateManager.updateErrorState).not.toHaveBeenCalled();
        });

        test('updates error state on failed login', async () => {
            mockDb.findOne.mockResolvedValue(null);
            
            const result = await userService.login('test', 'password');
            
            expect(result).toBe(false);
            expect(mockStateManager.updateState).not.toHaveBeenCalled();
            expect(mockStateManager.updateErrorState).toHaveBeenCalled();
        });

        test('updates error state on database error', async () => {
            const error = new Error('Database error');
            mockDb.findOne.mockRejectedValue(error);
            
            await expect(userService.login('test', 'password'))
                .rejects.toThrow(error);
            
            expect(mockStateManager.updateState).not.toHaveBeenCalled();
            expect(mockStateManager.updateErrorState).toHaveBeenCalled();
        });
    });

    describe('updatePreferences', () => {
        test('updates state and database', async () => {
            const user = { id: 1 };
            const currentPreferences = { theme: 'light' };
            const newPreferences = { theme: 'dark' };
            
            mockStateManager.getState.mockResolvedValue(
                new UserState(user, currentPreferences)
            );
            
            const result = await userService.updatePreferences(newPreferences);
            
            expect(result).toBe(true);
            expect(mockDb.updateOne).toHaveBeenCalledWith(
                'preferences',
                { userId: 1 },
                { $set: newPreferences },
                { upsert: true }
            );
            expect(mockStateManager.updateState).toHaveBeenCalled();
        });

        test('throws error when not logged in', async () => {
            mockStateManager.getState.mockResolvedValue(new UserState());
            
            await expect(userService.updatePreferences({ theme: 'dark' }))
                .rejects.toThrow('User not logged in');
            
            expect(mockDb.updateOne).not.toHaveBeenCalled();
            expect(mockStateManager.updateState).not.toHaveBeenCalled();
        });
    });
});

describe('ActivityService', () => {
    let activityService;
    let mockDb;
    let mockStateManager;

    beforeEach(() => {
        mockDb = {
            insertOne: jest.fn(),
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn()
        };
        mockStateManager = {
            getState: jest.fn(),
            updateState: jest.fn(),
            updateErrorState: jest.fn()
        };
        activityService = new ActivityService(mockDb, mockStateManager);
    });

    describe('recordActivity', () => {
        test('updates state and database', async () => {
            const user = { id: 1 };
            const activity = 'test activity';
            
            mockStateManager.getState.mockResolvedValue(new UserState(user));
            
            const result = await activityService.recordActivity(activity);
            
            expect(result).toBe(true);
            expect(mockDb.insertOne).toHaveBeenCalledWith(
                'activities',
                expect.objectContaining({
                    userId: 1,
                    activity
                })
            );
            expect(mockStateManager.updateState).toHaveBeenCalled();
        });

        test('throws error when not logged in', async () => {
            mockStateManager.getState.mockResolvedValue(new UserState());
            
            await expect(activityService.recordActivity('test'))
                .rejects.toThrow('User not logged in');
            
            expect(mockDb.insertOne).not.toHaveBeenCalled();
            expect(mockStateManager.updateState).not.toHaveBeenCalled();
        });
    });

    describe('getRecentActivity', () => {
        test('returns activities for logged in user', async () => {
            const user = { id: 1 };
            const activities = [
                { id: 1, activity: 'test 1' },
                { id: 2, activity: 'test 2' }
            ];
            
            mockStateManager.getState.mockResolvedValue(new UserState(user));
            mockDb.toArray.mockResolvedValue(activities);
            
            const result = await activityService.getRecentActivity();
            
            expect(result).toBe(activities);
            expect(mockDb.find).toHaveBeenCalledWith('activities', { userId: 1 });
            expect(mockDb.sort).toHaveBeenCalledWith({ timestamp: -1 });
            expect(mockDb.limit).toHaveBeenCalledWith(10);
        });

        test('throws error when not logged in', async () => {
            mockStateManager.getState.mockResolvedValue(new UserState());
            
            await expect(activityService.getRecentActivity())
                .rejects.toThrow('User not logged in');
            
            expect(mockDb.find).not.toHaveBeenCalled();
        });
    });
}); 