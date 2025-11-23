<?php
// Enable error reporting to see what's wrong
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['customer_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }

    $customer_id = $_SESSION['customer_id'];

    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate input
    if (!isset($data['street']) || !isset($data['barangay']) || !isset($data['municipality'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $street = trim($data['street']);
    $barangay = trim($data['barangay']);
    $municipality = trim($data['municipality']);
    $locationRemark = isset($data['locationRemark']) ? trim($data['locationRemark']) : '';

    // Validate that fields are not empty
    if (empty($street) || empty($barangay) || empty($municipality)) {
        echo json_encode(['success' => false, 'message' => 'Street, barangay, and municipality are required']);
        exit;
    }

    // Database connection
    require_once '../../../database/connect.php';

    // Check if connection exists
    if (!isset($conn)) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection variable ($conn) not found.'
        ]);
        exit;
    }

    // Check connection
    if ($conn->connect_error) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit;
    }

     $countStmt = $conn->prepare("SELECT COUNT(*) as address_count FROM location WHERE customerID = ? AND locationStatus = 'isSaved'");
    $countStmt->bind_param("i", $customer_id);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $row = $countResult->fetch_assoc();
    $addressCount = $row['address_count'];
    $countStmt->close();

    if ($addressCount >= 3) {
        echo json_encode([
            'success' => false,
            'message' => 'You can only save up to 3 addresses. Please delete an existing address first.'
        ]);
        exit;
    }

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO location (customerID, street, barangay, municipality, locationRemark, locationStatus) VALUES (?, ?, ?, ?, ?, 'isSaved')");
    
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Prepare statement failed: ' . $conn->error
        ]);
        exit;
    }

    // Bind parameters (i = integer, s = string)
    $stmt->bind_param("issss", $customer_id, $street, $barangay, $municipality, $locationRemark);
    
    // Execute statement
    if ($stmt->execute()) {
        $newLocationID = $conn->insert_id;
        
        echo json_encode([
            'success' => true, 
            'message' => 'Address added successfully',
            'locationID' => $newLocationID
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to insert address: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>