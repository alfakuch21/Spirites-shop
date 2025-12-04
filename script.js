// --- CONSTANTS ---
const MIN_AGE = 21;
const VERIFIED_COOKIE = 'age_verified';

// --- DOM ELEMENTS ---
const ageGate = document.getElementById('age-gate');
const verifyAgeBtn = document.getElementById('verify-age-btn');
const birthYearInput = document.getElementById('birth-year');
const ageWarning = document.getElementById('age-warning');

const featuredPage = document.getElementById('featured-products-page');
const fullStorePage = document.getElementById('full-store-page');
const aboutContactPage = document.getElementById('about-contact-page');
const aboutSection = document.getElementById('about-section');
const contactSection = document.getElementById('contact-section');

const productGrid = document.getElementById('products');
const featuredGrid = document.getElementById('featured-grid');
const cartCountSpan = document.getElementById('cart-count');
const cartItemsList = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const viewCartBtn = document.getElementById('view-cart-btn');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const clearCartBtn = document.getElementById('clear-cart-btn');

const categoryFilter = document.getElementById('category-filter');
const brandFilter = document.getElementById('brand-filter');

const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeModalBtn = document.querySelector('.close-modal-btn');
const modalTotalSpan = document.getElementById('modal-total');
const shippingForm = document.getElementById('shipping-form');

// --- DATA ---
const products = [
    { id: 1, name: "Cruxland Gin", category: "Spirits", brand: "Highland King", price: 6999.99, image: "images/Kwv-Cruxland.webp" },
    { id: 2, name: "Hennessy XO", category: "Spirits", brand: "Kraken's Reserve", price: 4550.50, image: "images/hennessy-xo.webp" },
    { id: 3, name: "Hennessy-VSOP", category: "Spirits", brand: "Botanist's", price: 3400.00, image: "images/hennessy-vsop.webp" },
    { id: 4, name: "Pyrat Rum", category: "Spirits", brand: "Crystal Clear", price: 2800.75, image: "images/pyrat-rum.webp" },
    { id: 5, name: "Black label", category: "Alcohol", brand: "Remy Martin", price: 9999.99, image: "images/cognac.jpg" },
    { id: 6, name: "Green Label", category: "Alcohol", brand: "Don Julio", price: 7999.99, image: "images/green label.webp" },
    { id: 7, name: "Dom Perignon", category: "Alcohol", brand: "Napa Valley", price: 1999.99, image: "images/dom-perignon.webp" },
    { id: 8, name: "Gold Of Mauritius", category: "Alcohol", brand: "Guinness", price: 1200.50, image: "images/gold-of-mauritius.webp" },
    { id: 9, name: "Coke", category: "Soft Drinks", brand: "Coke", price: 200.50, image: "images/coke.webp" },
    { id: 10, name: "Sprite", category: "Soft Drinks", brand: "Perrier", price: 1500.00, image: "images/sprite.webp" },
    { id: 11, name: "Guiness", category: "Alcohol", brand: "Guinness", price: 120.50, image: "images/7Ey-guiness can.webp" },
    { id: 12, name: "Jack Daniels", category: "Alcohol", brand: "Guiness", price: 200.50, image: "images/jack-daniels-honey.webp" },
    { id: 13, name: "Altar Wine", category: "Whines", brand: "Perrier", price: 300.00, image: "images/altar-wine.webp" },
    { id: 14, name: "New Amsterdam", category: "Whines", brand: "Guinness", price: 1200.50, image: "images/new-amsterdam.webp" },
    { id: 15, name: "Benedictine", category: "Alcohol", brand: "Guiness", price: 20000.50, image: "images/benedictine.webp" },
    { id: 16, name: "Monster", category: "Soft Drinks", brand: "Predator", price: 150.00, image: "images/monster-energy.webp" }
];

let cart = [];
let currentFilter = { category: 'All', brand: 'All' };

// --- HELPER FUNCTIONS ---

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
    console.log('setCookie called: ' + name + '=' + value + expires);
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
            const result = c.substring(nameEQ.length,c.length);
            console.log('getCookie found: ' + name + '=' + result);
            return result;
        }
    }
    console.log('getCookie not found: ' + name + ', all cookies: ' + document.cookie);
    return null;
}

function saveCart() {
    sessionStorage.setItem('spirits_shop_cart', JSON.stringify(cart));
}

function loadCart() {
    const stored = sessionStorage.getItem('spirits_shop_cart');
    if (stored) cart = JSON.parse(stored) || [];
}

function showToast(msg) {
    const x = document.getElementById("toast");
    x.innerText = msg;
    x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}

// --- INITIALIZATION & DISPLAY ---

function initStore() {
    loadCart();
    renderFilters();
    updateCartDisplay();
    renderFeaturedProducts();
}
function checkAgeGate() {
    // Clear both cart and verification on every page load (refresh)
    sessionStorage.removeItem('spirits_shop_cart');
    sessionStorage.removeItem(VERIFIED_COOKIE);
    
    // Initialize verification state as false (always start unverified on page load)
    window.ageVerified = false;
    // Create a small on-page indicator so you can see verification state without DevTools
    updateVerifiedIndicator();

    // Hide age gate on initial load (we only show it when user requests the store and isn't verified)
    ageGate.style.display = 'none';
    initStore();
    // Start on Home
    showPage('home');
}

// Adds or updates a small verification status indicator in the header
function updateVerifiedIndicator() {
    let header = document.querySelector('.main-header') || document.querySelector('header') || document.body;
    let el = document.getElementById('age-verified-indicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'age-verified-indicator';
        el.style.cssText = 'margin-left:12px; font-size:14px; color:#fff; display:inline-block; vertical-align:middle;';
        // Put it inside header (to the right of nav)
        header.appendChild(el);
    }
    el.innerText = window.ageVerified ? 'Verified ✅' : 'Not Verified ⛔';
}
function passAgeGate() {
    // 1. Persist verification in sessionStorage (clears on page refresh/session end)
    sessionStorage.setItem(VERIFIED_COOKIE, 'true');
    console.log('Age verified -> sessionStorage set:', sessionStorage.getItem(VERIFIED_COOKIE));

    // Update global flag and indicator
    window.ageVerified = true;
    updateVerifiedIndicator();

    // 2. Hide Gate
    ageGate.style.display = 'none';

    // 3. Show Store
    featuredPage.style.display = 'none';
    aboutContactPage.style.display = 'none';
    fullStorePage.style.display = 'block';

    // 4. Ensure products are rendered
    renderProducts();

    // 5. Scroll to top
    window.scrollTo(0, 0);
}

function handleAgeVerification() {
    const birthYear = parseInt(birthYearInput.value);
    const currentYear = new Date().getFullYear();
    if (!birthYear || (currentYear - birthYear < MIN_AGE)) {
        ageWarning.innerText = `You must be ${MIN_AGE}+ to enter.`;
        return;
    }
    passAgeGate();
}
function showPage(pageId) {
    console.log('=== showPage called with pageId:', pageId);

    // Ensure our global flag is initialized (in case showPage is called before DOMContentLoaded)
    if (typeof window.ageVerified === 'undefined') {
        window.ageVerified = (sessionStorage.getItem(VERIFIED_COOKIE) === 'true');
        updateVerifiedIndicator();
    }
    console.log('Verification check (global):', window.ageVerified);

    // If accessing store and NOT verified, show gate and stop.
    if (pageId === 'store' && !window.ageVerified) {
        console.log('Not verified - showing age gate');
        ageGate.style.display = 'flex';
        featuredPage.style.display = 'none';
        fullStorePage.style.display = 'none';
        aboutContactPage.style.display = 'none';
        return;
    }
    // Hide all pages and age gate
    featuredPage.style.display = 'none';
    fullStorePage.style.display = 'none';
    aboutContactPage.style.display = 'none';
    ageGate.style.display = 'none';
    
    // Show target
    if (pageId === 'home') {
        featuredPage.style.display = 'block';
    } else if (pageId === 'store') {
        fullStorePage.style.display = 'block';
        renderProducts(); // Make sure products show up!
    } else if (pageId === 'about-contact') {
        aboutContactPage.style.display = 'block';
        showSubSection('about');
    }
    
    cartSidebar.classList.remove('open');
}

function showSubSection(id) {
    aboutSection.style.display = (id === 'about') ? 'block' : 'none';
    contactSection.style.display = (id === 'contact') ? 'block' : 'none';
}

// --- RENDER FUNCTIONS ---

function renderFeaturedProducts() {
    if (!featuredGrid) return;
    featuredGrid.innerHTML = '';
    products.slice(0, 3).forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p class="price">Ksh${p.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
        `;
        featuredGrid.appendChild(div);
    });
}

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    const filtered = products.filter(p => {
        const cat = currentFilter.category === 'All' || p.category === currentFilter.category;
        const brand = currentFilter.brand === 'All' || p.brand === currentFilter.brand;
        return cat && brand;
    });
    
    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p class="product-meta">${p.brand}</p>
            <p class="price">Ksh${p.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
        `;
        productGrid.appendChild(div);
    });
}

function renderFilters() {
    if (!categoryFilter || !brandFilter) return;
    const cats = ['All', ...new Set(products.map(p => p.category))];
    const brands = ['All', ...new Set(products.map(p => p.brand))];
    
    categoryFilter.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    brandFilter.innerHTML = brands.map(b => `<option value="${b}">${b}</option>`).join('');
    
    categoryFilter.value = currentFilter.category;
    brandFilter.value = currentFilter.brand;
}

// --- CART LOGIC ---
function addToCart(id) {
    // Check if user is verified before allowing cart additions
    if (!window.ageVerified) {
        showToast('Please go to our store and verify your age first to add items to cart');
        return;
    }

    const productID = parseInt(id);
    const product = products.find(p => p.id === productID);
    
    if (!product) {
        console.error("Product not found for ID:", id);
        return;
    }

    const existing = cart.find(i => i.id === productID);
    if (existing) {
        existing.quantity++;
    } else {
        // Push a clean copy of the product object
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartDisplay();
    saveCart();
    showToast(`${product.name} added!`);
}
function updateCartDisplay() {
    cartItemsList.innerHTML = '';
    let total = 0;
    let count = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        
        const li = document.createElement('li');
        li.className = 'cart-item-detail';
        li.innerHTML = `
            <div class="item-name-price">
                <span class="item-name">${item.name}</span>
                <span class="item-price">Ksh${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="item-controls">
                <button class="decrease-btn" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-btn" data-id="${item.id}">+</button>
            </div>
        `;
        cartItemsList.appendChild(li);
    });

    cartTotalSpan.innerText = total.toFixed(2);
    cartCountSpan.innerText = count;
    checkoutBtn.disabled = cart.length === 0;
}

function changeQty(id, delta) {
    const idx = cart.findIndex(i => i.id === parseInt(id));
    if (idx === -1) return;
    
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    
    updateCartDisplay();
    saveCart();
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCart();
    showToast('Cart cleared!');
}

// --- EVENT DELEGATION (The Key Fix) ---

document.addEventListener('click', (e) => {
    // 1. Add to Cart Button
    if (e.target.classList.contains('add-to-cart-btn')) {
        addToCart(e.target.dataset.id);
    }
    
    // 2. Cart Increase
    if (e.target.classList.contains('increase-btn')) {
        changeQty(e.target.dataset.id, 1);
    }
    
    // 3. Cart Decrease
    if (e.target.classList.contains('decrease-btn')) {
        changeQty(e.target.dataset.id, -1);
    }
    
    // 4. Navigation Links
    if (e.target.tagName === 'A' && e.target.dataset.page) {
        e.preventDefault();
        showPage(e.target.dataset.page);
    }
    
    // 5. Sub Navigation
    if (e.target.tagName === 'A' && e.target.dataset.section) {
        e.preventDefault();
        showSubSection(e.target.dataset.section);
    }
    
    // 6. Close Modal (Outside click)
    if (e.target === checkoutModal) {
        checkoutModal.classList.remove('show-modal');
    }
});

// --- STATIC LISTENERS ---

verifyAgeBtn.addEventListener('click', handleAgeVerification);
viewCartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
clearCartBtn.addEventListener('click', clearCart);

checkoutBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    modalTotalSpan.innerText = cartTotalSpan.innerText;
    checkoutModal.classList.add('show-modal');
});
closeModalBtn.addEventListener('click', () => checkoutModal.classList.remove('show-modal'));

categoryFilter.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    renderProducts();
});
brandFilter.addEventListener('change', (e) => {
    currentFilter.brand = e.target.value;
    renderProducts();
});

shippingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Order Confirmed!");
    cart = [];
    updateCartDisplay();
    saveCart();
    checkoutModal.classList.remove('show-modal');
});

// --- START ---
document.addEventListener('DOMContentLoaded', checkAgeGate);