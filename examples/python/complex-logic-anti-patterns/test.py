"""
This example demonstrates how to test code with clear boundaries:

1. Tests each component in isolation
2. Verifies business rules independently
3. Uses mock objects for dependencies
4. Tests edge cases and error conditions
"""

import unittest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch
from testable import (
    Address, Customer, CustomerType, Order, OrderItem, ShippingMethod,
    DiscountCalculator, TaxCalculator, ShippingCalculator, OrderValidator,
    OrderProcessor, HolidayChecker, InventoryItem, ReorderPolicy, InventoryManager
)


class TestDiscountCalculator(unittest.TestCase):
    def setUp(self):
        self.discount_rules = {
            "NEW_CUSTOMER": Decimal('0.1'),
            "LOYAL_CUSTOMER": Decimal('0.15'),
            "HOLIDAY": Decimal('0.2')
        }
        self.calculator = DiscountCalculator(self.discount_rules)

    def test_new_customer_discount(self):
        discount = self.calculator.calculate_discount(
            Decimal('100'),
            CustomerType.NEW,
            False
        )
        self.assertEqual(discount, Decimal('10'))

    def test_loyal_customer_discount(self):
        discount = self.calculator.calculate_discount(
            Decimal('100'),
            CustomerType.LOYAL,
            False
        )
        self.assertEqual(discount, Decimal('15'))

    def test_holiday_discount(self):
        discount = self.calculator.calculate_discount(
            Decimal('100'),
            CustomerType.NEW,
            True
        )
        self.assertEqual(discount, Decimal('20'))


class TestTaxCalculator(unittest.TestCase):
    def setUp(self):
        self.tax_rates = {
            "US": Decimal('0.08'),
            "CA": Decimal('0.12'),
            "UK": Decimal('0.20')
        }
        self.calculator = TaxCalculator(self.tax_rates)

    def test_us_tax(self):
        tax = self.calculator.calculate_tax(Decimal('100'), "US")
        self.assertEqual(tax, Decimal('8'))

    def test_ca_tax(self):
        tax = self.calculator.calculate_tax(Decimal('100'), "CA")
        self.assertEqual(tax, Decimal('12'))

    def test_default_tax(self):
        tax = self.calculator.calculate_tax(Decimal('100'), "FR")
        self.assertEqual(tax, Decimal('8'))


class TestShippingCalculator(unittest.TestCase):
    def setUp(self):
        self.shipping_rates = {
            ShippingMethod.STANDARD: Decimal('5'),
            ShippingMethod.EXPRESS: Decimal('15'),
            ShippingMethod.OVERNIGHT: Decimal('25')
        }
        self.calculator = ShippingCalculator(self.shipping_rates)

    def test_standard_shipping(self):
        cost = self.calculator.calculate_shipping(ShippingMethod.STANDARD)
        self.assertEqual(cost, Decimal('5'))

    def test_express_shipping(self):
        cost = self.calculator.calculate_shipping(ShippingMethod.EXPRESS)
        self.assertEqual(cost, Decimal('15'))

    def test_overnight_shipping(self):
        cost = self.calculator.calculate_shipping(ShippingMethod.OVERNIGHT)
        self.assertEqual(cost, Decimal('25'))


class TestOrderValidator(unittest.TestCase):
    def setUp(self):
        self.validator = OrderValidator()

    def test_valid_order(self):
        order = Order(
            items=[
                OrderItem(id="1", price=Decimal('10'), quantity=2)
            ],
            customer=Customer(id="1", type=CustomerType.NEW, name="Test User"),
            shipping_address=Address(
                country="US",
                street="123 Main St",
                city="Test City",
                postal_code="12345"
            ),
            shipping_method=ShippingMethod.STANDARD
        )
        is_valid, error = self.validator.validate_order(order)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_invalid_order_no_items(self):
        order = Order(
            items=[],
            customer=Customer(id="1", type=CustomerType.NEW, name="Test User"),
            shipping_address=Address(
                country="US",
                street="123 Main St",
                city="Test City",
                postal_code="12345"
            ),
            shipping_method=ShippingMethod.STANDARD
        )
        is_valid, error = self.validator.validate_order(order)
        self.assertFalse(is_valid)
        self.assertEqual(error, "No items in order")


class TestOrderProcessor(unittest.TestCase):
    def setUp(self):
        self.discount_calculator = Mock(spec=DiscountCalculator)
        self.tax_calculator = Mock(spec=TaxCalculator)
        self.shipping_calculator = Mock(spec=ShippingCalculator)
        self.order_validator = Mock(spec=OrderValidator)
        self.holiday_checker = Mock(spec=HolidayChecker)

        self.processor = OrderProcessor(
            self.discount_calculator,
            self.tax_calculator,
            self.shipping_calculator,
            self.order_validator,
            self.holiday_checker
        )

    def test_successful_order(self):
        # Setup test data
        order = Order(
            items=[
                OrderItem(id="1", price=Decimal('100'), quantity=2)
            ],
            customer=Customer(id="1", type=CustomerType.NEW, name="Test User"),
            shipping_address=Address(
                country="US",
                street="123 Main St",
                city="Test City",
                postal_code="12345"
            ),
            shipping_method=ShippingMethod.STANDARD
        )

        # Setup mocks
        self.order_validator.validate_order.return_value = (True, None)
        self.discount_calculator.calculate_discount.return_value = Decimal('20')
        self.shipping_calculator.calculate_shipping.return_value = Decimal('5')
        self.tax_calculator.calculate_tax.return_value = Decimal('14.40')
        self.holiday_checker.is_holiday_season.return_value = False

        # Call the method
        success, error, total = self.processor.process_order(order)

        # Verify the result
        self.assertTrue(success)
        self.assertIsNone(error)
        self.assertEqual(total, Decimal('199.40'))

        # Verify mock calls
        self.order_validator.validate_order.assert_called_once_with(order)
        self.discount_calculator.calculate_discount.assert_called_once()
        self.shipping_calculator.calculate_shipping.assert_called_once_with(ShippingMethod.STANDARD)
        self.tax_calculator.calculate_tax.assert_called_once()


class TestReorderPolicy(unittest.TestCase):
    def setUp(self):
        self.policy = ReorderPolicy(threshold=10, quantity=50, cooldown_days=7)

    def test_should_reorder_below_threshold(self):
        item = InventoryItem("1")
        item.quantity = 5
        self.assertTrue(self.policy.should_reorder(item))

    def test_should_not_reorder_above_threshold(self):
        item = InventoryItem("1")
        item.quantity = 15
        self.assertFalse(self.policy.should_reorder(item))

    def test_should_not_reorder_during_cooldown(self):
        item = InventoryItem("1")
        item.quantity = 5
        item.reorder_history.append(datetime.now() - timedelta(days=3))
        self.assertFalse(self.policy.should_reorder(item))


class TestInventoryManager(unittest.TestCase):
    def setUp(self):
        self.reorder_policy = Mock(spec=ReorderPolicy)
        self.manager = InventoryManager(self.reorder_policy)

    def test_update_inventory_success(self):
        # Setup
        self.reorder_policy.should_reorder.return_value = False

        # Call the method
        success, error = self.manager.update_inventory("1", 10)

        # Verify the result
        self.assertTrue(success)
        self.assertIsNone(error)
        self.assertEqual(self.manager.inventory["1"].quantity, 10)

    def test_update_inventory_insufficient(self):
        # Call the method
        success, error = self.manager.update_inventory("1", -20)

        # Verify the result
        self.assertFalse(success)
        self.assertEqual(error, "Insufficient inventory")

    def test_update_inventory_reorder(self):
        # Setup
        self.reorder_policy.should_reorder.return_value = True

        # Call the method
        success, error = self.manager.update_inventory("1", 10)

        # Verify the result
        self.assertTrue(success)
        self.assertIsNone(error)
        self.reorder_policy.should_reorder.assert_called_once()


if __name__ == '__main__':
    unittest.main() 