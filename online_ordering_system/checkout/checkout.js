document.addEventListener('DOMContentLoaded', () => {
  const checkoutItemsContainer = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const deliveryFeeElement = document.getElementById("checkoutDeliveryFee");
  const totalElement = document.getElementById("checkoutTotal");
  const checkoutBtn = document.getElementById('checkoutBtn');
  const continueOverlay = document.getElementById('continue_overlay');

  const selectedItems = JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const subtotal = parseFloat(sessionStorage.getItem("cartSubtotal")) || 0;
  const total = parseFloat(sessionStorage.getItem("cartTotal")) || 0;
  const deliveryFee = parseFloat(sessionStorage.getItem("deliveryFee")) || 0;

  selectedItems.forEach(item => {
    const itemRow = `
      <div class="d-flex justify-content-between">
        <span><b>${item.name} x ${item.quantity}</b></span>
        <span>Php${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
    checkoutItemsContainer.insertAdjacentHTML('afterbegin', itemRow);
  });

  subtotalElement.textContent = `Php${subtotal.toFixed(2)}`;
  deliveryFeeElement.textContent = `Php${deliveryFee.toFixed(2)}`;
  totalElement.textContent = `Php${total.toFixed(2)}`;

  // ============================
  // BACK TO MENU BUTTON
  // ============================
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
      window.location.href = '../get_order/get_order.php';
    });
  }

  // ============================
  // BACK TO CART BUTTON
  // ============================
  const backToCartBtn = document.getElementById('backToCartBtn');
  if (backToCartBtn) {
    backToCartBtn.addEventListener('click', () => {
      window.location.href = '../view_cart/view_cart.php';
    });
  }

  // ============================
  // PRE-FILL CUSTOMER INFO & LOAD ADDRESSES
  // ============================
  if (window.userData && window.userData.isLoggedIn) {
    // Load customer details
    fetch('../../../controllers/customer_controllers/personal_information/load_my_details.php')
      .then(response => response.json())
      .then(data => {
        console.log("Pre-filling customer data:", data);
        
        if (!data.error && data.customerID) {
          const recipientField = document.getElementById('recipient');
          const contactField = document.getElementById('contact');
          const emailField = document.getElementById('email');
          
          // Pre-fill values
          recipientField.value = data.name || '';
          contactField.value = data.contact_number || '';
          emailField.value = data.email || '';
          
          // Make fields readonly for logged-in users
          recipientField.setAttribute('readonly', true);
          contactField.setAttribute('readonly', true);
          emailField.setAttribute('readonly', true);
          
          // Add visual styling to show they're readonly
          recipientField.style.backgroundColor = '#f0f0f0';
          contactField.style.backgroundColor = '#f0f0f0';
          emailField.style.backgroundColor = '#f0f0f0';
        }
      })
      .catch(error => {
        console.error("Error fetching customer data:", error);
      });

    // Load saved addresses
    fetch('../../../controllers/customer_controllers/personal_information/load_my_addresses.php')
      .then(response => response.json())
      .then(addresses => {
        console.log("Loaded addresses:", addresses);
        
        if (!addresses.error && Array.isArray(addresses) && addresses.length > 0) {
          // Create address dropdown
          const streetLabel = document.getElementById('street-header');
          const streetInput = document.getElementById('street');
          const addressDropdown = document.createElement('select');
          addressDropdown.id = 'savedAddressSelect';
          addressDropdown.className = 'form-control rounded border-2 mb-2';
          
          // Add default option
          addressDropdown.innerHTML = '<option value="">-- Select Saved Address or Enter New --</option>';
          
          // Add saved addresses
          addresses.forEach(addr => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
              street: addr.street,
              barangay: addr.barangay,
              municipality: addr.municipality,
              remark: addr.locationRemark
            });
            option.textContent = addr.full_address;
            addressDropdown.appendChild(option);
          });
          
          // Insert dropdown before street input
          streetLabel.parentNode.insertBefore(addressDropdown, streetLabel);
          
          // Handle address selection
          addressDropdown.addEventListener('change', function() {
            if (this.value) {
              const selectedAddr = JSON.parse(this.value);
              document.getElementById('street').value = selectedAddr.street || '';
              document.getElementById('barangay').value = selectedAddr.barangay || '';
              document.getElementById('municipality').value = selectedAddr.municipality || '';
              document.getElementById('remark').value = selectedAddr.remark || '';
            } else {
              // Clear fields if "Select..." is chosen
              document.getElementById('street').value = '';
              document.getElementById('barangay').value = '';
              document.getElementById('municipality').value = '';
              document.getElementById('remark').value = '';
            }
          });
        }
      })
      .catch(error => {
        console.error("Error loading addresses:", error);
      });
  }

  // ============================
  // CHECKOUT BUTTON
  // ============================
  checkoutBtn?.addEventListener('click', (e) => {
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
    .then(response => {
      // First check if response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Get the raw text first to see what we're dealing with
      return response.text();
    })
    .then(text => {
      console.log('Raw response:', text);
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        console.log('Parsed response:', data);
        
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
      } catch (parseError) {
        // Response wasn't valid JSON - show what was returned
        console.error('JSON Parse Error:', parseError);
        console.error('Response was:', text);
        
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          html: `
            <p>The server returned an invalid response.</p>
            <details style="text-align: left; margin-top: 10px;">
              <summary style="cursor: pointer; color: #666;">Click to see error details</summary>
              <pre style="max-height: 300px; overflow: auto; background: #f5f5f5; padding: 10px; margin-top: 10px; font-size: 12px;">${text.substring(0, 1000)}</pre>
            </details>
          `,
          confirmButtonText: 'OK'
        });
      }
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        html: `
          <p>Failed to connect to server.</p>
          <p style="font-size: 14px; color: #666;">${error.message}</p>
        `
      });
    });
  });

  // ============================
  // Profile button - redirect to profile page
  // ============================
  const myProfileBtn = document.getElementById('myProfile');
  if (myProfileBtn) {
    myProfileBtn.addEventListener('click', () => {
      // Get customer ID from session data (made available in the PHP file)
      const customerID = window.userData?.customerID;
      
      // Store in sessionStorage
      if (customerID) {
        sessionStorage.setItem('customer_id', customerID);
      }
      window.location.href = '../personal_info/personal_info.php';
    });
  }

  const profileRedirect = document.getElementById('redirectToMyProfile');
  if (profileRedirect) {
    profileRedirect.addEventListener('click', () => {
      // Get customer ID from session data (made available in the PHP file)
      const customerID = window.userData?.customerID;
      
      if (customerID) {
        sessionStorage.setItem('customer_id', customerID);
      }
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
});