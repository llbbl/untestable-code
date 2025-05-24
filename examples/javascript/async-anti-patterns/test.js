/**
 * This example demonstrates how to test asynchronous code properly:
 * 
 * 1. Mocking async dependencies
 * 2. Testing success and error cases
 * 3. Testing timeouts
 * 4. Verifying state changes
 * 5. Testing cleanup
 */

const { DataFetcher, Database, Cache } = require('./testable');

// Mock fetch
global.fetch = jest.fn();

describe('DataFetcher', () => {
    let dataFetcher;
    let mockConfig;
    let mockDb;
    let mockCache;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock dependencies
        mockConfig = {
            apiKey: 'test-key',
            timeout: 1000
        };
        
        mockDb = {
            queryUser: jest.fn()
        };
        
        mockCache = new Cache();

        // Create fetcher with mock dependencies
        dataFetcher = new DataFetcher(mockConfig, mockDb, mockCache);
    });

    describe('fetchData', () => {
        it('should return cached data if available', async () => {
            // Arrange
            const cachedData = { id: '123', name: 'Test User' };
            mockCache.set('123', cachedData);
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);

            // Act
            const result = await dataFetcher.fetchData('123');

            // Assert
            expect(result).toEqual(cachedData);
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should fetch and cache data if not in cache', async () => {
            // Arrange
            const apiData = { id: '123', name: 'Test User' };
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(apiData)
            });

            // Act
            const result = await dataFetcher.fetchData('123');

            // Assert
            expect(result).toEqual(apiData);
            expect(mockCache.get('123')).toEqual(apiData);
            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/users/123',
                expect.any(Object)
            );
        });

        it('should throw error if user is invalid', async () => {
            // Arrange
            mockDb.queryUser.mockResolvedValue([]);

            // Act & Assert
            await expect(dataFetcher.fetchData('123')).rejects.toThrow('Invalid user');
        });

        it('should throw error if API call fails', async () => {
            // Arrange
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            // Act & Assert
            await expect(dataFetcher.fetchData('123')).rejects.toThrow('HTTP error! status: 404');
        });

        it('should handle timeout correctly', async () => {
            // Arrange
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);
            global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

            // Act & Assert
            await expect(dataFetcher.fetchData('123')).rejects.toThrow('The operation was aborted');
        });

        it('should clean up active operations after completion', async () => {
            // Arrange
            const apiData = { id: '123', name: 'Test User' };
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(apiData)
            });

            // Act
            await dataFetcher.fetchData('123');

            // Assert
            expect(dataFetcher.getActiveOperations()).not.toContain('123');
        });

        it('should clean up active operations after error', async () => {
            // Arrange
            mockDb.queryUser.mockRejectedValue(new Error('DB error'));

            // Act & Assert
            await expect(dataFetcher.fetchData('123')).rejects.toThrow('Failed to validate user');
            expect(dataFetcher.getActiveOperations()).not.toContain('123');
        });
    });

    describe('validateUser', () => {
        it('should return true for valid user', async () => {
            // Arrange
            mockDb.queryUser.mockResolvedValue([{ id: '123' }]);

            // Act
            const result = await dataFetcher.validateUser('123');

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for invalid user', async () => {
            // Arrange
            mockDb.queryUser.mockResolvedValue([]);

            // Act
            const result = await dataFetcher.validateUser('123');

            // Assert
            expect(result).toBe(false);
        });

        it('should throw error if database query fails', async () => {
            // Arrange
            mockDb.queryUser.mockRejectedValue(new Error('DB error'));

            // Act & Assert
            await expect(dataFetcher.validateUser('123')).rejects.toThrow('Failed to validate user');
        });
    });
}); 