"""
This example demonstrates the Complex Logic anti-pattern:

1. Methods with multiple responsibilities
2. Deeply nested conditionals
3. Complex algorithms without clear boundaries
4. Mixed levels of abstraction
5. Unclear business rules
6. Hidden dependencies
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


class OrderProcessor:
    def __init__(self):
        self.discount_rules = {
            "NEW_CUSTOMER": 0.1,  # 10% discount
            "LOYAL_CUSTOMER": 0.15,  # 15% discount
            "HOLIDAY": 0.2,  # 20% discount
        }
        self.tax_rates = {
            "US": 0.08,
            "CA": 0.12,
            "UK": 0.20,
        }
        self.shipping_rates = {
            "STANDARD": 5.0,
            "EXPRESS": 15.0,
            "OVERNIGHT": 25.0,
        }

    def process_order(self, order_data: Dict) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Process an order with complex business rules and calculations.
        Returns (success, error_message, total_amount)
        """
        try:
            # Validate order data
            if not order_data.get("items"):
                return False, "No items in order", None
            
            if not order_data.get("customer"):
                return False, "No customer information", None
            
            if not order_data.get("shipping_address"):
                return False, "No shipping address", None

            # Calculate subtotal
            subtotal = 0
            for item in order_data["items"]:
                if not item.get("price") or not item.get("quantity"):
                    return False, "Invalid item data", None
                subtotal += item["price"] * item["quantity"]

            # Apply discounts
            discount = 0
            if order_data["customer"].get("type") == "NEW_CUSTOMER":
                discount = subtotal * self.discount_rules["NEW_CUSTOMER"]
            elif order_data["customer"].get("type") == "LOYAL_CUSTOMER":
                discount = subtotal * self.discount_rules["LOYAL_CUSTOMER"]
            
            # Check for holiday discount
            if self._is_holiday_season():
                holiday_discount = subtotal * self.discount_rules["HOLIDAY"]
                discount = max(discount, holiday_discount)

            # Calculate shipping
            shipping_cost = 0
            if order_data.get("shipping_method") == "STANDARD":
                shipping_cost = self.shipping_rates["STANDARD"]
            elif order_data.get("shipping_method") == "EXPRESS":
                shipping_cost = self.shipping_rates["EXPRESS"]
            elif order_data.get("shipping_method") == "OVERNIGHT":
                shipping_cost = self.shipping_rates["OVERNIGHT"]
            else:
                return False, "Invalid shipping method", None

            # Apply tax based on country
            country = order_data["shipping_address"].get("country", "US")
            tax_rate = self.tax_rates.get(country, self.tax_rates["US"])
            tax_amount = (subtotal - discount) * tax_rate

            # Calculate final total
            total = subtotal - discount + shipping_cost + tax_amount

            # Validate total amount
            if total <= 0:
                return False, "Invalid total amount", None

            # Check for minimum order amount
            if total < 10.0:
                return False, "Order amount too small", None

            # Check for maximum order amount
            if total > 10000.0:
                return False, "Order amount too large", None

            return True, None, total

        except Exception as e:
            return False, str(e), None

    def _is_holiday_season(self) -> bool:
        """Check if current date is during holiday season (Nov 15 - Dec 31)"""
        now = datetime.now()
        holiday_start = datetime(now.year, 11, 15)
        holiday_end = datetime(now.year, 12, 31)
        return holiday_start <= now <= holiday_end


class InventoryManager:
    def __init__(self):
        self.inventory = {}
        self.reorder_threshold = 10
        self.reorder_quantity = 50

    def update_inventory(self, item_id: str, quantity: int) -> Tuple[bool, Optional[str]]:
        """
        Update inventory levels and handle reordering.
        Returns (success, error_message)
        """
        try:
            if item_id not in self.inventory:
                self.inventory[item_id] = {
                    "quantity": 0,
                    "last_updated": datetime.now(),
                    "reorder_history": []
                }

            current_quantity = self.inventory[item_id]["quantity"]
            new_quantity = current_quantity + quantity

            if new_quantity < 0:
                return False, "Insufficient inventory"

            self.inventory[item_id]["quantity"] = new_quantity
            self.inventory[item_id]["last_updated"] = datetime.now()

            # Check if reordering is needed
            if new_quantity <= self.reorder_threshold:
                self._handle_reorder(item_id)

            return True, None

        except Exception as e:
            return False, str(e)

    def _handle_reorder(self, item_id: str) -> None:
        """Handle reordering logic with complex business rules"""
        if item_id not in self.inventory:
            return

        item = self.inventory[item_id]
        last_reorder = item["reorder_history"][-1] if item["reorder_history"] else None

        # Check if enough time has passed since last reorder
        if last_reorder and (datetime.now() - last_reorder) < timedelta(days=7):
            return

        # Add reorder to history
        item["reorder_history"].append(datetime.now())

        # Update quantity
        item["quantity"] += self.reorder_quantity 