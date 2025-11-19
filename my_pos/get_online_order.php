<?php
session_start();
require_once '../database/connect.php';
header('Content-Type: application/json');

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
            ) AS items_ordered
            FROM orders o
            INNER JOIN customer c ON o.customerID = c.customerID
            LEFT JOIN location l ON o.orderNo = l.orderNo
            LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
            LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
            WHERE o.orderStatus IN ('Verified', 'Accepted', 'Reviewed', 'Canceled')
            GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     o.paymentMethod, c.recipientName, c.email, c.phoneNumber, 
                     l.street, l.barangay, l.municipality, l.locationRemark
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