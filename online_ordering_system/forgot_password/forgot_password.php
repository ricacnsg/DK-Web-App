<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password - Daven's Kitchenette</title>
  <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
  <link rel="stylesheet" href="forgot_password.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <div class="reset-container">
    <h2>Forgot Password</h2>
    <form id="forgotForm">
        <div class="mb-3">
            <label for="email" class="form-label"><i class="fa-solid fa-user"></i> Email</label>
            <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
        </div>
        <button type="submit" class="btn-reset">Send Reset Link</button>
    </form>
</div>
    <script src="forgot_password.js"></script>
</body>
</html>
