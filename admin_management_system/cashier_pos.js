function escapeHTML(value) {
    if (typeof value === "number") return value;
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global variables
let menuItems = [];
let allMenuItems = []; // Store all items for search
let orderHistory = [];
let currentPaymentMethod = 'cash';

// Initialize menu from database
async function initializeMenu() {
    try {
        const response = await fetch('../controllers/pos.php?action=getMenuItems');
        const result = await response.json();
        
        console.log('Menu load result:', result);
        
        if (result.success) {
            menuItems = result.data;
            allMenuItems = result.data; // Store all items
            renderMenuItems();
        } else {
            console.error('Failed to load menu items:', result.message);
            Swal.fire('Error', 'Failed to load menu items', 'error');
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        Swal.fire('Error', 'Failed to connect to server', 'error');
    }
}

// Render menu items
function renderMenuItems() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No items available in this category</div>';
        return;
    }

    menuItems.forEach((item, index) => {
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';

        // If out of stock → add a class
        let unavailableClass = item.available ? "" : "unavailable-item";
        let disabledAttr = item.available ? "" : "disabled";

        menuItemEl.innerHTML = `
            <div class="menu-item-image ${unavailableClass}">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" 
                    onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
                ${item.available ? "" : "<div class='out-stock-overlay'>OUT OF STOCK</div>"}
            </div>
            <div class="menu-item-content ${unavailableClass}">
                <div class="menu-item-name">${escapeHTML(item.name)}</div>
                <div class="menu-item-desc">${escapeHTML(item.desc)}</div>
                <div class="menu-item-price">Php ${item.price.toFixed(2)}</div>

                <div class="quantity-controls">
                    <button class="qty-btn" ${disabledAttr} onclick="updateQuantity(${item.id}, -1)">−</button>
                    <div class="quantity-display">${item.quantity || 0}</div>
                    <button class="qty-btn" ${disabledAttr} onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;

        menuGrid.appendChild(menuItemEl);
    });
}


// Update quantity
function updateQuantity(itemId, change) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.quantity = Math.max(0, (item.quantity || 0) + change);
        
        // Update in allMenuItems too
        const allItem = allMenuItems.find(i => i.id === itemId);
        if (allItem) {
            allItem.quantity = item.quantity;
        }
        
        renderMenuItems();
        updateOrderSummary();
    }
}

// Update order summary
function updateOrderSummary() {
    const itemsList = document.getElementById('itemsList');
    let total = 0;
    let itemsHTML = '';

    const orderedItems = allMenuItems.filter(item => (item.quantity || 0) > 0);

    if (orderedItems.length > 0) {
        orderedItems.forEach(item => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            itemsHTML += `
                <div class="item-row">
                    <span>${escapeHTML(item.quantity)}x ${escapeHTML(item.name)}</span>
                    <span class="item-row-price">Php ${escapeHTML(itemTotal.toFixed(2))}</span>
                </div>
            `;
        });
    } else {
        itemsHTML = `
            <div class="item-row">
                <span style="color: #999;">No items selected</span>
            </div>
        `;
        total = 0;
    }

    itemsList.innerHTML = itemsHTML;
    document.getElementById('totalPrice').textContent = `Php ${escapeHTML(total.toFixed(2))}`;
}

// Search menu
function searchMenu() {
    const searchValue = document.getElementById('menuSearchInput').value.toLowerCase().trim();
    
    if (searchValue === '') {
        // If search is empty, get the active category and filter by it
        const activeCategory = document.querySelector('.category-item.active');
        if (activeCategory) {
            const category = activeCategory.getAttribute('data-category');
            filterMenuByCategory(category);
        } else {
            // If no active category, show all items
            menuItems = [...allMenuItems];
            renderMenuItems();
        }
        return;
    }
    
    // Search across ALL items (not just current category)
    menuItems = allMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchValue) || 
        item.desc.toLowerCase().includes(searchValue)
    );
    
    renderMenuItems();
}

document.querySelectorAll('.category-item').forEach(btn => {
    btn.addEventListener('click', e => {
        document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Clear search when selecting a category
        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) searchInput.value = '';
        
        const category = e.currentTarget.getAttribute('data-category');
        console.log('Selected category:', category);
        filterMenuByCategory(category);
    });
});

// Filter menu by category
async function filterMenuByCategory(category) {
    try {
        const response = await fetch(`../controllers/pos.php?action=getMenuItems&category=${encodeURIComponent(category)}`);
        const result = await response.json();
        
        console.log('Filter result:', result);
        
        if (result.success) {
            // Preserve quantities
            const quantities = {};
            allMenuItems.forEach(item => {
                if (item.quantity > 0) {
                    quantities[item.id] = item.quantity;
                }
            });
            
            menuItems = result.data.map(item => ({
                ...item,
                quantity: quantities[item.id] || 0
            }));
            
            renderMenuItems();
        }
    } catch (error) {
        console.error('Error filtering menu:', error);
    }
}

// Select order type
function selectOrderType(el, type) {
    document.querySelectorAll('.order-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    el.classList.add('active');

    const tableInput = document.getElementById('tableNumberInput');

    if (type === 'dine-in') {
        tableInput.classList.remove('hidden'); 
    } else {
        tableInput.classList.add('hidden'); 
        tableInput.value = ''; 
    }
}

// Select payment
function selectPayment(el) {
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    el.classList.add('active');
    currentPaymentMethod = el.getAttribute('data-method');
}

// Show order confirmation
function showOrderConfirmation() {
    console.log('showOrderConfirmation called');
    
    const orderedItems = allMenuItems.filter(item => (item.quantity || 0) > 0);
    
    if (orderedItems.length === 0) {
        Swal.fire('No Items', 'Please select items before placing an order.', 'warning');
        return;
    }

    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const totalPrice = document.getElementById('totalPrice').textContent;
    const orderType = document.querySelector('.order-type-btn.active').getAttribute('data-type');
    let tableNumber = '';

    if (orderType === 'dine-in') {
        tableNumber = document.getElementById('tableNumberInput').value;
        if (!tableNumber) {
            Swal.fire('Table Required', 'Please enter table number for dine-in orders', 'warning');
            return;
        }
    }

    let confirmationMessage = `Are you sure you want to place this order?<br><br>`;
    confirmationMessage += `Customer: ${escapeHTML(customerName)}<br>`;
    confirmationMessage += `Order Type: ${escapeHTML(orderType.toUpperCase())}`;

    if (orderType === 'dine-in' && tableNumber) {
        confirmationMessage += ` (Table #${tableNumber})`;
    }

    confirmationMessage += `<br>Total: ${totalPrice}<br>`;
    confirmationMessage += `Payment: ${escapeHTML(currentPaymentMethod.toUpperCase())}`;

    Swal.fire({
  title: 'Confirm Order',
  html: confirmationMessage,
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Yes, Place Order',
  cancelButtonText: 'Cancel',
  confirmButtonColor: '#0052cc'
}).then(result => {
  if (result.isConfirmed) {
    const total = parseFloat(totalPrice.replace('Php ', '')) || 0;
    // give SweetAlert a tick to close & release focus
    setTimeout(() => {
      if (currentPaymentMethod === 'cash') {
        showCashPaymentModal(total);
      } else if (currentPaymentMethod === 'gcash') {
        showGCashModal(total);
      } else {
        placeOrder();
      }
    }, 50);
  }
});
}

// Confirm order (show payment modal)
function confirmOrder() {
    console.log('confirmOrder called');
    document.getElementById('orderConfirmationModal').classList.add('show');
    
    const totalPrice = parseFloat(document.getElementById('totalPrice').textContent.replace('Php ', ''));
    
    if (currentPaymentMethod === 'cash') {
        showCashPaymentModal(totalPrice);
    } else if (currentPaymentMethod === 'gcash') {
        showGCashModal(totalPrice);
    }
}

// Show cash payment modal
function showCashPaymentModal(total) {
    console.log('showCashPaymentModal called with total:', total);
    document.getElementById('cashTotal').textContent = `Php ${escapeHTML(total.toFixed(2))}`;
    document.getElementById('cashReceived').value = '';
    document.getElementById('changeAmount').textContent = '';
    
    const modal = document.getElementById('cashPaymentModal');
    modal.classList.add("show");
    document.getElementById('cashTotal').textContent = `Php ${escapeHTML(total.toFixed(2))}`;
    document.getElementById('cashReceived').value = '';
    document.getElementById('changeAmount').textContent = '';

    // small delay so the element is visible before focusing
    setTimeout(() => {
        const input = document.getElementById('cashReceived');
        if (input) input.focus();
    }, 100);

    
    // Calculate change on input
    document.getElementById('cashReceived').oninput = function() {
        const received = parseFloat(this.value) || 0;
        const change = received - total;
        if (change >= 0) {
            document.getElementById('changeAmount').textContent = `Change: Php ${escapeHTML(change.toFixed(2))}`;
            document.getElementById('changeAmount').style.color = '#0052cc';
        } else {
            document.getElementById('changeAmount').textContent = `Insufficient amount`;
            document.getElementById('changeAmount').style.color = '#ff6b6b';
        }
    };
}

// NEW: Set quick amount for cash payment
function setQuickAmount(amount) {
    document.getElementById('cashReceived').value = amount;
    // Trigger the input event to calculate change
    document.getElementById('cashReceived').dispatchEvent(new Event('input'));
}

// NEW: Set exact amount for cash payment
function setExactAmount() {
    const total = parseFloat(document.getElementById('cashTotal').textContent.replace('Php ', ''));
    document.getElementById('cashReceived').value = total.toFixed(2);
    // Trigger the input event to calculate change
    document.getElementById('cashReceived').dispatchEvent(new Event('input'));
}

// Process cash payment
function processCashPayment() {
    console.log('processCashPayment called');
    const total = parseFloat(document.getElementById('cashTotal').textContent.replace('Php ', ''));
    const received = parseFloat(document.getElementById('cashReceived').value) || 0;
    
    if (received < total) {
        Swal.fire('Insufficient Amount', 'Please enter amount equal or greater than total', 'error');
        return;
    }
    
    closeCashModal();
    placeOrder();
}

// Close cash modal
function closeCashModal() {
    console.log('closeCashModal called');
    document.getElementById('cashPaymentModal').classList.remove('show');
}

// Show GCash modal
function showGCashModal(total) {
    console.log('showGCashModal called with total:', total);
    document.getElementById('gcashTotal').textContent = `Php ${escapeHTML(total.toFixed(2))}`;
    const modal = document.getElementById('gcashModal');
    console.log('GCash modal element:', modal);
    modal.classList.add("show");
    console.log('GCash modal display set to flex');
}

// Confirm GCash payment
function confirmGCashPayment() {
    console.log('confirmGCashPayment called');
    closeGCashModal();
    placeOrder();
}

// Close GCash modal
function closeGCashModal() {
    console.log('closeGCashModal called');
    document.getElementById('gcashModal').classList.remove('show');
}

// Place order to database
async function placeOrder() {
    console.log('placeOrder called');
    
    try {
        const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
        const totalPrice = parseFloat(document.getElementById('totalPrice').textContent.replace('Php ', ''));
        const orderType = document.querySelector('.order-type-btn.active').getAttribute('data-type');
        let tableNumber = null;

        if (orderType === 'dine-in') {
            tableNumber = document.getElementById('tableNumberInput').value;
        }

        const orderedItems = allMenuItems.filter(item => (item.quantity || 0) > 0).map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

        const orderData = {
            customerName: customerName,
            orderType: orderType,
            tableNumber: tableNumber,
            paymentMethod: currentPaymentMethod,
            totalAmount: totalPrice,
            items: orderedItems
        };

        console.log('Sending order data:', orderData);

        const response = await fetch('../controllers/pos.php?action=placeOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                html: `Order Number: ${escapeHTML(result.orderNumber) || escapeHTML(result.orderID)}<br>Total: Php ${escapeHTML(totalPrice.toFixed(2))}<br><br>Order sent to kitchen`,
                confirmButtonColor: '#0052cc'
            });
            
            resetOrderForm();
        } else {
            Swal.fire('Error', 'Failed to place order: ' + result.message, 'error');
        }

    } catch (error) {
        console.error('Error placing order:', error);
        Swal.fire('Error', 'Error placing order. Please try again.', 'error');
    }
}

// Reset order form
function resetOrderForm() {
    allMenuItems.forEach(item => {
        item.quantity = 0;
    });
    
    menuItems.forEach(item => {
        item.quantity = 0;
    });
    
    renderMenuItems();
    updateOrderSummary();
    
    document.getElementById('customerName').value = '';
    document.getElementById('tableNumberInput').value = '';
    
    const dineInBtn = document.querySelector('.order-type-btn[data-type="dine-in"]');
    if (dineInBtn) {
        selectOrderType(dineInBtn, 'dine-in');
    }
    
    const cashBtn = document.querySelector('.payment-btn.cash');
    if (cashBtn) {
        selectPayment(cashBtn);
    }
}

// Cancel order
function cancelOrder() {
    console.log('cancelOrder called');
    document.getElementById('orderConfirmationModal').style.display = 'none';
}

// Logout function
// function logout() {
//     Swal.fire({
//         title: 'Logout',
//         text: 'Are you sure you want to logout?',
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: '#0052cc',
//         cancelButtonColor: '#999',
//         confirmButtonText: 'Yes, Logout'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             window.location.href = 'login.php';
//         }
//     });
// }

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutbtn");

  logoutBtn.addEventListener("click", () => {

    fetch("../controllers/logout.php", {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("✅ " + data.message);
          window.location.href = "login.php";
        } else {
          console.log("⚠️ " + data.message);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  });
});

// Switch view
function switchView(view) {
    console.log('Switching to view:', view);
    
    const menuView = document.getElementById('menuView');
    const historyView = document.getElementById('historyView');
    const onlineOrdersView = document.getElementById('onlineOrdersView');
    const menuBtn = document.querySelector('.sidebar-button');
    const historyLink = document.querySelector('.sidebar-link');
    const onlineOrderBtn = document.querySelector('.online-order-button');
    const searchBar = document.getElementById('headerSearchBar');

    // Hide all views
    if (menuView) menuView.style.display = 'none';
    if (historyView) historyView.style.display = 'none';
    if (onlineOrdersView) onlineOrdersView.style.display = 'none';
    
    // Remove all active classes
    if (menuBtn) menuBtn.classList.remove('active');
    if (historyLink) historyLink.classList.remove('active');
    if (onlineOrderBtn) onlineOrderBtn.classList.remove('active');

    // Show selected view
    if (view === 'menu') {
        if (menuView) menuView.style.display = 'flex';
        if (menuBtn) menuBtn.classList.add('active');
        if (searchBar) searchBar.style.display = 'block';
    } else if (view === 'history') {
        if (historyView) historyView.style.display = 'flex';
        if (historyLink) historyLink.classList.add('active');
        if (searchBar) searchBar.style.display = 'none';
        populateOrderHistory();
        updateFilterOptions();
    } else if (view === 'onlineOrders') {
        if (onlineOrdersView) onlineOrdersView.style.display = 'flex';
        if (onlineOrderBtn) onlineOrderBtn.classList.add('active');
        if (searchBar) searchBar.style.display = 'none';
        loadOrders();
        setTimeout(() => initializeOnlineOrderSearch(), 100);
    }
}

// Populate order history
async function populateOrderHistory() {
    console.log('populateOrderHistory called'); 
    
    try {
        const response = await fetch('../controllers/pos.php?action=getOrderHistory');
        console.log('Response received:', response); 
        
        const result = await response.json();
        console.log('Result:', result); 
        
        if (result.success) {
            orderHistory = result.data;
            console.log('Order history data:', orderHistory); 
            renderOrderHistory();
        } else {
            console.error('Failed to load order history:', result.message);
        }
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

// Render order history
function renderOrderHistory() {
    console.log('renderOrderHistory called');
    
    const tableBody = document.getElementById('orderTableBody');
    console.log('Table body element:', tableBody);
    
    if (!tableBody) {
        console.error('orderTableBody not found!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    console.log('Order history length:', orderHistory.length);
    
    if (orderHistory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #999;">No orders found</td></tr>';
        return;
    }
    
    orderHistory.forEach((order, index) => {
        console.log(`Creating row ${index} for order:`, order);
        
        const row = document.createElement('tr');
        
        // Store order data directly on the row element
        row.dataset.orderId = order.id;
        row.dataset.customerName = order.customerName;
        row.dataset.items = order.items;
        row.dataset.amount = order.amount;
        row.dataset.method = order.method;
        row.dataset.date = order.date;
        row.dataset.status = order.status;
        row.dataset.orderType = order.orderType;
        
        // Format order type for display
        let displayOrderType = '';
        if (order.orderType === 'dine in') {
            displayOrderType = 'Dine In';
        } else if (order.orderType === 'takeout' || order.orderType === 'take-out') {
            displayOrderType = 'Takeout';
        } else if (order.orderType === 'delivery') {
            displayOrderType = 'Delivery';
        } else {
            displayOrderType = order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);
        }
        
        row.innerHTML = `
            <td>${escapeHTML(order.id)}</td>
            <td><span class="order-type-badge $escapeHTML{(order.orderType.replace(' ', '-'))}">${displayOrderType}</span></td>
            <td>${escapeHTML(order.items)}</td>
            <td>${escapeHTML(order.amount)}</td>
            <td>${escapeHTML(order.method)}</td>
            <td>${escapeHTML(order.date)}</td>
            <td><span class="status-badge">${escapeHTML(order.status)}</span></td>
            <td>
                <button class="btn btn-sm view-history-receipt m-2 btn btn-sm " type="button">
                    <i class="fa-solid fa-eye text-muted"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        console.log('Row appended');
    });
    
    console.log('Final table HTML:', tableBody.innerHTML);
}

// Update filter options
function updateFilterOptions() {
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    if (!filterType || !filterValue) return;
    
    filterValue.innerHTML = '';
    
    if (filterType.value === 'month') {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = (index + 1).toString(); // "1", "2", ... "12"
            option.textContent = month;
            filterValue.appendChild(option);
        });
    } else if (filterType.value === 'day') {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i.toString(); // "1", "2", ... "31"
            option.textContent = i;
            filterValue.appendChild(option);
        }
    } else if (filterType.value === 'year') {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 5; i--) {
            const option = document.createElement('option');
            option.value = i.toString(); // "2025", "2024", etc.
            option.textContent = i;
            filterValue.appendChild(option);
        }
    }
    
    // Automatically apply filter after updating options
    filterOrders();
}

// Search orders
function searchOrders() {
    const searchValue = document.getElementById('searchOrderId')?.value.toLowerCase();
    if (!searchValue) return;
    
    const rows = document.querySelectorAll('#orderTableBody tr');
    rows.forEach(row => {
        const orderId = row.cells[0]?.textContent.toLowerCase();
        row.style.display = orderId && orderId.includes(searchValue) ? '' : 'none';
    });
}

function filterOrders() {
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    if (!filterType || !filterValue || !filterValue.value) {
        // If no filter value, show all rows
        const rows = document.querySelectorAll('#orderTableBody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    const rows = document.querySelectorAll('#orderTableBody tr');
    
    rows.forEach(row => {
        // Skip rows that don't have enough cells (like "No orders found" message)
        if (!row.cells[4] || row.cells.length < 6) {
            return;
        }
        
        const dateText = row.cells[4].textContent.trim();
        const dateParts = dateText.split('-');
        
        if (dateParts.length !== 3) {
            row.style.display = 'none';
            return;
        }
        
        const month = dateParts[0]; // "11" or "1"
        const day = dateParts[1];   // "20" or "5"
        const year = dateParts[2];  // "2025"
        
        let display = false;
        
        // Convert both to integers for comparison to handle "1" vs "01"
        if (filterType.value === 'month') {
            display = parseInt(month, 10) === parseInt(filterValue.value, 10);
        } else if (filterType.value === 'day') {
            display = parseInt(day, 10) === parseInt(filterValue.value, 10);
        } else if (filterType.value === 'year') {
            display = parseInt(year, 10) === parseInt(filterValue.value, 10);
        }
        
        row.style.display = display ? '' : 'none';
    });
}

// Export data
function exportData() {
    let csv = 'Order ID,Table No.,Item Order,Total Amount,Payment Method,Order Date,Status\n';
    orderHistory.forEach(order => {
        csv += `${order.id},${order.table},"${order.items}",${order.amount},${order.method},${order.date},${order.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'order_history.csv';
    a.click();
}

// Print data
function printData() {
    const table = document.querySelector('.order-table');
    if (!table) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    const tableHtml = table.outerHTML;
    printWindow.document.write('<html><head><title>Order History</title><style>body { font-family: Arial; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }</style></head><body>');
    printWindow.document.write('<h1>Order History</h1>');
    printWindow.document.write(tableHtml);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
const menuContent = document.querySelector(".menu-content");
    const onlineContent = document.querySelector(".online-content");

    const menuBtn = document.querySelector(".sidebar-button"); 
    const onlineBtn = document.querySelector(".online-order-button");

    // Show Menu View
    menuBtn.addEventListener("click", () => {
        menuContent.classList.remove("hidden");
        onlineContent.classList.add("hidden");

        menuBtn.classList.add("active");
        onlineBtn.classList.remove("active");
    });

    // Show Online Orders View
    onlineBtn.addEventListener("click", () => {
        onlineContent.classList.remove("hidden");
        menuContent.classList.add("hidden");

        onlineBtn.classList.add("active");
        menuBtn.classList.remove("active");
    });

    console.log('DOM Content Loaded');
    
    // Initialize menu view
    switchView('menu');
    
    // Load menu items
    initializeMenu();
    updateOrderSummary(); 

    // Set default order type
    const dineInButton = document.querySelector('.order-type-btn[data-type="dine-in"]');
    if (dineInButton) {
        selectOrderType(dineInButton, 'dine-in');
    }

    // Set default payment method
    const cashButton = document.querySelector('.payment-btn.cash');
    if (cashButton) {
        selectPayment(cashButton);
    }

    const ordersTable = document.getElementById("ordersTable");
    if (ordersTable) {
        ordersTable.addEventListener("click", function(e) {
            const row = e.target.closest("tr");
            if (!row || !row.hasAttribute('data-order')) return;

            const order = JSON.parse(row.getAttribute("data-order"));

            if (e.target.closest(".view")) {
                showReceipt(order);
            } 
            
            if (e.target.closest(".delivery")) {
                showDeliveryOverlay(order);
            }
            
            if (e.target.closest(".cancel")) {
                rejectOrder(order);
            }
        });
    }

const orderTableBody = document.getElementById("orderTableBody");
if (orderTableBody) {
    orderTableBody.addEventListener("click", function(e) {
        console.log("Click detected on orderTableBody"); 
        console.log("Click target:", e.target);
        
        const viewButton = e.target.closest(".view-history-receipt");
        
        if (!viewButton) {
            console.log("Not a view button click, ignoring");
            return;
        }
        
        console.log("✅ View button clicked!");
        
        const row = viewButton.closest("tr");
        console.log("Closest row:", row); 
        
        if (!row) {
            console.log("❌ No row found");
            return;
        }
        
        // Reconstruct order data from row dataset
        const order = {
            id: row.dataset.orderId,
            customerName: row.dataset.customerName,
            items: row.dataset.items,
            amount: row.dataset.amount,
            method: row.dataset.method,
            date: row.dataset.date,
            status: row.dataset.status,
            orderType: row.dataset.orderType // Get orderType from dataset
        };
        
        console.log("📦 Reconstructed order data:", order);
        console.log("📊 Order ID:", order.id);
        console.log("📊 Order status:", order.status);
        console.log("📊 Order type:", order.orderType);

        // Determine if it's a walk-in order by checking orderType
        // Walk-in orders include: 'dine in', 'takeout', 'take-out'
        const isWalkIn = order.orderType && 
                        (order.orderType.toLowerCase().trim() === 'dine in' || 
                         order.orderType.toLowerCase().trim() === 'takeout' ||
                         order.orderType.toLowerCase().trim() === 'take-out');
        
        if (isWalkIn) {
            console.log(`🚶 Walk-in/Takeout order detected (${order.orderType}) - showing walk-in receipt`);
            showWalkInReceipt(order);
        } else {
            console.log(`🌐 Delivery order detected (${order.orderType}) - showing online receipt`);
            // For delivery orders, fetch full details from server
            fetchAndShowOnlineReceipt(order.id);
        }
    });
}
});

// ======================================
// Badet's Online Orders Section
// ======================================

// Load orders
function loadOrders() {
    console.log("loadOrders() function called"); 
    
    fetch("../../controllers/get_online_order.php")
        .then(response => response.text())
        .then(text => {
            console.log("Raw response:", text);
            
            let data;
            try {
                data = JSON.parse(text);
                console.log("Parsed JSON data:", data);
            } catch(e) {
                console.error("JSON parse error:", e);
                console.error("Response was:", text);
                const ordersTable = document.getElementById("ordersTable");
                if (ordersTable) {
                    ordersTable.innerHTML = `
                        <tr><td colspan="6" class="text-center text-danger">Invalid response from server</td></tr>
                    `;
                }
                return;
            }

            const tableBody = document.getElementById("ordersTable");
            if (!tableBody) {
                console.error("ordersTable element not found");
                return;
            }
            
            tableBody.innerHTML = "";

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No orders found</td></tr>`;
                return;
            }

            data.forEach(order => {
                console.log("Order object:", order);
                const statusText = order.order_status || "Unknown";
                let statusClass = "";
                switch(statusText.toLowerCase()) {
                    case "reviewed": statusClass = "reviewed"; break;
                    case "verified": statusClass = "verified"; break;
                    case "accepted": statusClass = "accepted"; break;
                    case "rejected": statusClass = "rejected"; break;
                    case "pending": statusClass = "pending"; break;
                    case "preparing": statusClass = "btn-info"; break;
                    case "ready": statusClass = "ready"; break;
                    case "in transit": statusClass = "in-transit"; break;
                    case "completed": statusClass = "completed"; break;
                    case "canceled": statusClass = "btn-danger"; break;
                    default: statusClass = "btn-secondary";
                }

                // Check if order can be rejected
                const nonRejectableStatuses = ['preparing', 'ready', 'in transit', 'completed', 'rejected', 'canceled'];
                const canReject = !nonRejectableStatuses.includes(statusText.toLowerCase());

                let actionButtonHTML = '';
                
                // Show delivery button only for verified orders
                if (statusText.toLowerCase() === "verified") {
                    actionButtonHTML += `
                        <span>
                            <button class="btn btn-sm delivery">
                                <i class="fa-solid fa-truck-fast"></i>
                            </button>
                        </span>
                    `;
                }

                if (statusText.toLowerCase() === "ready") {
                    actionButtonHTML += `
                        <span>
                            <button class="btn btn-sm btn-warning assign-rider" title="Assign Rider">
                                <i class="fa-solid fa-motorcycle"></i>
                            </button>
                        </span>
                    `;
                }
                
                // Show cancel button only if order can be rejected
                const cancelButtonHTML = canReject ? `
                    <span>
                        <button class="btn btn-sm cancel">
                            <i class="fa-solid fa-x"></i>
                        </button>
                    </span>
                ` : `
                    <span>
                        <button class="btn btn-sm cancel" disabled style="opacity: 0.3; cursor: not-allowed;" title="Cannot reject orders in this status">
                            <i class="fa-solid fa-x"></i>
                        </button>
                    </span>
                `;

                tableBody.innerHTML += `
                    <tr data-order='${JSON.stringify(order).replace(/'/g, "&apos;")}'>
                        <td><b>${escapeHTML(order.order_number)}</b></td>
                        <td class="date-column">${escapeHTML(order.date_ordered)}</td>
                        <td>₱${parseFloat(order.subtotal).toFixed(2)}</td>
                        <td>${order.rider_name || 'Unassigned'}</td>
                        <td>
                            <button class="btn btn-sm rounded-pill ${statusClass}">
                                ${statusText}
                            </button>
                        </td>
                        <td class="justify-content-center">
                            <span>
                                <button class="btn btn-sm view m-2">
                                    <i class="fa-solid fa-eye text-muted"></i>
                                </button>
                            </span>
                            ${cancelButtonHTML}
                            ${actionButtonHTML} 
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            const ordersTable = document.getElementById("ordersTable");
            if (ordersTable) {
                ordersTable.innerHTML = `
                    <tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>
                `;
            }
        });
}

function showReceipt(order) {
    const receiptSection = document.getElementById('receiptSection');
    if (!receiptSection) return;
    
    receiptSection.style.display = 'block';
    
    document.getElementById('orderNumber').innerHTML = `Order No: <b>${escapeHTML(order.order_number) || 'N/A'}</b>`;
    document.getElementById('orderDate').innerHTML = `<b>${escapeHTML(order.date_ordered) || 'N/A'}</b>`;
    document.getElementById('recipient').innerHTML = `Customer Name: <b>${escapeHTML(order.recipient_name) || 'N/A'}</b>`;
    document.getElementById('contactNumber').innerHTML = `Contact Number: <b>${escapeHTML(order.phone_number) || 'N/A'}</b>`;
    document.getElementById('emailAddress').innerHTML = `Email Address: <b>${escapeHTML(order.email) || 'N/A'}</b>`;
    document.getElementById('deliveryAddress').innerHTML = `Delivery Address: <b>${escapeHTML(order.delivery_address) || 'N/A'}</b>`;
    
    const subtotal = parseFloat(order.subtotal) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('subtotal').innerHTML = `<b>₱${subtotal.toFixed(2)}</b>`;
    document.getElementById('deliveryFee').innerHTML = `<b>₱${deliveryFee.toFixed(2)}</b>`;
    document.getElementById('total').innerHTML = `<b>₱${total.toFixed(2)}</b>`;
    document.getElementById('paymentMethod').innerHTML = `Payment Method: <b>${order.payment_method || 'N/A'}</b>`;

    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = '';
    
    if (order.items_ordered && order.items_ordered.trim() !== '') {
        const items = order.items_ordered.split(', ');
        items.forEach(item => {
            const span = document.createElement('div');
            span.className = 'details mb-1 d-flex justify-content-between w-100';

            const parts = item.split(" x");
            const name = parts[0] || "Item";

            const qtyAndPrice = (parts[1] || "").split(" @");
            const qty = parseInt(qtyAndPrice[0]) || 0;
            const price = parseFloat(qtyAndPrice[1]) || 0;

            const itemSubtotal = qty * price;

            span.innerHTML = `
                <span><b>${qty} ×</b> ${name}</span>
                <span><b>₱${itemSubtotal.toFixed(2)}</b></span>
            `;

            itemsContainer.appendChild(span);
        });
    } else {
        const p = document.createElement('p');
        p.className = 'details';
        p.textContent = 'No items found';
        itemsContainer.appendChild(p);
    }
}

// This function is used to reuse the showReceipt func for online orders, but instead of being in online orders, this is in orders history
async function fetchAndShowOnlineReceipt(orderId) {
    console.log("🔍 Fetching online order details for:", orderId);
    
    try {
        const response = await fetch(`../../controllers/get_online_order.php?order_id=${orderId}`);
        const text = await response.text();
        console.log("📡 Raw response:", text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch(e) {
            console.error("❌ JSON parse error:", e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load order details - Invalid response format',
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        // Check if there's an error in the response
        if (data.error) {
            console.error("❌ Server error:", data.error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load order details: ' + data.error,
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        // Check if we got data back
        if (!data || data.length === 0) {
            console.error("❌ No data returned - order may not be an online order");
            console.log("Order ID searched:", orderId);
            Swal.fire({
                icon: 'warning',
                title: 'Not an Online Order',
                text: 'This order does not have online order details. It may be a walk-in order.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Successfully got online order data
        const order = data[0];
        console.log("✅ Found online order:", order);
        showReceipt(order);
        
    } catch (error) {
        console.error("❌ Error fetching online order:", error);
        Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Failed to connect to server. Please try again.',
            confirmButtonColor: '#d33'
        });
    }
}

// Show receipt for walk in customers
function showWalkInReceipt(order) {
    console.log("showWalkInReceipt called with order:", order);
    
    const receiptSection = document.getElementById('walkInReceiptSection');
    
    if (!receiptSection) {
        console.error("walkInReceiptSection element not found!");
        return;
    }
    
    // Show the receipt section using the 'show' class
    receiptSection.classList.add('show');
    
    try {
        // Populate order number
        const orderNumEl = document.getElementById('walkInOrderNumber');
        if (orderNumEl) {
            orderNumEl.innerHTML = `Order No: <b>${order.id || 'N/A'}</b>`;
        }
        
        // Populate order date
        const orderDateEl = document.getElementById('walkInOrderDate');
        if (orderDateEl) {
            orderDateEl.innerHTML = `<b>${escapeHTML(order.date) || 'N/A'}</b>`;
        }
        
        // Populate customer name
        const nameEl = document.getElementById('walkInName');
        if (nameEl) {
            nameEl.innerHTML = `Walk In Name: <b>${escapeHTML(order.customerName) || 'Walk-in Customer'}</b>`;
        }
        
        // Get total amount
        const totalAmount = order.amount || '₱0.00';
        
        // Populate subtotal
        const subtotalEl = document.getElementById('walkInSubtotal');
        if (subtotalEl) {
            subtotalEl.innerHTML = `<b>${totalAmount}</b>`;
        }
        
        // Populate total
        const totalEl = document.getElementById('walkInTotal');
        if (totalEl) {
            totalEl.innerHTML = `<b>${totalAmount}</b>`;
        }
        
        // Populate payment method
        const methodEl = document.getElementById('walkInPaymentMethod');
        if (methodEl) {
            methodEl.innerHTML = `Payment Method: <b>${escapeHTML(order.method) || 'Cash'}</b>`;
        }

        // Populate items
        const itemsContainer = document.getElementById('walkInItemsContainer');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            
            if (order.items && order.items.trim() !== '' && order.items !== 'No items') {
                const items = order.items.split(', ');
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'details mb-1 d-flex justify-content-between w-100';
                    div.innerHTML = `<span>${item}</span>`;
                    itemsContainer.appendChild(div);
                });
            } else {
                itemsContainer.innerHTML = '<p class="details">No items found</p>';
            }
        }
        
        console.log("✅ Walk-in receipt populated successfully");
        
    } catch (error) {
        console.error("❌ Error populating walk-in receipt:", error);
        console.error("Error stack:", error.stack);
    }
}

let currentOrderForDelivery = null;

function showDeliveryOverlay(order) {
    currentOrderForDelivery = order; // Store the order
    const overlay = document.getElementById('setFeeSection');
    overlay.style.display = 'flex';

    document.getElementById('deliveryOrderNumber').innerHTML = `Order No: <b>${order.order_number || 'N/A'}</b>`;
    document.getElementById('deliveryAddressText').innerHTML = `Delivery Address: <b>${escapeHTML(order.delivery_address) || 'N/A'}</b>`;
    
    // Clear the input field
    document.getElementById('deliveryFeeID').value = '';
}

// Close delivery overlay button
document.getElementById('closeDelivery').addEventListener('click', function() {
    document.getElementById('setFeeSection').style.display = 'none';
    currentOrderForDelivery = null;
});

// Submit delivery fee
document.getElementById('submitDeliveryFee').addEventListener('click', function() {
    if (!currentOrderForDelivery) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No order selected'
        });
        return;
    }

    const deliveryFee = document.getElementById('deliveryFeeID').value;
    
    // Validate input
    if (!deliveryFee || isNaN(deliveryFee) || parseFloat(deliveryFee) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Please enter a valid delivery fee'
        });
        return;
    }

    fetch('../../controllers/set_delivery_fee.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_number: currentOrderForDelivery.order_number,
            delivery_fee: parseFloat(deliveryFee)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Delivery fee has been set successfully!'
            }).then(() => {
                document.getElementById('setFeeSection').style.display = 'none';
                currentOrderForDelivery = null;
                loadOrders();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Failed to set delivery fee'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while setting the delivery fee'
        });
    });
});
// Close overlays when clicking outside
document.getElementById('receiptSection').addEventListener('click', function(e) {
    const receiptCard = document.getElementById('receiptCard');
    // Check if click is directly on the overlay (not on the card or its children)
    if (e.target === this) {
        this.classList.remove('show');
        this.style.display = 'none';
    }
});

document.getElementById('walkInReceiptSection').addEventListener('click', function(e) {
    const walkInCard = document.getElementById('walkInReceiptCard');
    // Check if click is directly on the overlay (not on the card or its children)
    if (e.target === this) {
        console.log("Closing walk-in receipt - clicked outside");
        this.classList.remove('show');
        this.style.display = 'none';
    }
});

document.getElementById('setFeeSection').addEventListener('click', function(e) {
    // Check if click is directly on the overlay
    if (e.target === this) {
        this.style.display = 'none';
        currentOrderForDelivery = null;
    }
});

// Reject order function
function rejectOrder(order) {
    // Define statuses that cannot be rejected
    const nonRejectableStatuses = ['preparing', 'ready', 'in transit', 'completed'];
    
    // Check if the order status is in the non-rejectable list
    const currentStatus = (order.order_status || '').toLowerCase().trim();
    
    if (nonRejectableStatuses.includes(currentStatus)) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot Reject',
            text: `Orders with status "${order.order_status}" cannot be rejected. The order is already being processed or has been completed.`,
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // Proceed with rejection confirmation
    Swal.fire({
        title: 'Reject Order?',
        text: `Are you sure you want to reject order ${order.order_number}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('../../controllers/reject_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_number: order.order_number
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Rejected!',
                        text: 'Order has been rejected successfully.'
                    }).then(() => {
                        loadOrders();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Failed to reject order'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while rejecting the order'
                });
            });
        }
    });
}

// Search function for online orders
function searchOnlineOrders() {
    const searchValue = document.getElementById('searchOnlineOrder').value.toLowerCase();
    const rows = document.querySelectorAll('#ordersTable tr');

    rows.forEach(row => {
        // Skip if it's a header or message row
        if (row.cells.length < 6) return;
        
        const orderId = row.cells[0]?.textContent.toLowerCase();
        if (orderId) {
            row.style.display = orderId.includes(searchValue) ? '' : 'none';
        }
    });
}

// Filter online orders by date
function filterOnlineOrders() {
    const type = document.getElementById('onlineFilterType').value;
    let val = document.getElementById('onlineFilterValue').value;  // ← FIXED

    if (type === "day" && val === "1") {
        val = new Date().getDate().toString();
        document.getElementById('onlineFilterValue').value = val; 
    }

    if (!val) return;

    const rows = document.querySelectorAll('#ordersTable tr');

    rows.forEach(row => {
        if (row.cells.length < 6) return;

        const dateCell = row.cells[1];
        if (!dateCell) return;

        const dateStr = dateCell.textContent.trim();
        const date = parseOnlineOrderDate(dateStr);

        let show = false;

        if (type === "month") {
            show = (date.getMonth() + 1).toString() === val;
        } else if (type === "day") {
            show = date.getDate().toString() === val;
        } else if (type === "year") {
            show = date.getFullYear().toString() === val;
        }

        row.style.display = show ? "" : "none";
    });
}


// Initialize online order search and filters
function initializeOnlineOrderSearch() {
    console.log("Initializing online order search & filters...");

    const search = document.getElementById('searchOnlineOrder');
    const type = document.getElementById('onlineFilterType');
    const value = document.getElementById('onlineFilterValue');

    if (!search || !type || !value) {
        console.error("Search/filter elements not found");
        return;
    }

    search.oninput = searchOnlineOrders;
    type.onchange = updateOnlineOrderFilterOptions;
    value.onchange = filterOnlineOrders;

    updateOnlineOrderFilterOptions();
}

// Update filter options based on selected type
function updateOnlineOrderFilterOptions() {
    const type = document.getElementById('onlineFilterType');
    const value = document.getElementById('onlineFilterValue');

    if (!type || !value) return;

    value.innerHTML = "";

    if (type.value === "month") {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        months.forEach((month, index) => {
            let opt = document.createElement("option");
            opt.value = index + 1;
            opt.textContent = month;
            value.appendChild(opt);
        });

    } else if (type.value === "day") {
        for (let i = 1; i <= 31; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            value.appendChild(opt);
        }

    } else if (type.value === "year") {
        const year = new Date().getFullYear();
        for (let i = year; i >= year - 5; i--) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            value.appendChild(opt);
        }
    }

    filterOnlineOrders();
}

// Parse the date string from online orders
function parseOnlineOrderDate(dateStr) {
    try {
        const [datePart, timePart] = dateStr.split(" | ");
        const [monthName, dayWithComma, year] = datePart.split(" ");
        const day = parseInt(dayWithComma.replace(",", ""));
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.indexOf(monthName);

        let [time, modifier] = timePart.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        } else if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        return new Date(year, monthIndex, day, hours, minutes);
    } catch (error) {
        console.error("Error parsing date:", dateStr, error);
        return new Date();
    }
}

// Fetch available riders from database
async function fetchAvailableRiders() {
    try {
        const response = await fetch('../../controllers/delivery_controllers/get_riders.php');
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch riders:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching riders:', error);
        return [];
    }
}

// Show assign rider modal
async function showAssignRiderModal(order) {
    console.log('Showing assign rider modal for order:', order);
    
    // Fetch available riders
    const riders = await fetchAvailableRiders();
    
    if (riders.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Riders Available',
            text: 'There are no riders available to assign at the moment.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // Create options for the select dropdown
    const riderOptions = riders.map(rider => 
        `<option value="${rider.staff_id}">${escapeHTML(rider.staff_name)} (ID: ${rider.staff_id})</option>`
    ).join('');
    
    Swal.fire({
        title: 'Assign Rider',
        html: `
            <div style="text-align: left;">
                <p><strong>Order Number:</strong> ${order.order_number}</p>
                <p><strong>Delivery Address:</strong> ${escapeHTML(order.delivery_address) || 'N/A'}</p>
                <hr>
                <label for="riderSelect" style="display: block; margin-bottom: 8px; font-weight: bold;">
                    Select Rider:
                </label>
                <select id="riderSelect" class="swal2-input" style="width: 100%; padding: 10px; border: 1px solid #d9d9d9; border-radius: 4px;">
                    <option value="">-- Select a Rider --</option>
                    ${riderOptions}
                </select>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0052cc',
        cancelButtonColor: '#999',
        confirmButtonText: 'Assign Rider',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const selectedRiderId = document.getElementById('riderSelect').value;
            if (!selectedRiderId) {
                Swal.showValidationMessage('Please select a rider');
                return false;
            }
            return selectedRiderId;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            assignRiderToOrder(order.order_number, result.value);
        }
    });
}

// Assign rider to order
function assignRiderToOrder(orderNumber, riderId) {
    fetch('../../controllers/delivery_controllers/assign_rider.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_number: orderNumber,
            rider_id: riderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Rider Assigned!',
                text: 'The rider has been successfully assigned to this order.',
                confirmButtonColor: '#0052cc'
            }).then(() => {
                loadOrders(); // Reload orders to update the table
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Assignment Failed',
                text: data.message || 'Failed to assign rider to order',
                confirmButtonColor: '#d33'
            });
        }
    })
    .catch(error => {
        console.error('Error assigning rider:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while assigning the rider',
            confirmButtonColor: '#d33'
        });
    });
}

document.addEventListener("click", function (e) {
    if (e.target.closest(".assign-rider")) {
        const row = e.target.closest("tr");
        if (!row) return;

        const orderData = row.getAttribute("data-order");
        if (!orderData) return;

        const order = JSON.parse(orderData);
        showAssignRiderModal(order);
    }
});