<?php
class DeliveryModel {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getRider($staffID) {
        $sql = "SELECT * FROM staff WHERE staffID = ? AND staffRole = 'Rider'";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$staffID]);
        return $stmt->fetch();
    }

    public function markOrderInTransit($orderID) {
        $sql = "UPDATE orders SET status = 'In Transit' WHERE orderNo = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$orderNo]);
    }

    public function markOrderDelivered($orderID) {
        $sql = "UPDATE orders SET status = 'delivered', delivered_by = ? WHERE orderNo = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$orderID]);
    }
}
