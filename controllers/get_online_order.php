<?php
session_start();
require_once '../database/connect.php';
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);

$orderId = $_GET['order_id'] ?? null;

try {
    
    $sql = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %h:%i %p') AS date_ordered,
                o.totalPrice AS subtotal,
                COALESCE(o.deliveryFee, 0) AS delivery_fee, 
                O.orderStatus AS order_status,
                COALESCE(p.paymentMethod, 'Not specified') AS payment_method,
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
            WHERE o.orderType = 'delivery'";
    
    if ($orderId) {
        $sql .= " AND o.orderNo = ?";
    }
    
    $sql .= " GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, O.orderStatus, 
                     p.paymentMethod, c.recipientName, c.email, c.phoneNumber, 
                     l.street, l.barangay, l.municipality, l.locationRemark, s.staffFullname
            ORDER BY o.createdAT DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    
    if ($orderId) {
        $stmt->bind_param("s", $orderId);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    echo json_encode($orders);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error in get_online_order.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>