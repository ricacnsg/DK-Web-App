<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

// Get customer ID from session
$customerID = $_SESSION['customer_id'] ?? null;
$orderId = $_GET['order_id'] ?? null;

if (!$customerID) {
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

try {
    $sql = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %h:%i %p') AS date_ordered,
                o.totalPrice AS subtotal,
                o.deliveryFee AS delivery_fee, 
                o.orderStatus AS order_status,
                o.paymentMethod AS payment_method,
                o.paymentStatus AS payment_status,
                c.recipientName AS recipient_name,
                c.email AS email, 
                c.phoneNumber AS phone_number,
                CONCAT(l.street, ', ', l.barangay, ', ', l.municipality, 
                    CASE WHEN l.locationRemark IS NOT NULL AND l.locationRemark != '' 
                    THEN CONCAT(' (', l.locationRemark, ')') 
                    ELSE '' END
                ) AS delivery_address,
                GROUP_CONCAT(
                    CONCAT(m.menuItemName, ' x', io.quantity, ' @', m.menuItemPrice)
                    ORDER BY io.itemsOrderedID 
                    SEPARATOR ', '
                ) AS items_ordered, 
                s.staffFullname AS rider_name
            FROM orders o
            INNER JOIN customer c ON o.customerID = c.customerID
            LEFT JOIN location l ON o.orderNo = l.orderNo
            LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
            LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
            LEFT JOIN staff s ON o.riderID = s.staffID
            WHERE o.customerID = ?";
    
    $params = [$customerID];
    $types = "i";
    
    if ($orderId) {
        $sql .= " AND o.orderNo = ?";
        $params[] = $orderId;
        $types .= "s";
    }
    
    $sql .= " GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     o.paymentMethod, o.paymentStatus, c.recipientName, c.email, c.phoneNumber, 
                     l.street, l.barangay, l.municipality, l.locationRemark, s.staffFullname
            ORDER BY o.createdAT DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    // Add debug info to the response
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
    echo json_encode(['error' => $e->getMessage()]);
}
?>