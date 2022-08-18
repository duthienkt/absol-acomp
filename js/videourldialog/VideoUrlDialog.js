import Fragment from "absol/src/AppPattern/Fragment";
import OOP from "absol/src/HTML5/OOP";
import Modal from "../Modal";
import Dom from "absol/src/HTML5/Dom";
import { $, $$, _ } from "../../ACore";
import MessageDialog from "../MessageDialog";
import '../../css/videourldialog.css';
import getEmbedVideoInfo, { getVideoFileHeader, getVideoPreview, parseVideoUrl } from "./videoUtils";
import { isNaturalNumber, isRealNumber } from "../utils";

/***
 * @extends Fragment
 * @constructor
 */
function VideoUrlDialog() {
    Fragment.call(this);
    this.task = null;
    this.pendingResult = null;
    Object.keys(VideoUrlDialog.prototype).filter(key => key.startsWith('ev_')).forEach(key => {
        this[key] = this[key].bind(this);
    });
}

OOP.mixClass(VideoUrlDialog, Fragment);

VideoUrlDialog.prototype.cache = {};


VideoUrlDialog.prototype.createView = function () {
    this.$view = _({
        tag: Modal.tag,
        class: 'as-video-url-dialog-modal',
        child: {
            tag: MessageDialog.tag,
            class: 'as-video-url-dialog',
            props: {
                dialogTitle: 'Video',
                dialogActions: [
                    {
                        text: 'OK',
                        name: 'ok'
                    },
                    {
                        text: 'Cancel',
                        name: 'cancel'
                    }
                ]
            },
            child: [
                {
                    class: 'as-video-url-dialog-row',
                    child: [
                        {
                            tag: 'label',
                            child: { text: 'URL*' }
                        },
                        {
                            tag: 'input',
                            attr: { type: 'text' },
                            class: ['as-video-url-dialog-url', 'as-text-input'],
                        }
                    ]
                },
                {
                    class: 'as-video-url-dialog-row',
                    child: [
                        {
                            tag: 'label',
                            child: { text: 'Video Info' }
                        },
                        {
                            tag: 'span',
                            class: ['as-video-url-dialog-video-info'],
                        }
                    ]
                },
                {
                    class: 'as-video-url-dialog-row',
                    child: [
                        { tag: 'label', child: { text: 'Display Size' } },
                        {
                            tag: 'input',
                            class: ['as-text-input', 'as-video-url-dialog-width'],
                            attr: { type: 'number', min: '4' }
                        },
                        { tag: 'span', child: { text: ' x ' } },
                        {
                            tag: 'input',
                            class: ['as-text-input', 'as-video-url-dialog-height'],
                            attr: { type: 'number', min: '3' }
                        },
                        {
                            tag: 'checkbox',
                            style: { marginLeft: '1em' },
                            props: {
                                text: 'keep ratio'
                            }
                        }
                    ]
                },
                {
                    class: 'as-video-url-dialog-row',
                    child: [
                        { tag: 'label', child: { text: 'Preview' } },
                        {
                            tag: 'img',
                            class: 'as-video-url-dialog-video-image'
                        }]
                }
            ]
        }
    });

    var keyTimeout = -1;
    this.$urlInput = $('.as-video-url-dialog-url', this.$view)
        .on('paste', (event) => {
            setTimeout(this.ev_urlChange.bind(this, event), 100);
        })
        .on('change', this.ev_urlChange)
        .on('keyup', (event) => {
            if (keyTimeout > 0) {
                clearTimeout(keyTimeout);
            }
            keyTimeout = setTimeout(() => {
                keyTimeout = -1;
                this.ev_urlChange(event);
            }, 300);
        });
    this.$dialog = $('.as-video-url-dialog', this.$view)
        .on('action', this.ev_action);
    this.$info = $('.as-video-url-dialog-video-info', this.$view);
    this.$image = $('.as-video-url-dialog-video-image', this.$view);
    this.$width = $('.as-video-url-dialog-width', this.$view)
        .on('change', this.ev_widthChange);
    this.$height = $('.as-video-url-dialog-height', this.$view)
        .on('change', this.ev_heightChange);
    this.$ratio = $('checkbox', this.$view)
        .on('change', this.ev_widthChange);
    this.$actionBtns = $$('.as-message-dialog-footer button', this.$view);
    this.$okBtn = this.$actionBtns[0];
};

VideoUrlDialog.prototype.onStart = function () {
    if (this.$view) {
        this.$urlInput.value = '';
        this.$width.value = '';
        this.$height.value = '';
        this.$info.innerHTML = '';
        this.$image.attr('src', undefined);
        this.$okBtn.disabled = true;
    }
    this._prevUrl = null;
};

VideoUrlDialog.prototype.onResume = function () {
    document.body.appendChild(this.getView());
    /*var testcase = [
        'https://www.facebook.com/watch?v=794088524953444',
        'https://www.youtube.com/watch?v=_YzngEllRgM&list=RDGMEMQ1dJ7wXfLlqCjwV0xfSNbAVMX8mhF6HgzVA&index=14',
        'https://vimeo.com/735513454',
        'https://www.dailymotion.com/video/x8d2trt',
        'https://www.youtube.com/embed/AoN__ZtGenc',
        'https://www.youtube.com',
        'https://absol.cf/share/10h.mp4(1).mp4',
        'https://absol.cf/share',
        'https://www.facebook.com/watch?v=386823333524397'
    ]
    this.$urlInput.value = testcase[0];
    this.ev_urlChange();*/
};

VideoUrlDialog.prototype.onPause = function () {
    this.getView().remove();
};


VideoUrlDialog.prototype.resolveCurrentTask = function (result) {
    if (this.task) {
        this.task.resolve(result || this.pendingResult);
        this.task = null;
    }
};

VideoUrlDialog.prototype.cancelCurrentTask = function () {
    if (this.task) {
        this.task.cancel();
        this.task = null;
    }
};


VideoUrlDialog.prototype.assignTask = function (task) {
    this.cancelCurrentTask();
    this._prevUrl = null;
    this.task = task;
    if (task.initInfo)
        this.onInfo(task.initInfo);
};


VideoUrlDialog.prototype.onInfo = function (info){

    this.getView();
    this._prevUrl = info.url;
    if (info.error) {
        this.pendingResult = null;
        this.$image.attr('src', undefined);
        this.$info.innerHTML = '<span style="color:#ff2c2c">Can not load video!</span>';
        return;
    }
    this.pendingResult = info;
    if (info.image) this.$image.attr('src', info.image);
    else {
        this.$image.attr('src', undefined);
    }
    var infoText = [];

    if (isRealNumber(info.width) && isRealNumber(info.height)) {
        infoText.push([info.width, ' x ', info.height].join(''));
    }
    if ('displayWidth' in info){
        this.$width.value = info.displayWidth;
        this.$height.value = info.displayHeight;
        this.$urlInput.value = info.url;
    }
    else
    if (isRealNumber(info.width) && isRealNumber(info.height)) {
        infoText.push([info.width, ' x ', info.height].join(''));
        this.$width.value = info.width;
        this.$height.value = info.height;
        this.$ratio.checked = true;
    }
    else {
        this.$width.value = 560;
        this.$height.value = 315;
    }
    if ('keepRatio' in info){
        this.$ratio.checked = true;
    }

    if (info.type.startsWith('video/')) {
        infoText.push(info.type.substring(6).toUpperCase());
    }
    if (info.title) {
        infoText.push('<strong>' + info.title + '</strong>');
    }
    this.$info.innerHTML = infoText.join(', ');
    this.$okBtn.disabled = false;
}

/***
 * @param event
 */
VideoUrlDialog.prototype.ev_urlChange = function (event) {
    var newUrl = this.$urlInput.value;
    if (this._prevUrl === newUrl) return;
    this.$okBtn.disabled = true;
    this._prevUrl = newUrl;
    var info = parseVideoUrl(newUrl);
    var sync;
    if (info.videoId === 'INVALID_URL') {
        info.error = 'INVALID_URL';
        sync = Promise.resolve();
    }
    else if (info.hostType !== '*') {
        info.type = 'text/html';
        sync = getEmbedVideoInfo(info.originalUrl, info.hostType === 'facebook').then((result) => {
            if (newUrl !== this._prevUrl) return;
            Object.assign(info, result);
            if (!isNaturalNumber(result.width)) {
                info.error = "INVALID_VIDEO";
            }
        });
    }
    else {
        sync = getVideoFileHeader(info.url).then(result => {
            if (newUrl !== this._prevUrl) return;
            Object.assign(info, result);
            if (result.error) {
                this.$info.innerHTML = '<span style="color:#ff2c2c">Can not load video!</span>';
            }
        }).then(() => {
            if (newUrl !== this._prevUrl) return;
            if (info.error) return;
            if (info.type.startsWith('video/'))
                return getVideoPreview(info.url)
                    .then(result1 => {
                        if (newUrl !== this._prevUrl) return;
                        Object.assign(info, result1);
                    }, error1 => {
                        info.error = "CAN_NOT_LOAD";
                    });
        });
    }
    sync.then(() => {
        if (newUrl !== this._prevUrl) return;
        this.onInfo(info);
    });
};

/***
 * @param event
 */
VideoUrlDialog.prototype.ev_action = function (event) {
    setTimeout(() => {
        var action = event.action;
        if (action.name === 'cancel') {
            this.cancelCurrentTask()
        }

        var width = parseInt(this.$width.value);
        var height = parseInt(this.$height.value);
        var result = Object.assign({}, this.pendingResult);

        if (!isNaN(width) && !isNaN(height)) {
            result.displayWidth = width;
            result.displayHeight = height;
        }
        else {
            result.displayWidth = 560;
            result.displayHeight = 315;
        }
        result.keepRatio = this.$ratio.checked;
        if (action.name === 'ok') {
            this.resolveCurrentTask(result);
        }
        this.stop();

    }, 100)
};


VideoUrlDialog.prototype.ev_widthChange = function () {
    if (!this.$ratio.checked ||
        !this.pendingResult || !isRealNumber(this.pendingResult.width) || !isRealNumber(this.pendingResult.height)) return;
    var ratio = this.pendingResult.width / this.pendingResult.height;
    var width = parseFloat(this.$width.value);
    this.$height.value = Math.round(width / ratio);
};


VideoUrlDialog.prototype.ev_heightChange = function () {
    if (!this.$ratio.checked ||
        !this.pendingResult || !isRealNumber(this.pendingResult.width) || !isRealNumber(this.pendingResult.height)) return;
    var ratio = this.pendingResult.width / this.pendingResult.height;
    var height = parseFloat(this.$height.value);
    this.$width.value = Math.round(height * ratio);
};

/***
 * @type {VideoUrlDialog}
 */
var shareInstance;

export function openVideUrlDialog(initInfo) {
    shareInstance = shareInstance || new VideoUrlDialog();
    return new Promise((rs) => {
        var task = {
            resolved: false,
            canceled: false,
            resolve: function (info) {
                if (this.resolved) return;
                this.resolved = true;
                rs(info);
            },
            cancel: function () {
                if (this.resolved || this.canceled) return;
                if (shareInstance.task !== this) return;
                this.canceled = true;
                rs(null);
            },
            initInfo: initInfo
        }
        shareInstance.start();
        shareInstance.assignTask(task);
    });


}

export default VideoUrlDialog;