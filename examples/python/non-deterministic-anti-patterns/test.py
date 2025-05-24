"""
This example demonstrates how to test code with controlled non-deterministic behavior:

1. Mock time providers
2. Mock random number generators
3. Mock external services
4. Test time-dependent behavior
5. Test side effects
6. Test error conditions
"""

import unittest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from testable import (
    TimeProvider, RandomProvider, InventoryService, CreditService,
    ShippingService, EmailService, OrderProcessor, CacheManager,
    FileSystem, FileProcessor
)


class MockTimeProvider:
    def __init__(self, current_time: datetime):
        self.current_time = current_time

    def now(self) -> datetime:
        return self.current_time

    def sleep(self, seconds: float) -> None:
        # No-op in tests
        pass


class MockRandomProvider:
    def __init__(self, values: list[float]):
        self.values = values
        self.index = 0

    def uniform(self, min_val: float, max_val: float) -> float:
        value = self.values[self.index]
        self.index = (self.index + 1) % len(self.values)
        return value

    def random(self) -> float:
        value = self.values[self.index]
        self.index = (self.index + 1) % len(self.values)
        return value


class TestOrderProcessor(unittest.TestCase):
    def setUp(self):
        # Create mock dependencies
        self.time_provider = Mock(spec=TimeProvider)
        self.random_provider = Mock(spec=RandomProvider)
        self.inventory_service = Mock(spec=InventoryService)
        self.credit_service = Mock(spec=CreditService)
        self.shipping_service = Mock(spec=ShippingService)
        self.email_service = Mock(spec=EmailService)

        # Create processor with mock dependencies
        self.processor = OrderProcessor(
            time_provider=self.time_provider,
            random_provider=self.random_provider,
            inventory_service=self.inventory_service,
            credit_service=self.credit_service,
            shipping_service=self.shipping_service,
            email_service=self.email_service
        )

        # Sample order data
        self.order_data = {
            "id": "123",
            "customer_id": "456",
            "customer_email": "test@example.com",
            "items": [{"id": "789", "quantity": 2}],
            "total": 100.0,
            "shipping_address": {"street": "123 Main St", "city": "Test City"}
        }

    def test_process_order_during_business_hours(self):
        # Setup
        self.time_provider.now.return_value = datetime(2024, 1, 1, 10, 0)  # 10 AM
        self.inventory_service.check_availability.return_value = True
        self.credit_service.check_credit.return_value = True
        self.shipping_service.check_availability.return_value = True

        # Execute
        success, error = self.processor.process_order(self.order_data)

        # Verify
        self.assertTrue(success)
        self.assertIsNone(error)
        self.inventory_service.check_availability.assert_called_once()
        self.credit_service.check_credit.assert_called_once()
        self.shipping_service.check_availability.assert_called_once()
        self.email_service.send_email.assert_called_once()

    def test_process_order_outside_business_hours(self):
        # Setup
        self.time_provider.now.return_value = datetime(2024, 1, 1, 8, 0)  # 8 AM

        # Execute
        success, error = self.processor.process_order(self.order_data)

        # Verify
        self.assertFalse(success)
        self.assertIn("business hours", error)
        self.inventory_service.check_availability.assert_not_called()
        self.credit_service.check_credit.assert_not_called()
        self.shipping_service.check_availability.assert_not_called()
        self.email_service.send_email.assert_not_called()

    def test_process_order_insufficient_inventory(self):
        # Setup
        self.time_provider.now.return_value = datetime(2024, 1, 1, 10, 0)
        self.inventory_service.check_availability.return_value = False

        # Execute
        success, error = self.processor.process_order(self.order_data)

        # Verify
        self.assertFalse(success)
        self.assertEqual(error, "Insufficient inventory")
        self.inventory_service.check_availability.assert_called_once()
        self.credit_service.check_credit.assert_not_called()
        self.shipping_service.check_availability.assert_not_called()
        self.email_service.send_email.assert_not_called()


class TestCacheManager(unittest.TestCase):
    def setUp(self):
        self.current_time = datetime(2024, 1, 1, 10, 0)
        self.time_provider = MockTimeProvider(self.current_time)
        self.cache_manager = CacheManager(self.time_provider)

    def test_cache_expiration(self):
        # Setup
        self.cache_manager.set("key1", "value1")
        self.cache_manager.set("key2", "value2")

        # Move time forward by 2 hours
        self.time_provider.current_time = self.current_time + timedelta(hours=2)

        # Execute
        value1 = self.cache_manager.get("key1")
        value2 = self.cache_manager.get("key2")

        # Verify
        self.assertIsNone(value1)  # Should be expired
        self.assertIsNone(value2)  # Should be expired

    def test_cache_cleanup(self):
        # Setup
        self.cache_manager.set("key1", "value1")
        self.cache_manager.set("key2", "value2")

        # Move time forward by 2 hours
        self.time_provider.current_time = self.current_time + timedelta(hours=2)

        # Execute
        self.cache_manager.cleanup()

        # Verify
        self.assertEqual(len(self.cache_manager.cache), 0)


class TestFileProcessor(unittest.TestCase):
    def setUp(self):
        self.time_provider = MockTimeProvider(datetime(2024, 1, 1, 10, 0))
        self.file_system = Mock(spec=FileSystem)
        self.processor = FileProcessor(self.file_system, self.time_provider)

    def test_process_new_files(self):
        # Setup
        self.file_system.list_files.return_value = ["file1.txt", "file2.txt"]
        self.processor.processed_files = set()

        # Execute
        new_files = self.processor.process_new_files()

        # Verify
        self.assertEqual(new_files, ["file1.txt", "file2.txt"])
        self.file_system.list_files.assert_called_once()
        self.file_system.process_file.assert_any_call("file1.txt")
        self.file_system.process_file.assert_any_call("file2.txt")
        self.assertEqual(self.processor.processed_files, {"file1.txt", "file2.txt"})

    def test_process_new_files_no_new_files(self):
        # Setup
        self.file_system.list_files.return_value = ["file1.txt", "file2.txt"]
        self.processor.processed_files = {"file1.txt", "file2.txt"}

        # Execute
        new_files = self.processor.process_new_files()

        # Verify
        self.assertEqual(new_files, [])
        self.file_system.list_files.assert_called_once()
        self.file_system.process_file.assert_not_called()


if __name__ == '__main__':
    unittest.main() 