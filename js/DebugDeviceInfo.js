import '../css/debugtask.css';

import ACore, { _, $ } from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import MHeaderBar from "./mobile/MHeaderBar";

/**
 * @extends AElement
 * @constructor
 */
function DebugDeviceInfo() {
    this.$body = $('.as-debug-device-info-body', this);
    this.$header = $('.as-debug-device-info-header', this);
    this.$content = $('.as-debug-device-info-content', this);
    this.update();
    this.$header.on('action', (event) => {
        this.remove();
    });
}

DebugDeviceInfo.tag = 'DebugDeviceInfo'.toLowerCase();


DebugDeviceInfo.render = function () {
    return _({
        class: 'as-debug-device-info',
        child: [
            {
                tag: MHeaderBar,
                class: 'as-debug-device-info-header',
                props: {
                    title: 'Debug Device Info',
                    actionIcon: 'span.mdi.mdi-arrow-left',
                }
            },
            {
                class: 'as-debug-device-info-body',
                child: '.as-debug-device-info-content',
            }
        ]
    });
};

DebugDeviceInfo.prototype.update = function () {
    this.$content.clearChild();
    this.makeSelection('Basic');
    this.makeRow('url', window.location.href);
    this.makeSelection('Browser');
    ['au', 'os', 'device', 'browser', 'hasTouch', 'supportPassiveEvent',
        'supportGridLayout'].forEach(name => {
        var value = BrowserDetector[name];
        if (value) {
            this.makeRow(name, value);
        }
    });
    if (window.mobileHost) {
        this.makeSelection('Host');
        ['deviceId', 'ANPsToken', 'FCMToken'].forEach(name => {
            var value = window.mobileHost[name];
            if (value !== undefined) {
                this.makeRow(name, value);
            }
        });
    }
};

DebugDeviceInfo.prototype.makeSelection = function (name) {
    _({
        class: 'as-debug-device-info-section',
        child: { text: name }
    }).addTo(this.$content);
};

DebugDeviceInfo.prototype.makeRow = function (name, value) {
    var valueED;
    if (typeof value === 'object') {
        valueED = {
            text: value.type + ' ' + (value.version || ''),
        }
    }
    else {
        valueED = { text: value };
    }
    _({
        class: 'as-debug-device-info-row-name',
        child: {
            text: name
        }
    })
        .addTo(this.$content);
    _({
        class: 'as-debug-device-info-row-value',
        child: valueED
    })
        .addTo(this.$content);
};


ACore.install(DebugDeviceInfo);

export function openDebugDeviceInfo() {
    var elt = _(
        { tag: DebugDeviceInfo }
    );
    document.body.appendChild(elt);
}

/**
 *
 * @param {AElement|HTMLElement} elt
 */
export function attachDebugDeviceInfo(elt) {
    var count = 0;
    var lastClickTime = 0;

    function onClickDocument(event) {
        var now = Date.now();
        if (now - lastClickTime > 1000) count = 0;
        lastClickTime = now;
        if (AElement.prototype.isDescendantOf.call(event.target, elt)) {
            count++;
            if (count > 22) {
                count = 0;
                elt.addEventListener('pointerdown', onClick);
                document.removeEventListener('pointerdown', onClickDocument);
                openDebugDeviceInfo();
            }
        }
        else {
            count = 0;
            elt.addEventListener('pointerdown', onClick);
            document.removeEventListener('pointerdown', onClickDocument);
        }

    }

    function onClick() {
        elt.removeEventListener('pointerdown', onClick);
        setTimeout(() => {
            document.addEventListener('pointerdown', onClickDocument);
        }, 100);
    }

    elt.addEventListener('pointerdown', onClick);

}

export default DebugDeviceInfo;
