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
        "https://nahuinature-pos.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockAdd(BaseModel):
    product_id: str
    quantity: int

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
    sale_mode: str = "mobile"
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

class ExpenseCreate(BaseModel):
    id: str
    concept: str
    amount: float
    created_at: str

class RouteSessionCreate(BaseModel):
    id: str
    start_time: str
    end_time: str
    total_sales: float
    total_expenses: float
    net_cash: float
    order_count: int
    expenses: List[ExpenseCreate]

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

@app.post("/orders")
def create_order(order: OrderCreate):
    conn = None # Lo declaramos aquí para poder hacer rollback seguro si algo falla
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # --- NUEVO: Escudo Anti-Duplicados (Idempotencia) ---
        cursor.execute("SELECT id FROM orders WHERE id = %s", (order.id,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            # Ya existe en DB. Le mentimos piadosamente a React para que libere su cola offline.
            return {"status": "success", "message": "La orden ya estaba sincronizada."}
        # ---------------------------------------------------
        
        # 1. Crear el registro de la orden principal
        cursor.execute(
            "INSERT INTO orders (id, client_id, total_amount, created_at) VALUES (%s, %s, %s, %s)",
            (order.id, order.client_id, order.total_amount, order.created_at)
        )
        
        # 2. Insertar cada producto en el ticket (order_items)
        for item in order.items:
            cursor.execute(
                "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES (%s, %s, %s, %s, %s, %s)",
                (item.id, order.id, item.product_id, item.quantity, item.unit_price, item.subtotal)
            )

        # 3. Determinar de qué bolsillo sacar la mercancía
        table_name = "mobile_inventory" if order.sale_mode == "mobile" else "central_inventory"
        
        # 4. Deducción de Inventario Inteligente
        for item in order.items:
            cursor.execute(f"""
                UPDATE {table_name}
                SET stock_quantity = stock_quantity - %s,
                    last_updated = NOW()
                WHERE product_id = %s AND stock_quantity >= %s
            """, (item.quantity, item.product_id, item.quantity))
            
            # Si no se afectó ninguna fila, el stock era menor al que se intentó vender
            if cursor.rowcount == 0:
                cursor.execute("ROLLBACK;")
                raise HTTPException(status_code=400, detail="Stock insuficiente en base de datos para completar la orden.")
        
        # 5. Confirmamos todo (Si llegamos a esta línea, ninguna venta ni deducción falló)
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Order registered successfully"}
        
    except HTTPException as he:
        # Respeta nuestro mensaje de error personalizado (el 400 de stock insuficiente)
        if conn:
            conn.rollback()
        raise he
    except Exception as e:
        # Atrapa errores de código o de red inesperados
        print(f"Database error: {e}") 
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/orders")
def get_orders():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                o.id, 
                o.total_amount, 
                o.created_at, 
                c.name AS client_name,
                c.location AS client_location,
                c.address AS client_address,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'quantity', oi.quantity,
                            'product_name', p.name,
                            'category', p.category,
                            'subtotal', oi.subtotal
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL), '[]'
                ) AS items
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY o.id, c.name, c.location, c.address
            ORDER BY o.created_at DESC
        """)
        
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"status": "success", "data": orders}
    except Exception as e:
        print(f"Database error (get orders): {e}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/central")
def get_central_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT product_id, stock_quantity, min_threshold, last_updated
            FROM central_inventory
        """)
        
        inventory = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"status": "success", "data": inventory}
    except Exception as e:
        print(f"Database error (get inventory): {e}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/inventory/central/add")
def add_central_stock(item: StockAdd):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO central_inventory (product_id, stock_quantity)
            VALUES (%s, %s)
            ON CONFLICT (product_id) 
            DO UPDATE SET 
                stock_quantity = central_inventory.stock_quantity + EXCLUDED.stock_quantity,
                last_updated = NOW()
            RETURNING stock_quantity;
        """, (item.product_id, item.quantity))
        
        # Obtenemos el nuevo total calculado por la base de datos
        new_stock = cursor.fetchone()['stock_quantity'] 
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Stock actualizado", "new_stock": new_stock}
    except Exception as e:
        print(f"Database error (add stock): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Modelo de datos para recibir la instrucción de traspaso
class StockTransfer(BaseModel):
    product_id: str
    quantity: int
    route_name: str = "Ruta 1" # Dejamos una ruta por defecto por ahora

# 1. Endpoint para leer el inventario de la camioneta
@app.get("/inventory/mobile")
def get_mobile_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                product_id::text AS product_id, 
                stock_quantity, 
                route_name 
            FROM mobile_inventory
        """)
        
        inventory = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"status": "success", "data": inventory}
    except Exception as e:
        print(f"Database error (get mobile inventory): {e}") 
        raise HTTPException(status_code=500, detail=str(e))

# 2. Endpoint de TRASPASO (Casa ➔ Camioneta)
@app.post("/inventory/transfer")
def transfer_stock(item: StockTransfer):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # INICIAMOS TRANSACCIÓN SEGURA
        cursor.execute("BEGIN;")
        
        # Paso A: Restar de la Casa (Solo si hay suficiente stock)
        cursor.execute("""
            UPDATE central_inventory 
            SET stock_quantity = stock_quantity - %s,
                last_updated = NOW()
            WHERE product_id = %s AND stock_quantity >= %s
            RETURNING stock_quantity;
        """, (item.quantity, item.product_id, item.quantity))
        
        updated_central = cursor.fetchone()
        
        if not updated_central:
            # Si no devolvió nada, significa que alguien intentó hackear la vista
            # o se acabó el stock un segundo antes. Cancelamos todo.
            cursor.execute("ROLLBACK;")
            raise HTTPException(status_code=400, detail="Stock insuficiente en el Centro para realizar el traspaso.")
            
        new_central_stock = updated_central['stock_quantity']
        
        # Paso B: Sumar a la Camioneta (UPSERT: Inserta si no existe, suma si ya existe)
        cursor.execute("""
            INSERT INTO mobile_inventory (route_name, product_id, stock_quantity)
            VALUES (%s, %s, %s)
            ON CONFLICT (route_name, product_id) 
            DO UPDATE SET 
                stock_quantity = mobile_inventory.stock_quantity + EXCLUDED.stock_quantity,
                last_updated = NOW()
            RETURNING stock_quantity;
        """, (item.route_name, item.product_id, item.quantity))
        
        new_mobile_stock = cursor.fetchone()['stock_quantity']
        
        # Si ambos pasos salieron bien, confirmamos y guardamos (COMMIT)
        cursor.execute("COMMIT;")
        cursor.close()
        conn.close()
        
        return {
            "status": "success", 
            "message": "Traspaso exitoso", 
            "new_central_stock": new_central_stock,
            "new_mobile_stock": new_mobile_stock
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Database error (transfer stock): {e}")
        if conn: 
            cursor = conn.cursor()
            cursor.execute("ROLLBACK;")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/sessions")
def create_route_session(session: RouteSessionCreate):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Escudo Anti-Duplicados (Idempotencia)
        cursor.execute("SELECT id FROM route_sessions WHERE id = %s", (session.id,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {"status": "success", "message": "La sesión ya estaba registrada."}
            
        # 2. Guardar el resumen del turno
        cursor.execute("""
            INSERT INTO route_sessions (id, start_time, end_time, total_sales, total_expenses, net_cash, order_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (session.id, session.start_time, session.end_time, session.total_sales, 
              session.total_expenses, session.net_cash, session.order_count))
        
        # 3. Guardar el desglose de los gastos (si hubo alguno)
        for exp in session.expenses:
            cursor.execute("""
                INSERT INTO expenses (id, session_id, concept, amount, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (exp.id, session.id, exp.concept, exp.amount, exp.created_at))
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Corte de caja guardado exitosamente"}
        
    except Exception as e:
        print(f"Database error (save session): {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))