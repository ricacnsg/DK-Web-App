<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');

try {
    // 1. Check login
    if (!isset($_SESSION['customer_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }

    $customer_id = $_SESSION['customer_id'];

    // 2. Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // 3. Validate input
    if (!isset($data['street'], $data['barangay'], $data['municipality'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $street = trim($data['street']);
    $barangay = trim($data['barangay']);
    $municipality = trim($data['municipality']);
    $locationRemark = isset($data['locationRemark']) ? trim($data['locationRemark']) : '';

    if (empty($street) || empty($barangay) || empty($municipality)) {
        echo json_encode(['success' => false, 'message' => 'Street, barangay, and municipality are required']);
        exit;
    }

    // 4. Connect to database
    require_once '../../../database/connect.php';
    if (!isset($conn) || $conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }

    // 5. Check max saved addresses
    $countStmt = $conn->prepare("SELECT COUNT(*) as address_count FROM location WHERE customerID = ? AND locationStatus = 'isSaved'");
    $countStmt->bind_param("i", $customer_id);
    $countStmt->execute();
    $row = $countStmt->get_result()->fetch_assoc();
    $countStmt->close();

    if ($row['address_count'] >= 3) {
        echo json_encode(['success' => false, 'message' => 'You can only save up to 3 addresses. Delete an existing address first.']);
        exit;
    }

    // 6. Begin transaction
    $conn->begin_transaction();

    try {
        // 6a. Insert new address
        $stmt = $conn->prepare("
            INSERT INTO location (customerID, street, barangay, municipality, locationRemark, locationStatus) 
            VALUES (?, ?, ?, ?, ?, 'isSaved')
        ");
        $stmt->bind_param("issss", $customer_id, $street, $barangay, $municipality, $locationRemark);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert address: " . $stmt->error);
        }

        $newLocationID = $conn->insert_id;
        $stmt->close();

        // 6b. Insert log
        $prevStmt = $conn->prepare("
            SELECT locationID, street, barangay, municipality, locationRemark
            FROM location
            WHERE customerID = ? AND locationStatus = 'isSaved'
        ");
        $prevStmt->bind_param("i", $customer_id);
        $prevStmt->execute();
        $prevResult = $prevStmt->get_result();
        $previousAddresses = [];
        while ($rowPrev = $prevResult->fetch_assoc()) {
            $previousAddresses[] = $rowPrev;
        }
        $prevStmt->close();

        $previousData = !empty($previousAddresses) ? json_encode($previousAddresses, JSON_UNESCAPED_UNICODE) : NULL;
        
        $newData = json_encode([
            'locationID' => $newLocationID,
            'street' => $street,
            'barangay' => $barangay,
            'municipality' => $municipality,
            'locationRemark' => $locationRemark
        ], JSON_UNESCAPED_UNICODE);

        $logStmt = $conn->prepare("
            INSERT INTO customerlogs (customerID, action, previousData, newData, timestamp) 
            VALUES (?, 'Add Address', ?, ?, NOW())
        ");
        $logStmt->bind_param("iss", $customer_id, $previousData, $newData);

        if (!$logStmt->execute()) {
            throw new Exception("Failed to log address: " . $logStmt->error);
        }

        $logStmt->close();

        // 6c. Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Address added successfully',
            'locationID' => $newLocationID
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
