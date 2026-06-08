#[macro_use]
extern crate rocket;

use std::sync::Mutex;
use rusqlite::Connection;
use rocket::State;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

// Contenedor del estado de la base de datos seguro para hilos
struct DbState {
    conn: Mutex<Connection>,
}

// Estructura Customer que mapea la tabla Customers de Northwind
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Customer {
    customer_id: String,
    company_name: String,
    contact_name: Option<String>,
    contact_title: Option<String>,
    address: Option<String>,
    city: Option<String>,
    region: Option<String>,
    postal_code: Option<String>,
    country: Option<String>,
    phone: Option<String>,
    fax: Option<String>,
}

#[get("/health")]
fn health_check(db_state: &State<DbState>) -> Result<Json<serde_json::Value>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    
    // Ejecuta una consulta simple para verificar la conexión
    let count: i64 = conn
        .query_row("SELECT count(*) FROM Customers", [], |row| row.get(0))
        .map_err(|e| format!("Error en consulta a base de datos: {}", e))?;
        
    Ok(Json(serde_json::json!({
        "status": "healthy",
        "database": "connected",
        "customer_count": count
    })))
}

#[launch]
fn rocket() -> _ {
    // Configura el puerto 8001 como lo requiere el frontend de Telco
    let config = rocket::Config::figment().merge(("port", 8001));

    // Abre la conexión a SQLite en la raíz del proyecto backend
    let conn = Connection::open("northwind.db")
        .expect("No se pudo abrir la base de datos northwind.db");

    println!("Base de datos SQLite abierta correctamente en el puerto 8001.");

    // Verificación rápida en el inicio de la app para el paso de Stage 1
    let count: i64 = conn
        .query_row("SELECT count(*) FROM Customers", [], |row| row.get(0))
        .expect("Fallo al consultar la tabla Customers en el inicio");
    println!("Base de datos verificada. Número de clientes registrados: {}", count);

    rocket::custom(config)
        .manage(DbState {
            conn: Mutex::new(conn),
        })
        .mount("/", routes![health_check])
}
