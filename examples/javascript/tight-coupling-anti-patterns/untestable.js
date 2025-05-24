/**
 * This example demonstrates the Tight Coupling anti-pattern:
 *
 * 1. Classes/modules are highly dependent on each other
 * 2. No clear separation of concerns
 * 3. Difficult to test components in isolation
 * 4. Changes in one class ripple through others
 */

// UserService is tightly coupled to EmailService and Logger
class UserService {
    constructor() {
        this.emailService = new EmailService();
        this.logger = new Logger();
    }

    registerUser(userData) {
        // Business logic and side effects are mixed
        if (!userData.email) {
            this.logger.error('Missing email');
            throw new Error('Email is required');
        }
        // Directly calls EmailService
        this.emailService.sendWelcomeEmail(userData.email);
        this.logger.info('User registered', userData);
        return { ...userData, id: Math.floor(Math.random() * 10000) };
    }

    deleteUser(userId) {
        // Directly calls EmailService and Logger
        this.emailService.sendGoodbyeEmail(userId);
        this.logger.info('User deleted', { userId });
    }
}

// EmailService is tightly coupled to Logger
class EmailService {
    constructor() {
        this.logger = new Logger();
    }

    sendWelcomeEmail(email) {
        // Directly logs
        this.logger.info(`Sending welcome email to ${email}`);
        // Simulate sending email
    }

    sendGoodbyeEmail(userId) {
        this.logger.info(`Sending goodbye email to user ${userId}`);
        // Simulate sending email
    }
}

// Logger is a concrete dependency everywhere
class Logger {
    info(message, data) {
        console.log('[INFO]', message, data || '');
    }
    error(message, data) {
        console.error('[ERROR]', message, data || '');
    }
}

module.exports = { UserService, EmailService, Logger }; 