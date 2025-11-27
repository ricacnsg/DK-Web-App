<?php
// CRITICAL: No whitespace or output before this line!

// Disable error display (only log errors)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Start session
session_start();

// Include database connection
require_once '../database/connect.php';

// Set JSON headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get action
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route to appropriate function
try {
    switch ($action) {
        case 'getActiveOrders':
            getActiveOrders($conn);
            break;
        case 'updateOrderStatus':
            updateOrderStatus($conn);
            break;
        case 'getOrderStats':
            getOrderStats($conn);
            break;
        default:
            echo json_encode([
                'success' => false, 
                'message' => 'Invalid action: ' . $action
            ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close connection
if (isset($conn)) {
    $conn->close();
}

// ============================================================================
// FUNCTIONS
// ============================================================================

function getActiveOrders($conn) {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'No database connection']);
        return;
    }
    
    $query = "SELECT 
        o.orderNo,
        o.walkInName,
        o.orderType,
        o.totalPrice,
        o.orderStatus,
        o.createdAT,
        GROUP_CONCAT(CONCAT(io.quantity, 'x ', m.menuItemName) SEPARATOR ', ') as items,
        TIMESTAMPDIFF(MINUTE, o.createdAT, NOW()) as minutes_ago
    FROM orders o
    LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
    LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
    WHERE o.orderStatus IN ('Reviewed', 'Preparing', 'Ready')
        AND o.orderNo IS NOT NULL
    GROUP BY o.orderNo, o.walkInName, o.orderType, o.totalPrice, o.orderStatus, o.createdAT
    ORDER BY 
        CASE o.orderStatus 
            WHEN 'Pending' THEN 1 
            WHEN 'Preparing' THEN 2 
            WHEN 'Ready' THEN 3 
        END,
        o.createdAT ASC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        echo json_encode([
            'success' => false, 
            'message' => 'Query error: ' . $conn->error
        ]);
        return;
    }
    
    $orders = array();
    
    while ($row = $result->fetch_assoc()) {
        // Skip orders with null orderNo
        if (empty($row['orderNo'])) {
            continue;
        }
        
        // Use orderType from database directly
        $orderType = strtolower($row['orderType'] ?? 'delivery');
        $tableNumber = 'Delivery'; // Default
        
        // Determine table/display based on order type
        switch($orderType) {
            case 'dine in':
                $tableNumber = 'Table 1'; // You might want to add a tableNumber column for actual table numbers
                break;
            case 'takeout':
                $tableNumber = 'Takeout';
                break;
            case 'delivery':
            default:
                $tableNumber = 'Delivery';
                break;
        }
        
        $orders[] = array(
            'id' => $row['orderNo'],
            'orderNumber' => '#' . $row['orderNo'],
            'table' => $tableNumber,
            'items' => $row['items'] ? $row['items'] : 'No items',
            'minutesAgo' => (int)$row['minutes_ago'],
            'orderType' => $orderType,
            'status' => strtolower($row['orderStatus']),
            'totalPrice' => (float)$row['totalPrice'],
            'createdAt' => $row['createdAT']
        );
    }
    
    echo json_encode([
        'success' => true, 
        'data' => $orders
    ]);
}

function updateOrderStatus($conn) {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'No database connection']);
        return;
    }
    
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        return;
    }
    
    $orderNo = isset($data['orderNo']) ? $data['orderNo'] : ''; // Changed from orderID
    $newStatus = isset($data['status']) ? $data['status'] : '';
    
    if (!$orderNo || !$newStatus) {
        echo json_encode([
            'success' => false, 
            'message' => 'orderNo and status required'
        ]);
        return;
    }
    
    // Convert status to proper case for database
    $statusMap = array(
        'pending' => 'Pending',
        'reviewed' => 'Reviewed',
        'preparing' => 'Preparing',
        'ready' => 'Ready',
        'completed' => 'Completed'
    );
    
    $dbStatus = isset($statusMap[$newStatus]) ? $statusMap[$newStatus] : '';
    
    if (!$dbStatus) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        return;
    }
    
    // Update order - using orderNo instead of orderID
    $stmt = $conn->prepare("UPDATE orders SET orderStatus = ? WHERE orderNo = ?");
    
    if (!$stmt) {
        echo json_encode([
            'success' => false, 
            'message' => 'Prepare failed: ' . $conn->error
        ]);
        return;
    }
    
    $stmt->bind_param("ss", $dbStatus, $orderNo);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Status updated'
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Update failed: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
}

function getOrderStats($conn) {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'No database connection']);
        return;
    }
    
    $query = "SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN orderStatus = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN orderStatus = 'Preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN orderStatus = 'Ready' THEN 1 ELSE 0 END) as ready_orders
    FROM orders 
    WHERE orderStatus IN ('Pending', 'Preparing', 'Ready')";
    
    $result = $conn->query($query);
    
    if (!$result) {
        echo json_encode([
            'success' => false, 
            'message' => 'Query error: ' . $conn->error
        ]);
        return;
    }
    
    $stats = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'data' => array(
            'total' => (int)$stats['total_orders'],
            'pending' => (int)$stats['pending_orders'], // Changed keys to lowercase
            'preparing' => (int)$stats['preparing_orders'],
            'ready' => (int)$stats['ready_orders']
        )
    ]);
}
?>