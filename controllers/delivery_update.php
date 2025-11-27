<?php
require '../../database/connect.php';
require '../../models/DeliveryModel.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$riderID = $data['rider_id'] ?? null;
$status  = $data['status'] ?? null;

if (!$riderID || !$status) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$deliveryModel = new DeliveryModel($conn);

// update
$success = $deliveryModel->updateRiderStatus($riderID, $status);

echo json_encode(["success" => $success]);
