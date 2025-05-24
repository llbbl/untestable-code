/**
 * This example demonstrates testing error handling with:
 * 
 * 1. Testing custom error classes
 * 2. Testing error context
 * 3. Testing error propagation
 * 4. Testing error recovery
 * 5. Testing error boundaries
 * 6. Testing error logging
 */

const {
    createUserService,
    UserError,
    ValidationError,
    NotFoundError,
    DatabaseError
} = require('./testable');

describe('Error Handling Tests', () => {
    let userService;
    let mockDb;
    let mockLogger;
    let mockEmailService;
    let mockCache;

    beforeEach(() => {
        // Setup mock dependencies
        mockDb = {
            collection: jest.fn().mockReturnThis(),
            findOne: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn()
        };

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockEmailService = {
            sendWelcomeEmail: jest.fn(),
            sendGoodbyeEmail: jest.fn()
        };

        mockCache = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn()
        };

        userService = createUserService({
            db: Promise.resolve(mockDb),
            logger: mockLogger,
            emailService: mockEmailService,
            cache: mockCache
        });
    });

    describe('Custom Error Classes', () => {
        test('ValidationError should include context', () => {
            const error = new ValidationError('Invalid input', { field: 'email' });
            expect(error).toBeInstanceOf(ValidationError);
            expect(error).toBeInstanceOf(UserError);
            expect(error.context).toEqual({ field: 'email' });
        });

        test('NotFoundError should include context', () => {
            const error = new NotFoundError('User not found', { userId: '123' });
            expect(error).toBeInstanceOf(NotFoundError);
            expect(error).toBeInstanceOf(UserError);
            expect(error.context).toEqual({ userId: '123' });
        });

        test('DatabaseError should include context and cause', () => {
            const cause = new Error('Connection failed');
            const error = new DatabaseError('Query failed', { query: 'SELECT *' }, cause);
            expect(error).toBeInstanceOf(DatabaseError);
            expect(error).toBeInstanceOf(UserError);
            expect(error.context).toEqual({ query: 'SELECT *' });
            expect(error.cause).toBe(cause);
        });
    });

    describe('User Operations', () => {
        describe('getUser', () => {
            test('should return user when found', async () => {
                const user = { id: '123', name: 'Test User' };
                mockDb.findOne.mockResolvedValue(user);

                const result = await userService.getUser('123');
                expect(result).toEqual(user);
            });

            test('should throw NotFoundError when user not found', async () => {
                mockDb.findOne.mockResolvedValue(null);

                await expect(userService.getUser('123')).rejects.toThrow(NotFoundError);
            });

            test('should throw DatabaseError when database fails', async () => {
                const dbError = new Error('Connection failed');
                mockDb.findOne.mockRejectedValue(dbError);

                await expect(userService.getUser('123')).rejects.toThrow(DatabaseError);
            });
        });

        describe('createUser', () => {
            test('should create user successfully', async () => {
                const userData = { email: 'test@example.com', name: 'Test User' };
                mockDb.insertOne.mockResolvedValue({ insertedId: '123' });
                mockEmailService.sendWelcomeEmail.mockResolvedValue();

                const result = await userService.createUser(userData);
                expect(result).toBe('123');
                expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
            });

            test('should throw ValidationError for invalid data', async () => {
                const userData = { name: 'Test User' }; // Missing email

                await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
            });

            test('should continue when welcome email fails', async () => {
                const userData = { email: 'test@example.com', name: 'Test User' };
                mockDb.insertOne.mockResolvedValue({ insertedId: '123' });
                mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('Email failed'));

                const result = await userService.createUser(userData);
                expect(result).toBe('123');
                expect(mockLogger.warn).toHaveBeenCalled();
            });
        });

        describe('updateUser', () => {
            test('should update user successfully', async () => {
                const updates = { name: 'Updated Name' };
                mockDb.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

                const result = await userService.updateUser('123', updates);
                expect(result).toBe(true);
                expect(mockCache.delete).toHaveBeenCalledWith('123');
            });

            test('should throw NotFoundError when user not found', async () => {
                mockDb.updateOne.mockResolvedValue({ matchedCount: 0 });

                await expect(userService.updateUser('123', { name: 'New Name' }))
                    .rejects.toThrow(NotFoundError);
            });

            test('should throw ValidationError for invalid email', async () => {
                const updates = { email: 'invalid-email' };

                await expect(userService.updateUser('123', updates))
                    .rejects.toThrow(ValidationError);
            });
        });

        describe('deleteUser', () => {
            test('should delete user successfully', async () => {
                const user = { id: '123', email: 'test@example.com', status: 'inactive' };
                mockDb.findOne.mockResolvedValue(user);
                mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });
                mockEmailService.sendGoodbyeEmail.mockResolvedValue();

                const result = await userService.deleteUser('123');
                expect(result).toBe(true);
                expect(mockCache.delete).toHaveBeenCalledWith('123');
                expect(mockEmailService.sendGoodbyeEmail).toHaveBeenCalledWith(user.email);
            });

            test('should throw ValidationError for active user', async () => {
                const user = { id: '123', status: 'active' };
                mockDb.findOne.mockResolvedValue(user);

                await expect(userService.deleteUser('123')).rejects.toThrow(ValidationError);
            });

            test('should continue when goodbye email fails', async () => {
                const user = { id: '123', email: 'test@example.com', status: 'inactive' };
                mockDb.findOne.mockResolvedValue(user);
                mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });
                mockEmailService.sendGoodbyeEmail.mockRejectedValue(new Error('Email failed'));

                const result = await userService.deleteUser('123');
                expect(result).toBe(true);
                expect(mockLogger.warn).toHaveBeenCalled();
            });
        });

        describe('getUserPreferences', () => {
            test('should return cached preferences', async () => {
                const preferences = { theme: 'dark', notifications: true };
                mockCache.get.mockResolvedValue(preferences);

                const result = await userService.getUserPreferences('123');
                expect(result).toEqual(preferences);
                expect(mockDb.findOne).not.toHaveBeenCalled();
            });

            test('should return default preferences when none found', async () => {
                mockCache.get.mockResolvedValue(null);
                mockDb.findOne.mockResolvedValue(null);
                const user = { id: '123' };
                mockDb.findOne.mockResolvedValue(user);

                const result = await userService.getUserPreferences('123');
                expect(result).toEqual({ theme: 'default', notifications: true });
            });

            test('should cache preferences after fetching', async () => {
                const preferences = { theme: 'light', notifications: false };
                mockCache.get.mockResolvedValue(null);
                mockDb.findOne.mockResolvedValue(preferences);
                const user = { id: '123' };
                mockDb.findOne.mockResolvedValue(user);

                const result = await userService.getUserPreferences('123');
                expect(result).toEqual(preferences);
                expect(mockCache.set).toHaveBeenCalledWith('123', preferences);
            });
        });
    });
}); 