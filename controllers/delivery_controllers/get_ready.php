<?php
session_start();
require_once '../../database/connect.php';
header('Content-Type: application/json');

// ============================================
// CHECK IF RIDER IS LOGGED IN
// ============================================
$riderId = $_SESSION['rider_id'] ?? null;

if (!$riderId) {
    echo json_encode(['error' => 'Unauthorized: Rider not logged in']);
    exit;
}


// ============================================
// GET SPECIFIC ORDER IF PROVIDED
// ============================================
$orderId = $_GET['order_id'] ?? null;

try {
    // ============================================
    // BASE QUERY — FILTER USING riderID
    // ============================================
    $sql = "SELECT 
                o.orderNo AS order_number,
                DATE_FORMAT(o.createdAT, '%M %e, %Y | %h:%i %p') AS date_ordered,
                o.totalPrice AS subtotal,
                o.deliveryFee AS delivery_fee, 
                o.orderStatus AS order_status,
                p.paymentMethod AS payment_method,
                p.paymentStatus AS payment_status,
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
            LEFT JOIN payment p ON o.orderNo = p.orderNO 
            WHERE o.orderStatus = 'Assigned' 
            OR o.orderStatus = 'In Transit'
            OR o.orderStatus = 'Completed'
            AND o.riderID = ?";   // << Rider Filter

    // ============================================
    // OPTIONAL: FILTER BY SPECIFIC ORDER
    // ============================================
    if ($orderId) {
        $sql .= " AND o.orderNo = ?";
    }

    $sql .= " GROUP BY o.orderNo, o.createdAT, o.totalPrice, o.deliveryFee, o.orderStatus, 
                     p.paymentMethod, p.paymentStatus, c.recipientName, c.email, c.phoneNumber, 
                     l.street, l.barangay, l.municipality, l.locationRemark
              ORDER BY o.createdAT DESC";

    $stmt = $conn->prepare($sql);

    // ============================================
    // BIND PARAMETERS
    // ============================================
    if ($orderId) {
        $stmt->bind_param("is", $riderId, $orderId); // riderID + orderNo
    } else {
        $stmt->bind_param("i", $riderId); // only riderID
    }

    $stmt->execute();
    $result = $stmt->get_result();

    // ============================================
    // FETCH RESULTS
    // ============================================
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
