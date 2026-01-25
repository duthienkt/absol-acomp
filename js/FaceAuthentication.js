import { _, $, $$ } from '../ACore';
import FaceIdInput, { readVectors } from "./FaceIdInput";
import Fragment from "absol/src/AppPattern/Fragment";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { mixClass } from "absol/src/HTML5/OOP";
import Modal from "./Modal";
import MHeaderBar from "./mobile/MHeaderBar";
import MessageDialog from "./MessageDialog";
import FlexiconButton from "./FlexiconButton";
import noop from "absol/src/Code/noop";
import FaceIdEnrollment, { HeadSteadyDetector, SQCapture } from "./FaceIdEnrollment";
import Vec2 from "absol/src/Math/Vec2";
import StepIndicator from "./StepIndicator";
import TIHistory from "./tokenizeiput/TIHistory";


/**
 * @extends {FaceIdEnrollment}
 * @constructor
 */
function FaceAuthentication(options) {
    this.options = options || {};
    Fragment.call(this);
    this.isMobile = BrowserDetector.isMobile;
    this.options = options || {};
    this.count = 0;
    this.score = 0;
    this.resolve = noop;
    this.steadyDetector = new HeadSteadyDetector();
    this.steadyDetector.requireN = 1;
    this.steadyDetector.maxDistance = 1.5;
    this.ev_steady = this.ev_steady.bind(this);
    this.vectors = null;
    if (this.options.verification)
        this.sqCapture = new SQCapture2(this);

}


mixClass(FaceAuthentication, FaceIdEnrollment);

FaceAuthentication.prototype.headerTitle = "Xác thực Face ID";


FaceAuthentication.prototype.createView = function () {
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
                        length: 4,
                        idx: -1,
                        labels: [
                            'span.mdi.mdi-camera', 'span.mdi.mdi-cog-outline',
                            'span.mdi.mdi-face-recognition',
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
                class: 'as-face-id-enrollment-footer'

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
    this.$input.on('cameraloaded', event => {
        if (!event.success) {
            setTimeout(()=>{
                this.resolve({ success: false, error: event.error });
            }, 1000);
        }
        else {
            this.$stepIndicator.idx  = 1;
            this.viewDescription("Khởi chạy hệ thống nhận diện khuôn mặt");
        }

    });

    this.$input.on('humanjsloaded', event => {
        if (!event.success) {
            setTimeout(()=>{
                this.resolve({ success: false, error: event.error });
            }, 1000);
        }
    });

    this.$input.once('result', event => {
      this.$stepIndicator.idx  = 2;
        this.viewDescription("Đang nhận dện khuôn mặt của bạn");
        this.viewCommand("Giữ khuôn mặt của bạn ổn định trong khung hình");
    });


    this.$view = this.$container;
    this.$stepIndicator = $('.as-face-id-enrollment-step-indicator-ctn stepindicator', this.$main);
    this.$description = $('.as-face-id-enrollment-description', this.$main);

};


FaceAuthentication.prototype.readVectorsFromOptions = function () {
    var vectors = this.options.vectors;
    if (Array.isArray(vectors)) {
        this.vectors = vectors;
    }
    else if ((typeof vectors === "string") || (vectors instanceof File) || (vectors instanceof Blob)) {
        readVectors(vectors).then(vectors => {
            if (Array.isArray(vectors)) {
                this.vectors = vectors;
            }
            else {
                setTimeout(() => {
                    this.resolve({ success: false, error: "Can not load face id." });
                }, 1000);
            }
        }).catch(e => {
            setTimeout(() => {
                this.resolve({ success: false, error: e });
            }, 1000);
        });
    }
}

FaceAuthentication.prototype.onStart = function () {
    this.readVectorsFromOptions();
    var view = this.getView();
    this.$stepIndicator.idx  = 0;
    this.$input.onStart();
    document.body.appendChild(view);
    this.steadyDetector.on('steady', this.ev_steady);
    this.viewDescription("Khởi tạo camera");
};


FaceAuthentication.prototype.ev_face = function (event) {
    if (this.sqCapture && !this._takedFirstCam) {
        this._takedFirstCam = true;
        this.sqCapture.takePhoto();
    }

    if (this.sqCapture && (event.face.length > 0) && !this._takedFirstFace) {
        this._takedFirstFace = true;
        this.sqCapture.takePhoto();
    }


    if (event.face.length !== 1) return;

    var face = event.face[0];

    this.steadyDetector.feed(face);

};

FaceAuthentication.prototype.successThreshold = 0.7;

FaceAuthentication.prototype.ev_steady = function (event) {
    if (!Array.isArray(this.vectors)) return;
    var face = event.face;
    if (this.count > 15) return;
    this.count++;
    var newScore;
    newScore = this.vectors.reduce((ac, cr) => {
        var sc = human.match.similarity(face.embedding, cr);
        return Math.max(ac, sc);
    }, 0)
    if (newScore < 0.5) {
        this.score = 0;

    }
    this.score = Math.max(this.score, newScore);

    if (this.count === 1 && !this._takeMidFace) {
        this._takeMidFace = true;
        if (this.sqCapture) {
            this.sqCapture.takePhoto();
        }
    }
    var sync =[];
    if (this.count >= 10 || (this.score >= this.successThreshold && this.count>=2)) {
        if (this.sqCapture && !this._takedEndFace) {
            this._takedEndFace = true;
            this.sqCapture.takePhoto();
        }
        this.count = 20;
        this.$input.stopCamera();
        this.$input.stopDetect();
        sync = [new Promise(resolve => setTimeout(resolve, 500))];

        if (this.score >= this.successThreshold) {
            if (this.sqCapture) {
                sync.push(this.sqCapture.exportFile())
            }
            Promise.all(sync).then((res)=>{
                var resp = { success: true, score: this.score };
                if (res[1]) resp.verificationImage = res[1];
                this.$stepIndicator.idx = 3;
                this.resolve(resp);
                this.stop();
            });

        }
        else {
            Promise.all(sync).then((res)=>{
                this.resolve({ success: false, score: this.score });
                this.stop();
            });
        }
    }

};


export function openFaceIdAuthenticationDialog(options) {
    //   {
    //     return Promise.resolve({success: true});//not support android
    // }
    var dialog = new FaceAuthentication(options);
    return dialog.startForResult();
}


export default FaceAuthentication;

/**
 * @extends {SQCapture}
 * @constructor
 */
function SQCapture2() {
    SQCapture.apply(this, arguments);
}

mixClass(SQCapture2, SQCapture);

SQCapture2.prototype.size = 256;
SQCapture2.prototype.row = 2;
SQCapture2.prototype.col = 2;