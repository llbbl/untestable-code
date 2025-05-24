/**
 * This example demonstrates how to test code with proper configuration management:
 * 
 * 1. Testing configuration validation
 * 2. Testing configuration immutability
 * 3. Testing configuration injection
 * 4. Testing configuration boundaries
 * 5. Testing configuration dependencies
 */

const {
    ConfigSchema,
    Config,
    ConfigManager,
    Database,
    APIClient,
    Cache,
    Logger,
    createServices
} = require('./testable');

describe('ConfigSchema', () => {
    test('validates correct configuration', () => {
        const schema = new ConfigSchema({
            name: (value) => {
                if (typeof value !== 'string') {
                    throw new Error('Name must be a string');
                }
            },
            age: (value) => {
                if (typeof value !== 'number' || value < 0) {
                    throw new Error('Age must be a non-negative number');
                }
            }
        });

        expect(() => {
            schema.validate({
                name: 'John',
                age: 30
            });
        }).not.toThrow();
    });

    test('throws error for invalid configuration', () => {
        const schema = new ConfigSchema({
            name: (value) => {
                if (typeof value !== 'string') {
                    throw new Error('Name must be a string');
                }
            },
            age: (value) => {
                if (typeof value !== 'number' || value < 0) {
                    throw new Error('Age must be a non-negative number');
                }
            }
        });

        expect(() => {
            schema.validate({
                name: 123,
                age: -1
            });
        }).toThrow('Configuration validation failed');
    });
});

describe('Config', () => {
    test('creates immutable configuration', () => {
        const schema = new ConfigSchema({
            name: (value) => {
                if (typeof value !== 'string') {
                    throw new Error('Name must be a string');
                }
            }
        });

        const config = new Config({ name: 'John' }, schema);
        expect(() => {
            config.values.name = 'Jane';
        }).toThrow();
    });

    test('creates new instance with updated value', () => {
        const schema = new ConfigSchema({
            name: (value) => {
                if (typeof value !== 'string') {
                    throw new Error('Name must be a string');
                }
            }
        });

        const config = new Config({ name: 'John' }, schema);
        const newConfig = config.with('name', 'Jane');

        expect(config).not.toBe(newConfig);
        expect(config.get('name')).toBe('John');
        expect(newConfig.get('name')).toBe('Jane');
    });
});

describe('ConfigManager', () => {
    let configManager;

    beforeEach(() => {
        configManager = new ConfigManager();
    });

    test('creates valid configuration', () => {
        const config = configManager.createConfig({
            database: {
                url: 'mongodb://localhost:27017/myapp',
                options: { useNewUrlParser: true }
            },
            api: {
                baseUrl: 'https://api.example.com',
                apiKey: 'secret-key',
                timeout: 5000,
                maxRetries: 3
            },
            cache: {
                ttl: 3600
            },
            logger: {
                level: 'info'
            }
        });

        expect(config.get('database').url).toBe('mongodb://localhost:27017/myapp');
        expect(config.get('api').baseUrl).toBe('https://api.example.com');
        expect(config.get('cache').ttl).toBe(3600);
        expect(config.get('logger').level).toBe('info');
    });

    test('throws error for invalid configuration', () => {
        expect(() => {
            configManager.createConfig({
                database: {
                    url: 123,
                    options: 'invalid'
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    apiKey: 'secret-key',
                    timeout: -1,
                    maxRetries: 'invalid'
                },
                cache: {
                    ttl: -1
                },
                logger: {
                    level: 'invalid'
                }
            });
        }).toThrow('Configuration validation failed');
    });
});

describe('Database', () => {
    let mockMongoDb;
    let db;

    beforeEach(() => {
        mockMongoDb = {
            connect: jest.fn()
        };
        jest.mock('mongodb', () => ({
            connect: mockMongoDb.connect
        }));

        const config = new ConfigManager().createConfig({
            database: {
                url: 'mongodb://localhost:27017/myapp',
                options: { useNewUrlParser: true }
            },
            api: {},
            cache: { ttl: 3600 },
            logger: { level: 'info' }
        });

        db = new Database(config);
    });

    test('connects with correct configuration', async () => {
        const mockClient = {
            db: jest.fn().mockReturnValue('mockDb')
        };
        mockMongoDb.connect.mockResolvedValue(mockClient);

        const result = await db.connect();

        expect(mockMongoDb.connect).toHaveBeenCalledWith(
            'mongodb://localhost:27017/myapp',
            { useNewUrlParser: true }
        );
        expect(result).toBe('mockDb');
    });

    test('throws error on connection failure', async () => {
        const error = new Error('Connection failed');
        mockMongoDb.connect.mockRejectedValue(error);

        await expect(db.connect()).rejects.toThrow('Connection failed');
    });
});

describe('APIClient', () => {
    let api;
    let mockFetch;

    beforeEach(() => {
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        const config = new ConfigManager().createConfig({
            database: { url: 'mongodb://localhost:27017/myapp', options: {} },
            api: {
                baseUrl: 'https://api.example.com',
                apiKey: 'secret-key',
                timeout: 5000,
                maxRetries: 3
            },
            cache: { ttl: 3600 },
            logger: { level: 'info' }
        });

        api = new APIClient(config);
    });

    test('makes request with correct configuration', async () => {
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ data: 'test' })
        };
        mockFetch.mockResolvedValue(mockResponse);

        const result = await api.request('/test');

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.example.com/test',
            expect.objectContaining({
                headers: {
                    'Authorization': 'Bearer secret-key',
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            })
        );
        expect(result).toEqual({ data: 'test' });
    });

    test('retries on failure', async () => {
        const error = new Error('Network error');
        mockFetch
            .mockRejectedValueOnce(error)
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ data: 'test' })
            });

        const result = await api.request('/test');

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(result).toEqual({ data: 'test' });
    });
});

describe('Cache', () => {
    let cache;

    beforeEach(() => {
        const config = new ConfigManager().createConfig({
            database: { url: 'mongodb://localhost:27017/myapp', options: {} },
            api: { baseUrl: 'https://api.example.com', apiKey: 'secret-key', timeout: 5000, maxRetries: 3 },
            cache: { ttl: 1 },
            logger: { level: 'info' }
        });

        cache = new Cache(config);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('sets and gets value', () => {
        cache.set('test', 'value');
        expect(cache.get('test')).toBe('value');
    });

    test('expires value after TTL', () => {
        cache.set('test', 'value');
        jest.advanceTimersByTime(2000);
        expect(cache.get('test')).toBeNull();
    });
});

describe('Logger', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = {
            debug: jest.spyOn(console, 'debug'),
            info: jest.spyOn(console, 'info'),
            warn: jest.spyOn(console, 'warn'),
            error: jest.spyOn(console, 'error')
        };

        const config = new ConfigManager().createConfig({
            database: { url: 'mongodb://localhost:27017/myapp', options: {} },
            api: { baseUrl: 'https://api.example.com', apiKey: 'secret-key', timeout: 5000, maxRetries: 3 },
            cache: { ttl: 3600 },
            logger: { level: 'info' }
        });

        logger = new Logger(config);
    });

    test('logs messages at or above configured level', () => {
        logger.log('debug', 'debug message');
        logger.log('info', 'info message');
        logger.log('warn', 'warn message');
        logger.log('error', 'error message');

        expect(consoleSpy.debug).not.toHaveBeenCalled();
        expect(consoleSpy.info).toHaveBeenCalledWith('info message');
        expect(consoleSpy.warn).toHaveBeenCalledWith('warn message');
        expect(consoleSpy.error).toHaveBeenCalledWith('error message');
    });
});

describe('createServices', () => {
    test('creates services with shared configuration', () => {
        const config = new ConfigManager().createConfig({
            database: { url: 'mongodb://localhost:27017/myapp', options: {} },
            api: { baseUrl: 'https://api.example.com', apiKey: 'secret-key', timeout: 5000, maxRetries: 3 },
            cache: { ttl: 3600 },
            logger: { level: 'info' }
        });

        const services = createServices(config);

        expect(services.db).toBeInstanceOf(Database);
        expect(services.api).toBeInstanceOf(APIClient);
        expect(services.cache).toBeInstanceOf(Cache);
        expect(services.logger).toBeInstanceOf(Logger);

        expect(services.db.config).toBe(config);
        expect(services.api.config).toBe(config);
        expect(services.cache.config).toBe(config);
        expect(services.logger.config).toBe(config);
    });
}); 