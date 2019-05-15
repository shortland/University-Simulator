<?php
  $data = json_decode(file_get_contents('php://input'), true);
  $password = $data["password"];
  $email = strtolower($data["email"]);

  if (!file_exists("users/" . $email . ".json")) {
    echo json_encode([
      "status" => "error",
      "message" => "User doesn't exist"
    ]);
    exit;
  }

  $userData = json_decode(file_get_contents("users/" . $email . ".json"), TRUE);
  if (password_verify($password, $userData["password"])) {
    if ($userData["verified"] == FALSE) {
      echo json_encode([
        "status" => "unverified",
        "message" => "account not verified"
      ]);
    } else {
      //unset($userData["password"]);
      echo json_encode([
        "status" => "ok",
        "message" => "success",
        "data" => $userData
      ]);
    }
  } else {
    echo json_encode([
      "status" => "error",
      "message" => "Incorrect password"
    ]);
  }