import Fragment from 'absol/src/AppPattern/Fragment';
import { _ } from "../../../absol-mobile/js/dom/Core";
import '../../css/mobileapp.css';

/**
 * @extends Fragment
 * @constructor
 */
function MApplication() {
    Fragment.call(this);
    this.stack = [];
    this.pendingLoop = [];
    this.loopRunning = false;
}


MApplication.prototype.createView = function () {
    this.$view = _({
        class: ['am-application', 'am-stack']
    })
};

MApplication.prototype.postHandler = function (handler) {
    this.pendingLoop.push(handler);
    if (this.loopRunning) return;
    while (this.pendingLoop.length > 0) {
        this.pendingLoop.shift()();
    }
};

MApplication.prototype.startActivity = function (clazz, bundle) {
    var handle = () => {
        var curAct = this.stack[this.stack.length - 1];
        if (curAct) {
            curAct.pause();
        }
        var newAct = new clazz(bundle);
        var view = newAct.getView();
        this.$view.addChild(view);
        this.stack.push(newAct);
        newAct.attach(this);
        newAct.onCreated();

        if (this.state === "PAUSE") {
            newAct.start(true);
        }
        else if (this.state === 'RUNNING') {
            curAct.pause();
            newAct.start();
        }
    }
    this.postHandler(handle);
};


MApplication.prototype.replaceActivity = function (clazz, bundle) {
    var curAct = this.stack[this.stack.length - 1];
    if (curAct)
        this.finishActivity(curAct, true);
    this.startActivity(clazz, bundle);
};

/**
 *
 * @param act
 * @param {boolean=} replace
 */
MApplication.prototype.finishActivity = function (act, replace) {
    this.postHandler(() => {
        var curAct = this.stack[this.stack.length - 1];
        if (curAct) {
            if (curAct !== act) throw new Error("Activity stack error!");
            curAct.detach();
            curAct.getView().remove();
            this.stack.pop();
            curAct.destroy();
            curAct = this.stack[this.stack.length - 1];
            if (curAct && this.state === 'RUNNING' && !replace) {
                curAct.resume();
            }
        }
    });
};


MApplication.prototype.onStart = function () {
    for (var i = 0; i < this.stack.length; ++i) {
        this.stack[i].start(true);
    }
};


MApplication.prototype.onResume = function () {
    var curAct = this.stack[this.stack.length - 1];
    if (curAct) {
        curAct.resume(true);
    }
};

MApplication.prototype.onPause = function () {
    var curAct = this.stack[this.stack.length - 1];
    if (curAct) {
        curAct.pause();
    }
};

MApplication.prototype.onStop = function () {
    for (var i = this.stack.length - 1; i >= 0; --i) {
        this.stack[i].stop();
    }
};

MApplication.prototype.onDestroy = function () {
    while (this.stack.length) {
        this.stack.pop().destroy();
    }
};


export default MApplication;