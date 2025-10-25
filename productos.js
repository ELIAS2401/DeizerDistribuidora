// ✅ NÚMERO DE WHATSAPP
const numeroWpp = "5491169390101";

// ✅ ELEMENTOS DEL DOM
const contenedor = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contador = document.getElementById("contador-carrito");
const btnWpp = document.getElementById("btn-wpp");
let carrito = [];
let productos = [];

// ✅ CARGAR PRODUCTOS
fetch("../productos.json")
  .then(r => r.json())
  .then(data => {
    productos = data;
    mostrarProductos();
  })
  .catch(e => console.error("Error al cargar productos.json:", e));

// ✅ MOSTRAR PRODUCTOS
function mostrarProductos(filtro = "all") {
  contenedor.innerHTML = "";

  const filtrados = filtro === "all"
    ? productos
    : productos.filter(p => p.Categoría.toLowerCase() === filtro);

  // Agrupar por nombre
  const grupos = {};
  filtrados.forEach(p => {
    const nombre = p.Producto.trim().toUpperCase();
    if (!grupos[nombre]) grupos[nombre] = [];
    grupos[nombre].push(p);
  });

  Object.values(grupos).forEach(grupo => {
    const prodBase = grupo[0];
    const card = document.createElement("div");
    card.classList.add("col-12", "col-sm-6", "col-lg-3", "mb-4");

    const selectTipos = grupo.map(p =>
      `<option value="${p.Id}" 
        data-precio="${p.Precio}" 
        data-preciototal="${p.PrecioTotal || ''}" 
        data-unidades="${p.Unidades || ''}">
        ${p.Tipo || "Único tipo"}
      </option>`
    ).join("");

    // ✅ Descripción
    const descripcionHTML = prodBase.Descripción
      ? `<p class="text-muted small mb-1">${prodBase.Descripción}</p>`
      : "";

    // ✅ Mostrar precios correctamente
    let precioHTML = "";
    if (prodBase.PrecioTotal) {
      precioHTML = `
        <p class="precio fw-bold mb-2 text-success">$${prodBase.PrecioTotal}</p>
        <p class="text-muted small mb-1">Precio c/u: $${prodBase.Precio}</p>
        ${prodBase.Unidades ? `<p class="text-muted small mb-2">Trae ${prodBase.Unidades} unidades</p>` : ""}
      `;
    } else {
      precioHTML = `<p class="precio fw-bold mb-2 text-success">$${prodBase.Precio}</p>`;
    }

    card.innerHTML = `
      <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="d-flex align-items-center justify-content-center bg-light" style="height: 180px;">
          <img src="../img/${prodBase.Img}" class="img-fluid" alt="${prodBase.Producto}" style="max-height:150px; object-fit:contain;">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate fw-semibold mb-2" title="${prodBase.Producto}">
            ${prodBase.Producto.toUpperCase()}
          </h5>
          ${descripcionHTML}
          <select class="form-select form-select-sm mb-2 tipo-select">
            ${selectTipos}
          </select>
          <div class="zona-precio mb-2">${precioHTML}</div>
          <input type="number" min="1" value="1" class="form-control form-control-sm mb-3 cantidad-input" placeholder="Cantidad">
          <button class="btn btn-success w-100 mt-auto agregar-carrito">
            <i class="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);

    // ✅ Eventos
    const select = card.querySelector(".tipo-select");
    const zonaPrecio = card.querySelector(".zona-precio");
    const inputCantidad = card.querySelector(".cantidad-input");

    select.addEventListener("change", e => {
      const opt = e.target.selectedOptions[0];
      const precio = opt.dataset.precio;
      const precioTotal = opt.dataset.preciototal;
      const unidades = opt.dataset.unidades;

      if (precioTotal) {
        zonaPrecio.innerHTML = `
          <p class="precio fw-bold mb-1 text-success fs-5">$${precioTotal}</p>
          <p class="text-muted small mb-1">Precio c/u: $${precio}</p>
          ${unidades ? `<p class="text-muted small mb-2">Trae ${unidades} unidades</p>` : ""}
        `;
      } else {
        zonaPrecio.innerHTML = `
          <p class="precio fw-bold mb-2 text-success">$${precio}</p>
        `;
      }
    });

    const btn = card.querySelector(".agregar-carrito");
    btn.addEventListener("click", () => {
      const opt = select.selectedOptions[0];
      const id = parseInt(opt.value);
      const cantidad = parseInt(inputCantidad.value) || 1;
      const prodSeleccionado = grupo.find(p => p.Id === id);
      agregarAlCarrito({ ...prodSeleccionado, cantidad });
    });
  });
}

// ✅ FILTROS
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mostrarProductos(btn.dataset.filter);
  });
});

// ✅ CARRITO
function agregarAlCarrito(prod) {
  const existente = carrito.find(p => p.Id === prod.Id);
  if (existente) {
    existente.cantidad += prod.cantidad;
  } else {
    carrito.push({ ...prod });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((p, i) => {
    // ✅ Usar PrecioTotal si existe, sino Precio
    const precioUnitario = p.PrecioTotal || p.Precio;
    const subtotal = precioUnitario * p.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "flex-wrap"
    );

    // ✅ Mostrar correctamente
    li.innerHTML = `
      <div>
        <strong>${p.Producto}</strong> (${p.Tipo || "Único"})<br>
        ${
          p.PrecioTotal
            ? `<small>$${p.PrecioTotal} total${p.Unidades ? ` (trae ${p.Unidades} unidades)` : ""}</small><br>
               <small class="text-muted">Precio c/u: $${p.Precio}</small>`
            : `<small>$${p.Precio} c/u</small>`
        }
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary restar">-</button>
        <input type="number" min="1" value="${p.cantidad}" 
               class="form-control form-control-sm cantidad-carrito" style="width:60px;">
        <button class="btn btn-sm btn-outline-secondary sumar">+</button>
        <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
      </div>
    `;

    li.querySelector(".sumar").addEventListener("click", () => {
      p.cantidad++;
      actualizarCarrito();
    });

    li.querySelector(".restar").addEventListener("click", () => {
      p.cantidad--;
      if (p.cantidad < 1) carrito.splice(i, 1);
      actualizarCarrito();
    });

    li.querySelector(".cantidad-carrito").addEventListener("input", e => {
      const nuevaCantidad = parseInt(e.target.value);
      if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
        p.cantidad = nuevaCantidad;
        actualizarCarrito();
      }
    });

    li.querySelector(".eliminar").addEventListener("click", () => {
      carrito.splice(i, 1);
      actualizarCarrito();
    });

    listaCarrito.appendChild(li);
  });

  totalCarrito.textContent = total.toFixed(2);
  contador.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  const mensaje = carrito
    .map(p => {
      const precioUnitario = p.PrecioTotal || p.Precio;
      return `- ${p.Producto} (${p.Tipo || "Único"}) x${p.cantidad} = $${(
        precioUnitario * p.cantidad
      ).toFixed(2)}`;
    })
    .join("%0A");

  btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola!%20Quiero%20pedir:%0A${mensaje}%0A%0ATotal:%20$${total.toFixed(
    2
  )}`;
}

// function actualizarCarrito() {
//   listaCarrito.innerHTML = "";
//   let total = 0;

//   carrito.forEach((p, i) => {
//     const subtotal = p.Precio * p.cantidad;
//     total += subtotal;

//     const li = document.createElement("li");
//     li.classList.add(
//       "list-group-item",
//       "d-flex",
//       "justify-content-between",
//       "align-items-center",
//       "flex-wrap"
//     );

//     li.innerHTML = `
//       <div>
//         <strong>${p.Producto}</strong> (${p.Tipo || "Único"})<br>
//         <small>$${p.Precio} c/u</small>
//       </div>
//       <div class="d-flex align-items-center gap-2">
//         <button class="btn btn-sm btn-outline-secondary restar">-</button>
//         <input type="number" min="1" value="${p.cantidad}" 
//                class="form-control form-control-sm cantidad-carrito" style="width:60px;">
//         <button class="btn btn-sm btn-outline-secondary sumar">+</button>
//         <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
//       </div>
//     `;

//     li.querySelector(".sumar").addEventListener("click", () => {
//       p.cantidad++;
//       actualizarCarrito();
//     });

//     li.querySelector(".restar").addEventListener("click", () => {
//       p.cantidad--;
//       if (p.cantidad < 1) carrito.splice(i, 1);
//       actualizarCarrito();
//     });

//     li.querySelector(".cantidad-carrito").addEventListener("input", e => {
//       const nuevaCantidad = parseInt(e.target.value);
//       if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
//         p.cantidad = nuevaCantidad;
//         actualizarCarrito();
//       }
//     });

//     li.querySelector(".eliminar").addEventListener("click", () => {
//       carrito.splice(i, 1);
//       actualizarCarrito();
//     });

//     listaCarrito.appendChild(li);
//   });

//   totalCarrito.textContent = total.toFixed(2);
//   contador.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);

//   const mensaje = carrito
//     .map(
//       p =>
//         `- ${p.Producto} (${p.Tipo || "Único"}) x${p.cantidad} = $${(
//           p.Precio * p.cantidad
//         ).toFixed(2)}`
//     )
//     .join("%0A");

//   btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola!%20Quiero%20pedir:%0A${mensaje}%0A%0ATotal:%20$${total.toFixed(
//     2
//   )}`;
// }
