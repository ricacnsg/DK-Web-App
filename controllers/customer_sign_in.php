<?php
session_start();
header('Access-Control-Allow-Origin: *'); // palitan pag ilalagay na sa production ang '*'
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once '../database/connect.php';

// if ($_SERVER["REQUEST_METHOD"] == "POST") {
//   $user = $_POST["customer_username"];
//   $pass = $_POST["customer_password"];

//   $stmt = $conn->prepare("SELECT * FROM customer WHERE username=? AND password=?");
//   $stmt->bind_param("ss", $user, $pass);
//   $stmt->execute();
//   $result = $stmt->get_result();

//   if ($result->num_rows > 0) {
//     $row = $result->fetch_assoc();

//     $_SESSION['customer_id'] = $row['customerID'];
//     $_SESSION['username'] = $row['username'];
//     $_SESSION['recipientName'] = $row['recipientName'] ?? '';
//     $_SESSION['phoneNumber'] = $row['phoneNumber'] ?? '';
//     $_SESSION['email'] = $row['email'] ?? '';
//     $_SESSION['isLoggedIn'] = true;

//     echo "success";
//   } else {
//     echo "Invalid username or password.";
//   }
      
//   $stmt->close();
// }

// $conn->close();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['customer_username'] ?? '';
$password = $input['customer_password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$stmt = $conn->prepare("SELECT customerID, username, password FROM customer WHERE username = ? LIMIT 1");
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

$stmt = $conn->prepare("SELECT customerID, username, password, isVerified, recipientName, phoneNumber, email 
                        FROM customer WHERE username = ? LIMIT 1");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    exit;
}

// Check if the user has verified their email
if ($user['isVerified'] == 0) {
    echo json_encode(['success' => false, 'message' => 'Please verify your email before logging in.']);
    exit;
}

if ($user && password_verify($password, $user['password'])) {
    session_regenerate_id(true);

      $_SESSION['customer_id'] = $user['customerID'];
      $_SESSION['username'] = $user['username'];
      $_SESSION['recipientName'] = $user['recipientName'] ?? '';
      $_SESSION['phoneNumber'] = $user['phoneNumber'] ?? '';
      $_SESSION['email'] = $user['email'] ?? '';
      $_SESSION['isLoggedIn'] = true;

    echo json_encode([
        'success' => true,
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