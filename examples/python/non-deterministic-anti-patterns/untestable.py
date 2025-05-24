"""
This example demonstrates the Non-deterministic Behavior anti-pattern:

1. Direct time dependencies
2. Random number generation
3. External system state
4. Uncontrolled side effects
5. Race conditions
6. Unpredictable behavior
"""

import os
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


class OrderProcessor:
    def __init__(self):
        self.processing_queue: List[Dict] = []
        self.is_processing = False
        self.last_processed_id = None

    def process_order(self, order_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Process an order with non-deterministic behavior:
        - Time-dependent processing
        - Random processing time
        - External system state checks
        - Uncontrolled side effects
        """
        try:
            # Time-dependent check
            current_hour = datetime.now().hour
            if not (9 <= current_hour <= 17):
                return False, "Orders can only be processed during business hours (9 AM - 5 PM)"

            # Random processing time
            processing_time = random.uniform(0.5, 2.0)
            time.sleep(processing_time)

            # External system state checks
            if not self._check_inventory(order_data.get("items", [])):
                return False, "Insufficient inventory"

            if not self._check_customer_credit(order_data.get("customer_id")):
                return False, "Insufficient credit"

            if not self._check_shipping_availability(order_data.get("shipping_address")):
                return False, "Shipping not available to this address"

            # Uncontrolled side effects
            self._update_inventory(order_data.get("items", []))
            self._update_customer_credit(order_data.get("customer_id"), order_data.get("total", 0))
            self._send_confirmation_email(order_data.get("customer_email"))

            return True, None

        except Exception as e:
            return False, str(e)

    def process_orders(self, orders: List[Dict]) -> List[Tuple[bool, Optional[str]]]:
        """
        Process multiple orders with race conditions and unpredictable behavior
        """
        results = []
        self.is_processing = True

        try:
            for order in orders:
                # Race condition: Multiple processors might process the same order
                if order.get("id") == self.last_processed_id:
                    continue

                success, error = self.process_order(order)
                results.append((success, error))
                self.last_processed_id = order.get("id")

        finally:
            self.is_processing = False

        return results

    def _check_inventory(self, items: List[Dict]) -> bool:
        """Check inventory levels (simulates external system state)"""
        # Simulate network delay
        time.sleep(random.uniform(0.1, 0.5))
        return random.random() > 0.1  # 90% chance of having inventory

    def _check_customer_credit(self, customer_id: str) -> bool:
        """Check customer credit (simulates external system state)"""
        # Simulate network delay
        time.sleep(random.uniform(0.1, 0.5))
        return random.random() > 0.2  # 80% chance of having sufficient credit

    def _check_shipping_availability(self, address: Dict) -> bool:
        """Check shipping availability (simulates external system state)"""
        # Simulate network delay
        time.sleep(random.uniform(0.1, 0.5))
        return random.random() > 0.05  # 95% chance of shipping being available

    def _update_inventory(self, items: List[Dict]) -> None:
        """Update inventory (uncontrolled side effect)"""
        # Simulate network delay
        time.sleep(random.uniform(0.2, 1.0))
        # In a real system, this would update a database

    def _update_customer_credit(self, customer_id: str, amount: float) -> None:
        """Update customer credit (uncontrolled side effect)"""
        # Simulate network delay
        time.sleep(random.uniform(0.2, 1.0))
        # In a real system, this would update a database

    def _send_confirmation_email(self, email: str) -> None:
        """Send confirmation email (uncontrolled side effect)"""
        # Simulate network delay
        time.sleep(random.uniform(0.5, 2.0))
        # In a real system, this would send an actual email


class CacheManager:
    def __init__(self):
        self.cache: Dict[str, Tuple[any, datetime]] = {}
        self.max_age = timedelta(hours=1)

    def get(self, key: str) -> Optional[any]:
        """Get value from cache with time-dependent expiration"""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.max_age:
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: any) -> None:
        """Set value in cache with current timestamp"""
        self.cache[key] = (value, datetime.now())

    def cleanup(self) -> None:
        """Clean up expired cache entries"""
        now = datetime.now()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if now - timestamp >= self.max_age
        ]
        for key in expired_keys:
            del self.cache[key]


class FileProcessor:
    def __init__(self, directory: str):
        self.directory = directory
        self.processed_files: set[str] = set()

    def process_new_files(self) -> List[str]:
        """Process new files in directory (non-deterministic due to file system)"""
        try:
            # Get list of files (non-deterministic)
            files = os.listdir(self.directory)
            
            # Filter for unprocessed files
            new_files = [f for f in files if f not in self.processed_files]
            
            # Process each file
            for file in new_files:
                self._process_file(file)
                self.processed_files.add(file)
            
            return new_files

        except Exception as e:
            print(f"Error processing files: {e}")
            return []

    def _process_file(self, filename: str) -> None:
        """Process a single file (simulates file processing)"""
        # Simulate processing time
        time.sleep(random.uniform(0.1, 1.0))
        # In a real system, this would actually process the file


# Usage example
def main():
    # Create instances
    order_processor = OrderProcessor()
    cache_manager = CacheManager()
    file_processor = FileProcessor("./data")

    # Process an order
    order = {
        "id": "123",
        "customer_id": "456",
        "customer_email": "test@example.com",
        "items": [{"id": "789", "quantity": 2}],
        "total": 100.0,
        "shipping_address": {"street": "123 Main St", "city": "Test City"}
    }

    success, error = order_processor.process_order(order)
    print(f"Order processing {'succeeded' if success else 'failed'}: {error}")

    # Use cache
    cache_manager.set("test_key", "test_value")
    value = cache_manager.get("test_key")
    print(f"Cached value: {value}")

    # Process files
    new_files = file_processor.process_new_files()
    print(f"Processed {len(new_files)} new files")


if __name__ == "__main__":
    main() 