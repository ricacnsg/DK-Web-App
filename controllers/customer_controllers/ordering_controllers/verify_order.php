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
$update = $conn->prepare("UPDATE orders SET isVerified = 1, orderStatus = 'Verified' WHERE orderNo = ?");
$update->bind_param("s", $orderNo);
$update->execute();

if ($update->affected_rows > 0) {
    echo "
    <div style='text-align:center; font-family:Arial; margin-top:50px;'>
        <h1>✅ Order Verified Successfully!</h1>
        <p>Thank you! Your order <strong>$orderNo</strong> has been verified and is now being processed.</p>
        <a href='http://localhost:3000/landing_page/landing.html' style='color:white; background-color:#04276c; padding:10px 20px; text-decoration:none; border-radius:5px;'>Return to Homepage</a>
    </div>";
} else {
    echo "Verification failed. Please try again later.";
}

$stmt->close();
$update->close();
$conn->close();
?>
