import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

var originSetTimeout = setTimeout;
var originClearTimeout = clearTimeout;
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
                },
                ]
            },
            {
                child: [{
                    tag: 'span',
                    class: 'absol-debug-task-name',
                    child: { text: 'Work ' }
                },
                {
                    tag: 'span',
                    class: ['absol-debug-task-value', 'work'],
                    child: { text: '0%' }
                },
                ]
            }
        ]
    });
    res._timeout = 0;
    res._interval = 0;
    res._work = 0;
    res.$setTimeOutValue = $('.absol-debug-task-value.settimeout', res);
    res.$setIntervalValue = $('.absol-debug-task-value.setinterval', res);
    res.$setWorkValue = $('.absol-debug-task-value.work', res);
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

DebugTask.property.work = {
    set: function (value) {
        this._work = value;
        value = (value * 100).toFixed(1);
        this.$setWorkValue.innerHTML = value + '%';
    },
    get: function () {
        return this._work;
    }
};


DebugTask.start = function () {
    if (DebugTask.started) return;
    if (!DebugTask.$view) {
        DebugTask.$view = _('debugtask');
    }

    var times = [];
    originSetInterval(function(){
        var now = performance.now();
        while (times.length > 0 && times[0].end < now - 2000) {
            times.shift();
        }
        if (times.length == 0)  DebugTask.$view.work = 0;
    },3000);
    global.setTimeout = function () {
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        var originCallback = arguments[0];
        if (typeof originCallback == 'undefined') return;
        if (typeof originCallback == 'string') {
            originCallback = new Function(originCallback);
        }
        args[0] = function () {
            var ret;
            try {
                var now = performance.now();
                while (times.length > 0 && times[0].end < now - 1000) {
                    times.shift();
                }
                ret = originCallback.apply(null, arguments);
                var now1 = performance.now();
                var long = now1 - now;
                times.push({
                    long:long,
                    start:now,
                    end:now1
                });
                var sTime = 0;
                for (var i = 0; i< times.length; ++i ){
                    sTime+= times[i].long;
                }
                DebugTask.$view.work = sTime/(Math.max(now1 - times[0].start, 1000));

            }
            catch (e) {
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

    global.clearTimeout = function (timeoutId) {
        if (timeoutDict[timeoutId]) {
            pendingTimeout--;
            delete timeoutDict[timeoutId];
            DebugTask.$view.timeout = pendingTimeout;
        }
        return originClearTimeout.apply(global, arguments);

    };


    global.setInterval = function () {
        var args = Array.prototype.map.call(arguments, function (x) { return x; });
        var originCallback = arguments[0];
        if (typeof originCallback == 'undefined') return;
        if (typeof originCallback == 'string') {
            originCallback = new Function(originCallback);
        }
        args[0] = function () {
            var ret;
            try {
                var now = performance.now();
                while (times.length > 0 && times[0].end < now - 1000) {
                    times.shift();
                }
                ret = originCallback.apply(null, arguments);
                var now1 = performance.now();
                var long = now1 - now;
                times.push({
                    long:long,
                    start:now,
                    end:now1
                });
                var sTime = 0;
                for (var i = 0; i< times.length; ++i ){
                    sTime+= times[i].long;
                }
                DebugTask.$view.work = sTime/(Math.max(now1 - times[0].start, 1000));
            }
            catch (e) {
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

    global.clearInterval = function (intervalId) {
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

ACore.install('debugtask', DebugTask);



export default DebugTask;

