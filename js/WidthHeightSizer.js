import Acore from "../ACore";
import Draggable from "./Draggable";
import OOP from "absol/src/HTML5/OOP";
import Element from "absol/src/HTML5/Element";

var _ = Acore._;
var $ = Acore.$;

function WidthHeightResizer() {
    var res = _({
        extendEvent:'sizechange',
        class: 'absol-width-height-resizer',
        child: ['.absol-width-height-resizer-content', '.absol-width-height-resizer-anchor', '.absol-width-height-resizer-anchor-top']
    });

    res.eventHandler = OOP.bindFunctions(res, WidthHeightResizer.eventHandler);
    res.$anchor = $('.absol-width-height-resizer-anchor', res);
    res.$anchorTop = $('.absol-width-height-resizer-anchor-top', res);
    res.$content = $('.absol-width-height-resizer-content', res);

    Draggable(res.$anchor).on('drag', res.eventHandler.drag).on('predrag', res.eventHandler.preDrag);

    Draggable(res.$anchorTop).on('drag', res.eventHandler.dragTop).on('predrag', res.eventHandler.preDrag);
    return res;
}

['addChild', 'addChildBefore', 'addChildAfter', 'clearChild'].forEach(function(key){
    WidthHeightResizer.prototype[key] = function(){
        return this.$content[key].apply(this.$content, arguments);
    }
})


WidthHeightResizer.eventHandler = {};
WidthHeightResizer.eventHandler.preDrag = function (event) {
    this._whrWidth = parseFloat(this.getComputedStyleValue('width').replace('px', ''));
    this._whrHeight = parseFloat(this.getComputedStyleValue('height').replace('px', ''));

};

WidthHeightResizer.eventHandler.drag = function (event) {
    var newEvent = {target: this, data:{}};
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

WidthHeightResizer.eventHandler.dragTop = function (event) {
    var newEvent = {target: this, data:{}};
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

Acore.creator.widthheightresizer = WidthHeightResizer;

export default WidthHeightResizer;