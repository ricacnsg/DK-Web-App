
//papalitan pa 'tong mga data na 'to dapat sa database manggagaling
const ordersData = [
    {
        id: "1234",
        customer: "Customer Name",
        address: "123 Main St.",
        status: "not_complete",
        items: [
            { name: "Item 1", quantity: 2, price: 150 },
            { name: "Item 2", quantity: 1, price: 200 }
        ],
        mapKey: "map1"
    },
    {
        id: "7284",
        customer: "Another Customer",
        address: "101 Main St.",
        status: "completed",
        items: [],
        mapKey: "map2"
    },
    {
        id: "3145",
        customer: "Third Customer",
        address: "312 Main St.",
        status: "return",
        items: [
            { name: "Adobo", quantity: 1, price: 120 },
            { name: "Rice", quantity: 2, price: 30 }
        ],
        mapKey: "map3"
    }
];

// ============================================
// SVG MINI MAPS
// ============================================
const miniMaps = {
    map1: `
        <svg width="140" height="90" viewBox="0 0 140 90">
            <rect width="140" height="90" rx="15" fill="#ffffff"/>
            <path d="M15 65 Q45 45 90 40 Q110 35 120 20"
                  stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <circle cx="15" cy="65" r="8" fill="#ef4444"/>
            <circle cx="120" cy="20" r="8" fill="#22c55e"/>
        </svg>
    `,
    map2: `
        <svg width="140" height="90" viewBox="0 0 140 90">
            <rect width="140" height="90" rx="15" fill="#ffffff"/>
            <path d="M30 25 Q60 50 90 55 Q110 60 125 70"
                  stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <circle cx="30" cy="25" r="8" fill="#ef4444"/>
            <circle cx="125" cy="70" r="8" fill="#22c55e"/>
        </svg>
    `,
    map3: `
        <svg width="140" height="90" viewBox="0 0 140 90">
            <rect width="140" height="90" rx="15" fill="#ffffff"/>
            <path d="M25 70 Q50 60 70 40 Q100 20 120 15"
                  stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <circle cx="25" cy="70" r="8" fill="#ef4444"/>
            <circle cx="120" cy="15" r="8" fill="#22c55e"/>
        </svg>
    `
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadCurrentOrder();
    setupEventListeners();
});

// ============================================
// LOAD AND DISPLAY ORDERS
// ============================================
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    ordersData.forEach(order => {
        const orderRow = createOrderRow(order);
        ordersList.appendChild(orderRow);
    });
}

// ============================================
// CREATE ORDER ROW ELEMENT
// ============================================
function createOrderRow(order) {
    const orderRow = document.createElement('div');
    orderRow.className = 'order-item-row';
    orderRow.dataset.orderId = order.id;

    const orderInfo = document.createElement('div');
    orderInfo.className = 'order-info';

    const orderNumber = document.createElement('span');
    orderNumber.className = 'order-number';
    orderNumber.textContent = "Order " + order.id;

    const orderLocation = document.createElement('span');
    orderLocation.className = 'order-location';
    orderLocation.textContent = order.address;

    orderInfo.appendChild(orderNumber);
    orderInfo.appendChild(orderLocation);

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge';

    switch(order.status) {
        case 'completed':
            statusBadge.classList.add('badge-completed');
            statusBadge.textContent = 'Completed';
            break;
        case 'return':
            statusBadge.classList.add('badge-return');
            statusBadge.textContent = 'Return';
            break;
        default:
            statusBadge.classList.add('badge-not-complete');
            statusBadge.textContent = 'Not Complete';
    }

    orderRow.appendChild(orderInfo);
    orderRow.appendChild(statusBadge);

    // CLICK EVENT: load order details + map
    orderRow.addEventListener('click', function() {
        loadOrderDetails(order.id);
    });

    return orderRow;
}

// ============================================
// LOAD CURRENT ORDER
// ============================================
function loadCurrentOrder() {
    const currentOrder = ordersData.find(order => order.status === 'not_complete') || ordersData[0];
    if (currentOrder) displayCurrentOrder(currentOrder);
}

// ============================================
// DISPLAY CURRENT ORDER DETAILS + MAP
// ============================================
function displayCurrentOrder(order) {
    document.getElementById('currentOrderId').textContent = "Order " + order.id;
    document.getElementById('customerName').textContent = order.customer;
    document.getElementById('deliveryAddress').textContent = order.address;
    displayOrderSummary(order.items);

    // UPDATE MINI MAP
    const miniMapContainer = document.getElementById('miniMapContainer');
    if (miniMapContainer) {
        miniMapContainer.innerHTML = miniMaps[order.mapKey] || miniMaps.map1;
    }

    // Highlight selected row
    document.querySelectorAll('.order-item-row').forEach(row => {
        row.classList.remove('active');
        if (row.dataset.orderId === order.id) {
            row.classList.add('active');
        }
    });
}

// ============================================
// DISPLAY ORDER SUMMARY
// ============================================
function displayOrderSummary(items) {
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

    if (!items || items.length === 0) {
        orderSummary.innerHTML = '<p class="text-center text-muted">No items in this order</p>';
        return;
    }

    let total = 0;
    items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = item.name + item.quantity;

        const itemPrice = document.createElement('span');
        itemPrice.className = 'item-price';
        const itemTotal = item.price * item.quantity;
        itemPrice.textContent = "₱" + itemTotal.toFixed(2);

        orderItem.appendChild(itemName);
        orderItem.appendChild(itemPrice);
        orderSummary.appendChild(orderItem);

        total += itemTotal;
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'order-item mt-2 pt-2';
    totalRow.style.borderTop = '2px solid #1e3a8a';

    const totalLabel = document.createElement('span');
    totalLabel.className = 'item-name';
    totalLabel.innerHTML = '<strong>Total:</strong>';

    const totalPrice = document.createElement('span');
    totalPrice.className = 'item-price';
    totalPrice.innerHTML = `<strong>₱${total.toFixed(2)}</strong>`;

    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalPrice);
    orderSummary.appendChild(totalRow);
}

// ============================================
// LOAD ORDER DETAILS BY ID
// ============================================
function loadOrderDetails(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) displayCurrentOrder(order);
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    document.getElementById('btnCompleted').addEventListener('click', function() {
        const orderId = document.getElementById('currentOrderId').textContent.replace('Order #', '');
        markOrderAsCompleted(orderId);
    });

    document.getElementById('btnReturn').addEventListener('click', function() {
        const orderId = document.getElementById('currentOrderId').textContent.replace('Order #', '');
        markOrderAsReturn(orderId);
    });

    document.querySelector('.btn-logout').addEventListener('click', function() {
        handleLogout();
    });
}

// ============================================
// MARK ORDER AS COMPLETED / RETURN
// ============================================
function markOrderAsCompleted(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) order.status = 'completed';
    loadOrders();
    loadCurrentOrder();
    alert("Order" + orderId + " marked for completed!");
}

function markOrderAsReturn(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) order.status = 'return';
    loadOrders();
    loadCurrentOrder();
    alert("Order" + orderId + " marked for return!");
}

// ============================================
// HANDLE LOGOUT
// ============================================
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logout functionality - redirect to login page');
    }
}