"""
Test script to demonstrate LLM integration and logging in the genetic algorithm
"""

import sys
import os
import json

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from optigenix_module.models.item import Item
from optigenix_module.optimization.packer import GeneticPacker

def create_test_items():
    """Create a small set of test items for optimization"""
    items = [
        Item(name="Box A", length=2.0, width=2.0, height=1.0, weight=10.0, quantity=1),
        Item(name="Box B", length=1.5, width=1.5, height=1.5, weight=8.0, quantity=1),
        Item(name="Box C", length=3.0, width=1.0, height=1.0, weight=5.0, quantity=1),
        Item(name="Box D", length=1.0, width=1.0, height=2.0, weight=6.0, quantity=1),
        Item(name="Box E", length=2.5, width=1.5, height=0.5, weight=4.0, quantity=1),
    ]
    return items

def test_genetic_algorithm_with_llm_logging():
    """Test the genetic algorithm with LLM integration and logging"""
    print("🧬 Starting Genetic Algorithm Test with LLM Integration")
    print("=" * 60)
    
    # Define container dimensions
    container_dims = [6.0, 4.0, 3.0]  # Length x Width x Height
    print(f"📦 Container dimensions: {container_dims}")
    
    # Create test items
    items = create_test_items()
    print(f"📋 Test items created: {len(items)} items")
    for item in items:
        print(f"  - {item.name}: {item.dimensions} (weight: {item.weight})")
    
    # Initialize genetic packer with small population for quick testing
    packer = GeneticPacker(
        container_dims=container_dims,
        population_size=5,  # Small population for quick test
        generations=3       # Few generations for quick test
    )
    
    print("\n🤖 Starting optimization with LLM integration...")
    print("Check llm_interactions.log for detailed LLM interactions!")
    
    try:
        # Run optimization (this will trigger LLM calls and logging)
        best_genome = packer.optimize(items)
        
        if best_genome:
            print(f"\n✅ Optimization completed!")
            print(f"🏆 Best fitness achieved: {best_genome.fitness:.4f}")
            
            if hasattr(best_genome, 'metrics'):
                metrics = best_genome.metrics
                print(f"📊 Final metrics:")
                print(f"  - Volume utilization: {metrics.get('volume_utilization', 0.0):.2%}")
                print(f"  - Items packed ratio: {metrics.get('items_packed_ratio', 0.0):.2%}")
                print(f"  - Stability score: {metrics.get('stability_score', 0.0):.3f}")
                print(f"  - Contact ratio: {metrics.get('contact_ratio', 0.0):.3f}")
        else:
            print("❌ Optimization failed!")
            
    except Exception as e:
        print(f"❌ Error during optimization: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n📝 Check the following files for detailed logs:")
    print("  - llm_interactions.log (LLM-specific interactions)")
    print("  - Container packing logs in terminal output")
    print("\n🎯 Test completed!")

if __name__ == "__main__":
    test_genetic_algorithm_with_llm_logging()
