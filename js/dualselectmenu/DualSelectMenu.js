import { $, _ } from "../../ACore";
import MDualSelectBox from "../dualselectbox/MDualSelectBox";
import MDSMBoxController from "./MDSMBoxController";
import DSMPropsHandlers from "./DSMPropsHandlers";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import { AbstractInput } from "../Abstraction";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import DualSelectBox from "../DualSelectBox";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import { hitElement } from "absol/src/HTML5/EventEmitter";

function DualSelectMenu() {
    this.isMobile = BrowserDetector.isMobile;
    if (this.isMobile) {
        this.addClass('as-mobile');
        this.$box = _({
            tag: MDualSelectBox,
        });
        this.boxCtrl = new MDSMBoxController(this);
    }
    else {
        this.$box = _({
            tag: DualSelectBox,
            props: {
                anchor: [1, 6, 2, 5]
            }
        });

        this.boxCtrl = new DSMBoxController(this);
    }
    this.$item = $('.absol-selectlist-item', this);
    OOP.drillProperty(this, this.$box, 'enableSearch');
    if (this.$box.cancelWaiting) {
        this.$box.cancelWaiting();
    }

    this.strictValue = false;
    AbstractInput.call(this);
    /**
     * @name readOnly
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name disabled
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name strictValue
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name format
     * @type {string}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name enableSearch
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name items
     * @type {Array}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name value
     * @type {Array}
     * @memberOf DualSelectMenu#
     */
    /**
     * @name selectedItem
     * @type {Array}
     * @memberOf DualSelectMenu#
     */
    /**
     * adapted from selectedItem
     * @name seletedItems
     * @type {Array}
     * @memberOf DualSelectMenu#
     */

}

mixClass(DualSelectMenu, AbstractInput);

DualSelectMenu.tag = 'DualSelectMenu'.toLowerCase();

DualSelectMenu.render = function () {
    return _({
        class: ['as-dual-select-menu', 'absol-selectmenu', 'as-dual-select-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: '.absol-selectlist-item'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });
};

DualSelectMenu.prototype.notifyChange = function () {
    // console.log('change')
    delete this['pendingValue'];
    this.emit('change', { type: 'change', target: this }, this);
};

DualSelectMenu.prototype.updateText = function () {
    var selectedItem = this.$box.selectedItem;
    var format = this.format;

    var firstToken = '__';
    var secToken = '__';
    if (selectedItem && selectedItem[0]) {
        firstToken = selectedItem[0].text + '';
    }

    if (selectedItem && selectedItem[1]) {
        secToken = selectedItem[1].text + '';
    }

    var text = format.replace('$0', firstToken)
        .replace('$1', secToken);
    this.$item.clearChild().addChild(_({
        tag: 'span',
        class: 'absol-selectlist-item-text',
        child: { text: text }
    }));
};

Object.assign(DualSelectMenu.property, DSMPropsHandlers);

DualSelectMenu.eventHandler = {};


export default DualSelectMenu;

function DSMBoxController(elt) {
    this.elt = elt;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt.on('click', this.ev_click);
    this.elt.$box.on('preupdateposition', this.ev_preUpdateBoxPosition);
    this.elt.$box.on('close', this.ev_clickClose);
}

DSMBoxController.prototype.onFocus = function () {
    var box = this.elt.$box;
    box.followTarget = this.elt;
    box.sponsorElement = this.elt;
    box.addTo(document.body);
    box.updatePosition();
    box.scrollIntoSelected();
    this.elt.off('click', this.ev_click);
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut)
    }, 10);
};

DSMBoxController.prototype.onBlur = function () {
    this.elt.$box.followTarget = null;
    this.elt.$box.selfRemove();
    document.removeEventListener('click', this.ev_clickOut)
    setTimeout(() => {
        this.elt.on('click', this.ev_click);
    }, 50);
};

DSMBoxController.prototype.ev_click = function () {
    this.elt.isFocus = true;
};


DSMBoxController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.elt.$box, event)) return;
    this.elt.isFocus = false;
};

DSMBoxController.prototype.ev_clickClose = function (event) {
    this.elt.isFocus = false;
};


DSMBoxController.prototype.ev_preUpdateBoxPosition = function () {
    var bound = this.elt.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.elt.$box.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this.elt);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.elt.isFocus = false;
    }
}