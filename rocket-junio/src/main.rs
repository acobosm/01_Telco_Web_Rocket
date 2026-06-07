#[macro_use]
extern crate rocket;

use rocket::form::Form;
use rocket::fs::TempFile;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

#[get("/")]
fn index() -> &'static str {
    "¡Hola desde Rocket en el puerto 8090!"
}

#[get("/hello")]
fn hello() -> &'static str {
    "Hello añadido a posterior!"
}

#[get("/item/<id>/<name>")]
fn get_item(id: usize, name: &str) -> String {
    format!("Item con ID: {} y Nombre: {}", id, name)
}

#[get("/items/<tenant>/<person_name>?<page>&<per_page>&<sort_by>")]
fn get_items(
    tenant: String,
    person_name: String,
    page: Option<u32>,
    per_page: Option<u32>,
    sort_by: Option<String>,
) -> String {
    let page = page.unwrap_or(1);
    let per_page = per_page.unwrap_or(10);
    let sort_by = sort_by.unwrap_or_else(|| String::from("id"));

    format!(
        "Petición recibida - Tenant: {}, Persona: {}, Página: {}, Registros por página: {}, Ordenado por: {}",
        tenant, person_name, page, per_page, sort_by
    )
}

#[get("/itemsMultiple?<ids>")]
fn get_multiple_items(ids: Vec<String>) -> String {
    format!("Fetching items with IDs: {:?}", ids)
}

#[derive(Debug, Serialize, Deserialize, FromForm)]
struct Person {
    nombre: String,
    edad: i32,
    saldo: f64,
}

#[post("/person/<empresa>/<nombre>", format = "json", data = "<person>")]
fn create_person(empresa: String, nombre: String, person: Json<Person>) -> String {
    format!(
        "Persona creada - Empresa: {}, Nombre: {}, Nombre persona: {}, Edad: {}, Saldo: ${:.2}",
        empresa, nombre, person.nombre, person.edad, person.saldo
    )
}

#[post("/json", format = "json", data = "<data>")]
fn post_json(data: Json<serde_json::Value>) -> String {
    format!("Received JSON data: {:?}", data.get("metadata"))
}

#[derive(Serialize, Deserialize, Debug, FromForm)]
struct Product {
    id: String,
    nombre: String,
    precio: f64,
    saldo: f64,
}

#[post("/urlencoded/person", format = "form", data = "<person>")]
fn post_urlencoded_person(person: Form<Person>) -> String {
    format!("Received form data (Person): {:?}", person)
}

#[post("/urlencoded/product", format = "form", data = "<product>")]
fn post_urlencoded_product(product: Form<Product>) -> String {
    format!("Received form data (Product): {:?}", product)
}

#[derive(FromForm)]
struct UploadForm<'f> {
    campo1: String,
    campo2: String,
    file: TempFile<'f>,
}

#[post("/upload", data = "<form>")]
async fn upload_multipart(mut form: Form<UploadForm<'_>>) -> String {
    form.file.persist_to("../file.txt").await.unwrap();
    format!(
        "Campos recibidos - Campo1: {}, Campo2: {:?}\n",
        form.campo1,
        form.campo2,
    )
}

#[launch]
fn rocket() -> _ {
    // Configura el puerto 8090 de manera programática
    let config = rocket::Config::figment().merge(("port", 8090));

    rocket::custom(config).mount("/", routes![index]).mount(
        "/api",
        routes![
            hello,
            get_item,
            get_items,
            get_multiple_items,
            create_person,
            post_json,
            post_urlencoded_person,
            post_urlencoded_product,
            upload_multipart
        ],
    )
}
