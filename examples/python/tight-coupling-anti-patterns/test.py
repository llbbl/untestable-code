"""
This example demonstrates how to test decoupled components:

1. Test components in isolation
2. Use mock dependencies
3. Verify component interactions
4. Test error conditions
5. Test with different implementations
"""

import unittest
from datetime import datetime
from unittest.mock import Mock, patch
from typing import Dict, List

from testable import (
    OrderRepository, NotificationService, OrderExporter,
    OrderProcessor, OrderManager, create_order_manager
)


class TestOrderProcessor(unittest.TestCase):
    def setUp(self):
        # Create mock dependencies
        self.repository = Mock(spec=OrderRepository)
        self.notification_service = Mock(spec=NotificationService)
        
        # Create processor with mock dependencies
        self.processor = OrderProcessor(
            repository=self.repository,
            notification_service=self.notification_service
        )
        
        # Sample order data
        self.order_data = {
            'customer_id': 1,
            'customer_email': 'test@example.com',
            'total_amount': 99.99,
            'status': 'pending'
        }

    def test_process_order_success(self):
        # Setup mock behavior
        self.repository.save_order.return_value = 123
        self.repository.get_order.return_value = {
            'id': 123,
            'customer_id': 1,
            'total_amount': 99.99,
            'status': 'pending',
            'created_at': datetime.now()
        }

        # Process order
        result = self.processor.process_order(self.order_data)

        # Verify repository calls
        self.repository.save_order.assert_called_once_with(self.order_data)
        self.repository.get_order.assert_called_once_with(123)

        # Verify notification
        self.notification_service.send_order_confirmation.assert_called_once_with(
            'test@example.com',
            123
        )

        # Verify result
        self.assertEqual(result['id'], 123)
        self.assertEqual(result['customer_id'], 1)
        self.assertEqual(result['total_amount'], 99.99)

    def test_process_order_repository_error(self):
        # Setup mock to raise exception
        self.repository.save_order.side_effect = Exception("Database error")

        # Process order and verify error
        with self.assertRaises(Exception) as context:
            self.processor.process_order(self.order_data)

        self.assertEqual(str(context.exception), "Database error")
        self.notification_service.send_order_confirmation.assert_not_called()


class TestOrderManager(unittest.TestCase):
    def setUp(self):
        # Create mock dependencies
        self.processor = Mock(spec=OrderProcessor)
        self.exporter = Mock(spec=OrderExporter)
        
        # Create manager with mock dependencies
        self.manager = OrderManager(
            processor=self.processor,
            exporter=self.exporter
        )
        
        # Sample order data
        self.order_data = {
            'customer_id': 1,
            'customer_email': 'test@example.com',
            'total_amount': 99.99,
            'status': 'pending'
        }

    def test_handle_new_order_success(self):
        # Setup mock behavior
        processed_order = {
            'id': 123,
            'customer_id': 1,
            'total_amount': 99.99,
            'status': 'pending',
            'created_at': datetime.now()
        }
        self.processor.process_order.return_value = processed_order

        # Handle order
        result = self.manager.handle_new_order(self.order_data)

        # Verify processor call
        self.processor.process_order.assert_called_once_with(self.order_data)

        # Verify exporter call
        self.exporter.export_orders.assert_called_once_with([processed_order])

        # Verify result
        self.assertEqual(result, processed_order)

    def test_handle_new_order_processor_error(self):
        # Setup mock to raise exception
        self.processor.process_order.side_effect = Exception("Processing error")

        # Handle order and verify error
        with self.assertRaises(Exception) as context:
            self.manager.handle_new_order(self.order_data)

        self.assertEqual(str(context.exception), "Processing error")
        self.exporter.export_orders.assert_not_called()


class TestOrderManagerIntegration(unittest.TestCase):
    @patch('testable.create_order_repository')
    @patch('testable.create_notification_service')
    @patch('testable.create_order_exporter')
    def test_create_order_manager(
        self,
        mock_create_exporter,
        mock_create_notification,
        mock_create_repository
    ):
        # Setup mock factory functions
        mock_repository = Mock(spec=OrderRepository)
        mock_notification = Mock(spec=NotificationService)
        mock_exporter = Mock(spec=OrderExporter)
        
        mock_create_repository.return_value = mock_repository
        mock_create_notification.return_value = mock_notification
        mock_create_exporter.return_value = mock_exporter

        # Create manager
        manager = create_order_manager(
            db_path='test.db',
            export_dir='test_exports',
            smtp_server='test.smtp.com',
            smtp_port=587,
            sender_email='test@example.com',
            sender_password='test123'
        )

        # Verify factory function calls
        mock_create_repository.assert_called_once_with('test.db')
        mock_create_notification.assert_called_once_with(
            'test.smtp.com',
            587,
            'test@example.com',
            'test123'
        )
        mock_create_exporter.assert_called_once_with('test_exports')

        # Verify manager dependencies
        self.assertIsInstance(manager.processor, OrderProcessor)
        self.assertEqual(manager.processor.repository, mock_repository)
        self.assertEqual(manager.processor.notification_service, mock_notification)
        self.assertEqual(manager.exporter, mock_exporter)


if __name__ == '__main__':
    unittest.main() 