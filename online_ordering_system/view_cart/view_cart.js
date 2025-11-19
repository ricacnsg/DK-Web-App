// ============================
// CART PAGE LOGIC
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cartContainer');
  const summaryContainer = document.getElementById('summaryContainer');
  const cartTotalElement = document.getElementById('cartTotal');
  const cartSubtotalElement = document.getElementById('cartSubtotal');
  const deliveryFeeElement = document.getElementById('deliveryFee');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const continueOverlay = document.getElementById('continue_overlay');

  // Run only if on the cart page
  if (!cartContainer) return;

  // Get items from sessionStorage
  const selectedItems = JSON.parse(sessionStorage.getItem('selectedItems')) || [];

  if (selectedItems.length === 0) {
    cartContainer.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">Your cart is empty 😢</p>
        <a href="../get_order/get_order.php" class="btn back-buttons mt-3">Go Back to Menu</a>
      </div>`;
    return;
  }

  // Reset subtotal
  let subtotal = 0;

  // Display each item
  selectedItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const card = `
      <div class="cart-item mb-3" data-index="${index}">
        <div class="cart-item-card d-flex align-items-center justify-content-between rounded-5">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <img src="${item.img}" class="cart-item-img rounded-4" alt="${item.name}">
            <div class="cart-item-details">
              <p class="cart-item-name mb-0 fw-bold">${item.name}</p>
              <p class="cart-item-price mb-0">₱${item.price.toFixed(2)}</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn-quantity minus-btn rounded-circle" data-index="${index}">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity-display fw-bold fs-5">${item.quantity}</span>
            <button class="btn-quantity plus-btn rounded-circle" data-index="${index}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    cartContainer.insertAdjacentHTML('beforeend', card);

    const summaryRow = `
      <div class="d-flex justify-content-between">
        <span>${item.name} x ${item.quantity}</span>
        <span>₱${itemTotal.toFixed(2)}</span>
      </div>`;
    summaryContainer.insertAdjacentHTML('beforeend', summaryRow);
  });

  // Update subtotal
  cartSubtotalElement.textContent = `₱${subtotal.toFixed(2)}`;

  // Initialize delivery fee as 0.00 
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  // Save to sessionStorage
  sessionStorage.setItem('deliveryFee', deliveryFee.toFixed(2));
  sessionStorage.setItem('cartSubtotal', subtotal.toFixed(2));
  sessionStorage.setItem('cartTotal', total.toFixed(2));

  // Update UI
  deliveryFeeElement.textContent = `₱${deliveryFee.toFixed(2)}`;
  cartTotalElement.textContent = `₱${total.toFixed(2)}`;

  // Quantity button logic
  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      updateQuantity(index, 1);
    });
  });

  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      updateQuantity(index, -1);
    });
  });

  // Checkout button
  checkoutBtn?.addEventListener('click', () => {

    // Check session 
    if (window.userData.isLoggedIn) {
        // if user is logged in → go directly to checkout
        window.location.href = '../checkout/checkout.php';
        return;
    }

    // if user is NOT logged in, show modal
    sessionStorage.setItem("returnTo", "checkout");
    continueOverlay.style.display = 'flex';

    const logInBtn = document.getElementById('logInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const guestBtn = document.getElementById('guestBtn');

    logInBtn?.addEventListener('click', () => {
        window.location.href = '../sign_in/sign_in.php';
    });

    signUpBtn?.addEventListener('click', () => {
        window.location.href = '../sign_up/sign_up.php';
    });

    guestBtn?.addEventListener('click', () => {
        window.location.href = '../checkout/checkout.php';
    });
  });


  continueOverlay.addEventListener('click', (e) => {
    if (e.target === continueOverlay) {
      continueOverlay.style.display = 'none';
    }
  });
});

// ============================
// Quantity Update Function
// ============================
function updateQuantity(index, change) {
  const selectedItems = JSON.parse(sessionStorage.getItem('selectedItems')) || [];

  if (!selectedItems[index]) return;

  selectedItems[index].quantity += change;

  // Remove item if quantity hits 0
  if (selectedItems[index].quantity <= 0) {
    selectedItems.splice(index, 1);
  }

  // Recalculate subtotal
  let newSubtotal = 0;
  selectedItems.forEach(item => {
    newSubtotal += item.price * item.quantity;
  });

  // Update sessionStorage
  sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
  sessionStorage.setItem('cartSubtotal', newSubtotal.toFixed(2));

  // Reload to refresh display
  location.reload();
}

// ============================
//  MENU PAGE LOGIC
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menuItemContainer');
  if (!menuContainer) return; // Run only on menu page

  loadMenu(); // Load all menu items initially
});

function loadMenu(filter = 'all') {
  fetch(`../../../controllers/customer_controllers/ordering_controllers/get_order.php?filter=${filter}`)
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('menuItemContainer');
      container.innerHTML = html;
      attachQuantityEvents();
    })
    .catch(error => {
      console.error('Error loading menu items:', error);
      document.getElementById('menuItemContainer').innerHTML =
        '<div class="col-12 text-center"><p class="text-danger">Error loading menu items</p></div>';
    });
}

// ============================
// Quantity Controls (Menu)
// ============================
function attachQuantityEvents() {
  const quantityControls = document.querySelectorAll('.quantity-control');

  quantityControls.forEach(control => {
    const minusBtn = control.querySelector('.minus-btn');
    const plusBtn = control.querySelector('.plus-btn');
    const display = control.querySelector('.quantity-display');

    minusBtn.addEventListener('click', () => {
      let currentValue = parseInt(display.textContent);
      if (currentValue > 0) display.textContent = currentValue - 1;
    });

    plusBtn.addEventListener('click', () => {
      let currentValue = parseInt(display.textContent);
      display.textContent = currentValue + 1;
    });
  });
}

// ============================
// Logout
// ============================
document.getElementById("logoutBtn").addEventListener("click", function() {
  // If logged in → confirm logout
  Swal.fire({
    title: "Log Out?",
    text: "Are you sure you want to log out?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, log out",
    cancelButtonText: "Cancel"
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/controllers/sign_out.php";
    }
  });
});
