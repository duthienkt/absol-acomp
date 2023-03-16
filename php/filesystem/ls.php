<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');
$data = json_decode(file_get_contents('php://input'), true);
chdir('..');
if (isset($data["path"])) {
    $path = $data["path"];
    $realPath = ".." . $path;

    $filesList = scandir($realPath);
    $fileInfoList = array();
    foreach ($filesList as $file) {
        if ($file[0] == '.') continue;
        $fileRealPath = $realPath . '/' . $file;
        $fileViewPath =  $path. '/' . $file;
        $stat = stat($fileRealPath);
        $info = array();
        $info["path"] = $fileViewPath;
        $mode = $stat["mode"];
        $info["isDirectory"] = (($mode >> 12) & 0b111) == 4;
        $info["mtime"] = $stat["mtime"];
        $info["size"] = $stat["size"];
        $info["readable"] = is_readable($fileRealPath);
        $info["writable"] = is_writable($fileRealPath);

        array_push($fileInfoList, $info);
    }
    echo json_encode($fileInfoList);
}
