<?php
session_start();
header('Content-Type: application/json');

// Allowed role
if (!isset($_SESSION['staff_username']) || $_SESSION['staff_role'] !== 'cashier') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

require_once '../../database/connect.php';

try {

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['order_number']) || !isset($input['rider_id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
        exit;
    }

    $orderNumber = $input['order_number'];
    $riderId = $input['rider_id'];

    // Verify rider exists
    $verifyQuery = "SELECT staffID FROM staff WHERE staffRole = 'delivery rider' AND staffID = ?";
    $verifyStmt = $conn->prepare($verifyQuery);
    if (!$verifyStmt) throw new Exception($conn->error);
    $verifyStmt->bind_param("i", $riderId);
    $verifyStmt->execute();
    $verifyResult = $verifyStmt->get_result();

    if ($verifyResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid rider ID']);
        exit;
    }

    // Ensure order exists and is READY
    $orderQuery = "SELECT orderNo, orderStatus FROM orders WHERE orderNo = ? LIMIT 1";
    $orderStmt = $conn->prepare($orderQuery);
    if (!$orderStmt) throw new Exception($conn->error);
    $orderStmt->bind_param("s", $orderNumber);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    $order = $orderResult->fetch_assoc();

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    if (strtolower($order['orderStatus']) !== 'ready') {
        echo json_encode(['success' => false, 'message' => 'Order must be READY before assigning']);
        exit;
    }

    // Assign rider + update status
    $updateStatusQuery = "UPDATE orders SET riderID = ?, orderStatus = 'Assigned' WHERE orderNo = ?";
    $updateStmt = $conn->prepare($updateStatusQuery);
    if (!$updateStmt) throw new Exception($conn->error);
    $updateStmt->bind_param("is", $riderId, $orderNumber);
    $updateStmt->execute();

    // Insert into orderstatuslog
    $staffID = $_SESSION['staff_id'];

    $logQuery = "INSERT INTO updatestatuslogs (orderNo, previousStatus, newStatus, updatedBy, updatedAt) 
                 VALUES (?, ?, ?, ?, NOW())";
    $logStmt = $conn->prepare($logQuery);
    if (!$logStmt) throw new Exception($conn->error);

    $prevStatus = $order['orderStatus']; // 'Ready'
    $newStatus  = 'Assigned';

    $logStmt->bind_param("sssi", $orderNumber, $prevStatus, $newStatus, $staffID);
    $logStmt->execute();

    echo json_encode(['success' => true, 'message' => 'Rider assigned successfully']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
