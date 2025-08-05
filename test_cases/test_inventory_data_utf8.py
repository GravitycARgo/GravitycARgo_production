#!/usr/bin/env python3
"""
Test case for inventory_data_utf8.csv dataset
Target: Achieve at least 80% volume utilization in 20ft container
"""

import os
import sys
import pandas as pd
import unittest
from unittest.mock import patch

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from optigenix_module.optimization.genetic import optimize_packing_with_genetic_algorithm
from optigenix_module.models.item import Item
from optigenix_module.models.container import EnhancedContainer

class TestInventoryDataUtilization(unittest.TestCase):
    """Test cases for inventory data volume utilization"""
    
    def setUp(self):
        """Set up test data and container"""
        self.csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                    'input', 'inventory_data_utf8.csv')
        
        # 20ft container dimensions (standard)
        self.container_dims = [6.06, 2.44, 2.59]  # Length, Width, Height in meters
        self.target_utilization = 80.0  # Target 80% volume utilization
        
        # Load test data
        self.df = pd.read_csv(self.csv_path)
        self.items = self._create_items_from_df()
        
    def _create_items_from_df(self):
        """Convert DataFrame to Item objects"""
        items = []
        for _, row in self.df.iterrows():
            # Handle quantity expansion
            quantity = int(row.get('Quantity', 1))
            for i in range(quantity):
                item_name = f"{row['Name']}_{i+1}" if quantity > 1 else row['Name']
                
                item = Item(
                    name=item_name,
                    length=row['Length'],
                    width=row['Width'],
                    height=row['Height'],
                    weight=row['Weight'],
                    quantity=1,  # Individual items
                    fragility=row.get('Fragility', 'MEDIUM'),
                    stackable=(row.get('Stackable', 'YES') == 'YES'),
                    boxing_type=row.get('BoxingType', 'BOX'),
                    bundle='NO',  # Individual items are not bundled
                    load_bearing=row.get('Load_Bearing', 0),
                    temperature_sensitivity=row.get('Temperature Sensitivity', 'n/a')
                )
                items.append(item)
        
        return items
    
    def test_volume_utilization_target(self):
        """Test that volume utilization reaches at least 80%"""
        print(f"\n🧪 Testing volume utilization for {len(self.items)} items")
        print(f"📦 Container: {self.container_dims[0]}x{self.container_dims[1]}x{self.container_dims[2]}m")
        
        # Calculate total item volume
        total_item_volume = sum(item.dimensions[0] * item.dimensions[1] * item.dimensions[2] 
                               for item in self.items)
        container_volume = self.container_dims[0] * self.container_dims[1] * self.container_dims[2]
        
        print(f"📊 Total item volume: {total_item_volume:.2f} m³")
        print(f"📊 Container volume: {container_volume:.2f} m³")
        print(f"📊 Theoretical max utilization: {(total_item_volume/container_volume)*100:.1f}%")
        
        # Run optimization with aggressive parameters for high utilization
        result = optimize_packing_with_genetic_algorithm(
            items=self.items,
            container_dims=self.container_dims,
            population_size=50,  # Increased for better exploration
            generations=100,     # Increased for convergence
            fitness_weights={
                'volume_utilization': 0.85,  # High weight on volume
                'contact_ratio': 0.05,
                'stability_score': 0.05,
                'weight_balance': 0.025,
                'items_packed_ratio': 0.025
            }
        )
        
        # Extract utilization from result
        if isinstance(result, dict) and 'container' in result:
            container = result['container']
            utilization = getattr(container, 'utilization_percentage', 0)
        else:
            # Fallback extraction
            utilization = 0
            if hasattr(result, 'utilization_percentage'):
                utilization = result.utilization_percentage
        
        print(f"🎯 Achieved utilization: {utilization:.2f}%")
        print(f"🎯 Target utilization: {self.target_utilization}%")
        
        # Assert target is met
        self.assertGreaterEqual(
            utilization, 
            self.target_utilization,
            f"Volume utilization {utilization:.2f}% is below target {self.target_utilization}%"
        )
        
        return utilization
    
    def test_multiple_runs_consistency(self):
        """Test that multiple runs consistently achieve good utilization"""
        print(f"\n🔄 Testing consistency across multiple runs")
        
        utilizations = []
        for run in range(3):  # Run 3 times
            print(f"   Run {run+1}/3...")
            
            result = optimize_packing_with_genetic_algorithm(
                items=self.items,
                container_dims=self.container_dims,
                population_size=30,
                generations=50
            )
            
            if isinstance(result, dict) and 'container' in result:
                container = result['container']
                utilization = getattr(container, 'utilization_percentage', 0)
            else:
                utilization = getattr(result, 'utilization_percentage', 0)
            
            utilizations.append(utilization)
            print(f"      Utilization: {utilization:.2f}%")
        
        avg_utilization = sum(utilizations) / len(utilizations)
        min_utilization = min(utilizations)
        
        print(f"📊 Average utilization: {avg_utilization:.2f}%")
        print(f"📊 Minimum utilization: {min_utilization:.2f}%")
        
        # Assert minimum across runs is acceptable
        self.assertGreaterEqual(
            min_utilization, 
            70.0,  # Slightly lower threshold for consistency
            f"Minimum utilization {min_utilization:.2f}% is too low across runs"
        )
        
        return utilizations

if __name__ == '__main__':
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestInventoryDataUtilization)
    
    # Run with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with error code if tests failed
    sys.exit(0 if result.wasSuccessful() else 1)
