<?php
session_start();
session_regenerate_id(true);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; frame-ancestors 'none';");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Daven's Kitchenette</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="reset_password.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
</head>
<body>
<div class="reset-container">
    <h2>Reset Password</h2>
    <form id="resetForm">
        <?php 
        $token = '';
        if (isset($_GET['token'])) {
            $token = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['token']);
            
            if (!preg_match('/^[a-f0-9]{64}$/i', $token)) {
                echo '<div class="alert alert-danger">Invalid reset link. Please request a new password reset.</div>';
                $token = '';
            }
        } else {
            echo '<div class="alert alert-danger">No reset token provided. Please check your email for the correct link.</div>';
        }
        ?>
        <input type="hidden" id="token" value="<?php echo htmlspecialchars($token, ENT_QUOTES, 'UTF-8'); ?>">
        
        <div class="mb-3">
            <label for="newPassword" class="form-label">
                <i class="fa-solid fa-lock"></i> New Password
            </label>
            <div class="password-wrapper">
                <input type="password" 
                       id="newPassword" 
                       class="form-control" 
                       placeholder="Enter new password" 
                       required 
                       minlength="8"
                       maxlength="72"
                       pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                       title="Password must contain at least one uppercase letter, one lowercase letter, and one number">
                <i class="fa-solid fa-eye password-toggle" id="togglePassword"></i>
            </div>
            <small class="form-text text-muted">
                Password must be at least 8 characters and contain uppercase, lowercase, and numbers.
            </small>
        </div>
        
        <div class="mb-3">
            <label for="confirmPassword" class="form-label">
                <i class="fa-solid fa-lock"></i> Confirm Password
            </label>
            <div class="password-wrapper">
                <input type="password" 
                       id="confirmPassword" 
                       class="form-control" 
                       placeholder="Confirm new password" 
                       required>
                <i class="fa-solid fa-eye password-toggle" id="toggleConfirmPassword"></i>
            </div>
        </div>
        
        <button type="submit" class="btn-reset" <?php echo empty($token) ? 'disabled' : ''; ?>>
            Reset Password
        </button>
    </form>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="reset_password.js"></script>
<script src="toggle_password.js"></script>
</body>
</html>