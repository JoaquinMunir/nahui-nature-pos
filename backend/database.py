import os
import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

# 1. Cargar las variables de entorno desde el archivo .env
load_dotenv()

# 2. Obtener la URL de conexión
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """
    Establece y retorna una conexión a la base de datos PostgreSQL.
    Utilizamos dict_row para que los datos regresen en formato JSON/Diccionario
    y sean fáciles de enviar al Frontend en React.
    """
    try:
        # Iniciamos la conexión con Supabase
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        raise e