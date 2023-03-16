<?php
chdir('..');
$upload_dir =  '/tmp/upload_php';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if ($_POST['action'] == "upload_part") {
    $uploadedFileId = 'fileUpload';
    $name        = $_FILES[$uploadedFileId]['name'];
    $tmp_name    = $_FILES[$uploadedFileId]['tmp_name'];
    move_uploaded_file($tmp_name, "$upload_dir/$name");
    echo "OK";
    exit();
} else if ($_POST['action'] == "join_parts") {
    $parts = explode(";", $_POST["parts"]);
    $realPath = ".." . $_POST["path"];
    $fb = fopen($realPath, 'w');
    foreach ($parts as $part) {
        $content = file_get_contents("$upload_dir/$part");
        unlink("$upload_dir/$part");
        fwrite($fb, $content);
    }
    fclose($fb);
    echo "OK";
    exit();
} else if ($_POST['action'] == "delete_files") {
    $paths = explode(";", $_POST["paths"]);
    foreach ($paths as $path) {
        $realPath = ".." . $path;
        unlink($realPath);
    }
    echo "OK";
    exit();
} else if ($_POST['action'] == "rename") {
    $path = explode("/", $_POST["path"]);
    $realPath = ".." . join("/", $path);
    $path[count($path) - 1] = $_POST["new_name"];
    $realNewPath = ".." . join("/", $path);
    if (file_exists($realNewPath)) {
        echo "File exist!";
        exit();
    }
    $ok =  rename($realPath, $realNewPath);

    if ($ok)
        echo "OK";
    else echo "Can not rename!";
    exit();
} else  if ($_POST['action'] == "move") {
    $realOldPath = ".." . $_POST["old_path"];
    $realNewPath = ".." . $_POST["new_path"];
    if (!file_exists($realOldPath)) {
        echo "Source file exist!";
        exit();
    }
    if (file_exists($realNewPath)) {
        echo "File exist!";
        exit();
    }

    $ok =  rename($realOldPath, $realNewPath);
    if ($ok)
        echo "OK";
    else echo "Can not move!";
    exit();
}

echo "FAIL";
