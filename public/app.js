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
  currentUser: JSON.parse(localStorage.getItem('xmart_user') || 'null'),
  authToken: localStorage.getItem('xmart_token') || null,
  guestOrderIds: JSON.parse(localStorage.getItem('xmart_guest_orders') || '[]')
};

// DOM Element References
const elements = {
  // Navigation
  navCatalog: document.getElementById('nav-catalog-btn'),
  navTracking: document.getElementById('nav-tracking-btn'),
  navHistory: document.getElementById('nav-history-btn'),
  navCart: document.getElementById('nav-cart-btn'),
  headerCart: document.getElementById('header-cart-btn'),
  authHeaderBtn: document.getElementById('auth-header-btn'),
  userStatusText: document.getElementById('user-status-text'),
  userAvatar: document.getElementById('user-avatar'),
  userDropdownMenu: document.getElementById('user-dropdown-menu'),
  dropdownUserName: document.getElementById('dropdown-user-name'),
  dropdownUserEmail: document.getElementById('dropdown-user-email'),
  dropdownHistoryBtn: document.getElementById('dropdown-history-btn'),
  dropdownLogoutBtn: document.getElementById('dropdown-logout-btn'),
  brandLogo: document.getElementById('brand-logo'),

  // Views
  viewCatalog: document.getElementById('view-catalog'),
  viewTracking: document.getElementById('view-tracking'),
  viewHistory: document.getElementById('view-history'),
  viewAnalytics: document.getElementById('view-analytics'),

  // Admin Analytics Controls
  adminAnalyticsBtn: document.getElementById('admin-analytics-btn'),
  analyticsCloseBtn: document.getElementById('analytics-close-btn'),
  salesStartDate: document.getElementById('sales-start-date'),
  salesEndDate: document.getElementById('sales-end-date'),
  salesFilterApplyBtn: document.getElementById('sales-filter-apply-btn'),
  salesExportCsvBtn: document.getElementById('sales-export-csv-btn'),
  kpiRevenue: document.getElementById('kpi-revenue'),
  kpiOrders: document.getElementById('kpi-orders'),
  kpiAov: document.getElementById('kpi-aov'),
  categoryBreakdownList: document.getElementById('category-breakdown-list'),
  autoscaleRecText: document.getElementById('autoscale-rec-text'),
  hourlyBarChart: document.getElementById('hourly-bar-chart'),
  hourlyTableBody: document.getElementById('hourly-table-body'),

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

  // Checkout Form & Delivery Information
  checkoutForm: document.getElementById('checkout-form'),
  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  checkoutAuthBanner: document.getElementById('checkout-auth-banner'),
  checkoutAuthStatus: document.getElementById('checkout-auth-status'),
  checkoutAuthActionBtn: document.getElementById('checkout-auth-action-btn'),

  // Authentication Modal
  authModal: document.getElementById('auth-modal'),
  authModalBackdrop: document.getElementById('auth-modal-backdrop'),
  closeAuthModalBtn: document.getElementById('close-auth-modal-btn'),
  authTabLogin: document.getElementById('auth-tab-login'),
  authTabRegister: document.getElementById('auth-tab-register'),
  authLoginPanel: document.getElementById('auth-login-panel'),
  authRegisterPanel: document.getElementById('auth-register-panel'),
  authLoginForm: document.getElementById('auth-login-form'),
  authRegisterForm: document.getElementById('auth-register-form'),
  loginIdentifier: document.getElementById('login-identifier'),
  loginPassword: document.getElementById('login-password'),
  loginSubmitBtn: document.getElementById('login-submit-btn'),
  regName: document.getElementById('reg-name'),
  regPhone: document.getElementById('reg-phone'),
  regEmail: document.getElementById('reg-email'),
  regPassword: document.getElementById('reg-password'),
  regSubmitBtn: document.getElementById('reg-submit-btn'),
  switchToRegisterBtn: document.getElementById('switch-to-register-btn'),
  switchToLoginBtn: document.getElementById('switch-to-login-btn'),

  // Payment Gateway Modal
  paymentModal: document.getElementById('payment-modal'),
  paymentModalBackdrop: document.getElementById('payment-modal-backdrop'),
  closePaymentModalBtn: document.getElementById('close-payment-modal-btn'),
  paymentQrSection: document.getElementById('payment-qr-section'),
  paymentCashSection: document.getElementById('payment-cash-section'),
  qrModalAmount: document.getElementById('qr-modal-amount'),
  cashModalAmount: document.getElementById('cash-modal-amount'),
  cashRecipientSummary: document.getElementById('cash-recipient-summary'),
  confirmPaymentCompletedBtn: document.getElementById('confirm-payment-completed-btn'),
  cancelQrModalBtn: document.getElementById('cancel-qr-modal-btn'),
  confirmCashOrderBtn: document.getElementById('confirm-cash-order-btn'),
  cancelCashModalBtn: document.getElementById('cancel-cash-modal-btn'),
  qrTimerCountdown: document.getElementById('qr-timer-countdown'),

  // Digital Receipt Modal
  receiptModal: document.getElementById('receipt-modal'),
  receiptModalBackdrop: document.getElementById('receipt-modal-backdrop'),
  closeReceiptModalBtn: document.getElementById('close-receipt-modal-btn'),
  receiptCloseBtn: document.getElementById('receipt-close-btn'),
  receiptPrintBtn: document.getElementById('receipt-print-btn'),
  receiptCopyIdBtn: document.getElementById('receipt-copy-id-btn'),
  receiptOrderId: document.getElementById('receipt-order-id'),
  receiptTimestamp: document.getElementById('receipt-timestamp'),
  receiptCustomerName: document.getElementById('receipt-customer-name'),
  receiptPaymentMethod: document.getElementById('receipt-payment-method'),
  receiptItemsList: document.getElementById('receipt-items-list'),
  receiptSubtotal: document.getElementById('receipt-subtotal'),
  receiptTotalAmount: document.getElementById('receipt-total-amount'),

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
  simPending: document.getElementById('sim-pending'),
  simOutForDelivery: document.getElementById('sim-out-for-delivery'),
  simDelivered: document.getElementById('sim-delivered'),
  trackGotoCatalogBtn: document.getElementById('track-goto-catalog-btn'),

  // Order History Elements
  historyViewTitle: document.getElementById('history-view-title'),
  historyProfileCard: document.getElementById('history-profile-card'),
  historyAvatar: document.getElementById('history-avatar'),
  historyOrdersList: document.getElementById('history-orders-list'),
  historyEmpty: document.getElementById('history-empty'),
  historyEmptyTitle: document.getElementById('history-empty-title'),
  historyEmptyDesc: document.getElementById('history-empty-desc'),
  historyShopNowBtn: document.getElementById('history-shop-now-btn'),
  historyLoginPromptBtn: document.getElementById('history-login-prompt-btn'),
  historyMemberName: document.getElementById('history-member-name'),
  historyMemberEmail: document.getElementById('history-member-email'),
  historyMemberBadge: document.getElementById('history-member-badge'),
  historyAuthActionBtn: document.getElementById('history-auth-action-btn'),

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
  if (['catalog', 'tracking', 'history', 'analytics'].includes(hash)) {
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

  // Admin Analytics Navigation
  elements.adminAnalyticsBtn?.addEventListener('click', () => switchView('analytics'));
  elements.analyticsCloseBtn?.addEventListener('click', () => switchView('catalog'));

  // Sales Date Range Filter & Presets
  elements.salesFilterApplyBtn?.addEventListener('click', () => {
    loadSalesReport(elements.salesStartDate.value, elements.salesEndDate.value);
  });
  elements.salesExportCsvBtn?.addEventListener('click', exportSalesReportToCsv);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      applyDatePreset(e.currentTarget.dataset.preset);
    });
  });

  // Listen to browser hash changes (back/forward or deep links)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['catalog', 'tracking', 'history', 'analytics'].includes(hash) && hash !== state.activeView) {
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

  // User Account & Authentication Triggers (Direct Listeners + Event Delegation)
  elements.authHeaderBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!state.currentUser) {
      openAuthModal('login');
    } else {
      toggleUserDropdown(e);
    }
  });

  elements.dropdownHistoryBtn?.addEventListener('click', () => {
    closeUserDropdown();
    switchView('history');
  });
  elements.dropdownLogoutBtn?.addEventListener('click', logout);
  elements.checkoutAuthActionBtn?.addEventListener('click', () => openAuthModal('login'));
  elements.historyAuthActionBtn?.addEventListener('click', () => {
    if (state.currentUser) {
      logout();
    } else {
      openAuthModal('login');
    }
  });
  elements.historyLoginPromptBtn?.addEventListener('click', () => openAuthModal('login'));

  // Global Event Delegation for dynamically rendered login buttons and links across the app
  document.addEventListener('click', (e) => {
    const loginTrigger = e.target.closest(
      '#auth-header-btn, #checkout-auth-action-btn, #history-auth-action-btn, #history-login-prompt-btn, .open-login-btn, [data-action="open-login"], [data-action="login"]'
    );

    if (loginTrigger) {
      if (loginTrigger.id === 'auth-header-btn') {
        if (!state.currentUser) {
          e.preventDefault();
          e.stopPropagation();
          openAuthModal('login');
        }
        return;
      }

      if (loginTrigger.id === 'history-auth-action-btn') {
        if (state.currentUser) {
          logout();
        } else {
          e.preventDefault();
          openAuthModal('login');
        }
        return;
      }

      e.preventDefault();
      openAuthModal('login');
      return;
    }

    // Close user dropdown when clicking outside
    if (!elements.authHeaderBtn?.contains(e.target) && !elements.userDropdownMenu?.contains(e.target)) {
      closeUserDropdown();
    }
  });

  // Auth Modal Listeners
  elements.closeAuthModalBtn?.addEventListener('click', closeAuthModal);
  elements.authModalBackdrop?.addEventListener('click', closeAuthModal);
  elements.authTabLogin?.addEventListener('click', () => switchAuthTab('login'));
  elements.authTabRegister?.addEventListener('click', () => switchAuthTab('register'));
  elements.switchToRegisterBtn?.addEventListener('click', () => switchAuthTab('register'));
  elements.switchToLoginBtn?.addEventListener('click', () => switchAuthTab('login'));
  elements.authLoginForm?.addEventListener('submit', handleLoginSubmit);
  elements.authRegisterForm?.addEventListener('submit', handleRegisterSubmit);

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

  // Payment Gateway Modal Event Listeners
  elements.closePaymentModalBtn?.addEventListener('click', closePaymentModal);
  elements.paymentModalBackdrop?.addEventListener('click', closePaymentModal);
  elements.cancelQrModalBtn?.addEventListener('click', closePaymentModal);
  elements.cancelCashModalBtn?.addEventListener('click', closePaymentModal);
  elements.confirmPaymentCompletedBtn?.addEventListener('click', finalizeOrderPlacement);
  elements.confirmCashOrderBtn?.addEventListener('click', finalizeOrderPlacement);

  // Digital Receipt Modal Listeners
  elements.closeReceiptModalBtn?.addEventListener('click', closeDigitalReceiptModal);
  elements.receiptModalBackdrop?.addEventListener('click', closeDigitalReceiptModal);
  elements.receiptCloseBtn?.addEventListener('click', closeDigitalReceiptModal);
  elements.receiptPrintBtn?.addEventListener('click', () => window.print());

  // Simulation Controls for Status Transitions (Pending -> Out for Delivery -> Delivered)
  elements.simPending?.addEventListener('click', () => simulateDriverStatus('PENDING'));
  elements.simOutForDelivery?.addEventListener('click', () => simulateDriverStatus('OUT_FOR_DELIVERY'));
  elements.simDelivered?.addEventListener('click', () => simulateDriverStatus('DELIVERED'));
}

// =========================================================
// View Management
// =========================================================
function switchView(viewName) {
  // Guard Admin Analytics View against unauthorized access
  if (viewName === 'analytics') {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      showToast('Access Denied: Administrator role required', 'error');
      switchView('catalog');
      return;
    }
  }

  state.activeView = viewName;
  window.location.hash = viewName;

  // Toggle active view sections
  elements.viewCatalog.classList.toggle('hidden', viewName !== 'catalog');
  elements.viewTracking.classList.toggle('hidden', viewName !== 'tracking');
  elements.viewHistory.classList.toggle('hidden', viewName !== 'history');
  elements.viewAnalytics.classList.toggle('hidden', viewName !== 'analytics');

  // Update nav item highlights
  elements.navCatalog.classList.toggle('active', viewName === 'catalog');
  elements.navTracking.classList.toggle('active', viewName === 'tracking');
  elements.navHistory.classList.toggle('active', viewName === 'history');
  elements.adminAnalyticsBtn?.classList.toggle('active', viewName === 'analytics');

  if (viewName === 'history') {
    loadMemberHistory();
  } else if (viewName === 'analytics') {
    loadAnalyticsDashboard();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// Real Authentication & Session Management
// =========================================================
function updateUserModeUI() {
  const user = state.currentUser;
  const isMember = Boolean(user);

  // Admin button visibility (strictly restricted to role === 'admin')
  const isAdmin = isMember && user.role === 'admin';
  if (elements.adminAnalyticsBtn) {
    elements.adminAnalyticsBtn.classList.toggle('hidden', !isAdmin);
  }

  // Header Avatar & Name
  if (isMember) {
    const firstName = user.name ? user.name.split(' ')[0] : 'Member';
    elements.userStatusText.textContent = firstName;
    elements.userAvatar.textContent = '⭐';
    if (elements.dropdownUserName) elements.dropdownUserName.textContent = user.name || 'Member';
    if (elements.dropdownUserEmail) elements.dropdownUserEmail.textContent = user.email || user.phone || '';
  } else {
    elements.userStatusText.textContent = 'Login';
    elements.userAvatar.textContent = '👤';
    if (elements.dropdownUserName) elements.dropdownUserName.textContent = 'Guest';
    if (elements.dropdownUserEmail) elements.dropdownUserEmail.textContent = 'Not logged in';
  }

  // Checkout Delivery Section in Cart Drawer
  if (elements.checkoutAuthStatus) {
    if (isMember) {
      elements.checkoutAuthStatus.textContent = `⭐ Logged in as ${user.name}`;
      elements.checkoutAuthBanner?.classList.add('is-member');
      if (elements.checkoutAuthActionBtn) elements.checkoutAuthActionBtn.textContent = 'Switch Account';
      if (!elements.custName.value) elements.custName.value = user.name || '';
      if (!elements.custPhone.value) elements.custPhone.value = user.phone || '';
    } else {
      elements.checkoutAuthStatus.textContent = '👤 Ordering as Guest';
      elements.checkoutAuthBanner?.classList.remove('is-member');
      if (elements.checkoutAuthActionBtn) elements.checkoutAuthActionBtn.textContent = 'Log in to save';
    }
  }

  // History Tab Profile Card
  if (elements.historyMemberName) {
    if (isMember) {
      elements.historyMemberName.textContent = user.name || 'Member';
      elements.historyMemberEmail.textContent = user.email || user.phone || '';
      if (elements.historyMemberBadge) elements.historyMemberBadge.textContent = '⭐ X Mart Member';
      if (elements.historyAvatar) elements.historyAvatar.textContent = '⭐';
      if (elements.historyAuthActionBtn) elements.historyAuthActionBtn.textContent = 'Log Out';
    } else {
      elements.historyMemberName.textContent = 'Local Device Orders';
      elements.historyMemberEmail.textContent = 'Orders placed on this device';
      if (elements.historyMemberBadge) elements.historyMemberBadge.textContent = 'Guest Session';
      if (elements.historyAvatar) elements.historyAvatar.textContent = '👤';
      if (elements.historyAuthActionBtn) elements.historyAuthActionBtn.textContent = 'Log In / Sync';
    }
  }
}

function openAuthModal(initialTab = 'login') {
  closeUserDropdown();
  switchAuthTab(initialTab);
  const modal = elements.authModal || document.getElementById('auth-modal');
  const backdrop = elements.authModalBackdrop || document.getElementById('auth-modal-backdrop');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
  if (backdrop) {
    backdrop.classList.remove('hidden');
    backdrop.style.display = 'block';
  }
}

function closeAuthModal() {
  const modal = elements.authModal || document.getElementById('auth-modal');
  const backdrop = elements.authModalBackdrop || document.getElementById('auth-modal-backdrop');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.style.display = 'none';
  }
}

// Expose globally for inline onclick handlers
window.openAuthModal = openAuthModal;
window.showAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  elements.authTabLogin?.classList.toggle('active', isLogin);
  elements.authTabRegister?.classList.toggle('active', !isLogin);
  elements.authTabLogin?.setAttribute('aria-selected', isLogin ? 'true' : 'false');
  elements.authTabRegister?.setAttribute('aria-selected', !isLogin ? 'true' : 'false');
  elements.authLoginPanel?.classList.toggle('active', isLogin);
  elements.authLoginPanel?.classList.toggle('hidden', !isLogin);
  elements.authRegisterPanel?.classList.toggle('active', !isLogin);
  elements.authRegisterPanel?.classList.toggle('hidden', isLogin);
}

function toggleUserDropdown(e) {
  e?.stopPropagation();
  if (!state.currentUser) {
    openAuthModal('login');
    return;
  }
  elements.userDropdownMenu?.classList.toggle('hidden');
}

function closeUserDropdown() {
  elements.userDropdownMenu?.classList.add('hidden');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = elements.loginIdentifier.value.trim();
  const password = elements.loginPassword.value;

  if (!identifier || !password) {
    showToast('Please enter email/phone and password.', 'error');
    return;
  }

  elements.loginSubmitBtn.disabled = true;
  elements.loginSubmitBtn.textContent = 'Logging in...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.currentUser = data.user;
      state.authToken = data.token;
      localStorage.setItem('xmart_user', JSON.stringify(data.user));
      localStorage.setItem('xmart_token', data.token);

      updateUserModeUI();
      closeAuthModal();
      elements.authLoginForm.reset();
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      if (state.activeView === 'history') {
        loadMemberHistory();
      }
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Network error during login.', 'error');
  } finally {
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.textContent = 'Log In';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = elements.regName.value.trim();
  const phone = elements.regPhone.value.trim();
  const email = elements.regEmail.value.trim();
  const password = elements.regPassword.value;

  if (!name || !phone || !email || !password) {
    showToast('Please fill out all registration fields.', 'error');
    return;
  }

  elements.regSubmitBtn.disabled = true;
  elements.regSubmitBtn.textContent = 'Creating account...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      state.currentUser = data.user;
      state.authToken = data.token;
      localStorage.setItem('xmart_user', JSON.stringify(data.user));
      localStorage.setItem('xmart_token', data.token);

      updateUserModeUI();
      closeAuthModal();
      elements.authRegisterForm.reset();
      showToast(`Account created! Welcome, ${data.user.name}.`, 'success');

      if (state.activeView === 'history') {
        loadMemberHistory();
      }
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showToast('Network error during registration.', 'error');
  } finally {
    elements.regSubmitBtn.disabled = false;
    elements.regSubmitBtn.textContent = 'Create Account';
  }
}

async function logout() {
  closeUserDropdown();
  if (state.authToken) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.authToken}` }
    }).catch(() => {});
  }

  state.currentUser = null;
  state.authToken = null;
  localStorage.removeItem('xmart_user');
  localStorage.removeItem('xmart_token');

  updateUserModeUI();
  showToast('Logged out successfully.', 'info');

  if (state.activeView === 'history') {
    loadMemberHistory();
  }
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

// =========================================================
// =========================================================
// Currency Formatter (THB) - Handles up to Billions cleanly
// =========================================================
function formatTHB(amount) {
  const num = Number(amount) || 0;
  return '฿' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =========================================================
// Smart Keyword Asset & Curated Image Mapper
// Maps search queries to semantic English photo queries and icons
// =========================================================
const KEYWORD_IMAGE_MAP = [
  // 1. Mega Vehicles / Industrial / Marine / Aviation
  { regex: /เรือดำน้ำ|submarine/i, query: 'military-submarine', icon: '⚓', fallbackImg: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop&q=80' },
  { regex: /รถถัง|tank/i, query: 'military-tank', icon: '🛡️', fallbackImg: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80' },
  { regex: /เครื่องบิน|airplane|jet|helicopter|เฮลิคอปเตอร์/i, query: 'commercial-airplane,jet', icon: '✈️', fallbackImg: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&auto=format&fit=crop&q=80' },
  { regex: /เรือยอชต์|เรือยอร์ช|yacht|เรือสำราญ|cruise/i, query: 'luxury-yacht', icon: '🛥️', fallbackImg: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&auto=format&fit=crop&q=80' },
  { regex: /ยานอวกาศ|spaceship|rocket/i, query: 'rocket-spacecraft', icon: '🚀', fallbackImg: 'https://images.unsplash.com/photo-1517976487507-5b3b113295c2?w=400&auto=format&fit=crop&q=80' },

  // 2. Real Estate / Buildings
  { regex: /เกาะ|island/i, query: 'tropical-island-aerial', icon: '🏝️', fallbackImg: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&auto=format&fit=crop&q=80' },
  { regex: /คอนโด|condo|condominium|ห้องชุด|apartment/i, query: 'luxury-condo-apartment', icon: '🏢', fallbackImg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80' },
  { regex: /บ้าน|house|คฤหาสน์|mansion|วิลล่า|villa/i, query: 'luxury-modern-house', icon: '🏡', fallbackImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&auto=format&fit=crop&q=80' },
  { regex: /ที่ดิน|land/i, query: 'landscape-nature', icon: '🏞️', fallbackImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80' },
  { regex: /ตึก|building|โรงแรม|hotel/i, query: 'modern-skyscraper', icon: '🏙️', fallbackImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80' },

  // 3. Firearms / Tactical / Hunting
  { regex: /sniper|สไนเปอร์|rifle|ปืนยาว/i, query: 'tactical-rifle', icon: '🎯', fallbackImg: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=400&auto=format&fit=crop&q=80' },
  { regex: /shotgun|ลูกซอง/i, query: 'tactical-shotgun', icon: '💥', fallbackImg: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80' },
  { regex: /ปืน|gun|pistol|revolver|ปืนพก|ปืนสั้น|firearm/i, query: 'tactical-handgun', icon: '🔫', fallbackImg: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&auto=format&fit=crop&q=80' },
  { regex: /มีดเดินป่า|มีดพก|tactical\s*knife|hunting\s*knife/i, query: 'tactical-knife', icon: '🗡️', fallbackImg: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=400&auto=format&fit=crop&q=80' },

  // 4. Luxury / Precious Metals
  { regex: /rolex|patek|นาฬิกาหรู|luxury\s*watch/i, query: 'luxury-rolex-watch', icon: '⌚', fallbackImg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80' },
  { regex: /เพชร|diamond|ruby|มรกต|emerald/i, query: 'sparkling-diamond', icon: '💎', fallbackImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทอง|ทองคำ|gold|ทองแท่ง/i, query: 'gold-bars', icon: '🪙', fallbackImg: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80' },
  { regex: /hermes|chanel|louis\s*vuitton|แบรนด์เนม/i, query: 'luxury-handbag', icon: '👜', fallbackImg: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80' },

  // 5. High-End Tech / Computing / Gadgets
  { regex: /เซิร์ฟเวอร์|server|datacenter/i, query: 'datacenter-server-rack', icon: '🗄️', fallbackImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80' },
  { regex: /การ์ดจอ|gpu|rtx|geforce/i, query: 'graphics-card-gpu', icon: '🎮', fallbackImg: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&auto=format&fit=crop&q=80' },
  { regex: /macbook|mac\s*studio|imac/i, query: 'macbook-laptop', icon: '💻', fallbackImg: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80' },
  { regex: /iphone|ไอโฟน|ipad|ไอแพด|smartphone|มือถือ/i, query: 'iphone-smartphone', icon: '📱', fallbackImg: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80' },
  { regex: /คอม|คอมพิวเตอร์|computer|pc|laptop|โน้ตบุ๊ค|โน้ตบุ๊ก|gaming/i, query: 'desktop-computer,gaming-pc', icon: '🖥️', fallbackImg: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&auto=format&fit=crop&q=80' },
  { regex: /playstation|ps5|xbox|nintendo/i, query: 'gaming-console', icon: '🕹️', fallbackImg: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&auto=format&fit=crop&q=80' },

  // 6. Vehicles
  { regex: /supercar|ferrari|lamborghini|porsche|ซูเปอร์คาร์/i, query: 'supercar,exotic-car', icon: '🏎️', fallbackImg: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&auto=format&fit=crop&q=80' },
  { regex: /bmw|mercedes|benz|audi|tesla|lexus|รถหรู/i, query: 'luxury-sedan', icon: '🚘', fallbackImg: 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=400&auto=format&fit=crop&q=80' },
  { regex: /รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|truck|van/i, query: 'luxury-car,automobile', icon: '🚗', fallbackImg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80' },
  { regex: /บิ๊กไบค์|bigbike|ducati|harley/i, query: 'superbike-motorcycle', icon: '🏍️', fallbackImg: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80' },
  { regex: /รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|scooter|bike/i, query: 'motorcycle', icon: '🛵', fallbackImg: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80' },

  // 7. Home Appliances / Furniture
  { regex: /ตู้เย็น|fridge|refrigerator/i, query: 'modern-refrigerator', icon: '🧊', fallbackImg: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทีวี|โทรทัศน์|tv|television/i, query: '4k-smart-tv', icon: '📺', fallbackImg: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=80' },
  { regex: /โซฟา|sofa/i, query: 'living-room-sofa', icon: '🛋️', fallbackImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80' },
  { regex: /เตียง|bed|ที่นอน|mattress/i, query: 'luxury-bedroom-bed', icon: '🛏️', fallbackImg: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80' },
  { regex: /แอร์|air\s*conditioner|เครื่องปรับอากาศ|เครื่องซักผ้า|washing\s*machine/i, query: 'air-conditioner', icon: '❄️', fallbackImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80' },
  { regex: /โต๊ะ|table|เก้าอี้|chair|ตู้เสื้อผ้า/i, query: 'modern-furniture', icon: '🪑', fallbackImg: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&auto=format&fit=crop&q=80' },

  // 8. Water & Drinks
  { regex: /น้ำเปล่า|น้ำดื่ม|น้ำสิงห์|น้ำทิพย์|น้ำแร่|water/i, query: 'water-bottle', icon: '💧', fallbackImg: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80' },
  { regex: /น้ำแข็ง|ice/i, query: 'ice-cubes', icon: '🧊', fallbackImg: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?w=400&auto=format&fit=crop&q=80' },
  { regex: /โค้ก|เป๊ปซี่|coke|cola|pepsi|น้ำอัดลม|soda/i, query: 'coca-cola,soda', icon: '🥤', fallbackImg: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
  { regex: /ชา|ชาเขียว|ชาไทย|tea|matcha/i, query: 'green-tea', icon: '🍵', fallbackImg: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80' },
  { regex: /กาแฟ|coffee|latte|espresso/i, query: 'coffee', icon: '☕', fallbackImg: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80' },
  { regex: /นม|นมสด|milk/i, query: 'milk-bottle', icon: '🥛', fallbackImg: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },

  // 9. Instant Food & Groceries
  { regex: /มาม่า|ไวไว|ยำยำ|บะหมี่|ราเมง|noodle|ramen/i, query: 'instant-noodles,ramen', icon: '🍜', fallbackImg: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80' },
  { regex: /ไข่|ไข่ไก่|ไข่เป็ด|ไข่ต้ม|egg/i, query: 'fresh-eggs,eggs', icon: '🥚', fallbackImg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80' },
  { regex: /ข้าวสาร|ข้าว|ข้าวหอมมะลิ|rice/i, query: 'white-rice', icon: '🌾', fallbackImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80' },
  { regex: /ขนมปัง|bread|แซนวิช|sandwich/i, query: 'fresh-bread', icon: '🥪', fallbackImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80' },
  { regex: /ข้าวกล่อง|กะเพรา|อาหาร|ready\s*meal|bento/i, query: 'thai-food,meal', icon: '🍛', fallbackImg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80' },
  { regex: /เลย์|มันฝรั่ง|chips|pringles/i, query: 'potato-chips', icon: '🥔', fallbackImg: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80' },
  { regex: /ขนม|snack|คุกกี้|cookie|oreo/i, query: 'cookies,snack', icon: '🍪', fallbackImg: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80' },
  { regex: /สบู่|soap/i, query: 'organic-soap,soap', icon: '🧼', fallbackImg: 'https://images.unsplash.com/photo-1607006314144-8848c4d29362?w=400&auto=format&fit=crop&q=80' },
  { regex: /แชมพู|shampoo/i, query: 'shampoo-bottle', icon: '🧴', fallbackImg: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80' },
  { regex: /ยาสีฟัน|toothpaste/i, query: 'toothpaste', icon: '🪥', fallbackImg: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทิชชู่|tissue/i, query: 'tissue-paper', icon: '🧻', fallbackImg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80' }
];

function resolveDynamicAsset(keyword) {
  const clean = (keyword || '').trim();
  for (const item of KEYWORD_IMAGE_MAP) {
    if (item.regex.test(clean)) {
      return {
        image_url: item.fallbackImg,
        icon: item.icon
      };
    }
  }

  // Fallback high quality grocery & convenience image
  return {
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
    icon: '✨'
  };
}

/**
 * Smart Heuristic & Tier-Based Pricing Generator
 * Maps search queries into realistic price brackets
 */
function getClientKeywordHash(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getClientBracketPrice(keyword, min, max, roundTo = 1) {
  const hash = getClientKeywordHash(keyword);
  const ratio = (hash % 1000) / 1000;
  let val = min + (max - min) * ratio;
  if (roundTo >= 1) {
    val = Math.round(val / roundTo) * roundTo;
  }
  return Number(val.toFixed(2));
}

function generatePriceForKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') return 35.00;
  const kw = keyword.toLowerCase().trim();

  // 1. Mega Vehicles / Industrial / Marine / Aviation (฿50M - ฿2.5B)
  if (/เรือดำน้ำ|submarine/i.test(kw)) return 1500000000.00;
  if (/เครื่องบิน|airplane|jet|helicopter|เฮลิคอปเตอร์/i.test(kw)) return 850000000.00;
  if (/เรือยอชต์|เรือยอร์ช|yacht|เรือสำราญ|cruise/i.test(kw)) return 250000000.00;
  if (/รถถัง|tank|ยานเกราะ/i.test(kw)) return 95000000.00;
  if (/ยานอวกาศ|spaceship|rocket/i.test(kw)) return 2200000000.00;
  if (/marine|aviation|industrial\s*plant|โรงงาน|เครื่องจักรกลหนัก/i.test(kw)) {
    return getClientBracketPrice(kw, 50000000, 2500000000, 1000000);
  }

  // 2. Real Estate / Buildings (฿3.5M - ฿50M)
  if (/เกาะ|island|คฤหาสน์|mansion/i.test(kw)) return 45000000.00;
  if (/ตึก|building|วิลล่า|villa|โรงแรม|hotel/i.test(kw)) return 28000000.00;
  if (/บ้าน|house|บ้านเดี่ยว|townhome|ทาวน์โฮม/i.test(kw)) return 8500000.00;
  if (/คอนโด|condo|condominium|ที่ดิน|land|ห้องชุด|apartment/i.test(kw)) return 3800000.00;
  if (/real\s*estate|อสังหา/i.test(kw)) {
    return getClientBracketPrice(kw, 3500000, 50000000, 100000);
  }

  // 3. Firearms / Tactical / Hunting (฿25,000 - ฿180,000)
  if (/sniper|สไนเปอร์|rifle|ปืนยาว/i.test(kw)) return 125000.00;
  if (/shotgun|ลูกซอง/i.test(kw)) return 65000.00;
  if (/pistol|revolver|ปืนพก|ปืนสั้น/i.test(kw)) return 55000.00;
  if (/ปืน|gun|firearm|อาวุธ|weapon/i.test(kw)) return 45000.00;
  if (/มีดเดินป่า|มีดพก|tactical\s*knife|hunting\s*knife/i.test(kw)) return 28500.00;
  if (/tactical|hunting\s*gear/i.test(kw)) {
    return getClientBracketPrice(kw, 25000, 180000, 500);
  }

  // 4. Luxury / Precious Metals (฿40,000 - ฿800,000)
  if (/rolex|patek|นาฬิกาหรู|luxury\s*watch/i.test(kw)) return 450000.00;
  if (/เพชร|diamond|ruby|มรกต|emerald/i.test(kw)) return 250000.00;
  if (/hermes|chanel|louis\s*vuitton|แบรนด์เนม|brandname/i.test(kw)) return 165000.00;
  if (/ทอง|ทองคำ|gold|ทองแท่ง/i.test(kw)) return 45000.00;
  if (/luxury|precious\s*metal|jewelry|อัญมณี/i.test(kw)) {
    return getClientBracketPrice(kw, 40000, 800000, 1000);
  }

  // 5. High-End Tech / Computing / Gadgets (฿12,000 - ฿150,000)
  if (/เซิร์ฟเวอร์|server|datacenter/i.test(kw)) return 129000.00;
  if (/macbook|mac\s*studio|imac|workstation/i.test(kw)) return 69900.00;
  if (/การ์ดจอ|gpu|rtx|geforce/i.test(kw)) return 32900.00;
  if (/iphone|ไอโฟน|ipad|ไอแพด|smartphone|มือถือ/i.test(kw)) return 39900.00;
  if (/คอม|คอมพิวเตอร์|computer|pc|laptop|โน้ตบุ๊ค|โน้ตบุ๊ก|gaming/i.test(kw)) return 42500.00;
  if (/playstation|ps5|xbox|nintendo/i.test(kw)) return 18900.00;
  if (/camera|กล้อง|drone|โดรน/i.test(kw)) {
    return getClientBracketPrice(kw, 12000, 150000, 100);
  }

  // 6. Vehicles (฿80,000 - ฿25,000,000)
  if (/supercar|ferrari|lamborghini|porsche|ซูเปอร์คาร์/i.test(kw)) return 18500000.00;
  if (/bmw|mercedes|benz|audi|tesla|lexus|รถหรู/i.test(kw)) return 3200000.00;
  if (/รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|truck|van/i.test(kw)) return 850000.00;
  if (/บิ๊กไบค์|bigbike|ducati|harley/i.test(kw)) return 450000.00;
  if (/รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|scooter|bike/i.test(kw)) return 85000.00;
  if (/vehicle|automotive/i.test(kw)) {
    return getClientBracketPrice(kw, 80000, 25000000, 10000);
  }

  // 7. Home Appliances / Furniture (฿3,000 - ฿45,000)
  if (/แอร์|air\s*conditioner|เครื่องปรับอากาศ|เครื่องซักผ้า|washing\s*machine/i.test(kw)) return 21900.00;
  if (/ตู้เย็น|fridge|refrigerator/i.test(kw)) return 18500.00;
  if (/ทีวี|โทรทัศน์|tv|television/i.test(kw)) return 15900.00;
  if (/โซฟา|sofa|เตียง|bed|ที่นอน|mattress/i.test(kw)) return 12500.00;
  if (/โต๊ะ|table|เก้าอี้|chair|ตู้เสื้อผ้า/i.test(kw)) return 4500.00;
  if (/furniture|appliance|เฟอร์นิเจอร์|เครื่องใช้ไฟฟ้า/i.test(kw)) {
    return getClientBracketPrice(kw, 3000, 45000, 100);
  }

  // 8. Everyday Groceries & Convenience (฿10 - ฿150)
  if (/น้ำเปล่า|น้ำดื่ม|น้ำสิงห์|น้ำทิพย์|น้ำแร่|water/i.test(kw)) return 10.00;
  if (/น้ำแข็ง|ice/i.test(kw)) return 8.00;
  if (/โซดา|soda/i.test(kw)) return 12.00;
  if (/นม|เป๊ปซี่|โค้ก|coke|cola|pepsi|sprite|fanta|ชา|tea|กาแฟ|coffee|drink|juice/i.test(kw)) return 15.00;
  if (/มาม่า|ไวไว|ยำยำ|บะหมี่|noodle|ramen/i.test(kw)) return 7.00;
  if (/ไข่|ไข่ไก่|ไข่ต้ม|egg/i.test(kw)) return 16.00;
  if (/ขนมปัง|bread|sandwich|ซาลาเปา|ไส้กรอก|sausage/i.test(kw)) return 29.00;
  if (/ข้าวกล่อง|ข้าวผัด|เบนโตะ|ready\s*meal|bento/i.test(kw)) return 45.00;
  if (/ข้าวสาร|ข้าวหอมมะลิ|rice/i.test(kw)) return 65.00;
  if (/เลย์|มันฝรั่ง|chips|pringles|snack|cookie|oreo|chocolate|ช็อกโกแลต|ขนม/i.test(kw)) return 30.00;
  if (/สบู่|soap|ยาสีฟัน|toothpaste|แปรงสีฟัน|toothbrush|แชมพู|shampoo/i.test(kw)) return 18.00;
  if (/ผงซักฟอก|detergent|น้ำยาล้างจาน|ทิชชู่|tissue|wipe/i.test(kw)) return 35.00;
  if (/grocery|convenience|ของชำ|ของกิน/i.test(kw)) {
    return getClientBracketPrice(kw, 10, 150, 1);
  }

  // 9. Universal Fallback (฿100 - ฿1,000)
  return getClientBracketPrice(kw, 100, 1000, 5);
}

function createDynamicProduct(keyword) {
  const cleanKeyword = keyword.trim();
  const price = generatePriceForKeyword(cleanKeyword);
  const asset = resolveDynamicAsset(cleanKeyword);
  return {
    id: `dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: cleanKeyword,
    category_id: 999,
    category_name: 'On-Demand Goods',
    price: price,
    icon: asset.icon,
    image_url: asset.image_url,
    description: 'Instant on-demand verified catalog item • Available 24/7',
    is_dynamic: true
  };
}

function renderProductIconHtml(product, sizeClass = '') {
  const prodEmoji = product.icon || '✨';
  if (product.image_url) {
    return `
      <div class="product-icon-box product-img-box ${sizeClass}">
        <img 
          src="${escapeHtml(product.image_url)}" 
          alt="${escapeHtml(product.name)}" 
          class="product-thumb-img" 
          loading="lazy" 
          onerror="this.style.display='none'; const fb = this.parentElement.querySelector('.fallback-avatar'); if(fb) fb.style.display='flex';"
        />
        <div class="fallback-avatar" style="display: none; background-color: ${getAvatarColor(product.name)};">${escapeHtml(prodEmoji)}</div>
      </div>
    `;
  }
  if (product.icon && String(product.icon).trim()) {
    return `<div class="product-icon-box ${sizeClass}" aria-hidden="true">${escapeHtml(product.icon)}</div>`;
  }
  // Fallback to a colored CSS box with the first letter of the product name
  const firstLetter = (product.name && product.name.trim().charAt(0).toUpperCase()) || 'X';
  const bgColor = getAvatarColor(product.name);
  return `<div class="product-icon-box fallback-avatar ${sizeClass}" style="background-color: ${bgColor};" aria-hidden="true">${escapeHtml(firstLetter)}</div>`;
}

function renderProductRowElement(prod, isDynamic = false) {
  const itemRow = document.createElement('article');
  itemRow.className = `product-list-row ${isDynamic ? 'dynamic-product-card' : ''}`;
  itemRow.id = `product-row-${prod.id}`;

  const iconHtml = renderProductIconHtml(prod);

  itemRow.innerHTML = `
    <div class="product-icon-wrap">
      ${iconHtml}
    </div>
    <div class="product-info-col">
      <div class="product-row-title-wrap">
        <h3 class="product-row-title" title="${escapeHtml(prod.name)}">${escapeHtml(prod.name)}</h3>
        ${isDynamic ? '<span class="dynamic-badge">⚡ On-Demand</span>' : ''}
      </div>
      <div class="product-row-sub">
        <span class="product-cat-pill">${escapeHtml(prod.category_name)}</span>
        ${prod.description ? `<span class="product-desc-snippet">${escapeHtml(prod.description)}</span>` : ''}
      </div>
    </div>
    <div class="product-action-col">
      <span class="product-row-price">${formatTHB(prod.price)}</span>
      <button class="btn-add-quick" data-id="${prod.id}" aria-label="Add ${escapeHtml(prod.name)} to cart">
        + Add
      </button>
    </div>
  `;

  const addBtn = itemRow.querySelector('.btn-add-quick');
  addBtn.addEventListener('click', () => {
    addToCart(prod);
  });

  return itemRow;
}

function renderProductsGrid() {
  const count = state.products.length;
  const query = state.searchQuery.trim();
  elements.catalogFilterBadge.classList.toggle('hidden', state.currentCategoryId === 'all' && !query);

  // Requirement 1: "Find Everything"
  // If item does NOT exist in local seed database, dynamically generate a temporary product card on the fly!
  if (count === 0) {
    if (query) {
      const dynProd = createDynamicProduct(query);
      elements.catalogCountText.textContent = `1 On-Demand Item for "${query}"`;
      elements.productsGrid.innerHTML = `
        <div class="on-demand-notice-bar">
          <span class="sparkle-icon">✨</span>
          <div class="notice-text">
            <strong>Custom Item Generated on the Fly!</strong>
            <span>Not in standard seed inventory? We deliver anything 24/7.</span>
          </div>
        </div>
      `;
      const dynRow = renderProductRowElement(dynProd, true);
      elements.productsGrid.appendChild(dynRow);
      return;
    }

    elements.catalogCountText.textContent = '0 items found';
    elements.productsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No matching items</h3>
        <p>Try searching for anything (e.g., "มาม่า", "น้ำดื่ม", "สบู่") to order on-demand!</p>
      </div>
    `;
    return;
  }

  elements.catalogCountText.textContent = `${count} item${count === 1 ? '' : 's'} available`;
  elements.productsGrid.innerHTML = '';

  // Render matched seed items
  state.products.forEach(prod => {
    const itemRow = renderProductRowElement(prod, false);
    elements.productsGrid.appendChild(itemRow);
  });

  // If user searched for something, also offer on-demand button at bottom
  if (query && !state.products.some(p => p.name.toLowerCase() === query.toLowerCase())) {
    const dynProd = createDynamicProduct(query);
    const customPrompt = document.createElement('div');
    customPrompt.className = 'custom-request-footer';
    customPrompt.innerHTML = `
      <div class="custom-prompt-text">
        <span>Can't find exact brand?</span>
        <strong>Order custom "${escapeHtml(query)}" on demand (${formatTHB(dynProd.price)})</strong>
      </div>
      <button class="btn btn-sm btn-outline btn-custom-add">+ Add Custom</button>
    `;
    customPrompt.querySelector('.btn-custom-add').addEventListener('click', () => {
      addToCart(dynProd);
    });
    elements.productsGrid.appendChild(customPrompt);
  }
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
  const formattedSubtotal = formatTHB(subtotal);
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
    const lineTotal = item.product.price * item.quantity;
    const iconHtml = renderProductIconHtml(item.product, 'icon-sm');

    row.innerHTML = `
      <div class="cart-item-icon-wrap">
        ${iconHtml}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title">${escapeHtml(item.product.name)}</div>
        <div class="cart-item-unit-price">${formatTHB(item.product.price)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty btn-minus" data-id="${item.product.id}" aria-label="Decrease quantity">−</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="btn-qty btn-plus" data-id="${item.product.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-subtotal">${formatTHB(lineTotal)}</div>
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
  elements.drawerBackdrop.classList.add('active');
  elements.drawerBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  elements.cartDrawer.classList.remove('open');
  elements.drawerBackdrop.classList.remove('active');
  elements.drawerBackdrop.classList.add('hidden');
  document.body.style.overflow = '';
}

// =========================================================
// Checkout & Payment Gateway Modal Flow (Presentation Only)
// =========================================================
let paymentTimerInterval = null;

function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (state.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const customerName = elements.custName.value.trim();
  const customerPhone = elements.custPhone.value.trim();
  const deliveryAddress = elements.custAddress.value.trim();

  if (customerName.length < 2) {
    showToast('Recipient name must be at least 2 characters.', 'error');
    return;
  }
  if (customerPhone.length < 6) {
    showToast('Phone number must be at least 6 digits.', 'error');
    return;
  }
  if (deliveryAddress.length < 5) {
    showToast('Delivery address must be at least 5 characters.', 'error');
    return;
  }

  const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'CASH';

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  state.pendingCheckout = {
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    subtotal: Math.round(subtotal * 100) / 100,
    items: state.cart.map(item => ({
      product_id: typeof item.product.id === 'number' && item.product.id > 0 ? item.product.id : 0,
      name: item.product.name,
      unit_price: item.product.price,
      quantity: item.quantity,
      icon: item.product.icon || '✨',
      description: item.product.description || ''
    }))
  };

  // Requirement 2: Simplified External Payment Gateway (Presentation Only)
  openPaymentModal(paymentMethod, subtotal);
}

function openPaymentModal(paymentMethod, subtotal) {
  const formattedAmount = formatTHB(subtotal);

  if (paymentMethod === 'QR') {
    elements.paymentQrSection.classList.remove('hidden');
    elements.paymentCashSection.classList.add('hidden');
    elements.qrModalAmount.textContent = formattedAmount;

    // Reset and start 15:00 QR expiry timer
    let secondsLeft = 15 * 60;
    clearInterval(paymentTimerInterval);
    elements.qrTimerCountdown.textContent = '15:00';
    paymentTimerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(paymentTimerInterval);
        elements.qrTimerCountdown.textContent = 'Expired';
      } else {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        elements.qrTimerCountdown.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }, 1000);
  } else {
    elements.paymentCashSection.classList.remove('hidden');
    elements.paymentQrSection.classList.add('hidden');
    elements.cashModalAmount.textContent = formattedAmount;

    elements.cashRecipientSummary.innerHTML = `
      <div class="summary-line">
        <span>Recipient:</span>
        <strong>${escapeHtml(state.pendingCheckout.customerName)} (${escapeHtml(state.pendingCheckout.customerPhone)})</strong>
      </div>
      <div class="summary-line">
        <span>Deliver to:</span>
        <span>${escapeHtml(state.pendingCheckout.deliveryAddress)}</span>
      </div>
    `;
  }

  elements.paymentModal.classList.remove('hidden');
  elements.paymentModalBackdrop.classList.remove('hidden');
}

function closePaymentModal() {
  clearInterval(paymentTimerInterval);
  elements.paymentModal.classList.add('hidden');
  elements.paymentModalBackdrop.classList.add('hidden');
}

async function finalizeOrderPlacement() {
  if (!state.pendingCheckout) return;

  const isQr = state.pendingCheckout.paymentMethod === 'QR';
  const triggerBtn = isQr ? elements.confirmPaymentCompletedBtn : elements.confirmCashOrderBtn;
  triggerBtn.disabled = true;
  const originalText = triggerBtn.textContent;
  triggerBtn.textContent = 'Processing Dispatch...';

  // Requirement 3: Trigger mock external dispatch call (log to console)
  console.log(`[EXTERNAL DISPATCH] Triggering mock logistics dispatch API for ${state.pendingCheckout.customerName}:`, {
    recipient: state.pendingCheckout.customerName,
    phone: state.pendingCheckout.customerPhone,
    address: state.pendingCheckout.deliveryAddress,
    payment_method: state.pendingCheckout.paymentMethod,
    total_amount: state.pendingCheckout.subtotal,
    carrier: 'X-Speed 15-Minute Convenience Courier',
    timestamp: new Date().toISOString()
  });

  const orderPayload = {
    user_id: state.currentUser ? state.currentUser.id : null,
    customer_name: state.pendingCheckout.customerName,
    customer_phone: state.pendingCheckout.customerPhone,
    delivery_address: state.pendingCheckout.deliveryAddress,
    payment_method: state.pendingCheckout.paymentMethod,
    status: 'PENDING',
    items: state.pendingCheckout.items
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (res.status === 201 && data.success) {
      closePaymentModal();
      closeCartDrawer();

      // Clear Cart
      state.cart = [];
      state.pendingCheckout = null;
      saveCart();
      updateCartUI();

      const newOrder = data.data;
      state.currentOrderId = newOrder.id;

      // Strict Order Privacy:
      // If ordering as guest, store ID in local device storage
      if (!state.currentUser) {
        if (!state.guestOrderIds.includes(newOrder.id)) {
          state.guestOrderIds.unshift(newOrder.id);
          localStorage.setItem('xmart_guest_orders', JSON.stringify(state.guestOrderIds));
        }
      }

      showToast(`Order #${newOrder.id} placed! Mock external courier dispatched.`, 'success');

      // Show Clean Digital Receipt Modal
      showDigitalReceiptModal(newOrder);

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
    triggerBtn.disabled = false;
    triggerBtn.textContent = originalText;
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

  // Requirement 3: Driver Info - Mock driver name and clickable phone number (tel:089xxxxxxx)
  const driverName = (order.driver && order.driver.name) || order.driver_name || 'Somchai Express';
  let driverPhone = (order.driver && order.driver.phone) || order.driver_phone || '089-123-4567';
  // Ensure 089 format
  if (!driverPhone.startsWith('089')) {
    driverPhone = '089-123-4567';
  }

  elements.trackDriverName.textContent = driverName;
  elements.trackDriverPhone.textContent = driverPhone;
  const digitsOnlyPhone = driverPhone.replace(/[^0-9]/g, '');
  elements.trackDriverPhoneLink.href = `tel:${digitsOnlyPhone}`;

  // Status Badge
  const status = order.status;
  elements.trackStatusPill.textContent = status;
  elements.trackStatusPill.className = `status-pill status-${status.toLowerCase().replace(/_/g, '-')}`;

  // Requirement 3: Stepper Visual State
  // Pending -> Out for Delivery -> Delivered
  const isDelivered = status === 'DELIVERED';
  const isOut = status === 'OUT_FOR_DELIVERY';
  const isPending = status === 'PENDING';
  const isCancelled = status === 'CANCELLED';

  elements.stepOrdered.classList.toggle('active', !isCancelled && (isPending || isOut || isDelivered));
  elements.stepOut.classList.toggle('active', !isCancelled && (isOut || isDelivered));
  elements.stepDelivered.classList.toggle('active', !isCancelled && isDelivered);
  elements.line1.classList.toggle('active', !isCancelled && (isOut || isDelivered));
  elements.line2.classList.toggle('active', !isCancelled && isDelivered);

  // Update simulation buttons state
  elements.simPending?.classList.toggle('active-sim', isPending);
  elements.simOutForDelivery?.classList.toggle('active-sim', isOut);
  elements.simDelivered?.classList.toggle('active-sim', isDelivered);

  // Requirement 3: Cancellation Button State
  // Cancel button remains active until status becomes "Delivered"
  if (isDelivered) {
    elements.cancelOrderBtn.disabled = true;
    elements.cancelOrderBtn.textContent = 'Order Delivered (Cannot Cancel)';
    elements.cancelNote.textContent = 'Orders cannot be cancelled once delivered. No refunds per policy.';
  } else if (isCancelled) {
    elements.cancelOrderBtn.disabled = true;
    elements.cancelOrderBtn.textContent = 'Order Cancelled';
    elements.cancelNote.textContent = 'This order was cancelled.';
  } else {
    // Both PENDING and OUT_FOR_DELIVERY allow cancellation
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
        <span class="track-item-price">${formatTHB(item.subtotal || (item.unit_price * item.quantity))}</span>
      `;
      elements.trackItemsList.appendChild(row);
    });
  }

  const total = formatTHB(order.total_amount || (order.pricing && order.pricing.total_amount) || 0);
  elements.trackSubtotal.textContent = total;
  elements.trackTotal.textContent = total;
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

// Staff / Driver Simulation Function for Status Transitions
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
      showToast(`Status transitioned to: ${newStatus}`, 'success');
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
// Strict Privacy Order History View (Member & Guest Isolation)
// =========================================================
async function loadMemberHistory() {
  elements.historyOrdersList.innerHTML = `
    <div class="skeleton-card" style="height: 90px; margin-bottom: 8px;"></div>
    <div class="skeleton-card" style="height: 90px;"></div>
  `;

  // 1. Authenticated Member Account: Fetch personal cloud orders
  if (state.currentUser) {
    try {
      const userId = state.currentUser.id;
      const res = await fetch(`/api/orders/user/${userId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        elements.historyEmpty.classList.add('hidden');
        renderHistoryList(data.data);
      } else {
        elements.historyOrdersList.innerHTML = '';
        elements.historyEmpty.classList.remove('hidden');
        if (elements.historyEmptyTitle) elements.historyEmptyTitle.textContent = 'No Past Orders Found';
        if (elements.historyEmptyDesc) elements.historyEmptyDesc.textContent = 'You haven\'t placed any orders with this member account yet.';
        elements.historyLoginPromptBtn?.classList.add('hidden');
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      elements.historyOrdersList.innerHTML = `<p class="help-text">Failed to load order history.</p>`;
    }
    return;
  }

  // 2. Guest Customer: Strictly isolated to orders placed on THIS device
  const guestIds = Array.isArray(state.guestOrderIds) ? state.guestOrderIds : [];
  if (guestIds.length === 0) {
    elements.historyOrdersList.innerHTML = '';
    elements.historyEmpty.classList.remove('hidden');
    if (elements.historyEmptyTitle) elements.historyEmptyTitle.textContent = 'No Orders On This Device';
    if (elements.historyEmptyDesc) elements.historyEmptyDesc.textContent = 'You haven\'t placed any orders on this device yet. Log in or create an account to view and sync your orders across all devices.';
    elements.historyLoginPromptBtn?.classList.remove('hidden');
    return;
  }

  try {
    const fetchPromises = guestIds.map(id =>
      fetch(`/api/orders/${id}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    const results = await Promise.all(fetchPromises);
    const validOrders = results
      .filter(r => r && r.success && r.data)
      .map(r => r.data);

    if (validOrders.length > 0) {
      elements.historyEmpty.classList.add('hidden');
      renderHistoryList(validOrders);
    } else {
      elements.historyOrdersList.innerHTML = '';
      elements.historyEmpty.classList.remove('hidden');
      elements.historyLoginPromptBtn?.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load guest orders:', err);
    elements.historyOrdersList.innerHTML = `<p class="help-text">Failed to load local device orders.</p>`;
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
        <span class="history-order-total">${formatTHB(order.total_amount)}</span>
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

// =========================================================
// Admin Analytics & Server Peak Hours Reporting Logic
// =========================================================
function applyDatePreset(preset) {
  const now = new Date();
  const endDateStr = now.toISOString().slice(0, 10);
  let startDateStr = endDateStr;

  if (preset === 'today') {
    startDateStr = endDateStr;
  } else if (preset === '7d') {
    const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDateStr = d.toISOString().slice(0, 10);
  } else if (preset === '30d') {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDateStr = d.toISOString().slice(0, 10);
  }

  if (elements.salesStartDate) elements.salesStartDate.value = startDateStr;
  if (elements.salesEndDate) elements.salesEndDate.value = endDateStr;
  loadSalesReport(startDateStr, endDateStr);
}

async function loadAnalyticsDashboard() {
  const start = elements.salesStartDate?.value;
  const end = elements.salesEndDate?.value;

  if (!start || !end) {
    applyDatePreset('30d');
  } else {
    loadSalesReport(start, end);
  }
  loadPeakHoursReport();
}

async function loadSalesReport(startDate, endDate) {
  if (elements.categoryBreakdownList) {
    elements.categoryBreakdownList.innerHTML = `
      <div class="skeleton-card" style="height: 50px; margin-bottom: 6px;"></div>
      <div class="skeleton-card" style="height: 50px;"></div>
    `;
  }

  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const headers = {};
    if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

    const res = await fetch(`/api/admin/reports/sales?${params.toString()}`, { headers });
    const data = await res.json();

    if (data.success) {
      const summary = data.summary || {};
      const rev = Number(summary.total_revenue || 0);
      const aov = Number(summary.average_order_value || 0);
      const orders = Number(summary.total_orders || 0);

      if (elements.kpiRevenue) {
        elements.kpiRevenue.textContent = `฿${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (elements.kpiOrders) {
        elements.kpiOrders.textContent = orders.toLocaleString();
      }
      if (elements.kpiAov) {
        elements.kpiAov.textContent = `฿${aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      renderCategoryBreakdown(data.category_breakdown, rev);
    } else {
      showToast(data.error || 'Failed to load sales report', 'error');
    }
  } catch (err) {
    console.error('Sales report error:', err);
    showToast('Failed to fetch sales analytics', 'error');
  }
}

/**
 * Admin Sales Data Export:
 * Downloads a CSV file containing the filtered sales report:
 * Columns: Date, Order ID, Category, Items, Revenue
 */
async function exportSalesReportToCsv() {
  const startDate = elements.salesStartDate ? elements.salesStartDate.value : '';
  const endDate = elements.salesEndDate ? elements.salesEndDate.value : '';
  if (elements.salesExportCsvBtn) {
    elements.salesExportCsvBtn.disabled = true;
    elements.salesExportCsvBtn.textContent = '⏳ Exporting...';
  }

  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('format', 'csv');

    const headers = {};
    if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

    const res = await fetch(`/api/admin/reports/sales?${params.toString()}`, { headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to export sales data');
    }

    const csvText = await res.text();
    // Ensure Blob is constructed with UTF-8 BOM (\uFEFF) for Excel compatibility
    const blobContent = csvText.startsWith('\uFEFF') ? csvText : '\uFEFF' + csvText;
    const blob = new Blob([blobContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `xmart_sales_${startDate || 'all'}_to_${endDate || 'today'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    showToast('Sales report exported to CSV successfully!', 'success');
  } catch (err) {
    console.error('CSV Export Error:', err);
    showToast(err.message || 'Failed to download CSV', 'error');
  } finally {
    if (elements.salesExportCsvBtn) {
      elements.salesExportCsvBtn.disabled = false;
      elements.salesExportCsvBtn.textContent = '📥 Export to CSV';
    }
  }
}

/**
 * Digital Receipt Modal
 * Clean, printable modal showing:
 * Order ID, timestamp, items purchased, total amount, payment method, free shipping confirmation (฿0),
 * and a "Copy Order ID" button.
 */
function showDigitalReceiptModal(order) {
  if (!order || !elements.receiptModal) return;

  if (elements.receiptOrderId) {
    elements.receiptOrderId.textContent = `#${order.id}`;
  }

  if (elements.receiptTimestamp) {
    elements.receiptTimestamp.textContent = new Date(order.created_at || Date.now()).toLocaleString();
  }

  if (elements.receiptCustomerName) {
    elements.receiptCustomerName.textContent = order.customer_name || 'Guest Customer';
  }

  if (elements.receiptPaymentMethod) {
    const isQr = order.payment_method === 'QR';
    elements.receiptPaymentMethod.textContent = isQr ? 'QR PromptPay' : 'Cash on Delivery (COD)';
  }

  if (elements.receiptItemsList) {
    elements.receiptItemsList.innerHTML = '';
    const items = order.items || [];
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'receipt-item-row';
      const name = item.product_name || item.name || 'Convenience Item';
      const qty = item.quantity || 1;
      const unitPrice = Number(item.unit_price || item.price || 0);
      const subtotal = Number(item.subtotal || (unitPrice * qty));

      row.innerHTML = `
        <div class="receipt-item-desc">
          <strong>${escapeHtml(name)}</strong>
          <div class="receipt-item-subtext">${formatTHB(unitPrice)} × ${qty}</div>
        </div>
        <div class="receipt-item-val">${formatTHB(subtotal)}</div>
      `;
      elements.receiptItemsList.appendChild(row);
    });
  }

  const grandTotal = Number(order.total_amount || (order.pricing && order.pricing.total_amount) || 0);
  if (elements.receiptSubtotal) {
    elements.receiptSubtotal.textContent = formatTHB(grandTotal);
  }
  if (elements.receiptTotalAmount) {
    elements.receiptTotalAmount.textContent = formatTHB(grandTotal);
  }

  // Copy Order ID Button
  if (elements.receiptCopyIdBtn) {
    elements.receiptCopyIdBtn.onclick = () => {
      const orderIdStr = String(order.id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(orderIdStr).then(() => {
          elements.receiptCopyIdBtn.textContent = '✓ Copied!';
          setTimeout(() => {
            elements.receiptCopyIdBtn.textContent = '📋 Copy';
          }, 2000);
          showToast(`Order ID #${order.id} copied to clipboard!`, 'success');
        }).catch(() => {
          copyFallback(orderIdStr);
        });
      } else {
        copyFallback(orderIdStr);
      }
    };
  }

  elements.receiptModal.classList.remove('hidden');
  elements.receiptModalBackdrop?.classList.remove('hidden');
}

function copyFallback(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
    if (elements.receiptCopyIdBtn) {
      elements.receiptCopyIdBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        elements.receiptCopyIdBtn.textContent = '📋 Copy';
      }, 2000);
    }
    showToast(`Order ID #${text} copied!`, 'success');
  } catch (err) {
    showToast('Could not copy automatically.', 'error');
  } finally {
    document.body.removeChild(tempInput);
  }
}

function closeDigitalReceiptModal() {
  if (elements.receiptModal) {
    elements.receiptModal.classList.add('hidden');
  }
  if (elements.receiptModalBackdrop) {
    elements.receiptModalBackdrop.classList.add('hidden');
  }
}

function renderCategoryBreakdown(categories, totalRevenue) {
  if (!elements.categoryBreakdownList) return;
  elements.categoryBreakdownList.innerHTML = '';

  if (!Array.isArray(categories) || categories.length === 0) {
    elements.categoryBreakdownList.innerHTML = `<p class="help-text">No category data for this period.</p>`;
    return;
  }

  categories.forEach(cat => {
    const row = document.createElement('div');
    row.className = 'category-row';
    const percentNum = parseFloat(cat.percentage_of_sales) || 0;

    row.innerHTML = `
      <div class="cat-row-header">
        <strong class="cat-name">${escapeHtml(cat.category_name)}</strong>
        <span class="cat-revenue">฿${Number(cat.category_revenue).toFixed(2)}</span>
      </div>
      <div class="cat-progress-bar-wrap">
        <div class="cat-progress-bar" style="width: ${Math.min(100, Math.max(percentNum, totalRevenue > 0 ? 3 : 0))}%;"></div>
      </div>
      <div class="cat-row-footer">
        <span>${cat.units_sold} units sold</span>
        <span class="cat-percent">${escapeHtml(cat.percentage_of_sales)}</span>
      </div>
    `;
    elements.categoryBreakdownList.appendChild(row);
  });
}

async function loadPeakHoursReport() {
  if (elements.hourlyBarChart) {
    elements.hourlyBarChart.innerHTML = `
      <div class="skeleton-card" style="height: 100px; width: 100%;"></div>
    `;
  }

  try {
    const headers = {};
    if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

    const res = await fetch('/api/admin/reports/peak-hours', { headers });
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      if (elements.autoscaleRecText && data.recommendations) {
        elements.autoscaleRecText.textContent = data.recommendations.auto_scale_up_target || 'Optimal replica baseline maintained.';
      }

      renderPeakHoursChart(data.data, data.busiest_hour_order_count || 1);
      renderHourlyTable(data.data);
    } else {
      showToast(data.error || 'Failed to load peak hours report', 'error');
    }
  } catch (err) {
    console.error('Peak hours report error:', err);
    showToast('Failed to fetch peak hours data', 'error');
  }
}

function renderPeakHoursChart(hoursData, maxCount) {
  if (!elements.hourlyBarChart) return;
  elements.hourlyBarChart.innerHTML = '';
  const safeMax = Math.max(maxCount || 1, 1);

  hoursData.forEach(h => {
    const col = document.createElement('div');
    col.className = `bar-col level-${h.traffic_level.toLowerCase()}`;
    const heightPercent = h.order_count > 0 ? Math.max(Math.round((h.order_count / safeMax) * 100), 12) : 4;

    col.innerHTML = `
      <div class="bar-fill-wrap" title="${h.hour}: ${h.order_count} orders (${h.traffic_level})">
        <span class="bar-value-label">${h.order_count > 0 ? h.order_count : ''}</span>
        <div class="bar-fill" style="height: ${heightPercent}%;"></div>
      </div>
      <span class="bar-hour-label">${h.hour_number % 4 === 0 ? h.hour_number : ''}</span>
    `;
    elements.hourlyBarChart.appendChild(col);
  });
}

function renderHourlyTable(hoursData) {
  if (!elements.hourlyTableBody) return;
  elements.hourlyTableBody.innerHTML = '';

  hoursData.forEach(h => {
    const row = document.createElement('div');
    row.className = `hourly-table-row level-${h.traffic_level.toLowerCase()}`;
    row.innerHTML = `
      <span class="hour-time"><strong>${h.hour}</strong></span>
      <span class="hour-count">${h.order_count} orders (${h.percentage})</span>
      <span class="traffic-badge badge-${h.traffic_level.toLowerCase()}">${h.traffic_level}</span>
    `;
    elements.hourlyTableBody.appendChild(row);
  });
}

