<?php
session_start();
require_once '../database/connect.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %H:%i %p') AS date_ordered,
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
                        DISTINCT CONCAT(m.menuItemName, ' x', io.quantity) 
                        ORDER BY io.itemOrderID 
                        SEPARATOR ', '
                    ), 
                    'No items'
                ) AS items_ordered
            FROM orders o
            LEFT JOIN customer c ON o.orderNo = c.orderNo
            LEFT JOIN location l ON o.orderNo = l.orderNo
            LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
            LEFT JOIN menuitems m ON io.menuItemId = m.menuItemID
            WHERE o.orderStatus IN ('Verified', 'Accepted', 'Reviewed', 'Canceled')
            GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     o.paymentmethod, c.recipientName, c.email, c.phoneNumber
            ORDER BY o.createdAT DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    echo json_encode($orders);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>