// Menu data with online images
const menuItems = [
    { 
        name: 'SPAM SILOG', 
        desc: 'Spam • Fried Rice • Fried Egg', 
        price: 109, 
        category: 'BentoSilog', 
        quantity: 0,
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d96f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lsb2clMjBmb29kfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'CHICKEN WINGS', 
        desc: 'Garlic Parmesan Flavor', 
        price: 129, 
        category: 'Flavoured Wings w/ Rice', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'RICE TOPPED LIEMPO', 
        desc: 'Crispy Pork Belly', 
        price: 159, 
        category: 'Rice Meal', 
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9yayUyMGJlbGx5fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'CLASSIC CHEESEBURGER', 
        desc: 'Patty, Cheese, Lettuce', 
        price: 99, 
        category: 'Burger and Sandwiches', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlZXNlYnVyZ2VyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'TAPA SILOG', 
        desc: 'Tapa • Fried Rice • Fried Egg', 
        price: 109, 
        category: 'BentoSilog', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1604909053586-75d028495c18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFwYSUyMHNpbG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'CALAMARES', 
        desc: 'Deep-fried Squid Rings', 
        price: 149, 
        category: 'Pulutan Express', 
        quantity: 0,
        image: 'https://images.unsplash.com/photo-1626645735466-78696cc2b8f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FsYW1hcmVzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'MILK TEA', 
        desc: 'Wintermelon Flavor', 
        price: 85, 
        category: 'Beverages', 
        quantity: 0,
        image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsayUyMHRlYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    },
    { 
        name: 'CHICKEN SILOG', 
        desc: 'Chicken • Fried Rice • Fried Egg', 
        price: 109, 
        category: 'BentoSilog', 
        quantity: 0,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHNpbG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
];

// Order history data
const orderHistory = [
    { id: 1, table: 3, items: 'Tapa Silog', amount: '₱109', method: 'Cash', date: '10-15-2024', status: 'Completed' },
    { id: 2, table: 4, items: 'Spam Silog', amount: '₱109', method: 'Cash', date: '10-16-2024', status: 'Completed' },
    { id: 3, table: 'Takeout', items: 'Tocino Silog', amount: '₱99', method: 'Cash', date: '10-16-2024', status: 'Completed' },
    { id: 4, table: 7, items: 'Chicken Silog', amount: '₱109', method: 'Gcash', date: '10-16-2024', status: 'Completed' },
    { id: 5, table: 2, items: 'Bangus Silog', amount: '₱120', method: 'Cash', date: '10-16-2024', status: 'Completed' },
    { id: 6, table: 8, items: 'Shanghai Silog Extra Rice(2) Strawberry Dalgona', amount: '₱339', method: 'Cash', date: '10-16-2024', status: 'Completed' }
];

// Initialize menu
function initializeMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    menuItems.forEach((item, index) => {
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';
        menuItemEl.innerHTML = `
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-desc">${item.desc}</div>
                <div class="menu-item-price">Php ${item.price}.00</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <div class="quantity-display">${item.quantity}</div>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItemEl);
    });
}

// Update quantity
function updateQuantity(index, change) {
    menuItems[index].quantity = Math.max(0, menuItems[index].quantity + change);
    initializeMenu();
    updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
    const itemsList = document.getElementById('itemsList');
    let total = 0;
    let itemsHTML = '';

    const orderedItems = menuItems.filter(item => item.quantity > 0);

    if (orderedItems.length > 0) {
        orderedItems.forEach(item => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            itemsHTML += `
                <div class="item-row">
                    <span>${item.quantity}x ${item.name}</span>
                    <span class="item-row-price">Php ${itemTotal}.00</span>
                </div>
            `;
        });
    } else {
        // Placeholder items when no items are added
        itemsHTML = `
            <div class="item-row">
                <span>2x Chicken Silog</span>
                <span class="item-row-price">Php 198.00</span>
            </div>
            <div class="item-row">
                <span>2x Lemon Yakult</span>
                <span class="item-row-price">Php 198.00</span>
            </div>
            <div class="item-row">
                <span>1x Potato Mojos</span>
                <span class="item-row-price">Php 99.00</span>
            </div>
        `;
        total = 495; // Placeholder total
    }

    itemsList.innerHTML = itemsHTML;
    document.getElementById('totalPrice').textContent = `Php ${total.toFixed(2)}`;
}

// Select category
function selectCategory(el) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    el.classList.add('active');
}

// Select order type and control Table Number visibility
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

// Select payment with color change
function selectPayment(el) {
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    el.classList.add('active');
}

// Show order confirmation modal
function showOrderConfirmation() {
    const totalPriceText = document.getElementById('totalPrice').textContent;
    const hasOrderedItems = menuItems.some(item => item.quantity > 0) || totalPriceText.includes('495');

    if (!hasOrderedItems) {
        alert('Please select items before placing an order.');
        return; 
    }

    // Get order details for confirmation message
    const customerName = document.querySelector('.form-input-gold').value;
    const totalPrice = totalPriceText;
    const activePaymentBtn = document.querySelector('.payment-btn.active');
    const paymentMethod = activePaymentBtn ? activePaymentBtn.textContent.trim() : 'N/A';
    const orderType = document.querySelector('.order-type-btn.active').getAttribute('data-type');
    let tableNumber = '';

    if (orderType === 'dine-in') {
        tableNumber = document.getElementById('tableNumberInput').value;
    }

    let confirmationMessage = `Are you sure you want to place this order?<br><br>`;
    confirmationMessage += `Customer: ${customerName}<br>`;
    confirmationMessage += `Order Type: ${orderType.toUpperCase()}`;

    if (orderType === 'dine-in' && tableNumber) {
        confirmationMessage += ` (Table #${tableNumber})`;
    }

    confirmationMessage += `<br>Total: ${totalPrice}<br>`;
    confirmationMessage += `Payment: ${paymentMethod}`;

    document.getElementById('confirmationMessage').innerHTML = confirmationMessage;
    document.getElementById('orderConfirmationModal').style.display = 'flex';
}

// Confirm order
function confirmOrder() {
    // Close the modal
    document.getElementById('orderConfirmationModal').style.display = 'none';
    
    // Process the order
    const customerName = document.querySelector('.form-input-gold').value;
    const totalPrice = document.getElementById('totalPrice').textContent;
    const activePaymentBtn = document.querySelector('.payment-btn.active');
    const paymentMethod = activePaymentBtn ? activePaymentBtn.textContent.trim() : 'N/A';
    const orderType = document.querySelector('.order-type-btn.active').getAttribute('data-type');
    let tableNumber = '';

    if (orderType === 'dine-in') {
        tableNumber = document.getElementById('tableNumberInput').value;
    }

    let orderDetails = `Order placed successfully! ✅\n\n`;
    orderDetails += `Customer: ${customerName}\n`;
    orderDetails += `Order Type: ${orderType.toUpperCase()}`;

    if (orderType === 'dine-in' && tableNumber) {
        orderDetails += ` (Table #${tableNumber})`;
    }

    orderDetails += `\nTotal: ${totalPrice}\n`;
    orderDetails += `Payment: ${paymentMethod}`;
    orderDetails += `\n\n--- Order Sent to Kitchen ---`;

    alert(orderDetails);
}

// Cancel order
function cancelOrder() {
    document.getElementById('orderConfirmationModal').style.display = 'none';
}

// Toggle order history view
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
        updateFilterOptions(); // Initialize filter options
    }
}

// Populate order history
function populateOrderHistory() {
    const tableBody = document.getElementById('orderTableBody');
    tableBody.innerHTML = '';
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

// Update filter options based on selected filter type
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
    
    // Trigger filtering after updating options
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
        const date = row.cells[5].textContent; // MM-DD-YYYY format
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