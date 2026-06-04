#[macro_use]
extern crate rocket;

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

#[launch]
fn rocket() -> _ {
    // Configura el puerto 8090 de manera programática
    let config = rocket::Config::figment().merge(("port", 8090));

    rocket::custom(config)
        .mount("/", routes![index])
        .mount("/api", routes![hello, get_item])
}
