/**
 * This example demonstrates common configuration anti-patterns that make testing difficult:
 * 
 * 1. Hard-coded configuration values
 * 2. Environment-specific configuration
 * 3. Configuration scattered across codebase
 * 4. No configuration validation
 * 5. Runtime configuration changes
 * 6. Configuration dependencies
 */

// Anti-pattern: Hard-coded configuration values
const DATABASE_URL = 'mongodb://localhost:27017/myapp';
const API_KEY = 'secret-api-key-123';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;
const CACHE_TTL = 3600;

// Anti-pattern: Environment-specific configuration
const ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = ENV === 'production' ? 'error' : 'debug';
const DEBUG_MODE = ENV !== 'production';

// Anti-pattern: Configuration scattered across codebase
class Database {
    constructor() {
        // Anti-pattern: Hard-coded configuration
        this.url = DATABASE_URL;
        this.options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Anti-pattern: Environment-specific configuration
            ssl: ENV === 'production',
            // Anti-pattern: Hard-coded configuration
            maxPoolSize: 10,
            minPoolSize: 2
        };
    }

    async connect() {
        try {
            // Anti-pattern: Hard-coded configuration
            const client = await require('mongodb').connect(this.url, this.options);
            return client.db('myapp');
        } catch (error) {
            // Anti-pattern: Environment-specific configuration
            if (DEBUG_MODE) {
                console.error('Database connection error:', error);
            }
            throw error;
        }
    }
}

// Anti-pattern: Configuration scattered across codebase
class APIClient {
    constructor() {
        // Anti-pattern: Hard-coded configuration
        this.baseUrl = 'https://api.example.com';
        this.apiKey = API_KEY;
        // Anti-pattern: Hard-coded configuration
        this.timeout = TIMEOUT_MS;
        // Anti-pattern: Hard-coded configuration
        this.maxRetries = MAX_RETRIES;
    }

    async request(endpoint, options = {}) {
        // Anti-pattern: Hard-coded configuration
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Anti-pattern: Environment-specific configuration
        if (DEBUG_MODE) {
            console.log(`Making request to ${this.baseUrl}${endpoint}`);
        }

        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    ...options,
                    headers,
                    // Anti-pattern: Hard-coded configuration
                    timeout: this.timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                retries++;
                // Anti-pattern: Environment-specific configuration
                if (DEBUG_MODE) {
                    console.error(`Request failed (attempt ${retries}/${this.maxRetries}):`, error);
                }
                if (retries === this.maxRetries) {
                    throw error;
                }
                // Anti-pattern: Hard-coded configuration
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }
}

// Anti-pattern: Configuration scattered across codebase
class Cache {
    constructor() {
        // Anti-pattern: Hard-coded configuration
        this.ttl = CACHE_TTL;
        this.store = new Map();
    }

    set(key, value) {
        // Anti-pattern: Hard-coded configuration
        const expiry = Date.now() + (this.ttl * 1000);
        this.store.set(key, { value, expiry });
    }

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;

        // Anti-pattern: Hard-coded configuration
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }
}

// Anti-pattern: Configuration scattered across codebase
class Logger {
    constructor() {
        // Anti-pattern: Environment-specific configuration
        this.level = LOG_LEVEL;
        // Anti-pattern: Hard-coded configuration
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
    }

    log(level, message) {
        // Anti-pattern: Environment-specific configuration
        if (this.levels[level] >= this.levels[this.level]) {
            console[level](message);
        }
    }
}

// Anti-pattern: Runtime configuration changes
function updateConfiguration(key, value) {
    // Anti-pattern: No configuration validation
    switch (key) {
        case 'DATABASE_URL':
            DATABASE_URL = value;
            break;
        case 'API_KEY':
            API_KEY = value;
            break;
        case 'MAX_RETRIES':
            MAX_RETRIES = value;
            break;
        case 'TIMEOUT_MS':
            TIMEOUT_MS = value;
            break;
        case 'CACHE_TTL':
            CACHE_TTL = value;
            break;
        default:
            throw new Error(`Unknown configuration key: ${key}`);
    }
}

// Anti-pattern: Configuration dependencies
function initializeServices() {
    // Anti-pattern: Configuration scattered across codebase
    const db = new Database();
    const api = new APIClient();
    const cache = new Cache();
    const logger = new Logger();

    // Anti-pattern: Configuration dependencies
    if (ENV === 'production') {
        // Anti-pattern: Hard-coded configuration
        db.options.maxPoolSize = 20;
        api.timeout = 10000;
        cache.ttl = 7200;
    }

    return { db, api, cache, logger };
}

module.exports = {
    Database,
    APIClient,
    Cache,
    Logger,
    updateConfiguration,
    initializeServices
}; 