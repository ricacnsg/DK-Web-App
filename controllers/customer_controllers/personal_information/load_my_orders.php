<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Get customer ID from session
$customerID = $_SESSION['customer_id'] ?? null;
$orderId = $_GET['order_id'] ?? null;

if (!$customerID) {
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    // Prepare SQL with payment table
    $sql = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %h:%i %p') AS date_ordered,
                o.totalPrice AS subtotal,
                o.deliveryFee AS delivery_fee,
                o.orderStatus AS order_status,
                COALESCE(p.paymentMethod, 'Not specified') AS payment_method,
                COALESCE(p.paymentStatus, 'Pending') AS payment_status,
                COALESCE(c.recipientName, 'N/A') AS recipient_name,
                COALESCE(c.email, 'N/A') AS email, 
                COALESCE(c.phoneNumber, 'N/A') AS phone_number,
                COALESCE(
                    CONCAT(l.street, ', ', l.barangay, ', ', l.municipality, 
                        CASE WHEN l.locationRemark IS NOT NULL AND l.locationRemark != '' 
                        THEN CONCAT(' (', l.locationRemark, ')') 
                        ELSE '' END
                    ), 
                    'No address'
                ) AS delivery_address,
                COALESCE(
                    GROUP_CONCAT(
                        CONCAT(m.menuItemName, ' x', io.quantity, ' @', m.menuItemPrice)
                        ORDER BY io.itemsOrderedID 
                        SEPARATOR ', '
                    ),
                    'No items'
                ) AS items_ordered,
                COALESCE(s.staffFullname, 'Unassigned') AS rider_name
            FROM orders o
            INNER JOIN customer c ON o.customerID = c.customerID
            LEFT JOIN location l ON o.orderNo = l.orderNo
            LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
            LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
            LEFT JOIN staff s ON o.riderID = s.staffID
            LEFT JOIN payment p ON o.orderNo = p.orderNo
            WHERE o.customerID = ? AND o.orderType = 'delivery'";

    $params = [$customerID];
    $types = "i";

    if ($orderId) {
        $sql .= " AND o.orderNo = ?";
        $params[] = $orderId;
        $types .= "s";
    }

    $sql .= " GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     p.paymentMethod, p.paymentStatus, c.recipientName, c.email, c.phoneNumber, 
                     l.street, l.barangay, l.municipality, l.locationRemark, s.staffFullname
            ORDER BY o.createdAT DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Failed to prepare statement: " . $conn->error);

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) throw new Exception("Failed to execute statement: " . $stmt->error);

    $result = $stmt->get_result();
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    // Return JSON with debug info
    $response = [
        'debug' => [
            'customer_id' => $customerID,
            'order_count' => count($orders),
            'query' => $sql
        ],
        'orders' => $orders
    ];

    echo json_encode($response);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Error in get_online_order.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>
