"""
Test the enhanced genetic algorithm with a larger dataset similar to the production case
"""

from optigenix_module.optimization.genetic import optimize_packing_with_genetic_algorithm
from optigenix_module.models.container import EnhancedContainer
from optigenix_module.models.item import Item
import time

def create_realistic_test_items():
    """Create a realistic set of items similar to the production case"""
    items = []
    
    # Large items (like HeavyMachinery)
    items.append(Item("HeavyMachinery", 1.5, 1.8, 2.0, 500, 1, "LOW", True, "FRAME", False))
    
    # Standard pallets
    for i in range(2):
        items.append(Item(f"StandardPallet_{i+1}", 1.0, 1.2, 1.2, 100, 1, "LOW", True, "PALLET", False))
    
    # Electronic cabinets
    for i in range(2):
        items.append(Item(f"ElectronicCabinet_{i+1}", 0.8, 0.6, 1.8, 80, 1, "MEDIUM", True, "BOX", False))
    
    # Storage boxes
    for i in range(4):
        items.append(Item(f"StorageBox_{i+1}", 0.8, 0.8, 1.0, 30, 1, "LOW", True, "BOX", False))
    
    # Industrial pumps
    for i in range(2):
        items.append(Item(f"IndustrialPump_{i+1}", 1.0, 0.8, 0.9, 150, 1, "MEDIUM", False, "FRAME", False))
    
    # Steel drums
    for i in range(3):
        items.append(Item(f"SteelDrums_{i+1}", 0.6, 0.6, 0.9, 200, 1, "LOW", True, "CYLINDER", False))
    
    # Cardboard boxes (smaller items)
    for i in range(6):
        items.append(Item(f"CardboardBoxes_{i+1}", 0.6, 0.4, 0.4, 15, 1, "HIGH", True, "CARTON", False))
    
    # Wood crates
    for i in range(2):
        items.append(Item(f"WoodCrates_{i+1}", 1.2, 0.8, 0.6, 80, 1, "LOW", True, "CRATE", False))
    
    # Additional medium-sized items
    for i in range(8):
        items.append(Item(f"MiscItem_{i+1}", 0.5, 0.4, 0.3, 20, 1, "MEDIUM", True, "BOX", False))
    
    return items

def test_realistic_packing():
    print("Testing enhanced genetic algorithm with realistic dataset...")
    
    # Create a 40-foot container (similar to production)
    container_dims = (12.03, 2.35, 2.39)  # 40-foot container
    container = EnhancedContainer(container_dims, route_temperature=25.0)
    
    # Create realistic items
    items = create_realistic_test_items()
    print(f"Created {len(items)} items for testing")
    
    # Test genetic algorithm
    start_time = time.time()
    result = optimize_packing_with_genetic_algorithm(
        items=items,
        container_dims=container_dims,
        route_temperature=25.0,
        population_size=50,
        generations=20,
        fitness_weights={
            "volume_utilization_weight": 0.25,
            "stability_score_weight": 0.15,
            "contact_ratio_weight": 0.15,
            "weight_balance_weight": 0.1,
            "items_packed_ratio_weight": 0.1,
            "temperature_constraint_weight": 0.1,
            "weight_capacity_weight": 0.15
        }
    )
    end_time = time.time()
    
    print(f"\n=== RESULTS ===")
    print(f"Optimization time: {end_time - start_time:.2f}s")
    print(f"Items packed: {len(result.items)}/{len(items)}")
    print(f"Success rate: {len(result.items)/len(items)*100:.1f}%")
    print(f"Volume utilization: {result.volume_utilization*100:.1f}%")
    print(f"Best fitness: {result.best_fitness:.4f}")
    
    # Show item breakdown
    packed_types = {}
    for item in result.items:
        item_type = getattr(item, 'boxing_type', 'UNKNOWN')
        packed_types[item_type] = packed_types.get(item_type, 0) + 1
    
    print(f"\nPacked items by type:")
    for item_type, count in packed_types.items():
        print(f"  {item_type}: {count}")

if __name__ == "__main__":
    test_realistic_packing()
