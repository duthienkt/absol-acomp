var _ = absol._;
var $ = absol.$;

var imagePath = Array(7).fill(0).map((v, i) => {
    return `./kute/frame_${absol.$.zeroPadding(i, 2)}_delay-0.05s.jpg`;
});
var images = imagePath.map(function (path) {
    var img = $(new Image());
    img.src = path;
    img.addTo(document.body);
    img.style.display = 'none';
    return img;
});

_("br").addTo(document.body);


function compareImageData(data1, data2) {
    if (data1.width !== data2.width || data1.height !== data2.height) {
        return false;
    }

    for (let i = 0; i < data1.data.length; i++) {
        // if (i == 0) console.log(data1.data[i] , data2.data[i])
        if (Math.abs(data1.data[i] - data2.data[i]) > 10) {
            return false;
        }
    }

    return true;
}

function iamgeDataToBytes(imageData) {
    var bytes = [];
    for (var i = 0; i < imageData.data.length; i += 4) {
        bytes = bytes.concat(convert24bitTo16BitColor(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
    }

    return bytes;
}

function convert24bitTo16BitColor(r, g, b) {
    var rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);

    // Split the 16-bit color into two bytes
    var byte1 = (rgb565 >> 8) & 0xFF;
    var byte2 = rgb565 & 0xFF;

    return  [ byte2, byte1];
}


function main() {

    /**
     * @type {Canvas}
     */
    var oCanvas = _('canvas').addTo(document.body);
    oCanvas.width = 320;
    oCanvas.height = 240;
    /**
     * @type {CanvasRenderingContext2D}
     */
    var oCtx = oCanvas.getContext('2d');

    var tmpCanvas = _('canvas').addTo(document.body);
    _("br").addTo(document.body);
    tmpCanvas.width = 320;
    tmpCanvas.height = 240;
    var tmpCtx = tmpCanvas.getContext('2d');
    // oCtx.fillStyle = 'black';
    // oCtx.fillRect(0, 0, 320, 240);
    oCtx.drawImage(images[images.length - 1], 0, 0);
    var first = true;

    var i = 0;
    var bytes = [images.length, 0];

    setTimeout(function process() {
        tmpCtx.drawImage(images[i], 0, 0);
        var imageData, prevImageData;
        var count = 0;
        var updateBit = Array(Math.round(32 * 24 / 8)).fill(0);
        var pixels = [];
        //4byte each row
        for (var yk = 0; yk < 24; ++yk) {
            for (var xk = 0; xk < 32; ++xk) {
                imageData = tmpCtx.getImageData(xk * 10, yk * 10, 10, 10);

                if (first) {
                    first = false;
                    console.log(imageData)
                }
                prevImageData = oCtx.getImageData(xk * 10, yk * 10, 10, 10);
                if (compareImageData(imageData, prevImageData)) continue;
                oCtx.putImageData(imageData, xk * 10, yk * 10);
                updateBit[(yk << 2) + (xk >> 3)] |= 1 << (xk & 0x7);
                pixels = pixels.concat(iamgeDataToBytes(imageData));
                count++;
            }
        }
        bytes = bytes.concat(updateBit);
        bytes = bytes.concat(pixels);
        console.log(updateBit.length, pixels.length);
        if (i < images.length - 1) {
            i++;
            setTimeout(process, 50);
        }
        else {
            console.log(bytes.length);
            var uint8Array = new Uint8Array(bytes);
            console.log(bytes);
// Create a Blob from the Uint8Array
            var blob = new Blob([uint8Array], { type: 'application/octet-stream' });
            absol.FileSaver.saveTextAs(blob, 'animation.bgf');
        }
    }, 0);

}

Promise.all(images.map((img) => absol.Dom.waitImageLoaded(img))).then(main);
