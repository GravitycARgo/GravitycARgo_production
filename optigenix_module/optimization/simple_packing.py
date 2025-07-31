"""
Simple grid-based packing fallback for genetic algorithm
"""
import logging

logger = logging.getLogger("simple_packing")

def simple_grid_packing(container, items, rotation_flags=None):
    """
    Simple grid-based packing that doesn't rely on complex space management
    
    Args:
        container: EnhancedContainer object
        items: List of items to pack
        rotation_flags: Optional rotation flags for items
        
    Returns:
        tuple: (successful_packs, failed_packs)
    """
    successful_packs = 0
    failed_packs = 0
    
    # Sort items by volume (largest first)
    sorted_items = sorted(items, key=lambda x: x.dimensions[0] * x.dimensions[1] * x.dimensions[2], reverse=True)
    
    # Current position tracking
    current_x = 0
    current_y = 0
    current_z = 0
    layer_height = 0
    
    for i, item in enumerate(sorted_items):
        item_copy = _create_simple_item_copy(item, rotation_flags[i] if rotation_flags else 0)
        w, d, h = item_copy.dimensions
        
        # Try to place at current position
        if current_x + w <= container.dimensions[0] and current_y + d <= container.dimensions[1] and current_z + h <= container.dimensions[2]:
            # Position fits in container
            pos = (current_x, current_y, current_z)
            
            # Simple overlap check
            if not _has_overlap(container.items, pos, item_copy.dimensions):
                item_copy.position = pos
                container.items.append(item_copy)
                successful_packs += 1
                
                # Update position for next item
                current_x += w
                layer_height = max(layer_height, h)
                
                # If we've reached the edge, start a new row
                if current_x >= container.dimensions[0] - 0.1:  # Small buffer
                    current_x = 0
                    current_y += d
                    
                    # If we've filled this layer, start a new layer
                    if current_y >= container.dimensions[1] - 0.1:  # Small buffer
                        current_x = 0
                        current_y = 0
                        current_z += layer_height
                        layer_height = 0
                
                logger.info(f"Simple packing: Placed {item_copy.name} at {pos}")
                continue
        
        # Try different rotations if the item doesn't fit
        placed = False
        for rotation in range(6):  # Try different orientations
            rotated_item = _create_simple_item_copy(item, rotation)
            w, d, h = rotated_item.dimensions
            
            # Try current position
            if current_x + w <= container.dimensions[0] and current_y + d <= container.dimensions[1] and current_z + h <= container.dimensions[2]:
                pos = (current_x, current_y, current_z)
                
                if not _has_overlap(container.items, pos, rotated_item.dimensions):
                    rotated_item.position = pos
                    container.items.append(rotated_item)
                    successful_packs += 1
                    placed = True
                    
                    # Update position
                    current_x += w
                    layer_height = max(layer_height, h)
                    
                    if current_x >= container.dimensions[0] - 0.1:
                        current_x = 0
                        current_y += d
                        
                        if current_y >= container.dimensions[1] - 0.1:
                            current_x = 0
                            current_y = 0
                            current_z += layer_height
                            layer_height = 0
                    
                    logger.info(f"Simple packing: Placed {rotated_item.name} at {pos} (rotation {rotation})")
                    break
        
        if not placed:
            failed_packs += 1
            logger.info(f"Simple packing: Failed to place {item.name}")
    
    return successful_packs, failed_packs

def _create_simple_item_copy(item, rotation_flag):
    """Create a simple item copy with rotation"""
    from optigenix_module.models.item import Item
    
    # Get original dimensions
    orig_dims = item.original_dims if hasattr(item, 'original_dims') else item.dimensions
    
    # Apply rotation
    if rotation_flag == 0:  # No rotation
        dims = orig_dims
    elif rotation_flag == 1:  # Rotate 90° around Z (swap length and width)
        dims = (orig_dims[1], orig_dims[0], orig_dims[2])
    elif rotation_flag == 2:  # Rotate to put height as length
        dims = (orig_dims[2], orig_dims[1], orig_dims[0])
    elif rotation_flag == 3:  # Rotate to put height as width  
        dims = (orig_dims[0], orig_dims[2], orig_dims[1])
    elif rotation_flag == 4:  # Another rotation
        dims = (orig_dims[1], orig_dims[2], orig_dims[0])
    else:  # rotation_flag == 5
        dims = (orig_dims[2], orig_dims[0], orig_dims[1])
    
    item_copy = Item(
        name=item.name,
        length=dims[0],
        width=dims[1], 
        height=dims[2],
        weight=item.weight,
        quantity=1,
        fragility=item.fragility,
        stackable=item.stackable,
        boxing_type=getattr(item, 'boxing_type', 'STANDARD'),
        bundle=item.bundle,
        temperature_sensitivity=getattr(item, 'temperature_sensitivity', None),
        load_bearing=getattr(item, 'load_bearing', 0)
    )
    
    if hasattr(item, 'needs_insulation'):
        item_copy.needs_insulation = item.needs_insulation
    
    return item_copy

def _has_overlap(existing_items, pos, dims):
    """Check if item at position would overlap with existing items"""
    x, y, z = pos
    w, d, h = dims
    
    for item in existing_items:
        if not item.position:
            continue
            
        ix, iy, iz = item.position
        iw, id, ih = item.dimensions
        
        # Check 3D overlap
        if (x < ix + iw and x + w > ix and
            y < iy + id and y + d > iy and
            z < iz + ih and z + h > iz):
            return True
    
    return False
