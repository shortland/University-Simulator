<?php
  $id = $_GET["i"];
  if ($id == null) {
    echo "Invalid.";
    exit;
  }
  $email = file_get_contents("open_verifications/" . $id);
  if ($email == null || $email == "") {
    echo "<p>Unable to verify account</p>";
    exit;
  }
  $relatedUser = json_decode(file_get_contents("users/" . $email . ".json"), TRUE);
  $relatedUser["verified"] = TRUE;
  file_put_contents("users/" . $email . ".json", json_encode($relatedUser));
  unlink("open_verifications/" . $id);
  echo "<p>Verified account; Please <a href='../Client/'>login.</a></p>";