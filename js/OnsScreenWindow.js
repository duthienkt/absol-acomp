import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Draggable from "./Draggable";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;


function OnScreenWindow() {
    var res = _({
        extendEvent: ['sizechange', 'drag', 'relocation'],
        class: 'absol-onscreen-window',
        child: {
            class: 'absol-onscreen-window-content',
            child: [
                {
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
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-top',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-left',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-right',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-right',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-left',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-left',
                '.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-right'

            ]
        }
    });

    res.eventHandler = OOP.bindFunctions(res, OnScreenWindow.eventHandler);
    res.$headerbar = Draggable($('.absol-onscreen-window-head-bar', res))
        .on('begindrag', res.eventHandler.beginDragHeaderbar);
    res.$bottomResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom', res))
        .on('begindrag', res.eventHandler.beginDragBottom);

    res.$rightResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-right', res))
        .on('begindrag', res.eventHandler.beginDragRight);

    res.$topResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top', res))
        .on('begindrag', res.eventHandler.beginDragTop);

    res.$leftResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-left', res))
        .on('begindrag', res.eventHandler.beginDragLeft);

    res.$bottomRightResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-right', res))
        .on('begindrag', res.eventHandler.beginDragButtonRight);

    res.$bottomLeftResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-bottom-left', res))
        .on('begindrag', res.eventHandler.beginDragBottomLeft);

    res.$topLeftResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-left', res))
        .on('begindrag', res.eventHandler.beginDragTopLeft);

    res.$topRightResizer = Draggable($('.absol-onscreen-window-resizer.absol-onscreen-window-resize-top-right', res))
        .on('begindrag', res.eventHandler.beginDragTopRight);


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
    return res;
}

OnScreenWindow.eventHandler = {};

OnScreenWindow.eventHandler.beginDragHeaderbar = function (event) {
    if (!EventEmitter.hitElement(this.$headerButtonCtn, event)) {
        this.$headerbar.on('drag', this.eventHandler.dragHeaderbar);
        this.$headerbar.on('enddrag', this.eventHandler.endDragHeaderbar);
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
    var dx = event.moveDX;
    var dy = event.moveDY;
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
    this.$headerbar.off('enddrag', this.eventHandler.endDragHeaderbar);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};



OnScreenWindow.eventHandler.beginDragBottom = function (event) {
    if (event.target != this.$bottomResizer) return;
    this.$bottomResizer.on('drag', this.eventHandler.dragBottom);
    this.$bottomResizer.on('enddrag', this.eventHandler.endDragBottom);
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
    var dy = event.moveDY;
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('height', newHeight + 'px');
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragBottom = function (event) {
    this.$bottomResizer.off('drag', this.eventHandler.dragBottom);
    this.$bottomResizer.off('enddrag', this.eventHandler.endDragBottom);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


OnScreenWindow.eventHandler.beginDragRight = function (event) {
    if (event.target != this.$rightResizer) return;
    this.$rightResizer.on('drag', this.eventHandler.dragRight);
    this.$rightResizer.on('enddrag', this.eventHandler.endDragRight);
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
    var dx = event.moveDX;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    this.addStyle('width', newWidth + 'px');
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragRight = function (event) {
    this.$rightResizer.off('drag', this.eventHandler.dragRight);
    this.$rightResizer.off('enddrag', this.eventHandler.endDragRight);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};




OnScreenWindow.eventHandler.beginDragTop = function (event) {
    if (event.target != this.$topResizer) return;
    this.$topResizer.on('drag', this.eventHandler.dragTop);
    this.$topResizer.on('enddrag', this.eventHandler.endDragTop);
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
    var dy = event.moveDY;
    var newTop = Math.max(0, Math.min(this.__moveData__.maxTop, this.__moveData__.bound.top + dy));
    var newHeight = this.__moveData__.bound.bottom - newTop;
    this.addStyle({
        'top': newTop + 'px',
        'height': newHeight + 'px',
    });
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragTop = function (event) {
    this.$topResizer.off('drag', this.eventHandler.dragTop);
    this.$topResizer.off('enddrag', this.eventHandler.endDragTop);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;

};


OnScreenWindow.eventHandler.beginDragLeft = function (event) {
    if (event.target != this.$leftResizer) return;
    this.$leftResizer.on('drag', this.eventHandler.dragLeft);
    this.$leftResizer.on('enddrag', this.eventHandler.endDragLeft);
    var bound = this.getBoundingClientRect();
    var minWidth = this.$windowTitle.getBoundingClientRect().right - bound.left + this.$headerButtonCtn.getBoundingClientRect().width;
    this.__moveData__ = {
        maxLeft: bound.right - minWidth,
        bound: bound,
        modal: _('.absol-onscreen-window-moving-modal.absol-onscreen-window-resize-left').addTo(document.body)
    };
};

OnScreenWindow.eventHandler.dragLeft = function (event) {
    var dx = event.moveDX;
    var newLeft = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newWidth = this.__moveData__.bound.right - newLeft;
    this.addStyle({
        width: newWidth + 'px',
        left: newLeft + 'px'
    });
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragLeft = function (event) {
    this.$rightResizer.off('drag', this.eventHandler.dragLeft);
    this.$rightResizer.off('enddrag', this.eventHandler.endDragLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};


//todo
OnScreenWindow.eventHandler.beginDragButtonRight = function (event) {
    if (event.target != this.$bottomRightResizer) return;
    this.$bottomRightResizer.on('drag', this.eventHandler.dragButtonRight);
    this.$bottomRightResizer.on('enddrag', this.eventHandler.endDragButtonRight);
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
    var dx = event.moveDX;
    var dy = event.moveDY;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('width', newWidth + 'px');
    this.addStyle('height', newHeight + 'px');
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragButtonRight = function (event) {
    this.$bottomRightResizer.off('drag', this.eventHandler.dragButtonRight);
    this.$bottomRightResizer.off('enddrag', this.eventHandler.endDragButtonRight);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};



OnScreenWindow.eventHandler.beginDragBottomLeft = function (event) {
    if (event.target != this.$bottomLeftResizer) return;
    this.$bottomLeftResizer.on('drag', this.eventHandler.dragBottomLeft);
    this.$bottomLeftResizer.on('enddrag', this.eventHandler.endDragBottomLeft);
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
    var dx = event.moveDX;
    var dy = event.moveDY;
    var newLeft = Math.max(0, Math.min(this.__moveData__.maxLeft, this.__moveData__.bound.left + dx));
    var newWidth = this.__moveData__.bound.right - newLeft;
    var newHeight = Math.max(this.__moveData__.minHeight, Math.min(this.__moveData__.maxHeight, this.__moveData__.bound.height + dy));
    this.addStyle('height', newHeight + 'px');
    this.addStyle({
        width: newWidth + 'px',
        left: newLeft + 'px'
    });
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragBottomLeft = function (event) {
    this.$bottomLeftResizer.off('drag', this.eventHandler.dragLeft);
    this.$bottomLeftResizer.off('enddrag', this.eventHandler.endDragLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;
};




OnScreenWindow.eventHandler.beginDragTopLeft = function (event) {
    if (event.target != this.$topLeftResizer) return;
    this.$topLeftResizer.on('drag', this.eventHandler.dragTopLeft);
    this.$topLeftResizer.on('enddrag', this.eventHandler.endDragTopLeft);
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
    var dy = event.moveDY;
    var dx = event.moveDX;
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
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragTopLeft = function (event) {
    this.$topLeftResizer.off('drag', this.eventHandler.dragTopLeft);
    this.$topLeftResizer.off('enddrag', this.eventHandler.endDragTopLeft);
    this.__moveData__.modal.remove();
    this.__moveData__ = undefined;

};



OnScreenWindow.eventHandler.beginDragTopRight = function (event) {
    if (event.target != this.$topRightResizer) return;
    this.$topRightResizer.on('drag', this.eventHandler.dragTopRight);
    this.$topRightResizer.on('enddrag', this.eventHandler.endDragTopRight);
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
    var dy = event.moveDY;
    var dx = event.moveDX;
    var newWidth = Math.max(this.__moveData__.minWidth, Math.min(this.__moveData__.maxWidth, this.__moveData__.bound.width + dx));
    var newTop = Math.max(0, Math.min(this.__moveData__.maxTop, this.__moveData__.bound.top + dy));
    var newHeight = this.__moveData__.bound.bottom - newTop;
    this.addStyle({
        'top': newTop + 'px',
        'height': newHeight + 'px',
        width: newWidth + 'px'
    });
    this.emit('sizechange', event, this);
};


OnScreenWindow.eventHandler.endDragTopRight = function (event) {
    this.$topRightResizer.off('drag', this.eventHandler.dragTopRight);
    this.$topRightResizer.off('enddrag', this.eventHandler.endDragTopRight);
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


Acore.install('OnScreenWindow'.toLowerCase(), OnScreenWindow);