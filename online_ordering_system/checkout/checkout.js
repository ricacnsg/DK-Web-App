document.addEventListener('DOMContentLoaded', () => {
  const checkoutItemsContainer = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const deliveryFeeElement = document.getElementById("checkoutDeliveryFee");
  const totalElement = document.getElementById("checkoutTotal");

  const selectedItems = JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const subtotal = parseFloat(sessionStorage.getItem("cartSubtotal")) || 0;
  const total = parseFloat(sessionStorage.getItem("cartTotal")) || 0;
  const deliveryFee = parseFloat(sessionStorage.getItem("deliveryFee")) || 0;

  selectedItems.forEach(item => {
    const itemRow = `
      <div class="d-flex justify-content-between">
        <span>${item.name} x ${item.quantity}</span>
        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
    checkoutItemsContainer.insertAdjacentHTML('afterbegin', itemRow);
  });

  subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
  deliveryFeeElement.textContent = `₱${deliveryFee.toFixed(2)}`;
  totalElement.textContent = `₱${total.toFixed(2)}`;

  document.getElementById('checkoutBtn').addEventListener('click', (e) => {
    e.preventDefault();

    const recipientName = document.getElementById('recipient').value.trim();
    const contactNumber = document.getElementById('contact').value.trim();
    const email = document.getElementById('email').value.trim();
    const street = document.getElementById('street').value.trim();
    const barangay = document.getElementById('barangay').value.trim();
    const municipality = document.getElementById('municipality').value.trim();
    const remark = document.getElementById('remark').value.trim();
    const paymentOption = document.querySelector('input[name="paymentOption"]:checked');

    // Validation
    if (!recipientName || !contactNumber || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all personal information fields.'
      });
      return;
    }

    if (!street || !barangay || !municipality) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Address',
        text: 'Please fill in all delivery location fields.'
      });
      return;
    }

    if (!paymentOption) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment Method Required',
        text: 'Please select a payment method.'
      });
      return;
    }

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 90000) + 10000;
    const orderNumber = `${dateStr}${randomSuffix}`;

    // Save to sessionStorage
    sessionStorage.setItem('orderNumber', orderNumber);
    sessionStorage.setItem('recipientName', recipientName);
    sessionStorage.setItem('contactNumber', contactNumber);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('street', street);
    sessionStorage.setItem('barangay', barangay);
    sessionStorage.setItem('municipality', municipality);
    sessionStorage.setItem('remark', remark);
    sessionStorage.setItem('paymentMethod', paymentOption.value);

    const orderData = {
      orderNumber,
      recipientName,
      contactNumber,
      email,
      street,
      barangay,
      municipality,
      remark,
      paymentMethod: paymentOption.value,
      items: selectedItems,
      subtotal,
      deliveryFee,
      total
    };

    console.log('Sending order data:', orderData);

    // Show loading
    Swal.fire({
      title: 'Processing Order...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    fetch('../../../controllers/customer_controllers/ordering_controllers/submit_order.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Response:', data);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Order Placed!',
          html: `
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <hr>
            <p>📧 <strong>Check your email!</strong></p>
            <p>We've sent a verification link to <strong>${email}</strong></p>
            <p>Please click the link in the email to confirm your order.</p>
            <hr>
            <p style="font-size: 14px; color: #666;">
              ⚠️ Your order will only be processed after email verification.
            </p>
            <p style="font-size: 14px; color: #666;">
              ⚠️ Delivery fee and Order total will update once reviewed by admin.
            </p>
          `,
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then(() => {
          // Clear cart items
          sessionStorage.removeItem('selectedItems');
          sessionStorage.removeItem('cartSubtotal');
          sessionStorage.removeItem('cartTotal');
          sessionStorage.removeItem('deliveryFee');
          
          // Redirect to menu or home
          window.location.href = '../get_order/get_order.php';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Order Failed',
          text: data.message || 'Failed to place order. Please try again.'
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to connect to server. Please check your internet connection.'
      });
    });
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