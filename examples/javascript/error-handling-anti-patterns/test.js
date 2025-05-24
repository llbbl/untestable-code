/**
 * This example demonstrates how to test code with proper error handling:
 * 
 * 1. Testing error cases
 * 2. Testing error types
 * 3. Testing error context
 * 4. Testing error propagation
 * 5. Testing error boundaries
 */

const {
    UserError,
    DatabaseError,
    UserService
} = require('./testable');

describe('UserService', () => {
    let userService;
    let mockDb;
    let mockLogger;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create mock dependencies
        mockDb = {
            findOne: jest.fn(),
            query: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn()
        };
        
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create service with mock dependencies
        userService = new UserService(mockDb, mockLogger);
    });

    describe('getUser', () => {
        it('should return user when found', async () => {
            // Arrange
            const user = { id: '123', name: 'Test User' };
            mockDb.findOne.mockResolvedValue(user);

            // Act
            const result = await userService.getUser('123');

            // Assert
            expect(result).toEqual(user);
            expect(mockDb.findOne).toHaveBeenCalledWith('users', { id: '123' });
        });

        it('should throw UserError when user not found', async () => {
            // Arrange
            mockDb.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.getUser('123')).rejects.toThrow(UserError);
            await expect(userService.getUser('123')).rejects.toMatchObject({
                code: 'USER_NOT_FOUND'
            });
        });

        it('should throw UserError with context when database fails', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.findOne.mockRejectedValue(dbError);

            // Act & Assert
            await expect(userService.getUser('123')).rejects.toThrow(UserError);
            await expect(userService.getUser('123')).rejects.toMatchObject({
                code: 'GET_USER_ERROR',
                cause: dbError
            });
        });
    });

    describe('updateUser', () => {
        it('should return success when user updated', async () => {
            // Arrange
            mockDb.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            });

            // Act
            const result = await userService.updateUser('123', { name: 'New Name' });

            // Assert
            expect(result).toEqual({
                success: true,
                updated: true
            });
            expect(mockDb.updateOne).toHaveBeenCalledWith(
                'users',
                { id: '123' },
                { $set: { name: 'New Name' } }
            );
        });

        it('should throw UserError when user not found', async () => {
            // Arrange
            mockDb.updateOne.mockResolvedValue({
                matchedCount: 0,
                modifiedCount: 0
            });

            // Act & Assert
            await expect(userService.updateUser('123', { name: 'New Name' }))
                .rejects.toThrow(UserError);
            await expect(userService.updateUser('123', { name: 'New Name' }))
                .rejects.toMatchObject({
                    code: 'USER_NOT_FOUND'
                });
        });
    });

    describe('validateUser', () => {
        it('should return valid when user exists', async () => {
            // Arrange
            const user = { id: '123', name: 'Test User' };
            mockDb.findOne.mockResolvedValue(user);

            // Act
            const result = await userService.validateUser('123');

            // Assert
            expect(result).toEqual({
                valid: true,
                user
            });
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it('should log warning and throw UserError when user not found', async () => {
            // Arrange
            mockDb.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.validateUser('123')).rejects.toThrow(UserError);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'User validation failed: 123'
            );
        });

        it('should log error and throw UserError when database fails', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.findOne.mockRejectedValue(dbError);

            // Act & Assert
            await expect(userService.validateUser('123')).rejects.toThrow(UserError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('User validation error')
            );
        });
    });

    describe('getUserWithOrders', () => {
        it('should return user with orders', async () => {
            // Arrange
            const user = { id: '123', name: 'Test User' };
            const orders = [{ id: '1', total: 100 }];
            mockDb.findOne.mockResolvedValue(user);
            mockDb.query.mockResolvedValue(orders);

            // Act
            const result = await userService.getUserWithOrders('123');

            // Assert
            expect(result).toEqual({
                ...user,
                orders
            });
            expect(mockDb.findOne).toHaveBeenCalledWith('users', { id: '123' });
            expect(mockDb.query).toHaveBeenCalledWith('orders', { userId: '123' });
        });

        it('should throw UserError when user not found', async () => {
            // Arrange
            mockDb.findOne.mockResolvedValue(null);
            mockDb.query.mockResolvedValue([]);

            // Act & Assert
            await expect(userService.getUserWithOrders('123')).rejects.toThrow(UserError);
            await expect(userService.getUserWithOrders('123')).rejects.toMatchObject({
                code: 'USER_NOT_FOUND'
            });
        });
    });

    describe('getUserWithProfile', () => {
        it('should return user with profile', async () => {
            // Arrange
            const user = { id: '123', name: 'Test User' };
            const profile = { userId: '123', bio: 'Test Bio' };
            mockDb.findOne.mockResolvedValueOnce(user);
            mockDb.findOne.mockResolvedValueOnce(profile);

            // Act
            const result = await userService.getUserWithProfile('123');

            // Assert
            expect(result).toEqual({
                ...user,
                profile
            });
        });

        it('should throw UserError when profile not found', async () => {
            // Arrange
            const user = { id: '123', name: 'Test User' };
            mockDb.findOne.mockResolvedValueOnce(user);
            mockDb.findOne.mockResolvedValueOnce(null);

            // Act & Assert
            await expect(userService.getUserWithProfile('123')).rejects.toThrow(UserError);
            await expect(userService.getUserWithProfile('123')).rejects.toMatchObject({
                code: 'PROFILE_NOT_FOUND'
            });
        });
    });
}); 