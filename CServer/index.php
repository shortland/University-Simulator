<?php

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
            if (!file_put_contents("users/" . $_GET['username'] . ".json", $_GET['user_data'])) {
                echo json_encode([
                    "error" => true,
                    "message" => "error saving user data"
                ]);
            }
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }