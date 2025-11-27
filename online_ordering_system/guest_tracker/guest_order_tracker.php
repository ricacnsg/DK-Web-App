<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Your Order - Daven's Kitchenette</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="guest_order_tracker.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
</head>
<body>
    <div class="tracking-container">
        <!-- Header Card -->
        <div class="header-card">
            <div class="logo-container">
                <img src="/assets/image/davens_logo.png" alt="Daven's Logo">
                <div class="company-name">
                    Daven's<br>Kitchenette
                </div>
            </div>
            <h2>Track Your Order</h2>
            <p>Enter your order number to see your delivery status</p>
        </div>

        <!-- Search Card -->
        <div class="search-card" id="searchCard">
            <form id="trackingForm">
                <div class="mb-3">
                    <label for="orderNumber" class="form-label">
                        <i class="fa-solid fa-receipt"></i>
                        Order Number
                    </label>
                    <input type="text" class="form-control" id="orderNumber" placeholder="e.g., 2025010123456" required>
                </div>
                <button type="submit" class="btn btn-track">
                    <i class="fa-solid fa-magnifying-glass me-2"></i>
                    Track Order
                </button>
                <div class="error-message" id="errorMessage">
                    <i class="fa-solid fa-circle-exclamation me-2"></i>
                    <span id="errorText"></span>
                </div>
            </form>
        </div>

        <!-- Result Card -->
        <div class="result-card" id="resultCard">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h3 style="margin: 0; color: #062970; font-weight: 700;">Order Status</h3>
                <div class="d-flex gap-2">
                    <button class="btn-receipt" onclick="showReceipt()">
                        <i class="fa-solid fa-receipt me-1"></i>Receipt
                    </button>
                    <button class="btn-back" onclick="resetTracking()">
                        <i class="fa-solid fa-arrow-left me-1"></i>Back
                    </button>
                </div>
            </div>

            <div class="order-info">
                <p><strong>Order #:</strong> <span id="displayOrderNo"></span></p>
                <p><strong>Date Ordered:</strong> <span id="displayOrderDate"></span></p>
                <p><strong>Customer:</strong> <span id="displayCustomerName"></span></p>
                <p><strong>Delivery Address:</strong> <span id="displayAddress"></span></p>
            </div>

            <h5 style="color: #333; font-weight: 600; margin-bottom: 15px;">Delivery Progress</h5>
            <div class="status-tracker" id="statusTracker">
                <!-- Status will be inserted here -->
            </div>
        </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receiptSection" style="display: none;" class="overlay" onclick="closeReceipt(event)">
        <div class="receipt-card" onclick="event.stopPropagation()">
            <div class="align-self-center p-3">
                <div class="overall-header mr-3 mb-2">
                    <span class="davens-receipt-header fw-bold" style="line-height:1; display:block; position:relative;">
                        Daven's
                        <img src="/assets/image/davens_logo.png" alt="Daven's Logo" class="davens-receipt-logo">
                    </span>
                    <span class="davens-receipt-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
                </div>
                <div class="d-flex justify-content-center">
                    <p class="contact-header justify-content-center">146 Consuelo St. Brgy 8, <br>
                        Nasugbu, 4231, Batangas <br>
                        0967 622 1293
                    </p>
                </div>
            </div>
            <div class="dashed-line opacity-50"></div>
            <div class="d-flex justify-content-between ms-3 me-3">
                <span id="receiptOrderNumber" class="details">Order No:</span>
                <span id="receiptOrderDate" class="details">Date | Time</span>
            </div>
            <div class="dashed-line opacity-50"></div>
            <div class="ms-3 me-3">
                <p id="receiptRecipient" class="details">Customer Name: </p>
                <p id="receiptContactNumber" class="details">Contact Number: </p>
                <p id="receiptEmailAddress" class="details">Email Address: </p>
                <p id="receiptDeliveryAddress" class="details">Delivery Address: </p>
            </div>
            <div class="dashed-line opacity-50" style="margin-top: -5px;"></div>
            <div class="ms-3 me-3">
                <p style="font-size: 12px; line-height: .8;"><b>Order Summary</b></p>
                <div id="receiptItemsContainer"></div>
            </div>
            <div class="solid-line opacity-50"></div>
            <div class="ms-3 me-3 d-flex justify-content-between">
                <span class="payment">Subtotal: </span><span id="receiptSubtotal" class="details"><b></b></span>
            </div>
            <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                <span class="payment">Delivery Fee: </span><span id="receiptDeliveryFee" class="details"><b></b></span>
            </div>
            <div class="solid-line opacity-50"></div>
            <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                <span style="font-size: 13px;" class="">TOTAL: </span><span id="receiptTotal" class="details"><b></b></span>
            </div>
            <div class="dashed-line opacity-50"></div>
            <div class="ms-3 me-3">
                <span id="receiptPaymentMethod" class="details">Payment Method: </span>
            </div>
            <div class="dashed-line opacity-50"></div>
            <div class="ms-3 me-3 text-center footer-section py-3">
                <p class="fw-bold mb-2" style="font-size: .7rem;">Thank you for Ordering!</p>
                <p class="text-muted mb-0" style="font-size: 0.6rem; line-height: 1;">
                    You can screenshot this receipt. Use<br>
                    your Order Number to track your order anytime.
                </p>
                <p class="fw-bold mt-3 mb-0" style="font-size: 0.7rem;">Track your order @</p>
                <p class="mb-0" style="font-size: 0.7rem;">www.davenskitchenette.ph/track</p>
                <button onclick="closeReceipt()" class="btn btn-sm btn-secondary mt-3">
                    <i class="fa-solid fa-times me-1"></i>Close
                </button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="guest_order_tracker.js"></script>
</body>
</html>