// ✅ NÚMERO DE WHATSAPP
const numeroWpp = "5491136721854";

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
console.log(productos.map(p => p.Categoría))
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

    // Select con tipos
    const selectTipos = grupo.map(p =>
      `<option value="${p.Id}" 
        data-precio="${p.Precio}" 
        data-preciounidadxbulto="${p.PrecioUnidadxBulto || ''}" 
        data-preciototalbulto="${p.PrecioTotalBulto || ''}" 
        data-unidadesporbulto="${p.UnidadesPorBulto || ''}">
        ${p.Tipo || "Único tipo"}
      </option>`
    ).join("");

    // Descripción
    const descripcionHTML = prodBase.Descripción
      ? `<p class="text-muted small mb-1">${prodBase.Descripción}</p>`
      : "";

    // Mostrar precios correctamente
    let precioHTML = "";
    if (prodBase.PrecioTotalBulto) {
      precioHTML = `
        <p class="fw-bold mb-1 text-success">Precio de unidad por bulto: $${prodBase.PrecioUnidadxBulto ? prodBase.PrecioUnidadxBulto.toFixed(2) : "-"}</p>
        ${prodBase.UnidadesPorBulto ? `<p class="text-muted small mb-2">(Trae ${prodBase.UnidadesPorBulto} unidades por bulto)</p>` : ""}
        <p class="text-muted small mb-1">Precio por unidad: $${prodBase.Precio.toFixed(2)}</p>
      `;
    } else {
      precioHTML = `<p class="fw-bold mb-2 text-success">Precio: $${prodBase.Precio}</p>`;
    }

    // Ver si es polvo
    const esPolvo = prodBase.Categoría?.toLowerCase().includes("polvo");

    // Estructura de la card
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
          <select class="form-select form-select-sm mb-2 tipo-select">${selectTipos}</select>
          <div class="zona-precio mb-2">${precioHTML}</div>

          ${esPolvo
        ? `
              <label class="form-label small mb-1">Cantidad de bultos:</label>
              <input type="number" min="0" value="0" class="form-control form-control-sm mb-2 cantidad-bultos" placeholder="Bultos">
              <label class="form-label small mb-1">Cantidad de unidades sueltas:</label>
              <input type="number" min="0" value="0" class="form-control form-control-sm mb-3 cantidad-unidades" placeholder="Unidades sueltas">
            `
        : `<input type="number" min="1" value="1" class="form-control form-control-sm mb-3 cantidad-input" placeholder="Cantidad">`
      }

          <button class="btn btn-success w-100 mt-auto agregar-carrito">
            <i class="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);

    const select = card.querySelector(".tipo-select");
    const btn = card.querySelector(".agregar-carrito");

    // ✅ Cuando cambia el tipo, actualiza los precios
    select.addEventListener("change", e => {
      const opt = e.target.selectedOptions[0];
      const precioUnidad = parseFloat(opt.dataset.precio) || 0;
      const precioUnidadxBulto = parseFloat(opt.dataset.preciounidadxbulto) || 0;
      const precioTotalBulto = parseFloat(opt.dataset.preciototalbulto) || 0;
      const unidadesPorBulto = parseInt(opt.dataset.unidadesporbulto) || 0;
      const zonaPrecio = card.querySelector(".zona-precio");

      if (precioTotalBulto > 0) {
        zonaPrecio.innerHTML = `
          <p class="fw-bold mb-1 text-success">Precio por bulto: $${precioUnidadxBulto.toFixed(2)} c/u</p>
          ${unidadesPorBulto ? `<p class="text-muted small mb-2">(Trae ${unidadesPorBulto} unidades por bulto)</p>` : ""}
          <p class="text-muted small mb-1">Precio por unidad: $${precioUnidad.toFixed(2)}</p>
        `;
      } else {
        zonaPrecio.innerHTML = `<p class="fw-bold mb-2 text-success">Precio: $${precioUnidad}</p>`;
      }
    });

    // ✅ Agregar al carrito
    btn.addEventListener("click", () => {
      const opt = select.selectedOptions[0];
      const id = parseInt(opt.value);
      const prodSeleccionado = grupo.find(p => p.Id === id);

      if (esPolvo) {
        const cantidadBultos = parseInt(card.querySelector(".cantidad-bultos").value) || 0;
        const cantidadUnidades = parseInt(card.querySelector(".cantidad-unidades").value) || 0;

        if (cantidadBultos > 0 || cantidadUnidades > 0) {
          agregarAlCarrito({ ...prodSeleccionado, cantidadBultos, cantidadUnidades });
        }
      } else {
        const cantidad = parseInt(card.querySelector(".cantidad-input").value) || 1;
        if (cantidad > 0) {
          agregarAlCarrito({ ...prodSeleccionado, cantidad });
        }
      }
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

// ✅ BUSCADOR
const buscador = document.getElementById("buscador");
buscador.addEventListener("input", () => {
  const texto = buscador.value.trim().toLowerCase();
  mostrarProductosBusqueda(texto);
});

function mostrarProductosBusqueda(texto) {
  const filtrados = texto === ""
    ? productos
    : productos.filter(p => p.Producto.toLowerCase().includes(texto));
  mostrarProductosFiltrados(filtrados);
}

// ✅ CARRITO
function agregarAlCarrito(prod) {
  const existente = carrito.find(p => p.Id === prod.Id);
  const unidadesPorBulto = parseInt(prod.UnidadesPorBulto) || 0;
  const precioUnidad = parseFloat(prod.Precio);
  const precioUnidadxBulto = parseFloat(prod.PrecioUnidadxBulto) || 0;
  const precioTotalBulto = parseFloat(prod.PrecioTotalBulto) || 0;

  // Caso polvos
  if (prod.cantidadBultos !== undefined && prod.cantidadUnidades !== undefined) {
    const cantidadBultos = prod.cantidadBultos;
    const cantidadUnidades = prod.cantidadUnidades;

    if (cantidadBultos > 0) {
      carrito.push({
        ...prod,
        tipoVenta: "bulto",
        cantidad: cantidadBultos,
        detalle: `${cantidadBultos} bulto(s) (${unidadesPorBulto}u c/u)`,
        precioAplicado: precioTotalBulto / cantidadBultos
      });
    }

    if (cantidadUnidades > 0) {
      carrito.push({
        ...prod,
        tipoVenta: "unidad",
        cantidad: cantidadUnidades,
        detalle: `${cantidadUnidades} unidad(es) suelta(s)`,
        precioAplicado: precioUnidad
      });
    }
  } else {
    const productoNormal = {
      ...prod,
      tipoVenta: "unidad",
      cantidad: prod.cantidad || 1,
      precioAplicado: precioUnidadxBulto || precioUnidad
    };

    if (existente) {
      existente.cantidad += prod.cantidad;
    } else {
      carrito.push(productoNormal);
    }
  }

  actualizarCarrito();
}

// ✅ ACTUALIZAR CARRITO
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((p, i) => {
    const subtotal = p.precioAplicado * p.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "flex-wrap"
    );

    li.innerHTML = `
      <div>
        <strong>${p.Producto}</strong> (${p.Tipo || "Único"})<br>
        ${p.PrecioTotalBulto
        ? `<small>$${p.PrecioTotalBulto.toFixed(2)} total${p.UnidadesPorBulto ? ` (trae ${p.UnidadesPorBulto}u)` : ""}</small><br>
             <small class="text-muted">Precio c/u: $${p.Precio.toFixed(2)}</small>`
        : `<small>$${p.Precio.toFixed(2)} c/u</small>`
      }
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary restar">-</button>
        <input type="number" min="1" value="${p.cantidad}" class="form-control form-control-sm cantidad-carrito" style="width:60px;">
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
      const tipoCompra = p.tipoVenta ? p.tipoVenta.toUpperCase() : "UNIDAD";
      const precioUnitario = p.precioAplicado || p.PrecioUnidadxBulto || p.Precio;
      return `- ${p.Producto} (${p.Tipo || "Único"}) • ${tipoCompra} x${p.cantidad} = $${(precioUnitario * p.cantidad).toFixed(2)}`;
    })
    .join("%0A");

  btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola!%20Quiero%20pedir:%0A${mensaje}%0A%0ATotal:%20$${total.toFixed(2)}`;
}

// ✅ FUNCIÓN AUXILIAR PARA MOSTRAR RESULTADOS DEL BUSCADOR
function mostrarProductosFiltrados(lista) {
  contenedor.innerHTML = "";

  // Agrupar por nombre igual que en mostrarProductos()
  const grupos = {};
  lista.forEach(p => {
    const nombre = p.Producto.trim().toUpperCase();
    if (!grupos[nombre]) grupos[nombre] = [];
    grupos[nombre].push(p);
  });

  // Reusar la misma lógica de mostrarProductos()
  Object.values(grupos).forEach(grupo => {
    const prodBase = grupo[0];
    const card = document.createElement("div");
    card.classList.add("col-12", "col-sm-6", "col-lg-3", "mb-4");

    const selectTipos = grupo.map(p =>
      `<option value="${p.Id}" 
        data-precio="${p.Precio}" 
        data-preciounidadxbulto="${p.PrecioUnidadxBulto || ''}" 
        data-preciototalbulto="${p.PrecioTotalBulto || ''}" 
        data-unidadesporbulto="${p.UnidadesPorBulto || ''}">
        ${p.Tipo || "Único tipo"}
      </option>`
    ).join("");

    const descripcionHTML = prodBase.Descripción
      ? `<p class="text-muted small mb-1">${prodBase.Descripción}</p>`
      : "";

    let precioHTML = "";
    if (prodBase.PrecioTotalBulto) {
      precioHTML = `
        <p class="fw-bold mb-1 text-success">Precio de unidad por bulto: $${prodBase.PrecioUnidadxBulto ? prodBase.PrecioUnidadxBulto.toFixed(2) : "-"}</p>
        ${prodBase.UnidadesPorBulto ? `<p class="text-muted small mb-2">(Trae ${prodBase.UnidadesPorBulto} unidades por bulto)</p>` : ""}
        <p class="text-muted small mb-1">Precio por unidad: $${prodBase.Precio.toFixed(2)}</p>
      `;
    } else {
      precioHTML = `<p class="fw-bold mb-2 text-success">Precio: $${prodBase.Precio}</p>`;
    }

    const esPolvo = prodBase.Categoría?.toLowerCase().includes("polvo");

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
          <select class="form-select form-select-sm mb-2 tipo-select">${selectTipos}</select>
          <div class="zona-precio mb-2">${precioHTML}</div>

          ${esPolvo
        ? `
              <label class="form-label small mb-1">Cantidad de bultos:</label>
              <input type="number" min="0" value="0" class="form-control form-control-sm mb-2 cantidad-bultos" placeholder="Bultos">
              <label class="form-label small mb-1">Cantidad de unidades sueltas:</label>
              <input type="number" min="0" value="0" class="form-control form-control-sm mb-3 cantidad-unidades" placeholder="Unidades sueltas">
            `
        : `<input type="number" min="1" value="1" class="form-control form-control-sm mb-3 cantidad-input" placeholder="Cantidad">`
      }

          <button class="btn btn-success w-100 mt-auto agregar-carrito">
            <i class="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });
}
