/**
 * This example demonstrates how to test decoupled components:
 *
 * 1. Test UserService in isolation with mocked EmailService and Logger
 * 2. Test EmailService in isolation with mocked Logger
 * 3. Cover edge cases and verify interactions
 */

const { UserService, EmailService, Logger } = require('./testable');

describe('UserService', () => {
    let mockEmailService;
    let mockLogger;
    let userService;

    beforeEach(() => {
        mockEmailService = {
            sendWelcomeEmail: jest.fn(),
            sendGoodbyeEmail: jest.fn()
        };
        mockLogger = {
            info: jest.fn(),
            error: jest.fn()
        };
        userService = new UserService({ emailService: mockEmailService, logger: mockLogger });
    });

    it('registers a user and sends welcome email', () => {
        const userData = { email: 'test@example.com', name: 'Test' };
        const result = userService.registerUser(userData);
        expect(result).toHaveProperty('id');
        expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockLogger.info).toHaveBeenCalledWith('User registered', userData);
    });

    it('throws if email is missing', () => {
        const userData = { name: 'Test' };
        expect(() => userService.registerUser(userData)).toThrow('Email is required');
        expect(mockLogger.error).toHaveBeenCalledWith('Missing email');
    });

    it('deletes a user and sends goodbye email', () => {
        userService.deleteUser('user123');
        expect(mockEmailService.sendGoodbyeEmail).toHaveBeenCalledWith('user123');
        expect(mockLogger.info).toHaveBeenCalledWith('User deleted', { userId: 'user123' });
    });
});

describe('EmailService', () => {
    let mockLogger;
    let emailService;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn()
        };
        emailService = new EmailService({ logger: mockLogger });
    });

    it('sends welcome email and logs', () => {
        emailService.sendWelcomeEmail('test@example.com');
        expect(mockLogger.info).toHaveBeenCalledWith('Sending welcome email to test@example.com');
    });

    it('sends goodbye email and logs', () => {
        emailService.sendGoodbyeEmail('user123');
        expect(mockLogger.info).toHaveBeenCalledWith('Sending goodbye email to user user123');
    });
}); 