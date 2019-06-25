import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

var originSetTimeout = setTimeout;
var originClearTimeout = setTimeout;
var originSetInterval = setInterval;
var originClearInterval = clearInterval;
var pendingTimeout = 0;
var pendingInterval = 0;
var timeoutDict = {};
var intervalDict = {};


function DebugTask() {
    var res = _({
        class: 'absol-debug-task',
        child: [
            {
                child: [{
                    tag: 'span',
                    class: 'absol-debug-task-name',
                    child: { text: 'settimeout ' }
                },
                {
                    tag: 'span',
                    class: ['absol-debug-task-value', 'settimeout'],

                    child: { text: '0' }
                }]
            },
            {
                child: [{
                    tag: 'span',
                    class: 'absol-debug-task-name',
                    child: { text: 'setintervel ' }
                },
                {
                    tag: 'span',
                    class: ['absol-debug-task-value', 'setinterval'],
                    child: { text: '0' }
                }]
            }
        ]
    });
    res._timeout = 0;
    res._interval = 0;
    res.$setTimeOutValue = $('.absol-debug-task-value.settimeout', res);
    res.$setIntervalValue = $('.absol-debug-task-value.setinterval', res);
    return res;
}

DebugTask.property = {};

DebugTask.property.timeout = {
    set: function (value) {
        this._timeout = value;
        this.$setTimeOutValue.innerHTML = value + '';
    },
    get: function () {
        return this._timeout;
    }
};

DebugTask.property.interval = {
    set: function (value) {
        this._interval = value;
        this.$setIntervalValue.innerHTML = value + '';
    },
    get: function () {
        return this._interval;
    }
};


DebugTask.start = function () {
    if (DebugTask.started) return;
    if (!DebugTask.$view) {
        DebugTask.$view = _('debugtask');
    }

    global.setTimeout = function () {
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        var originCallback = arguments[0];
        if (typeof originCallback == 'undefined') return;
        if (typeof originCallback == 'string'){
            originCallback = new Function(originCallback);
        }
        args[0] = function () {
            var ret;
            try{
                ret = originCallback.apply(null, arguments);

            }
            catch(e){
                console.error(e);
            }
            if (timeoutDict[timeoutId]) {
                pendingTimeout--;
                delete timeoutDict[timeoutId];
                DebugTask.$view.timeout = pendingTimeout;
            }
            return ret;
        }
        var timeoutId = originSetTimeout.apply(global, args)
        pendingTimeout++;
        timeoutDict[timeoutId] = true;

        DebugTask.$view.timeout = pendingTimeout;

        return timeoutId;
    }

    global.clearTimeout = function(timeoutId){
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        if (timeoutDict[timeoutId]) {
            pendingTimeout--;
            delete timeoutDict[timeoutId];
            DebugTask.$view.timeout = pendingTimeout;
        }
        return originClearTimeout.apply(global, args);

    };


    global.setInterval = function () {
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        var originCallback = arguments[0];
        if (typeof originCallback == 'undefined') return;
        if (typeof originCallback == 'string'){
            originCallback = new Function(originCallback);
        }
        args[0] = function () {
            var ret;
            try{
                ret = originCallback.apply(null, arguments);

            }
            catch(e){
                console.error(e);
            }
            return ret;
        }
        var intervalId = originSetInterval.apply(global, args)
        pendingInterval++;
        intervalDict[intervalId] = true;
    
        DebugTask.$view.interval = pendingInterval;
    
        return intervalId;
    }
    
    global.clearInterval = function(intervalId){
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        if (intervalDict[intervalId]) {
            pendingInterval--;
            delete intervalDict[intervalId];
            DebugTask.$view.interval = pendingInterval;
        }
        return originClearInterval.apply(global, args);
    
    };

    Dom.documentReady.then(function () {
        DebugTask.$view.addTo(document.body);
    });
};

Acore.install('debugtask', DebugTask);



export default DebugTask;

