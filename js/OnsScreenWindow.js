import '../css/onscreenwindow.css'
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Draggable from "./Draggable";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function OnScreenWindow() {
    var res = this;
    this._lastSize = {
        width: 0,
        height: 0
    }
    res.$headerbar = $('.absol-onscreen-window-head-bar', res)
        .on('dragstart', res.eventHandler.beginDragHeaderbar);

    res.$bottomResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom', res)
        .on('dragstart', res.eventHandler.beginDragBottom);

    res.$rightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-right', res)
        .on('dragstart', res.eventHandler.beginDragRight);

    res.$topResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top', res)
        .on('dragstart', res.eventHandler.beginDragTop);

    res.$leftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-left', res)
        .on('dragstart', res.eventHandler.beginDragLeft);

    res.$bottomRightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-right', res)
        .on('dragstart', res.eventHandler.beginDragButtonRight);

    res.$bottomLeftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-left', res)
        .on('dragstart', res.eventHandler.beginDragBottomLeft);

    res.$topLeftResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-left', res)
        .on('dragstart', res.eventHandler.beginDragTopLeft);

    res.$topRightResizer = $('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-right', res)
        .on('dragstart', res.eventHandler.beginDragTopRight);


    res.$headerButtonCtn = $('.absol-onscreen-window-head-bar-buttons', res.$headerbar);
    res.$windowIcon = $('span.absol-onscreen-window-head-bar-icon.mdi.mdi-settings', res);
    res.$windowTitle = $('.absol-onscreen-window-head-bar-title', res);
    res._windowIcon = 'span.absol-onscreen-window-head-bar-icon.mdi.mdi-settings';
    res._windowTitle = '';
    res.$bodyContainer = $('.absol-onscreen-window-body-container', res);
    res.$attachhook = _('attachhook').addTo(res)
        .on('error', function () {
            this.updateSize = this.updateSize || res.relocation.bind(res);
            Dom.addToResizeSystem(this);
        });

    res.$minimizeBtn = $('button.absol-onscreen-window-head-bar-button-minimize', res);
    res.$closeBtn = $('button.absol-onscreen-window-head-bar-button-close', res);
    res.$dockBtn = $('button.absol-onscreen-window-head-bar-button-dock', res);
}

OnScreenWindow.tag = 'OnScreenWindow'.toLowerCase();

OnScreenWindow.render = function () {
    return _({
        extendEvent: ['sizechange', 'drag', 'relocation'],
        class: 'absol-onscreen-window',
        child: {
            class: 'absol-onscreen-window-content',
            child: [
                {
                    tag: 'hanger',
                    class: 'absol-onscreen-window-head-bar',
                    child: [
                        'span.absol-onscreen-window-head-bar-icon.mdi.mdi-settings',
                        {
                            tag: 'span',
                            class: 'absol-onscreen-window-head-bar-title',
                            child: { text: '' }
                        },
                        {
                            class: "absol-onscreen-window-head-bar-buttons",
                            child: [
                                {
                                    tag: 'button',
                                    class: 'absol-onscreen-window-head-bar-button-minimize',
                                    child: 'span.mdi.mdi-window-minimize'
                                },
                                {
                                    tag: 'button',
                                    class: 'absol-onscreen-window-head-bar-button-dock',
                                    child: 'span.mdi.mdi-dock-window'
                                },
                                {
                                    tag: 'button',
                                    class: 'absol-onscreen-window-head-bar-button-close',
                                    child: 'span.mdi.mdi-close'
                                }
                            ]
                        }
                    ]
                },
                {
                    class: 'absol-onscreen-window-body-container'
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
        }
    });
};

OnScreenWindow.prototype.maybeSizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._lastSize.width !== bound.width || this._lastSize.height !== bound.height) {
        this._lastSize = bound;
        window.dispatchEvent(new Event('resize'));
        this.emit('sizechange', {size: bound, target: this, type: 'sizechange'}, this);
    }
};

OnScreenWindow.eventHandler = {};

OnScreenWindow.eventHandler.beginDragHeaderbar = function (event) {
    if (!EventEmitter.hitElement(this.$headerButtonCtn, event)) {
        this.$headerbar.on('drag', this.eventHandler.dragHeaderbar);
        this.$headerbar.on('dragend', this.eventHandler.endDragHeaderbar);
        var screenSize = Dom.getScreenSize();
        var bound = this.getBoundingClientRect();
        this.__moveData__ = {
            bound: bound,
            modal: _('.absol-onscreen-window-moving-modal').addTo(document.body),
            maxLeft: screenSize.width - bound.width - 1,
            maxY: screenSize.height - bound.height - 1,
        };
    }
};

OnScreenWindow.eventHandler.dragHeaderbar = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var dy = d.y;
    var newX = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newY = Math.max(0, Math.min(this.__moveData__.maxY, this.__moveData__.bound.top + dy));
    this.addStyle({
        top: newY + 'px',
        left: newX + 'px'
    });
    this.emit('drag', event, this);
};

OnScreenWindow.eventHandler.endDragHeaderbar = function (event) {
    this.$headerbar.off('drag', this.eventHandler.dragHeaderbar);
    this.$headerbar.off('dragend', this.eventHandler.endDragHeaderbar);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
    this.emit('relocation', { type: 'relocation', target: this }, this);
};


OnScreenWindow.eventHandler.beginDragBottom = function (event) {
    if (event.target != this.$bottomResizer) return;
    this.$bottomResizer.on('drag', this.eventHandler.dragBottom);
    this.$bottomResizer.on('dragend', this.eventHandler.endDragBottom);
    var screenSize = Dom.getScreenSize();
    var bound = this.getBoundingClientRect();
    this.__moveData__ = {
        bound: bound,
        minHeight: this.getFontSize() * 1.4,
        maxHeight: screenSize.height - bound.top,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-bottom').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragBottom = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dy = d.y;
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('height', newHeight + 'px');
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragBottom = function (event) {
    this.$bottomResizer.off('drag', this.eventHandler.dragBottom);
    this.$bottomResizer.off('dragend', this.eventHandler.endDragBottom);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


OnScreenWindow.eventHandler.beginDragRight = function (event) {
    if (event.target != this.$rightResizer) return;
    this.$rightResizer.on('drag', this.eventHandler.dragRight);
    this.$rightResizer.on('dragend', this.eventHandler.endDragRight);
    var screenSize = Dom.getScreenSize();
    var bound = this.getBoundingClientRect();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        minWidth: minWidth,
        bound: bound,
        maxWidth: screenSize.width - bound.left,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-right').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragRight = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    this.addStyle('width', newWidth + 'px');
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragRight = function (event) {
    this.$rightResizer.off('drag', this.eventHandler.dragRight);
    this.$rightResizer.off('dragend', this.eventHandler.endDragRight);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


OnScreenWindow.eventHandler.beginDragTop = function (event) {
    if (event.target != this.$topResizer) return;
    this.$topResizer.on('drag', this.eventHandler.dragTop);
    this.$topResizer.on('dragend', this.eventHandler.endDragTop);
    // var screenSize = Dom.getScreenSize();
    var bound = this.getBoundingClientRect();
    var fontSize = this.getFontSize();
    this.__moveData__ = {
        fontSize: fontSize,
        bound: bound,
        maxTop: bound.bottom - 1.4 * fontSize,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-top').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragTop = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dy = d.y;
    var newTop = Math.max(0, Math.min(this.__moveData__.maxTop, this.__moveData__.bound.top + dy));
    var newHeight = this.__moveData__.bound.bottom - newTop;
    this.addStyle({
        'top': newTop + 'px',
        'height': newHeight + 'px',
    });
    this.emit('relocation', { type: 'relocation', target: this }, this);
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragTop = function (event) {
    this.$topResizer.off('drag', this.eventHandler.dragTop);
    this.$topResizer.off('dragend', this.eventHandler.endDragTop);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;

};


OnScreenWindow.eventHandler.beginDragLeft = function (event) {
    if (event.target != this.$leftResizer) return;
    this.$leftResizer.on('drag', this.eventHandler.dragLeft);
    this.$leftResizer.on('dragend', this.eventHandler.endDragLeft);
    var bound = this.getBoundingClientRect();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        maxLeft: bound.right - minWidth,
        bound: bound,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-left').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragLeft = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var newLeft = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newWidth = this.__moveData__.bound.right - newLeft;
    this.addStyle({
        width: newWidth + 'px',
        left: newLeft + 'px'
    });
    this.emit('relocation', { type: 'relocation', target: this }, this);
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragLeft = function (event) {
    this.$leftResizer.off('drag', this.eventHandler.dragLeft);
    this.$leftResizer.off('dragend', this.eventHandler.endDragLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


//todo
OnScreenWindow.eventHandler.beginDragButtonRight = function (event) {
    if (event.target != this.$bottomRightResizer) return;
    this.$bottomRightResizer.on('drag', this.eventHandler.dragButtonRight);
    this.$bottomRightResizer.on('dragend', this.eventHandler.endDragButtonRight);
    var screenSize = Dom.getScreenSize();
    var bound = this.getBoundingClientRect();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        minHeight: this.getFontSize() * 1.4,
        minWidth: minWidth,
        bound: bound,
        maxWidth: screenSize.width - bound.left,
        maxHeight: screenSize.height - bound.top,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-bottom-right').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragButtonRight = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var dy = d.y;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('width', newWidth + 'px');
    this.addStyle('height', newHeight + 'px');

    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragButtonRight = function (event) {
    this.$bottomRightResizer.off('drag', this.eventHandler.dragButtonRight);
    this.$bottomRightResizer.off('dragend', this.eventHandler.endDragButtonRight);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


OnScreenWindow.eventHandler.beginDragBottomLeft = function (event) {
    if (event.target != this.$bottomLeftResizer) return;
    this.$bottomLeftResizer.on('drag', this.eventHandler.dragBottomLeft);
    this.$bottomLeftResizer.on('dragend', this.eventHandler.endDragBottomLeft);
    var bound = this.getBoundingClientRect();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    var screenSize = Dom.getScreenSize();
    this.__moveData__ = {
        maxLeft: bound.right - minWidth,
        bound: bound,
        minHeight: this.getFontSize() * 1.4,
        maxHeight: screenSize.height - bound.top,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-bottom-left').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragBottomLeft = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var dy = d.y;
    var newLeft = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newWidth = this.__moveData__.bound.right - newLeft;
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('height', newHeight + 'px');
    this.addStyle({
        width: newWidth + 'px',
        left: newLeft + 'px'
    });
    this.emit('relocation', { type: 'relocation', target: this }, this);
};


OnScreenWindow.eventHandler.endDragBottomLeft = function (event) {
    this.$bottomLeftResizer.off('drag', this.eventHandler.dragLeft);
    this.$bottomLeftResizer.off('dragend', this.eventHandler.endDragLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


OnScreenWindow.eventHandler.beginDragTopLeft = function (event) {
    if (event.target != this.$topLeftResizer) return;
    this.$topLeftResizer.on('drag', this.eventHandler.dragTopLeft);
    this.$topLeftResizer.on('dragend', this.eventHandler.endDragTopLeft);
    var bound = this.getBoundingClientRect();
    var fontSize = this.getFontSize();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        maxLeft: bound.right - minWidth,
        fontSize: fontSize,
        bound: bound,
        maxTop: bound.bottom - 1.4 * fontSize,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-top-left').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragTopLeft = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var dy = d.y;
    var newTop = Math.max(0, Math.min(this.__moveData__.maxTop, this.__moveData__.bound.top + dy));
    var newHeight = this.__moveData__.bound.bottom - newTop;
    var newLeft = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newWidth = this.__moveData__.bound.right - newLeft;
    this.addStyle({
        top: newTop + 'px',
        height: newHeight + 'px',
        width: newWidth + 'px',
        left: newLeft + 'px'
    });
    this.emit('relocation', { type: 'relocation', target: this }, this);
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragTopLeft = function (event) {
    this.$topLeftResizer.off('drag', this.eventHandler.dragTopLeft);
    this.$topLeftResizer.off('dragend', this.eventHandler.endDragTopLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;

};


OnScreenWindow.eventHandler.beginDragTopRight = function (event) {
    if (event.target != this.$topRightResizer) return;
    this.$topRightResizer.on('drag', this.eventHandler.dragTopRight);
    this.$topRightResizer.on('dragend', this.eventHandler.endDragTopRight);
    var screenSize = Dom.getScreenSize();
    var bound = this.getBoundingClientRect();
    var fontSize = this.getFontSize();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        minWidth: minWidth,
        fontSize: fontSize,
        bound: bound,
        maxWidth: screenSize.width - bound.left,
        maxTop: bound.bottom - 1.4 * fontSize,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-top-right').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragTopRight = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    var dx = d.x;
    var dy = d.y;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    var newTop = Math.max(0, Math.min(this.__moveData__.maxTop, this.__moveData__.bound.top + dy));
    var newHeight = this.__moveData__.bound.bottom - newTop;
    this.addStyle({
        'top': newTop + 'px',
        'height': newHeight + 'px',
        width: newWidth + 'px'
    });
    this.emit('relocation', { type: 'relocation', target: this }, this);
    this.maybeSizeChange();
};


OnScreenWindow.eventHandler.endDragTopRight = function (event) {
    this.$topRightResizer.off('drag', this.eventHandler.dragTopRight);
    this.$topRightResizer.off('dragend', this.eventHandler.endDragTopRight);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;

};


['addChild', 'addChildBefore', 'addChildAfter', 'clearChild', 'findChildBefore', 'findChildAfter'].forEach(function (key) {
    OnScreenWindow.prototype[key] = function () {
        return this.$bodyContainer[key].apply(this.$bodyContainer, arguments);
    };
});


OnScreenWindow.property = {};

OnScreenWindow.property.windowIcon = {
    set: function (value) {
        this._windowIcon = value;
        if (this.$windowIcon) {
            this.$windowIcon.remove();
            this.$windowIcon = undefined;
        }
        if (value) {
            this.$windowIcon = _(value).addClass('absol-onscreen-window-head-bar-icon');
            this.$headerbar.addChildBefore(this.$windowIcon, this.$headerbar.childNodes[0]);
        }
    },
    get: function () {
        return this._windowIcon;
    }
};


OnScreenWindow.property.windowTitle = {
    set: function (value) {
        this._windowTitle = value;
        this.$windowTitle
            .clearChild()
            .addChild(_({
                text: '' + value
            }));
    },
    get: function () {
        return this._windowTitle;
    }
};


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