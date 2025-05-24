/**
 * This example demonstrates how to test code with proper dependency management:
 * 
 * 1. Mocking dependencies
 * 2. Testing with injected dependencies
 * 3. Testing error cases
 * 4. Testing configuration
 * 5. Testing service interactions
 */

const {
    Config,
    UserService,
    OrderService
} = require('./testable');

// Mock fetch
global.fetch = jest.fn();

describe('UserService', () => {
    let userService;
    let mockConfig;
    let mockDb;
    let mockApi;
    let mockCache;
    let mockLogger;
    let mockErrorHandler;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock dependencies
        mockConfig = new Config({
            database: { url: 'test-url' },
            api: { baseUrl: 'http://test-api.com', timeout: 1000 },
            features: { useCache: true }
        });
        
        mockDb = {
            query: jest.fn()
        };
        
        mockApi = {
            request: jest.fn()
        };
        
        mockCache = {
            get: jest.fn(),
            set: jest.fn()
        };
        
        mockLogger = {
            info: jest.fn(),
            error: jest.fn()
        };
        
        mockErrorHandler = {
            handle: jest.fn()
        };

        // Create service with mock dependencies
        userService = new UserService(
            mockConfig,
            mockDb,
            mockApi,
            mockCache,
            mockLogger,
            mockErrorHandler
        );
    });

    describe('getUser', () => {
        it('should return cached user if available', async () => {
            // Arrange
            const cachedUser = { id: '123', name: 'Test User' };
            mockCache.get.mockResolvedValue(JSON.stringify(cachedUser));

            // Act
            const result = await userService.getUser('123');

            // Assert
            expect(result).toEqual(cachedUser);
            expect(mockApi.request).not.toHaveBeenCalled();
            expect(mockDb.query).not.toHaveBeenCalled();
            expect(mockCache.set).not.toHaveBeenCalled();
        });

        it('should fetch and cache user if not in cache', async () => {
            // Arrange
            const apiUser = { id: '123', name: 'Test User' };
            mockCache.get.mockResolvedValue(null);
            mockApi.request.mockResolvedValue(apiUser);
            mockDb.query.mockResolvedValue([{ id: '123' }]);

            // Act
            const result = await userService.getUser('123');

            // Assert
            expect(result).toEqual(apiUser);
            expect(mockApi.request).toHaveBeenCalledWith('/users/123');
            expect(mockDb.query).toHaveBeenCalledWith('users', { id: '123' });
            expect(mockCache.set).toHaveBeenCalledWith(
                'user:123',
                JSON.stringify(apiUser)
            );
        });

        it('should handle API errors', async () => {
            // Arrange
            const error = new Error('API error');
            mockCache.get.mockResolvedValue(null);
            mockApi.request.mockRejectedValue(error);

            // Act & Assert
            await expect(userService.getUser('123')).rejects.toThrow('API error');
            expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
        });

        it('should handle database errors', async () => {
            // Arrange
            const apiUser = { id: '123', name: 'Test User' };
            const error = new Error('DB error');
            mockCache.get.mockResolvedValue(null);
            mockApi.request.mockResolvedValue(apiUser);
            mockDb.query.mockRejectedValue(error);

            // Act & Assert
            await expect(userService.getUser('123')).rejects.toThrow('DB error');
            expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
        });

        it('should log user fetch attempts', async () => {
            // Arrange
            const apiUser = { id: '123', name: 'Test User' };
            mockCache.get.mockResolvedValue(null);
            mockApi.request.mockResolvedValue(apiUser);
            mockDb.query.mockResolvedValue([{ id: '123' }]);

            // Act
            await userService.getUser('123');

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith('Fetching user 123');
        });
    });
});

describe('OrderService', () => {
    let orderService;
    let mockDb;
    let mockUserService;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock dependencies
        mockDb = {
            query: jest.fn()
        };
        
        mockUserService = {
            getUser: jest.fn()
        };

        // Create service with mock dependencies
        orderService = new OrderService(mockDb, mockUserService);
    });

    describe('getOrder', () => {
        it('should return order with user details', async () => {
            // Arrange
            const order = { id: '456', userId: '123', total: 100 };
            const user = { id: '123', name: 'Test User' };
            mockDb.query.mockResolvedValue([order]);
            mockUserService.getUser.mockResolvedValue(user);

            // Act
            const result = await orderService.getOrder('456');

            // Assert
            expect(result).toEqual({
                id: '456',
                userId: '123',
                total: 100,
                user: { id: '123', name: 'Test User' }
            });
            expect(mockDb.query).toHaveBeenCalledWith('orders', { id: '456' });
            expect(mockUserService.getUser).toHaveBeenCalledWith('123');
        });

        it('should handle database errors', async () => {
            // Arrange
            const error = new Error('DB error');
            mockDb.query.mockRejectedValue(error);

            // Act & Assert
            await expect(orderService.getOrder('456')).rejects.toThrow('DB error');
        });

        it('should handle user service errors', async () => {
            // Arrange
            const order = { id: '456', userId: '123', total: 100 };
            const error = new Error('User service error');
            mockDb.query.mockResolvedValue([order]);
            mockUserService.getUser.mockRejectedValue(error);

            // Act & Assert
            await expect(orderService.getOrder('456')).rejects.toThrow('User service error');
        });
    });
}); 