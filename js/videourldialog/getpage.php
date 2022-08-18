<?php
    header("Cache-Control: max-age=2592000");
    header("Content-Type: text/plain");
    if (!isset($_GET["url"])){
        echo "INVALID_PARAM";
        exit();

    }
    $url = $_GET["url"];

   ini_set('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.54');
   $text = file_get_contents($url);
    if ( $text === FALSE) {
        echo "DOWNLOAD_ERROR";
        exit();
    }
    else {
       echo $text;

    }

?>