import ACore, { _, $, $$ } from '../ACore';
import FaceIdInput, { readVectorsFromFile, vectorsToFile } from "./FaceIdInput";
import Fragment from "absol/src/AppPattern/Fragment";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { mixClass } from "absol/src/HTML5/OOP";
import Modal from "./Modal";
import MHeaderBar from "./mobile/MHeaderBar";
import MessageDialog from "./MessageDialog";
import FlexiconButton from "./FlexiconButton";
import noop from "absol/src/Code/noop";
import Vec2 from "absol/src/Math/Vec2";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { randomIdent } from "absol/src/String/stringGenerate";
import { canvasToBlobAsync } from "absol/src/HTML5/Image";
import { blobToFile } from "absol/src/Converter/file";
import { AbstractStyleExtended } from "./Abstraction";
import { isNaturalNumber } from "./utils";
import StepIndicator from "./StepIndicator";

/**
 * @typedef {Object} FaceIdEnrollmentOptions
 * @property {boolean} [verification] - If true, enables verification image capture.
 * @property {boolean} [avatar] - If true, enables avatar image capture.
 */

/**
 * @extends {Fragment}
 * @param {FaceIdEnrollmentOptions} [options]
 * @constructor
 */
function FaceIdEnrollment(options) {
    Fragment.call(this);
    this.isMobile = BrowserDetector.isMobile;
    this.options = options || {};
    this.hitCenter = false;
    this.hitLeft = false;
    this.hitRight = false;
    this.recorded = {};
    this.count = 0;
    this.hitCenterCount = 0;
    this.resolve = noop;
    this.steadyDetector = new HeadSteadyDetector();
    if (this.options.verification) {
        this.sqCapture = new SQCapture(this);
    }
    else {
        this.sqCapture = null;
    }
    this.ev_steady = this.ev_steady.bind(this);

}

mixClass(FaceIdEnrollment, Fragment);


FaceIdEnrollment.prototype.createDesktopContainer = function () {
    this.$container = _({
        tag: Modal,
        class: 'as-face-id-enrollment-modal',
        child: [
            {
                tag: MessageDialog,
                child: [
                    this.$main
                ]
            }
        ]

    });

    this.$dialog = $('messagedialog', this.$container);
    this.$dialog.dialogTitle = this.headerTitle;

    this.$dialog.$header.addChild(_({
        tag: 'button',
        class: 'as-transparent-button',
        child: 'span.mdi.mdi-close',
        style: {
            position: 'absolute',
            top: 'calc(50%  - 0.75em)',
            right: '1em',
            width: '1.5em',
            height: '1.5em',
        },
        on: {
            click: () => {
                console.log('resolve false');
                this.resolve({ success: false });
                this.stop();
            }
        }
    })).addStyle('position', 'relative');
};

FaceIdEnrollment.prototype.headerTitle = "Đăng ký Face ID";

FaceIdEnrollment.prototype.createMobileContainer = function () {
    this.$container = _({
        class: ['as-face-id-enrollment-modal', 'as-mobile'],
        child: [
            {
                tag: MHeaderBar,
                props: {
                    actionIcon: '<i class="material-icons">arrow_back_ios</i>',
                    title: this.headerTitle
                },
                on: {
                    action: () => {
                        this.resolve({ success: false });
                        this.stop();
                    }
                }
            },
            this.$main
        ]
    });
};


FaceIdEnrollment.prototype.createView = function () {
    this.$main = _({
        class: 'as-face-id-enrollment',
        child: [
            {
                class: 'as-face-id-enrollment-command-ctn',
                child: {
                    class: 'as-face-id-enrollment-command',
                    style:{
                        display:'none'
                    },
                    child: {
                        text: ''
                    }

                }
            },
            {
                class: 'as-face-id-enrollment-canvas-ctn',
                child: {
                    tag: 'canvas',
                    attr: {
                        width: 320,
                        height: 320
                    },
                    class: ['as-face-id-enrollment-canvas', 'as-hidden']
                }
            },

            {
                tag: FaceIdInput,
                on: {
                    face: this.ev_face.bind(this)
                }
            },
            {
                class: 'as-face-id-enrollment-step-indicator-ctn',
                child: {
                    tag: StepIndicator,
                    props: {
                        length: 5,
                        idx: -1,
                        labels: [
                            'span.mdi.mdi-camera', 'span.mdi.mdi-cog-outline',
                            'span.mdi.mdi-face-recognition', 'span.mdi.mdi-face-man-profile',
                            'span.mdi.mdi-check']
                    }
                }
            },
            {
                class: 'as-face-id-enrollment-description',
                child: {
                    text: ''
                }
            },
            {
                class: 'as-face-id-enrollment-footer',
                child: [
                    {
                        tag: FlexiconButton,
                        class: 'as-face-id-enrollment-redo',
                        style: {
                            variant: 'secondary',
                            size: 'large'
                        },
                        props: {
                            icon: 'span.mdi.mdi-reload',
                            text: "Làm lại",
                            disabled: true
                        },
                        on: {
                            click: () => {
                                this.redo();
                            }
                        }
                    },
                    {
                        tag: FlexiconButton,
                        class: 'as-face-id-enrollment-submit',
                        style: {
                            size: 'large',
                            variant: 'primary',
                        },
                        props: {
                            text: "Xác nhận",
                            disabled: true
                        },
                        on: {
                            click: () => {
                                this.submit();
                            }
                        }
                    }]
            }
        ]
    });

    if (this.isMobile) {
        this.createMobileContainer();
    }
    else {
        this.createDesktopContainer();
    }

    this.$command = $('.as-face-id-enrollment-command', this.$main);
    this.$input = $(FaceIdInput.tag, this.$main);
    this.$input.once('cameraloaded', event => {
        setTimeout(()=>{
            if (!this.sqCapture) return;
            this.sqCapture.takePhoto();//first when init, delay for camera auto exposure
        },100);

        this.$stepIndicator.idx = 1;
        this.viewDescription("Khởi chạy hệ thống nhận diện khuôn mặt");
    });

    this.$input.once('result', event => {
        setTimeout(()=>{
            if (!this.sqCapture) return;
            this.sqCapture.takePhoto();//first when init, delay for camera auto exposure
        },10);

        this.$stepIndicator.idx = 2;
        this.viewDescription("Đăng ký khuôn mặt của bạn");
        this.viewCommand("Giữ khuôn mặt của bạn ổn định trong khung hình");
    });

    this.$input.on('humanjsloaded', event => {

    });


    this.$stepIndicator = $('.as-face-id-enrollment-step-indicator-ctn stepindicator', this.$main);

    this.$description = $('.as-face-id-enrollment-description', this.$main);
    this.$view = this.$container;
    this.$redo = $('.as-face-id-enrollment-redo', this.$main);
    this.$submit = $('.as-face-id-enrollment-submit', this.$main);
    this.$canvas = $('.as-face-id-enrollment-canvas', this.$main);
    this.ctx = this.$canvas.getContext('2d');

};

FaceIdEnrollment.prototype.startForResult = function () {
    return new Promise(resolve => {
        this.resolve = resolve;
        this.start();
    })
};

FaceIdEnrollment.prototype.onStart = function () {
    var view = this.getView();
    this.$input.onStart();
    document.body.appendChild(view);
    this.steadyDetector.once('steady', this.ev_steady);
    this.$stepIndicator.idx = 0
    this.viewDescription("Khởi tạo camera");
};

FaceIdEnrollment.prototype.onStop = function () {
    if (this.$view) {
        this.$input.onStop();
        this.$view.remove();
        this.resolve = noop;
    }
    this.steadyDetector.off('steady', this.ev_steady);

};

FaceIdEnrollment.prototype.redo = function () {
    this.hitCenter = false;
    this.hitLeft = false;
    this.hitRight = false;
    this.recorded = {};
    this.count = 0;
    this.hitCenterCount = 0;
    this.$stepIndicator.idx = 2;
    this.steadyDetector.on('steady', this.ev_steady);
    this.viewDescription("Giữ khuôn mặt của bạn ổn định trong khung hình");
    this.viewCommand("Giữ khuôn mặt của bạn ổn định trong khung hình");
    this.$submit.disabled = true;
    this.$redo.disabled = true;
    this.$input.startCamera();
    this.$input.startDetect();
    this.$canvas.addClass('as-hidden');
    this.$main.removeClass('as-completed');
};

FaceIdEnrollment.prototype.canSubmit = function () {
    return this.hitCenter && this.hitLeft && this.hitRight && this.count >= 7;
};

FaceIdEnrollment.prototype.submit = function () {
    if (!this.canSubmit()) return;
    this.$submit.disabled = true;
    var vectors = Object.values(this.recorded);
    var vectorsFile = vectorsToFile(vectors, 'faceid_' + randomIdent(5) + '.dat', { type: 'application/octet-stream' });
    var sync = [];
    var res = { success: true, vectors: vectors, vectorsFile: vectorsFile };
    var t;
    if (this.sqCapture) {

        t = this.sqCapture.exportFile().then(file => {
            res.verificationImage = file;
        });
        sync.push(t);
    }
    if (this.options.avatar) {
        t = canvasToBlobAsync(this.$canvas, 0.5, 'image/jpeg').then(file => {
            res.avatar = blobToFile(file, 'avatar_' + randomIdent(5) + '.jpg');
        });
        sync.push(t);
    }
    Promise.all(sync).then(() => {
        this.resolve(res);
        this.stop();
    })
};

/**
 *
 * @param {string} text
 */
FaceIdEnrollment.prototype.viewCommand = function (text) {
    if (text){
        this.$command.removeStyle('display');
    }
    else {
        this.$command.addStyle('display', 'none');
    }
    this.$command.firstChild.data = text;
};

/**
 *
 * @param {string} text
 */
FaceIdEnrollment.prototype.viewDescription = function (text) {
    this.$description.firstChild.data = text;
};


FaceIdEnrollment.prototype.ev_face = function (event) {
    if (event.face.length !== 1) return;
    var face = event.face[0];
    this.steadyDetector.feed(face);
    var angle = face.rotation.angle;
    var v = new Vec2(angle.yaw, angle.pitch);

    if (Math.abs(v.y < 0.2) && this.hitCenter) {//must hit center first
        if (v.x < -0.2) {
            if (!this.hitLeft) {
                this.hitLeft = true;

            }
        }
        else if (v.x > 0.2) {
            if (!this.hitRight) {
                this.hitRight = true;

            }
        }
    }

    var key = (angle.pitch / 10).toFixed(3) + '_' + (angle.yaw / 10).toFixed(3);
    if (!this.recorded[key]) {
        this.recorded[key] = face.embedding;
        if (this.sqCapture) this.sqCapture.takePhoto();
        this.count++;
    }
    if (this.canSubmit()) {
        this.$stepIndicator.idx = 4;
        this.viewDescription("Hoàn tất đăng ký");
        this.viewCommand('');
        this.$submit.disabled = false;
        this.$redo.disabled = false;
        this.$input.stopCamera();
        this.$input.stopDetect();
        this.$canvas.removeClass('as-hidden');
        this.$main.addClass('as-completed');
    }
};

FaceIdEnrollment.prototype.ev_steady = function (event) {
    var face = event.face;
    this.ctx.drawImage(this.$input.$video,
        face.box[0], face.box[1],
        face.box[2], face.box[3], 0, 0, 320, 320);
    if (!this.hitCenter) {
        this.hitCenter = true;
        this.$stepIndicator.idx = 3;
        this.viewCommand("Hãy nghiêng đầu sang trái và sang phải");
    }
};

export function openFaceIdEnrollmentDialog(options) {
    // if (window.androidHost && (localStorage.getItem("support_native_camera") !== "true")) {
    //     return Promise.resolve({success: false, error: new Error("Not support android yet!")});//not support android
    // }
    var dialog = new FaceIdEnrollment(options);
    return dialog.startForResult();
}


export default FaceIdEnrollment;

// function

/**
 *
 * @constructor
 */
export function HeadSteadyDetector() {
    EventEmitter.call(this);
    this.queue = [];
}

mixClass(HeadSteadyDetector, EventEmitter);

HeadSteadyDetector.prototype.maxDistance = 0.2;
HeadSteadyDetector.prototype.requireTime = 500;
HeadSteadyDetector.prototype.requireN = 2;

HeadSteadyDetector.prototype.feed = function (face) {
    var angle = face.rotation.angle;
    var v = new Vec2(angle.yaw, angle.pitch);
    var d = v.abs();
    if (d > this.maxDistance) {
        this.queue = [];
        return;
    }
    var now = Date.now();
    this.queue.push({ t: now, d: d });
    while (this.queue.length > this.requireN && this.queue[0].t < now - this.requireTime) {
        this.queue.shift();
    }

    if (this.queue.length < this.requireN) return;

    var sum = this.queue.reduce((a, b) => a + b.d, 0);
    var average = sum / this.queue.length;
    var sd = Math.sqrt(this.queue.reduce((a, b) => a + (b.d - average) * (b.d - average), 0) / this.queue.length);
    if (sd < 0.01) {
        this.emit('steady', { face: face });
    }
}

/**
 *
 * @param {FaceIdEnrollment} elt
 * @constructor
 */
export function SQCapture(elt) {
    this.elt = elt;
    this.idx = 0;

}

SQCapture.prototype.row = 3;
SQCapture.prototype.col = 3;
SQCapture.prototype.size = 512;

SQCapture.prototype.prepare = function () {
    if (this.$canvas) return;
    this.$video = this.elt.$input.$video;
    var videoWidth = this.$video.videoWidth;
    var videoHeight = this.$video.videoHeight;
    var m = Math.min(videoWidth, videoHeight);
    this.scale = this.size / m;
    this.destWidth = Math.round(videoWidth * this.scale);
    this.destHeight = Math.round(videoHeight * this.scale);
    this.$canvas = _({
        tag: 'canvas',
        attr: {
            width: this.destWidth * this.col,
            height: this.destHeight * this.row
        },
        style: {
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            'z-index': '-1000',
            opacity: '0',
        }
    }).addTo(this.elt.$view);
    this.ctx = this.$canvas.getContext('2d');
}

SQCapture.prototype.takePhoto = function () {
    this.prepare();
    if (this.idx >= this.row * this.col) return;
    var dx = (this.idx % this.col) * this.destWidth;
    var dy = Math.floor(this.idx / this.col) * this.destHeight;
    this.ctx.drawImage(this.$video,
        0, 0,
        this.$video.videoWidth, this.$video.videoHeight,
        dx, dy,
        this.destWidth, this.destHeight
    );
    this.idx++;

};

SQCapture.prototype.exportFile = function () {
    return canvasToBlobAsync(this.$canvas, 0.3, 'image/jpeg').then(function (blob) {
        return new File([blob], 'verification_' + randomIdent(5) + '.jpg', { type: 'image/jpeg' });
    });
};


/**
 * @augments {AbstractStyleExtended}
 * @augments {AElement}
 * @constructor
 */
export function FaceIdVerificationImage() {
    this.$img = $('.as-face-id-verification-image-content', this)
        .on({
            load: this.eventHandler.imageLoad,
            error: this.eventHandler.imageError
        });
    this.$index = $('.as-face-id-verification-image-index', this);
    this.$left = $('.as-left', this).on('click', () => {
        this.index--;
    });
    this.$right = $('.as-right', this).on('click', () => {
        this.index++;
    });
    AbstractStyleExtended.call(this);
    /**
     * @type {number}
     * @name index
     * @memberOf FaceIdVerificationImage#
     */

    /**
     * @type {string}
     * @name src
     * @memberOf FaceIdVerificationImage#
     */
}

mixClass(FaceIdVerificationImage, AbstractStyleExtended);

FaceIdVerificationImage.tag = 'FaceIdVerificationImage'.toLowerCase();

FaceIdVerificationImage.render = function () {
    return _({
        class: 'as-face-id-verification-image',
        child: [
            {
                tag: 'img',
                class: 'as-face-id-verification-image-content'
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-left'],
                child: 'span.mdi.mdi-chevron-left'
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-right'],
                child: 'span.mdi.mdi-chevron-right'
            },
            {
                class: 'as-face-id-verification-image-index',
                child: { text: '1/9' }
            }

        ]
    });
};

FaceIdVerificationImage.prototype.extendStyle.size = '256px'

FaceIdVerificationImage.prototype.styleHandlers.size = {
    set: function (value) {
        this.style.setProperty('--size', value);
        return value;
    }
};


FaceIdVerificationImage.property = {};

FaceIdVerificationImage.property.src = {
    set: function (value) {
        this.attr('data-src', value);
        fetch(value, { cache: 'no-store' })
            .then(res => res.blob())
            .then(blob => {
                if (this.$img._objectUrl) URL.revokeObjectURL(this.$img._objectUrl);
                this.$img._objectUrl = URL.createObjectURL(blob);
                this.$img.src = this.$img._objectUrl;
            }).catch(err => {
                console.error(err);
            });
    },
    get: function () {
        return this.$img.src;
    }
};

FaceIdVerificationImage.property.index = {
    set: function (value) {
        if (!isNaturalNumber(value)) {
            value = 0;
        }
        value = value % 9;
        this._index = value;
        this.$index.firstChild.data = (value + 1) + '/9';
        var row = Math.floor(value / 3);
        var col = value % 3;
        this.$img.style.setProperty('left', (-col * 100) + '%');
        this.$img.style.setProperty('top', (-row * 100) + '%');
    },
    get: function () {
        return this._index || 0;
    }
}

FaceIdVerificationImage.eventHandler = {};

/**
 * @this {FaceIdVerificationImage}
 */
FaceIdVerificationImage.eventHandler.imageLoad = function () {
    var img = this.$img;
    var w = img.naturalWidth;
    var h = img.naturalHeight;
    this.addStyle('--aspect-ratio', (w / h));
    if (h > w) {
        this.addClass('as-portrait');
    }
    else {
        this.addClass('as-landscape');
    }
};


FaceIdVerificationImage.eventHandler.imageError = function () {

};


ACore.install(FaceIdVerificationImage);