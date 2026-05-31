from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from utils.auth import get_current_user
import models

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_products = db.query(models.Product).filter(models.Product.is_active == True).count()
    total_users = db.query(models.User).filter(models.User.is_active == True).count()
    total_categories = db.query(models.Category).count()
    total_inventory_items = db.query(models.Inventory).count()

    low_stock_items = db.query(models.Inventory).filter(
        models.Inventory.quantity <= models.Inventory.min_stock_level
    ).count()

    out_of_stock = db.query(models.Inventory).filter(models.Inventory.quantity == 0).count()

    total_stock_value = db.query(
        func.sum(models.Inventory.quantity * models.Product.unit_price)
    ).join(models.Product).scalar() or 0

    # Category breakdown
    cat_breakdown = db.query(
        models.Category.name,
        models.Category.code,
        func.count(models.Product.id).label("product_count"),
        func.coalesce(func.sum(models.Inventory.quantity), 0).label("total_stock")
    ).outerjoin(models.Product, models.Category.id == models.Product.category_id)\
     .outerjoin(models.Inventory, models.Product.id == models.Inventory.product_id)\
     .group_by(models.Category.id, models.Category.name, models.Category.code).all()

    # Recent movements
    recent_movements = db.query(models.StockMovement).order_by(
        models.StockMovement.created_at.desc()
    ).limit(10).all()

    # Low stock products
    low_stock_products = db.query(models.Inventory).filter(
        models.Inventory.quantity <= models.Inventory.min_stock_level
    ).limit(5).all()

    low_stock_list = []
    for item in low_stock_products:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            low_stock_list.append({
                "product_name": product.name,
                "product_code": product.product_code,
                "quantity": item.quantity,
                "min_stock_level": item.min_stock_level,
                "inventory_id": item.inventory_id
            })

    return {
        "total_products": total_products,
        "total_users": total_users,
        "total_categories": total_categories,
        "total_inventory_items": total_inventory_items,
        "low_stock_items": low_stock_items,
        "out_of_stock": out_of_stock,
        "total_stock_value": round(total_stock_value, 2),
        "category_breakdown": [
            {
                "name": c.name,
                "code": c.code,
                "product_count": c.product_count,
                "total_stock": c.total_stock
            } for c in cat_breakdown
        ],
        "low_stock_alerts": low_stock_list
    }