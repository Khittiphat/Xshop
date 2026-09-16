/**
 * X Mart Mobile-First Web Frontend Application
 * Interfacing with X Mart Express Backend APIs
 */

// Application State
const state = {
  activeView: 'catalog', // 'catalog' | 'tracking' | 'history'
  categories: [],
  products: [],
  currentCategoryId: 'all',
  searchQuery: '',
  cart: JSON.parse(localStorage.getItem('xmart_cart') || '[]'),
  currentOrderId: null,
  trackedOrder: null,
  userMode: 'guest', // 'guest' | 'member'
  memberProfile: {
    id: 3,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0144',
    address: '742 Evergreen Terrace, Apt 4B'
  }
};

// DOM Element References
const elements = {
  // Navigation
  navCatalog: document.getElementById('nav-catalog-btn'),
  navTracking: document.getElementById('nav-tracking-btn'),
  navHistory: document.getElementById('nav-history-btn'),
  navCart: document.getElementById('nav-cart-btn'),
  headerCart: document.getElementById('header-cart-btn'),
  userModeBtn: document.getElementById('user-mode-btn'),
  userStatusText: document.getElementById('user-status-text'),
  userAvatar: document.getElementById('user-avatar'),
  brandLogo: document.getElementById('brand-logo'),

  // Views
  viewCatalog: document.getElementById('view-catalog'),
  viewTracking: document.getElementById('view-tracking'),
  viewHistory: document.getElementById('view-history'),

  // Catalog
  searchInput: document.getElementById('search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  categoryPills: document.getElementById('category-pills'),
  productsGrid: document.getElementById('products-grid'),
  catalogCountText: document.getElementById('catalog-count-text'),
  catalogFilterBadge: document.getElementById('catalog-filter-badge'),

  // Cart Drawer
  cartDrawer: document.getElementById('cart-drawer'),
  drawerBackdrop: document.getElementById('cart-drawer-backdrop'),
  drawerCloseBtn: document.getElementById('drawer-close-btn'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartEmptyState: document.getElementById('cart-empty-state'),
  drawerItemCount: document.getElementById('drawer-item-count'),
  drawerSubtotal: document.getElementById('drawer-subtotal'),
  drawerTotal: document.getElementById('drawer-total'),
  btnTotalAmount: document.getElementById('btn-total-amount'),
  cartBadge: document.getElementById('cart-badge'),
  navCartBadge: document.getElementById('nav-cart-badge'),

  // Checkout Form
  checkoutForm: document.getElementById('checkout-form'),
  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  toggleGuestMode: document.getElementById('toggle-guest-mode'),
  toggleMemberMode: document.getElementById('toggle-member-mode'),

  // Tracking
  trackOrderIdInput: document.getElementById('track-order-id-input'),
  trackLookupBtn: document.getElementById('track-lookup-btn'),
  trackingCard: document.getElementById('tracking-card'),
  trackingEmpty: document.getElementById('tracking-empty'),
  trackOrderId: document.getElementById('track-order-id'),
  trackOrderDate: document.getElementById('track-order-date'),
  trackStatusPill: document.getElementById('track-status-pill'),
  stepOrdered: document.getElementById('step-ordered'),
  stepOut: document.getElementById('step-out'),
  stepDelivered: document.getElementById('step-delivered'),
  line1: document.getElementById('line-1'),
  line2: document.getElementById('line-2'),
  trackDriverName: document.getElementById('track-driver-name'),
  trackDriverPhone: document.getElementById('track-driver-phone'),
  trackDriverPhoneLink: document.getElementById('track-driver-phone-link'),
  trackCustomerName: document.getElementById('track-customer-name'),
  trackDeliveryAddress: document.getElementById('track-delivery-address'),
  trackPaymentMethod: document.getElementById('track-payment-method'),
  trackItemsList: document.getElementById('track-items-list'),
  trackSubtotal: document.getElementById('track-subtotal'),
  trackTotal: document.getElementById('track-total'),
  cancelOrderBtn: document.getElementById('cancel-order-btn'),
  cancelNote: document.getElementById('cancel-note'),
  simOutForDelivery: document.getElementById('sim-out-for-delivery'),
  simDelivered: document.getElementById('sim-delivered'),
  trackGotoCatalogBtn: document.getElementById('track-goto-catalog-btn'),

  // Member History
  historyOrdersList: document.getElementById('history-orders-list'),
  historyEmpty: document.getElementById('history-empty'),
  historyShopNowBtn: document.getElementById('history-shop-now-btn'),
  historyMemberName: document.getElementById('history-member-name'),
  historyMemberEmail: document.getElementById('history-member-email'),

  // Toasts
  toastContainer: document.getElementById('toast-container')
};

// =========================================================
// Initialization
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
  initEventListeners();
  updateUserModeUI();
  updateCartUI();

  // Load initial data
  await loadCategories();
  await loadProducts();

  // Check URL hash for direct routing
  const hash = window.location.hash.replace('#', '');
  if (['catalog', 'tracking', 'history'].includes(hash)) {
    switchView(hash);
  } else {
    switchView('catalog');
  }
});

// =========================================================
// Event Listeners Setup
// =========================================================
function initEventListeners() {
  // Navigation Tabs
  elements.navCatalog.addEventListener('click', () => switchView('catalog'));
  elements.navTracking.addEventListener('click', () => switchView('tracking'));
  elements.navHistory.addEventListener('click', () => switchView('history'));
  elements.brandLogo.addEventListener('click', () => switchView('catalog'));

  // Listen to browser hash changes (back/forward or deep links)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['catalog', 'tracking', 'history'].includes(hash) && hash !== state.activeView) {
      switchView(hash);
    }
  });

  // Open / Close Cart Drawer
  elements.navCart.addEventListener('click', openCartDrawer);
  elements.headerCart.addEventListener('click', openCartDrawer);
  elements.drawerCloseBtn.addEventListener('click', closeCartDrawer);
  elements.drawerBackdrop.addEventListener('click', closeCartDrawer);

  // Search Input with Debounce
  let searchDebounceTimer;
  elements.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    state.searchQuery = val;
    elements.searchClearBtn.classList.toggle('hidden', !val);

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadProducts();
    }, 300);
  });

  elements.searchClearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.searchClearBtn.classList.add('hidden');
    loadProducts();
  });

  // User Mode Toggle (Guest vs John Doe)
  elements.userModeBtn.addEventListener('click', toggleUserMode);
  elements.toggleGuestMode.addEventListener('click', () => setUserMode('guest'));
  elements.toggleMemberMode.addEventListener('click', () => setUserMode('member'));

  // Checkout Form Submit
  elements.checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  // Tracking Lookup
  elements.trackLookupBtn.addEventListener('click', () => {
    const orderId = Number.parseInt(elements.trackOrderIdInput.value, 10);
    if (orderId > 0) {
      loadOrderDetails(orderId);
    } else {
      showToast('Please enter a valid order ID', 'error');
    }
  });

  elements.trackGotoCatalogBtn?.addEventListener('click', () => switchView('catalog'));
  elements.historyShopNowBtn?.addEventListener('click', () => switchView('catalog'));

  // Cancel Order Button
  elements.cancelOrderBtn.addEventListener('click', handleCancelOrder);

  // Simulation Controls for Driver
  elements.simOutForDelivery.addEventListener('click', () => simulateDriverStatus('OUT_FOR_DELIVERY'));
  elements.simDelivered.addEventListener('click', () => simulateDriverStatus('DELIVERED'));
}

// =========================================================
// View Management
// =========================================================
function switchView(viewName) {
  state.activeView = viewName;
  window.location.hash = viewName;

  // Toggle active view sections
  elements.viewCatalog.classList.toggle('hidden', viewName !== 'catalog');
  elements.viewTracking.classList.toggle('hidden', viewName !== 'tracking');
  elements.viewHistory.classList.toggle('hidden', viewName !== 'history');

  // Update nav item highlights
  elements.navCatalog.classList.toggle('active', viewName === 'catalog');
  elements.navTracking.classList.toggle('active', viewName === 'tracking');
  elements.navHistory.classList.toggle('active', viewName === 'history');

  if (viewName === 'history') {
    loadMemberHistory();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// User Mode (Guest vs Member John Doe)
// =========================================================
function toggleUserMode() {
  const nextMode = state.userMode === 'guest' ? 'member' : 'guest';
  setUserMode(nextMode);
}

function setUserMode(mode) {
  state.userMode = mode;
  updateUserModeUI();

  if (mode === 'member') {
    elements.custName.value = state.memberProfile.name;
    elements.custPhone.value = state.memberProfile.phone;
    elements.custAddress.value = state.memberProfile.address;
    showToast(`Switched to Member: ${state.memberProfile.name}`, 'success');
  } else {
    elements.custName.value = '';
    elements.custPhone.value = '';
    elements.custAddress.value = '';
    showToast('Switched to Guest Checkout mode', 'info');
  }

  if (state.activeView === 'history') {
    loadMemberHistory();
  }
}

function updateUserModeUI() {
  const isMember = state.userMode === 'member';
  elements.userStatusText.textContent = isMember ? 'John D.' : 'Guest';
  elements.userAvatar.textContent = isMember ? '⭐' : '👤';

  elements.toggleGuestMode.classList.toggle('active', !isMember);
  elements.toggleMemberMode.classList.toggle('active', isMember);

  elements.historyMemberName.textContent = state.memberProfile.name;
  elements.historyMemberEmail.textContent = state.memberProfile.email;
}

// =========================================================
// Catalog & Categories API Operations
// =========================================================
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      state.categories = data.data;
      renderCategoryPills();
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function renderCategoryPills() {
  elements.categoryPills.innerHTML = `
    <button class="cat-pill ${state.currentCategoryId === 'all' ? 'active' : ''}" data-category-id="all">
      <span>All Items</span>
    </button>
  `;

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-pill ${state.currentCategoryId === String(cat.id) ? 'active' : ''}`;
    btn.dataset.categoryId = cat.id;
    btn.innerHTML = `<span>${escapeHtml(cat.name)}</span>`;
    btn.addEventListener('click', () => {
      setCategory(cat.id);
    });
    elements.categoryPills.appendChild(btn);
  });

  elements.categoryPills.querySelector('[data-category-id="all"]').addEventListener('click', () => {
    setCategory('all');
  });
}

function setCategory(catId) {
  state.currentCategoryId = String(catId);
  renderCategoryPills();
  loadProducts();
}

async function loadProducts() {
  elements.productsGrid.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  try {
    const params = new URLSearchParams();
    if (state.currentCategoryId !== 'all') {
      params.append('category_id', state.currentCategoryId);
    }
    if (state.searchQuery.trim()) {
      params.append('search', state.searchQuery.trim());
    }

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      state.products = data.data;
      renderProductsGrid();
    } else {
      elements.productsGrid.innerHTML = `<div class="empty-state"><p>No products found.</p></div>`;
      elements.catalogCountText.textContent = '0 items found';
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    elements.productsGrid.innerHTML = `
      <div class="empty-state">
        <p>Failed to load products. Check server connection.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadProducts()">Retry</button>
      </div>
    `;
  }
}

// =========================================================
// Product Icon & Fallback Colored Box Rendering
// =========================================================
const FALLBACK_PALETTE = [
  '#059669', // Emerald
  '#2563EB', // Blue
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DC2626', // Red
  '#0D9488', // Teal
  '#DB2777', // Pink
  '#4F46E5'  // Indigo
];

function getAvatarColor(name) {
  if (!name) return FALLBACK_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_PALETTE.length;
  return FALLBACK_PALETTE[index];
}

function renderProductIconHtml(product, sizeClass = '') {
  if (product.icon && String(product.icon).trim()) {
    return `<div class="product-icon-box ${sizeClass}" aria-hidden="true">${escapeHtml(product.icon)}</div>`;
  }
  // Fallback to a colored CSS box with the first letter of the product name
  const firstLetter = (product.name && product.name.trim().charAt(0).toUpperCase()) || 'X';
  const bgColor = getAvatarColor(product.name);
  return `<div class="product-icon-box fallback-avatar ${sizeClass}" style="background-color: ${bgColor};" aria-hidden="true">${escapeHtml(firstLetter)}</div>`;
}

function renderProductsGrid() {
  const count = state.products.length;
  elements.catalogCountText.textContent = `${count} item${count === 1 ? '' : 's'} available`;
  elements.catalogFilterBadge.classList.toggle('hidden', state.currentCategoryId === 'all' && !state.searchQuery);

  if (count === 0) {
    elements.productsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No matching items</h3>
        <p>Try searching for something else like "tea", "chips", or "ramen".</p>
      </div>
    `;
    return;
  }

  elements.productsGrid.innerHTML = '';

  state.products.forEach(prod => {
    const itemRow = document.createElement('article');
    itemRow.className = 'product-list-row';
    itemRow.id = `product-row-${prod.id}`;

    const iconHtml = renderProductIconHtml(prod);

    itemRow.innerHTML = `
      <div class="product-icon-wrap">
        ${iconHtml}
      </div>
      <div class="product-info-col">
        <h3 class="product-row-title" title="${escapeHtml(prod.name)}">${escapeHtml(prod.name)}</h3>
        <div class="product-row-sub">
          <span class="product-cat-pill">${escapeHtml(prod.category_name)}</span>
          ${prod.description ? `<span class="product-desc-snippet">${escapeHtml(prod.description)}</span>` : ''}
        </div>
      </div>
      <div class="product-action-col">
        <span class="product-row-price">$${prod.price.toFixed(2)}</span>
        <button class="btn-add-quick" data-id="${prod.id}" aria-label="Add ${escapeHtml(prod.name)} to cart">
          + Add
        </button>
      </div>
    `;

    const addBtn = itemRow.querySelector('.btn-add-quick');
    addBtn.addEventListener('click', () => {
      addToCart(prod);
    });

    elements.productsGrid.appendChild(itemRow);
  });
}

// =========================================================
// Shopping Cart & Drawer Operations
// =========================================================
function addToCart(product) {
  const existing = state.cart.find(item => item.product.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      product: product,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${product.name} to cart!`, 'success');
}

function updateCartQuantity(productId, delta) {
  const index = state.cart.findIndex(item => item.product.id === productId);
  if (index === -1) return;

  const newQty = state.cart[index].quantity + delta;
  if (newQty <= 0) {
    removeFromCart(productId);
  } else {
    state.cart[index].quantity = newQty;
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.product.id !== productId);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart', 'info');
}

function saveCart() {
  localStorage.setItem('xmart_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Update badges
  elements.cartBadge.textContent = totalItems;
  elements.navCartBadge.textContent = totalItems;
  elements.drawerItemCount.textContent = totalItems;

  const hasItems = totalItems > 0;
  elements.cartBadge.classList.toggle('hidden', !hasItems);
  elements.navCartBadge.classList.toggle('hidden', !hasItems);

  // Update Drawer Totals (Free Shipping 0 THB)
  const formattedSubtotal = `$${subtotal.toFixed(2)}`;
  elements.drawerSubtotal.textContent = formattedSubtotal;
  elements.drawerTotal.textContent = formattedSubtotal;
  elements.btnTotalAmount.textContent = formattedSubtotal;

  renderDrawerCartItems();
}

function renderDrawerCartItems() {
  const container = elements.cartItemsContainer;
  container.innerHTML = '';

  if (state.cart.length === 0) {
    elements.cartEmptyState.classList.remove('hidden');
    elements.checkoutForm.classList.add('hidden');
    return;
  }

  elements.cartEmptyState.classList.add('hidden');
  elements.checkoutForm.classList.remove('hidden');

  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    const lineTotal = (item.product.price * item.quantity).toFixed(2);
    const iconHtml = renderProductIconHtml(item.product, 'icon-sm');

    row.innerHTML = `
      <div class="cart-item-icon-wrap">
        ${iconHtml}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title">${escapeHtml(item.product.name)}</div>
        <div class="cart-item-unit-price">$${item.product.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty btn-minus" data-id="${item.product.id}" aria-label="Decrease quantity">−</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="btn-qty btn-plus" data-id="${item.product.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-subtotal">$${lineTotal}</div>
      <button class="btn-remove-item" data-id="${item.product.id}" aria-label="Remove item">✕</button>
    `;

    row.querySelector('.btn-minus').addEventListener('click', () => updateCartQuantity(item.product.id, -1));
    row.querySelector('.btn-plus').addEventListener('click', () => updateCartQuantity(item.product.id, 1));
    row.querySelector('.btn-remove-item').addEventListener('click', () => removeFromCart(item.product.id));

    container.appendChild(row);
  });
}

function openCartDrawer() {
  updateCartUI();
  elements.cartDrawer.classList.add('open');
  elements.drawerBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  elements.cartDrawer.classList.remove('open');
  elements.drawerBackdrop.classList.add('hidden');
  document.body.style.overflow = '';
}

// =========================================================
// Checkout & Order Placement
// =========================================================
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (state.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const customerName = elements.custName.value.trim();
  const customerPhone = elements.custPhone.value.trim();
  const deliveryAddress = elements.custAddress.value.trim();

  const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'CASH';

  const submitBtn = document.getElementById('place-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing Order...';

  const orderPayload = {
    user_id: state.userMode === 'member' ? state.memberProfile.id : null,
    customer_name: customerName,
    customer_phone: customerPhone,
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    items: state.cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (res.status === 201 && data.success) {
      // Clear Cart
      state.cart = [];
      saveCart();
      updateCartUI();
      closeCartDrawer();

      const newOrder = data.data;
      state.currentOrderId = newOrder.id;

      showToast(`Order #${newOrder.id} placed! Driver dispatched.`, 'success');

      // Switch to tracking view and load order details
      switchView('tracking');
      loadOrderDetails(newOrder.id);
    } else {
      showToast(data.error || 'Failed to place order. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Network error during checkout.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Place Order • <span id="btn-total-amount">$0.00</span>`;
    updateCartUI();
  }
}

// =========================================================
// Order Tracking View
// =========================================================
async function loadOrderDetails(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();

    if (data.success && data.data) {
      state.trackedOrder = data.data;
      renderTrackingDetails(data.data);
    } else {
      elements.trackingCard.classList.add('hidden');
      elements.trackingEmpty.classList.remove('hidden');
      showToast(data.error || 'Order not found.', 'error');
    }
  } catch (err) {
    console.error('Failed to load order details:', err);
    showToast('Failed to fetch order tracking info.', 'error');
  }
}

function renderTrackingDetails(order) {
  elements.trackingEmpty.classList.add('hidden');
  elements.trackingCard.classList.remove('hidden');

  elements.trackOrderId.textContent = order.id;
  elements.trackOrderDate.textContent = new Date(order.created_at || Date.now()).toLocaleString();
  elements.trackCustomerName.textContent = order.customer_name;
  elements.trackDeliveryAddress.textContent = order.delivery_address;
  elements.trackPaymentMethod.textContent = order.payment_method;

  // Driver details
  const driverName = (order.driver && order.driver.name) || order.driver_name || 'Somchai Express';
  const driverPhone = (order.driver && order.driver.phone) || order.driver_phone || '+66-81-234-5678';

  elements.trackDriverName.textContent = driverName;
  elements.trackDriverPhone.textContent = driverPhone;
  elements.trackDriverPhoneLink.href = `tel:${driverPhone}`;

  // Status Badge
  const status = order.status;
  elements.trackStatusPill.textContent = status;
  elements.trackStatusPill.className = `status-pill status-${status.toLowerCase().replace(/_/g, '-')}`;

  // Stepper Visual State
  const isDelivered = status === 'DELIVERED';
  const isOut = status === 'OUT_FOR_DELIVERY' || isDelivered;
  const isCancelled = status === 'CANCELLED';

  elements.stepOrdered.classList.toggle('active', !isCancelled);
  elements.stepOut.classList.toggle('active', isOut && !isCancelled);
  elements.stepDelivered.classList.toggle('active', isDelivered);
  elements.line1.classList.toggle('active', isOut && !isCancelled);
  elements.line2.classList.toggle('active', isDelivered);

  // Cancellation Button State
  if (isDelivered) {
    elements.cancelOrderBtn.disabled = true;
    elements.cancelOrderBtn.textContent = 'Order Delivered (Cannot Cancel)';
    elements.cancelNote.textContent = 'Orders cannot be cancelled once delivered. No refunds per policy.';
  } else if (isCancelled) {
    elements.cancelOrderBtn.disabled = true;
    elements.cancelOrderBtn.textContent = 'Order Cancelled';
    elements.cancelNote.textContent = 'This order was cancelled.';
  } else {
    elements.cancelOrderBtn.disabled = false;
    elements.cancelOrderBtn.textContent = '✕ Cancel Order';
    elements.cancelNote.textContent = 'Cancellation is permitted until the courier marks the order as Delivered.';
  }

  // Render Immutable Items Summary
  elements.trackItemsList.innerHTML = '';
  if (Array.isArray(order.items)) {
    order.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'track-item-row';
      row.innerHTML = `
        <span class="track-item-name">${escapeHtml(item.product_name)}</span>
        <span class="track-item-qty">x${item.quantity}</span>
        <span class="track-item-price">$${Number(item.subtotal || (item.unit_price * item.quantity)).toFixed(2)}</span>
      `;
      elements.trackItemsList.appendChild(row);
    });
  }

  const total = Number(order.total_amount || (order.pricing && order.pricing.total_amount) || 0).toFixed(2);
  elements.trackSubtotal.textContent = `$${total}`;
  elements.trackTotal.textContent = `$${total}`;
}

async function handleCancelOrder() {
  if (!state.trackedOrder) return;
  const orderId = state.trackedOrder.id;

  if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Order #${orderId} has been cancelled.`, 'info');
      loadOrderDetails(orderId);
    } else {
      showToast(data.error || 'Unable to cancel order.', 'error');
    }
  } catch (err) {
    console.error('Cancel order error:', err);
    showToast('Failed to contact server to cancel order.', 'error');
  }
}

// Staff / Driver Simulation Function
async function simulateDriverStatus(newStatus) {
  if (!state.trackedOrder) {
    showToast('No active order selected to update status.', 'error');
    return;
  }

  const orderId = state.trackedOrder.id;

  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Driver status transitioned to ${newStatus}`, 'success');
      loadOrderDetails(orderId);
    } else {
      showToast(data.error || 'Failed to update status', 'error');
    }
  } catch (err) {
    console.error('Driver simulation error:', err);
    showToast('Status update failed.', 'error');
  }
}

// =========================================================
// Member Order History View
// =========================================================
async function loadMemberHistory() {
  elements.historyOrdersList.innerHTML = `
    <div class="skeleton-card" style="height: 90px; margin-bottom: 8px;"></div>
    <div class="skeleton-card" style="height: 90px;"></div>
  `;

  try {
    const userId = state.memberProfile.id;
    const res = await fetch(`/api/orders/user/${userId}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      elements.historyEmpty.classList.add('hidden');
      renderHistoryList(data.data);
    } else {
      elements.historyOrdersList.innerHTML = '';
      elements.historyEmpty.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    elements.historyOrdersList.innerHTML = `<p class="help-text">Failed to load order history.</p>`;
  }
}

function renderHistoryList(orders) {
  elements.historyOrdersList.innerHTML = '';

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'history-order-card';
    const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const itemsSummary = order.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ');

    card.innerHTML = `
      <div class="history-card-top">
        <strong>Order #${order.id}</strong>
        <span class="status-pill status-${order.status.toLowerCase().replace(/_/g, '-')}">${order.status}</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">${dateStr}</div>
      <div style="font-size: 0.78rem; line-height: 1.3; margin-bottom: 6px; color: var(--text-main);">
        ${escapeHtml(itemsSummary)}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border); padding-top: 6px; margin-top: 6px;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">${order.payment_method} • Free Delivery</span>
        <span class="history-order-total">$${Number(order.total_amount).toFixed(2)}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      switchView('tracking');
      loadOrderDetails(order.id);
    });

    elements.historyOrdersList.appendChild(card);
  });
}

// =========================================================
// Toast Notification Utility
// =========================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Security helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
