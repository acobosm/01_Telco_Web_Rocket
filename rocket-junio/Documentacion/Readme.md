# [cite_start]Proyecto WEB con Rocket [cite: 1]

## [cite_start]Descripción del Proyecto [cite: 2]
[cite_start]Este es un servidor web construido con **Rocket**, un framework web para Rust[cite: 3]. [cite_start]El proyecto implementa varias funcionalidades comunes de una **API REST**[cite: 4]:

---

## [cite_start]Conceptos Fundamentales de HTTP [cite: 5]

### [cite_start]1. La URL de HTTP [cite: 6]
[cite_start]La URL (*Uniform Resource Locator*) es fundamental en HTTP y está compuesta por varias partes[cite: 7]:
* [cite_start]**Protocolo:** `http://` o `https://` [cite: 8]
* [cite_start]**Dominio:** `ejemplo.com` [cite: 9]
* [cite_start]**Puerto:** Opcional (por defecto `80` para HTTP y `443` para HTTPS)[cite: 10].
* [cite_start]**Ruta:** `/pagina/subpagina` [cite: 11]
* [cite_start]**Parámetros de consulta:** Opcional (`?param1=valor1&param2=valor2`)[cite: 12].
* **Fragmento:** Opcional (`#seccion`).

### [cite_start]2. Métodos HTTP [cite: 14]
[cite_start]Definen la acción que se desea realizar sobre el recurso[cite: 15]:
* [cite_start]**GET:** Solicitar un recurso[cite: 16].
* [cite_start]**POST:** Enviar datos para procesar[cite: 17].
* [cite_start]**PUT:** Actualizar un recurso existente[cite: 18].
* [cite_start]**DELETE:** Eliminar un recurso[cite: 19].
* [cite_start]**PATCH:** Modificar parcialmente un recurso[cite: 20].

### [cite_start]3. Mensajes HTTP [cite: 22]
[cite_start]Base de la comunicación entre cliente y servidor[cite: 23], divididos en:
1.  [cite_start]**Solicitudes:** Del cliente al servidor[cite: 24].
2.  [cite_start]**Respuestas:** Del servidor al cliente[cite: 25].
[cite_start]*Cada mensaje contiene una línea de inicio, encabezados y, opcionalmente, un cuerpo[cite: 26].*

### [cite_start]4. Códigos de Estado HTTP [cite: 28]
[cite_start]Indican el resultado de la solicitud[cite: 29]:
* [cite_start]**1xx:** Informativo[cite: 30].
* [cite_start]**2xx:** Éxito[cite: 31].
* [cite_start]**3xx:** Redirección[cite: 32].
* [cite_start]**4xx:** Error del cliente[cite: 33].
* [cite_start]**5xx:** Error del servidor[cite: 34].

### [cite_start]5. POST: URL-encoded y Multipart [cite: 36]
[cite_start]El método POST permite enviar datos de dos formas principales[cite: 37]:
1.  [cite_start]**URL-encoded:** Datos en el cuerpo como pares clave-valor (`key=value`)[cite: 38].
2.  [cite_start]**Multipart:** Permite enviar archivos y datos de formulario en la misma solicitud[cite: 39].

---

## [cite_start]Customer Management Application [cite: 42]
[cite_start]This is a full-stack web application for managing customer data, consisting of a Next.js frontend and a Rust backend API[cite: 43].

## [cite_start]Frontend (Next.js) [cite: 44]
[cite_start]Built with Next.js and React, providing a modern, responsive user interface for managing customer records[cite: 45, 55].

### [cite_start]Features [cite: 46]
* [cite_start]Customer list view with pagination [cite: 47]
* [cite_start]Search customers by company name [cite: 48]
* [cite_start]Sort customers by different fields [cite: 49]
* [cite_start]Add new and edit existing customers [cite: 50, 51]
* [cite_start]Delete customers [cite: 52]
* [cite_start]Responsive design for desktop and mobile [cite: 53, 214]

### [cite_start]Technical Details [cite: 54]
* [cite_start]**Framework:** Next.js & React [cite: 55]
* [cite_start]**Styling:** Material-UI components [cite: 56]
* [cite_start]**API Client:** Axios / Fetch [cite: 57, 217]
* [cite_start]**Form Handling:** React Hook Form with validation [cite: 58, 218]
* [cite_start]**State Management:** React hooks [cite: 59]
* [cite_start]**Language:** TypeScript for type safety [cite: 60]

---

## [cite_start]Backend (Rust) [cite: 61]
[cite_start]A RESTful API built with Rust and the Rocket framework that connects to a SQLite database (Northwind) and implements CRUD operations[cite: 62].

### [cite_start]Features [cite: 63]
* [cite_start]Get all customers with pagination, filtering, and sorting [cite: 64]
* [cite_start]Get a single customer by ID [cite: 65]
* [cite_start]Create, Update, and Delete customers [cite: 66, 67, 68]
* [cite_start]CORS enabled for cross-origin requests [cite: 69]

### Technical Details

* Built with Rust and Rocket web framework
* SQLite database with rusqlite for data persistence
* JSON serialization/deserialization with serde
* Thread-safe database access with Mutex
* Error handling and input validation

## Running the Project

### Backend

1. Make sure you have Rust and Cargo installed
2. Navigate to the back directory
3. Place the Northwind SQLite database file in the project root
4. Run `cargo run` to start the server
5. API will be available at http://localhost:8001

### Frontend

1. Make sure you have Node.js and npm installed
2. Navigate to the front directory
3. Run `npm install` to install dependencies
4. Make sure the backend API is running (see backend README)
5. Run `npm start` to start the development server
6. Frontend will be available at http://localhost:3000

# BackEnd del Proyecto

## Customer Management API

This is a RESTful API built with Rust and Rocket framework that provides customer management functionality. The API connects to a SQLite database (Northwind) and implements CRUD operations for customer records.

### Features

* Get all customers with pagination, filtering and sorting
* Get a single customer by ID
* Create new customers
* Update existing customers
* Delete customers
* CORS enabled for cross-origin requests

## API Endpoints

### `GET /customers`

Get a list of customers with optional query parameters:

* `page`: Page number (default: 1)
* `per_page`: Number of records per page (default: 10)
* `name_filter`: Filter customers by company name

### `GET /customers/{id}`

Get a single customer by ID

### `POST /customers`

Create a new customer

### `PUT /customers/{id}`

Update an existing customer

### `DELETE /customers/{id}`

Delete a customer

## Technical Details

* Built with Rust and Rocket web framework
* Uses SQLite database with rusqlite for data persistence
* Implements CORS middleware for cross-origin requests
* JSON serialization/deserialization with serde
* Thread-safe database access with Mutex
* Error handling and input validation

## Running the Project

1. Make sure you have Rust and Cargo installed
2. Clone the repository
3. Place the Northwind SQLite database file in the project root
4. Run `cargo run` to start the server
5. API will be available at http://localhost:8001

Para el backend, Se requiere el archivo northwind.db para poder realizar la conexión a SQLite para los llamados a base de datos tanto de lectura como de escritura.

Como método de prueba, antes de tener construido el FrontEnd, se sugiere crear un archivo llamado test.http para tener diferentes test del API que se va a diseñar en Rust.

En el Cargo.toml se cargarán las diferentes dependencias que requiere el proyecto

# FrontEnd del Proyecto

## Customer Management Frontend

This is a React-based frontend application that provides a user interface for managing customer data. It connects to a Rust/Rocket backend API to perform CRUD operations on customer records.

### Features

* View list of customers with pagination and sorting
* Search customers by company name
* View detailed customer information
* Add new customers
* Edit existing customer details
* Delete customers
* Responsive design for desktop and mobile

## Technical Details

* Built with React and TypeScript
* Fetch for API communication
* Form handling with React Hook Form

## Running the Project

1. Make sure you have Node.js and npm installed
2. Clone the repository
3. Run `npm install` to install dependencies
4. Make sure the backend API is running (see backend README)
5. Run `npm start` to start the development server
6. Frontend will be available at http://localhost:3000

## API Integration

The frontend connects to the backend API running at http://localhost:8001 and utilizes the following endpoints:

* GET /customers - List customers with pagination/filtering
* GET /customers/{id} - Get single customer
* POST /customers - Create customer
* PUT /customers/{id} - Update customer
* DELETE /customers/{id} - Delete customer