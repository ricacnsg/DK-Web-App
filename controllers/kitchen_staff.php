<?php
session_start();
require_once '../database/connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getActiveOrders':
        getActiveOrders();
        break;
    case 'updateOrderStatus':
        updateOrderStatus();
        break;
    case 'getOrderStats':
        getOrderStats();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getActiveOrders() {
    global $conn;
    
    try {
        $query = "SELECT 
            o.orderNo,
            o.walkInName,
            o.totalPrice,
            o.orderStatus,
            o.createdAT,
            p.paymentMethod,
            GROUP_CONCAT(CONCAT(io.quantity, 'x ', m.menuItemName) SEPARATOR ', ') as items,
            TIMESTAMPDIFF(MINUTE, o.createdAT, NOW()) as minutes_ago
        FROM orders o
        LEFT JOIN payment p ON o.orderNo = p.orderNo
        LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
        LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
        WHERE o.orderStatus IN ('pending', 'preparing', 'ready')
        GROUP BY o.orderNo
        ORDER BY 
            CASE o.orderStatus 
                WHEN 'pending' THEN 1 
                WHEN 'preparing' THEN 2 
                WHEN 'ready' THEN 3 
            END,
            o.createdAT ASC";
        
        $result = $conn->query($query);
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Determine order type and table number
            $orderType = 'dine in';
            $tableNumber = 'Table 1';
            
            // Check if it's delivery or takeout
            if (strpos(strtolower($row['walkInName']), 'delivery') !== false) {
                $orderType = 'delivery';
                $tableNumber = 'Delivery';
            } elseif (strpos(strtolower($row['walkInName']), 'takeout') !== false) {
                $orderType = 'takeout';
                $tableNumber = 'Takeout';
            } else {
                // For dine-in, extract table number or use default
                preg_match('/Table\s*(\d+)/i', $row['walkInName'], $matches);
                $tableNumber = $matches ? 'Table ' . $matches[1] : 'Table 1';
            }
            
            $orders[] = [
                'id' => $row['orderID'],
                'orderNumber' => '#' . $row['orderID'],
                'table' => $tableNumber,
                'items' => $row['items'] ?? 'No items',
                'minutesAgo' => $row['minutes_ago'] ?? 0,
                'orderType' => $orderType,
                'status' => $row['orderStatus'],
                'totalPrice' => floatval($row['totalPrice']),
                'createdAt' => $row['createdAT']
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $orders]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateOrderStatus() {
    global $conn;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $orderID = $input['orderID'] ?? null;
        $newStatus = $input['status'] ?? '';
        
        if (!$orderID || !$newStatus) {
            echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
            return;
        }
        
        // Validate status
        $validStatuses = ['pending', 'preparing', 'ready', 'completed'];
        if (!in_array($newStatus, $validStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            return;
        }
        
        $stmt = $conn->prepare("UPDATE orders SET orderStatus = ? WHERE orderID = ?");
        $stmt->bind_param("si", $newStatus, $orderID);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getOrderStats() {
    global $conn;
    
    try {
        $query = "SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN orderStatus = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN orderStatus = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
            SUM(CASE WHEN orderStatus = 'ready' THEN 1 ELSE 0 END) as ready_orders
        FROM orders 
        WHERE orderStatus IN ('pending', 'preparing', 'ready')";
        
        $result = $conn->query($query);
        $stats = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true, 
            'data' => [
                'total' => $stats['total_orders'] ?? 0,
                'pending' => $stats['pending_orders'] ?? 0,
                'preparing' => $stats['preparing_orders'] ?? 0,
                'ready' => $stats['ready_orders'] ?? 0
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

$conn->close();
?>