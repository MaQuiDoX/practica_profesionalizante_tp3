let productos = [];
let carrito = [];
const porId = (id) => document.getElementById(id);
const buscador = porId("buscador");
const categoria = porId("categoria");
const atributo = porId("atributo");
const minimo = porId("minimo");
const maximo = porId("maximo");
const listaCatalogo = porId("catalogo");
const listaCarrito = porId("carrito");
const estado = porId("estado");
const moneda = (valor) => valor.toLocaleString("es-AR");

// Separamos y eliminamos los acentos antes de comparar los nombres.
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function cantidadEnCarrito(id) {
    return carrito.find((item) => item.producto.id === id)?.cantidad || 0;
}
function crearBoton(texto, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
}
function mostrarDetalle(producto) {
    porId("detalle-nombre").textContent = producto.nombre;
    porId("detalle-imagen").src = producto.imagen;
    porId("detalle-imagen").alt = producto.nombre;
    porId("detalle-descripcion").textContent = producto.descripcion;
    porId("detalle-datos").textContent = "$" + moneda(producto.precio) + " · " + producto.categoria + " · Luz: " + producto.luz + " · Stock: " + producto.stock;
    porId("detalle").showModal();
}
function mostrarCatalogo() {
    listaCatalogo.replaceChildren();
    const desde = minimo.value === "" ? 0 : Number(minimo.value);
    const hasta = maximo.value === "" ? Infinity : Number(maximo.value);
    if (desde < 0 || hasta < 0 || desde > hasta) {
        estado.textContent = "Ingresá un rango válido: precios no negativos y mínimo menor o igual al máximo.";
        return;
    }
    // Todos los filtros se combinan. includes encuentra texto en cualquier posición.
    const resultados = productos.filter((producto) =>
        normalizar(producto.nombre).includes(normalizar(buscador.value)) &&
        (!categoria.value || producto.categoria === categoria.value) &&
        (!atributo.value || producto.luz === atributo.value) &&
        producto.precio >= desde && producto.precio <= hasta
    );
    estado.textContent = resultados.length ? resultados.length + " plantas encontradas." : "No se encontraron plantas.";
    resultados.forEach((producto) => {
        const elemento = document.createElement("li");
        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;
        const datos = document.createElement("p");
        const disponibles = producto.stock - cantidadEnCarrito(producto.id);
        datos.textContent = "$" + moneda(producto.precio) + " · Disponibles: " + disponibles;
        const agregar = crearBoton(disponibles ? "Agregar al carrito" : "Sin stock disponible", () => agregarAlCarrito(producto));
        agregar.disabled = disponibles <= 0;
        elemento.append(imagen, nombre, datos, crearBoton("Ver detalles", () => mostrarDetalle(producto)), agregar);
        listaCatalogo.appendChild(elemento);
    });
}
function agregarAlCarrito(producto) {
    // Validación lógica adicional al botón deshabilitado.
    if (cantidadEnCarrito(producto.id) >= producto.stock) {
        estado.textContent = "No se puede superar el stock disponible.";
        return;
    }
    const encontrado = carrito.find((item) => item.producto.id === producto.id);
    if (encontrado) encontrado.cantidad++;
    else carrito.push({ producto, cantidad: 1 });
    mostrarCarrito();
    mostrarCatalogo();
}
function mostrarCarrito() {
    listaCarrito.replaceChildren();
    let total = 0;
    if (!carrito.length) {
        const vacio = document.createElement("li");
        vacio.textContent = "El carrito está vacío.";
        listaCarrito.appendChild(vacio);
    }
    carrito.forEach((item) => {
        const subtotal = item.producto.precio * item.cantidad;
        total += subtotal;
        const elemento = document.createElement("li");
        elemento.textContent = item.producto.nombre + " × " + item.cantidad + " — Subtotal: $" + moneda(subtotal);
        elemento.appendChild(crearBoton("Quitar una unidad", () => {
            item.cantidad--;
            carrito = carrito.filter((entrada) => entrada.cantidad > 0);
            mostrarCarrito();
            mostrarCatalogo();
        }));
        listaCarrito.appendChild(elemento);
    });
    porId("total").textContent = moneda(total);
}
[buscador, categoria, atributo, minimo, maximo].forEach((control) => control.addEventListener("input", mostrarCatalogo));
porId("vaciar").addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
    mostrarCatalogo();
});
async function cargarProductos() {
    estado.textContent = "Cargando catálogo…";
    try {
        const respuesta = await fetch("productos.json");
        if (!respuesta.ok) throw new Error("No se pudo leer el catálogo");
        productos = await respuesta.json();
        [[categoria, "categoria"], [atributo, "luz"]].forEach(([select, propiedad]) => {
            [...new Set(productos.map((producto) => producto[propiedad]))].forEach((valor) => {
                const opcion = document.createElement("option");
                opcion.value = valor;
                opcion.textContent = valor;
                select.appendChild(opcion);
            });
        });
        mostrarCatalogo();
    } catch (error) {
        estado.textContent = "No se pudo cargar productos.json. Abrí la tienda mediante un servidor local (por ejemplo, Live Server).";
        console.error(error);
    }
}
mostrarCarrito();
cargarProductos();
