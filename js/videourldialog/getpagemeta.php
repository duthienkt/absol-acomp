<?php
    header("Cache-Control: max-age=2592000");
    function endmetapos(& $text, $offset){
        $inString = false;
        $c = $text[$offset];
        while($c != NULL){
            if ($inString){
                if ($c == "\"") $inString = FALSE;
            }
            else {
                if ($c == "\"")
                    $inString = TRUE;
                else if ($c == ">")
                    return $offset;
            }

            $offset = $offset + 1;
            $c = $text[$offset];
        }
        return $offset;
    }

    header("Content-Type: text/plain");
    if (!isset($_GET["url"])){
        echo "INVALID_PARAM";
        exit();

    }
    $url = $_GET["url"];


   $text = file_get_contents($url);
    if ( $text === FALSE) {
        echo "DOWNLOAD_ERROR";
        exit();
    }
    else {
        $result = "";
        $start = 0;
        $start = strpos($text, "<meta");
        while($start !== FALSE){
            $end =   endmetapos($text, $start) +1;
            $result .= substr($text, $start, $end - $start)."\n";
            $start = strpos($text, "<meta", $end);
        }

        echo   $result;

    }

?>