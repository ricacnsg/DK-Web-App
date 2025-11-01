<?php
session_start();
require_once '../database/connect.php';

error_log("Session customer_id: " . (isset($_SESSION['customer_id']) ? $_SESSION['customer_id'] : 'NOT SET'));
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

if ($filter === 'my' && isset($_SESSION['customer_id'])) {
    // Show only the logged-in user's feedbacks
    $sql = "SELECT f.feedbackID, f.customerID, c.username, f.input, f.createdAT, f.updatedAt
            FROM feedback f
            INNER JOIN customer c ON f.customerID = c.customerID
            WHERE f.customerID = ?
            ORDER BY f.createdAT DESC";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("Error preparing statement: " . $conn->error);
    }

    $stmt->bind_param("i", $_SESSION['customer_id']);
} else {
    // Show all feedbacks
    $sql = "SELECT f.feedbackID, f.customerID, c.username, f.input, f.createdAT, f.updatedAt
            FROM feedback f
            INNER JOIN customer c ON f.customerID = c.customerID
            ORDER BY f.createdAT DESC";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("Error preparing statement: " . $conn->error);
    }
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $username = htmlspecialchars($row['username']);
        $feedback = htmlspecialchars($row['input']);
        $date = date('M d, Y', strtotime($row['createdAT']));
        $feedbackID = $row['feedbackID'];
        $customerID = $row['customerID'];
        $updateDate = $row['updatedAt'];
        error_log("Feedback customerID: $customerID, Session ID: " . (isset($_SESSION['customer_id']) ? $_SESSION['customer_id'] : 'NONE'));

        $isOwner = isset($_SESSION['customer_id']) && $_SESSION['customer_id'] == $customerID;
        error_log("Is Owner: " . ($isOwner ? 'YES' : 'NO'));

        $isUpdated = !empty($updateDate) && $updateDate !== '0000-00-00 00:00:00';
        error_log("Is Updated: " . ($isUpdated ? 'YES' : 'NO'));
        
        echo '
        <div class="col-12 col-md-4 col-lg-3 mb-3">
            <div class="card testimonial-card h-100">
                <div class="card-body">
                    <div>
                        <img src="/assets/image/davens_logo.png"
                        alt="Davens Logo"
                        class="davens-logo">
                    </div>
                    <p class="card-text feedback-text" data-id="' . $feedbackID . '">' . $feedback . '</p>
                    <hr class="hr-design">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <p class="username mb-0">' . $username . '</p>
                        <small class="text-muted card-date">' . $date . '</small>
                    </div>';


        if ($isUpdated) {
            echo '
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <p class="update-date text-muted mb-0"> Updated on:  </p>
                        <p class=" text-muted update-date mb-0">' . date('M d, Y', strtotime($updateDate)) . '</p>
                    </div>';
        }
        
        //mag-appear ang edit at delete buttons if ang cards ay authored by the one who is logged in
        if ($isOwner) {
            echo '
                <div class="mt-2">
                    <button class="btn btn-warning btn-sm edit-feedback" 
                        data-id="' . $feedbackID . '" 
                        data-text="' . htmlspecialchars($feedback) . '">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-feedback" 
                        data-id="' . $feedbackID . '">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            ';
        }
        
        echo '
                </div>
            </div>
        ';

        if ($isOwner) {
            echo '
                <div>
                    <button class="overlay-filter-button rounded-pill" id="myFeedbackFilter">
                        <b>My <br> feedbacks</b>
                    </button>
                </div>
                <div>
                    <button class="overlay-filter-all-button rounded-pill" id="allFeedbackFilter">
                        <b>All <br> feedbacks</b>
                    </button>
                </div>';
        }

        echo'
            </div>';
        }
} else {
    echo '<div class="col-12 text-center"><p>No testimonials yet. Be the first to share your experience!</p></div>';
}

$stmt->close();
$conn->close();
?>