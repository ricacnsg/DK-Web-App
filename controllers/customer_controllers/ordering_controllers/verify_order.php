<?php
require_once '../../../database/connect.php';

if (!isset($_GET['token'])) {
    echo "Invalid verification link.";
    exit;
}

$token = $_GET['token'];

// Find order using token (no orderID)
$stmt = $conn->prepare("SELECT orderNo FROM orders WHERE verificationToken = ? AND isVerified = 0");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Invalid or expired verification link.";
    exit;
}

$order = $result->fetch_assoc();
$orderNo = $order['orderNo'];

// Mark order as verified
$update = $conn->prepare("UPDATE orders SET isVerified = 1, orderStatus = 'Verified', verificationToken = NULL WHERE orderNo = ?");
$update->bind_param("s", $orderNo);
$update->execute();

if ($update->affected_rows > 0) {
    echo "
    <div style='text-align:center; font-family:Arial; margin-top:50px;'>
        <h1>✅ Order Verified Successfully!</h1>
        <p>Thank you! Your order <strong>$orderNo</strong> has been verified and is now being processed.</p>
        <a href='http://localhost:3000/landing_page/landing.php' style='color:white; background-color:#04276c; padding:10px 20px; text-decoration:none; border-radius:5px;'>Return to Homepage</a>
    </div>";

    // 1. Get all menuItemID for the given order number
    $stmt1 = $conn->prepare("SELECT menuItemID, quantity FROM itemsordered WHERE orderNo = ?");
    $stmt1->bind_param("s", $orderNo);
    $stmt1->execute();
    $menuItemsResult = $stmt1->get_result();

    while ($menuRow = $menuItemsResult->fetch_assoc()) {

        $menuItemID = $menuRow['menuItemID'];
        $menuItemQty = $menuRow['quantity'];

        // 2. Get all ingredients for this menu item
        $stmt2 = $conn->prepare("SELECT itemID, quantity FROM menuitemingredients WHERE menuItemID = ?");
        $stmt2->bind_param("i", $menuItemID);
        $stmt2->execute();
        $ingredientsResult = $stmt2->get_result();

        while ($ingredientRow = $ingredientsResult->fetch_assoc()) {

            $itemID = $ingredientRow['itemID'];
            $deductQty = $ingredientRow['quantity'] * $menuItemQty;

            // 3. Deduct quantity from the item table
            $stmt3 = $conn->prepare("UPDATE item SET quantity = quantity - ? WHERE itemID = ?");
            $stmt3->bind_param("di", $deductQty, $itemID);
            $stmt3->execute();
            $stmt3->close();
        }

        $stmt2->close();
    }

    $stmt1->close();
} else {
    echo "Verification failed. Please try again later.";
}

$stmt->close();
$update->close();
$conn->close();
?>
