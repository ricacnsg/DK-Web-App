<?php
session_start();
require_once '../../../database/connect.php';

header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

// Validate input
if (!isset($data['order_number'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing order number'
    ]);
    exit;
}

$orderNumber = $data['order_number'];

try {
    // 1. Check if order exists and get current status
    $checkStmt = $conn->prepare("SELECT orderStatus FROM orders WHERE orderNo = ? LIMIT 1");
    $checkStmt->bind_param("s", $orderNumber);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }

    $row = $result->fetch_assoc();
    $previousStatus = $row['orderStatus'];
    $checkStmt->close();

    $currentStatus = strtolower($previousStatus);

    // 2. Prevent cancelling if already finalized
    $finalStatuses = ['completed', 'rejected', 'preparing', 'in transit', 'ready'];
    if (in_array($currentStatus, $finalStatuses)) {
        echo json_encode([
            'success' => false,
            'message' => 'Order already ' . $previousStatus
        ]);
        exit;
    }

    // 3. Begin transaction
    $conn->begin_transaction();

    try {
        // Update order status to Cancelled
        $stmt = $conn->prepare("UPDATE orders SET orderStatus = 'Cancelled' WHERE orderNo = ?");
        $stmt->bind_param("s", $orderNumber);

        if (!$stmt->execute()) {
            throw new Exception("Failed to update order status: " . $stmt->error);
        }

        // Log the change (previous status, new status)
        $logStmt = $conn->prepare("
            INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp)
            VALUES (?, 'Cancel Order', ?, ?, NOW())
        ");

        $newStatus = json_encode(['orderStatus' => 'Cancelled']);
        $prevStatusJson = json_encode(['orderStatus' => $previousStatus]);

        $logStmt->bind_param("iss", $customerID, $prevStatusJson, $newStatus);
        $logStmt->execute();
        $logStmt->close();

        $stmt->close();
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Order cancelled successfully'
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to cancel order: ' . $e->getMessage()
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
