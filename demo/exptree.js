<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0,minimum-scale=1.0, user-scale=no">

    <title>Tree</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://absol.cf/hightlight/styles/default.css">
    <!-- <link rel="stylesheet" href="https://absol.cf/materialdesignicons/materialdesignicons.min.css"> -->
    <script src="../dist/absol-acomp.js?<?php  echo stat('../dist/absol-acomp.js')['mtime'];?>"></script>

    <script src="https://absol.cf/hightlight/highlight.pack.js"></script>
    <style>
        .dark.bg {
            background-color: rgba(30, 30, 32, 1);
            /* background-color: white; */

        }

        .bg {
            padding-top: 20px;
            padding-bottom: 20px;
            border: solid 1px rgb(30, 30, 32);
        }
    </style>
</head>

<body>
<h1>Exp Node</h1>
<div id="exp-node-demo-light" class="bg light" style="font-size: 1rem;"></div>
<div id="exp-node-demo-dark" class="dark bg" style="font-size: 12px;"></div>
<script class="viewable">

    var exampeTreeParam = {
        tag: 'exptree',
        props: {
            level: 0,
            name: 'HTML5',
            desc: 'node_modules/absol',
            extSrc: 'https://absol.cf/exticons/extra/' + 'folder' + '.svg',
            title: 'node_modules/absol/src',
            status: 'open'
        },
        child: [
            {
                tag: 'exptree',
                props: {
                    name: 'Dom.js',
                    // extSrc: 'https://absol.cf/exticons/vivid/' + 'js' + '.svg'
                    icon: {
                        tag: 'img',
                        attr: {
                            src: '//absol.cf/exticons/other/events.svg'
                        }
                    }
                }
            },
            {
                tag: 'exptree',
                props: {
                    name: 'EventEmitter.js',
                    extSrc: 'https://absol.cf/exticons/vivid/' + 'js' + '.svg',
                }
            },
            {
                tag: 'exptree',

                props: {
                    name: 'Color',
                    extSrc: 'https://absol.cf/exticons/extra/' + 'folder' + '.svg',
                    status: 'open'
                },
                child: [{
                    tag: 'exptree',
                    props: {
                        name: 'RGB.js',
                        extSrc: 'https://absol.cf/exticons/vivid/' + 'js' + '.svg',
                        status: 'modified'
                    }
                },
                    {
                        tag: 'exptree',
                        props: {
                            name: 'HSL.js',
                            status: 'removable',
                            icon: 'span.mdi.mdi-function'
                        }
                    }]
            }
        ]

    };
    var x = absol._(exampeTreeParam).addTo(absol.$('#exp-node-demo-light'));
    var y = x.accessByPath(['Dom.js']);
    if (y) y.active = true;
    absol._(exampeTreeParam).addClass('dark').addTo(absol.$('#exp-node-demo-dark'));
    var lastActive = absol.$('expnode.as-active');
    if (lastActive) lastActive.parentElement;
    absol.$('exptree', false, function (expElt) {
        expElt.on('press', function (event) {
            if (lastActive) lastActive.active = false;
            lastActive = this;
            this.active = true;
            absol.require('snackbar').show(this.getPath().join('/'));
        })
            .on('pressremove', function (event) {
                absol.require('snackbar').show("press remove " + this.getPath().join('/'));
            })
        .on('statuschange', function (){
            absol.require('snackbar').show(this.getPath().join('/') +' '+ this.status);
            console.log();
        })
    });

    var group = absol._({
        tag: 'expgroup',
        style: {
            fontSize: '14px'
        },
        child: [
            exampeTreeParam,
            exampeTreeParam,
            exampeTreeParam
        ]
    }).addTo(document.body);


</script>


<script src="https://absol.cf/absol/demo/autohightlighting.js"></script>

</body>

</html>