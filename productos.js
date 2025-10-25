
// ✅ NÚMERO DE WHATSAPP
const numeroWpp = "5491169390101";

// ✅ ELEMENTOS DEL DOM
const contenedor = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contador = document.getElementById("contador-carrito");
const btnWpp = document.getElementById("btn-wpp");
const carrito = [];

let productos = [];

// Cargar los productos desde el archivo JSON
fetch("../productos.json")
  .then(response => response.json())
  .then(data => {
    productos = data;
    mostrarProductos(); // mostrar los productos una vez cargados
  })
  .catch(error => console.error("Error al cargar productos.json:", error));

// ✅ MOSTRAR PRODUCTOS
// function mostrarProductos(filtro = "all") {
//     contenedor.innerHTML = "";
//     const filtrados = filtro === "all" ? productos : productos.filter(p => p.Categoría === filtro);

//     filtrados.forEach(p => {
//         const col = document.createElement("div");
//         col.classList.add("col-12", "col-sm-6", "col-lg-3");
//         col.innerHTML = `
//           <div class="card h-100 shadow-sm">
//             <img src="../img/${p.Img}" class="card-img-top" style="object-fit:cover; height:200px;" alt="${p.Producto}">
//             <div class="card-body d-flex flex-column">
//               <h5 class="card-title">${p.Producto}</h5>
//               <p class="card-text">${p.Descripción}</p>
//               <p class="fw-bold text-danger">$${p.Precio}</p>
//               <button class="btn btn-outline-success mt-auto btn-agregar">Agregar al carrito</button>
//             </div>
//           </div>
//         `;
//         contenedor.appendChild(col);
//         col.querySelector(".btn-agregar").addEventListener("click", () => agregarAlCarrito(p));
//     });
// }

function mostrarProductos(filtro = "all") {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  const productosFiltrados = filtro === "all"
    ? productos
    : productos.filter(p => p.Categoría.toLowerCase() === filtro);

  // 🔸 Agrupar por nombre
  const grupos = {};
  productosFiltrados.forEach(p => {
    const nombre = p.Producto.trim().toUpperCase();
    if (!grupos[nombre]) grupos[nombre] = [];
    grupos[nombre].push(p);
  });

  Object.values(grupos).forEach(grupo => {
    const prodBase = grupo[0];
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-4");

    const selectTipos = grupo.map(p =>
      `<option value="${p.Id}" data-precio="${p.Precio}">
        ${p.Tipo || "Único tipo"}
      </option>`
    ).join("");

    card.innerHTML = `
      <div class="card h-100 text-center shadow">
        <img src="../img/${prodBase.Img}" class="card-img-top p-3" alt="${prodBase.Producto}">
        <div class="card-body">
          <h5 class="card-title">${prodBase.Producto}</h5>
          <select class="form-select mb-2 tipo-select">${selectTipos}</select>
          <p class="precio fw-bold mb-2">$${prodBase.Precio}</p>
          <button class="btn btn-success agregar-carrito">Agregar al carrito</button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);

    const select = card.querySelector(".tipo-select");
    const precio = card.querySelector(".precio");
    select.addEventListener("change", e => {
      const opt = e.target.selectedOptions[0];
      precio.textContent = `$${opt.dataset.precio}`;
    });

    const btn = card.querySelector(".agregar-carrito");
    btn.addEventListener("click", () => {
      const opt = select.selectedOptions[0];
      const id = parseInt(opt.value);
      const prodSeleccionado = grupo.find(p => p.Id === id);
      agregarAlCarrito(prodSeleccionado);
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
  if (!carrito.find(p => p.Id === prod.Id)) {
    carrito.push(prod);
    actualizarCarrito();
  }
}
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidad = 0;
  carrito.forEach((p, i) => {
    const subtotal = p.Precio * p.cantidad;
    total += subtotal;


    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "flex-wrap");
    li.innerHTML = `
          <div>
            <strong>${p.Producto}</strong> (${p.tipo})<br>
            <small>$${p.Precio} c/u</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary restar">-</button>
            <span>${cantidad++}</span>
            <button class="btn btn-sm btn-outline-secondary sumar">+</button>
            <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
          </div>
        `;

    li.querySelector(".sumar").addEventListener("click", () => {
      cantidad++;
      actualizarCarrito();
    });

    li.querySelector(".restar").addEventListener("click", () => {
      if (cantidad > 1) cantidad--;
      else carrito.splice(i, 1);
      actualizarCarrito();
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
    .map(p => `- ${p.Producto} (${p.tipo}) x${p.cantidad} = $${(p.Precio * p.cantidad).toFixed(2)}`)
    .join("%0A");

  btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola!%20Quiero%20pedir:%0A${mensaje}%0A%0ATotal:%20$${total.toFixed(2)}`;
}
// function actualizarCarrito() {
//     listaCarrito.innerHTML = "";
//     carrito.forEach((p, i) => {
//         const li = document.createElement("li");
//         li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
//         li.innerHTML = `
//           ${p.Producto} - $${p.Precio}
//           <button class="btn btn-sm btn-danger">X</button>
//         `;
//         li.querySelector("button").addEventListener("click", () => {
//             carrito.splice(i, 1);
//             actualizarCarrito();
//         });
//         listaCarrito.appendChild(li);
//     });

//     const total = carrito.reduce((acc, p) => acc + p.Precio, 0);
//     totalCarrito.textContent = total;
//     contador.textContent = carrito.length;

//     const mensaje = carrito.map(p => `- ${p.Producto} ($${p.Precio})`).join("%0A");
//     btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola! Quiero pedir:%0A${mensaje}%0ATotal: $${total}`;
// }
