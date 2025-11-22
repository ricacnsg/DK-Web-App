<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // palitan pag ilalagay na sa production ang '*'
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once '../../database/connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $user = $input['username'] ?? '';
    $pass = $input['password'] ?? '';
    $contactno= $input['contactno'] ?? '';
    $createdAt = date("Y-m-d H:i:s");
    //$editedAt = date("Y-m-d H:i:s");

    if (empty($email) || empty($user) || empty($pass) || empty($contactno)) {
      echo json_encode([
          'success' => false, 
          'message' => 'All fields are required.'
      ]);
      exit;
    }

    $errors = [];

  if (strlen($pass) < 8) {
      $errors = "Password must be at least 8 characters.";
  }
  if (!preg_match("/[A-Z]/", $pass)) {
      $errors = "Password must contain at least one uppercase letter.";
  }
  if (!preg_match("/[a-z]/", $pass)) {
      $errors = "Password must contain at least one lowercase letter.";
  }
  if (!preg_match("/[0-9]/", $pass)) {
      $errors = "Password must contain at least one number.";
  }
  if (!preg_match("/[\W]/", $pass)) {
      $errors = "Password must contain at least one special character.";
  }

  if (!empty($errors)) {
      echo json_encode(['success' => false, 'message' => $errors]);
      exit;
  }

  $stmt = $conn->prepare("SELECT customerID FROM customer WHERE username = ?");
  $stmt->bind_param("s", $user);
  $stmt->execute();
  $stmt->store_result();

  if ($stmt->num_rows > 0) {
      echo json_encode(['success' => false, 'message' => 'Username already exists.']);
      $stmt->close();
      $conn->close();
      exit;
  }

  $stmt->close();

    $hash_password = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO customer (email, phoneNumber, password, username, createdAt) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $email, $contactno, $hash_password, $user, $createdAt);

    if ($stmt->execute()) {
      echo json_encode(['success' => true, 'message' => 'Check your email and click the link to verifiy your account.']);
    } 
    else {
      echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
    $stmt->close();

  $conn->close();
?>