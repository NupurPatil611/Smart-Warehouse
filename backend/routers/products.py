from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
from schemas import ProductCreate, ProductUpdate, ProductResponse, BulkStockRequest
from utils.auth import get_current_user, require_role
import models

router = APIRouter()

def generate_product_code(db: Session, category_code: str, product_name: str) -> str:
    """Generate unique product code like ELEC-KEY-001"""
    # Take first 3 chars of product name
    name_part = ''.join(filter(str.isalpha, product_name.upper()))[:3]
    if len(name_part) < 3:
        name_part = name_part.ljust(3, 'X')

    prefix = f"{category_code}-{name_part}"

    # Find highest existing number with this prefix
    existing = db.query(models.Product).filter(
        models.Product.product_code.like(f"{prefix}-%")
    ).count()

    return f"{prefix}-{str(existing + 1).zfill(3)}"

def generate_inventory_id(db: Session, category_code: str) -> str:
    """Generate unique inventory ID like INV-ELEC-0001"""
    prefix = f"INV-{category_code}"
    count = db.query(models.Inventory).join(models.Product).join(models.Category).filter(
        models.Category.code == category_code
    ).count()
    return f"{prefix}-{str(count + 1).zfill(4)}"

@router.get("/", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%") |
            models.Product.product_code.ilike(f"%{search}%")
        )
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(models.Product).options(joinedload(models.Product.category)).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin"))
):
    category = db.query(models.Category).filter(models.Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product_code = generate_product_code(db, category.code, product_data.name)

    product = models.Product(
        name=product_data.name,
        product_code=product_code,
        description=product_data.description,
        category_id=product_data.category_id,
        unit_price=product_data.unit_price
    )
    db.add(product)
    db.flush()

    # Auto-create inventory record
    inventory_id = generate_inventory_id(db, category.code)
    inventory = models.Inventory(
        product_id=product.id,
        inventory_id=inventory_id,
        quantity=0,
        min_stock_level=10,
        max_stock_level=1000
    )
    db.add(inventory)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin"))
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product_data.name is not None:
        product.name = product_data.name
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.category_id is not None:
        product.category_id = product_data.category_id
    if product_data.unit_price is not None:
        product.unit_price = product_data.unit_price
    if product_data.is_active is not None:
        product.is_active = product_data.is_active

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin"))
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Delete inventory first
    db.query(models.Inventory).filter(models.Inventory.product_id == product_id).delete()
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}

@router.post("/bulk-stock")
def bulk_stock_arrival(
    bulk_data: BulkStockRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin"))
):
    """Process bulk stock arrival - auto-generates codes and inventory IDs"""
    category = db.query(models.Category).filter(models.Category.id == bulk_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    created_products = []
    for item in bulk_data.items:
        product_code = generate_product_code(db, category.code, item["name"])
        product = models.Product(
            name=item["name"],
            product_code=product_code,
            category_id=bulk_data.category_id,
            unit_price=item.get("unit_price", 0.0)
        )
        db.add(product)
        db.flush()

        inventory_id = generate_inventory_id(db, category.code)
        inventory = models.Inventory(
            product_id=product.id,
            inventory_id=inventory_id,
            quantity=item.get("quantity", 0),
            min_stock_level=10,
            max_stock_level=1000
        )
        db.add(inventory)
        db.flush()
        created_products.append({
            "name": item["name"],
            "product_code": product_code,
            "inventory_id": inventory_id,
            "quantity": item.get("quantity", 0)
        })

    db.commit()
    return {"message": f"Bulk stock processed: {len(created_products)} products created", "products": created_products}