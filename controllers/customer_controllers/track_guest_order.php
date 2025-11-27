<?php
// IMPORTANT: No whitespace or output before this line!
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ob_start();

try {
    // Database connection
    require_once '../../database/connect.php'; 

    if (!isset($conn)) {
        throw new Exception("Database connection not established");
    }

    if (!isset($_GET['order_number']) || empty(trim($_GET['order_number']))) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Order number is required'
        ]);
        exit;
    }

    $orderNumber = trim($_GET['order_number']);

    // Query matching your receipt structure
    $query = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %h:%i %p') AS date_ordered,
                o.totalPrice AS subtotal,
                o.deliveryFee AS delivery_fee, 
                o.orderStatus AS order_status,
                o.paymentmethod AS payment_method,
                COALESCE(c.recipientName, 'N/A') AS recipient_name,
                COALESCE(c.email, 'N/A') AS email, 
                COALESCE(c.phoneNumber, 'N/A') AS phone_number,
                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT CONCAT(l.street, ', ', l.barangay, ', ', l.municipality, 
                        CASE WHEN l.locationRemark IS NOT NULL AND l.locationRemark != '' 
                        THEN CONCAT(' (', l.locationRemark, ')') 
                        ELSE '' END
                        ) SEPARATOR '; '
                    ), 
                    'No address provided'
                ) AS delivery_address,
                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT CONCAT(m.menuItemName, ' x', io.quantity, ' @', m.menuItemPrice) 
                        ORDER BY io.itemsOrderedID 
                        SEPARATOR ', '
                    ), 
                    'No items'
                ) AS items_ordered
            FROM orders o
            LEFT JOIN customer c ON o.customerID = c.customerID
            LEFT JOIN location l ON o.orderNo = l.orderNo
            LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
            LEFT JOIN menuitem m ON io.menuItemId = m.menuItemID
            WHERE o.orderNo = ?
            GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     o.paymentmethod, c.recipientName, c.email, c.phoneNumber
            LIMIT 1";

    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $orderNumber);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Order not found. Please check your order number.'
        ]);
        exit;
    }

    $order = $result->fetch_assoc();

    ob_clean();
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    $errorDetails = [
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ];
    
    error_log("Guest tracking error: " . json_encode($errorDetails));
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while retrieving order information.',
        'debug' => $errorDetails 
    ]);
}

ob_end_flush();
?>