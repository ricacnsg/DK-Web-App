<?php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

require_once '../../database/connect.php';

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../phpmailer/src/Exception.php';
require '../../phpmailer/src/PHPMailer.php';
require '../../phpmailer/src/SMTP.php';

// Rate limiting by IP
$userIP = $_SERVER['REMOTE_ADDR'];
$currentHour = date('Y-m-d H');

if (!isset($_SESSION['reset_attempts'])) {
    $_SESSION['reset_attempts'] = [];
}

// Clean old attempts
foreach ($_SESSION['reset_attempts'] as $hour => $count) {
    if ($hour < date('Y-m-d H', strtotime('-1 hour'))) {
        unset($_SESSION['reset_attempts'][$hour]);
    }
}

if (!isset($_SESSION['reset_attempts'][$currentHour])) {
    $_SESSION['reset_attempts'][$currentHour] = 0;
}

// 5 requests per hour per IP
if ($_SESSION['reset_attempts'][$currentHour] >= 5) {
    echo json_encode([
        'success' => false, 
        'message' => 'Too many password reset requests. Please try again in an hour.'
    ]);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);

// Check for valid JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'Invalid request format']);
    exit;
}

$email = $input['email'] ?? '';

// Sanitize email
$email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);

// Validate email
if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Check email length (prevent buffer overflow attacks)
if (strlen($email) > 255) {
    echo json_encode(['success' => false, 'message' => 'Email is too long']);
    exit;
}

// Increment IP rate limit counter
$_SESSION['reset_attempts'][$currentHour]++;

// Use prepared statement to prevent SQL injection
$stmt = $conn->prepare("SELECT customerID, email, verificationToken, reset_attempts, last_reset_attempt FROM customer WHERE email=? LIMIT 1");
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'System error. Please try again later.']);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    // Security: Don't reveal if email exists or not (timing-safe response)
    // Simulate processing time to prevent enumeration attacks
    usleep(rand(100000, 300000)); // 0.1-0.3 seconds
    echo json_encode(['success' => true, 'message' => 'If an account exists with this email, a reset link has been sent.']);
    exit;
}

// Check reset attempts limit (per user)
$currentDate = date('Y-m-d');
$lastAttemptDate = $user['last_reset_attempt'] ? date('Y-m-d', strtotime($user['last_reset_attempt'])) : null;

// Reset counter if it's a new day
if ($lastAttemptDate !== $currentDate) {
    $resetAttempts = 0;
} else {
    $resetAttempts = (int)$user['reset_attempts'];
}

// Check if limit exceeded
if ($resetAttempts >= 3) {
    $nextDay = date('Y-m-d', strtotime('+1 day'));
    $hoursUntilReset = (strtotime($nextDay) - time()) / 3600;
    $hoursUntilReset = ceil($hoursUntilReset);
    
    echo json_encode([
        'success' => false, 
        'message' => "You have exceeded the maximum password reset attempts (3 per day). Please try again in approximately $hoursUntilReset hours."
    ]);
    exit;
}

// Increment attempt counter
$newAttemptCount = $resetAttempts + 1;
$currentDateTime = date('Y-m-d H:i:s');

// Generate cryptographically secure token
$token = bin2hex(random_bytes(32)); // 64 character token
$tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Hash token before storing (extra security layer)
$hashedToken = hash('sha256', $token);

// Update token and attempt counter in DB
$stmt = $conn->prepare("UPDATE customer SET verificationToken=?, token_expiry=?, reset_attempts=?, last_reset_attempt=? WHERE customerID=?");
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'System error. Please try again later.']);
    exit;
}

$stmt->bind_param("ssisi", $hashedToken, $tokenExpiry, $newAttemptCount, $currentDateTime, $user['customerID']);
$stmt->execute();
$stmt->close();

// Prepare reset link (use token before hashing for the URL)
$resetLink = htmlspecialchars("http://localhost:3000/online_ordering_system/reset_password/reset_password.php?token=" . urlencode($token), ENT_QUOTES, 'UTF-8');

// Send email using PHPMailer
$mail = new PHPMailer(true);

try {
    // SMTP settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'tariaobernadette@gmail.com'; // your Gmail
        $mail->Password = 'anvq dzkd xomc yaas';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Additional security
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false
        )
    );

    $mail->setFrom('tariaobernadette@gmail.com', "Daven's Kitchenette");
    $mail->addAddress($user['email']);
    
    // Prevent email injection
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';

    $mail->isHTML(true);
    $mail->Subject = 'Reset Your Password - Daven\'s Kitchenette';
    
    // Sanitize output in email
    $safeEmail = htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8');
    $remainingAttempts = 3 - $newAttemptCount;
    
    $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
        </head>
        <body>
            <p>Hello,</p>
            <p>You requested to reset your password for your account at Daven's Kitchenette.</p>
            <p><a href='$resetLink' style='display:inline-block;padding:10px 20px;background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:5px;'>Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p><small>Remaining password reset attempts today: $remainingAttempts</small></p>
            <hr>
            <p><small>This is an automated message from Daven's Kitchenette. Please do not reply to this email.</small></p>
        </body>
        </html>
    ";
    
    // Plain text alternative
    $mail->AltBody = "Hello,\n\nYou requested to reset your password. Visit this link to reset: $resetLink\n\nThis link expires in 1 hour.\n\nIf you did not request this, ignore this email.\n\nRemaining attempts today: $remainingAttempts";

    $mail->send();

    echo json_encode([
        'success' => true, 
        'message' => 'If an account exists with this email, a reset link has been sent.'
    ]);

} catch (Exception $e) {
    // Log error but don't expose details
    error_log("Mailer Error: {$mail->ErrorInfo}");
    
    // Rollback the attempt counter if email fails
    $stmt = $conn->prepare("UPDATE customer SET reset_attempts=?, last_reset_attempt=? WHERE customerID=?");
    $rollbackAttempts = $resetAttempts;
    $stmt->bind_param("isi", $rollbackAttempts, $currentDateTime, $user['customerID']);
    $stmt->execute();
    $stmt->close();
    
    echo json_encode([
        'success' => false, 
        'message' => 'Unable to send reset email. Please try again later.'
    ]);
}

$conn->close();
?>