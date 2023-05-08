import { _ } from "../../ACore";
import { saveTextAs } from "absol/src/Network/FileSaver";

var videoUrlRules = [
    [
        'youtube',
        /^https:\/\/www.youtube.com\//,
        /[^a-zAZ]v=([^&]+)/,
        o => 'https://www.youtube.com/embed/' + o.videoId
    ],
    [
        'youtube',
        /^https:\/\/www.youtube.com\/embed\//,
        /^https:\/\/www.youtube.com\/embed\/([^&\/]+)/,
        o => o.url,
        o => 'https://www.youtube.com/watch?v=' + o.videoId
    ],
    [
        'vimeo',
        /^https:\/\/vimeo.com\//,
        /vimeo.com\/([0-9A-Za-z_]+)/,
        o => 'https://player.vimeo.com/video/' + o.videoId

    ],
    [
        'dailymotion',
        /^https:\/\/www.dailymotion.com\/video\//,
        /dailymotion\.com\/video\/([0-9A-Za-z_]+)/,
        o => 'https://www.dailymotion.com/embed/video/' + o.videoId
    ],
    [
        'facebook',
        /^https:\/\/www.facebook.com\/watch/,
        /[^a-zAZ]v=([^&]+)/,
        o => 'https://www.facebook.com/plugins/video.php?height=315&width=560&show_text=false&t=0&href=' + encodeURIComponent(o.url),
        o => o.embedUrl
    ],
    /* INVAID VIDEO ID   */
    [
        'youtube',
        /^https:\/\/www.youtube.com(\/|$)/,
        'INVALID_URL'
    ],
    [
        'vimeo',
        /^https:\/\/vimeo.com(\/|$)/,
        /vimeo.com\/([0-9A-Za-z_]+)/,
        'INVALID_URL'
    ],
    [
        'dailymotion',
        /^https:\/\/www.dailymotion.com(\/|$)/,
        null
    ],
    [
        'facebook',
        /^https:\/\/www.facebook.com/,
        'INVALID_URL'
    ],
    /********************/
    [
        '*',
        /./,
        /\/([^\/]+)$/,
        o => o.url
    ]
];


export function parseVideoUrl(url) {
    url = (url || "").trim();
    var res = {
        url: url
    };

    videoUrlRules.some((rule) => {
        var matched = url.match(rule[1]);
        if (!matched) return false;
        res.hostType = rule[0];
        if (rule[2] instanceof RegExp) {
            matched = url.match(rule[2]);
            if (!matched) return false;
            res.videoId = matched[1];
        }
        else if (rule[2] === 'INVALID_URL') {
            res.videoId = "INVALID_URL";
        }
        if (res.videoId !== 'INVALID_URL') {
            res.embedUrl = rule[3](res);

        }

        if (typeof rule[4] === "function") {
            res.originalUrl = rule[4](res);
        }
        else {
            res.originalUrl = res.url;
        }

        return true;
    });
    return res;
}


var embedVideoSizeCache = {};


var metaRules = [
    ['width', 'og:video:width', /content\s*=\s*"([0-9]+)/, 'number'],
    ['height', 'og:video:height', /content\s*=\s*"([0-9]+)/, 'number'],
    ['title', 'og:title', /content\s*=\s*"([^"]+)/, s => s.replace(/\s*-\s*Video Dailymotion$/, '')],
    ['image', 'og:image', /content\s*=\s*"([^"]+)/],

    ['width', /^video\s/, /width\s*=\s*"([0-9]+)/, 'number', true],
    ['height', /^video\s/, /height\s*=\s*"([0-9]+)/, 'number', true],
    ['image', /^img/, /src\s*=\s*"([^"]+)/, x => x.replace(/&amp;/g, '&')],
    ['title', "a href=\"https://www.facebook.com/watch", />([^<]+)/],
]

export default function getEmbedVideoInfo(url, fullPage) {
    // fullPage = false;
    var xUrl = fullPage ? 'https://absol.cf/getpage.php?url=' : 'https://absol.cf/getpagemeta.php?url=';
    embedVideoSizeCache[url] = embedVideoSizeCache[url] || fetch(xUrl + encodeURIComponent(url)).then(res => res.text())
        .then(metaText => {
            if (metaText === 'DOWNLOAD_ERROR') return { error: metaText };
            var lines = metaText.replace(/\n|(>\s*<)/g, '__spliter__').split('__spliter__');
            var res = {};
            lines.forEach(line => {
                metaRules.some(rule => {
                    var key = rule[0];
                    if (key in res) return false;
                    var matched;
                    if (rule[1] instanceof RegExp) {
                        matched = line.match(rule[1]);
                        if (!matched) return false;
                    }
                    else if (typeof rule[1] === "string") {
                        if (line.indexOf(rule[1]) < 0) return false;
                    }

                    matched = line.match(rule[2]);
                    if (!matched) return false;
                    var value = matched[1];
                    if (rule[3] === 'number') {
                        value = parseFloat(value);
                        if (isNaN(value)) return false;
                    }
                    else if (typeof rule[3] === "function") {
                        value = rule[3](value);
                    }

                    res[key] = value;
                    if (rule[4]) return false;
                    return true;

                });
            });
            return res;
        });
    return embedVideoSizeCache[url];
}

var videoFileHeaderInfoCache = {};

export function getVideoFileHeader(url) {
    videoFileHeaderInfoCache[url] = videoFileHeaderInfoCache[url]
        || new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var res = {
                            type: xhr.getResponseHeader('Content-Type')
                        };

                        var title;
                        var header = xhr.getAllResponseHeaders();
                        if (header && (header.indexOf('inline') !== -1 || header.indexOf('attachment') !== -1)) {
                            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(header);
                            if (matches != null && matches[1]) {
                                title = matches[1].replace(/['"]/g, '');
                            }
                        }
                        else {
                            title = url.split('/').filter(x => !!x).pop() || '';
                            title = title.split('?').shift();
                            title = decodeURIComponent(title);

                        }
                        if (title) res.title = title;
                        resolve(res);
                    }
                    else {
                        resolve({
                            error: "STATUS_" + this.status
                        })
                    }
                }
            };
            xhr.send();
        });

    return videoFileHeaderInfoCache[url];
}


export function getVideoPreview(url) {
    return new Promise((resolve, reject) => {
        var renderDiv = _({
            style: {
                position: 'fixed',
                left: 0,
                top: 0,
                overflow: 'hidden',
                'z-index': -1000,
                pointerEvents: 'none',
                visibility: 'hidden'
            }
        }).addTo(document.body);
        var videoElt = _({
            tag: 'video',
            attr: {
                crossorigin: "anonymous",
                crossOrigin: "anonymous",
                preload: 'metadata',
                src: url
            },
            on: {
                loadeddata: function () {
                    clearTimeout(timeout);
                    var scale = Math.min(200, videoElt.videoWidth, videoElt.videoHeight) / videoElt.videoWidth;
                    var cWidth = Math.ceil(videoElt.videoWidth * scale);
                    var cHeight = Math.ceil(videoElt.videoHeight * scale);

                    var canvas = _({
                        tag: 'canvas',
                        attr: {
                            width: cWidth + 'px',
                            height: cHeight + 'px'
                        }
                    }).addTo(renderDiv);
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(videoElt, 0, 0, cWidth, cHeight);
                    var image = canvas.toDataURL('image/jpeg', 0.1)
                    renderDiv.remove();
                    resolve({
                        width: videoElt.videoWidth,
                        height: videoElt.videoHeight,
                        image: image
                    });
                },
                error: function () {
                    clearTimeout(timeout);
                    renderDiv.remove();
                    reject();
                }
            }
        });
        renderDiv.addChild(videoElt);
        videoElt.currentTime = 0.1;

        var timeout = setTimeout(() => {
            renderDiv.remove();
            reject();
        }, 5000);
    });
}
