<?php
require_once '../../database/connect.php';

if (!isset($_GET['token'])) {
    die("Invalid verification link.");
}

$token = $_GET['token'];

// CHECK IF TOKEN EXISTS
$stmt = $conn->prepare("SELECT customerID FROM customer WHERE verificationToken = ? AND isVerified = 0");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    die("Invalid or expired verification link.");
}

$row = $result->fetch_assoc();
$customerID = $row['customerID'];

// MARK AS VERIFIED
$update = $conn->prepare("UPDATE customer SET isVerified = 1, verificationToken = NULL WHERE customerID = ?");
$update->bind_param("i", $customerID);
$update->execute();

echo "
    <div style='font-family:Arial; text-align:center; padding:40px;'>
        <h2 style='color:#04276c;'>Your email has been verified!</h2>
        <p>You may now login to your account.</p>
        <a href='http://localhost:3000/online_ordering_system/sign_in/sign_in.php'
            style='background:#04276c;color:white;padding:10px 25px;text-decoration:none;border-radius:5px;'>
            Go to Login
        </a>
    </div>
";
?>
