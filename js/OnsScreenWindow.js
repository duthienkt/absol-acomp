import '../css/onscreenwindow.css'
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom, { getScreenSize } from "absol/src/HTML5/Dom";
import WindowBox from "./WindowBox";
import Hanger from "./Hanger";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function OnScreenWindow() {
    var self = this;
    this._lastSize = {
        width: 0,
        height: 0
    }

    /***
     *
     * @type {WindowBox}
     */
    this.$windowBox = $(WindowBox.tag, this);
    OOP.drillProperty(this, this.$windowBox, 'windowTitle');
    OOP.drillProperty(this, this.$windowBox, 'windowActions');
    OOP.drillProperty(this, this.$windowBox, 'windowIcon');
    this.$windowBox.on('action', function (event){
        self.emit('action', event, self);
    });

    this.$header = _({ tag: Hanger.tag, elt: this.$windowBox.$header });
    this.$header.on('dragstart', this.eventHandler.dragStart.bind(this, this.$header, 'move'));

    //
    this.$bottomResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom', this);
    this.$bottomResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$bottomResizer, 'bottom'));

    //
    this.$rightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-right', this);
    this.$rightResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$rightResizer, 'right'));

    //
    this.$topResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top', this);
    this.$topResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$topResizer, 'top'));

    this.$leftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-left', this);
    this.$leftResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$leftResizer, 'left'));


    this.$bottomRightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-right', this);
    this.$bottomRightResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$bottomRightResizer, 'bottomRight'));
    //
    this.$bottomLeftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-left', this);
    this.$bottomLeftResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$bottomLeftResizer, 'bottomLeft'));
    //

    this.$topLeftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-left', this)
    this.$topLeftResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$topLeftResizer, 'topLeft'));

    this.$topRightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-right', this);
    this.$topRightResizer.on('dragstart', this.eventHandler.dragStart.bind(this, this.$topRightResizer, 'topRight'));

    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.requestUpdateSize = this.relocation.bind(this);
    this.$attachhook.on('error', function () {
        Dom.addToResizeSystem(this);
    });
}

OnScreenWindow.tag = 'OnScreenWindow'.toLowerCase();

OnScreenWindow.render = function () {
    return _({
        extendEvent: ['sizechange', 'drag', 'relocation', 'action'],
        class: 'absol-onscreen-window',
        child: [
            {
                tag: WindowBox.tag,
                class: 'as-window-box',

            },
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-top',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-left',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-right',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-right',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-left',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-left',
            'hanger.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-right'
        ]
    });
};

OnScreenWindow.prototype.maybeSizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._lastSize.width !== bound.width || this._lastSize.height !== bound.height) {
        this._lastSize = bound;
        window.dispatchEvent(new Event('resize'));
        this.emit('sizechange', { size: bound, target: this, type: 'sizechange' }, this);
    }
};

OnScreenWindow.prototype.moveFators = {
    move: {
        x: 1,
        y: 1,
        /***
         * @this OnScreenWindow
         * @param event
         */
        canMove: function (event) {
            return true;
        },
        cursor: 'move'
    },
    top: {
        y: 1,
        height: -1
    },
    bottom: {
        height: 1,
        cursor: 's-resize'
    },
    bottomRight: {
        height: 1,
        width: 1,
        cursor: 'se-resize'
    },
    bottomLeft: {
        height: 1,
        width: -1,
        x: 1,
        cursor: 'sw-resize'
    },
    topLeft: {
        height: -1,
        width: -1,
        x: 1,
        y: 1,
        cursor: 'nw-resize'
    },
    topRight: {
        height: -1,
        width: 1,
        y: 1,
        cursor: 'ne-resize'
    },
    right: {
        width: 1,
        cursor: 'e-resize'
    },
    left: {
        x: 1,
        width: -1,
        cursor: 'w-resize'
    }
};

/***
 *
 * @type {{}}
 * @memberOf OnScreenWindow#
 */
OnScreenWindow.eventHandler = {};

/***
 * @this OnScreenWindow
 * @param {Hanger} elt
 * @param fN
 * @param event
 */
OnScreenWindow.eventHandler.dragStart = function (elt, fN, event) {
    var factor = this.moveFators[fN];
    if (factor.canMove && !factor.canMove.call(this, event)) return;
    this.movingData = {
        factor: factor,
        screenSize: getScreenSize(),
        modal: _('.absol-onscreen-window-moving-modal')
            .addStyle('cursor', factor.cursor).addTo(document.body),
        elt: elt,
        bound: this.getBoundingClientRect()
    };
    elt.on('drag', this.eventHandler.drag)
        .on('dragend', this.eventHandler.dragEnd);
};

/***
 * @this OnScreenWindow
 * @param event
 */
OnScreenWindow.eventHandler.drag = function (event) {
    var movingData = this.movingData;
    var factor = movingData.factor;
    var bound = movingData.bound;
    var screenSize = movingData.screenSize;
    var dv = event.currentPoint.sub(event.startingPoint);
    var x, y, width, height;
    if (factor.x) {
        x = dv.x * factor.x + bound.left;
        x = Math.min(x, screenSize.width - bound.width);
        x = Math.max(0, x);
        this.addStyle('left', x + 'px');
    }

    if (factor.y) {
        y = dv.y * factor.y + bound.top;
        y = Math.min(y, screenSize.height - bound.height);
        y = Math.max(0, y);
        this.addStyle('top', y + 'px');
    }

    if (factor.width) {
        width = dv.x * factor.width + bound.width;
        this.addStyle('width', width + 'px');
    }

    if (factor.height) {
        height = dv.y * factor.height + bound.height;
        this.addStyle('height', height + 'px');
    }

    this.emit('relocation', { type: 'relocation', target: this }, this);
    this.maybeSizeChange();

};


/***
 * @this OnScreenWindow
 * @param event
 */
OnScreenWindow.eventHandler.dragEnd = function (event) {
    var movingData = this.movingData;
    var elt = movingData.elt;
    elt.off('drag', this.eventHandler.drag)
        .off('dragend', this.eventHandler.dragEnd);
    setTimeout(function () {
        movingData.modal.remove();
    }, 50);
    this.movingData = null;
};


['addChild', 'addChildBefore', 'addChildAfter', 'clearChild', 'findChildBefore', 'findChildAfter'].forEach(function (key) {
    OnScreenWindow.prototype[key] = function () {
        return this.$windowBox[key].apply(this.$windowBox, arguments);
    };
});


OnScreenWindow.property = {};


OnScreenWindow.prototype.relocation = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = Dom.getScreenSize();
    var isRelocated = false;
    if (bound.bottom >= screenSize.height) {
        this.addStyle('top', Math.max(0, screenSize.height - bound.height) + 'px');
        isRelocated = true;
    }
    if (bound.right >= screenSize.width) {
        this.addStyle('left', Math.max(0, screenSize.width - bound.width) + 'px');
        isRelocated = true;
    }

    if (isRelocated) {
        this.emit('relocation', { type: 'relocation', target: this }, this)
    }
};


ACore.install(OnScreenWindow);

export default OnScreenWindow;