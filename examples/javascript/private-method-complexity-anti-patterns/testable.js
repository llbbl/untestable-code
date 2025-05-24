/**
 * This example demonstrates a testable approach to complex logic:
 *
 * 1. Exposes complex logic for direct testing
 * 2. Uses dependency injection for external checks and randomness
 * 3. Avoids private methods; makes validation and risk calculation public or injectable
 * 4. All logic is testable in isolation
 */

class PaymentProcessor {
    constructor({ paymentGateway, random = Math.random, riskCheck = null }) {
        this.paymentGateway = paymentGateway;
        this.random = random;
        this.riskCheck = riskCheck;
    }

    /**
     * Public method: processes a payment
     */
    async processPayment(userId, amount, cardInfo) {
        if (!PaymentProcessor.validateCard(cardInfo)) {
            throw new Error('Invalid card information');
        }
        const riskScore = this.calculateRisk(userId, amount, cardInfo);
        if (riskScore > 0.7) {
            throw new Error('High risk transaction');
        }
        return await this.paymentGateway.charge(userId, amount, cardInfo);
    }

    /**
     * Public static method: card validation logic (testable)
     */
    static validateCard(cardInfo) {
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
     * Public method: risk calculation logic (testable)
     */
    calculateRisk(userId, amount, cardInfo) {
        let risk = 0;
        if (amount > 1000) risk += 0.5;
        if (cardInfo.country !== 'US') risk += 0.2;
        if (/^1234/.test(cardInfo.number)) risk += 0.3;
        if (userId.startsWith('test')) risk += 0.1;
        // Simulate external check (injectable)
        if (this.riskCheck) {
            risk += this.riskCheck(userId, amount, cardInfo);
        } else if (this.random() > 0.95) {
            risk += 0.2;
        }
        return Math.min(risk, 1);
    }
}

module.exports = PaymentProcessor; 