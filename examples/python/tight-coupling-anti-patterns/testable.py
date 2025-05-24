"""
This example demonstrates how to make tightly coupled code testable:

1. Define clear interfaces for dependencies
2. Use dependency injection
3. Create abstraction layers
4. Make components independent
5. Enable easy testing and modification
"""

import json
import os
import sqlite3
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Protocol


# Interfaces
class OrderRepository(Protocol):
    """Interface for order storage"""
    def save_order(self, order_data: Dict) -> int:
        """Save order and return order ID"""
        pass

    def get_order(self, order_id: int) -> Optional[Dict]:
        """Get order by ID"""
        pass


class NotificationService(Protocol):
    """Interface for sending notifications"""
    def send_order_confirmation(self, customer_email: str, order_id: int):
        """Send order confirmation to customer"""
        pass


class OrderExporter(Protocol):
    """Interface for exporting orders"""
    def export_orders(self, orders: List[Dict]):
        """Export orders to external format"""
        pass


# Concrete implementations
class SQLiteOrderRepository:
    """SQLite implementation of OrderRepository"""
    def __init__(self, db_path: str = 'orders.db'):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                total_amount REAL,
                status TEXT,
                created_at TIMESTAMP
            )
        ''')
        self.conn.commit()

    def save_order(self, order_data: Dict) -> int:
        self.cursor.execute('''
            INSERT INTO orders (customer_id, total_amount, status, created_at)
            VALUES (?, ?, ?, ?)
        ''', (
            order_data['customer_id'],
            order_data['total_amount'],
            order_data['status'],
            datetime.now()
        ))
        self.conn.commit()
        return self.cursor.lastrowid

    def get_order(self, order_id: int) -> Optional[Dict]:
        self.cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
        row = self.cursor.fetchone()
        if row:
            return {
                'id': row[0],
                'customer_id': row[1],
                'total_amount': row[2],
                'status': row[3],
                'created_at': row[4]
            }
        return None


class EmailNotificationService:
    """Email implementation of NotificationService"""
    def __init__(self, smtp_server: str, smtp_port: int, sender_email: str, sender_password: str):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password

    def send_order_confirmation(self, customer_email: str, order_id: int):
        # In a real implementation, this would use smtplib
        print(f"Sending order confirmation to {customer_email} for order {order_id}")


class JSONOrderExporter:
    """JSON implementation of OrderExporter"""
    def __init__(self, export_dir: str = "exports"):
        self.export_dir = export_dir
        if not os.path.exists(export_dir):
            os.makedirs(export_dir)

    def export_orders(self, orders: List[Dict]):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.export_dir, f"orders_{timestamp}.json")
        
        with open(filename, 'w') as f:
            json.dump(orders, f, indent=2, default=str)


# Business logic
class OrderProcessor:
    """Order processor using dependency injection"""
    def __init__(self, repository: OrderRepository, notification_service: NotificationService):
        self.repository = repository
        self.notification_service = notification_service

    def process_order(self, order_data: Dict) -> Dict:
        # Process order and save to repository
        order_id = self.repository.save_order(order_data)

        # Send confirmation notification
        self.notification_service.send_order_confirmation(
            order_data['customer_email'],
            order_id
        )

        # Return processed order
        return self.repository.get_order(order_id)


class OrderManager:
    """Order manager using dependency injection"""
    def __init__(
        self,
        processor: OrderProcessor,
        exporter: OrderExporter
    ):
        self.processor = processor
        self.exporter = exporter

    def handle_new_order(self, order_data: Dict) -> Dict:
        # Process the order
        processed_order = self.processor.process_order(order_data)
        
        # Export the order
        self.exporter.export_orders([processed_order])
        
        return processed_order


# Factory functions
def create_order_repository(db_path: str = 'orders.db') -> OrderRepository:
    """Create a concrete OrderRepository instance"""
    return SQLiteOrderRepository(db_path)


def create_notification_service(
    smtp_server: str,
    smtp_port: int,
    sender_email: str,
    sender_password: str
) -> NotificationService:
    """Create a concrete NotificationService instance"""
    return EmailNotificationService(
        smtp_server=smtp_server,
        smtp_port=smtp_port,
        sender_email=sender_email,
        sender_password=sender_password
    )


def create_order_exporter(export_dir: str = "exports") -> OrderExporter:
    """Create a concrete OrderExporter instance"""
    return JSONOrderExporter(export_dir)


def create_order_manager(
    db_path: str = 'orders.db',
    export_dir: str = "exports",
    smtp_server: str = "smtp.gmail.com",
    smtp_port: int = 587,
    sender_email: str = "orders@example.com",
    sender_password: str = "password123"
) -> OrderManager:
    """Create an OrderManager with all dependencies"""
    repository = create_order_repository(db_path)
    notification_service = create_notification_service(
        smtp_server, smtp_port, sender_email, sender_password
    )
    processor = OrderProcessor(repository, notification_service)
    exporter = create_order_exporter(export_dir)
    return OrderManager(processor, exporter)


def main():
    # Example usage with dependency injection
    order_manager = create_order_manager()
    
    order_data = {
        'customer_id': 1,
        'customer_email': 'customer@example.com',
        'total_amount': 99.99,
        'status': 'pending'
    }
    
    result = order_manager.handle_new_order(order_data)
    print(f"Processed order: {result}")


if __name__ == '__main__':
    main() 