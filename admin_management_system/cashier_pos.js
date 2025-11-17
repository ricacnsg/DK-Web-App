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
        menuItemEl.innerHTML = `
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-desc">${item.desc}</div>
                <div class="menu-item-price">Php ${item.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <div class="quantity-display">${item.quantity || 0}</div>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
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
                    <span>${item.quantity}x ${item.name}</span>
                    <span class="item-row-price">Php ${itemTotal.toFixed(2)}</span>
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
    document.getElementById('totalPrice').textContent = `Php ${total.toFixed(2)}`;
}

// Search menu
function searchMenu() {
    const searchValue = document.getElementById('menuSearchInput').value.toLowerCase();
    
    if (searchValue === '') {
        // If search is empty, show current category items
        renderMenuItems();
        return;
    }
    
    // Filter all items by search term
    menuItems = allMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchValue) || 
        item.desc.toLowerCase().includes(searchValue)
    );
    
    renderMenuItems();
}

// Select category
function selectCategory(el) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    el.classList.add('active');
    
    // Clear search
    document.getElementById('menuSearchInput').value = '';
    
    const category = el.getAttribute('data-category');
    console.log('Selected category:', category);
    
    filterMenuByCategory(category);
}

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
    const orderedItems = allMenuItems.filter(item => (item.quantity || 0) > 0);
    
    if (orderedItems.length === 0) {
        Swal.fire('No Items', 'Please select items before placing an order.', 'warning');
        return;
    }

    const customerName = document.getElementById('customerName').value;
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
    confirmationMessage += `Customer: ${customerName}<br>`;
    confirmationMessage += `Order Type: ${orderType.toUpperCase()}`;

    if (orderType === 'dine-in' && tableNumber) {
        confirmationMessage += ` (Table #${tableNumber})`;
    }

    confirmationMessage += `<br>Total: ${totalPrice}<br>`;
    confirmationMessage += `Payment: ${currentPaymentMethod.toUpperCase()}`;

    document.getElementById('confirmationMessage').innerHTML = confirmationMessage;
    document.getElementById('orderConfirmationModal').style.display = 'flex';
}

// Confirm order (show payment modal)
function confirmOrder() {
    document.getElementById('orderConfirmationModal').style.display = 'none';
    
    const totalPrice = parseFloat(document.getElementById('totalPrice').textContent.replace('Php ', ''));
    
    if (currentPaymentMethod === 'cash') {
        showCashPaymentModal(totalPrice);
    } else if (currentPaymentMethod === 'gcash') {
        showGCashModal(totalPrice);
    }
}

// Show cash payment modal
function showCashPaymentModal(total) {
    document.getElementById('cashTotal').textContent = `Php ${total.toFixed(2)}`;
    document.getElementById('cashReceived').value = '';
    document.getElementById('changeAmount').textContent = '';
    document.getElementById('cashPaymentModal').style.display = 'flex';
    
    // Calculate change on input
    document.getElementById('cashReceived').oninput = function() {
        const received = parseFloat(this.value) || 0;
        const change = received - total;
        if (change >= 0) {
            document.getElementById('changeAmount').textContent = `Change: Php ${change.toFixed(2)}`;
            document.getElementById('changeAmount').style.color = '#0052cc';
        } else {
            document.getElementById('changeAmount').textContent = `Insufficient amount`;
            document.getElementById('changeAmount').style.color = '#ff6b6b';
        }
    };
}

// Process cash payment
function processCashPayment() {
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
    document.getElementById('cashPaymentModal').style.display = 'none';
}

// Show GCash modal
function showGCashModal(total) {
    document.getElementById('gcashTotal').textContent = `Php ${total.toFixed(2)}`;
    document.getElementById('gcashModal').style.display = 'flex';
}

// Confirm GCash payment
function confirmGCashPayment() {
    closeGCashModal();
    placeOrder();
}

// Close GCash modal
function closeGCashModal() {
    document.getElementById('gcashModal').style.display = 'none';
}

// Place order to database
async function placeOrder() {
    try {
        const customerName = document.getElementById('customerName').value;
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

        const response = await fetch('../controllers/pos.php?action=placeOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                html: `Order ID: ${result.orderID}<br>Total: Php ${totalPrice.toFixed(2)}<br><br>Order sent to kitchen`,
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
    
    document.getElementById('customerName').value = 'Walk-in Customer';
    document.getElementById('tableNumberInput').value = '';
    
    const dineInBtn = document.querySelector('.order-type-btn[data-type="dine-in"]');
    selectOrderType(dineInBtn, 'dine-in');
    
    const cashBtn = document.querySelector('.payment-btn.cash');
    selectPayment(cashBtn);
}

// Cancel order
function cancelOrder() {
    document.getElementById('orderConfirmationModal').style.display = 'none';
}

// Logout function
function logout() {
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0052cc',
        cancelButtonColor: '#999',
        confirmButtonText: 'Yes, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'login.php';
        }
    });
}

// Switch view
function switchView(view) {
    const menuView = document.getElementById('menuView');
    const historyView = document.getElementById('historyView');
    const menuBtn = document.querySelector('.sidebar-button');
    const historyLink = document.querySelector('.sidebar-link');
    const searchBar = document.getElementById('headerSearchBar');

    if (view === 'menu') {
        menuView.style.display = 'flex';
        historyView.classList.remove('active');
        menuBtn.classList.add('active');
        historyLink.classList.remove('active');
        searchBar.style.display = 'block';
    } else {
        menuView.style.display = 'none';
        historyView.classList.add('active');
        menuBtn.classList.remove('active');
        historyLink.classList.add('active');
        searchBar.style.display = 'none';
        populateOrderHistory();
        updateFilterOptions();
    }
}

// Populate order history
async function populateOrderHistory() {
    try {
        const response = await fetch('../controllers/pos.php?action=getOrderHistory');
        const result = await response.json();
        
        if (result.success) {
            orderHistory = result.data;
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
    const tableBody = document.getElementById('orderTableBody');
    tableBody.innerHTML = '';
    
    if (orderHistory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No orders found</td></tr>';
        return;
    }
    
    orderHistory.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.table}</td>
            <td>${order.items}</td>
            <td>${order.amount}</td>
            <td>${order.method}</td>
            <td>${order.date}</td>
            <td><span class="status-badge">${order.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Update filter options
function updateFilterOptions() {
    const filterType = document.getElementById('filterType').value;
    const filterValue = document.getElementById('filterValue');
    
    filterValue.innerHTML = '';
    
    if (filterType === 'month') {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = (index + 1).toString().padStart(2, '0');
            option.textContent = month;
            filterValue.appendChild(option);
        });
    } else if (filterType === 'day') {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0');
            option.textContent = i;
            filterValue.appendChild(option);
        }
    } else if (filterType === 'year') {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 5; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            filterValue.appendChild(option);
        }
    }
    
    filterOrders();
}

// Search orders
function searchOrders() {
    const searchValue = document.getElementById('searchOrderId').value.toLowerCase();
    const rows = document.querySelectorAll('#orderTableBody tr');
    rows.forEach(row => {
        const orderId = row.cells[0].textContent.toLowerCase();
        row.style.display = orderId.includes(searchValue) ? '' : 'none';
    });
}

// Filter orders
function filterOrders() {
    const filterType = document.getElementById('filterType').value;
    const filterValue = document.getElementById('filterValue').value;
    const rows = document.querySelectorAll('#orderTableBody tr');
    
    rows.forEach(row => {
        const date = row.cells[5].textContent;
        const dateParts = date.split('-');
        let display = false;
        
        if (filterType === 'month') {
            display = dateParts[0] === filterValue;
        } else if (filterType === 'day') {
            display = dateParts[1] === filterValue;
        } else if (filterType === 'year') {
            display = dateParts[2] === filterValue;
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
    const printWindow = window.open('', '', 'height=600,width=800');
    const tableHtml = document.querySelector('.order-table').outerHTML;
    printWindow.document.write('<html><head><title>Order History</title><style>body { font-family: Arial; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }</style></head><body>');
    printWindow.document.write('<h1>Order History</h1>');
    printWindow.document.write(tableHtml);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    updateOrderSummary(); 

    const dineInButton = document.querySelector('.order-type-btn[data-type="dine-in"]');
    if (dineInButton) {
        selectOrderType(dineInButton, 'dine-in');
    }

    const cashButton = document.querySelector('.payment-btn.cash');
    if (cashButton) {
        selectPayment(cashButton);
    }
});