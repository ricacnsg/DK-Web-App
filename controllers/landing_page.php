<?php
// REMOVED session_start() - No session required for public landing page!
require_once '../database/connect.php';

// DEBUG: Log the request
error_log("Landing Page API Called: " . date('Y-m-d H:i:s'));
error_log("Action: " . ($_GET['action'] ?? 'none'));
error_log("Full URL: " . $_SERVER['REQUEST_URI']);

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
    case 'getTestimonials': 
        getTestimonials();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
}

function getMenuItems() {
    global $conn;
    
    $category = $_GET['category'] ?? '';
    
    try {
        if ($category && $category !== 'all') {
            $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage FROM menuitem WHERE menuItemCategory = ? ORDER BY menuItemName");
            $stmt->bind_param("s", $category);
        } else {
            $stmt = $conn->prepare("SELECT menuItemID, menuItemName, menuItemDescription, menuItemPrice, menuItemCategory, menuItemImage FROM menuitem ORDER BY menuItemName");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $menuItems = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['menuItemImage'])) {
                $imageData = base64_encode($row['menuItemImage']);
                $row['menuItemImage'] = 'data:image/jpeg;base64,' . $imageData;
            } else {
                // Return null instead of hardcoded path
                $row['menuItemImage'] = null;
            }
            
            $menuItems[] = [
                'id' => $row['menuItemID'],
                'name' => $row['menuItemName'],
                'desc' => $row['menuItemDescription'] ?? '',
                'price' => floatval($row['menuItemPrice']),
                'category' => $row['menuItemCategory'],
                'image' => $row['menuItemImage']
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $menuItems]);
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Error in getMenuItems: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getTestimonials() {
    global $conn;
    
    try {
        // Use LEFT JOIN instead of INNER JOIN to show feedback even if customer is missing
        $query = "SELECT f.feedbackID, f.customerID, f.input, f.createdAT, f.updatedAt,
                         COALESCE(c.username, 'Anonymous') as username, 
                         COALESCE(c.recipientName, 'Guest User') as recipientName
                  FROM feedback f
                  LEFT JOIN customer c ON f.customerID = c.customerID
                  WHERE f.input IS NOT NULL AND TRIM(f.input) != ''
                  ORDER BY f.createdAT DESC
                  LIMIT 10";
        
        error_log("Executing testimonials query: " . $query);
        
        $result = $conn->query($query);
        
        if (!$result) {
            error_log("Query failed: " . $conn->error);
            echo json_encode(['success' => false, 'message' => 'Database query failed: ' . $conn->error]);
            return;
        }
        
        error_log("Number of testimonials found: " . $result->num_rows);
        
        $testimonials = [];
        while ($row = $result->fetch_assoc()) {
            $displayName = !empty($row['recipientName']) ? $row['recipientName'] : $row['username'];
            
            $testimonials[] = [
                'id' => $row['feedbackID'],
                'customerID' => $row['customerID'],
                'username' => $row['username'],
                'name' => $displayName,
                'feedback' => $row['input'],
                'date' => date('M d, Y', strtotime($row['createdAT'])),
                'isUpdated' => !empty($row['updatedAt']) && $row['updatedAt'] !== '0000-00-00 00:00:00',
                'updatedDate' => $row['updatedAt'] ? date('M d, Y', strtotime($row['updatedAt'])) : null
            ];
        }
        
        error_log("Testimonials to return: " . json_encode($testimonials));
        
        echo json_encode(['success' => true, 'data' => $testimonials, 'count' => count($testimonials)]);
        
    } catch (Exception $e) {
        error_log("Error in getTestimonials: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

$conn->close();
?>