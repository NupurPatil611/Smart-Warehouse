from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
from schemas import InventoryUpdate, StockMovementCreate, InventoryResponse
from utils.auth import get_current_user, require_role
import models

router = APIRouter()

@router.get("/", response_model=List[InventoryResponse])
def get_inventory(
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Inventory).options(
        joinedload(models.Inventory.product).joinedload(models.Product.category)
    )
    if low_stock:
        query = query.filter(models.Inventory.quantity <= models.Inventory.min_stock_level)
    return query.all()

@router.get("/{inventory_id_str}", response_model=InventoryResponse)
def get_inventory_item(
    inventory_id_str: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    inv = db.query(models.Inventory).options(
        joinedload(models.Inventory.product).joinedload(models.Product.category)
    ).filter(models.Inventory.inventory_id == inventory_id_str).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return inv

@router.put("/{inv_id}", response_model=InventoryResponse)
def update_inventory(
    inv_id: int,
    inv_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin", "staff"))
):
    inv = db.query(models.Inventory).filter(models.Inventory.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")

    old_quantity = inv.quantity
    inv.quantity = inv_data.quantity
    if inv_data.min_stock_level is not None:
        inv.min_stock_level = inv_data.min_stock_level
    if inv_data.max_stock_level is not None:
        inv.max_stock_level = inv_data.max_stock_level
    if inv_data.location is not None:
        inv.location = inv_data.location

    # Record movement
    diff = inv_data.quantity - old_quantity
    if diff != 0:
        movement = models.StockMovement(
            inventory_id=inv.id,
            movement_type="in" if diff > 0 else "out",
            quantity=abs(diff),
            reason="Manual update",
            performed_by=current_user.id
        )
        db.add(movement)

    db.commit()
    db.refresh(inv)
    return inv

@router.post("/movement")
def record_movement(
    movement_data: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin", "staff"))
):
    inv = db.query(models.Inventory).filter(models.Inventory.id == movement_data.inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")

    if movement_data.movement_type == "out" and inv.quantity < movement_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    if movement_data.movement_type == "in":
        inv.quantity += movement_data.quantity
    else:
        inv.quantity -= movement_data.quantity

    movement = models.StockMovement(
        inventory_id=inv.id,
        movement_type=movement_data.movement_type,
        quantity=movement_data.quantity,
        reason=movement_data.reason,
        performed_by=current_user.id
    )
    db.add(movement)
    db.commit()
    return {"message": "Stock movement recorded", "new_quantity": inv.quantity}

@router.get("/{inv_id}/movements")
def get_movements(
    inv_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    movements = db.query(models.StockMovement).filter(
        models.StockMovement.inventory_id == inv_id
    ).order_by(models.StockMovement.created_at.desc()).limit(50).all()
    return movements