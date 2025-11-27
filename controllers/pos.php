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
    
    $category = strtolower(trim($_GET['category'] ?? ''));
    $validCategories = ['bento','rice','pulutan','wings','burger','beverages'];
    if ($category && !in_array($category, $validCategories)) {
        echo json_encode(['success'=>false,'message'=>'Invalid category']);
        return;
    }
    
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

        $customerNameRaw  = $input['customerName']  ?? 'Walk-in Customer';
        $orderTypeRaw     = $input['orderType']     ?? 'dine-in';
        $tableNumberRaw   = $input['tableNumber']   ?? null;
        $paymentMethodRaw = $input['paymentMethod'] ?? 'cash';
        $totalAmountRaw   = $input['totalAmount']   ?? 0;
        $itemsRaw         = $input['items']         ?? [];

        // Validation
        $allowedOrderTypes     = ['dine-in', 'take-out', 'takeout'];
        $allowedPaymentMethods = ['cash', 'gcash', 'card'];

        $customerName  = trim($customerNameRaw);
        $paymentMethod = in_array($paymentMethodRaw, $allowedPaymentMethods) ? $paymentMethodRaw : 'cash';
        $tableNumber   = ($tableNumberRaw !== null && is_numeric($tableNumberRaw)) ? intval($tableNumberRaw) : null;
        $totalAmount   = is_numeric($totalAmountRaw) ? floatval($totalAmountRaw) : 0.00;
        $items         = is_array($itemsRaw) ? $itemsRaw : [];

        // Map order type to database enum values
        $orderTypeMap = [
            'dine-in' => 'dine in',
            'take-out' => 'takeout',
            'takeout' => 'takeout'
        ];
        $orderType = isset($orderTypeMap[$orderTypeRaw]) ? $orderTypeMap[$orderTypeRaw] : 'dine in';

        if (empty($items)) {
            echo json_encode(['success' => false, 'message' => 'No items in order']);
            return;
        }

        // Generate order number
        $now = new DateTime();
        $dateStr = $now->format('Ymd');
        $randomSuffix = rand(10000, 99999);
        $orderNumber = $dateStr . $randomSuffix;

        $conn->begin_transaction();

        // 1. Insert order WITHOUT payment info
        $stmt = $conn->prepare("
            INSERT INTO orders (orderNo, walkInName, orderType, totalPrice, orderStatus, createdAT)
            VALUES (?, ?, ?, ?, 'Reviewed', NOW())
        ");
        $stmt->bind_param("sssd", $orderNumber, $customerName, $orderType, $totalAmount);
        $stmt->execute();
        $stmt->close();

        // 2. Insert ordered items
        $stmt = $conn->prepare("
            INSERT INTO itemsordered (orderNo, menuItemID, quantity)
            VALUES (?, ?, ?)
        ");
        foreach ($items as $item) {
            $menuItemID = isset($item['id']) && is_numeric($item['id']) ? intval($item['id']) : 0;
            $quantity   = isset($item['quantity']) && is_numeric($item['quantity']) ? intval($item['quantity']) : 0;

            if ($menuItemID <= 0 || $quantity <= 0) continue;

            $stmt->bind_param("sii", $orderNumber, $menuItemID, $quantity);
            $stmt->execute();
        }
        $stmt->close();

        // 3. Insert payment record separately
        $stmt = $conn->prepare("
            INSERT INTO payment (orderNo, paymentMethod, amountPaid, changeAmount, paymentDate, paymentStatus)
            VALUES (?, ?, ?, 0, NOW(), 'Paid')
        ");
        $stmt->bind_param("ssd", $orderNumber, $paymentMethod, $totalAmount);
        $stmt->execute();
        $stmt->close();

        $conn->commit();

    // 1. Get all menuItemID for the given order number
    $stmt1 = $conn->prepare("SELECT menuItemID, quantity FROM itemsordered WHERE orderNo = ?");
    $stmt1->bind_param("s", $orderNumber);
    $stmt1->execute();
    $menuItemsResult = $stmt1->get_result();

    while ($menuRow = $menuItemsResult->fetch_assoc()) {

        $menuItemID = $menuRow['menuItemID'];
        $menuItemQty = $menuRow['quantity'];

        // 2. Get all ingredients for this menu item
        $stmt2 = $conn->prepare("SELECT itemID, quantity FROM menuitemingredients WHERE menuItemID = ?");
        $stmt2->bind_param("i", $menuItemID);
        $stmt2->execute();
        $ingredientsResult = $stmt2->get_result();

        while ($ingredientRow = $ingredientsResult->fetch_assoc()) {

            $itemID = $ingredientRow['itemID'];
            $deductQty = $ingredientRow['quantity'] * $menuItemQty;

            // 3. Deduct quantity from the item table
            $stmt3 = $conn->prepare("UPDATE item SET quantity = quantity - ? WHERE itemID = ?");
            $stmt3->bind_param("ii", $deductQty, $itemID);
            $stmt3->execute();
            $stmt3->close();
        }

        $stmt2->close();
    }

    $stmt1->close();

        // --- 9. Return success ---
        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully',
            'orderNumber' => $orderNumber
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
        WHERE o.orderStatus != 'Pending'
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