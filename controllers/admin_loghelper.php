<?php

function logAction($conn, $user_id, $module, $action, $record_id = null, $description = null, $old_data = null, $new_data = null) {
    global $conn;

    $stmt = $conn->prepare("
        INSERT INTO adminsystemlogs (user_id, module, logaction, record_id, description, old_data, new_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->bind_param("ississs", $user_id, $module, $action, $record_id, $description, $old_data, $new_data);
    return $stmt->execute();
}
?>