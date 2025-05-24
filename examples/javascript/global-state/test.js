/**
 * This example demonstrates how to test the testable version of the code.
 * The main benefits are:
 * 
 * 1. Easy to mock dependencies
 * 2. Tests are isolated
 * 3. No global state to manage
 * 4. Clear test boundaries
 */

const { UserService, Config, Cache, Database } = require('./testable');

// Mock fetch
global.fetch = jest.fn();

describe('UserService', () => {
    let userService;
    let mockConfig;
    let mockCache;
    let mockDb;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock dependencies
        mockConfig = new Config('test-key', 'http://test-api.com', 1000);
        mockCache = new Cache();
        mockDb = {
            updateUser: jest.fn()
        };

        // Create service with mock dependencies
        userService = new UserService(mockConfig, mockCache, mockDb);
    });

    describe('getUser', () => {
        it('should return cached user if available', async () => {
            // Arrange
            const cachedUser = { id: '123', name: 'Test User' };
            mockCache.set('123', cachedUser);

            // Act
            const result = await userService.getUser('123');

            // Assert
            expect(result).toEqual(cachedUser);
            expect(fetch).not.toHaveBeenCalled();
            expect(mockDb.updateUser).not.toHaveBeenCalled();
        });

        it('should fetch and cache user if not in cache', async () => {
            // Arrange
            const apiUser = { id: '123', name: 'Test User' };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(apiUser)
            });

            // Act
            const result = await userService.getUser('123');

            // Assert
            expect(result).toEqual(apiUser);
            expect(fetch).toHaveBeenCalledWith(
                'http://test-api.com/users/123',
                expect.any(Object)
            );
            expect(mockCache.get('123')).toEqual(apiUser);
            expect(mockDb.updateUser).toHaveBeenCalledWith('123', apiUser);
        });

        it('should throw error if API call fails', async () => {
            // Arrange
            global.fetch.mockResolvedValueOnce({
                ok: false
            });

            // Act & Assert
            await expect(userService.getUser('123')).rejects.toThrow('Failed to fetch user');
        });

        it('should update request stats', async () => {
            // Arrange
            const apiUser = { id: '123', name: 'Test User' };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(apiUser)
            });

            // Act
            await userService.getUser('123');
            const stats = userService.getRequestStats();

            // Assert
            expect(stats.count).toBe(1);
            expect(stats.lastRequestTime).toBeInstanceOf(Date);
        });
    });

    describe('getRequestStats', () => {
        it('should return a copy of request stats', () => {
            // Arrange
            userService.requestStats.count = 5;
            userService.requestStats.lastRequestTime = new Date();

            // Act
            const stats = userService.getRequestStats();

            // Assert
            expect(stats).toEqual(userService.requestStats);
            expect(stats).not.toBe(userService.requestStats); // Should be a copy
        });
    });
}); 