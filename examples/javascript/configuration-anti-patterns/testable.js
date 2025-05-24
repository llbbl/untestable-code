/**
 * This example demonstrates proper configuration management:
 * 
 * 1. Centralized configuration
 * 2. Environment-agnostic configuration
 * 3. Configuration validation
 * 4. Immutable configuration
 * 5. Configuration injection
 * 6. Clear configuration boundaries
 */

/**
 * Configuration schema with validation
 */
class ConfigSchema {
    constructor(schema) {
        this.schema = schema;
    }

    validate(config) {
        const errors = [];
        for (const [key, validator] of Object.entries(this.schema)) {
            try {
                validator(config[key]);
            } catch (error) {
                errors.push(`Invalid ${key}: ${error.message}`);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }
}

/**
 * Immutable configuration
 */
class Config {
    constructor(values, schema) {
        this.schema = schema;
        this.schema.validate(values);
        this.values = Object.freeze({ ...values });
    }

    get(key) {
        return this.values[key];
    }

    with(key, value) {
        const newValues = { ...this.values, [key]: value };
        return new Config(newValues, this.schema);
    }
}

/**
 * Configuration manager
 */
class ConfigManager {
    constructor() {
        this.schema = new ConfigSchema({
            database: (value) => {
                if (!value || typeof value !== 'object') {
                    throw new Error('Database configuration must be an object');
                }
                if (!value.url || typeof value.url !== 'string') {
                    throw new Error('Database URL must be a string');
                }
                if (!value.options || typeof value.options !== 'object') {
                    throw new Error('Database options must be an object');
                }
            },
            api: (value) => {
                if (!value || typeof value !== 'object') {
                    throw new Error('API configuration must be an object');
                }
                if (!value.baseUrl || typeof value.baseUrl !== 'string') {
                    throw new Error('API base URL must be a string');
                }
                if (!value.apiKey || typeof value.apiKey !== 'string') {
                    throw new Error('API key must be a string');
                }
                if (typeof value.timeout !== 'number' || value.timeout <= 0) {
                    throw new Error('API timeout must be a positive number');
                }
                if (typeof value.maxRetries !== 'number' || value.maxRetries < 0) {
                    throw new Error('API max retries must be a non-negative number');
                }
            },
            cache: (value) => {
                if (!value || typeof value !== 'object') {
                    throw new Error('Cache configuration must be an object');
                }
                if (typeof value.ttl !== 'number' || value.ttl <= 0) {
                    throw new Error('Cache TTL must be a positive number');
                }
            },
            logger: (value) => {
                if (!value || typeof value !== 'object') {
                    throw new Error('Logger configuration must be an object');
                }
                if (!value.level || typeof value.level !== 'string') {
                    throw new Error('Logger level must be a string');
                }
                const validLevels = ['debug', 'info', 'warn', 'error'];
                if (!validLevels.includes(value.level)) {
                    throw new Error(`Logger level must be one of: ${validLevels.join(', ')}`);
                }
            }
        });
    }

    createConfig(values) {
        return new Config(values, this.schema);
    }
}

/**
 * Testable database with configuration injection
 */
class Database {
    constructor(config) {
        this.config = config;
    }

    async connect() {
        try {
            const client = await require('mongodb').connect(
                this.config.get('database').url,
                this.config.get('database').options
            );
            return client.db('myapp');
        } catch (error) {
            throw error;
        }
    }
}

/**
 * Testable API client with configuration injection
 */
class APIClient {
    constructor(config) {
        this.config = config;
    }

    async request(endpoint, options = {}) {
        const apiConfig = this.config.get('api');
        const headers = {
            'Authorization': `Bearer ${apiConfig.apiKey}`,
            'Content-Type': 'application/json'
        };

        let retries = 0;
        while (retries < apiConfig.maxRetries) {
            try {
                const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
                    ...options,
                    headers,
                    timeout: apiConfig.timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                retries++;
                if (retries === apiConfig.maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }
}

/**
 * Testable cache with configuration injection
 */
class Cache {
    constructor(config) {
        this.config = config;
        this.store = new Map();
    }

    set(key, value) {
        const ttl = this.config.get('cache').ttl;
        const expiry = Date.now() + (ttl * 1000);
        this.store.set(key, { value, expiry });
    }

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }
}

/**
 * Testable logger with configuration injection
 */
class Logger {
    constructor(config) {
        this.config = config;
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
    }

    log(level, message) {
        const loggerConfig = this.config.get('logger');
        if (this.levels[level] >= this.levels[loggerConfig.level]) {
            console[level](message);
        }
    }
}

/**
 * Factory function to create configured services
 */
function createServices(config) {
    return {
        db: new Database(config),
        api: new APIClient(config),
        cache: new Cache(config),
        logger: new Logger(config)
    };
}

module.exports = {
    ConfigSchema,
    Config,
    ConfigManager,
    Database,
    APIClient,
    Cache,
    Logger,
    createServices
}; 