from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import UserCreate, UserUpdate, UserResponse
from utils.auth import get_password_hash, get_current_user, require_role
import models

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("super_admin", "admin"))
):
    users = db.query(models.User).all()
    return users

@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Super admins can create any role, admins can only create staff/buyer
    if current_user.role.value == "admin" and user_data.role.value in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admins cannot create super_admin or admin users")
    if current_user.role.value == "staff":
        raise HTTPException(status_code=403, detail="Staff cannot create users")

    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("super_admin", "admin"))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.name:
        user.name = user_data.name
    if user_data.email:
        user.email = user_data.email
    if user_data.role and current_user.role.value == "super_admin":
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("super_admin"))
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}