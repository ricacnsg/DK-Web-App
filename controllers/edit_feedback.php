<?php
session_start();
require_once '../database/connect.php';

if (!isset($_SESSION['customer_id'])) {
    echo "Please log in first";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $feedbackID = $_POST['feedbackID'];
    $input = trim($_POST['input']);
    $customerID = $_SESSION['customer_id'];

    if (empty($input)) {
        echo "Feedback cannot be empty";
        exit;
    }

    // Get previous feedback for logging
    $prevStmt = $conn->prepare("SELECT input FROM feedback WHERE feedbackID = ? AND customerID = ?");
    $prevStmt->bind_param("ii", $feedbackID, $customerID);
    $prevStmt->execute();
    $prevStmt->bind_result($previousData);
    $prevStmt->fetch();
    $prevStmt->close();

    // Update feedback
    $sql = "UPDATE feedback SET input = ?, updatedAt = NOW() WHERE feedbackID = ? AND customerID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $input, $feedbackID, $customerID);

    if ($stmt->execute()) {
        echo "success";

        // Insert log with previousData and newData
        $action = "Updated feedback";
        $logStmt = $conn->prepare("INSERT INTO customerlogs (customerID, previousData, newData, action, timestamp) VALUES (?, ?, ?, ?, NOW())");
        $logStmt->bind_param("isss", $customerID, $previousData, $input, $action);
        $logStmt->execute();
        $logStmt->close();

    } else {
        echo "Error updating feedback: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>
