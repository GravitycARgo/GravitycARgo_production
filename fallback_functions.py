
def _simple_grid_packing_fallback(unpacked_items, container):
    """
    Simple grid-based packing fallback when enhanced space management fails.
    Uses a straightforward layer-by-layer approach with basic rotation.
    """
    logger.info(f"Starting simple grid packing fallback for {len(unpacked_items)} items")
    packed_items = []
    
    # Sort items by volume (largest first)
    sorted_items = sorted(unpacked_items, key=lambda x: x.length * x.width * x.height, reverse=True)
    
    # Simple grid positions starting from origin
    current_x = 0
    current_y = 0
    current_z = 0
    layer_height = 0
    
    for item in sorted_items:
        best_position = None
        best_rotation = None
        
        # Try all basic rotations for this item
        rotations = [
            (item.length, item.width, item.height),  # Original
            (item.width, item.length, item.height),  # Rotate 90°
            (item.length, item.height, item.width),  # Rotate on side
            (item.width, item.height, item.length),  # Rotate on side + 90°
            (item.height, item.width, item.length),  # Stand up
            (item.height, item.length, item.width),  # Stand up + 90°
        ]
        
        for rotation in rotations:
            l, w, h = rotation
            
            # Try current position in layer
            if (current_x + l <= container.length and 
                current_y + w <= container.width and 
                current_z + h <= container.height):
                
                position = (current_x, current_y, current_z)
                
                # Check for overlaps with existing items
                if not _simple_overlap_check(position, rotation, packed_items):
                    best_position = position
                    best_rotation = rotation
                    break
            
            # Try next position in X direction
            next_x = current_x + layer_height + 1
            if (next_x + l <= container.length and 
                current_y + w <= container.width and 
                current_z + h <= container.height):
                
                position = (next_x, current_y, current_z)
                
                if not _simple_overlap_check(position, rotation, packed_items):
                    best_position = position
                    best_rotation = rotation
                    current_x = next_x
                    break
        
        # If no position found in current layer, try next layer
        if best_position is None:
            for rotation in rotations:
                l, w, h = rotation
                
                # Move to next layer
                next_z = current_z + layer_height
                if next_z + h <= container.height:
                    position = (0, 0, next_z)
                    
                    if (l <= container.length and w <= container.width and
                        not _simple_overlap_check(position, rotation, packed_items)):
                        best_position = position
                        best_rotation = rotation
                        current_x = 0
                        current_y = 0
                        current_z = next_z
                        layer_height = h
                        break
        
        # If position found, add the item
        if best_position is not None:
            rotated_item = _create_simple_rotated_item(item, best_rotation)
            rotated_item.position = best_position
            packed_items.append(rotated_item)
            
            # Update grid position for next item
            current_x += best_rotation[0]
            layer_height = max(layer_height, best_rotation[2])
            
            logger.debug(f"Simple packing: Placed item {item.item_id} at {best_position} with dimensions {best_rotation}")
        else:
            logger.warning(f"Simple packing: Could not place item {item.item_id} with dimensions ({item.length}, {item.width}, {item.height})")
    
    logger.info(f"Simple grid packing placed {len(packed_items)}/{len(unpacked_items)} items")
    return packed_items


def _create_simple_rotated_item(item, dimensions):
    """Create a copy of item with new dimensions from rotation."""
    rotated_item = Item(
        item_id=item.item_id,
        length=dimensions[0],
        width=dimensions[1], 
        height=dimensions[2],
        weight=item.weight
    )
    # Copy any additional attributes
    for attr in ['temperature_range', 'fragile', 'stackable', 'category']:
        if hasattr(item, attr):
            setattr(rotated_item, attr, getattr(item, attr))
    return rotated_item


def _simple_overlap_check(position, dimensions, packed_items):
    """Check if a position and dimensions would overlap with any packed items."""
    x1, y1, z1 = position
    x2, y2, z2 = x1 + dimensions[0], y1 + dimensions[1], z1 + dimensions[2]
    
    for packed_item in packed_items:
        if hasattr(packed_item, 'position'):
            px1, py1, pz1 = packed_item.position
            px2 = px1 + packed_item.length
            py2 = py1 + packed_item.width  
            pz2 = pz1 + packed_item.height
            
            # Check for overlap in all three dimensions
            if (x1 < px2 and x2 > px1 and 
                y1 < py2 and y2 > py1 and 
                z1 < pz2 and z2 > pz1):
                return True
    
    return False
