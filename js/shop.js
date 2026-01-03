import {
  ensureProductsLoaded, loadProducts, saveProducts,
  loadCart, saveCart, cartCount,
  saveOrder, norm, escapeHTML, escapeAttr
} from "./storage.js";

const el = (id) => document.getElementById(id);

const resetDemoBtn = el("resetDemoBtn");
const productsGrid = el("productsGrid");
const statusMsg = el("statusMsg");
const cartButton = el("cartButton");
const cartDrawer = el("cartDrawer");
const closeCart = el("closeCart");
const cartItems = el("cartItems");
const cartCountEl = el("cartCount");
const cartSubtotalEl = el("cartSubtotal");
const clearCart = el("clearCart");
const checkoutBtn = el("checkoutBtn");

const searchInput = el("searchInput");
const categorySelect = el("categorySelect");

const modalBackdrop = el("modalBackdrop");
const checkoutModal = el("checkoutModal");
const closeModal = el("closeModal");
const checkoutForm = el("checkoutForm");
const checkoutTotal = el("checkoutTotal");

let products = [];
let cart = loadCart();

init();

async function init(){
  wireUI();

  statusMsg.textContent = "Cargando productos...";
  try{
    await ensureProductsLoaded();
    products = loadProducts();
    renderCategories(products);
    renderProducts(products);
    statusMsg.textContent = "";
  }catch(err){
    console.error(err);
    statusMsg.textContent = "No se pudieron cargar productos. Abre con servidor (Live Server / http.server).";
  }

  updateCartUI();
}

function wireUI(){
  cartButton.addEventListener("click", () => openCart(true));
  closeCart.addEventListener("click", () => openCart(false));

  clearCart.addEventListener("click", () => {
    cart = {};
    saveCart(cart);
    updateCartUI();
  });

  checkoutBtn.addEventListener("click", () => {
    if (cartCount(cart) === 0) return;
    openCheckout(true);
  });

  closeModal.addEventListener("click", () => openCheckout(false));
  modalBackdrop.addEventListener("click", () => openCheckout(false));

  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cartCount(cart) === 0) return;

    const form = new FormData(checkoutForm);
    const order = buildOrderObject({
      name: form.get("name"),
      email: form.get("email"),
      address: form.get("address")
    });

    // Reduce stock local (solo en este navegador)
    products = applyStockReduction(products, cart);
    saveProducts(products);

    saveOrder(order);
    cart = {};
    saveCart(cart);
    updateCartUI();
    renderCategories(products);
    renderProducts(products);
    openCheckout(false);
    checkoutForm.reset();

    alert(`Compra registrada (local). ID: ${order.id}`);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      openCart(false);
      openCheckout(false);
    }
  });
}

function renderCategories(items){
  const current = categorySelect.value || "all";
  categorySelect.innerHTML = `<option value="all">Todas las categorías</option>`;

  const categories = Array.from(new Set(items.map(p => p.category))).sort();
  for (const c of categories){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  }
  if ([...categorySelect.options].some(o => o.value === current)){
    categorySelect.value = current;
  }
}

function applyFilters(){
  const q = norm(searchInput.value).trim();
  const cat = categorySelect.value;

  const filtered = products.filter(p => {
    const matchQ = norm(p.name).includes(q) || norm(p.description).includes(q);
    const matchC = (cat === "all") ? true : (p.category === cat);
    return matchQ && matchC;
  });

  renderProducts(filtered);
}

function renderProducts(items){
  productsGrid.innerHTML = "";

  if (!items.length){
    productsGrid.innerHTML = `<p class="muted">Sin resultados.</p>`;
    return;
  }

  for (const p of items){
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" />
      <div class="content">
        <div class="title">
          <h3>${escapeHTML(p.name)}</h3>
          <span class="badge">${escapeHTML(p.category)}</span>
        </div>
        <p class="muted small">${escapeHTML(p.description || "")}</p>
        <div class="price-row">
          <strong>S/ ${Number(p.price).toFixed(2)}</strong>
          <button class="btn btn-primary" ${p.stock <= 0 ? "disabled" : ""} data-add="${p.id}">
            ${p.stock <= 0 ? "Agotado" : "Agregar"}
          </button>
        </div>
        <p class="muted small">Stock: ${Number(p.stock)}</p>
      </div>
    `;

    card.querySelector(`[data-add="${p.id}"]`)?.addEventListener("click", () => addToCart(p.id));
    productsGrid.appendChild(card);
  }
}

function addToCart(productId){
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const currentQty = cart[productId]?.qty ?? 0;
  if (currentQty + 1 > product.stock){
    alert("No hay stock suficiente.");
    return;
  }

  cart[productId] = { qty: currentQty + 1 };
  saveCart(cart);
  updateCartUI();
  openCart(true);
}

function removeFromCart(productId){
  delete cart[productId];
  saveCart(cart);
  updateCartUI();
}

function changeQty(productId, delta){
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const currentQty = cart[productId]?.qty ?? 0;
  const nextQty = currentQty + delta;

  if (nextQty <= 0){
    removeFromCart(productId);
    return;
  }
  if (nextQty > product.stock){
    alert("No hay stock suficiente.");
    return;
  }

  cart[productId] = { qty: nextQty };
  saveCart(cart);
  updateCartUI();
}

function updateCartUI(){
  cartCountEl.textContent = String(cartCount(cart));

  const lines = getCartLines();
  cartItems.innerHTML = "";

  if (!lines.length){
    cartItems.innerHTML = `<p class="muted">Tu carrito está vacío.</p>`;
    cartSubtotalEl.textContent = "0.00";
    checkoutTotal.textContent = "0.00";
    return;
  }

  for (const line of lines){
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="meta">
        <strong>${escapeHTML(line.name)}</strong>
        <span class="muted small">S/ ${line.price.toFixed(2)} c/u</span>
        <span class="muted small">Parcial: S/ ${line.lineTotal.toFixed(2)}</span>
      </div>
      <div class="controls">
        <div class="qty">
          <button aria-label="Menos" data-minus="${line.id}">−</button>
          <span>${line.qty}</span>
          <button aria-label="Más" data-plus="${line.id}">+</button>
        </div>
        <button class="btn danger" data-remove="${line.id}">Quitar</button>
      </div>
    `;

    row.querySelector(`[data-minus="${line.id}"]`)?.addEventListener("click", () => changeQty(line.id, -1));
    row.querySelector(`[data-plus="${line.id}"]`)?.addEventListener("click", () => changeQty(line.id, +1));
    row.querySelector(`[data-remove="${line.id}"]`)?.addEventListener("click", () => removeFromCart(line.id));

    cartItems.appendChild(row);
  }

  const subtotal = lines.reduce((acc, x) => acc + x.lineTotal, 0);
  cartSubtotalEl.textContent = subtotal.toFixed(2);
  checkoutTotal.textContent = subtotal.toFixed(2);
}

function getCartLines(){
  const lines = [];
  for (const [id, item] of Object.entries(cart)){
    const p = products.find(x => x.id === id);
    if (!p) continue;
    const qty = Number(item.qty) || 0;
    lines.push({
      id,
      name: p.name,
      price: Number(p.price),
      qty,
      lineTotal: Number(p.price) * qty
    });
  }
  return lines;
}

function openCart(open){
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
}

function openCheckout(open){
  modalBackdrop.classList.toggle("hidden", !open);
  checkoutModal.classList.toggle("hidden", !open);
  if (open){
    checkoutTotal.textContent = Number(cartSubtotalEl.textContent || "0").toFixed(2);
  }
}

function buildOrderObject(customer){
  const lines = getCartLines();
  const total = lines.reduce((a, x) => a + x.lineTotal, 0);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customer,
    currency: "PEN",
    total: Number(total.toFixed(2)),
    items: lines.map(l => ({
      id: l.id,
      name: l.name,
      unitPrice: l.price,
      qty: l.qty,
      lineTotal: Number(l.lineTotal.toFixed(2))
    }))
  };
}

function applyStockReduction(prodList, cartObj){
  const map = new Map(prodList.map(p => [p.id, { ...p }]));
  for (const [id, item] of Object.entries(cartObj)){
    const p = map.get(id);
    if (!p) continue;
    const qty = Number(item.qty) || 0;
    p.stock = Math.max(0, Number(p.stock) - qty);
    map.set(id, p);
  }
  return [...map.values()];
}
