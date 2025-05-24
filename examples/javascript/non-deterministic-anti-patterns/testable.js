/**
 * This example demonstrates proper handling of non-deterministic behavior with:
 * 
 * 1. Time abstraction
 * 2. Controlled random number generation
 * 3. External system abstraction
 * 4. Immutable state
 * 5. Controlled concurrency
 * 6. Controlled side effects
 */

/**
 * Time abstraction for deterministic testing
 */
class TimeProvider {
    constructor(initialTime = new Date()) {
        this.currentTime = initialTime;
    }

    now() {
        return this.currentTime;
    }

    setTime(time) {
        this.currentTime = time;
    }

    advanceTime(milliseconds) {
        this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
    }
}

/**
 * Random number generator abstraction
 */
class RandomProvider {
    constructor(seed = Math.random()) {
        this.seed = seed;
    }

    next() {
        // Simple pseudo-random number generator
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    setSeed(seed) {
        this.seed = seed;
    }
}

/**
 * Class for handling order processing with controlled non-deterministic behavior
 */
class OrderProcessor {
    constructor(dependencies) {
        this.timeProvider = dependencies.timeProvider;
        this.randomProvider = dependencies.randomProvider;
        this.db = dependencies.db;
        this.creditService = dependencies.creditService;
        this.shippingService = dependencies.shippingService;
        this.logger = dependencies.logger;
    }

    /**
     * Process order with controlled time dependency
     */
    async processOrder(order) {
        const currentTime = this.timeProvider.now();
        if (currentTime.getHours() < 9 || currentTime.getHours() > 17) {
            throw new Error('Orders can only be processed during business hours');
        }

        // Controlled random processing time
        const processingTime = this.randomProvider.next() * 1000;
        await new Promise(resolve => setTimeout(resolve, processingTime));

        return {
            ...order,
            processedAt: currentTime,
            processingTime
        };
    }

    /**
     * Process orders with controlled concurrency
     */
    async processOrders(orders, concurrencyLimit = 3) {
        const results = [];
        const chunks = this.chunkArray(orders, concurrencyLimit);

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map(order => this.processOrder(order))
            );
            results.push(...chunkResults);
        }

        return results;
    }

    /**
     * Validate order with controlled external dependencies
     */
    async validateOrder(order) {
        const [inventory, customerCredit, shippingAvailability] = await Promise.all([
            this.checkInventory(order.items),
            this.checkCustomerCredit(order.customerId),
            this.checkShippingAvailability(order.address)
        ]);

        return {
            valid: inventory.available && customerCredit.approved && shippingAvailability.available,
            inventory,
            customerCredit,
            shippingAvailability
        };
    }

    /**
     * Check inventory with controlled external dependency
     */
    async checkInventory(items) {
        const results = await Promise.all(
            items.map(item => this.db.collection('inventory').findOne({ id: item.id }))
        );

        this.logger.info('Inventory check completed', {
            timestamp: this.timeProvider.now(),
            items: items.map(item => item.id)
        });

        return {
            available: results.every(item => item && item.quantity > 0),
            items: results
        };
    }

    /**
     * Check customer credit with controlled external dependency
     */
    async checkCustomerCredit(customerId) {
        const creditCheck = await this.creditService.checkCredit(customerId);

        this.logger.info('Credit check completed', {
            timestamp: this.timeProvider.now(),
            customerId,
            score: creditCheck.score
        });

        return {
            approved: creditCheck.score > 700,
            score: creditCheck.score
        };
    }

    /**
     * Check shipping availability with controlled external dependency
     */
    async checkShippingAvailability(address) {
        const availability = await this.shippingService.checkAvailability(address);

        this.logger.info('Shipping check completed', {
            timestamp: this.timeProvider.now(),
            address: address.zipCode
        });

        return {
            available: availability.available,
            estimatedDelivery: availability.estimatedDelivery
        };
    }

    /**
     * Process queue with controlled concurrency
     */
    async processQueue(queue, concurrencyLimit = 3) {
        const results = [];
        const chunks = this.chunkArray(queue, concurrencyLimit);

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map(order => this.processOrder(order))
            );
            results.push(...chunkResults);
        }

        return results;
    }

    /**
     * Helper method to chunk array for controlled concurrency
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

/**
 * Factory function for creating OrderProcessor
 */
const createOrderProcessor = (dependencies) => {
    return new OrderProcessor({
        timeProvider: dependencies.timeProvider || new TimeProvider(),
        randomProvider: dependencies.randomProvider || new RandomProvider(),
        db: dependencies.db,
        creditService: dependencies.creditService,
        shippingService: dependencies.shippingService,
        logger: dependencies.logger
    });
};

module.exports = {
    createOrderProcessor,
    TimeProvider,
    RandomProvider,
    OrderProcessor
}; 