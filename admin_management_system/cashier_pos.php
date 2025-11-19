<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daven's Kitchenette - POS System</title>
    <link rel="stylesheet" href="cashier_pos.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css" crossorigin="anonymous" />
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="\assets\image\davens_logo.png" alt="Logo" class="logo-image" />
            <span>Daven's<br>Kitchenette</span>
        </div>
        <div class="search-bar" id="headerSearchBar">
            <input type="text" id="menuSearchInput" placeholder="Search menu..." onkeyup="searchMenu()">
        </div>
        <div class="user-profile">👤</div>
    </div>

    <div class="container">
        <div class="sidebar">
            <button class="sidebar-button active" onclick="switchView('menu')">
                <i class="fas fa-shopping-cart"></i> Order Menu
            </button>
            <a class="sidebar-link" onclick="switchView('history')">
                <i class="fas fa-history"></i> History
            </a>
            <button class="logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>

        <!-- Menu View -->
        <div id="menuView" class="menu-content">
            <div class="order-menu-background">
                <div class="get-order-header">
                    <div class="order-title">Get Order</div>
                    <div class="progress-bar">
                        <div class="progress-dot"></div>
                    </div>
                </div>

                <div class="category-section">
                    <div class="category-label">Category</div>
                    <div class="category-carousel" id="categoryCarousel">
                        <div class="category-item active" onclick="selectCategory(this)" data-category="bento">
                            <img src="/assets/image/bento.webp" alt="BentoSilog" class="category-icon" />
                            <div class="category-name">BentoSilog</div>
                        </div>
                        <div class="category-item" onclick="selectCategory(this)" data-category="wings">
                            <img src="/assets/image/Fried Legs.png" alt="Flavoured Wings" class="category-icon" />
                            <div class="category-name">Flavoured Wings w/ Rice</div>
                        </div>
                        <div class="category-item" onclick="selectCategory(this)" data-category="rice">
                            <img src="/assets/image/rice.png" alt="Rice Meal" class="category-icon" />
                            <div class="category-name">Rice Meal</div>
                        </div>
                        <div class="category-item" onclick="selectCategory(this)" data-category="burger">
                            <img src="/assets/image/Burgers.png" alt="Burger & Sandwiches" class="category-icon" />
                            <div class="category-name">Burger & Sandwiches</div>
                        </div>
                        <div class="category-item" onclick="selectCategory(this)" data-category="pulutan">
                            <img src="/assets/image/puluntan.png" alt="Pulutan Express" class="category-icon" />
                            <div class="category-name">Pulutan Express</div>
                        </div>
                        <div class="category-item" onclick="selectCategory(this)" data-category="beverages">
                            <img src="/assets/image/beverages.png" alt="Beverages" class="category-icon" />
                            <div class="category-name">Beverages</div>
                        </div>
                    </div>
                </div>

                <div class="menu-items-background">
                    <div class="menu-items-container">
                        <div class="menu-grid" id="menuGrid">
                            <!-- Menu items will be populated here by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>

            <div class="order-summary">
                <div class="order-summary-title">Order Summary</div>

                <div class="form-group">
                    <label class="form-label">Customer Name</label>
                    <input type="text" class="form-input" id="customerName" placeholder="Enter customer name">
                </div>

                <div class="form-group">
                    <label class="form-label">Order Type</label>
                    <div class="order-type-options">
                        <button class="order-type-btn active" data-type="dine-in" onclick="selectOrderType(this, 'dine-in')">Dine In</button>
                        <input type="text" class="form-input" placeholder="Table #" id="tableNumberInput">
                        <button class="order-type-btn" data-type="takeout" onclick="selectOrderType(this, 'takeout')">Takeout</button>
                    </div>
                </div>

                <div class="items-section">
                    <div class="items-label">Ordered Items</div>
                    <div class="items-list" id="itemsList">
                        <div class="item-row">
                            <span style="color: #999;">No items selected</span>
                        </div>
                    </div>
                    <div class="total-row">
                        <span>Total:</span>
                        <span id="totalPrice">Php 0.00</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Payment Method</label>
                    <div class="payment-methods">
                        <button class="payment-btn cash active" data-method="cash" onclick="selectPayment(this)">💵 Cash</button>
                        <button class="payment-btn gcash" data-method="gcash" onclick="selectPayment(this)">
                            <img src="\assets\image\gcash.png" alt="GCash" class="gcash-logo"> GCash
                        </button>
                    </div>
                </div>

                <button class="place-order-btn" onclick="showOrderConfirmation()">PLACE ORDER</button>
            </div>
        </div>

        <!-- Order History View -->
        <div id="historyView" class="order-history">
            <div class="history-background">
                <div class="history-header">
                    <div class="history-title">Order History</div>
                    <div class="history-controls">
                        <span class="search-label">Search Order</span>
                        <input type="text" class="history-search" placeholder="Enter Order ID" id="searchOrderId" onkeyup="searchOrders()">
                        
                        <div class="filter-group">
                            <select class="filter-select" id="filterType" onchange="updateFilterOptions()">
                                <option value="month">Filter By Month</option>
                                <option value="day">Filter By Day</option>
                                <option value="year">Filter By Year</option>
                            </select>
                            
                            <select class="filter-select" id="filterValue">
                            </select>
                        </div>
                        
                        <div class="history-buttons">
                            <button class="history-btn" onclick="exportData()">EXPORT</button>
                            <button class="history-btn" onclick="printData()">PRINT</button>
                        </div>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Table No.</th>
                                <th>Item Order</th>
                                <th>Total Amount</th>
                                <th>Payment Method</th>
                                <th>Order Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="orderTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div id="orderConfirmationModal" class="modal-overlay" style="display: none;">
        <div class="modal">
            <div class="modal-title">Confirm Order</div>
            <div class="modal-message" id="confirmationMessage">
                Are you sure you want to place this order?
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-confirm" onclick="confirmOrder()">Yes, Place Order</button>
                <button class="modal-btn modal-cancel" onclick="cancelOrder()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Cash Payment Modal -->
    <div id="cashPaymentModal" class="modal-overlay" style="display: none;">
        <div class="modal modal-payment">
            <div class="modal-title">Cash Payment</div>
            <div class="modal-message">
                <p>Total Amount: <strong id="cashTotal" style="font-size: 24px; color: #0052cc;">Php 0.00</strong></p>
                <div class="form-group" style="margin-top: 20px; text-align: left;">
                    <label class="form-label">Amount Received</label>
                    <input type="number" id="cashReceived" class="form-input cash-input" placeholder="0.00" step="0.01" min="0" autofocus>
                </div>
                <div class="quick-amount-buttons">
                    <button class="quick-amount-btn" onclick="setQuickAmount(50)">₱50</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(100)">₱100</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(200)">₱200</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(500)">₱500</button>
                    <button class="quick-amount-btn" onclick="setQuickAmount(1000)">₱1000</button>
                    <button class="quick-amount-btn" onclick="setExactAmount()">Exact</button>
                </div>
                <p id="changeAmount" style="margin-top: 20px; font-size: 20px; font-weight: bold; min-height: 30px;"></p>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-confirm" onclick="processCashPayment()">Confirm Payment</button>
                <button class="modal-btn modal-cancel" onclick="closeCashModal()">Cancel</button>
            </div>
        </div>
    </div>

    <div id="gcashModal" class="modal-overlay" style="display: none;">
        <div class="modal">
            <div class="modal-title">GCash Payment</div>
            <div class="modal-message">
                <div class="gcash-confirmation">
                    <i class="fas fa-check-circle"></i>
                    <h3>Payment Received</h3>
                    <p>Please confirm that the customer has completed the GCash payment</p>
                </div>
                <div class="payment-details">
                    <div class="payment-detail-row">
                        <span>Total Amount:</span>
                        <strong id="gcashTotal">Php 0.00</strong>
                    </div>
                    <div class="payment-detail-row">
                        <span>Payment Method:</span>
                        <strong>GCash</strong>
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-confirm" onclick="confirmGCashPayment()">Confirm Payment</button>
                <button class="modal-btn modal-cancel" onclick="closeGCashModal()">Cancel</button>
            </div>
        </div>
    </div>

    <script src="cashier_pos.js"></script>
</body>
</html>