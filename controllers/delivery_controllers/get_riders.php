<?php
session_start();
header('Content-Type: application/json');
require_once '../../database/connect.php'; // must define $conn (mysqli)

try {

    // Query
    $query = "SELECT staffID AS staff_id, staffFullname AS staff_name 
              FROM staff 
              WHERE staffRole = 'delivery rider'
              ORDER BY staffFullname ASC";

    // Prepare statement
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => "Prepare failed: " . $conn->error]);
        exit;
    }

    // Execute
    $stmt->execute();

    // Get result
    $result = $stmt->get_result();
    $riders = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $riders
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
