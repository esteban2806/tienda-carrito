import {
  ensureProductsLoaded, loadProducts, saveProducts, resetProductsFromDefault,
  downloadJSON, sanitizeProducts, escapeHTML
} from "./storage.js";

const el = (id) => document.getElementById(id);

// Cambia esta clave si quieres
const ADMIN_PASSWORD = "admin123";
const ADMIN_SESSION_KEY = "admin_session_v1";

const loginSection = el("loginSection");
const panelSection = el("panelSection");
const loginBtn = el("loginBtn");
const logoutBtn = el("logoutBtn");
const adminPassword = el("adminPassword");
const loginMsg = el("loginMsg");

const p_id = el("p_id");
const p_name = el("p_name");
const p_price = el("p_price");
const p_image = el("p_image");
const p_category = el("p_category");
const p_stock = el("p_stock");
const p_desc = el("p_desc");

const saveProductBtn = el("saveProductBtn");
const clearFormBtn = el("clearFormBtn");
const adminList = el("adminList");

const exportBtn = el("exportBtn");
const importFile = el("importFile");
const resetDefaultBtn = el("resetDefaultBtn");
const adminMsg = el("adminMsg");

let products = [];

init();

async function init(){
  await ensureProductsLoaded();
  products = loadProducts();

  wireUI();
  render();

  if (isLoggedIn()) setLoggedIn(true);
}

function wireUI(){
  loginBtn.addEventListener("click", () => {
    const pass = adminPassword.value || "";
    if (pass === ADMIN_PASSWORD){
      setLoggedIn(true);
      saveSession(true);
      adminPassword.value = "";
      loginMsg.textContent = "";
    }else{
      loginMsg.textContent = "Contraseña incorrecta.";
    }
  });

  logoutBtn.addEventListener("click", () => {
    saveSession(false);
    setLoggedIn(false);
  });

  saveProductBtn.addEventListener("click", () => {
    const product = readForm();
    if (!product.id || !product.name){
      adminMsg.textContent = "ID y Nombre son obligatorios.";
      return;
    }

    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0){
      products[idx] = product;
      adminMsg.textContent = "Producto actualizado.";
    }else{
      products.unshift(product);
      adminMsg.textContent = "Producto creado.";
    }

    products = sanitizeProducts(products);
    saveProducts(products);
    render();
    clearForm();
  });

  clearFormBtn.addEventListener("click", clearForm);

  exportBtn.addEventListener("click", () => {
    downloadJSON(products, "products.json");
    adminMsg.textContent = "Exportado. Sube el JSON al repo si quieres que sea la base por defecto.";
  });

  importFile.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try{
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("El JSON debe ser un arreglo de productos");
      products = sanitizeProducts(data);
      saveProducts(products);
      render();
      adminMsg.textContent = "Importación exitosa.";
    }catch(err){
      console.error(err);
      adminMsg.textContent = "Error al importar JSON.";
    }finally{
      importFile.value = "";
    }
  });

  resetDefaultBtn.addEventListener("click", async () => {
    if (!confirm("Esto reemplazará los productos guardados en este navegador. ¿Continuar?")) return;
    try{
      products = await resetProductsFromDefault();
      render();
      adminMsg.textContent = "Productos reseteados desde data/products.json.";
    }catch(err){
      console.error(err);
      adminMsg.textContent = "No se pudo resetear. Abre con servidor (Live Server / http.server).";
    }
  });
}

function setLoggedIn(on){
  loginSection.classList.toggle("hidden", on);
  panelSection.classList.toggle("hidden", !on);
  logoutBtn.classList.toggle("hidden", !on);
}

function saveSession(on){
  localStorage.setItem(ADMIN_SESSION_KEY, on ? "1" : "0");
}
function isLoggedIn(){
  return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

function readForm(){
  return sanitizeProducts([{
    id: String(p_id.value || "").trim(),
    name: String(p_name.value || "").trim(),
    price: Number(p_price.value || 0),
    image: String(p_image.value || "").trim(),
    category: String(p_category.value || "General").trim(),
    stock: Number(p_stock.value || 0),
    description: String(p_desc.value || "").trim()
  }])[0] || { id:"", name:"", price:0, image:"", category:"General", stock:0, description:"" };
}

function fillForm(p){
  p_id.value = p.id;
  p_name.value = p.name;
  p_price.value = p.price;
  p_image.value = p.image;
  p_category.value = p.category;
  p_stock.value = p.stock;
  p_desc.value = p.description || "";
}

function clearForm(){
  p_id.value = "";
  p_name.value = "";
  p_price.value = "";
  p_image.value = "";
  p_category.value = "";
  p_stock.value = "";
  p_desc.value = "";
}

function removeProduct(id){
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  render();
  adminMsg.textContent = "Producto eliminado.";
}

function render(){
  adminList.innerHTML = "";
  if (!products.length){
    adminList.innerHTML = `<p class="muted">No hay productos.</p>`;
    return;
  }

  for (const p of products){
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div>
        <h3>${escapeHTML(p.name)} <span class="badge">${escapeHTML(p.category)}</span></h3>
        <div class="muted small">ID: ${escapeHTML(p.id)} | Precio: S/ ${Number(p.price).toFixed(2)} | Stock: ${Number(p.stock)}</div>
        <div class="muted small">${escapeHTML(p.description || "")}</div>
      </div>
      <div class="admin-actions">
        <button class="btn" data-edit="${escapeHTML(p.id)}">Editar</button>
        <button class="btn danger" data-del="${escapeHTML(p.id)}">Eliminar</button>
      </div>
    `;

    item.querySelector(`[data-edit="${p.id}"]`)?.addEventListener("click", () => fillForm(p));
    item.querySelector(`[data-del="${p.id}"]`)?.addEventListener("click", () => {
      if (!confirm("¿Eliminar este producto?")) return;
      removeProduct(p.id);
    });

    adminList.appendChild(item);
  }
}
