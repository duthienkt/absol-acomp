import ACore, { _, $ } from "../../ACore";
import { fileInfoOf } from "../utils";
import ExtIcons from "../../assets/exticons/catalog.json";
import MessageInput from "../messageinput/MessageInput";

var thumbnailCache = {};

var dbSync;
var getDb = () => {
    dbSync = dbSync || new Promise((resolve) => {
        var request = window.indexedDB.open('FileThumbnailDB', 1);
        request.onupgradeneeded = (event) => {
            var db = event.target.result
            db.createObjectStore("files", {});
        };
        request.onsuccess = (event) => {
            var db = event.target.result;
            var request1;
            if (localStorage.getItem('FileThumbnail_clear_cache') === '1') {
                localStorage.removeItem('FileThumbnail_clear_cache');
                request1 = db.transaction('files', 'readwrite').objectStore('files').clear();
                request1.onsuccess = () => {
                    resolve(db);
                }
                request1.onerror = () => {
                    resolve(null);
                }
            }
            else
                resolve(db);
        }
        request.onerror = () => {
            resolve(null);
        }
    });
    return dbSync;
}

var dbGetItem = (key) => {
    return getDb().then(db => {
        if (!db) return null;
        var request = db.transaction('files').objectStore('files').get(key);
        return new Promise(resolve => {
            request.onsuccess = (event) => {
                var data = event.target.result;
                resolve(data);
            };
            request.onerror = () => {
                resolve(null);
            }
        })
    });
};

var dbSetItem = (key, value) => {
    return getDb().then(db => {
        if (!db) return null;
        var objectStore = db.transaction('files', 'readwrite').objectStore('files');
        var request = objectStore.put(value, key);
        return new Promise(resolve => {
            request.onsuccess = (event) => {
                var data = event.target.result;
                resolve(data);
            };
            request.onerror = () => {
                resolve(null);
            }
        });
    });
};

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'F5') {
        localStorage.setItem('FileThumbnail_clear_cache', '1');
    }
});


var url2small = url => {
    return new Promise(resolve => {
        var image = new Image();
        image.crossOrigin = 'anonymous';
        image.crossorigin = 'anonymous';
        image.src = url;
        image.onload = function () {
            var now = new Date();

            if (image.naturalWidth <= 200 && image.naturalHeight < 200) {
                resolve(url);
                return;
            }
            var scale = Math.min(200 / image.naturalWidth, 200 / image.naturalHeight);
            var width = Math.round(image.naturalWidth * scale);
            var height = Math.round(image.naturalHeight * scale);
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            for (var i = 0; i < 20; ++i)
                for (var j = 0; j < 20; ++j) {
                    ctx.fillStyle = (i ^ j) & 1 ? '#BBBBBB' : '#FFFFFF';
                    ctx.fillRect(i * 10, j * 10, 10, 10);
                }
            ctx.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
    });
};


var getThumbnailUrl = url => {
    if (!thumbnailCache[url]) {
        thumbnailCache[url] = dbGetItem(url).then(result => {
            if (!result) {
                result = url2small(url).then(canvasResult => {
                    if (canvasResult) dbSetItem(url, canvasResult);
                    return canvasResult;
                });
            }
            return result;
        });
    }
    return thumbnailCache[url];
};


function FileThumbnail() {
    this._value = null;
    this.$fileName = $('.as-file-thumbnail-file-name', this);
    this.$bg = $('.as-file-thumbnail-background', this);
    /***
     * @type {string}
     * @name fileName
     * @memberOf FileThumbnail#
     */
    /***
     * @type {string|null}
     * @name fileType
     * @memberOf FileThumbnail#
     */
    /***
     * @type {string|null}
     * @name thumbnail
     * @memberOf FileThumbnail#
     */
    /***
     * @type {boolean}
     * @name isDirectory
     * @memberOf FileThumbnail#
     */
}


FileThumbnail.tag = 'FileThumbnail'.toLowerCase();


FileThumbnail.render = function () {
    return _({
        class: 'as-file-thumbnail',
        child: [
            {
                class: 'as-file-thumbnail-background'
            },
            {
                class: 'as-file-thumbnail-file-name',
                child: []
            },
            {
                class: 'as-file-thumbnail-check',
                child: 'span.mdi.mdi-check-bold'
            }
        ]
    });
};


FileThumbnail.prototype._updateFileName = function () {
    var fileName = this.fileName;
    if (!fileName) {
        return;
    }
    var parts;
    var matched;
    matched = fileName.match(/([^_+\-.]+)|([_+\-.]+)/g);
    parts = matched || [];
    if (parts.length > 2 && parts[parts.length - 2] === '.') {
        parts[parts.length - 2] += parts[parts.length - 1];
        parts.pop();
    }
    parts = parts.map(txt => {
        return _({ tag: 'span', child: { text: txt } });
    });
    this.$fileName.clearChild().addChild(parts);
};

FileThumbnail.prototype._updateThumbnail = function () {
    var previewUrl;
    var thumbnail = this.thumbnail;
    var fileType = this.isDirectory ? 'folder' : this.fileType;
    if (thumbnail) {
        if (typeof thumbnail === "string") {
            this._previewUrl = thumbnail;
            getThumbnailUrl(thumbnail).then(smallerUrl => {
                if (thumbnail !== this._previewUrl) return;
                this.$bg.addStyle('backgroundImage', 'url("' + smallerUrl + '")');
            })
        }
        else if (thumbnail instanceof Blob || thumbnail instanceof File) {
            thumbnail.url = thumbnail.url || URL.createObjectURL(thumbnail);
            this._previewUrl = thumbnail.url;
        }
    }
    if (ExtIcons.indexOf(fileType) >= 0) {
        previewUrl = MessageInput.iconAssetRoot + '/' + fileType + '.svg';
    }
    else {
        previewUrl = MessageInput.iconAssetRoot + '/' + 'blank' + '.svg';
    }

    if (previewUrl) {
        this.$bg.addStyle('backgroundImage', 'url("' + encodeURI(previewUrl) + '")');
    }
    else {
        this.$bg.removeStyle('backgroundImage');
    }
}


FileThumbnail.property = {};

FileThumbnail.property.value = {
    set: function (value) {
        value = value || null;
        this._value = value;
        this._valueInfo = fileInfoOf(value);
        this._updateFileName();
        this._updateThumbnail();
    },
    get: function () {
        return this._value;
    }
};


FileThumbnail.property.fileName = {
    set: function (value) {
        this._fileName = value;
        this._updateFileName();
    },
    get: function () {
        return this._fileName || (this._valueInfo && this._valueInfo.name) || null;
    }
};


FileThumbnail.property.fileType = {
    set: function (value) {
        this._fileType = value;
        this._updateThumbnail();
    },
    /***
     * @this FileInputBox
     * @return {*}
     */
    get: function () {
        if (this.isDirectory) return null;
        return this._fileType || (this._valueInfo && this._valueInfo.type) || null;
    }
};

FileThumbnail.property.checked = {
    set: function (value) {
        if (value) {
            this.addClass('as-checked');
        }
        else {
            this.removeClass('as-checked');

        }
    },
    get: function () {
        return this.hasClass('as-checked');
    }
};


FileThumbnail.property.thumbnail = {
    set: function (value) {
        this._thumbnail = value || null;
        this._updateThumbnail();
    },
    get: function () {
        return this._thumbnail;
    }
};

FileThumbnail.property.isDirectory = {
    set: function (value) {
        if (value) {
            this.addClass('as-is-directory');
        }
        else {
            this.removeClass('as-is-directory');
        }
    },
    get: function () {
        return this.hasClass('as-is-directory');
    }
}

ACore.install(FileThumbnail);

export default FileThumbnail;