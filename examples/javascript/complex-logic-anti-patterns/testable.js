/**
 * This example demonstrates proper handling of complex logic with:
 * 
 * 1. Single responsibility methods
 * 2. Clear business rules
 * 3. Separated concerns
 * 4. Explicit dependencies
 * 5. Pure functions
 * 6. Clear boundaries
 */

/**
 * Pure function for order validation
 */
const validateOrder = (order) => {
    if (!order || !order.items || order.items.length === 0) {
        return { valid: false, error: 'Invalid order' };
    }
    if (!order.customer || !order.customer.id) {
        return { valid: false, error: 'Invalid customer' };
    }
    if (!order.payment || !order.payment.method) {
        return { valid: false, error: 'Invalid payment method' };
    }
    return { valid: true };
};

/**
 * Pure function for customer validation
 */
const validateCustomer = (customer, orderTotal) => {
    if (!customer) {
        return { valid: false, error: 'Customer not found' };
    }
    if (customer.status !== 'active') {
        return { valid: false, error: 'Customer account is not active' };
    }
    if (customer.creditLimit < orderTotal) {
        return { valid: false, error: 'Credit limit exceeded' };
    }
    return { valid: true };
};

/**
 * Pure function for order status calculation
 */
const calculateOrderStatus = (order, paymentResult, inventoryResult) => {
    const isHighPriority = order.priority === 'high';
    const isCreditCard = paymentResult.method === 'credit_card';
    const isAvailable = inventoryResult.available;

    if (isHighPriority) {
        return isCreditCard ? (isAvailable ? 'processing' : 'backordered') : (isAvailable ? 'pending' : 'cancelled');
    }
    return isCreditCard ? (isAvailable ? 'processing' : 'backordered') : (isAvailable ? 'pending' : 'cancelled');
};

/**
 * Class for handling order processing
 */
class OrderProcessor {
    constructor(dependencies) {
        this.db = dependencies.db;
        this.emailService = dependencies.emailService;
        this.paymentService = dependencies.paymentService;
        this.inventoryService = dependencies.inventoryService;
        this.notificationService = dependencies.notificationService;
    }

    /**
     * Single responsibility method for processing an order
     */
    async processOrder(order) {
        try {
            // Validate order
            const orderValidation = validateOrder(order);
            if (!orderValidation.valid) {
                throw new Error(orderValidation.error);
            }

            // Get and validate customer
            const customer = await this.getCustomer(order.customer.id);
            const customerValidation = validateCustomer(customer, order.total);
            if (!customerValidation.valid) {
                throw new Error(customerValidation.error);
            }

            // Process payment
            const paymentResult = await this.processPayment(order, customer);
            if (!paymentResult.success) {
                throw new Error('Payment processing failed');
            }

            // Update inventory
            const inventoryResult = await this.updateInventory(order.items);
            if (!inventoryResult.success) {
                await this.refundPayment(paymentResult.id);
                throw new Error('Inventory update failed');
            }

            // Calculate order status
            const orderStatus = calculateOrderStatus(order, paymentResult, inventoryResult);

            // Save order
            const savedOrder = await this.saveOrder(order, orderStatus, paymentResult.id);

            // Send notifications
            await this.sendNotifications(savedOrder, customer);

            return {
                success: true,
                orderId: savedOrder.id,
                status: orderStatus
            };
        } catch (error) {
            await this.handleError(error);
            throw error;
        }
    }

    /**
     * Single responsibility method for getting customer
     */
    async getCustomer(customerId) {
        const db = await this.db;
        return db.collection('customers').findOne({ id: customerId });
    }

    /**
     * Single responsibility method for processing payment
     */
    async processPayment(order, customer) {
        return this.paymentService.processPayment({
            amount: order.total,
            method: order.payment.method,
            customerId: customer.id
        });
    }

    /**
     * Single responsibility method for updating inventory
     */
    async updateInventory(items) {
        return this.inventoryService.updateInventory(items);
    }

    /**
     * Single responsibility method for refunding payment
     */
    async refundPayment(paymentId) {
        return this.paymentService.refundPayment(paymentId);
    }

    /**
     * Single responsibility method for saving order
     */
    async saveOrder(order, status, paymentId) {
        const db = await this.db;
        const orderToSave = {
            ...order,
            status,
            paymentId,
            createdAt: new Date()
        };
        await db.collection('orders').insertOne(orderToSave);
        return orderToSave;
    }

    /**
     * Single responsibility method for sending notifications
     */
    async sendNotifications(order, customer) {
        await Promise.all([
            this.emailService.sendOrderConfirmation(order, customer),
            this.notificationService.notifyWarehouse(order),
            this.notificationService.notifyShipping(order)
        ]);
    }

    /**
     * Single responsibility method for error handling
     */
    async handleError(error) {
        console.error('Order processing failed:', error);
        // Additional error handling logic here
    }

    /**
     * Single responsibility method for getting order history
     */
    async getOrderHistory(customerId, options = {}) {
        try {
            const query = this.buildOrderHistoryQuery(customerId, options);
            const sort = this.buildOrderHistorySort(options);
            const pagination = this.buildOrderHistoryPagination(options);

            const orders = await this.fetchOrders(query, sort, pagination);
            const total = await this.countOrders(query);
            const enrichedOrders = await this.enrichOrders(orders);

            return this.buildOrderHistoryResponse(enrichedOrders, total, pagination);
        } catch (error) {
            await this.handleError(error);
            throw error;
        }
    }

    /**
     * Pure function for building order history query
     */
    buildOrderHistoryQuery(customerId, options) {
        return {
            'customer.id': customerId,
            ...(options.status ? { status: options.status } : {}),
            ...(options.startDate ? { createdAt: { $gte: new Date(options.startDate) } } : {}),
            ...(options.endDate ? { createdAt: { $lte: new Date(options.endDate) } } : {})
        };
    }

    /**
     * Pure function for building order history sort
     */
    buildOrderHistorySort(options) {
        const sort = {};
        if (options.sortBy) {
            sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }
        return sort;
    }

    /**
     * Pure function for building order history pagination
     */
    buildOrderHistoryPagination(options) {
        const limit = options.limit || 10;
        const page = options.page || 1;
        return {
            limit,
            page,
            skip: (page - 1) * limit
        };
    }

    /**
     * Single responsibility method for fetching orders
     */
    async fetchOrders(query, sort, pagination) {
        const db = await this.db;
        return db.collection('orders')
            .find(query)
            .sort(sort)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .toArray();
    }

    /**
     * Single responsibility method for counting orders
     */
    async countOrders(query) {
        const db = await this.db;
        return db.collection('orders').countDocuments(query);
    }

    /**
     * Single responsibility method for enriching orders
     */
    async enrichOrders(orders) {
        return Promise.all(orders.map(async order => {
            const [customer, payment, inventory] = await Promise.all([
                this.getCustomer(order.customer.id),
                this.paymentService.getPaymentDetails(order.paymentId),
                this.inventoryService.getInventoryStatus(order.items)
            ]);

            return {
                ...order,
                customer: {
                    ...order.customer,
                    name: customer.name,
                    email: customer.email
                },
                payment: {
                    ...order.payment,
                    status: payment.status,
                    processedAt: payment.processedAt
                },
                inventory: {
                    status: inventory.status,
                    availableItems: inventory.availableItems
                }
            };
        }));
    }

    /**
     * Pure function for building order history response
     */
    buildOrderHistoryResponse(orders, total, pagination) {
        return {
            orders,
            total,
            page: pagination.page,
            limit: pagination.limit,
            pages: Math.ceil(total / pagination.limit)
        };
    }
}

/**
 * Factory function for creating OrderProcessor
 */
const createOrderProcessor = (dependencies) => {
    return new OrderProcessor(dependencies);
};

module.exports = {
    createOrderProcessor,
    validateOrder,
    validateCustomer,
    calculateOrderStatus
}; 