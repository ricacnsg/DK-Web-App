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
    case 'getMenuItems':
        getMenuItems();
        break;
    case 'placeOrder':
        placeOrder();
        break;
    case 'getOrderHistory':
        getOrderHistory();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getMenuItems() {
    global $conn;
    
    $category = $_GET['category'] ?? '';
    
    try {
        if ($category) {
            $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage FROM menuitem WHERE menuItemCategory = ? ORDER BY menuItemName");
            $stmt->bind_param("s", $category);
        } else {
            $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage FROM menuitem ORDER BY menuItemName");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $menuItems = [];
        while ($row = $result->fetch_assoc()) {
            // Convert image BLOB to base64
            if (!empty($row['menuItemImage'])) {
                $imageData = base64_encode($row['menuItemImage']);
                $row['menuItemImage'] = 'data:image/jpeg;base64,' . $imageData;
            } else {
                $row['menuItemImage'] = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
            }
            
            $menuItems[] = [
                'id' => $row['menuItemID'],
                'name' => $row['menuItemName'],
                'desc' => $row['menuItemDescription'] ?? '',
                'price' => floatval($row['menuItemPrice']),
                'category' => $row['menuItemCategory'],
                'image' => $row['menuItemImage'],
                'quantity' => 0
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $menuItems]);
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function placeOrder() {
    global $conn;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $customerName = $input['customerName'] ?? 'Walk-in Customer';
        $orderType = $input['orderType'] ?? 'dine-in';
        $tableNumber = $input['tableNumber'] ?? null;
        $paymentMethod = $input['paymentMethod'] ?? 'cash';
        $totalAmount = $input['totalAmount'] ?? 0;
        $items = $input['items'] ?? [];
        
        if (empty($items)) {
            echo json_encode(['success' => false, 'message' => 'No items in order']);
            return;
        }
        
        $now = new DateTime();
        $dateStr = $now->format('Ymd'); // e.g., 20251119
        $randomSuffix = rand(10000, 99999);
        $orderNumber = $dateStr . $randomSuffix;
        // Start transaction
        $conn->begin_transaction();
        
        // Insert into orders table
        $stmt = $conn->prepare("INSERT INTO orders (orderNo, walkInName, totalPrice, paymentStatus, orderStatus, createdAT) VALUES (?, ?, ?, 'Paid', 'Walk In', NOW())");
        $stmt->bind_param("ssd", $orderNumber, $customerName, $totalAmount);
        $stmt->execute();
        $stmt->close();
        
        // Insert items ordered
        $stmt = $conn->prepare("INSERT INTO itemsordered (orderNo, menuItemID, quantity) VALUES (?, ?, ?)");
        foreach ($items as $item) {
            $stmt->bind_param("sii", $orderNumber, $item['id'], $item['quantity']);
            $stmt->execute();
        }
        $stmt->close();
        
        // Insert payment record
        $stmt = $conn->prepare("INSERT INTO payment (orderNo, paymentMethod, amountPAId, changeAmount, paymentDate) VALUES (?, ?, ?, 0, NOW())");
        $stmt->bind_param("ssd", $orderNumber, $paymentMethod, $totalAmount);
        $stmt->execute();
        $stmt->close();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Order placed successfully',
            'orderNo' => $orderNumber
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getOrderHistory() {
    global $conn;
    
    try {
        $query = "SELECT 
            o.orderNo,
            o.walkInName, 
            o.totalPrice,
            o.orderStatus,
            o.createdAT,
            p.paymentMethod,
            GROUP_CONCAT(CONCAT(io.quantity, 'x ', m.menuItemName) SEPARATOR ', ') as items
        FROM orders o
        LEFT JOIN payment p ON o.orderNo = p.orderNo
        LEFT JOIN itemsordered io ON o.orderNo = io.orderNo
        LEFT JOIN menuitem m ON io.menuItemID = m.menuItemID
        GROUP BY o.orderNo
        ORDER BY o.createdAT DESC
        LIMIT 100";
        
        $result = $conn->query($query);
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = [
                'id' => $row['orderNo'],
                'customerName' => $row['walkInName'] ?? 'Walk-in Customer', 
                'items' => $row['items'] ?? 'No items',
                'amount' => '₱' . number_format($row['totalPrice'], 2),
                'method' => ucfirst($row['paymentMethod'] ?? 'Cash'),
                'date' => date('m-d-Y', strtotime($row['createdAT'])),
                'status' => ucfirst($row['orderStatus'])
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $orders]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

$conn->close();
?>