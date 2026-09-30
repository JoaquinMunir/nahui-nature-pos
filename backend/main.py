from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg
from database import get_db_connection

app = FastAPI(title="Nahui Nature POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nahui-nature-pos.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrderItemCreate(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: float
    subtotal: float

class OrderCreate(BaseModel):
    id: str
    client_id: Optional[str] = None 
    total_amount: float
    created_at: str
    items: List[OrderItemCreate]

class ClientCreate(BaseModel):
    id: str
    name: str
    contact: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    route_name: str

@app.get("/health")
def health_check():
    return {"status": "active", "message": "Server connection"}

@app.get("/products")
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY category ASC, name ASC")
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/clients")
def get_clients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM clients WHERE is_active = true ORDER BY location ASC, name ASC")
        clients = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"status": "success", "data": clients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT RESTAURADO: Obtener el catálogo de rutas
@app.get("/routes")
def get_routes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM routes WHERE is_active = true ORDER BY name ASC")
        routes = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"status": "success", "data": routes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clients")
def create_client(client: ClientCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # AUTO-REGISTRO DE RUTAS
        cursor.execute(
            "INSERT INTO routes (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
            (client.route_name,)
        )
        
        # GUARDAR CLIENTE
        cursor.execute(
            """
            INSERT INTO clients (id, name, contact, phone_number, address, location, latitude, longitude, route_name) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                client.id, client.name, client.contact, client.phone_number, 
                client.address, client.location, client.latitude, client.longitude, 
                client.route_name
            )
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Client created successfully"}
    except Exception as e:
        print(f"Database error (create client): {e}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orders")
def create_order(order: OrderCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO orders (id, client_id, total_amount, created_at) VALUES (%s, %s, %s, %s)",
            (order.id, order.client_id, order.total_amount, order.created_at)
        )
        
        for item in order.items:
            cursor.execute(
                "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES (%s, %s, %s, %s, %s, %s)",
                (item.id, order.id, item.product_id, item.quantity, item.unit_price, item.subtotal)
            )
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Order registered successfully"}
    except Exception as e:
        print(f"Database error: {e}") 
        raise HTTPException(status_code=500, detail=str(e))