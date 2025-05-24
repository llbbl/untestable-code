/**
 * This example demonstrates how to test the testable PaymentProcessor:
 *
 * 1. Directly test card validation logic
 * 2. Directly test risk calculation logic
 * 3. Test processPayment with mocks and edge cases
 */

const PaymentProcessor = require('./testable');

describe('PaymentProcessor', () => {
    let mockGateway;
    let processor;

    beforeEach(() => {
        mockGateway = { charge: jest.fn().mockResolvedValue('success') };
        processor = new PaymentProcessor({
            paymentGateway: mockGateway,
            random: () => 0.5 // deterministic
        });
    });

    describe('validateCard', () => {
        it('should validate a correct card number', () => {
            const cardInfo = { number: '4539578763621486' }; // Valid Luhn
            expect(PaymentProcessor.validateCard(cardInfo)).toBe(true);
        });
        it('should reject a card with wrong length', () => {
            const cardInfo = { number: '123456789012345' };
            expect(PaymentProcessor.validateCard(cardInfo)).toBe(false);
        });
        it('should reject a card with non-digit characters', () => {
            const cardInfo = { number: '1234abcd5678efgh' };
            expect(PaymentProcessor.validateCard(cardInfo)).toBe(false);
        });
        it('should reject a card that fails Luhn check', () => {
            const cardInfo = { number: '1234567890123456' };
            expect(PaymentProcessor.validateCard(cardInfo)).toBe(false);
        });
    });

    describe('calculateRisk', () => {
        it('should calculate risk based on amount', () => {
            const cardInfo = { number: '4539578763621486', country: 'US' };
            expect(processor.calculateRisk('user1', 2000, cardInfo)).toBeCloseTo(0.5);
        });
        it('should add risk for non-US cards', () => {
            const cardInfo = { number: '4539578763621486', country: 'CA' };
            expect(processor.calculateRisk('user1', 500, cardInfo)).toBeCloseTo(0.2);
        });
        it('should add risk for card numbers starting with 1234', () => {
            const cardInfo = { number: '1234567890123456', country: 'US' };
            expect(processor.calculateRisk('user1', 500, cardInfo)).toBeCloseTo(0.3);
        });
        it('should add risk for userId starting with test', () => {
            const cardInfo = { number: '4539578763621486', country: 'US' };
            expect(processor.calculateRisk('testuser', 500, cardInfo)).toBeCloseTo(0.1);
        });
        it('should use injected riskCheck if provided', () => {
            const riskCheck = jest.fn().mockReturnValue(0.4);
            const customProcessor = new PaymentProcessor({
                paymentGateway: mockGateway,
                riskCheck,
                random: () => 0.5
            });
            const cardInfo = { number: '4539578763621486', country: 'US' };
            expect(customProcessor.calculateRisk('user1', 500, cardInfo)).toBeCloseTo(0.4);
            expect(riskCheck).toHaveBeenCalledWith('user1', 500, cardInfo);
        });
    });

    describe('processPayment', () => {
        it('should process a valid, low-risk payment', async () => {
            const cardInfo = { number: '4539578763621486', country: 'US' };
            const result = await processor.processPayment('user1', 100, cardInfo);
            expect(result).toBe('success');
            expect(mockGateway.charge).toHaveBeenCalledWith('user1', 100, cardInfo);
        });
        it('should throw for invalid card', async () => {
            const cardInfo = { number: '1234567890123456', country: 'US' };
            await expect(processor.processPayment('user1', 100, cardInfo)).rejects.toThrow('Invalid card information');
        });
        it('should throw for high risk', async () => {
            const cardInfo = { number: '4539578763621486', country: 'CA' };
            // amount > 1000 (0.5) + non-US (0.2) = 0.7, random() = 0.5, so not high risk
            await expect(processor.processPayment('user1', 2000, cardInfo)).resolves.toBe('success');
            // amount > 1000 (0.5) + non-US (0.2) + card starts with 1234 (0.3) = 1.0
            const highRiskCard = { number: '1234567890123456', country: 'CA' };
            await expect(processor.processPayment('user1', 2000, highRiskCard)).rejects.toThrow('High risk transaction');
        });
    });
}); 