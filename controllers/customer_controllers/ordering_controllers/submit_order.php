<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../../phpmailer/src/Exception.php';
require '../../../phpmailer/src/PHPMailer.php';
require '../../../phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($dataSavedSuccessfully) {
    unset($_SESSION['visited_get_order']);  
    unset($_SESSION['visited_view_cart']);
    echo json_encode(['success' => true]);
    exit;
}

$orderNumber = $data['orderNumber'] ?? '';
$recipientName = $data['recipientName'] ?? '';
$contactNumber = $data['contactNumber'] ?? '';
$email = $data['email'] ?? '';
$street = $data['street'] ?? '';
$barangay = $data['barangay'] ?? '';
$municipality = $data['municipality'] ?? '';
$remark = $data['remark'] ?? '';
$paymentMethod = $data['paymentMethod'] ?? '';
$items = $data['items'] ?? [];
$subtotal = $data['subtotal'] ?? 0;
$deliveryFee = $data['deliveryFee'] ?? 0;
$total = $data['total'] ?? 0;

if (empty($recipientName) || empty($contactNumber) || empty($email) || empty($items)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$conn->begin_transaction();

try {
    // Check or create customer
    $stmt = $conn->prepare("SELECT customerID FROM customer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $customerID = $row['customerID'];

        $updateStmt = $conn->prepare("UPDATE customer SET recipientName = ?, phoneNumber = ? WHERE customerID = ?");
        $updateStmt->bind_param("ssi", $recipientName, $contactNumber, $customerID);
        $updateStmt->execute();
        $updateStmt->close();
    } else {
        $insertStmt = $conn->prepare("INSERT INTO customer (recipientName, phoneNumber, email) VALUES (?, ?, ?)");
        $insertStmt->bind_param("sss", $recipientName, $contactNumber, $email);
        $insertStmt->execute();
        $customerID = $conn->insert_id;
        $insertStmt->close();
    }
    $stmt->close();

    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));

    // Insert order 
    $stmt = $conn->prepare("INSERT INTO orders (orderNo, customerID, paymentMethod, totalPrice, paymentStatus, orderStatus, isVerified, verificationToken, createdAT) VALUES (?, ?, ?, ?, 'Pending', 'Pending', 0, ?, NOW())");
    $stmt->bind_param("sisss", $orderNumber, $customerID, $paymentMethod, $total, $verificationToken);
    $stmt->execute();
    $stmt->close();

    // Insert order items
    foreach ($items as $item) {
        $menuItemID = $item['id'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        if ($menuItemID && $quantity > 0) {
            $stmt = $conn->prepare("INSERT INTO itemsordered (orderNo, menuItemID, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("sii", $orderNumber, $menuItemID, $quantity);
            $stmt->execute();
            $stmt->close();
        }
    }

    // Insert delivery address
    $stmt = $conn->prepare("INSERT INTO location (orderNo, street, barangay, municipality, locationRemark) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $orderNumber, $street, $barangay, $municipality, $remark);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    // Email verification link
    $verifyLink = "http://localhost:3000/controllers/customer_controllers/ordering_controllers/verify_order.php?token=$verificationToken";

    $mail = new PHPMailer(true);

    try {
        // Email setup
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'ricamaegconsigo@gmail.com'; // your Gmail
        $mail->Password = '';   // your Gmail App password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        $mail->setFrom('ricamaegconsigo@gmail.com', 'Davens Kitchenette');
        $mail->addAddress($email, $recipientName);

        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Order - ' . $orderNumber;

        $itemsList = '';
        foreach ($items as $item) {
            $itemsList .= "{$item['name']} x {$item['quantity']} - ₱" . number_format($item['price'] * $item['quantity'], 2) . "<br>";
        }

        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #04276c;'>🍽️ Please Verify Your Order</h2>
                <p>Hi $recipientName, thank you for ordering from Daven's Kitchenette!</p>
                <div style='background-color: #fff7d5; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                    <p><strong>Order Number:</strong> $orderNumber</p>
                    <h4>Items Ordered:</h4>
                    $itemsList
                    <hr>
                    <p><strong>Total:</strong> ₱" . number_format($total, 2) . "</p>
                    <p><strong>Payment Method:</strong> $paymentMethod</p>
                    <p><strong>Delivery Address:</strong><br>$street, $barangay, $municipality [$remark]</p>
                </div>
                <div style='background-color: #efc858; padding: 20px; text-align: center; border-radius: 10px;'>
                    <h3>⚠️ Verify your order</h3>
                    <a href='$verifyLink' style='display:inline-block; background-color:#04276c; color:white; padding:15px 30px; text-decoration:none; border-radius:5px;'>
                        ✅ VERIFY MY ORDER
                    </a>
                </div>
            </div>
        ";

        $mail->send();
        error_log("✅ Verification email sent to: $email");

    } catch (Exception $e) {
        error_log("❌ Email send failed: " . $mail->ErrorInfo);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Order placed! Please check your email to verify.',
        'orderNumber' => $orderNumber,
        'requiresVerification' => true
    ]);

} catch (Exception $e) {
    $conn->rollback();
    error_log("ERROR: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
