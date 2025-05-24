/**
 * This example demonstrates the Private Method Complexity anti-pattern:
 *
 * 1. Complex logic hidden in private (non-exported) methods
 * 2. No way to test edge cases or error conditions directly
 * 3. Tests must go through public interfaces only
 * 4. Difficult to isolate and verify specific behaviors
 */

class PaymentProcessor {
    constructor(paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    /**
     * Public method: processes a payment
     */
    async processPayment(userId, amount, cardInfo) {
        // Complex logic is hidden in private methods
        if (!this.#validateCard(cardInfo)) {
            throw new Error('Invalid card information');
        }
        const riskScore = this.#calculateRisk(userId, amount, cardInfo);
        if (riskScore > 0.7) {
            throw new Error('High risk transaction');
        }
        return await this.paymentGateway.charge(userId, amount, cardInfo);
    }

    /**
     * Private method: complex card validation logic
     */
    #validateCard(cardInfo) {
        // Complex, hard-to-test logic
        if (!cardInfo || typeof cardInfo.number !== 'string' || cardInfo.number.length !== 16) {
            return false;
        }
        if (!/^\d{16}$/.test(cardInfo.number)) {
            return false;
        }
        // Luhn algorithm (simplified)
        let sum = 0;
        for (let i = 0; i < 16; i++) {
            let digit = parseInt(cardInfo.number[i], 10);
            if (i % 2 === 0) digit *= 2;
            if (digit > 9) digit -= 9;
            sum += digit;
        }
        return sum % 10 === 0;
    }

    /**
     * Private method: complex risk calculation
     */
    #calculateRisk(userId, amount, cardInfo) {
        // Complex, hard-to-test logic
        let risk = 0;
        if (amount > 1000) risk += 0.5;
        if (cardInfo.country !== 'US') risk += 0.2;
        if (/^1234/.test(cardInfo.number)) risk += 0.3;
        if (userId.startsWith('test')) risk += 0.1;
        // Simulate external check (not injectable)
        if (Math.random() > 0.95) risk += 0.2;
        return Math.min(risk, 1);
    }
}

module.exports = PaymentProcessor; 