/**
 * This example demonstrates how to write testable code with proper dependency management:
 * 
 * 1. Dependency injection
 * 2. Interface-based design
 * 3. Configuration injection
 * 4. Clear boundaries
 * 5. No circular dependencies
 * 6. No static dependencies
 */

/**
 * Configuration interface
 */
class Config {
    constructor(config) {
        this.database = config.database;
        this.api = config.api;
        this.features = config.features;
    }
}

/**
 * Database interface
 */
class Database {
    constructor(connection) {
        this.connection = connection;
    }

    async query(collection, query) {
        return this.connection.collection(collection).find(query).toArray();
    }
}

/**
 * API client interface
 */
class ApiClient {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout;
    }

    async request(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            timeout: this.timeout
        });
        return response.json();
    }
}

/**
 * Cache interface
 */
class Cache {
    constructor(client) {
        this.client = client;
    }

    async get(key) {
        return this.client.get(key);
    }

    async set(key, value) {
        return this.client.set(key, value);
    }
}

/**
 * Logger interface
 */
class Logger {
    constructor(implementation) {
        this.implementation = implementation;
    }

    info(message) {
        this.implementation.info(message);
    }

    error(message) {
        this.implementation.error(message);
    }
}

/**
 * Error handler interface
 */
class ErrorHandler {
    constructor(implementation) {
        this.implementation = implementation;
    }

    handle(error) {
        this.implementation.handle(error);
    }
}

/**
 * Testable user service with proper dependency injection
 */
class UserService {
    constructor(config, db, api, cache, logger, errorHandler) {
        this.config = config;
        this.db = db;
        this.api = api;
        this.cache = cache;
        this.logger = logger;
        this.errorHandler = errorHandler;
    }

    async getUser(userId) {
        this.logger.info(`Fetching user ${userId}`);

        if (this.config.features.useCache) {
            const cached = await this.cache.get(`user:${userId}`);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        try {
            const user = await this.api.request(`/users/${userId}`);
            await this.db.query('users', { id: userId });
            await this.cache.set(`user:${userId}`, JSON.stringify(user));
            return user;
        } catch (error) {
            this.errorHandler.handle(error);
            throw error;
        }
    }
}

/**
 * Testable order service with proper dependency injection
 */
class OrderService {
    constructor(db, userService) {
        this.db = db;
        this.userService = userService;
    }

    async getOrder(orderId) {
        const order = await this.db.query('orders', { id: orderId });
        const user = await this.userService.getUser(order.userId);
        return { ...order, user };
    }
}

/**
 * Factory function to create a configured user service
 */
async function createUserService(config, dbConnection, cacheClient, loggerImpl, errorHandlerImpl) {
    const db = new Database(dbConnection);
    const api = new ApiClient(config.api);
    const cache = new Cache(cacheClient);
    const logger = new Logger(loggerImpl);
    const errorHandler = new ErrorHandler(errorHandlerImpl);
    
    return new UserService(config, db, api, cache, logger, errorHandler);
}

/**
 * Factory function to create a configured order service
 */
async function createOrderService(dbConnection, userService) {
    const db = new Database(dbConnection);
    return new OrderService(db, userService);
}

module.exports = {
    Config,
    Database,
    ApiClient,
    Cache,
    Logger,
    ErrorHandler,
    UserService,
    OrderService,
    createUserService,
    createOrderService
}; 