import ACore, { _, $, $$ } from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import '../css/cpuviewer.css';
import Rectangle from "absol/src/Math/Rectangle";
import Vec2 from "absol/src/Math/Vec2";
import FlagManager from "absol/src/Code/FlagManager";
import BrowserDetector from "absol/src/Detector/BrowserDetector";

/***
 * @extends AElement
 * @constructor
 */
function CPUViewer() {
    /***
     *
     * @type {HTMLCanvasElement}
     */
    this.$canvas = $('canvas', this);
    this.ctx = this.$canvas.getContext('2d');
    this.offsetTime = 0;
    this.inv = -1;
    this.usage = Array(120).fill(0);
    this.holdStart = 0;
    this.holdTime = 0;
    this.logOffset = 0;
    this.counter = 0;

    this['tick'] = this.tick.bind(this);

}

CPUViewer.tag = 'CPUViewer'.toLowerCase();

CPUViewer.render = function () {
    return _({
        class: 'as-cpu-viewer',
        child: {
            tag: 'canvas',
            attr: {
                width: '120px',
                height: '50px'
            }
        }
    });
};

CPUViewer.prototype.start = function () {
    if (this.inv < 0) {
        this.offsetTime = performance.now();
        setInterval(this.tick, 250);
        document.addEventListener('mousemove', this.eventHandler.onMouseMove);

    }
};

CPUViewer.prototype.stop = function () {
    if (this.inv > 0) {
        clearInterval(this.inv);
        this.inv = -1;
        document.removeEventListener('mousemove', this.eventHandler.onMouseMove);

    }
};


CPUViewer.eventHandler = {};

CPUViewer.eventHandler.onMouseMove = function (event) {
    var bound = Rectangle.fromClientRect(this.getBoundingClientRect());
    var point = new Vec2(event.clientX, event.clientY);
    if (bound.containsPoint(point)) {
        this.addClass('as-hover');
    }
    else {
        this.removeClass('as-hover');
    }
};

CPUViewer.prototype.tick = function () {
    while (this.holdTime > 250) {
        this.holdTime -= 250;
        this.usage.push(100);
    }
    this.usage.push(this.holdTime * 100 / 250);
    while (this.usage.length > 120) {
        this.usage.shift();
    }
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, 120, 50);
    var y;
    this.ctx.fillStyle = 'yellow';
    for (var x = 0; x < this.usage.length; ++x) {
        y = this.usage[x] / 2;
        this.ctx.fillRect(x, 50 - y, 1, y);
    }
    var now = performance.now();
    this.logOffset = now;
    this.holdStart = now;
    this.holdTime = 0;

};

CPUViewer.prototype.hold = function () {
    if (this.counter === 0) {
        this.holdStart = performance.now();
    }
    this.counter++;
};

CPUViewer.prototype.release = function () {
    if (this.counter <= 0) return;
    this.counter--;
    if (this.counter === 0) {
        this.holdTime += performance.now() - this.holdStart;
    }
};


/***
 *
 * @type {CPUViewer}
 */
CPUViewer.instance = null;
CPUViewer.state = 'NOT_INIT';
CPUViewer.start = function () {
    if (!this.instance) {
        this.instance = _('cpuviewer');
        this.state = "NOT_ATTACHED";
    }
    if (this.state === "NOT_ATTACHED") {
        this.state = "RUNNING";
        Dom.documentReady.then(function () {
            document.body.appendChild(this.instance);
        }.bind(this));
    }
    this.instance.start();

    CPUViewer.hold = function () {
        this.instance.hold();
    };

    CPUViewer.release = function () {
        this.instance.release();
    };
};

CPUViewer.stop = function () {
    if (!this.instance) return;
    if (this.state !== "RUNNING") return;
    this.instance.stop();
    this.instance.remove();
    this.state = 'NOT_ATTACHED';
    CPUViewer.hold = function () {
    };

    CPUViewer.release = function () {
    };


};


CPUViewer.hold = function () {

};

CPUViewer.release = function () {

};

ACore.install(CPUViewer);

export default CPUViewer;


function AttachHookView() {

}


function startCPUViewerIfNeed() {
    if (BrowserDetector.isMobile) return;
    var originSTO = window.setTimeout;
    var originSIV = window.setInterval;
    FlagManager.add('CPU_VIEWER', false);
    if (location.href.indexOf('localhost:8080')>=0 || window.CPU_VIEWER) {
        CPUViewer.start();
        window.cpuRisedHanders = [];
        window.setTimeout = function (handler) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (typeof handler === 'function') {
                args.unshift(function () {
                    while (window.cpuRisedHanders.length > 1000) window.cpuRisedHanders.pop();
                    CPUViewer.hold();
                    handler.apply(null, args);
                    CPUViewer.release();
                    if (handler.name !== 'intervalFuncLoop')
                        window.cpuRisedHanders.push(handler);
                });
                return originSTO.apply(this, args);
            }
            else {
                return originSTO.apply(this, arguments);
            }
        }

        window.setInterval = function (handler, timeout, args) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (typeof handler === 'function') {
                args.unshift(function () {
                    while (window.cpuRisedHanders.length > 1000) window.cpuRisedHanders.pop();
                    CPUViewer.hold();
                    handler.apply(null, args);
                    CPUViewer.release();
                    if (handler.name !== 'intervalFuncLoop')
                        window.cpuRisedHanders.push(handler);
                });
                return originSIV.apply(this, args);
            }
            else {
                return originSIV.apply(this, arguments);
            }
        }
    }
}

startCPUViewerIfNeed();

