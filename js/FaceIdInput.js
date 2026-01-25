import { loadScript } from "absol/src/Network/XLoader";
import { $, _ } from '../ACore';
import '../css/faceid.css';
import Rectangle from "absol/src/Math/Rectangle";
import safeThrow from "absol/src/Code/safeThrow";
import Snackbar from "./Snackbar";
import { randomIdent } from "absol/src/String/stringGenerate";
import { readAsArrayBuffer } from "absol/src/Converter/buffer";

var humanJSSync = null;
var humanJSModelsSync = null;

export function loadHumanJSLibrary() {
    if (!humanJSSync) {
        humanJSSync = loadScript('https://absol.cf/vendor/human/human.js').then(() => {
            if (!window.human && window.Human) {
                window.human = window.Human;
            }
        });
    }

    return humanJSSync;
}

export function loadHumanJSModels() {
    if (!humanJSModelsSync) {
        humanJSModelsSync = loadHumanJSLibrary().then(() => {
            if (!window.human && !window.Human) {
                return null;
            }
            var human = new Human.Human({
                modelBasePath: 'https://absol.cf/vendor/human/models',
                face: {
                    enabled: true,
                    liveness: { enabled: true },
                    antispoof: { enabled: true },
                    description: { enabled: true }
                },
                body: { enabled: false },
                hand: { enabled: false },
                object: { enabled: false }
            });
            return human.load().then(() => human);
        });
    }
    return humanJSModelsSync;
}


/**
 *
 * @param {Rectangle} r1
 * @param {Rectangle} r2
 * @returns {number}
 */
function compareRect(r1, r2) {
    var cl = r1.collapsedSquare(r2);
    var s1 = r1.square();
    var s2 = r2.square();
    return Math.min(cl, s1, s2) / Math.max(s1, s2);
}

export function vectorsToFile(vectors, fileName) {
    var buffer = new ArrayBuffer(vectors.length * vectors[0].length * 8 + 8);
    var dataView = new DataView(buffer);
    dataView.setUint32(4, vectors.length);
    dataView.setUint32(0, vectors[0].length);
    for (var i = 0; i < vectors.length; ++i) {
        for (var j = 0; j < vectors[0].length; ++j) {
            dataView.setFloat64(8 + (i * vectors[0].length + j) * 8, vectors[i][j]);
        }
    }
    return new File([buffer], fileName || 'faceid_' + randomIdent(5) + '.dat', { type: 'application/octet-stream' });
}

/**
 *
 * @param {File|Blob|string} file
 * @return {Promise<never>|Promise<*[]>}
 */
export function readVectors(file) {
    // Returns Promise<Array<Array<number>>>
    if (!file) return Promise.reject(new Error('No file provided'));

    return readAsArrayBuffer(file).then(buffer => {
        const dataView = new DataView(buffer);
        const vectorLength = dataView.getUint32(0);
        const vectorCount = dataView.getUint32(4);
        const vectors = [];
        for (let i = 0; i < vectorCount; ++i) {
            const vector = [];
            for (let j = 0; j < vectorLength; ++j) {
                const value = dataView.getFloat64(8 + (i * vectorLength + j) * 8);
                vector.push(value);
            }
            vectors.push(vector);
        }
        return vectors;
    });
}

export var FII_ERROR_NO_CAMERA_ACCESS = "FII_ERROR_NO_CAMERA_ACCESS";
export var FII_ERROR_NO_HUMANJS = "FII_ERROR_NO_HUMANJS";

/**
 * @extends AElement
 * @constructor
 */
function FaceIdInput() {
    /**
     *
     * @type {HTMLVideoElement|AElement}
     */
    this.$video = $('.as-face-id-input-video', this);
    this.$viewport = $('.as-face-id-input-video-viewport', this);
    this.$pitch = $('.as-face-id-face-pitch', this);//x
    this.$yaw = $('.as-face-id-face-yaw', this);//y
    this.$roll = $('.as-face-id-face-roll', this);//y
    this.$facePos = $('.as-face-id-face-pos', this);

    this.viewportCtrl = new FIViewport(this);
    this.status = 'init';
    this.detectInterval = 200;
    this.tickTO = -1;
    this.detectStatus = 0;
    this.detectTick = this.detectTick.bind(this);
    this.$debug = $('.as-debug', this);
    this.count = 0;
    this.$video.on('pause', () => {
        setTimeout(() => {
            if (this.isDescendantOf(document.body) && this.$video.srcObject) {
                this.$video.play();
            }
        }, 500);
    })


    this.obs = new IntersectionObserver(entries => {
        if (this.isDescendantOf(document.body)) {
            this.viewportCtrl.onResize();
            this.onStart();

        }
        else {
            if (this.obs) {
                // this.onStop();
                this.obs.disconnect();
                this.obs = null;
            }
        }
    });

    this.obs.observe(this);
}


FaceIdInput.tag = 'FaceIDInput'.toLowerCase();

FaceIdInput.render = function () {
    return _({
        class: 'as-face-id-input',
        extendEvent: ['face', 'humanjsloaded', 'cameraloaded', 'result'],
        child: [
            {
                class: 'as-face-id-input-video-ctn',
                child: [
                    {
                        class: 'as-face-id-input-video-viewport',
                        child: [
                            {
                                tag: 'video',
                                class: 'as-face-id-input-video',
                                style:{
                                    opacity: '0'
                                },
                                attr: {
                                    autoplay: "true",
                                    muted: "true",
                                    playsinline: "true",
                                    controls: null
                                }

                            },
                            '.as-face-id-face-pos',
                            // '.as-face-id-face-pitch',
                            // '.as-face-id-face-yaw',
                            // '.as-face-id-face-roll'
                        ]
                    }
                ]

            },
            {
                class: 'as-debug',
                style: {
                    display: (location.href.indexOf('lab') >= 0 || location.href.indexOf('frame') >= 0) ? 'block' : 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'red',
                    fontSize: '48px',

                },
                child: { text: '0' }
            }

        ]
    });
};


FaceIdInput.prototype.getUserMedia = function () {
    var permissionsSync = new Promise(resolve => {
        if (localStorage.getItem("support_native_camera") === "true"){
            resolve(true);
            return;
        }
        if (window.androidHost && window.mobileHost && window.mobileHost.requestPermission) {
            if (androidHost.checkPermission("android.permission.CAMERA")) {
                resolve(true);
                return;
            }
            var i;
            window.mobileHost.requestPermission("android.permission.CAMERA", resp => {
                if (resp && resp.length > 0) {
                    for (i = 0; i < resp.length; ++i) {
                        if (resp[i].permissions === 'android.permission.CAMERA') {
                            resolve(resp[i].result);
                        }
                    }
                }
            });
        }
        else {
            return resolve(true);//handle by browser
        }
    })


    return permissionsSync.then(ok => {
        if (!ok) return [];
        return navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user'
            },
            audio: false
        });
    })
};

/**
 * Starts the user's camera and attaches the video stream to the video element.
 * @returns {Promise<boolean>} Resolves to true if the camera starts successfully, otherwise undefined.
 */
FaceIdInput.prototype.startCamera = function () {
    return Promise.all([this.getUserMedia()])
        .then((result) => {
            var stream = result[0];
            if (!stream) {
                this.emit('cameraloaded', { success: false, error: new Error("No camera stream available") });
                return;
            }
            this.$video.srcObject = stream;
            // this.$video.src = './fid.mp4';
            this.$video.play();
            this.$video.once('loadeddata', () => {
                this.$video.removeStyle('opacity');
                // this.$video.play();
                this.emit('cameraloaded', { success: true });
                this.viewportCtrl.onVideoLoaded();
                var newRect = new Rectangle(0, 0, this.$video.videoWidth, this.$video.videoHeight);
                newRect.width = Math.min(newRect.width, newRect.height);
                // noinspection JSSuspiciousNameCombination
                newRect.height = newRect.width;
                newRect.x = (this.$video.videoWidth - newRect.width) / 2;
                newRect.y = (this.$video.videoHeight - newRect.height) / 2;
                this.faceRectTime = Date.now();

                this.faceRect = newRect;
                this.viewportCtrl.viewAt(this.faceRect);
                this.prevFaceRect = newRect.copy();

            });
            loadHumanJSModels().then((human) => {

                if (!window.human && !window.Human) {
                    this.emit('humanjsloaded', { success: false, error: new Error("Can not load human.js library") });
                    return;
                }
                else if (human) {
                    this.human = human;
                    this.emit('humanjsloaded', { success: true });
                    this.startDetect();
                }
                else {
                    this.emit('humanjsloaded', { success: false, error: new Error("Can not load human.js models") });
                }

            });


            return true;
        })
        .catch((err) => {
            // safeThrow(err);
            this.emit('cameraloaded', { success: false, error: new Error("No camera stream available") });
            console.error('Camera access denied:', err);
            return false;
        });
};

FaceIdInput.prototype.stopCamera = function () {
    if (this.$video && this.$video.srcObject) {
        const stream = this.$video.srcObject;
        if (stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
        }
        this.$video.srcObject = null;
    }
};


/**
 *
 * @param {Rectangle} faceRect
 */
FaceIdInput.prototype.changeVideoViewportIfNeed = function (faceRect) {

};

var count = 0;
var prevFace;
FaceIdInput.prototype.drawFace = function (face) {
    /*
    this.$pitch.addStyle({
        transform: `rotate(${face ? face.rotation.angle.pitch : 0}rad)`
    });
    this.$yaw.addStyle({
        transform: `rotate(${face ? face.rotation.angle.yaw : 0}rad)`
    });

    this.$roll.addStyle({
        transform: `rotate(${face ? face.rotation.angle.roll : 0}rad)`
    });
    if (prevFace) {
        console.log('similar', human.match.similarity(face.embedding, prevFace.embedding))
    }
    count++;
    if (count === 20) {
        prevFace = face;
        console.log("assigned", face)
    }
    */
}


FaceIdInput.prototype.startDetect = function () {
    if (this.detectStatus > 0) return;
    this.detectStatus = 1;
    this.detectTick();
};


FaceIdInput.prototype.stopDetect = function () {
    clearTimeout(this.detectTick);
    this.tickTO = -1;
    this.detectStatus = 0;
};


FaceIdInput.prototype.detectTick = function () {
    if (!this.detectStatus) return;
    clearTimeout(this.tickTO);
    if (this.$video.readyState < 2) {
        this.tickTO = setTimeout(this.detectTick.bind(this), 200);
        return;
    }

    this.human.detect(this.$video).then((result) => {
        this.emit('result', { type: 'result', result: result });
        var faceRect, face;
        if (!result || !result.face || result.face.length === 0) {
            // faceRect = this.getCenterVideoRect();
        }
        else {
            this.count++;
            this.$debug.firstChild.data = this.count + '';
            this.emit('face', {
                type: 'face',
                face: result.face,
                videoRect: this.viewportCtrl.getVideoRect(),

            });
            face = result.face[0];
            faceRect = new Rectangle(face.box[0], face.box[1], face.box[2], face.box[3]);
            result.face.forEach(face => {
                face.rect = new Rectangle(face.box[0], face.box[1], face.box[2], face.box[3]);

            })
        }
        if (faceRect)
            this.viewportCtrl.onFaceRect(faceRect);
        this.drawFace(face);
        if (this.detectStatus) {
            this.tickTO = setTimeout(this.detectTick.bind(this), 500);
        }
    }).catch(() => {
        if (this.detectStatus) {
            this.tickTO = setTimeout(this.detectTick.bind(this), 500);
        }
    });
};


FaceIdInput.prototype.onStart = function () {
    if (this.status === 'running') return;
    this.status = 'running';
    this.startCamera();
};


FaceIdInput.prototype.onStop = function () {
    if (this.status !== 'running') return;
    this.status = 'stopped';
    this.stopDetect();
    this.stopCamera();
};


export default FaceIdInput;


/**
 *
 * @param {FaceIdInput} elt
 * @constructor
 */
function FIViewport(elt) {
    this.elt = elt;
    this.$video = elt.$video;
    this.$viewport = elt.$viewport;
    this.clientRect = new Rectangle(0, 0, 0, 0);
    this.viewRect = new Rectangle(0, 0, 0, 0);
}

FIViewport.prototype.onResize = function () {
    this.clientRect = Rectangle.fromClientRect(this.$viewport.getBoundingClientRect());
};


FIViewport.prototype.onVideoLoaded = function () {
    this.clientRect = Rectangle.fromClientRect(this.$viewport.getBoundingClientRect());
};


FIViewport.prototype.viewAt = function (newViewRect) {
    this.clientRect = Rectangle.fromClientRect(this.$viewport.getBoundingClientRect());
    this.viewRect = newViewRect.copy();
    var scale = newViewRect.width / this.clientRect.width;


    this.$video.addStyle({
        width: (this.$video.videoWidth / scale) + 'px',
        left: (-newViewRect.x / scale) + 'px',
        top: (-newViewRect.y / scale) + 'px'
    });
};


FIViewport.prototype.getVideoRect = function () {
    return new Rectangle(0, 0, this.$video.videoWidth, this.$video.videoHeight);
};


FIViewport.prototype.getCenterVideoSquare = function () {
    var rect = this.getVideoRect();
    var center = rect.centerPoint();
    var size = Math.min(rect.width, rect.height);
    rect.x = center.x - size / 2;
    rect.y = center.y - size / 2;
    rect.width = size;
    rect.height = size;
    return rect;
};

FIViewport.prototype.onFaceRect = function (faceRect) {
    faceRect = faceRect || this.getCenterVideoSquare();
    faceRect = faceRect.copy();
    faceRect.x -= Math.round(faceRect.width / 10);
    faceRect.y -= Math.round(faceRect.height / 10);
    faceRect.width *= 1.2;
    faceRect.height *= 1.2;
    faceRect.width = Math.round(faceRect.width);
    faceRect.height = Math.round(faceRect.height);
    var avSize = Math.min(faceRect.width, faceRect.height, this.$video.videoWidth, this.$video.videoHeight);
    faceRect.x = Math.max(0, Math.min(faceRect.x, this.$video.videoWidth - avSize));
    faceRect.y = Math.max(0, Math.min(faceRect.y, this.$video.videoHeight - avSize));
    faceRect.width = avSize;
    faceRect.height = avSize;

    if (compareRect(faceRect, this.viewRect) < 0.7) {
        this.viewAt(faceRect);
    }
};
