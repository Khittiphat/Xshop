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
  viewAnalytics: document.getElementById('view-analytics'),

  // Admin Analytics Controls
  adminAnalyticsBtn: document.getElementById('admin-analytics-btn'),
  analyticsCloseBtn: document.getElementById('analytics-close-btn'),
  salesStartDate: document.getElementById('sales-start-date'),
  salesEndDate: document.getElementById('sales-end-date'),
  salesFilterApplyBtn: document.getElementById('sales-filter-apply-btn'),
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

  // Checkout Form
  checkoutForm: document.getElementById('checkout-form'),
  custName: document.getElementById('cust-name'),
  custPhone: document.getElementById('cust-phone'),
  custAddress: document.getElementById('cust-address'),
  toggleGuestMode: document.getElementById('toggle-guest-mode'),
  toggleMemberMode: document.getElementById('toggle-member-mode'),

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

  // Payment Gateway Modal Event Listeners
  elements.closePaymentModalBtn?.addEventListener('click', closePaymentModal);
  elements.paymentModalBackdrop?.addEventListener('click', closePaymentModal);
  elements.cancelQrModalBtn?.addEventListener('click', closePaymentModal);
  elements.cancelCashModalBtn?.addEventListener('click', closePaymentModal);
  elements.confirmPaymentCompletedBtn?.addEventListener('click', finalizeOrderPlacement);
  elements.confirmCashOrderBtn?.addEventListener('click', finalizeOrderPlacement);

  // Simulation Controls for Status Transitions (Pending -> Out for Delivery -> Delivered)
  elements.simPending?.addEventListener('click', () => simulateDriverStatus('PENDING'));
  elements.simOutForDelivery?.addEventListener('click', () => simulateDriverStatus('OUT_FOR_DELIVERY'));
  elements.simDelivered?.addEventListener('click', () => simulateDriverStatus('DELIVERED'));
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

// =========================================================
// Smart Keyword Asset & Curated Image Mapper
// Translates Thai and English keywords to high-resolution Unsplash photo categories
// =========================================================
const KEYWORD_IMAGE_MAP = [
  // Luxury, Vehicles & Big Electronics
  { regex: /เรือดำน้ำ|submarine/i, query: 'submarine', icon: '⚓', fallbackImg: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop&q=80' },
  { regex: /เครื่องบิน|airplane|jet|helicopter/i, query: 'airplane', icon: '✈️', fallbackImg: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&auto=format&fit=crop&q=80' },
  { regex: /เรือ|yacht|boat/i, query: 'yacht,boat', icon: '🛥️', fallbackImg: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400&auto=format&fit=crop&q=80' },
  { regex: /รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|tesla|truck/i, query: 'sports-car,automobile', icon: '🚗', fallbackImg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80' },
  { regex: /รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|scooter|bike/i, query: 'motorcycle', icon: '🏍️', fallbackImg: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทอง|ทองคำ|gold|เพชร|diamond/i, query: 'gold-bars,gold', icon: '🪙', fallbackImg: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80' },
  { regex: /iphone|ไอโฟน|มือถือ|smartphone|phone/i, query: 'iphone,smartphone', icon: '📱', fallbackImg: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80' },
  { regex: /macbook|ipad|laptop|โน้ตบุ๊ค|คอมพิวเตอร์|computer/i, query: 'laptop,computer', icon: '💻', fallbackImg: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทีวี|โทรทัศน์|tv|television/i, query: 'smart-tv,television', icon: '📺', fallbackImg: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=80' },

  // Water & Drinks
  { regex: /น้ำเปล่า|น้ำดื่ม|น้ำสิงห์|น้ำทิพย์|น้ำแร่|water/i, query: 'water-bottle,mineral-water', icon: '💧', fallbackImg: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80' },
  { regex: /น้ำแข็ง|ice/i, query: 'ice-cubes', icon: '🧊', fallbackImg: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?w=400&auto=format&fit=crop&q=80' },
  { regex: /โค้ก|เป๊ปซี่|coke|cola|pepsi|น้ำอัดลม|soda/i, query: 'coca-cola,soda', icon: '🥤', fallbackImg: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
  { regex: /ชา|ชาเขียว|ชาไทย|tea|matcha/i, query: 'green-tea,iced-tea', icon: '🍵', fallbackImg: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80' },
  { regex: /กาแฟ|coffee|latte|espresso/i, query: 'iced-coffee,coffee', icon: '☕', fallbackImg: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80' },
  { regex: /นม|นมสด|milk/i, query: 'milk-bottle,dairy', icon: '🥛', fallbackImg: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },
  { regex: /เบียร์|beer|เหล้า|alcohol/i, query: 'cold-beer,bottle', icon: '🍺', fallbackImg: 'https://images.unsplash.com/photo-1608270192809-5a9e3346d0c7?w=400&auto=format&fit=crop&q=80' },

  // Instant Food & Groceries
  { regex: /มาม่า|ไวไว|ยำยำ|บะหมี่|ราเมง|noodle|ramen/i, query: 'instant-noodles,ramen', icon: '🍜', fallbackImg: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80' },
  { regex: /ไข่|ไข่ไก่|ไข่เป็ด|ไข่ต้ม|egg/i, query: 'fresh-eggs,eggs', icon: '🥚', fallbackImg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80' },
  { regex: /ข้าวสาร|ข้าว|ข้าวหอมมะลิ|rice/i, query: 'white-rice,cooked-rice', icon: '🌾', fallbackImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80' },
  { regex: /ขนมปัง|bread|แซนวิช|sandwich/i, query: 'fresh-bread,sandwich', icon: '🥪', fallbackImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80' },
  { regex: /ไส้กรอก|sausage|ลูกชิ้น/i, query: 'grilled-sausage', icon: '🌭', fallbackImg: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&auto=format&fit=crop&q=80' },
  { regex: /ข้าวกล่อง|กะเพรา|อาหาร|ready\s*meal|bento/i, query: 'thai-food,meal', icon: '🍛', fallbackImg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80' },

  // Snacks & Confectionery
  { regex: /เลย์|มันฝรั่ง|chips|pringles/i, query: 'potato-chips,chips', icon: '🥔', fallbackImg: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80' },
  { regex: /ขนม|snack|คุกกี้|cookie|oreo/i, query: 'cookies,snack', icon: '🍪', fallbackImg: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80' },
  { regex: /ช็อกโกแลต|chocolate|candy/i, query: 'chocolate-bar,candy', icon: '🍫', fallbackImg: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&auto=format&fit=crop&q=80' },

  // Personal Care & Household
  { regex: /สบู่|soap|ครีมอาบน้ำ|bodywash/i, query: 'organic-soap,soap', icon: '🧼', fallbackImg: 'https://images.unsplash.com/photo-1607006314144-8848c4d29362?w=400&auto=format&fit=crop&q=80' },
  { regex: /แชมพู|shampoo|ยาสระผม/i, query: 'shampoo-bottle', icon: '🧴', fallbackImg: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80' },
  { regex: /ยาสีฟัน|toothpaste|แปรงสีฟัน|toothbrush/i, query: 'toothbrush-toothpaste', icon: '🪥', fallbackImg: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&auto=format&fit=crop&q=80' },
  { regex: /ทิชชู่|tissue|กระดาษทิชชู่|wipes/i, query: 'tissue-paper,paper-napkin', icon: '🧻', fallbackImg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80' },
  { regex: /ผงซักฟอก|น้ำยาล้างจาน|sponge|detergent/i, query: 'cleaning-supplies,dishwashing', icon: '🧽', fallbackImg: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=400&auto=format&fit=crop&q=80' }
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
 * Smart Heuristic Pricing Generator
 * Replaces flat 20-50 THB with context-aware pricing
 */
function generatePriceForKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') return 35.00;
  const kw = keyword.toLowerCase().trim();

  // 1. Luxury / Vehicles / Electronics / High-ticket items
  if (/เรือดำน้ำ|submarine/i.test(kw)) {
    return 15000000000.00;
  }
  if (/เครื่องบิน|airplane|jet|helicopter/i.test(kw)) {
    return 25000000.00;
  }
  if (/เรือ|boat|yacht/i.test(kw)) {
    return 1500000.00;
  }
  if (/รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|truck|tesla/i.test(kw)) {
    return 850000.00;
  }
  if (/รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|bike/i.test(kw)) {
    return 65000.00;
  }
  if (/ทอง|ทองคำ|gold|เพชร|diamond/i.test(kw)) {
    return 45000.00;
  }
  if (/iphone|ไอโฟน|macbook|ipad|laptop|โน้ตบุ๊ค|คอมพิวเตอร์|computer|playstation|ps5/i.test(kw)) {
    return 39900.00;
  }
  if (/ทีวี|โทรทัศน์|tv|television|ตู้เย็น|refrigerator|แอร์|air\s*conditioner/i.test(kw)) {
    return 14900.00;
  }

  // 2. Water / Basic drinks: ฿7 - ฿15
  if (/น้ำเปล่า|น้ำดื่ม|น้ำสิงห์|น้ำทิพย์|น้ำแร่|water|mineral/i.test(kw)) {
    return 10.00;
  }
  if (/น้ำแข็ง|ice/i.test(kw)) {
    return 8.00;
  }
  if (/โซดา|soda/i.test(kw)) {
    return 12.00;
  }
  if (/นม|เป๊ปซี่|โค้ก|coke|cola|pepsi|sprite|fanta|ชา|tea|กาแฟ|coffee|drink|juice/i.test(kw)) {
    return 15.00;
  }

  // 3. Instant foods, noodles, ready meals: ฿7 - ฿85
  if (/มาม่า|ไวไว|ยำยำ|บะหมี่|noodle|ramen/i.test(kw)) {
    return 7.00;
  }
  if (/ไข่|ไข่ไก่|ไข่ต้ม|egg/i.test(kw)) {
    return 16.00;
  }
  if (/ขนมปัง|bread|sandwich|ซาลาเปา|ไส้กรอก|sausage/i.test(kw)) {
    return 29.00;
  }
  if (/ข้าวกล่อง|ข้าวผัด|เบนโตะ|ready\s*meal|bento/i.test(kw)) {
    return 45.00;
  }
  if (/ข้าวสาร|ข้าวหอมมะลิ|rice/i.test(kw)) {
    return 65.00;
  }

  // 4. General snacks / groceries / personal care / household: ฿15 - ฿85
  if (/เลย์|มันฝรั่ง|chips|pringles|snack|cookie|oreo|chocolate|ช็อกโกแลต|ขนม/i.test(kw)) {
    return 30.00;
  }
  if (/สบู่|soap|ยาสีฟัน|toothpaste|แปรงสีฟัน|toothbrush|แชมพู|shampoo/i.test(kw)) {
    return 18.00;
  }
  if (/ผงซักฟอก|detergent|น้ำยาล้างจาน|ทิชชู่|tissue|wipe/i.test(kw)) {
    return 35.00;
  }

  // 5. Standard fallback: ฿25 - ฿60
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fallback = 25 + (Math.abs(hash) % 36);
  return Number(fallback.toFixed(2));
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
    description: 'Instant on-demand convenience item • Verified & delivered 24/7',
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
      <span class="product-row-price">฿${prod.price.toFixed(2)}</span>
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
        <strong>Order custom "${escapeHtml(query)}" on demand (฿${dynProd.price.toFixed(2)})</strong>
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
  const formattedSubtotal = `฿${subtotal.toFixed(2)}`;
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
        <div class="cart-item-unit-price">฿${item.product.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty btn-minus" data-id="${item.product.id}" aria-label="Decrease quantity">−</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="btn-qty btn-plus" data-id="${item.product.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-subtotal">฿${lineTotal}</div>
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
  const formattedAmount = `฿${subtotal.toFixed(2)}`;

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
    user_id: state.userMode === 'member' ? state.memberProfile.id : null,
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

      showToast(`Order #${newOrder.id} placed! Mock external courier dispatched.`, 'success');

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
        <span class="track-item-price">฿${Number(item.subtotal || (item.unit_price * item.quantity)).toFixed(2)}</span>
      `;
      elements.trackItemsList.appendChild(row);
    });
  }

  const total = Number(order.total_amount || (order.pricing && order.pricing.total_amount) || 0).toFixed(2);
  elements.trackSubtotal.textContent = `฿${total}`;
  elements.trackTotal.textContent = `฿${total}`;
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
        <span class="history-order-total">฿${Number(order.total_amount).toFixed(2)}</span>
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

    const res = await fetch(`/api/admin/reports/sales?${params.toString()}`);
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
    const res = await fetch('/api/admin/reports/peak-hours');
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

