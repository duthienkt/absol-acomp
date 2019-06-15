import Acore from "../ACore";
import Draggable from "./Draggable";
import OOP from "absol/src/HTML5/OOP";
import Element from "absol/src/HTML5/Element";

var _ = Acore._;
var $ = Acore.$;

function WidthHeightResizer() {
    var res = _({
        extendEvent: 'sizechange',
        class: 'absol-width-height-resizer',
        child: ['.absol-width-height-resizer-content',
            '.absol-width-height-resizer-anchor-bot-right',
            '.absol-width-height-resizer-anchor-bot-left',
            '.absol-width-height-resizer-anchor-top-right',
            '.absol-width-height-resizer-anchor-top-left'
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, WidthHeightResizer.eventHandler);

    res.$anchorBotRight = $('.absol-width-height-resizer-anchor-bot-right', res);
    res.$anchorTopRight = $('.absol-width-height-resizer-anchor-top-right', res);

    res.$anchorBotLeft = $('.absol-width-height-resizer-anchor-bot-left', res);
    res.$anchorTopLeft = $('.absol-width-height-resizer-anchor-top-left', res);

    res.$content = $('.absol-width-height-resizer-content', res);

    Draggable(res.$anchorBotRight).on('drag', res.eventHandler.dragBotRight).on('predrag', res.eventHandler.preDrag);
    Draggable(res.$anchorTopRight).on('drag', res.eventHandler.dragTopRight).on('predrag', res.eventHandler.preDrag);
    Draggable(res.$anchorBotLeft).on('drag', res.eventHandler.dragBotLeft).on('predrag', res.eventHandler.preDrag);
    Draggable(res.$anchorTopLeft).on('drag', res.eventHandler.dragTopLeft).on('predrag', res.eventHandler.preDrag);
    return res;
}

['addChild', 'addChildBefore', 'addChildAfter', 'clearChild'].forEach(function (key) {
    WidthHeightResizer.prototype[key] = function () {
        return this.$content[key].apply(this.$content, arguments);
    }
})


WidthHeightResizer.eventHandler = {};
WidthHeightResizer.eventHandler.preDrag = function (event) {
    this._whrWidth = parseFloat(this.getComputedStyleValue('width').replace('px', ''));
    this._whrHeight = parseFloat(this.getComputedStyleValue('height').replace('px', ''));

};

WidthHeightResizer.eventHandler.dragBotRight = function (event) {
    var newEvent = { target: this, data: {} };
    if (event.moveDX != 0) {
        this.addStyle('width', this._whrWidth + event.moveDX + 'px');
        newEvent.data.changeWidth = true;
    }
    if (event.moveDY != 0) {
        this.addStyle('height', this._whrHeight + event.moveDY + 'px');
        newEvent.data.changeHeight = true;
    }
    newEvent.data.height = this.getComputedStyleValue('height');
    newEvent.data.width = this.getComputedStyleValue('width');
    this.emit('sizechange', newEvent);
};

WidthHeightResizer.eventHandler.dragTopRight = function (event) {
    var newEvent = { target: this, data: {} };
    if (event.moveDX != 0) {
        this.addStyle('width', this._whrWidth + event.moveDX + 'px');
        newEvent.data.changeWidth = true;
    }
    if (event.moveDY != 0) {
        this.addStyle('height', this._whrHeight - event.moveDY + 'px');
        newEvent.data.changeHeight = true;
    }
    newEvent.data.height = this.getComputedStyleValue('height');
    newEvent.data.width = this.getComputedStyleValue('width');
    this.emit('sizechange', newEvent);
};

WidthHeightResizer.eventHandler.dragBotLeft = function (event) {
    var newEvent = { target: this, data: {} };
    if (event.moveDX != 0) {
        this.addStyle('width', this._whrWidth - event.moveDX + 'px');
        newEvent.data.changeWidth = true;
    }
    if (event.moveDY != 0) {
        this.addStyle('height', this._whrHeight + event.moveDY + 'px');
        newEvent.data.changeHeight = true;
    }
    newEvent.data.height = this.getComputedStyleValue('height');
    newEvent.data.width = this.getComputedStyleValue('width');
    this.emit('sizechange', newEvent);
};

WidthHeightResizer.eventHandler.dragTopLeft = function (event) {
    var newEvent = { target: this, data: {} };
    if (event.moveDX != 0) {
        this.addStyle('width', this._whrWidth - event.moveDX + 'px');
        newEvent.data.changeWidth = true;
    }
    if (event.moveDY != 0) {
        this.addStyle('height', this._whrHeight - event.moveDY + 'px');
        newEvent.data.changeHeight = true;
    }
    newEvent.data.height = this.getComputedStyleValue('height');
    newEvent.data.width = this.getComputedStyleValue('width');
    this.emit('sizechange', newEvent);
};

Acore.creator.widthheightresizer = WidthHeightResizer;

export default WidthHeightResizer;