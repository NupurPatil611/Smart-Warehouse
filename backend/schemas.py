from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.staff

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    unit_price: float = 0.0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    unit_price: Optional[float] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    product_code: str
    description: Optional[str]
    category_id: int
    unit_price: float
    is_active: bool
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryUpdate(BaseModel):
    quantity: int
    min_stock_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    location: Optional[str] = None

class StockMovementCreate(BaseModel):
    inventory_id: int
    movement_type: str  # "in" or "out"
    quantity: int
    reason: Optional[str] = None

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    inventory_id: str
    quantity: int
    min_stock_level: int
    max_stock_level: int
    location: Optional[str]
    last_updated: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class BulkStockRequest(BaseModel):
    category_id: int
    items: List[dict]  # [{"name": "...", "quantity": 10, "unit_price": 9.99}]