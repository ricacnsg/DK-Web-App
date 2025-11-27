<?php
session_start();
header('Access-Control-Allow-Origin: *'); // palitan pag ilalagay na sa production ang '*'
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../database/connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}
$input = json_decode(file_get_contents('php://input'), true);
$username = isset($input["staff_username"]) ? trim(strip_tags($input["staff_username"])) : '';
$password = isset($input["staff_password"]) ? $input["staff_password"] : '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$stmt = $conn->prepare("SELECT staffID, staffUsername, staffPassword, staffRole FROM staff WHERE staffUsername = ? LIMIT 1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error (prepare failed)']);
    exit;
}

$stmt->bind_param('s', $username);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error (execute failed)']);
    $stmt->close();
    exit;
}

$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if ($user && password_verify($password, $user['staffPassword'])) {
    session_regenerate_id(true);

    $_SESSION['staff_id'] = (int)$user['staffID'];
    $_SESSION['staff_role'] = $user['staffRole'];
    $_SESSION['staff_username'] = $user['staffUsername'];

    echo json_encode([
        'success' => true,
        'role' => $user['staffRole'],
        'message' => 'Login successful'
    ]);
    exit;
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    exit;
}

$conn->close();
?>