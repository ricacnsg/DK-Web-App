<?php
session_start();
require_once '../database/connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getDashboardStats':
        getDashboardStats();
        break;
    case 'getSystemLogs':
        getSystemLogs();
        break;
    case 'getWeeklyData':
        getWeeklyData();
        break;
    case 'getTopItems':
        getTopItems();
        break;
    case 'getRestockItems':  // ADD THIS LINE
        getRestockItems();   // ADD THIS LINE
        break;               // ADD THIS LINE
    case 'getCustomerTypeData':
        getCustomerTypeData();
        break;
    case 'getTopCustomers':
        getTopCustomers();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getDashboardStats() {
    global $conn;
    
    try {
        $period = $_GET['period'] ?? 'today';
        
        // Base condition for valid orders
        $baseCondition = "WHERE o.totalPrice IS NOT NULL AND o.totalPrice > 0";
        
        // Period conditions
        $periodConditions = [
            'today' => "AND DATE(o.createdAT) = CURDATE()",
            'weekly' => "AND YEARWEEK(o.createdAT) = YEARWEEK(CURDATE())",
            'monthly' => "AND YEAR(o.createdAT) = YEAR(CURDATE()) AND MONTH(o.createdAT) = MONTH(CURDATE())"
        ];
        
        $periodCondition = $periodConditions[$period] ?? $periodConditions['today'];
        
        // Get revenue for the selected period
        $revenueQuery = "SELECT COALESCE(SUM(o.totalPrice), 0) as revenue
                        FROM orders o
                        $baseCondition
                        $periodCondition";
        $revenueResult = $conn->query($revenueQuery);
        $currentRevenue = $revenueResult->fetch_assoc()['revenue'];
        
        // Get previous period revenue for comparison
        $prevPeriodConditions = [
            'today' => "AND DATE(o.createdAT) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)",
            'weekly' => "AND YEARWEEK(o.createdAT) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))",
            'monthly' => "AND YEAR(o.createdAT) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
                          AND MONTH(o.createdAT) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))"
        ];
        
        $prevPeriodCondition = $prevPeriodConditions[$period] ?? $prevPeriodConditions['today'];
        
        $prevRevenueQuery = "SELECT COALESCE(SUM(o.totalPrice), 0) as revenue
                            FROM orders o
                            $baseCondition
                            $prevPeriodCondition";
        $prevRevenueResult = $conn->query($prevRevenueQuery);
        $prevRevenue = $prevRevenueResult->fetch_assoc()['revenue'];
        
        // Calculate revenue change percentage
        $revenueChange = 0;
        if ($prevRevenue > 0) {
            $revenueChange = (($currentRevenue - $prevRevenue) / $prevRevenue) * 100;
        } elseif ($currentRevenue > 0) {
            $revenueChange = 100;
        }
        
        // Get order count for the period
        $ordersQuery = "SELECT COUNT(*) as orderCount
                       FROM orders o
                       $baseCondition
                       $periodCondition";
        $ordersResult = $conn->query($ordersQuery);
        $orderCount = $ordersResult->fetch_assoc()['orderCount'];
        
        // Get average order value
        $avgOrderValue = 0;
        if ($orderCount > 0) {
            $avgOrderValue = $currentRevenue / $orderCount;
        }
        
        // Get previous period average for comparison
        $prevOrdersQuery = "SELECT COUNT(*) as orderCount
                           FROM orders o
                           $baseCondition
                           $prevPeriodCondition";
        $prevOrdersResult = $conn->query($prevOrdersQuery);
        $prevOrderCount = $prevOrdersResult->fetch_assoc()['orderCount'];
        
        $prevAvgOrderValue = 0;
        if ($prevOrderCount > 0 && $prevRevenue > 0) {
            $prevAvgOrderValue = $prevRevenue / $prevOrderCount;
        }
        
        // Calculate average order value change
        $avgChange = 0;
        if ($prevAvgOrderValue > 0) {
            $avgChange = (($avgOrderValue - $prevAvgOrderValue) / $prevAvgOrderValue) * 100;
        } elseif ($avgOrderValue > 0) {
            $avgChange = 100;
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'totalRevenue' => floatval($currentRevenue),
                'orderCount' => intval($orderCount),
                'avgOrderValue' => floatval($avgOrderValue),
                'revenueChange' => round($revenueChange, 1),
                'avgChange' => round($avgChange, 1)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Dashboard stats error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getWeeklyData() {
    global $conn;
    
    try {
        // Get last 7 days including today
        $dates = [];
        $revenues = [];
        $orders = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dates[] = date('M d', strtotime($date));
            
            $query = "SELECT 
                        COALESCE(SUM(o.totalPrice), 0) as revenue,
                        COUNT(*) as orderCount
                      FROM orders o
                      WHERE DATE(o.createdAT) = '$date'
                      AND o.totalPrice IS NOT NULL 
                      AND o.totalPrice > 0";
            
            $result = $conn->query($query);
            $row = $result->fetch_assoc();
            
            $revenues[] = floatval($row['revenue']);
            $orders[] = intval($row['orderCount']);
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'dates' => $dates,
                'revenues' => $revenues,
                'orders' => $orders
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Weekly data error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getTopItems() {
    global $conn;
    
    try {
        $period = $_GET['period'] ?? 'today';
        
        $dateCondition = '';
        switch ($period) {
            case 'today':
                $dateCondition = "AND DATE(o.createdAT) = CURDATE()";
                break;
            case 'weekly':
                $dateCondition = "AND YEARWEEK(o.createdAT) = YEARWEEK(CURDATE())";
                break;
            case 'monthly':
                $dateCondition = "AND YEAR(o.createdAT) = YEAR(CURDATE()) AND MONTH(o.createdAT) = MONTH(CURDATE())";
                break;
        }
        
        $query = "SELECT 
                    m.menuItemName as name,
                    COALESCE(SUM(io.quantity), 0) as quantity,
                    COALESCE(SUM(io.quantity * m.menuItemPrice), 0) as revenue
                  FROM itemsordered io
                  JOIN menuitem m ON io.menuItemID = m.menuItemID
                  JOIN orders o ON io.orderNo = o.orderNo
                  WHERE o.totalPrice IS NOT NULL 
                  AND o.totalPrice > 0
                  $dateCondition
                  GROUP BY m.menuItemID, m.menuItemName
                  HAVING quantity > 0
                  ORDER BY quantity DESC
                  LIMIT 5";
        
        $result = $conn->query($query);
        
        $items = [];
        $quantities = [];
        $revenues = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $items[] = $row['name'];
                $quantities[] = intval($row['quantity']);
                $revenues[] = floatval($row['revenue']);
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'items' => $items,
                'quantities' => $quantities,
                'revenues' => $revenues
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Top items error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getSystemLogs() {
    global $conn;
    
    try {
        $query = "SELECT 
                    l.log_id,
                    l.module,
                    l.logaction,
                    l.description,
                    l.created_at,
                    COALESCE(s.staffFullname, 'System') as user_name
                  FROM adminsystemlogs l
                  LEFT JOIN staff s ON l.user_id = s.staffID
                  ORDER BY l.created_at DESC
                  LIMIT 10";
        
        $result = $conn->query($query);
        
        $logs = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $logs[] = [
                    'id' => $row['log_id'],
                    'module' => $row['module'],
                    'action' => $row['logaction'],
                    'description' => $row['description'],
                    'user' => $row['user_name'],
                    'time' => date('M d, Y h:i A', strtotime($row['created_at']))
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $logs
        ]);
        
    } catch (Exception $e) {
        error_log("System logs error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getRestockItems() {
    global $conn;
    
    try {
        $query = "SELECT 
                    i.itemID,
                    i.itemName as item_name,
                    i.quantity as current_quantity,
                    i.reorderLevel as reorder_level,
                    i.unitOfMeasurement as unit,
                    i.itemCategory as category
                  FROM item i
                  WHERE i.quantity <= i.reorderLevel
                  AND i.reorderLevel > 0
                  ORDER BY (i.quantity / i.reorderLevel) ASC, i.itemName ASC
                  LIMIT 10";
        
        $result = $conn->query($query);
        
        $restockItems = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $restockItems[] = [
                    'id' => $row['itemID'],
                    'item_name' => $row['item_name'],
                    'current_quantity' => floatval($row['current_quantity']),
                    'reorder_level' => floatval($row['reorder_level']),
                    'unit' => $row['unit'],
                    'category' => $row['category']
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $restockItems
        ]);
        
    } catch (Exception $e) {
        error_log("Restock items error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getCustomerTypeData() {
    global $conn;
    
    try {
        // Count online customers (orders with customerID)
        $onlineQuery = "SELECT COUNT(DISTINCT o.customerID) as online_count
                       FROM orders o 
                       WHERE o.customerID IS NOT NULL 
                       AND o.totalPrice IS NOT NULL 
                       AND o.totalPrice > 0";
        
        $onlineResult = $conn->query($onlineQuery);
        $onlineCount = $onlineResult->fetch_assoc()['online_count'];
        
        // Count walk-in customers (orders with walkInName)
        $walkInQuery = "SELECT COUNT(DISTINCT o.walkInName) as walkin_count
                       FROM orders o 
                       WHERE o.walkInName IS NOT NULL 
                       AND o.walkInName != ''
                       AND o.totalPrice IS NOT NULL 
                       AND o.totalPrice > 0";
        
        $walkInResult = $conn->query($walkInQuery);
        $walkInCount = $walkInResult->fetch_assoc()['walkin_count'];
        
        echo json_encode([
            'success' => true,
            'data' => [
                'onlineCount' => intval($onlineCount),
                'walkInCount' => intval($walkInCount)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Customer type data error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getTopCustomers() {
    global $conn;
    
    try {
        $query = "SELECT 
                    CASE 
                        WHEN o.customerID IS NOT NULL THEN COALESCE(c.recipientName, 'Online Customer')
                        WHEN o.walkInName IS NOT NULL AND o.walkInName != '' THEN o.walkInName
                        ELSE 'Unknown Customer'
                    END as customer_name,
                    CASE 
                        WHEN o.customerID IS NOT NULL THEN 'Online'
                        ELSE 'Walk-in'
                    END as customer_type,
                    COUNT(o.orderNo) as order_count,
                    COALESCE(SUM(o.totalPrice), 0) as total_spent
                  FROM orders o
                  LEFT JOIN customer c ON o.customerID = c.customerID
                  WHERE o.totalPrice IS NOT NULL 
                  AND o.totalPrice > 0
                  GROUP BY customer_name, customer_type
                  HAVING total_spent > 0
                  ORDER BY total_spent DESC
                  LIMIT 5";
        
        $result = $conn->query($query);
        
        $topCustomers = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $topCustomers[] = [
                    'customer_name' => $row['customer_name'],
                    'customer_type' => $row['customer_type'],
                    'order_count' => intval($row['order_count']),
                    'total_spent' => floatval($row['total_spent'])
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $topCustomers
        ]);
        
    } catch (Exception $e) {
        error_log("Top customers error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

$conn->close();
?>

