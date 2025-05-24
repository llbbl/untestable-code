/**
 * This example demonstrates common dependency management anti-patterns that make testing difficult:
 * 
 * 1. Direct instantiation of dependencies
 * 2. Hard-coded dependencies
 * 3. Circular dependencies
 * 4. Implicit dependencies
 * 5. Service locator pattern
 * 6. Static dependencies
 */

// Anti-pattern: Service locator
const serviceLocator = {
    services: new Map(),
    register(name, service) {
        this.services.set(name, service);
    },
    get(name) {
        return this.services.get(name);
    }
};

// Anti-pattern: Static configuration
const config = {
    database: {
        url: 'mongodb://localhost:27017',
        name: 'myapp'
    },
    api: {
        baseUrl: 'https://api.example.com',
        timeout: 5000
    }
};

/**
 * Anti-pattern: Direct database dependency
 */
class Database {
    constructor() {
        // Anti-pattern: Hard-coded configuration
        this.connection = require('mongodb').connect(config.database.url);
    }

    async query(collection, query) {
        const db = await this.connection;
        return db.collection(collection).find(query).toArray();
    }
}

/**
 * Anti-pattern: Direct API client dependency
 */
class ApiClient {
    constructor() {
        // Anti-pattern: Hard-coded configuration
        this.baseUrl = config.api.baseUrl;
        this.timeout = config.api.timeout;
    }

    async request(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            timeout: this.timeout
        });
        return response.json();
    }
}

/**
 * Anti-pattern: Direct cache dependency
 */
class Cache {
    constructor() {
        // Anti-pattern: Direct Redis dependency
        this.redis = require('redis').createClient();
    }

    async get(key) {
        return this.redis.get(key);
    }

    async set(key, value) {
        return this.redis.set(key, value);
    }
}

/**
 * Anti-pattern: Service with multiple direct dependencies
 */
class UserService {
    constructor() {
        // Anti-pattern: Direct instantiation of dependencies
        this.db = new Database();
        this.api = new ApiClient();
        this.cache = new Cache();
    }

    async getUser(userId) {
        // Anti-pattern: Direct dependency on service locator
        const logger = serviceLocator.get('logger');
        logger.info(`Fetching user ${userId}`);

        // Anti-pattern: Direct dependency on static config
        if (config.features.useCache) {
            const cached = await this.cache.get(`user:${userId}`);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        try {
            // Anti-pattern: Direct dependency on external service
            const user = await this.api.request(`/users/${userId}`);
            
            // Anti-pattern: Direct database dependency
            await this.db.query('users', { id: userId });
            
            // Anti-pattern: Direct cache dependency
            await this.cache.set(`user:${userId}`, JSON.stringify(user));
            
            return user;
        } catch (error) {
            // Anti-pattern: Direct dependency on service locator
            const errorHandler = serviceLocator.get('errorHandler');
            errorHandler.handle(error);
            throw error;
        }
    }
}

/**
 * Anti-pattern: Circular dependency
 */
class OrderService {
    constructor() {
        // Anti-pattern: Direct instantiation
        this.userService = new UserService();
    }

    async getOrder(orderId) {
        const order = await this.db.query('orders', { id: orderId });
        // Anti-pattern: Circular dependency
        const user = await this.userService.getUser(order.userId);
        return { ...order, user };
    }
}

// Anti-pattern: Static initialization
const userService = new UserService();
const orderService = new OrderService();

// Anti-pattern: Service locator registration
serviceLocator.register('logger', {
    info: console.log,
    error: console.error
});

serviceLocator.register('errorHandler', {
    handle: (error) => {
        console.error('Error:', error);
        // Anti-pattern: Direct dependency on external service
        require('error-reporting-service').report(error);
    }
});

module.exports = {
    UserService,
    OrderService,
    serviceLocator
}; 