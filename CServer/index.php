<?php
    header("Access-Control-Allow-Origin: *");
    if ($_GET['method'] == 'get_user') {
        try {
            $trimmed = stripslashes(json_encode(utf8_encode(file_get_contents("users/" . $_GET['username'] . ".json"))));
            $trimmed = substr($trimmed, 1);
            $trimmed = substr($trimmed, 0, -1);
            echo $trimmed;
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to get user data"
            ]);
        }
    }

    if ($_GET['method'] == 'save_user') {
        try {
            $jsonData = file_get_contents('php://input');
            if (!file_put_contents("users/" . $_GET['username'] . ".json", $jsonData)) {
                echo json_encode([
                    "error" => true,
                    "message" => "error saving user data"
                ]);
            } else {
                echo json_encode([
                    "status" => "ok",
                    "message" => "save success"
                ]);
            }
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }