function loadMenu(filter = 'all', search = '') {
  fetch(`../../../controllers/customer_controllers/ordering_controllers/load_menu.php?filter=${encodeURIComponent(filter)}&search=${encodeURIComponent(search)}`)
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('menuItemContainer');
      container.innerHTML = html;
      attachQuantityEvents();
      attachSorter();
      restoreCartQuantities(); // ← ADD THIS LINE
    })
    .catch(error => {
      console.error('Error loading menu:', error);
      document.getElementById('menuItemContainer').innerHTML =
        '<div class="col-12 text-center"><p class="text-danger">Error loading menu items.</p></div>';
    });
}

// Quantity plus/minus buttons
function attachQuantityEvents() {
  document.querySelectorAll('.quantity-control').forEach(control => {
    const minus = control.querySelector('.minus-btn');
    const plus = control.querySelector('.plus-btn');
    const display = control.querySelector('.quantity-display');

    minus.addEventListener('click', () => {
      let val = parseInt(display.textContent);
      if (val > 0) display.textContent = val - 1;
    });

    plus.addEventListener('click', () => {
      let val = parseInt(display.textContent);
      display.textContent = val + 1;
    });
  });
}

// Restore quantities from sessionStorage
function restoreCartQuantities() {
  const selectedItems = JSON.parse(sessionStorage.getItem('selectedItems')) || [];
  
  console.log('Restoring quantities for:', selectedItems); // Debug log
  
  selectedItems.forEach(cartItem => {
    // Try multiple selectors to find the menu item
    let menuCard = document.querySelector(`.card-body[data-id="${cartItem.id}"]`);
    
    if (!menuCard) {
      // Try finding by data-id on parent elements
      menuCard = document.querySelector(`[data-id="${cartItem.id}"] .card-body`);
    }
    
    if (!menuCard) {
      // Try finding in the entire card structure
      const allCards = document.querySelectorAll('.card-body');
      allCards.forEach(card => {
        if (card.dataset.id === cartItem.id || 
            card.parentElement.dataset.id === cartItem.id ||
            card.closest('[data-id]')?.dataset.id === cartItem.id) {
          menuCard = card;
        }
      });
    }
    
    if (menuCard) {
      // find quantity display in various locations
      let quantityDisplay = menuCard.querySelector('.quantity-display');
      
      if (!quantityDisplay) {
        quantityDisplay = menuCard.parentElement.querySelector('.quantity-display');
      }
      
      if (!quantityDisplay) {
        quantityDisplay = menuCard.closest('.card, .menu-item')?.querySelector('.quantity-display');
      }
      
      if (quantityDisplay) {
        console.log(`Setting quantity for item ${cartItem.id} to ${cartItem.quantity}`); // Debug log
        quantityDisplay.textContent = cartItem.quantity;
      } else {
        console.warn(`Could not find quantity display for item ${cartItem.id}`);
      }
    } else {
      console.warn(`Could not find menu card for item ${cartItem.id}`);
    }
  });
}

// Sorting
function attachSorter() {
  const sorter = document.getElementById('menuSorter');
  if (!sorter) return;

  // Remove existing listener to avoid duplicates
  const newSorter = sorter.cloneNode(true);
  sorter.parentNode.replaceChild(newSorter, sorter);

  const container = document.getElementById('menuItemContainer');
  newSorter.addEventListener('change', () => {
    const items = Array.from(container.querySelectorAll('.menu-item'));
    const val = newSorter.value;

    items.sort((a, b) => {
      const nameA = a.dataset.name ? a.dataset.name.toLowerCase() : '';
      const nameB = b.dataset.name ? b.dataset.name.toLowerCase() : '';
      const priceA = parseFloat(a.dataset.price) || 0;
      const priceB = parseFloat(b.dataset.price) || 0;

      switch (val) {
        case 'name_asc': return nameB.localeCompare(nameA);
        case 'name_desc': return nameA.localeCompare(nameB);
        case 'price_asc': return priceB - priceA;
        case 'price_desc': return priceA - priceB;
        default: return 0;
      }
    });

    container.innerHTML = '';
    items.forEach(i => container.appendChild(i));
    
    //  restore quantities after sorting
    restoreCartQuantities();
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  let currentFilter = 'all';

  loadMenu(currentFilter, '');

  // ============================
  // Filter buttons
  // ============================
  document.querySelectorAll('.menu-button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.menu-button').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentFilter = e.currentTarget.dataset.filter;
      loadMenu(currentFilter, searchInput.value.trim());
    });
  });

  // ============================
  // Search input
  // ============================
  searchInput.addEventListener('input', () => {
    loadMenu(currentFilter, searchInput.value.trim());
  });

  // ============================
  // Proceed button
  // ============================
  document.getElementById('viewCartBtn').addEventListener('click', () => {
    const selectedItems = [];
    document.querySelectorAll('.card-body').forEach(card => {
      const quantity = parseInt(card.parentElement.querySelector('.quantity-display').textContent);
      if (quantity > 0) {
        selectedItems.push({
          id: card.dataset.id,
          name: card.querySelector('.menuitem-name').textContent,
          price: parseFloat(card.querySelector('.menuitem-price').textContent.replace('₱', '')),
          description: card.querySelector('.menuitem-description').textContent,
          img: card.querySelector('img').src,
          quantity
        });
      }
    });

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No items selected',
        text: 'Please select at least one item before proceeding.',
        confirmButtonText: 'OK'
      });
      return;
    }

    sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    window.location.href = '../view_cart/view_cart.php';
  });

  // ============================
  // Second Proceed button
  // ============================
  document.getElementById('secondViewCartBtn').addEventListener('click', () => {
    const selectedItems = [];
    document.querySelectorAll('.card-body').forEach(card => {
      const quantity = parseInt(card.parentElement.querySelector('.quantity-display').textContent);
      if (quantity > 0) {
        selectedItems.push({
          id: card.dataset.id,
          name: card.querySelector('.menuitem-name').textContent,
          price: parseFloat(card.querySelector('.menuitem-price').textContent.replace('₱', '')),
          description: card.querySelector('.menuitem-description').textContent,
          img: card.querySelector('img').src,
          quantity
        });
      }
    });

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No items selected',
        text: 'Please select at least one item before proceeding.',
        confirmButtonText: 'OK'
      });
      return;
    }

    sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    window.location.href = '../view_cart/view_cart.php';
  });

  // ============================
  // Chckout Button
  // ============================
  document.getElementById('checkoutBtn').addEventListener('click', () => {
      Swal.fire({
        icon: 'warning',
        title: 'Not Allowed',
        text: 'Please proceed to View Cart page first.',
        confirmButtonText: 'OK'
      });
      return;
  });

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
      window.location.href = '../sign_in/sign_in.php?return=get_order';
    });
  }
});