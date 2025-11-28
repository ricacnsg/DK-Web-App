<?php
session_start();
require_once '../../../database/connect.php';
header('Content-Type: application/json');

$customerID = $_SESSION['customer_id'] ?? null;

if (!$customerID) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? '';
$contactno = $input['contactno'] ?? '';

// ✅ FIXED: Removed $email from validation
if (empty($name) || empty($contactno)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

// Validate Philippine phone number
function validatePhilippineNumber($number) {
    // Remove spaces, dashes, parentheses
    $cleaned = preg_replace('/[\s\-\(\)]/', '', $number);
    
    $patterns = [
        '/^09\d{9}$/',              // 09XXXXXXXXX (11 digits)
        '/^\+639\d{9}$/',           // +639XXXXXXXXX
        '/^639\d{9}$/',             // 639XXXXXXXXX
        '/^02\d{7,8}$/',            // 02XXXXXXX or 02XXXXXXXX (Manila landline)
        '/^0\d{2}\d{7}$/',          // 0XXXXXXXXXX (Provincial landline)
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $cleaned)) {
            return true;
        }
    }
    
    return false;
}

if (!validatePhilippineNumber($contactno)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Please enter a valid Philippine phone number (e.g., 09XX-XXX-XXXX or +639XX-XXX-XXXX)'
    ]);
    exit();
}

try {
    // Get current data before update
    $getStmt = $conn->prepare("SELECT recipientName, phoneNumber FROM customer WHERE customerID = ?");
    $getStmt->bind_param("i", $customerID);
    $getStmt->execute();
    $result = $getStmt->get_result();
    $oldData = $result->fetch_assoc();
    $getStmt->close();
    
    if (!$oldData) {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
        exit();
    }
    
    // Prepare previous and new data for logging
    $previousData = json_encode([
        'recipientName' => $oldData['recipientName'],
        'phoneNumber' => $oldData['phoneNumber']
    ]);
    
    $newData = json_encode([
        'recipientName' => $name,
        'phoneNumber' => $contactno
    ]);
    
    // ✅ FIXED: Update only name and phone number (NOT email)
    $sql = "UPDATE customer SET recipientName = ?, phoneNumber = ? WHERE customerID = ?";
    $stmt = $conn->prepare($sql);
    // ✅ FIXED: Correct bind_param - only 3 parameters (ssi = string, string, integer)
    $stmt->bind_param("ssi", $name, $contactno, $customerID);
    
    if ($stmt->execute()) {
        // Log the profile update with previous and new data
        $logStmt = $conn->prepare("INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp) VALUES (?, 'Update Profile', ?, ?, NOW())");
        
        if ($logStmt) {
            $logStmt->bind_param('iss', $customerID, $previousData, $newData);
            $logStmt->execute();
            
            if ($logStmt->error) {
                error_log("Failed to log profile update: " . $logStmt->error);
            }
            
            $logStmt->close();
        } else {
            error_log("Failed to prepare log statement: " . $conn->error);
        }
        
        // Update session variables with new data
        $_SESSION['recipientName'] = $name;
        $_SESSION['phoneNumber'] = $contactno;
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
    
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>