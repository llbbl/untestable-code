"""
This example demonstrates the Tight Coupling anti-pattern:

1. Direct instantiation of dependencies
2. Hard-coded dependencies
3. No abstraction layers
4. Components tightly bound to specific implementations
5. Difficult to test or modify individual components
"""

import json
import os
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional


class Database:
    """Database implementation tightly coupled to SQLite"""
    def __init__(self):
        self.conn = sqlite3.connect('orders.db')
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


class EmailSender:
    """Email sender tightly coupled to SMTP"""
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "orders@example.com"
        self.sender_password = "password123"  # Hard-coded credentials

    def send_order_confirmation(self, customer_email: str, order_id: int):
        # In a real implementation, this would use smtplib
        print(f"Sending order confirmation to {customer_email} for order {order_id}")


class OrderProcessor:
    """Order processor tightly coupled to specific implementations"""
    def __init__(self):
        # Direct instantiation of dependencies
        self.db = Database()
        self.email_sender = EmailSender()

    def process_order(self, order_data: Dict) -> Dict:
        # Process order and save to database
        order_id = self.db.save_order(order_data)

        # Send confirmation email
        self.email_sender.send_order_confirmation(
            order_data['customer_email'],
            order_id
        )

        # Return processed order
        return self.db.get_order(order_id)


class OrderExporter:
    """Order exporter tightly coupled to file system and JSON format"""
    def __init__(self, export_dir: str = "exports"):
        self.export_dir = export_dir
        if not os.path.exists(export_dir):
            os.makedirs(export_dir)

    def export_orders(self, orders: List[Dict]):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.export_dir, f"orders_{timestamp}.json")
        
        with open(filename, 'w') as f:
            json.dump(orders, f, indent=2, default=str)


class OrderManager:
    """Order manager tightly coupled to all components"""
    def __init__(self):
        # Direct instantiation of all dependencies
        self.processor = OrderProcessor()
        self.exporter = OrderExporter()

    def handle_new_order(self, order_data: Dict) -> Dict:
        # Process the order
        processed_order = self.processor.process_order(order_data)
        
        # Export the order
        self.exporter.export_orders([processed_order])
        
        return processed_order


def main():
    # Example usage
    order_manager = OrderManager()
    
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