<!DOCTYPE html>
<html>

<head>
    <title>Explore</title>
    <style type="text/css">
        .ae-block {
            box-sizing: border-box;
            height: 3em;
            position: relative;
            padding-left: 3.5em;
            border: 1px solid #ddd;
            margin-bottom: 0.25em;
        }

        .ae-icon {
            position: absolute;
            font-size: inherit;
            left: calc(0.25em - 1px);
            top: calc(0.25em - 1px);
            height: 2.5em;
            width: 2.5em;
        }

        .ae-name {
            font-size: 1em;
        }

        .ae-created,
        .ae-modified {
            font-size: 0.5em;
            color: rgb(70, 70, 72);
        }

        a {
          text-decoration: none ;
        }

    </style>
</head>
<body>
    <script type="text/javascript">
        function defaultImg(elt){
            elt.src = "/exticons/square-o/default.svg";
        }
    </script>
    <?php
        set_error_handler(function() { /* ignore errors */ });
        $temp = scandir(".");
        $l = count($temp);
        for ($i = 0; $i < $l; $i++){
            $name = $temp[$i];
            if ($name == "." || (substr($name, 0, 1) =="." && $name != "..")) continue;
            try{
                $finfo = stat($name);
            }
            catch (Exception $error){
                $finfo = null;
            }

            if ($finfo == null) continue;


            if (is_dir($temp[$i]))
            {
               $iconSrc = "/exticons/square-o/folder.svg";
            }
            else{
                $namep = split("[\.]", strtolower($name));
                $iconSrc = "/exticons/square-o/". $namep[count($namep) - 1].".svg";
            }

    ?>
    <a href="./<?php echo $name; ?>">
        <div class="ae-block">
            <img class="ae-icon" src="<?php echo $iconSrc;?>" onerror="defaultImg(this)"></img>
            <div class="ae-name"><?php echo $name; ?></div>
            <div class="ae-created"><label>Created: </label> <?php echo date('d-m-Y  h:i:sa', $finfo["ctime"]) ?></div>
            <div class="ae-modified"><label>Modified: </label> <?php echo date('d-m-Y  h:i:sa', $finfo["mtime"]) ?></div>
        </div>
    </a>
    <?php
        }
    ?>
</body>

</html>
