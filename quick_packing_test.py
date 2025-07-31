#!/usr/bin/env python3
"""
Quick test to verify basic packing functionality
"""

from optigenix_module.models.container import EnhancedContainer
from optigenix_module.models.item import Item

def test_basic_packing():
    """Test basic item placement without genetic algorithm"""
    
    # Create container (40-foot container)
    container = EnhancedContainer([12.03, 2.35, 2.39])
    
    # Create simple test items
    items = [
        Item("Box1", 1.0, 1.0, 1.0, 50, 1, "LOW", True, "BOX", "NO"),
        Item("Box2", 1.0, 1.0, 1.0, 50, 1, "LOW", True, "BOX", "NO"),
        Item("Box3", 1.0, 1.0, 1.0, 50, 1, "LOW", True, "BOX", "NO"),
    ]
    
    print(f"Container dimensions: {container.dimensions}")
    print(f"Container volume: {container.volume:.2f} m³")
    print(f"Initial spaces: {len(container.spaces)}")
    
    # Try to pack items manually
    for i, item in enumerate(items):
        print(f"\nTrying to pack item {i+1}: {item.name}")
        print(f"  Item dimensions: {item.dimensions}")
        print(f"  Available spaces: {len(container.spaces)}")
        
        # Find a space that can fit the item
        placed = False
        for space in container.spaces:
            if space.can_fit_item(item.dimensions):
                pos = (space.x, space.y, space.z)
                print(f"  Found fitting space at {pos}")
                
                # Check if placement is valid
                if container._is_valid_placement(item, pos, item.dimensions):
                    print(f"  Placement is valid")
                    item.position = pos
                    container.items.append(item)
                    container._update_spaces(pos, item.dimensions, space)
                    placed = True
                    print(f"  ✅ Successfully placed {item.name} at {pos}")
                    break
                else:
                    print(f"  ❌ Invalid placement")
            else:
                print(f"  Space too small: {space.width}x{space.depth}x{space.height}")
        
        if not placed:
            print(f"  ❌ Failed to place {item.name}")
        
        print(f"  Spaces after: {len(container.spaces)}")
    
    print(f"\nFinal result: {len(container.items)}/{len(items)} items packed")
    return container

if __name__ == "__main__":
    test_basic_packing()
