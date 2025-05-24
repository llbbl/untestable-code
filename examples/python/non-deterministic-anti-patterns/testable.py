"""
This example demonstrates a testable approach to non-deterministic behavior:

1. Time abstraction
2. Controlled random number generation
3. External system abstraction
4. Controlled side effects
5. Deterministic processing
6. Clear boundaries
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Protocol, Tuple


class TimeProvider(Protocol):
    """Protocol for time-related operations"""
    def now(self) -> datetime:
        """Get current time"""
        ...

    def sleep(self, seconds: float) -> None:
        """Sleep for specified duration"""
        ...


class RandomProvider(Protocol):
    """Protocol for random number generation"""
    def uniform(self, min_val: float, max_val: float) -> float:
        """Generate random float in range"""
        ...

    def random(self) -> float:
        """Generate random float between 0 and 1"""
        ...


class InventoryService(Protocol):
    """Protocol for inventory operations"""
    def check_availability(self, items: List[Dict]) -> bool:
        """Check if items are available"""
        ...

    def update_quantity(self, items: List[Dict]) -> None:
        """Update item quantities"""
        ...


class CreditService(Protocol):
    """Protocol for credit operations"""
    def check_credit(self, customer_id: str) -> bool:
        """Check if customer has sufficient credit"""
        ...

    def update_credit(self, customer_id: str, amount: float) -> None:
        """Update customer credit"""
        ...


class ShippingService(Protocol):
    """Protocol for shipping operations"""
    def check_availability(self, address: Dict) -> bool:
        """Check if shipping is available to address"""
        ...


class EmailService(Protocol):
    """Protocol for email operations"""
    def send_email(self, to: str, subject: str, body: str) -> None:
        """Send email"""
        ...


class OrderProcessor:
    def __init__(
        self,
        time_provider: TimeProvider,
        random_provider: RandomProvider,
        inventory_service: InventoryService,
        credit_service: CreditService,
        shipping_service: ShippingService,
        email_service: EmailService,
        business_hours_start: int = 9,
        business_hours_end: int = 17
    ):
        self.time_provider = time_provider
        self.random_provider = random_provider
        self.inventory_service = inventory_service
        self.credit_service = credit_service
        self.shipping_service = shipping_service
        self.email_service = email_service
        self.business_hours_start = business_hours_start
        self.business_hours_end = business_hours_end
        self.processing_queue: List[Dict] = []
        self.is_processing = False
        self.last_processed_id = None

    def process_order(self, order_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Process an order with controlled non-deterministic behavior
        """
        try:
            # Time-dependent check with injected time provider
            current_hour = self.time_provider.now().hour
            if not (self.business_hours_start <= current_hour <= self.business_hours_end):
                return False, f"Orders can only be processed during business hours ({self.business_hours_start} AM - {self.business_hours_end} PM)"

            # Controlled processing time
            processing_time = self.random_provider.uniform(0.5, 2.0)
            self.time_provider.sleep(processing_time)

            # External system checks with injected services
            if not self.inventory_service.check_availability(order_data.get("items", [])):
                return False, "Insufficient inventory"

            if not self.credit_service.check_credit(order_data.get("customer_id")):
                return False, "Insufficient credit"

            if not self.shipping_service.check_availability(order_data.get("shipping_address")):
                return False, "Shipping not available to this address"

            # Controlled side effects
            self.inventory_service.update_quantity(order_data.get("items", []))
            self.credit_service.update_credit(
                order_data.get("customer_id"),
                order_data.get("total", 0)
            )
            self.email_service.send_email(
                order_data.get("customer_email"),
                "Order Confirmation",
                f"Your order {order_data.get('id')} has been processed successfully."
            )

            return True, None

        except Exception as e:
            return False, str(e)

    def process_orders(self, orders: List[Dict]) -> List[Tuple[bool, Optional[str]]]:
        """
        Process multiple orders with controlled concurrency
        """
        results = []
        self.is_processing = True

        try:
            for order in orders:
                if order.get("id") == self.last_processed_id:
                    continue

                success, error = self.process_order(order)
                results.append((success, error))
                self.last_processed_id = order.get("id")

        finally:
            self.is_processing = False

        return results


class CacheManager:
    def __init__(self, time_provider: TimeProvider, max_age: timedelta = timedelta(hours=1)):
        self.time_provider = time_provider
        self.max_age = max_age
        self.cache: Dict[str, Tuple[any, datetime]] = {}

    def get(self, key: str) -> Optional[any]:
        """Get value from cache with controlled time dependency"""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if self.time_provider.now() - timestamp < self.max_age:
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: any) -> None:
        """Set value in cache with controlled time dependency"""
        self.cache[key] = (value, self.time_provider.now())

    def cleanup(self) -> None:
        """Clean up expired cache entries with controlled time dependency"""
        now = self.time_provider.now()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if now - timestamp >= self.max_age
        ]
        for key in expired_keys:
            del self.cache[key]


class FileSystem(Protocol):
    """Protocol for file system operations"""
    def list_files(self, directory: str) -> List[str]:
        """List files in directory"""
        ...

    def process_file(self, filename: str) -> None:
        """Process a file"""
        ...


class FileProcessor:
    def __init__(self, file_system: FileSystem, time_provider: TimeProvider):
        self.file_system = file_system
        self.time_provider = time_provider
        self.processed_files: set[str] = set()

    def process_new_files(self) -> List[str]:
        """Process new files with controlled file system dependency"""
        try:
            # Get list of files through injected file system
            files = self.file_system.list_files(self.directory)
            
            # Filter for unprocessed files
            new_files = [f for f in files if f not in self.processed_files]
            
            # Process each file
            for file in new_files:
                self.file_system.process_file(file)
                self.processed_files.add(file)
            
            return new_files

        except Exception as e:
            print(f"Error processing files: {e}")
            return []


# Factory function to create OrderProcessor with real dependencies
def create_order_processor() -> OrderProcessor:
    """Create an OrderProcessor with real dependencies"""
    from datetime import datetime
    import random
    import time

    class RealTimeProvider:
        def now(self) -> datetime:
            return datetime.now()

        def sleep(self, seconds: float) -> None:
            time.sleep(seconds)

    class RealRandomProvider:
        def uniform(self, min_val: float, max_val: float) -> float:
            return random.uniform(min_val, max_val)

        def random(self) -> float:
            return random.random()

    # In a real application, these would be actual service implementations
    class RealInventoryService:
        def check_availability(self, items: List[Dict]) -> bool:
            return True

        def update_quantity(self, items: List[Dict]) -> None:
            pass

    class RealCreditService:
        def check_credit(self, customer_id: str) -> bool:
            return True

        def update_credit(self, customer_id: str, amount: float) -> None:
            pass

    class RealShippingService:
        def check_availability(self, address: Dict) -> bool:
            return True

    class RealEmailService:
        def send_email(self, to: str, subject: str, body: str) -> None:
            pass

    return OrderProcessor(
        time_provider=RealTimeProvider(),
        random_provider=RealRandomProvider(),
        inventory_service=RealInventoryService(),
        credit_service=RealCreditService(),
        shipping_service=RealShippingService(),
        email_service=RealEmailService()
    ) 