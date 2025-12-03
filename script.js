/* Name: Deshawn Bryan */

// ------------------ CART FUNCTIONS ------------------ //
//Retrieves cart from local storage, returns empty array if no cart exists
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

//Saves cart to local storage under key "cart"
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

//Calculates total item quantity, and updates the cart icon badge in navbar
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

//Adds a product to the cart
function addToCart(name, price, img) {
  let cart = getCart();
  const existing = cart.find(item => item.name === name);
  const imagePath = img.startsWith('../Assets/') ? img : `../Assets/${img}`;
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, img: imagePath });
  }
  saveCart(cart);
  updateCartBadge();
  alert(`${name} added to cart!`);
}

updateCartBadge();

// ------------------ CART PAGE ------------------ //
const cartBody = document.getElementById('cart-body');
const cartSummary = document.getElementById('cart-summary');
const DISCOUNT_RATE = 0.1;
const TAX_RATE = 0.15;

//Displays cart contents in the table and calculates totals
function renderCart() {
  if (!cartBody) return;

  let cart = getCart();
  cartBody.innerHTML = '';

  let subtotalSum = 0;
  let discountSum = 0;
  let taxSum = 0;
  let totalSum = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    const discount = subtotal * DISCOUNT_RATE;
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    subtotalSum += subtotal;
    discountSum += discount;
    taxSum += tax;
    totalSum += total;

    const row = document.createElement('tr');
    const imagePath = item.img.startsWith('../Assets/') ? item.img : `../Assets/${item.img}`;
    row.innerHTML = `
      <td><img src="${imagePath}" alt="${item.name}"></td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" class="quantity-input" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)"></td>
      <td>$${subtotal.toFixed(2)}</td>
      <td>$${discount.toFixed(2)}</td>
      <td>$${tax.toFixed(2)}</td>
      <td>$${total.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    cartBody.appendChild(row);
  });

  if (cartSummary) {
    cartSummary.innerHTML = `
      <h3>Summary</h3>
      <p>Subtotal: $${subtotalSum.toFixed(2)}</p>
      <p>Total Discount: $${discountSum.toFixed(2)}</p>
      <p>Total Tax: $${taxSum.toFixed(2)}</p>
      <p><strong>Grand Total: $${totalSum.toFixed(2)}</strong></p>
    `;
  }

  updateCartBadge();
}

//updates the quantity of a cart item
function updateQty(index, value) {
  let cart = getCart();
  cart[index].qty = Math.max(1, parseInt(value) || 1);
  saveCart(cart);
  renderCart();
}

//removes a single item from the cart
function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

//Redirects to checkout if cart is not empty
function goToCheckout() {
  let cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

if (cartBody) renderCart();

// ------------------ LOGIN ------------------ //
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === "" || password === "") {
      alert("Please enter both username and password.");
      return;
    }
    localStorage.setItem('username', username);
    alert(`Welcome, ${username}!`);
    loginForm.reset();
    window.location.href = "product.html";
  });
}
 

// ------------------ REGISTER ------------------ //
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const fullname = registerForm.fullname.value.trim();
    const dob = registerForm.dob.value;
    const email = registerForm.email.value.trim();
    let username = registerForm.username.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm['confirm-password'].value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }


    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ fullname, dob, email, username, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert(`Registration successful for ${fullname}!`);
    registerForm.reset();
    window.location.href = "product.html";
  });
}

// ------------------ CHECKOUT ------------------ //
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutSummary = document.getElementById('cart-summary');

if (checkoutForm) {
  renderCheckoutItems();
  renderCheckoutSummary();

  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const amount = document.getElementById('amount').value.trim();

    if (!name || !address || !city || !zip || !amount) {
      alert("Please fill out all fields correctly.");
      return;
    }

    alert(`Thank you ${name}! Your order has been placed.`);
    window.location.href = "invoice.html";
  });

  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => window.location.href = "cart.html");
  }

  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('cart');
      renderCheckoutItems();
      renderCheckoutSummary();
    });
  }

  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.location.href = "index.html");
  }
}

//Displays items in checkout page
function renderCheckoutItems() {
  if (!checkoutItems) return;

  const cart = getCart();
  checkoutItems.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
    if (checkoutTotal) checkoutTotal.textContent = '$0.00';
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'checkout-item';
    const imagePath = item.img.startsWith('../Assets/') ? item.img : `../Assets/${item.img}`;
    div.innerHTML = `
      <img src="${imagePath}" alt="${item.name}">
      <p>${item.name} (x${item.qty})</p>
      <p>$${itemTotal.toFixed(2)}</p>
    `;
    checkoutItems.appendChild(div);
  });

  if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

//Displays final totals
function renderCheckoutSummary() {
  if (!checkoutSummary) return;

  const cart = getCart();
  let subtotalSum = 0;
  let discountSum = 0;
  let taxSum = 0;
  let totalSum = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    const discount = subtotal * DISCOUNT_RATE;
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    subtotalSum += subtotal;
    discountSum += discount;
    taxSum += tax;
    totalSum += total;
  });

  checkoutSummary.innerHTML = `
    <h3>Cart Summary</h3>
    <p>Subtotal: $${subtotalSum.toFixed(2)}</p>
    <p>Total Discount: $${discountSum.toFixed(2)}</p>
    <p>Total Tax: $${taxSum.toFixed(2)}</p>
    <p><strong>Grand Total: $${totalSum.toFixed(2)}</strong></p>
  `;
}

// ---------- HELPERS & PRODUCT INIT ---------- //
function getLS(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function setLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function formatCurrency(n){ return `$${Number(n).toFixed(2)}`; }
const TRN_REGEX = /^\d{3}-\d{3}-\d{3}$/;

(function ensureProducts() {
  let all = getLS('AllProducts');
  if (all.length === 0) {
    const sample = [
      { id: 'P001', name: 'Logitech Mouse', price: 25, description: 'Comfortable ambidextrous wireless mouse', image: '../Assets/mouse1.png', category: 'Mouses' },
      { id: 'P002', name: 'TECKNET Ergonomic Mouse', price: 30, description: 'Vertical ergonomic mouse', image: '../Assets/mouse2.png', category: 'Mouses' },
      { id: 'P003', name: 'AeroCurve Pro', price: 20, description: 'Curved gaming mousepad', image: '../Assets/mouse3.png', category: 'Mouses' },
      { id: 'P004', name: 'Perixx Keyboard', price: 80, description: 'Split-key keyboard', image: '../Assets/keyboard1.png', category: 'Keyboards' },
      { id: 'P005', name: 'Incase Sculpt Ergonomic Keyboard', price: 90, description: 'Sculpt ergonomic keyboard', image: '../Assets/keyboard2.png', category: 'Keyboards' },
      { id: 'P006', name: 'PatioMage Ergonomic Office Chair', price: 200, description: 'Full adjust ergonomic office chair', image: '../Assets/chair1.png', category: 'Chairs' }
    ];
    setLS('AllProducts', sample);
  }
})();

// ---------- REGISTER / LOGIN / PASSWORD RESET ----------
function calculateAge(dobStr) { const dob = new Date(dobStr); const diff = Date.now() - dob.getTime(); const ageDt = new Date(diff); return Math.abs(ageDt.getUTCFullYear() - 1970); }

function registerUser(form) {
  const fname = form.firstName?.value?.trim() || '';
  const lname = form.lastName?.value?.trim() || '';
  const dob = form.dob?.value || '';
  const gender = form.gender?.value || '';
  const phone = form.phone?.value?.trim() || '';
  const email = form.email?.value?.trim() || '';
  const trn = form.trn?.value?.trim() || '';
  const password = form.password?.value || '';
  const confirmPassword = form['confirm-password']?.value || '';

  if (!fname || !lname || !dob || !gender || !phone || !email || !trn || !password || !confirmPassword) { alert('Please fill in all fields.'); return false; }
  if (password.length < 8) { alert('Password must be at least 8 characters.'); return false; }
  if (password !== confirmPassword) { alert('Passwords do not match.'); return false; }
  if (!TRN_REGEX.test(trn)) { alert('TRN must be in the format 000-000-000'); return false; }

  const age = calculateAge(dob);
  if (age < 18) { alert('You must be at least 18 years old to register.'); return false; }

  const regs = getLS('RegistrationData');
  if (regs.some(r => r.trn === trn)) { alert('TRN already registered.'); return false; }

  const user = { firstName: fname, lastName: lname, dob, gender, phone, email, trn, password, dateRegistered: new Date().toISOString(), cart: [] };
  regs.push(user);
  setLS('RegistrationData', regs);
  alert(`Registration successful for ${fname} ${lname}`);
  if (form.reset) form.reset();
  window.location.href = 'product.html';
  return true;
}

function attemptLogin(form) {
  const trn = form.trn?.value?.trim() || '';
  const password = form.password?.value || '';
  if (!trn || !password) { alert('Please enter TRN and password'); return false; }

  const lockedList = getLS('LockedAccounts');
  if (lockedList.includes(trn)) { alert('Account is locked.'); window.location.href='account-locked.html'; return false; }

  const regs = getLS('RegistrationData');
  const user = regs.find(u => u.trn === trn && u.password === password);

  const attemptsKey = `loginAttempts_${trn}`;
  let attempts = Number(sessionStorage.getItem(attemptsKey) || 0);

  if (!user) {
    attempts += 1;
    sessionStorage.setItem(attemptsKey, attempts);
    if (attempts >= 3) {
      const locked = getLS('LockedAccounts');
      locked.push(trn);
      setLS('LockedAccounts', locked);
      alert('Your account has been locked after 3 failed attempts.');
      window.location.href='account-locked.html';
      return false;
    } else { alert(`Incorrect TRN or password. Attempt ${attempts} of 3.`); return false; }
  }

  sessionStorage.setItem('loggedInTRN', trn);
  sessionStorage.removeItem(attemptsKey);
  alert(`Welcome back, ${user.firstName}!`);
  window.location.href = 'product.html';
  return true;
}

function resetPasswordPrompt() {
  const trn = prompt('Enter your TRN (000-000-000):');
  if (!trn) return;
  if (!TRN_REGEX.test(trn)) { alert('TRN format invalid.'); return; }
  const regs = getLS('RegistrationData');
  const idx = regs.findIndex(u => u.trn === trn);
  if (idx === -1) { alert('TRN not found.'); return; }
  const dob = prompt('Enter your Date of Birth (YYYY-MM-DD) for verification:');
  if (!dob) return;
  if (regs[idx].dob !== dob) { alert('DOB does not match our records.'); return; }
  const newPass = prompt('Enter your new password (min 8 chars):');
  if (!newPass || newPass.length < 8) { alert('Password too short.'); return; }
  regs[idx].password = newPass;
  setLS('RegistrationData', regs);
  let locked = getLS('LockedAccounts');
  locked = locked.filter(t => t !== trn);
  setLS('LockedAccounts', locked);
  alert('Password reset successful. You can now login.');
}

// ---------- Bootstrapping ----------
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
  renderCheckoutItems();
  renderCheckoutSummary();
});

//ADD
// ------------------ INVOICE FUNCTIONS ------------------ //

// Generate and save invoice after successful checkout
function generateInvoice(customerData, cart) {
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toISOString();
  const loggedTRN = sessionStorage.getItem('loggedInTRN') || 'GUEST';
  
  let subtotalSum = 0;
  let discountSum = 0;
  let taxSum = 0;
  let totalSum = 0;

  const items = cart.map(item => {
    const subtotal = item.price * item.qty;
    const discount = subtotal * DISCOUNT_RATE;
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    subtotalSum += subtotal;
    discountSum += discount;
    taxSum += tax;
    totalSum += total;

    return {
      name: item.name,
      price: item.price,
      qty: item.qty,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      img: item.img
    };
  });

  const invoice = {
    invoiceNumber,
    invoiceDate,
    trn: loggedTRN,
    customerName: customerData.name,
    customerAddress: customerData.address,
    customerCity: customerData.city,
    customerZip: customerData.zip,
    items,
    subtotal: subtotalSum,
    totalDiscount: discountSum,
    totalTax: taxSum,
    grandTotal: totalSum
  };

  // Save to localStorage
  const invoices = getLS('Invoices');
  invoices.push(invoice);
  setLS('Invoices', invoices);

  return invoice;
}

// Display invoice on invoice.html page
function displayInvoice() {
  const invoiceDisplay = document.getElementById('invoice-container');
  if (!invoiceDisplay) return;

  const invoices = getLS('Invoices');
  if (invoices.length === 0) {
    
    invoiceDisplay.innerHTML = '<p>No invoices found.</p>';
    return;
  }

  // Display the most recent invoice
  const invoice = invoices[invoices.length - 1];
  
  let itemsHTML = '';
  invoice.items.forEach(item => {
    itemsHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(item.subtotal)}</td>
        <td>${formatCurrency(item.discount)}</td>
        <td>${formatCurrency(item.tax)}</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>
    `;
  });

  invoiceDisplay.innerHTML = `
    <div class="invoice-container">
      <div class="invoice-header">
        <h2>INVOICE</h2>
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
      </div>
      
      <div class="invoice-customer">
        <h3>Bill To:</h3>
        <p><strong>${invoice.customerName}</strong></p>
        <p>${invoice.customerAddress}</p>
        <p>${invoice.customerCity}, ${invoice.customerZip}</p>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Discount</th>
            <th>Tax</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="invoice-summary">
        <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
        <p><strong>Total Discount (10%):</strong> ${formatCurrency(invoice.totalDiscount)}</p>
        <p><strong>Total Tax (15%):</strong> ${formatCurrency(invoice.totalTax)}</p>
        <p class="invoice-grand-total"><strong>Grand Total:</strong> ${formatCurrency(invoice.grandTotal)}</p>
      </div>

      <div class="invoice-actions">
        <button class="btn btn-primary" onclick="printInvoice()">Print Invoice</button>
        <button class="btn btn-secondary" onclick="window.location.href='product.html'">Continue Shopping</button>
      </div>
    </div>
  `;
}

// Print invoice
function printInvoice() {
  window.print();
}

// Get user-specific invoices
function GetUserInvoices(trn) {
  const userInvoicesDiv = document.getElementById('user-invoices');
  if (!userInvoicesDiv) return;

  const allInvoices = getLS('Invoices');
  const userInvoices = allInvoices.filter(inv => inv.trn === trn);

  if (userInvoices.length === 0) {
    userInvoicesDiv.innerHTML = '<p>You have no invoices yet.</p>';
    return;
  }

  let html = '';
  userInvoices.forEach(invoice => {
    html += `
      <div class="invoice-summary">
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Total:</strong> ${formatCurrency(invoice.grandTotal)}</p>
        <p><strong>Items:</strong> ${invoice.items.length}</p>
      </div>
    `;
  });

  userInvoicesDiv.innerHTML = html;
}

// ------------------ DASHBOARD FUNCTIONS ------------------ //

// Display all invoices on dashboard
function displayAllInvoices() {
  const invoicesListDiv = document.getElementById('invoices-list');
  if (!invoicesListDiv) return;

  const allInvoices = getLS('Invoices');
  
  if (allInvoices.length === 0) {
    invoicesListDiv.innerHTML = '<p>No invoices in system.</p>';
    return;
  }

  let html = '';
  allInvoices.forEach(invoice => {
    html += `
      <div class="invoice-summary">
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Customer:</strong> ${invoice.customerName}</p>
        <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Total:</strong> ${formatCurrency(invoice.grandTotal)}</p>
      </div>
    `;
  });

  invoicesListDiv.innerHTML = html;
}

// Display gender frequency chart
function displayGenderChart() {
  const genderChartDiv = document.getElementById('gender-chart');
  if (!genderChartDiv) return;

  const users = getLS('RegistrationData');
  
  if (users.length === 0) {
    genderChartDiv.innerHTML = '<p>No user data available.</p>';
    return;
  }

  const genderCount = { Male: 0, Female: 0, Other: 0 };
  
  users.forEach(user => {
    if (genderCount.hasOwnProperty(user.gender)) {
      genderCount[user.gender]++;
    }
  });

  const total = users.length;
  let html = '';

  Object.keys(genderCount).forEach(gender => {
    const count = genderCount[gender];
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
    const width = `${percentage}%`;
    
    html += `
      <div class="chart-row">
        <span class="chart-label">${gender}</span>
        <div class="chart-bar" style="width: ${width}">
          ${count} 
        </div>
        (${percentage}%)
      </div>
    `;
  });

  genderChartDiv.innerHTML = html;
}

// Display age group frequency chart
function displayAgeChart() {
  const ageChartDiv = document.getElementById('age-chart');
  if (!ageChartDiv) return;

  const users = getLS('RegistrationData');
  
  if (users.length === 0) {
    ageChartDiv.innerHTML = '<p>No user data available.</p>';
    return;
  }

  const ageGroups = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '56+': 0
  };

  users.forEach(user => {
    const age = calculateAge(user.dob);
    
    if (age >= 18 && age <= 25) ageGroups['18-25']++;
    else if (age >= 26 && age <= 35) ageGroups['26-35']++;
    else if (age >= 36 && age <= 45) ageGroups['36-45']++;
    else if (age >= 46 && age <= 55) ageGroups['46-55']++;
    else if (age >= 56) ageGroups['56+']++;
  });

  const total = users.length;
  let html = '';

  Object.keys(ageGroups).forEach(group => {
    const count = ageGroups[group];
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
    const width = `${percentage}%`;
    
    html += `
      <div class="chart-row">
        <span class="chart-label">${group} years</span>
        <div class="chart-bar" style="width: ${width}">
          ${count} 
        </div>
            <span style="margin-left: 10px;">(${percentage}%)</span>
      </div>
    `;
  });

  ageChartDiv.innerHTML = html;
}

// Initialize dashboard
function initializeDashboard() {
  displayGenderChart();
  displayAgeChart();
  displayAllInvoices();
}

// Update checkout to generate invoice
const originalCheckoutSubmit = checkoutForm?.addEventListener;
if (checkoutForm) {
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const amount = document.getElementById('amount').value.trim();

    if (!name || !address || !city || !zip || !amount) {
      alert("Please fill out all fields correctly.");
      return;
    }

    const cart = getCart();
    const customerData = { name, address, city, zip };
    
    // Generate invoice before clearing cart
    generateInvoice(customerData, cart);

    alert(`Thank you ${name}! Your order has been placed.`);
    localStorage.removeItem('cart');
    window.location.href = "invoice.html";
  });
}



// Run dashboard initialization on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('gender-chart')) {
    initializeDashboard();
  }
  
  if (document.getElementById('invoice-container')) {
    displayInvoice();
  }
});