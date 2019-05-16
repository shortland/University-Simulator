<?php
    header("Access-Control-Allow-Origin: *");

    if ($_GET['method'] == 'get_user') {
        try {
            $trimmed = stripslashes(json_encode(utf8_encode(file_get_contents("users/" . $_GET['email'] . ".json"))));
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
            if (!file_put_contents("users/" . $_GET['email'] . ".json", $jsonData)) {
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

    if ($_GET['method'] == 'restart') {
        try {
            // create the new account data
            file_put_contents("users/" . $_GET['email'] . ".json", json_encode([
                "username" => "",
                "email" => $email,
                "verified" => FALSE, // this should get the value from the previous one...
                "password" => $hashed,
                "year" => "Freshman",
                "idn" => rand(100000000, 999999999),
                "cash" => 100,
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
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }

    