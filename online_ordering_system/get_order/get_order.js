function loadMenu(filter = 'all', search = '') {
  fetch(`../../../controllers/customer_controllers/ordering_controllers/load_menu.php?filter=${encodeURIComponent(filter)}&search=${encodeURIComponent(search)}`)
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('menuItemContainer');
      container.innerHTML = html;
      attachQuantityEvents();
      attachSorter(); // attach sorting after items render
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

// Sorting
function attachSorter() {
  const sorter = document.getElementById('menuSorter');
  if (!sorter) return;

  const container = document.getElementById('menuItemContainer');
  sorter.addEventListener('change', () => {
    const items = Array.from(container.querySelectorAll('.menu-item'));
    const val = sorter.value;

    items.sort((a, b) => {
      const nameA = a.dataset.name.toLowerCase();
      const nameB = b.dataset.name.toLowerCase();
      const priceA = parseFloat(a.dataset.price);
      const priceB = parseFloat(b.dataset.price);

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
});

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
