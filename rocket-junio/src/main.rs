#[macro_use]
extern crate rocket;

use std::sync::Mutex;
use rusqlite::Connection;
use rocket::State;
use rocket::serde::json::Json;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, Status, Method};
use rocket::{Request, Response};
use serde::{Deserialize, Serialize};

// CORS Fairing para permitir peticiones desde el frontend Next.js
pub struct Cors;

#[rocket::async_trait]
impl Fairing for Cors {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS"));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        
        // Manejo automático de respuestas preflight (OPTIONS)
        if request.method() == Method::Options {
            response.set_status(Status::Ok);
            response.set_sized_body(0, std::io::Cursor::new(""));
        }
    }
}

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

// Endpoint de verificación de estado
#[get("/health")]
fn health_check(db_state: &State<DbState>) -> Result<Json<serde_json::Value>, String> {
    let conn = db_state.conn.lock().map_err(|e| e.to_string())?;
    
    let count: i64 = conn
        .query_row("SELECT count(*) FROM Customers", [], |row| row.get(0))
        .map_err(|e| format!("Error en consulta: {}", e))?;
        
    Ok(Json(serde_json::json!({
        "status": "healthy",
        "database": "connected",
        "customer_count": count
    })))
}

// Endpoint GET /customers: Listar clientes con paginación, filtros y ordenamiento
#[get("/customers?<page>&<per_page>&<name_filter>&<sort_field>&<sort_order>")]
fn get_customers(
    db_state: &State<DbState>,
    page: Option<u32>,
    per_page: Option<u32>,
    name_filter: Option<String>,
    sort_field: Option<String>,
    sort_order: Option<String>,
) -> Result<Json<serde_json::Value>, Status> {
    let conn = db_state.conn.lock().map_err(|_| Status::InternalServerError)?;

    let page_val = page.unwrap_or(1);
    let per_page_val = per_page.unwrap_or(10);
    let limit = per_page_val;
    let offset = (page_val - 1) * per_page_val;

    let mut count_query = "SELECT count(*) FROM Customers".to_string();
    let mut data_query = "SELECT CustomerID, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax FROM Customers".to_string();
    
    let mut params: Vec<String> = Vec::new();
    
    if let Some(ref filter) = name_filter {
        if !filter.trim().is_empty() {
            count_query.push_str(" WHERE CompanyName LIKE ?1");
            data_query.push_str(" WHERE CompanyName LIKE ?1");
            params.push(format!("%{}%", filter.trim()));
        }
    }

    // Ordenamiento seguro (Whitelist)
    let sort_col = match sort_field.as_deref() {
        Some("customerId") => "CustomerID",
        Some("companyName") => "CompanyName",
        Some("contactName") => "ContactName",
        Some("contactTitle") => "ContactTitle",
        Some("city") => "City",
        Some("country") => "Country",
        _ => "CustomerID",
    };

    let order = match sort_order.as_deref() {
        Some("desc") | Some("DESC") => "DESC",
        _ => "ASC",
    };

    data_query.push_str(&format!(" ORDER BY {} {}", sort_col, order));

    // Obtener total de registros
    let total_records: i64 = if params.is_empty() {
        conn.query_row(&count_query, [], |row| row.get(0))
            .map_err(|_| Status::InternalServerError)?
    } else {
        conn.query_row(&count_query, [&params[0]], |row| row.get(0))
            .map_err(|_| Status::InternalServerError)?
    };

    // Obtener lista de clientes paginada
    let customers: Vec<Customer> = if params.is_empty() {
        let q = format!("{} LIMIT ?1 OFFSET ?2", data_query);
        let mut stmt = conn.prepare(&q).map_err(|_| Status::InternalServerError)?;
        let rows = stmt.query_map([limit as i64, offset as i64], |row| {
            Ok(Customer {
                customer_id: row.get(0)?,
                company_name: row.get(1)?,
                contact_name: row.get(2)?,
                contact_title: row.get(3)?,
                address: row.get(4)?,
                city: row.get(5)?,
                region: row.get(6)?,
                postal_code: row.get(7)?,
                country: row.get(8)?,
                phone: row.get(9)?,
                fax: row.get(10)?,
            })
        }).map_err(|_| Status::InternalServerError)?;
        
        let mut list = Vec::new();
        for item in rows {
            list.push(item.map_err(|_| Status::InternalServerError)?);
        }
        list
    } else {
        let q = format!("{} LIMIT ?2 OFFSET ?3", data_query);
        let mut stmt = conn.prepare(&q).map_err(|_| Status::InternalServerError)?;
        let rows = stmt.query_map(rusqlite::params![params[0], limit as i64, offset as i64], |row| {
            Ok(Customer {
                customer_id: row.get(0)?,
                company_name: row.get(1)?,
                contact_name: row.get(2)?,
                contact_title: row.get(3)?,
                address: row.get(4)?,
                city: row.get(5)?,
                region: row.get(6)?,
                postal_code: row.get(7)?,
                country: row.get(8)?,
                phone: row.get(9)?,
                fax: row.get(10)?,
            })
        }).map_err(|_| Status::InternalServerError)?;
        
        let mut list = Vec::new();
        for item in rows {
            list.push(item.map_err(|_| Status::InternalServerError)?);
        }
        list
    };

    let total_pages = (total_records as f64 / per_page_val as f64).ceil() as i64;
    
    Ok(Json(serde_json::json!({
        "data": customers,
        "page": page_val,
        "perPage": per_page_val,
        "totalRecords": total_records,
        "totalPages": total_pages
    })))
}

// Endpoint GET /customers/<id>: Obtener un cliente
#[get("/customers/<id>")]
fn get_customer(db_state: &State<DbState>, id: String) -> Result<Json<Customer>, Status> {
    let conn = db_state.conn.lock().map_err(|_| Status::InternalServerError)?;
    
    let res = conn.query_row(
        "SELECT CustomerID, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax FROM Customers WHERE CustomerID = ?1",
        [id],
        |row| {
            Ok(Customer {
                customer_id: row.get(0)?,
                company_name: row.get(1)?,
                contact_name: row.get(2)?,
                contact_title: row.get(3)?,
                address: row.get(4)?,
                city: row.get(5)?,
                region: row.get(6)?,
                postal_code: row.get(7)?,
                country: row.get(8)?,
                phone: row.get(9)?,
                fax: row.get(10)?,
            })
        }
    );
    
    match res {
        Ok(customer) => Ok(Json(customer)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err(Status::NotFound),
        Err(_) => Err(Status::InternalServerError),
    }
}

// Endpoint POST /customers: Crear un nuevo cliente
#[post("/customers", format = "json", data = "<customer>")]
fn create_customer(db_state: &State<DbState>, customer: Json<Customer>) -> Result<Json<Customer>, Status> {
    let conn = db_state.conn.lock().map_err(|_| Status::InternalServerError)?;
    
    // Validación de campos clave
    if customer.customer_id.trim().is_empty() || customer.company_name.trim().is_empty() {
        return Err(Status::BadRequest);
    }
    
    let res = conn.execute(
        "INSERT INTO Customers (CustomerID, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            customer.customer_id.trim().to_uppercase(),
            customer.company_name.trim(),
            customer.contact_name,
            customer.contact_title,
            customer.address,
            customer.city,
            customer.region,
            customer.postal_code,
            customer.country,
            customer.phone,
            customer.fax
        ]
    );
    
    match res {
        Ok(_) => Ok(Json(customer.into_inner())),
        Err(_) => Err(Status::Conflict), // Id duplicado u otra violación de base de datos
    }
}

// Endpoint PUT /customers/<id>: Actualizar un cliente existente
#[put("/customers/<id>", format = "json", data = "<customer>")]
fn update_customer(
    db_state: &State<DbState>,
    id: String,
    customer: Json<Customer>,
) -> Result<Json<Customer>, Status> {
    let conn = db_state.conn.lock().map_err(|_| Status::InternalServerError)?;
    
    if customer.company_name.trim().is_empty() {
        return Err(Status::BadRequest);
    }
    
    let rows_changed = conn.execute(
        "UPDATE Customers 
         SET CompanyName = ?1, ContactName = ?2, ContactTitle = ?3, Address = ?4, City = ?5, Region = ?6, PostalCode = ?7, Country = ?8, Phone = ?9, Fax = ?10 
         WHERE CustomerID = ?11",
        rusqlite::params![
            customer.company_name.trim(),
            customer.contact_name,
            customer.contact_title,
            customer.address,
            customer.city,
            customer.region,
            customer.postal_code,
            customer.country,
            customer.phone,
            customer.fax,
            id
        ]
    ).map_err(|_| Status::InternalServerError)?;
    
    if rows_changed == 0 {
        return Err(Status::NotFound);
    }
    
    Ok(Json(customer.into_inner()))
}

// Endpoint DELETE /customers/<id>: Eliminar un cliente
#[delete("/customers/<id>")]
fn delete_customer(db_state: &State<DbState>, id: String) -> Result<Json<serde_json::Value>, Status> {
    let conn = db_state.conn.lock().map_err(|_| Status::InternalServerError)?;
    
    let rows_changed = conn.execute(
        "DELETE FROM Customers WHERE CustomerID = ?1",
        [id]
    ).map_err(|_| Status::InternalServerError)?;
    
    if rows_changed == 0 {
        return Err(Status::NotFound);
    }
    
    Ok(Json(serde_json::json!({
        "status": "success",
        "message": "Customer deleted successfully"
    })))
}

// Manejador global para preflight OPTIONS
#[options("/<_path..>")]
fn options_handler(_path: std::path::PathBuf) -> &'static str {
    ""
}

#[launch]
fn rocket() -> _ {
    let config = rocket::Config::figment().merge(("port", 8001));

    let conn = Connection::open("northwind.db")
        .expect("No se pudo abrir la base de datos northwind.db");

    println!("Base de datos SQLite cargada correctamente.");

    rocket::custom(config)
        .attach(Cors)
        .manage(DbState {
            conn: Mutex::new(conn),
        })
        .mount("/", routes![
            health_check,
            get_customers,
            get_customer,
            create_customer,
            update_customer,
            delete_customer,
            options_handler
        ])
}
