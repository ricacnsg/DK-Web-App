<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? '';
$contactno = $input['contactno'] ?? '';
$email = $input['email'] ?? '';

if (empty($name) || empty($contactno) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

try {
    $sql = "UPDATE customer SET recipientName = ?, phoneNumber = ?, email = ? WHERE customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $name, $contactno, $email, $customerID);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
    
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>