from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, products, inventory, categories, dashboard
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Warehouse Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "Smart Warehouse Management System API", "version": "1.0.0"}