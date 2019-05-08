<?php
  $data = json_decode(file_get_contents('php://input'), true);
  $username = $data["username"];
  $password = $data["password"];
  $email = $data["email"];
  $mapped = random_str(20);

  if (file_exists("users/" . $email . ".json")) {
    echo json_encode([
      "status" => "error",
      "message" => "Email already in use."
    ]);
    exit;
  }

  // create the verification request backend
  file_put_contents("open_verifications/" . $mapped, $email);

  // hash the password
  $hashed = password_hash($password, PASSWORD_BCRYPT, ["cost" => 10]);

  // create the new account data
  file_put_contents("users/" . $email . ".json", json_encode([
    "username" => "",
    "email" => $email,
    "verified" => FALSE,
    "password" => $hashed,
    "year" => "Freshman",
    "idn" => rand(100000000, 999999999),
    "cash" => 1000,
    "credits" => 0,
    "sleep" => 100,
    "hunger" => 100,
    "happiness" => 100,
    "thirst" => 100,
    "gpa" => 4.0,
    "classes" => [],
    "inventory" => [
      "Purple_Brown",
      "food-steak",
      "food-steak",
      "food-water",
      "food-water",
      "food-pizza-pepperoni",
      "food-pizza",
      "food-pizza",
      "food-pizza",
    ],
    "week" => 1,
    "followers" => 0
  ]));
  
  // temporary 777
  chmod("users/" . $email . ".json", 0777);

  $subject = 'New account registered';
  $message = "Thanks for creating a new account on University Simulator, and welcome.\n\nPlease verify your email address at: https://UniversitySimulator.com/UniversitySimulator/Server/verify.php?i=" . $mapped;
  $headers = 'From: University Simulator<noreply@universitysimulator.com>' . "\r\n" .
    'Reply-To: ' . $email . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

  mail($email, $subject, $message, $headers);

  echo json_encode([
    "status" => "ok",
    "message" => "Successfully registered $username. Please check your email."
  ]);

  function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    $pieces = [];
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
      $pieces []= $keyspace[random_int(0, $max)];
    }
    return implode('', $pieces);
  }