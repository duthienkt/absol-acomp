import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Draggable from "./Draggable";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;


function OnScreenWindow() {
    var res = _({
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
                }
            ]
        }
    });

    res.eventHandler = OOP.bindFunctions(res, OnScreenWindow.eventHandler);
    res.$headerbar = Draggable($('.absol-onscreen-window-head-bar', res))
        .on('begindrag', res.eventHandler.beginDragHeaderbar);
    res.$headerButtonCtn = $('.absol-onscreen-window-head-bar-buttons', res.$headerbar);
    res.$windowIcon = $('span.absol-onscreen-window-head-bar-icon.mdi.mdi-settings', res);
    res.$windowTitle = $('.absol-onscreen-window-head-bar-title', res);
    res._windowIcon = 'span.absol-onscreen-window-head-bar-icon.mdi.mdi-settings';
    res._windowTitle = '';
    res.$bodyContainer = $('.absol-onscreen-window-body-container', res);
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
            maxX: screenSize.width - bound.width,
            maxY: screenSize.height - bound.height,
        };

    }
};

OnScreenWindow.eventHandler.dragHeaderbar = function (event) {
    var dx = event.moveDX;
    var dy = event.moveDY;
    var newX = Math.max(0, Math.min(this.__moveData__.maxX, this.__moveData__.bound.left + dx));
    var newY = Math.max(0, Math.min(this.__moveData__.maxY, this.__moveData__.bound.top + dy));
    this.addStyle({
        top: newY + 'px',
        left: newX + 'px'
    });

};

OnScreenWindow.eventHandler.endDragHeaderbar = function (event) {
    this.$headerbar.off('drag', this.eventHandler.dragHeaderbar);
    this.$headerbar.off('enddrag', this.eventHandler.endDragHeaderbar);
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



Acore.install('OnScreenWindow'.toLowerCase(), OnScreenWindow);