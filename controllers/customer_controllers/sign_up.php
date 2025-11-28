<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../database/connect.php';

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../phpmailer/src/Exception.php';
require '../../phpmailer/src/PHPMailer.php';
require '../../phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$user = $input['username'] ?? '';
$pass = $input['password'] ?? '';
$contactno = $input['contactno'] ?? '';
$createdAt = date("Y-m-d H:i:s");

if (empty($email) || empty($user) || empty($pass) || empty($contactno)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// PASSWORD VALIDATION - FIXED
$errors = [];
if (strlen($pass) < 8) $errors[] = "Password must be at least 8 characters.";
if (!preg_match("/[A-Z]/", $pass)) $errors[] = "Password must contain at least one uppercase letter.";
if (!preg_match("/[a-z]/", $pass)) $errors[] = "Password must contain at least one lowercase letter.";
if (!preg_match("/[0-9]/", $pass)) $errors[] = "Password must contain at least one number.";
if (!preg_match("/[\W]/", $pass)) $errors[] = "Password must contain at least one special character.";

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// CHECK EMAIL DUPLICATE (ADDED - Important!)
$stmt = $conn->prepare("SELECT customerID FROM customer WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already exists.']);
    exit;
}
$stmt->close();

// CHECK USERNAME DUPLICATE
$stmt = $conn->prepare("SELECT customerID FROM customer WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already exists.']);
    exit;
}
$stmt->close();

$hashedPassword = password_hash($pass, PASSWORD_DEFAULT);

// GENERATE VERIFICATION TOKEN
$verificationToken = bin2hex(random_bytes(32));

$stmt = $conn->prepare("INSERT INTO customer (email, phoneNumber, password, username, createdAt, verificationToken, isVerified) 
VALUES (?, ?, ?, ?, ?, ?, 0)");
$stmt->bind_param("ssssss", $email, $contactno, $hashedPassword, $user, $createdAt, $verificationToken);

if ($stmt->execute()) {
    
    // Log successful insertion
    error_log("✅ New customer created: $user (Email: $email)");

    // SEND EMAIL VERIFICATION
    $verifyLink = "http://localhost:3000/controllers/customer_controllers/verify_customer.php?token=$verificationToken";

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = ''; // your Gmail
        $mail->Password = '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        $mail->setFrom('', 'Davens Kitchenette');
        $mail->addAddress($email, $user);

        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Davens Kitchenette Account';
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #04276c;'>Welcome to Davens Kitchenette!</h2>
                <p>Hi <strong>$user</strong>,</p>
                <p>Thank you for signing up! Please verify your email to activate your account.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='$verifyLink'
                        style='display: inline-block; background:#04276c; color:#fff; padding:15px 30px; text-decoration:none; border-radius:5px; font-weight: bold;'>
                        VERIFY ACCOUNT
                    </a>
                </div>
                <p style='color: #666; font-size: 12px;'>If you didn't create this account, please ignore this email.</p>
            </div>
        ";

        $mail->send();
        error_log("✅ Verification email sent to: $email");
    } catch (Exception $e) {
        error_log("❌ Email send failed: " . $mail->ErrorInfo);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Account created! Please check your email to verify your account.'
    ]);

} else {
    error_log("❌ Database insert failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>