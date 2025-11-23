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
  const secondCheckoutBtn = document.getElementById('secondCheckoutBtn');
  const continueOverlay = document.getElementById('continue_overlay');

  // Run only if on the cart page
  if (!cartContainer) return;

  // ============================
  // BACK TO MENU BUTTON - ADD THIS HERE
  // ============================
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
      window.location.href = '../get_order/get_order.php';
    });
  }

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
        <div class="cart-item-card">

          <div class="cart-item-left">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-details">
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-price">Php ${item.price.toFixed(2)}</p>
            </div>
          </div>

          <div class="cart-item-right">
            <button class="btn-quantity plus-btn" data-index="${index}">+</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="btn-quantity minus-btn" data-index="${index}">-</button>
          </div>

        </div>
      </div>`;


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
        window.location.href = '../sign_in/sign_in.php?return=checkout';
    });

    signUpBtn?.addEventListener('click', () => {
        window.location.href = '../sign_up/sign_up.php';
    });

    guestBtn?.addEventListener('click', () => {
        window.location.href = '../checkout/checkout.php';
    });
  });

secondCheckoutBtn?.addEventListener('click', () => {

    // Check session 
    if (window.userData.isLoggedIn) {
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
        window.location.href = '../sign_in/sign_in.php?return=checkout';
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
    sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    location.reload();
    return;
  }

  // Update sessionStorage immediately (this ensures get_order will read the latest)
  sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));

  // Recalculate and update totals
  let newSubtotal = 0;
  selectedItems.forEach(item => {
    newSubtotal += item.price * item.quantity;
  });

  sessionStorage.setItem('cartSubtotal', newSubtotal.toFixed(2));
  
  // Update totals
  const deliveryFee = parseFloat(sessionStorage.getItem('deliveryFee')) || 0;
  const total = newSubtotal + deliveryFee;
  sessionStorage.setItem('cartTotal', total.toFixed(2));

  // Reload to refresh display
  location.reload();
}

  // ============================
  // Profile button - redirect to profile page
  // ============================
  const myProfileBtn = document.getElementById('myProfile');
  if (myProfileBtn) {
    myProfileBtn.addEventListener('click', () => {
      // Get customer ID from session data (made available in the PHP file)
      const customerID = window.userData.customerID;
      
      // Option 2: Store in sessionStorage (uncomment if preferred)
      sessionStorage.setItem('customer_id', customerID);
      window.location.href = '../personal_info/personal_info.php';
    });
  }

  // ============================
  // Logout
  // ============================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
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
  }

  // ============================
  // Login button - redirect to login page
  // ============================
  const logInBtn = document.getElementById("logIn");
  if (logInBtn) {
    logInBtn.addEventListener("click", function() {
      window.location.href = '../sign_in/sign_in.php?return=view_cart';
    });
  }