/**
 * This example demonstrates how to test code with proper complex logic handling:
 * 
 * 1. Testing pure functions
 * 2. Testing single responsibility methods
 * 3. Testing business rules
 * 4. Testing error handling
 * 5. Testing dependencies
 * 6. Testing boundaries
 */

const {
    createOrderProcessor,
    validateOrder,
    validateCustomer,
    calculateOrderStatus
} = require('./testable');

describe('Order Validation', () => {
    test('validates valid order', () => {
        const order = {
            items: [{ id: 1, quantity: 1 }],
            customer: { id: '123' },
            payment: { method: 'credit_card' }
        };
        expect(validateOrder(order)).toEqual({ valid: true });
    });

    test('validates order without items', () => {
        const order = {
            customer: { id: '123' },
            payment: { method: 'credit_card' }
        };
        expect(validateOrder(order)).toEqual({ valid: false, error: 'Invalid order' });
    });

    test('validates order without customer', () => {
        const order = {
            items: [{ id: 1, quantity: 1 }],
            payment: { method: 'credit_card' }
        };
        expect(validateOrder(order)).toEqual({ valid: false, error: 'Invalid customer' });
    });

    test('validates order without payment method', () => {
        const order = {
            items: [{ id: 1, quantity: 1 }],
            customer: { id: '123' }
        };
        expect(validateOrder(order)).toEqual({ valid: false, error: 'Invalid payment method' });
    });
});

describe('Customer Validation', () => {
    test('validates valid customer', () => {
        const customer = {
            id: '123',
            status: 'active',
            creditLimit: 1000
        };
        expect(validateCustomer(customer, 500)).toEqual({ valid: true });
    });

    test('validates non-existent customer', () => {
        expect(validateCustomer(null, 500)).toEqual({ valid: false, error: 'Customer not found' });
    });

    test('validates inactive customer', () => {
        const customer = {
            id: '123',
            status: 'inactive',
            creditLimit: 1000
        };
        expect(validateCustomer(customer, 500)).toEqual({ valid: false, error: 'Customer account is not active' });
    });

    test('validates customer with exceeded credit limit', () => {
        const customer = {
            id: '123',
            status: 'active',
            creditLimit: 500
        };
        expect(validateCustomer(customer, 1000)).toEqual({ valid: false, error: 'Credit limit exceeded' });
    });
});

describe('Order Status Calculation', () => {
    test('calculates status for high priority credit card order with available inventory', () => {
        const order = { priority: 'high' };
        const paymentResult = { method: 'credit_card' };
        const inventoryResult = { available: true };
        expect(calculateOrderStatus(order, paymentResult, inventoryResult)).toBe('processing');
    });

    test('calculates status for high priority credit card order with unavailable inventory', () => {
        const order = { priority: 'high' };
        const paymentResult = { method: 'credit_card' };
        const inventoryResult = { available: false };
        expect(calculateOrderStatus(order, paymentResult, inventoryResult)).toBe('backordered');
    });

    test('calculates status for high priority non-credit card order with available inventory', () => {
        const order = { priority: 'high' };
        const paymentResult = { method: 'paypal' };
        const inventoryResult = { available: true };
        expect(calculateOrderStatus(order, paymentResult, inventoryResult)).toBe('pending');
    });

    test('calculates status for high priority non-credit card order with unavailable inventory', () => {
        const order = { priority: 'high' };
        const paymentResult = { method: 'paypal' };
        const inventoryResult = { available: false };
        expect(calculateOrderStatus(order, paymentResult, inventoryResult)).toBe('cancelled');
    });
});

describe('OrderProcessor', () => {
    let orderProcessor;
    let mockDependencies;

    beforeEach(() => {
        mockDependencies = {
            db: {
                collection: jest.fn().mockReturnThis(),
                findOne: jest.fn(),
                insertOne: jest.fn(),
                find: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                toArray: jest.fn(),
                countDocuments: jest.fn()
            },
            emailService: {
                sendOrderConfirmation: jest.fn()
            },
            paymentService: {
                processPayment: jest.fn(),
                refundPayment: jest.fn(),
                getPaymentDetails: jest.fn()
            },
            inventoryService: {
                updateInventory: jest.fn(),
                getInventoryStatus: jest.fn()
            },
            notificationService: {
                notifyWarehouse: jest.fn(),
                notifyShipping: jest.fn()
            }
        };

        orderProcessor = createOrderProcessor(mockDependencies);
    });

    describe('processOrder', () => {
        const validOrder = {
            id: '123',
            items: [{ id: 1, quantity: 1 }],
            customer: { id: '456' },
            payment: { method: 'credit_card' },
            total: 100,
            priority: 'high'
        };

        const validCustomer = {
            id: '456',
            status: 'active',
            creditLimit: 1000
        };

        test('processes valid order successfully', async () => {
            mockDependencies.db.findOne.mockResolvedValue(validCustomer);
            mockDependencies.paymentService.processPayment.mockResolvedValue({ success: true, id: '789' });
            mockDependencies.inventoryService.updateInventory.mockResolvedValue({ success: true, available: true });
            mockDependencies.db.insertOne.mockResolvedValue({ insertedId: '123' });

            const result = await orderProcessor.processOrder(validOrder);

            expect(result).toEqual({
                success: true,
                orderId: '123',
                status: 'processing'
            });

            expect(mockDependencies.emailService.sendOrderConfirmation).toHaveBeenCalled();
            expect(mockDependencies.notificationService.notifyWarehouse).toHaveBeenCalled();
            expect(mockDependencies.notificationService.notifyShipping).toHaveBeenCalled();
        });

        test('handles invalid order', async () => {
            const invalidOrder = { ...validOrder, items: [] };

            await expect(orderProcessor.processOrder(invalidOrder)).rejects.toThrow('Invalid order');
        });

        test('handles non-existent customer', async () => {
            mockDependencies.db.findOne.mockResolvedValue(null);

            await expect(orderProcessor.processOrder(validOrder)).rejects.toThrow('Customer not found');
        });

        test('handles payment processing failure', async () => {
            mockDependencies.db.findOne.mockResolvedValue(validCustomer);
            mockDependencies.paymentService.processPayment.mockResolvedValue({ success: false });

            await expect(orderProcessor.processOrder(validOrder)).rejects.toThrow('Payment processing failed');
        });

        test('handles inventory update failure', async () => {
            mockDependencies.db.findOne.mockResolvedValue(validCustomer);
            mockDependencies.paymentService.processPayment.mockResolvedValue({ success: true, id: '789' });
            mockDependencies.inventoryService.updateInventory.mockResolvedValue({ success: false });

            await expect(orderProcessor.processOrder(validOrder)).rejects.toThrow('Inventory update failed');
            expect(mockDependencies.paymentService.refundPayment).toHaveBeenCalledWith('789');
        });
    });

    describe('getOrderHistory', () => {
        const customerId = '456';
        const mockOrders = [
            {
                id: '123',
                customer: { id: '456' },
                paymentId: '789',
                items: [{ id: 1, quantity: 1 }]
            }
        ];

        const mockCustomer = {
            id: '456',
            name: 'John Doe',
            email: 'john@example.com'
        };

        const mockPayment = {
            status: 'completed',
            processedAt: new Date()
        };

        const mockInventory = {
            status: 'available',
            availableItems: [{ id: 1, quantity: 1 }]
        };

        test('retrieves order history successfully', async () => {
            mockDependencies.db.find.mockReturnThis();
            mockDependencies.db.toArray.mockResolvedValue(mockOrders);
            mockDependencies.db.countDocuments.mockResolvedValue(1);
            mockDependencies.db.findOne.mockResolvedValue(mockCustomer);
            mockDependencies.paymentService.getPaymentDetails.mockResolvedValue(mockPayment);
            mockDependencies.inventoryService.getInventoryStatus.mockResolvedValue(mockInventory);

            const result = await orderProcessor.getOrderHistory(customerId, {
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            expect(result).toEqual({
                orders: [{
                    ...mockOrders[0],
                    customer: {
                        ...mockOrders[0].customer,
                        name: mockCustomer.name,
                        email: mockCustomer.email
                    },
                    payment: {
                        ...mockOrders[0].payment,
                        status: mockPayment.status,
                        processedAt: mockPayment.processedAt
                    },
                    inventory: {
                        status: mockInventory.status,
                        availableItems: mockInventory.availableItems
                    }
                }],
                total: 1,
                page: 1,
                limit: 10,
                pages: 1
            });
        });

        test('handles database error', async () => {
            mockDependencies.db.find.mockReturnThis();
            mockDependencies.db.toArray.mockRejectedValue(new Error('Database error'));

            await expect(orderProcessor.getOrderHistory(customerId)).rejects.toThrow('Database error');
        });
    });
}); 