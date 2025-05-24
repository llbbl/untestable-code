"""
This example demonstrates a testable approach to complex logic:

1. Single responsibility methods
2. Clear business rules
3. Separated concerns
4. Explicit dependencies
5. Pure functions
6. Clear boundaries
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Tuple


class CustomerType(Enum):
    NEW = "NEW_CUSTOMER"
    LOYAL = "LOYAL_CUSTOMER"


class ShippingMethod(Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"
    OVERNIGHT = "OVERNIGHT"


@dataclass
class Address:
    country: str
    street: str
    city: str
    postal_code: str


@dataclass
class Customer:
    id: str
    type: CustomerType
    name: str


@dataclass
class OrderItem:
    id: str
    price: Decimal
    quantity: int

    @property
    def subtotal(self) -> Decimal:
        return self.price * Decimal(self.quantity)


@dataclass
class Order:
    items: List[OrderItem]
    customer: Customer
    shipping_address: Address
    shipping_method: ShippingMethod


class DiscountCalculator:
    def __init__(self, discount_rules: Dict[str, Decimal]):
        self.discount_rules = discount_rules

    def calculate_discount(self, subtotal: Decimal, customer_type: CustomerType, is_holiday: bool) -> Decimal:
        # Calculate customer discount
        customer_discount = Decimal('0')
        if customer_type == CustomerType.NEW:
            customer_discount = subtotal * self.discount_rules["NEW_CUSTOMER"]
        elif customer_type == CustomerType.LOYAL:
            customer_discount = subtotal * self.discount_rules["LOYAL_CUSTOMER"]

        # Calculate holiday discount if applicable
        holiday_discount = Decimal('0')
        if is_holiday:
            holiday_discount = subtotal * self.discount_rules["HOLIDAY"]

        return max(customer_discount, holiday_discount)


class TaxCalculator:
    def __init__(self, tax_rates: Dict[str, Decimal]):
        self.tax_rates = tax_rates

    def calculate_tax(self, amount: Decimal, country: str) -> Decimal:
        tax_rate = self.tax_rates.get(country, self.tax_rates["US"])
        return amount * tax_rate


class ShippingCalculator:
    def __init__(self, shipping_rates: Dict[ShippingMethod, Decimal]):
        self.shipping_rates = shipping_rates

    def calculate_shipping(self, method: ShippingMethod) -> Decimal:
        return self.shipping_rates[method]


class OrderValidator:
    def validate_order(self, order: Order) -> Tuple[bool, Optional[str]]:
        if not order.items:
            return False, "No items in order"
        
        if not order.customer:
            return False, "No customer information"
        
        if not order.shipping_address:
            return False, "No shipping address"

        for item in order.items:
            if not item.price or not item.quantity:
                return False, "Invalid item data"

        return True, None


class OrderProcessor:
    def __init__(
        self,
        discount_calculator: DiscountCalculator,
        tax_calculator: TaxCalculator,
        shipping_calculator: ShippingCalculator,
        order_validator: OrderValidator,
        holiday_checker: 'HolidayChecker'
    ):
        self.discount_calculator = discount_calculator
        self.tax_calculator = tax_calculator
        self.shipping_calculator = shipping_calculator
        self.order_validator = order_validator
        self.holiday_checker = holiday_checker

    def process_order(self, order: Order) -> Tuple[bool, Optional[str], Optional[Decimal]]:
        # Validate order
        is_valid, error = self.order_validator.validate_order(order)
        if not is_valid:
            return False, error, None

        try:
            # Calculate subtotal
            subtotal = sum(item.subtotal for item in order.items)

            # Calculate discount
            discount = self.discount_calculator.calculate_discount(
                subtotal,
                order.customer.type,
                self.holiday_checker.is_holiday_season()
            )

            # Calculate shipping
            shipping_cost = self.shipping_calculator.calculate_shipping(order.shipping_method)

            # Calculate tax
            tax_amount = self.tax_calculator.calculate_tax(
                subtotal - discount,
                order.shipping_address.country
            )

            # Calculate total
            total = subtotal - discount + shipping_cost + tax_amount

            # Validate total
            if total <= 0:
                return False, "Invalid total amount", None
            if total < Decimal('10.0'):
                return False, "Order amount too small", None
            if total > Decimal('10000.0'):
                return False, "Order amount too large", None

            return True, None, total

        except Exception as e:
            return False, str(e), None


class HolidayChecker:
    def is_holiday_season(self) -> bool:
        now = datetime.now()
        holiday_start = datetime(now.year, 11, 15)
        holiday_end = datetime(now.year, 12, 31)
        return holiday_start <= now <= holiday_end


class InventoryItem:
    def __init__(self, item_id: str):
        self.item_id = item_id
        self.quantity = 0
        self.last_updated = datetime.now()
        self.reorder_history: List[datetime] = []


class ReorderPolicy:
    def __init__(self, threshold: int, quantity: int, cooldown_days: int):
        self.threshold = threshold
        self.quantity = quantity
        self.cooldown_days = cooldown_days

    def should_reorder(self, item: InventoryItem) -> bool:
        if item.quantity > self.threshold:
            return False

        last_reorder = item.reorder_history[-1] if item.reorder_history else None
        if last_reorder and (datetime.now() - last_reorder) < timedelta(days=self.cooldown_days):
            return False

        return True


class InventoryManager:
    def __init__(self, reorder_policy: ReorderPolicy):
        self.inventory: Dict[str, InventoryItem] = {}
        self.reorder_policy = reorder_policy

    def update_inventory(self, item_id: str, quantity: int) -> Tuple[bool, Optional[str]]:
        try:
            if item_id not in self.inventory:
                self.inventory[item_id] = InventoryItem(item_id)

            item = self.inventory[item_id]
            new_quantity = item.quantity + quantity

            if new_quantity < 0:
                return False, "Insufficient inventory"

            item.quantity = new_quantity
            item.last_updated = datetime.now()

            if self.reorder_policy.should_reorder(item):
                self._reorder_item(item)

            return True, None

        except Exception as e:
            return False, str(e)

    def _reorder_item(self, item: InventoryItem) -> None:
        item.reorder_history.append(datetime.now())
        item.quantity += self.reorder_policy.quantity 