let currentOrder = null;

const statusDescriptions = {
    "Pending": "Your order has been received and is waiting to be processed.",
    "Preparing": "Our kitchen is preparing your delicious meal.",
    "Ready": "Your order is ready and waiting for delivery.",
    "Out for Delivery": "Your order is on its way to you!",
    "Delivered": "Your order has been successfully delivered. Enjoy!"
};

document.getElementById('trackingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    trackOrder();
});

function trackOrder() {
    const orderNumber = document.getElementById('orderNumber').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    if (!orderNumber) {
        showError('Please enter an order number');
        return;
    }

    // Hide error message
    errorMessage.style.display = 'none';

    // Show loading
    Swal.fire({
        title: 'Searching...',
        text: 'Looking up your order',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Fetch order details
    fetch('../../../controllers/customer_controllers/track_guest_order.php?order_number=' + encodeURIComponent(orderNumber))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            Swal.close();
            
            if (data.success) {
                currentOrder = data.order;
                displayOrderStatus(data.order);
            } else {
                showError(data.message || 'Order not found. Please check your order number and try again.');
            }
        })
        .catch(error => {
            Swal.close();
            console.error('Error:', error);
            showError('Unable to connect to server. Please try again later.');
        });
}

function displayOrderStatus(order) {
    // Hide search card, show result card
    document.getElementById('searchCard').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';

    // Populate order info
    document.getElementById('displayOrderNo').textContent = order.order_number;
    document.getElementById('displayOrderDate').textContent = order.date_ordered;
    document.getElementById('displayCustomerName').textContent = order.recipient_name || 'N/A';
    document.getElementById('displayAddress').textContent = order.delivery_address || 'N/A';

    // Create status tracker
    const statuses = [
        "Pending",
        "Preparing", 
        "Ready",
        "Out for Delivery",
        "Delivered"
    ];

    const currentStatus = order.order_status;
    let currentStep = statuses.indexOf(currentStatus);
    if (currentStep === -1) currentStep = 0;

    let html = '';
    statuses.forEach((status, index) => {
        const isCompleted = index <= currentStep;
        const showLine = index < statuses.length - 1;
        
        html += `
            <div class="status-item">
                <div class="checkpoint ${isCompleted ? 'completed' : ''}"></div>
                <div>
                    <div class="status-label ${isCompleted ? 'completed' : ''}">${status}</div>
                    <div class="status-description">${statusDescriptions[status]}</div>
                </div>
                ${showLine ? `<div class="connecting-line ${index < currentStep ? 'completed' : ''}"></div>` : ''}
            </div>
        `;
    });

    document.getElementById('statusTracker').innerHTML = html;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showReceipt() {
    if (!currentOrder) {
        alert('No order data available');
        return;
    }

    const order = currentOrder;
    
    document.getElementById('receiptOrderNumber').innerHTML = `Order No: <b>${order.order_number || 'N/A'}</b>`;
    document.getElementById('receiptOrderDate').innerHTML = `<b>${order.date_ordered || 'N/A'}</b>`;
    document.getElementById('receiptRecipient').innerHTML = `Customer Name: <b>${order.recipient_name || 'N/A'}</b>`;
    document.getElementById('receiptContactNumber').innerHTML = `Contact Number: <b>${order.phone_number || 'N/A'}</b>`;
    document.getElementById('receiptEmailAddress').innerHTML = `Email Address: <b>${order.email || 'N/A'}</b>`;
    document.getElementById('receiptDeliveryAddress').innerHTML = `Delivery Address: <b>${order.delivery_address || 'N/A'}</b>`;
    
    const subtotal = parseFloat(order.subtotal) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('receiptSubtotal').innerHTML = `<b>₱${subtotal.toFixed(2)}</b>`;
    document.getElementById('receiptDeliveryFee').innerHTML = `<b>₱${deliveryFee.toFixed(2)}</b>`;
    document.getElementById('receiptTotal').innerHTML = `<b>₱${total.toFixed(2)}</b>`;
    document.getElementById('receiptPaymentMethod').innerHTML = `Payment Method: <b>${order.payment_method || 'N/A'}</b>`;

    const itemsContainer = document.getElementById('receiptItemsContainer');
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

    document.getElementById('receiptSection').style.display = 'flex';
}

function closeReceipt(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    document.getElementById('receiptSection').style.display = 'none';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

function resetTracking() {
    document.getElementById('searchCard').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('orderNumber').value = '';
    document.getElementById('errorMessage').style.display = 'none';
    currentOrder = null;
}