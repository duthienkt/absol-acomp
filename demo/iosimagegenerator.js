var assetInfor = {
    "images": [
        {
            "filename": "Icon-App-20x20@2x.png",
            "idiom": "iphone",
            "scale": "2x",
            "size": "20x20"
        },
        {
            "filename": "Icon-App-20x20@3x.png",
            "idiom": "iphone",
            "scale": "3x",
            "size": "20x20"
        },
        {
            "filename": "Icon-App-29x29@1x.png",
            "idiom": "iphone",
            "scale": "1x",
            "size": "29x29"
        },
        {
            "filename": "Icon-App-29x29@2x.png",
            "idiom": "iphone",
            "scale": "2x",
            "size": "29x29"
        },
        {
            "filename": "Icon-App-29x29@3x.png",
            "idiom": "iphone",
            "scale": "3x",
            "size": "29x29"
        },
        {
            "filename": "Icon-App-40x40@2x.png",
            "idiom": "iphone",
            "scale": "2x",
            "size": "40x40"
        },
        {
            "filename": "Icon-App-40x40@3x.png",
            "idiom": "iphone",
            "scale": "3x",
            "size": "40x40"
        },
        {
            "filename": "Icon-App-60x60@2x.png",
            "idiom": "iphone",
            "scale": "2x",
            "size": "60x60"
        },
        {
            "filename": "Icon-App-60x60@3x.png",
            "idiom": "iphone",
            "scale": "3x",
            "size": "60x60"
        },
        {
            "filename": "Icon-App-20x20@1x.png",
            "idiom": "ipad",
            "scale": "1x",
            "size": "20x20"
        },
        {
            "filename": "Icon-App-20x20@2x-1.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "20x20"
        },
        {
            "filename": "Icon-App-29x29@1x-1.png",
            "idiom": "ipad",
            "scale": "1x",
            "size": "29x29"
        },
        {
            "filename": "Icon-App-29x29@2x-1.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "29x29"
        },
        {
            "filename": "Icon-App-40x40@1x.png",
            "idiom": "ipad",
            "scale": "1x",
            "size": "40x40"
        },
        {
            "filename": "Icon-App-40x40@2x-1.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "40x40"
        },
        {
            "filename": "Icon-App-76x76@1x.png",
            "idiom": "ipad",
            "scale": "1x",
            "size": "76x76"
        },
        {
            "filename": "Icon-App-76x76@2x.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "76x76"
        },
        {
            "filename": "Icon-App-83.5x83.5@2x.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "83.5x83.5"
        },
        {
            "filename": "Icon-App-167x167@1x.png",
            "idiom": "ipad",
            "scale": "1x",
            "size": "167x167"
        },
        {
            "filename": "Icon-App-167x167@2x.png",
            "idiom": "ipad",
            "scale": "2x",
            "size": "167x167"
        },
        {
            "filename": "ItuneArtWork-1024x1024.png",
            "idiom": "ios-marketing",
            "scale": "1x",
            "size": "1024x1024"
        },
        {
            "filename": "ItuneArtWork-1024x1024-1.png",
            "idiom": "mac",
            "scale": "2x",
            "size": "512x512"
        },
        {
            "filename": "image.64x64.png",
            "idiom": "mac",
            "scale": "1",
            "size": "64x64"
        },
        {
            "filename": "image.1024x1024.png",
            "idiom": "mac",
            "scale": "1",
            "size": "1024x1024"
        }
    ],
    "info": {
        "author": "xcode",
        "version": 1
    }
};

var image = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
        <style>.cls-1{fill:#00b6f0;}.cls-2{fill:#2e3192;}.cls-3{fill:#ed1c24;} .bg{ fill: white;}</style>
    </defs>
    <title>Logo_keeview_favicon</title>
    <rect class="bg" height="32" width="32" rx="5" ry="5"></rect>
    <path class="cls-1"
          d="M25.16,7.37C10.89,8.07,5.41,13,7,17.57,8.25,21.05,17.2,27.7,29.85,31.18,20.46,26.83,14.3,20.9,14,17.25,14,14.73,16.83,9.71,25.16,7.37Z"/>
    <path class="cls-2"
          d="M2.73,29.05c3.08-9.78,6-16.79-.58-25,4,2.33,8.38,5.54,9.1,8C11.69,13.48,11,17.89,2.73,29.05Z"/>
    <path class="cls-3" d="M8.26,4.06a3.09,3.09,0,1,1,6.18,0,3.09,3.09,0,1,1-6.18,0Z"/>
</svg>`;

function render(o) {
    return absol._(o).addTo(document.body);
}

var originImage = render({
    class: 'transparent',
    style: {
        display: 'inline-block',
    },
    props: {
        innerHTML: image
    }
});

var sync = new Promise(function (resolve) {
    render({
        tag: 'flexiconbutton',
        props: {
            text: 'Download'
        },
        on: {
            click: function () {
                this.remove();
                resolve();
            }
        }
    })
});
var _ = absol._;
var $ = absol.$;
var bg = $('.bg', originImage);

var sync1 =sync;
assetInfor.images.filter(x=>x.size === '83.5x83.5').forEach(imgInfo => {
    var size = imgInfo.size.split('x').map(x => parseFloat(x));
    var scale = parseInt(imgInfo.scale.replace('x', ''), 10);
    var isIcon = imgInfo.filename.startsWith('Icon');
    if (isIcon) {
        bg.attr({
            rx: '5',
            ry: '5'
        })
    }
    else {
        bg.attr({
            rx: '0',
            ry: '0'
        })
    }

    var assetText = originImage.innerHTML;
    console.log(imgInfo.filename, assetText)
    var width = Math.round(size[0] * scale);
    var height = Math.floor(size[1] * scale);
    /***
     * @type {HTMLCanvasElement}
     */
    var canvas = _({
        tag: 'canvas',
        props: {
            width: width,
            height: height
        }
    });

    var ctn = render({
        class: 'transparent',
        child: [
            { child: { text: imgInfo.filename } },
            canvas
        ]
    });

    var img = new Image();
    img.onload = function () {
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, width, height);
        var blob = canvas.toBlob(function (blob) {
            sync1 = sync1.then(function (){
                absol.FileSaver.saveAs(blob, imgInfo.filename);

                return new Promise(function (rs){
                    setTimeout( rs, 500);
                })
            })
        }, 'png')
    }


    img.src = 'data:image/svg+xml;base64,' + absol.base64.base64EncodeUnicode(assetText);


    console.log(size)
});