/**
 * This example demonstrates testing non-deterministic behavior with:
 * 
 * 1. Testing time-dependent code
 * 2. Testing random number generation
 * 3. Testing external system interactions
 * 4. Testing state management
 * 5. Testing concurrency
 * 6. Testing side effects
 */

const {
    createOrderProcessor,
    TimeProvider,
    RandomProvider
} = require('./testable');

describe('OrderProcessor Tests', () => {
    let orderProcessor;
    let timeProvider;
    let randomProvider;
    let mockDb;
    let mockCreditService;
    let mockShippingService;
    let mockLogger;

    beforeEach(() => {
        // Setup mock dependencies
        timeProvider = new TimeProvider(new Date('2024-01-01T10:00:00Z'));
        randomProvider = new RandomProvider(12345); // Fixed seed for deterministic testing
        mockDb = {
            collection: jest.fn().mockReturnThis(),
            findOne: jest.fn()
        };
        mockCreditService = {
            checkCredit: jest.fn()
        };
        mockShippingService = {
            checkAvailability: jest.fn()
        };
        mockLogger = {
            info: jest.fn()
        };

        orderProcessor = createOrderProcessor({
            timeProvider,
            randomProvider,
            db: mockDb,
            creditService: mockCreditService,
            shippingService: mockShippingService,
            logger: mockLogger
        });
    });

    describe('Time-dependent behavior', () => {
        test('should process order during business hours', async () => {
            const order = { id: '123', items: [] };
            const result = await orderProcessor.processOrder(order);
            expect(result.processedAt).toEqual(timeProvider.now());
        });

        test('should reject order outside business hours', async () => {
            timeProvider.setTime(new Date('2024-01-01T08:00:00Z'));
            const order = { id: '123', items: [] };
            await expect(orderProcessor.processOrder(order))
                .rejects.toThrow('Orders can only be processed during business hours');
        });

        test('should track processing time', async () => {
            const order = { id: '123', items: [] };
            const result = await orderProcessor.processOrder(order);
            expect(result.processingTime).toBeDefined();
            expect(result.processingTime).toBeGreaterThan(0);
        });
    });

    describe('Random number generation', () => {
        test('should generate consistent random numbers with same seed', async () => {
            const order1 = { id: '123', items: [] };
            const order2 = { id: '456', items: [] };
            const result1 = await orderProcessor.processOrder(order1);
            const result2 = await orderProcessor.processOrder(order2);
            expect(result1.processingTime).toBe(result2.processingTime);
        });

        test('should generate different random numbers with different seeds', async () => {
            const order = { id: '123', items: [] };
            randomProvider.setSeed(54321);
            const result1 = await orderProcessor.processOrder(order);
            randomProvider.setSeed(98765);
            const result2 = await orderProcessor.processOrder(order);
            expect(result1.processingTime).not.toBe(result2.processingTime);
        });
    });

    describe('External system interactions', () => {
        test('should validate order with all checks passing', async () => {
            const order = {
                id: '123',
                items: [{ id: 'item1' }],
                customerId: 'customer1',
                address: { zipCode: '12345' }
            };

            mockDb.findOne.mockResolvedValue({ id: 'item1', quantity: 10 });
            mockCreditService.checkCredit.mockResolvedValue({ score: 800 });
            mockShippingService.checkAvailability.mockResolvedValue({
                available: true,
                estimatedDelivery: '2024-01-02'
            });

            const result = await orderProcessor.validateOrder(order);
            expect(result.valid).toBe(true);
            expect(result.inventory.available).toBe(true);
            expect(result.customerCredit.approved).toBe(true);
            expect(result.shippingAvailability.available).toBe(true);
        });

        test('should validate order with some checks failing', async () => {
            const order = {
                id: '123',
                items: [{ id: 'item1' }],
                customerId: 'customer1',
                address: { zipCode: '12345' }
            };

            mockDb.findOne.mockResolvedValue({ id: 'item1', quantity: 0 });
            mockCreditService.checkCredit.mockResolvedValue({ score: 600 });
            mockShippingService.checkAvailability.mockResolvedValue({
                available: true,
                estimatedDelivery: '2024-01-02'
            });

            const result = await orderProcessor.validateOrder(order);
            expect(result.valid).toBe(false);
            expect(result.inventory.available).toBe(false);
            expect(result.customerCredit.approved).toBe(false);
            expect(result.shippingAvailability.available).toBe(true);
        });
    });

    describe('Concurrency control', () => {
        test('should process orders with controlled concurrency', async () => {
            const orders = [
                { id: '1', items: [] },
                { id: '2', items: [] },
                { id: '3', items: [] },
                { id: '4', items: [] },
                { id: '5', items: [] }
            ];

            const results = await orderProcessor.processOrders(orders, 2);
            expect(results).toHaveLength(5);
            expect(results.map(r => r.id)).toEqual(['1', '2', '3', '4', '5']);
        });

        test('should process queue with controlled concurrency', async () => {
            const queue = [
                { id: '1', items: [] },
                { id: '2', items: [] },
                { id: '3', items: [] }
            ];

            const results = await orderProcessor.processQueue(queue, 2);
            expect(results).toHaveLength(3);
            expect(results.map(r => r.id)).toEqual(['1', '2', '3']);
        });
    });

    describe('Side effects', () => {
        test('should log inventory check', async () => {
            const items = [{ id: 'item1' }];
            mockDb.findOne.mockResolvedValue({ id: 'item1', quantity: 10 });

            await orderProcessor.checkInventory(items);
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Inventory check completed',
                expect.objectContaining({
                    timestamp: timeProvider.now(),
                    items: ['item1']
                })
            );
        });

        test('should log credit check', async () => {
            const customerId = 'customer1';
            mockCreditService.checkCredit.mockResolvedValue({ score: 800 });

            await orderProcessor.checkCustomerCredit(customerId);
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Credit check completed',
                expect.objectContaining({
                    timestamp: timeProvider.now(),
                    customerId,
                    score: 800
                })
            );
        });

        test('should log shipping check', async () => {
            const address = { zipCode: '12345' };
            mockShippingService.checkAvailability.mockResolvedValue({
                available: true,
                estimatedDelivery: '2024-01-02'
            });

            await orderProcessor.checkShippingAvailability(address);
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Shipping check completed',
                expect.objectContaining({
                    timestamp: timeProvider.now(),
                    address: '12345'
                })
            );
        });
    });
}); 