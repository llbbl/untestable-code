/**
 * This example demonstrates common complex logic anti-patterns that make testing difficult:
 * 
 * 1. Methods with multiple responsibilities
 * 2. Deeply nested conditionals
 * 3. Complex algorithms without clear boundaries
 * 4. Mixed levels of abstraction
 * 5. Unclear business rules
 * 6. Hidden dependencies
 */

/**
 * Anti-pattern: Complex class with multiple responsibilities
 */
class OrderProcessor {
    constructor() {
        this.db = require('mongodb').connect('mongodb://localhost:27017/myapp');
        this.emailService = require('./email-service');
        this.paymentService = require('./payment-service');
        this.inventoryService = require('./inventory-service');
        this.notificationService = require('./notification-service');
    }

    /**
     * Anti-pattern: Method with multiple responsibilities
     * - Validates order
     * - Processes payment
     * - Updates inventory
     * - Sends notifications
     * - Updates order status
     * - Handles errors
     */
    async processOrder(order) {
        try {
            // Anti-pattern: Deeply nested conditionals
            if (order && order.items && order.items.length > 0) {
                if (order.customer && order.customer.id) {
                    if (order.payment && order.payment.method) {
                        // Anti-pattern: Complex algorithm without clear boundaries
                        const db = await this.db;
                        const customer = await db.collection('customers').findOne({ id: order.customer.id });
                        
                        if (customer) {
                            if (customer.status === 'active') {
                                if (customer.creditLimit >= order.total) {
                                    // Anti-pattern: Mixed levels of abstraction
                                    const paymentResult = await this.paymentService.processPayment({
                                        amount: order.total,
                                        method: order.payment.method,
                                        customerId: customer.id
                                    });

                                    if (paymentResult.success) {
                                        // Anti-pattern: Hidden dependencies
                                        const inventoryResult = await this.inventoryService.updateInventory(order.items);
                                        
                                        if (inventoryResult.success) {
                                            // Anti-pattern: Unclear business rules
                                            const orderStatus = this.calculateOrderStatus(order, paymentResult, inventoryResult);
                                            
                                            await db.collection('orders').insertOne({
                                                ...order,
                                                status: orderStatus,
                                                paymentId: paymentResult.id,
                                                createdAt: new Date()
                                            });

                                            // Anti-pattern: Multiple side effects
                                            await this.emailService.sendOrderConfirmation(order, customer);
                                            await this.notificationService.notifyWarehouse(order);
                                            await this.notificationService.notifyShipping(order);

                                            return {
                                                success: true,
                                                orderId: order.id,
                                                status: orderStatus
                                            };
                                        } else {
                                            await this.paymentService.refundPayment(paymentResult.id);
                                            throw new Error('Inventory update failed');
                                        }
                                    } else {
                                        throw new Error('Payment processing failed');
                                    }
                                } else {
                                    throw new Error('Credit limit exceeded');
                                }
                            } else {
                                throw new Error('Customer account is not active');
                            }
                        } else {
                            throw new Error('Customer not found');
                        }
                    } else {
                        throw new Error('Invalid payment method');
                    }
                } else {
                    throw new Error('Invalid customer');
                }
            } else {
                throw new Error('Invalid order');
            }
        } catch (error) {
            // Anti-pattern: Generic error handling
            console.error('Order processing failed:', error);
            throw error;
        }
    }

    /**
     * Anti-pattern: Complex algorithm without clear boundaries
     */
    calculateOrderStatus(order, paymentResult, inventoryResult) {
        // Anti-pattern: Unclear business rules
        if (order.priority === 'high') {
            if (paymentResult.method === 'credit_card') {
                if (inventoryResult.available) {
                    return 'processing';
                } else {
                    return 'backordered';
                }
            } else {
                if (inventoryResult.available) {
                    return 'pending';
                } else {
                    return 'cancelled';
                }
            }
        } else {
            if (paymentResult.method === 'credit_card') {
                if (inventoryResult.available) {
                    return 'processing';
                } else {
                    return 'backordered';
                }
            } else {
                if (inventoryResult.available) {
                    return 'pending';
                } else {
                    return 'cancelled';
                }
            }
        }
    }

    /**
     * Anti-pattern: Method with multiple responsibilities
     */
    async getOrderHistory(customerId, options = {}) {
        try {
            const db = await this.db;
            
            // Anti-pattern: Complex algorithm without clear boundaries
            const query = {
                'customer.id': customerId,
                ...(options.status ? { status: options.status } : {}),
                ...(options.startDate ? { createdAt: { $gte: new Date(options.startDate) } } : {}),
                ...(options.endDate ? { createdAt: { $lte: new Date(options.endDate) } } : {})
            };

            const sort = {};
            if (options.sortBy) {
                sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
            } else {
                sort.createdAt = -1;
            }

            const limit = options.limit || 10;
            const skip = options.page ? (options.page - 1) * limit : 0;

            // Anti-pattern: Mixed levels of abstraction
            const orders = await db.collection('orders')
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await db.collection('orders').countDocuments(query);

            // Anti-pattern: Hidden dependencies
            const enrichedOrders = await Promise.all(orders.map(async order => {
                const customer = await db.collection('customers').findOne({ id: order.customer.id });
                const payment = await this.paymentService.getPaymentDetails(order.paymentId);
                const inventory = await this.inventoryService.getInventoryStatus(order.items);

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

            return {
                orders: enrichedOrders,
                total,
                page: options.page || 1,
                limit,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            // Anti-pattern: Generic error handling
            console.error('Failed to get order history:', error);
            throw error;
        }
    }
}

module.exports = OrderProcessor; 