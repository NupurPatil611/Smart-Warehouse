from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import CategoryCreate, CategoryResponse
from utils.auth import get_current_user, require_role
import models

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Category).all()

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    cat_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin"))
):
    existing = db.query(models.Category).filter(
        (models.Category.name == cat_data.name) | (models.Category.code == cat_data.code.upper())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name or code already exists")

    cat = models.Category(
        name=cat_data.name,
        code=cat_data.code.upper(),
        description=cat_data.description
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    cat_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin", "admin"))
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.name = cat_data.name
    cat.code = cat_data.code.upper()
    cat.description = cat_data.description
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("super_admin"))
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    product_count = db.query(models.Product).filter(models.Product.category_id == cat_id).count()
    if product_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with products")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}