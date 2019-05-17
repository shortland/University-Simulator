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
            file_put_contents("users/" . $_GET['email'] . ".json.tmp", $jsonData);
            rename("users/" . $_GET['email'] . ".json.tmp", "users/" . $_GET['email'] . ".json"); // atomic
            chmod("users/" . $_GET['email'] . ".json", 0777);
            echo json_encode([
                "status" => "ok",
                "message" => "updated user data"
            ]);
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }

    if ($_GET['method'] == 'restart') {
        try {
            // // create the new account data
            // $old_data = file_get_contents("users/" . $_GET['email'] . ".json", TRUE);
            // $old_data["cash"] = 100;
            // $old_data["gpa"] = 4;
            // $old_data["thirst"] = 100;
            // $old_data["sleep"] = 100;
            // $old_data["hunger"] = 100;
            // $old_data["happiness"] = 100;
            // $old_data["health"] = 100;
            // $old_data["credits"] = 0;
            // $old_data["inventory"] = [
            //     "Purple_Brown",
            //     "food-steak",
            //     "food-steak",
            //     "food-water",
            //     "food-water",
            //      "food-pizza-pepperoni",
            //     "food-pizza",
            //     "food-pizza",
            //     "food-pizza"
            // ];
            // $old_data["week"] = 1;
            // $old_data["followers"] = 0;
            // file_put_contents("users/" . $_GET['email'] . ".json.tmp", json_decode($old_data));
            // chmod("users/" . $_GET['email'] . ".json.tmp", 0777);
            // chmod("users/" . $_GET['email'] . ".json", 0777);
            // rename("users/" . $_GET['email'] . ".json.tmp", "users/" . $_GET['email'] . ".json"); // atomic
            // chmod("users/" . $_GET['email'] . ".json", 0777);
            // echo json_encode([
            //     "status" => "ok",
            //     "message" => "reset user data"
            // ]);

            unlink("users/" . $_GET['email'] . ".json");
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }

    