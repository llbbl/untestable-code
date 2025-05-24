/**
 * This example demonstrates common non-deterministic behavior anti-patterns:
 * 
 * 1. Direct time dependencies
 * 2. Random number generation
 * 3. External system state
 * 4. Global mutable state
 * 5. Race conditions
 * 6. Uncontrolled side effects
 */

/**
 * Anti-pattern: Class with non-deterministic behavior
 */
class OrderProcessor {
    constructor() {
        // Anti-pattern: Global mutable state
        this.lastProcessedId = 0;
        this.processingQueue = [];
        this.isProcessing = false;
    }

    /**
     * Anti-pattern: Direct time dependency
     */
    async processOrder(order) {
        // Anti-pattern: Using real time
        const currentTime = new Date();
        if (currentTime.getHours() < 9 || currentTime.getHours() > 17) {
            throw new Error('Orders can only be processed during business hours');
        }

        // Anti-pattern: Random number generation
        const processingTime = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Anti-pattern: Global state mutation
        this.lastProcessedId = order.id;
        return { ...order, processedAt: currentTime };
    }

    /**
     * Anti-pattern: Race conditions
     */
    async processOrders(orders) {
        // Anti-pattern: Uncontrolled concurrency
        const promises = orders.map(order => this.processOrder(order));
        return Promise.all(promises);
    }

    /**
     * Anti-pattern: External system state dependency
     */
    async validateOrder(order) {
        // Anti-pattern: External system state
        const inventory = await this.checkInventory(order.items);
        const customerCredit = await this.checkCustomerCredit(order.customerId);
        const shippingAvailability = await this.checkShippingAvailability(order.address);

        return {
            valid: inventory.available && customerCredit.approved && shippingAvailability.available,
            inventory,
            customerCredit,
            shippingAvailability
        };
    }

    /**
     * Anti-pattern: Uncontrolled side effects
     */
    async checkInventory(items) {
        // Anti-pattern: External system state
        const db = await this.getDatabase();
        const results = await Promise.all(
            items.map(item => db.collection('inventory').findOne({ id: item.id }))
        );

        // Anti-pattern: Global state mutation
        this.lastInventoryCheck = new Date();

        return {
            available: results.every(item => item && item.quantity > 0),
            items: results
        };
    }

    /**
     * Anti-pattern: External system state
     */
    async checkCustomerCredit(customerId) {
        // Anti-pattern: External system state
        const creditService = await this.getCreditService();
        const creditCheck = await creditService.checkCredit(customerId);

        // Anti-pattern: Global state mutation
        this.lastCreditCheck = new Date();

        return {
            approved: creditCheck.score > 700,
            score: creditCheck.score
        };
    }

    /**
     * Anti-pattern: External system state
     */
    async checkShippingAvailability(address) {
        // Anti-pattern: External system state
        const shippingService = await this.getShippingService();
        const availability = await shippingService.checkAvailability(address);

        // Anti-pattern: Global state mutation
        this.lastShippingCheck = new Date();

        return {
            available: availability.available,
            estimatedDelivery: availability.estimatedDelivery
        };
    }

    /**
     * Anti-pattern: Uncontrolled side effects
     */
    async getDatabase() {
        // Anti-pattern: External system state
        if (!this.db) {
            this.db = await require('mongodb').connect('mongodb://localhost:27017/myapp');
        }
        return this.db;
    }

    /**
     * Anti-pattern: Uncontrolled side effects
     */
    async getCreditService() {
        // Anti-pattern: External system state
        if (!this.creditService) {
            this.creditService = await require('./credit-service').connect();
        }
        return this.creditService;
    }

    /**
     * Anti-pattern: Uncontrolled side effects
     */
    async getShippingService() {
        // Anti-pattern: External system state
        if (!this.shippingService) {
            this.shippingService = await require('./shipping-service').connect();
        }
        return this.shippingService;
    }

    /**
     * Anti-pattern: Race conditions
     */
    async processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        try {
            while (this.processingQueue.length > 0) {
                const order = this.processingQueue.shift();
                await this.processOrder(order);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Anti-pattern: Race conditions
     */
    addToQueue(order) {
        this.processingQueue.push(order);
        this.processQueue(); // Anti-pattern: Uncontrolled concurrency
    }
}

module.exports = OrderProcessor; 