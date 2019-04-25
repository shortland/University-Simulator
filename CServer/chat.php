<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    header("Access-Control-Allow-Origin: *");

    if ($_GET["method"] == "get_chat") {
        try {
            $data = json_decode(file_get_contents("chatlog.json"), TRUE)["messages"];
            $latest = [];
            foreach (array_keys($data) as $timestamp) {
                if (intval($timestamp) > intval($_GET["epoch"])) {
                    array_push($latest, $data[$timestamp]);
                }
            }
            echo json_encode([
                "messages" => $latest
            ]);
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to get user data"
            ]);
        }
    }

    if ($_GET["method"] == "save_chat") {
        try {
            $oldChat = json_decode(file_get_contents("chatlog.json"));
            $time = $_GET["epoch"];
            $oldChat->messages->$time = $_GET["username"] . ": " .$_GET["message"];

            if (!file_put_contents("chatlog.json", json_encode($oldChat))) {
                echo json_encode([
                    "error" => true,
                    "message" => "error saving user data"
                ]);
            } else {
                echo json_encode([
                    "saved" => $time
                ]);
            }
        } catch(Exception $e) {
            echo json_encode([
                "error" => true,
                "message" => "unable to save user data"
            ]);
        }
    }