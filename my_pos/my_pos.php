<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="my_pos.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css" crossorigin="anonymous" />
    <title>Point Of Sales</title>
</head>
<body>
    <div class="container-fluid">
        <div class="block align-self-center p-3">
            <div class="overall-header d-flex justify-content-between align-items-center w-100">
                <!-- LEFT SIDE -->
                <div class="d-flex flex-column">
                    <span class="davens-header fw-bold" style="line-height:1;">
                        Daven's
                        <img src="/assets/image/davens_logo.png"
                            alt="Daven's Logo"
                            class="davens-logo">
                    </span>
                    <span class="davens-header fw-bold" style="line-height:1;">Kitchenette</span>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12 col-md-2 sidebar">

            </div>
            <div class="col-12 col-md-10">
                <div class="m-3 d-flex scrollable-div border-0">
                    <table class="table table-borderless table-sm text-center table-striped">
                        <thead>
                            <tr>
                            <th class="text-muted" scope="col"><b>Order Number</b></th>
                            <th class="text-muted"scope="col"><b>Date Ordered</b></th>
                            <th class="text-muted" scope="col"><b>Subtotal</b></th>
                            <th class="text-muted" scope="col"><b>Payment Status</b></th>
                            <th class="text-muted" scope="col"><b>Order Status</b></th>
                            <th class="text-muted" scope="col"><b>Actions</b></th>
                            </tr>
                        </thead>
                        <tbody id="ordersTable">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Receipt -->
        <div id="receiptSection" style="display: none;" class="receiptOverlay">
            <div class="d-flex justify-content-center">
                <div class="card receipt-card m-5" id="receiptCard">
                    <div class="align-self-center p-3">
                        <div class="overall-header mr-3 mb-2">
                            <span class="davens-receipt-header fw-bold" style="line-height:1; display:block; position:relative;">
                                Daven's
                                <img src="/assets/image/davens_logo.png"
                                    alt="Daven's Logo"
                                    class="davens-receipt-logo">
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
                        <span id="orderNumber" class="details">Order No:</span>
                        <span id="orderDate" class="details">Date | Time</span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3">
                        <p id="recipient" class="details">Customer Name: </p>
                        <p id="contactNumber" class="details">Contact Number: </p>
                        <p id="emailAddress" class="details">Email Address: </p>
                        <p id="deliveryAddress" class="details">Delivery Address: </p>
                    </div>
                    <div class="dashed-line opacity-50" style="margin-top: -5px;"></div>
                    <div class="ms-3 me-3">
                        <p style="font-size: 12px; line-height: .8;"><b>Order Summary</b></p>
                        <div id="itemsContainer"></div>
                    </div>
                    <div class="solid-line opacity-50"></div>
                    <div class="ms-3 me-3 d-flex justify-content-between">
                        <span class="payment">Subtotal: </span><span id="subtotal" class="details"><b></b></span>
                    </div>
                    <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                        <span class="payment">Delivery Fee: </span><span id="deliveryFee" class="details"><b></b></span>
                    </div>
                    <div class="solid-line opacity-50"></div>
                    <div class="ms-3 me-3 d-flex justify-content-between align-items-center">
                        <span style="font-size: 13px;" class="">TOTAL: </span><span id="total" class="details"><b></b></span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3">
                        <span id="paymentMethod" class="details">Payment Method: </span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3 text-center footer-section py-1">
                        <p class="fw-bold mb-2" style="font-size: .7rem;">Thank you for Ordering!</p>
                        <p class="text-muted mb-0" style="font-size: 0.6rem; line-height: 1;">
                            You can screenshot this receipt. Use<br>
                            your Order Number to track your order anytime.
                        </p>
                        <p class="fw-bold mt-3 mb-0" style="font-size: 0.7rem;">Track your order @</p>
                        <p class="mb-0" style="font-size: 0.7rem;">www.davenskitchenette.ph/track</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Set Delivery Fee -->
        <div id="setFeeSection" style="display: none;" class="receiptOverlay">
            <div class="card receipt-card m-5 p-3">
                <div class="">
                    <div class="d-flex justify-content-between card-header">
                        <span><h5 class="mb-3">Set Delivery Fee</h5></span>
                        <span><button id="closeDelivery" class="btn btn-sm btn-warning"><i class="fa-solid fa-x"></i></button></span>
                    </div>
                    <p id="deliveryOrderNumber" class="details mt-2">Order No:</p>
                    <p id="deliveryAddressText" class="details">Delivery Address: </p>

                    <div class="form-group">
                        <label for="deliveryFeeID">Delivery Fee</label>
                        <input type="number" id="deliveryFeeID" name="DeliveryFeeInput" class="form-control rounded-pill" placeholder="Enter amount" step="0.01" min="0">
                        <button id="submitDeliveryFee" class="btn btn-warning border-0 mt-2">
                            <i class="fa-solid fa-paper-plane"></i> Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="my_pos.js"></script>
</body>
</html>