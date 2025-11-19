<?php
session_start();
require_once '../database/connect.php';

header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['order_number']) || !isset($data['delivery_fee'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

$orderNumber = $data['order_number'];
$deliveryFee = floatval($data['delivery_fee']);

if ($deliveryFee < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Delivery fee cannot be negative'
    ]);
    exit;
}

try {
    // Update the delivery fee for the order
    $stmt = $conn->prepare("UPDATE orders SET deliveryFee = ?, orderStatus = 'Reviewed' WHERE orderNo = ?");
    $stmt->bind_param("ds", $deliveryFee, $orderNumber);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Delivery fee updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Order not found or delivery fee unchanged'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update delivery fee'
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>