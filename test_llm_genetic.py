#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for LLM-enhanced genetic algorithm
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from optigenix_module.models.item import Item
from optigenix_module.optimization.genetic import optimize_packing_with_genetic_algorithm

def test_llm_genetic_algorithm():
    """Test the LLM-enhanced genetic algorithm with simple items"""
    
    # Create test items
    items = [
        Item(
            name="Box1",
            length=1.0,
            width=1.0, 
            height=1.0,
            weight=10.0,
            quantity=1,
            fragility="LOW",
            stackable=True,
            boxing_type="STANDARD",
            bundle="NO"
        ),
        Item(
            name="Box2", 
            length=2.0,
            width=1.0,
            height=1.0,
            weight=15.0,
            quantity=1,
            fragility="MEDIUM",
            stackable=True,
            boxing_type="STANDARD", 
            bundle="NO"
        ),
        Item(
            name="Box3",
            length=1.5,
            width=1.5,
            height=0.5,
            weight=8.0,
            quantity=1,
            fragility="LOW",
            stackable=True,
            boxing_type="STANDARD",
            bundle="NO"
        )
    ]
    
    # Container dimensions (5m x 3m x 3m)
    container_dims = (5.0, 3.0, 3.0)
    
    print("Testing LLM-enhanced genetic algorithm...")
    print(f"Items: {len(items)}")
    print(f"Container: {container_dims}")
    
    try:
        # Run optimization
        result = optimize_packing_with_genetic_algorithm(
            items=items,
            container_dims=container_dims,
            population_size=10,
            generations=5,
            fitness_weights=None,
            route_temperature=25.0
        )
        
        print("SUCCESS! Optimization completed.")
        print(f"   Items packed: {len(result.items)}")
        print(f"   Volume utilization: {result.volume_utilization:.2%}")
        
        if hasattr(result, 'best_fitness'):
            print(f"   Best fitness: {result.best_fitness:.4f}")
            
        return True
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_llm_genetic_algorithm()
    sys.exit(0 if success else 1)
