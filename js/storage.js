// js/storage.js
export const DEFAULT_PRODUCTS_URL = "data/products.json";

export const PRODUCTS_KEY = "products_v1";
export const CART_KEY = "cart_v1";
export const ORDERS_KEY = "orders_v1";

export const norm = (s) => (s || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

export function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}

export function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function ensureProductsLoaded() {
  const existing = loadJSON(PRODUCTS_KEY, null);
  if (Array.isArray(existing) && existing.length) return existing;

  const fromDefault = await fetchDefaultProducts();
  saveProducts(fromDefault);
  return fromDefault;
}

export async function fetchDefaultProducts() {
  const res = await fetch(DEFAULT_PRODUCTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${DEFAULT_PRODUCTS_URL} (HTTP ${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json debe ser un arreglo");
  return sanitizeProducts(data);
}

export function loadProducts() {
  const data = loadJSON(PRODUCTS_KEY, []);
  return sanitizeProducts(data);
}

export function saveProducts(products) {
  saveJSON(PRODUCTS_KEY, sanitizeProducts(products));
}

export async function resetProductsFromDefault() {
  const data = await fetchDefaultProducts();
  saveProducts(data);
  return data;
}

export function sanitizeProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(p => p && p.id)
    .map(p => ({
      id: String(p.id),
      name: String(p.name ?? ""),
      price: Number(p.price ?? 0),
      image: String(p.image ?? ""),
      category: String(p.category ?? "General"),
      stock: Math.max(0, Number(p.stock ?? 0)),
      description: String(p.description ?? "")
    }));
}

/* Carrito */
export function loadCart() {
  return loadJSON(CART_KEY, {});
}

export function saveCart(cart) {
  saveJSON(CART_KEY, cart);
}

export function cartCount(cart) {
  return Object.values(cart).reduce((a, x) => a + (Number(x.qty) || 0), 0);
}

/* Pedidos (local) */
export function loadOrders() {
  return loadJSON(ORDERS_KEY, []);
}

export function saveOrder(order) {
  const orders = loadOrders();
  orders.unshift(order);
  saveJSON(ORDERS_KEY, orders);
}

/* Descargas */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ===== NUEVO: Restaurar demo (borra datos locales) ===== */
export function clearDemoLocal() {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(ORDERS_KEY);
}
