# Tienda con Carrito + Panel Administrativo (Demo)

Proyecto demo de una **tienda web** hecha con **HTML, CSS y JavaScript** que incluye **carrito de compras**, **búsqueda**, **filtro por categorías** y un **panel administrativo** para gestionar productos.  
Pensado como **muestra de desarrollo** para publicar en **GitHub Pages**.

> ⚠️ Nota: es un proyecto **solo Frontend** (sin backend). Los cambios del panel admin se guardan en el navegador (localStorage).

---
**Vista Tienda (Cliente)**
![Tienda](imagen/readme/02-tienda.png)

**Carrito (panel lateral)**
![Carrito](imagen/readme/carrito.png)

**Panel Administrativo**
![Admin](imagen/readme/04-admin.png)


## Funcionalidades (Cliente / Tienda)

### Catálogo de productos
- Visualización de productos en tarjetas (imagen, nombre, categoría, precio, stock, descripción).
- Botón **Agregar** para añadir productos al carrito.
- Control de **stock** (si no hay stock, el producto queda no disponible).

### Buscador
- Campo para buscar productos por nombre / descripción (búsqueda rápida desde la tienda).

### Filtro por categorías
- Selector “Todas las categorías” para filtrar el catálogo por categoría.
- Las categorías se cargan dinámicamente desde la lista de productos.

### Carrito de compras (Panel lateral)
- Botón **Carrito (n)** con contador de productos.
- Panel lateral “Tu carrito” con lista de productos agregados.
- Controles de cantidad:
  - **+ / −** para aumentar o disminuir unidades.
- Botón **Quitar** para eliminar un producto del carrito.
- Cálculo automático de:
  - **Parcial por producto**
  - **Subtotal** total del carrito
- Botón **Vaciar carrito** para limpiar todo.
- Botón **Comprar** (checkout demo).

### Checkout (Demo)
- Flujo básico para confirmar compra (en demo).
- El pedido se guarda en el navegador (localStorage).

### Botón “Restaurar demo”
- Restaura los productos por defecto (los del JSON del proyecto).
- Limpia datos guardados en el navegador (productos / carrito / pedidos).

### Diseño responsive
- La tienda se adapta a celulares:
  - Header apilado
  - Controles a 100% de ancho
  - Carrito cómodo de usar en pantallas pequeñas

---

## Funcionalidades (Panel Administrativo)

Acceso al panel mediante botón **Admin**.

### Login (demo)
- Acceso con contraseña (demo local).

### Gestión de productos (CRUD)
- Crear productos con:
  - ID único, nombre, categoría, precio, stock, imagen (URL/ruta), descripción.
- Editar productos existentes.
- Eliminar productos.

### Importar / Exportar productos (JSON)
- **Exportar productos (JSON)** para guardar el catálogo actual.
- **Importar JSON** para cargar un catálogo nuevo.

### Reset a products.json
- Botón **Reset a products.json** para volver al catálogo base del proyecto.

> Importante: lo que guardes desde Admin se almacena en **localStorage**, por eso puede “pisar” el JSON hasta que restaures la demo o resetees.

---

## Estructura del proyecto (referencial)

> Los nombres pueden variar según tu repo (por ejemplo `index.html` o `indice.html`, `admin.html` o `administrador.html`).

- Página tienda: `index.html` (o `indice.html`)
- Panel admin: `admin.html` (o `administrador.html`)
- Estilos: `css/styles.css`
- Scripts: `js/*.js`
- Productos: `data/products.json` (o carpeta `datos/`)
- Imágenes:
  - Logo: `img/logo.png` (o `imagen/logo.png`)
  - Productos: `img/products/*.jpg`

---

## Cómo ejecutar en local (recomendado)

**Opción 1 (VS Code):**
- Instala la extensión **Live Server**
- Click derecho → **Open with Live Server**

**Opción 2 (Python):**
```bash
python -m http.server 5500

📞 Contacto Si necesitas una página web para tu negocio:

📱WhatsApp: 906 202 457 📧Correo: tapiaingaharold@gmail.com


🌐 Demostración en vivo
https://esteban2806.github.io/tienda-carrito/

