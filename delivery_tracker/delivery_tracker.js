// ============================================
// GLOBAL STATE
// ============================================
let ordersData = [];
let currentOrderId = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadOrdersFromBackend();
    setupEventListeners();
});

// ============================================
// FETCH ORDERS FROM BACKEND
// ============================================
async function loadOrdersFromBackend() {
    try {
        showLoadingState();
        
        const response = await fetch('../controllers/delivery_controllers/get_ready.php');
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Filter only "Ready" status orders for delivery
        ordersData = data.filter(order => order.order_status === 'Ready');
        
        // Transform backend data to match frontend structure
        ordersData = ordersData.map(order => ({
            id: order.order_number,
            customer: order.recipient_name,
            address: order.delivery_address,
            email: order.email,
            phone: order.phone_number,
            status: 'not_complete', // Default status for ready orders
            dateOrdered: order.date_ordered,
            subtotal: parseFloat(order.subtotal),
            deliveryFee: parseFloat(order.delivery_fee),
            totalPrice: parseFloat(order.subtotal) + parseFloat(order.delivery_fee),
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            items: parseOrderItems(order.items_ordered)
        }));
        
        displayOrders();
        loadCurrentOrder();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showErrorState(error.message);
    }
}

// ============================================
// PARSE ORDER ITEMS FROM STRING
// ============================================
function parseOrderItems(itemsString) {
    if (!itemsString) return [];
    
    // Format: "Item Name x2 @150.00, Item Name 2 x1 @200.00"
    const items = itemsString.split(', ');
    
    return items.map(itemStr => {
        // Extract: name, quantity, price
        const match = itemStr.match(/^(.+?)\sx(\d+)\s@([\d.]+)$/);
        
        if (match) {
            return {
                name: match[1].trim(),
                quantity: parseInt(match[2]),
                price: parseFloat(match[3])
            };
        }
        
        return null;
    }).filter(item => item !== null);
}

// ============================================
// DISPLAY ORDERS IN LIST
// ============================================
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (ordersData.length === 0) {
        ordersList.innerHTML = '<p class="text-center text-muted py-5">No orders ready for delivery</p>';
        return;
    }

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
    orderNumber.textContent = `Order #${order.id}`;

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

    // CLICK EVENT: load order details
    orderRow.addEventListener('click', function() {
        displayCurrentOrder(order);
    });

    return orderRow;
}

// ============================================
// LOAD CURRENT ORDER (DEFAULT TO FIRST)
// ============================================
function loadCurrentOrder() {
    const firstNotComplete = ordersData.find(order => order.status === 'not_complete');
    const orderToDisplay = firstNotComplete || ordersData[0];
    
    if (orderToDisplay) {
        displayCurrentOrder(orderToDisplay);
    } else {
        showNoOrdersState();
    }
}

// ============================================
// DISPLAY CURRENT ORDER DETAILS
// ============================================
function displayCurrentOrder(order) {
    currentOrderId = order.id;
    
    document.getElementById('currentOrderId').textContent = `Order #${order.id}`;
    document.getElementById('customerName').textContent = order.customer;
    document.getElementById('deliveryAddress').textContent = order.address;
    
    displayOrderSummary(order);

    // Highlight selected row
    document.querySelectorAll('.order-item-row').forEach(row => {
        row.classList.remove('active');
        if (row.dataset.orderId === order.id) {
            row.classList.add('active');
        }
    });
}

// ============================================
// DISPLAY ORDER SUMMARY WITH ITEMS
// ============================================
function displayOrderSummary(order) {
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

    if (!order.items || order.items.length === 0) {
        orderSummary.innerHTML = '<p class="text-center text-muted">No items in this order</p>';
        return;
    }

    // Display items
    order.items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = `${item.name} x${item.quantity}`;

        const itemPrice = document.createElement('span');
        itemPrice.className = 'item-price';
        const itemTotal = item.price * item.quantity;
        itemPrice.textContent = `₱${itemTotal.toFixed(2)}`;

        orderItem.appendChild(itemName);
        orderItem.appendChild(itemPrice);
        orderSummary.appendChild(orderItem);
    });

    // Subtotal
    const subtotalRow = createSummaryRow('Subtotal:', order.subtotal);
    orderSummary.appendChild(subtotalRow);

    // Delivery Fee
    const deliveryRow = createSummaryRow('Delivery Fee:', order.deliveryFee);
    orderSummary.appendChild(deliveryRow);

    // Total
    const totalRow = createSummaryRow('Total:', order.totalPrice, true);
    orderSummary.appendChild(totalRow);

    // Payment Info
    const paymentInfo = document.createElement('div');
    paymentInfo.className = 'mt-3 pt-3';
    paymentInfo.style.borderTop = '1px solid #ddd';
    paymentInfo.innerHTML = `
        <small class="text-muted d-block">Payment: ${order.paymentMethod}</small>
        <small class="text-muted d-block">Status: ${order.paymentStatus}</small>
    `;
    orderSummary.appendChild(paymentInfo);
}

// ============================================
// CREATE SUMMARY ROW
// ============================================
function createSummaryRow(label, amount, isBold = false) {
    const row = document.createElement('div');
    row.className = 'order-item mt-2';
    if (isBold) {
        row.classList.add('pt-2');
        row.style.borderTop = '2px solid #1e3a8a';
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'item-name';
    labelSpan.innerHTML = isBold ? `<strong>${label}</strong>` : label;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.innerHTML = isBold ? `<strong>₱${amount.toFixed(2)}</strong>` : `₱${amount.toFixed(2)}`;

    row.appendChild(labelSpan);
    row.appendChild(priceSpan);
    
    return row;
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    document.getElementById('btnCompleted').addEventListener('click', function() {
        if (currentOrderId) {
            markOrderAsCompleted(currentOrderId);
        }
    });

    document.getElementById('btnReturn').addEventListener('click', function() {
        if (currentOrderId) {
            markOrderAsReturn(currentOrderId);
        }
    });

    document.querySelector('.btn-logout').addEventListener('click', function() {
        handleLogout();
    });
}

// ============================================
// MARK ORDER AS COMPLETED
// ============================================
async function markOrderAsCompleted(orderId) {
    // Show confirmation dialog
    const result = await Swal.fire({
        title: 'Mark as Completed?',
        text: `Are you sure you want to mark Order #${orderId} as completed?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, mark as completed',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Processing...',
        text: 'Updating order status',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Update backend status to "Completed"
        const response = await fetch('../controllers/delivery_controllers/delivery_update_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_number: orderId,
                status: 'Completed'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local data
            const order = ordersData.find(o => o.id === orderId);
            if (order) order.status = 'completed';
            
            displayOrders();
            loadCurrentOrder();
            
            // Show success message
            await Swal.fire({
                title: 'Success!',
                text: `Order #${orderId} has been marked as completed`,
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        } else {
            throw new Error(data.message || 'Failed to update order');
        }
        
    } catch (error) {
        console.error('Error updating order:', error);
        
        // Show error message
        Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to mark order as completed. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
        });
    }
}

// ============================================
// MARK ORDER AS RETURN
// ============================================
async function markOrderAsReturn(orderId) {
    // Show confirmation dialog
    const result = await Swal.fire({
        title: 'Mark for Return?',
        text: `Are you sure you want to mark Order #${orderId} for return?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, mark for return',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Processing...',
        text: 'Updating order status',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Update backend status to "Returned"
        const response = await fetch('../controllers/delivery_controllers/delivery_update_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_number: orderId,
                status: 'Returned'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local data
            const order = ordersData.find(o => o.id === orderId);
            if (order) order.status = 'return';
            
            displayOrders();
            loadCurrentOrder();
            
            // Show success message
            await Swal.fire({
                title: 'Success!',
                text: `Order #${orderId} has been marked for return`,
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        } else {
            throw new Error(data.message || 'Failed to update order');
        }
        
    } catch (error) {
        console.error('Error updating order:', error);
        
        // Show error message
        Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to mark order for return. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
        });
    }
}

// ============================================
// UI STATE HANDLERS
// ============================================
function showLoadingState() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<p class="text-center text-muted py-5">Loading orders...</p>';
    
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '<p class="text-center text-muted">Loading...</p>';
}

function showErrorState(message) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = `
        <div class="alert alert-danger m-3" role="alert">
            <strong>Error:</strong> ${message}
            <button class="btn btn-sm btn-outline-danger mt-2 d-block" onclick="loadOrdersFromBackend()">
                Retry
            </button>
        </div>
    `;
    
    // Also show SweetAlert error
    Swal.fire({
        title: 'Error Loading Orders',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444'
    });
}

function showNoOrdersState() {
    document.getElementById('currentOrderId').textContent = 'No Active Order';
    document.getElementById('customerName').textContent = '-';
    document.getElementById('deliveryAddress').textContent = '-';
    document.getElementById('orderSummary').innerHTML = '<p class="text-center text-muted">No orders available</p>';
}

// ============================================
// HANDLE LOGOUT
// ============================================
async function handleLogout() {
    const result = await Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        window.location.href = '../logout.php';
    }
}