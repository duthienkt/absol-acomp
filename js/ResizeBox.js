import '../css/resizebox.css';
import ACore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Hanger from "./Hanger";


var _ = ACore._;
var $ = ACore.$;

/***
 * @extends Hanger
 * @constructor
 */
function ResizeBox() {
    this.on({
        draginit: this.eventHandler.rbDragInit,
        dragdeinit: this.eventHandler.rbDragDeinit
    });
    this.hangon = 3;
    this._mousedownEventData = undefined;
    this._mousemoveEventData = undefined;
    this._lastClickTime = 0;
}

ResizeBox.tag = 'ResizeBox'.toLowerCase();

ResizeBox.render = function () {
    return _({
        tag: Hanger.tag,
        class: 'as-resize-box',
        extendEvent: ['beginmove', 'endmove', 'moving', 'click', 'dblclick'],//override click event
        child: {
            class: 'as-resize-box-body',
            child: [
                '.as-resize-box-dot.left-top',
                '.as-resize-box-dot.top',
                '.as-resize-box-dot.right-top',
                '.as-resize-box-dot.right',
                '.as-resize-box-dot.right-bottom',
                '.as-resize-box-dot.bottom',
                '.as-resize-box-dot.left-bottom',
                '.as-resize-box-dot.left'
            ]
        }

    });
};

ResizeBox.eventHandler = {};

ResizeBox.eventHandler.rbDragInit = function (event) {
    var target = event.target;
    if (!target.attr) return;
    if (!target.hasClass('as-resize-box-dot') && !target.hasClass('as-resize-box-body')) return;
    var optionNames = event.target.attr('class').match(/body|left|top|right|bottom/g);
    if (optionNames.length === 0) return;
    this._mouseOptionNames = optionNames;
    this._mouseOptionDict = this._mouseOptionNames.reduce((ac, cr) => {
        ac[cr] = true;
        return ac
    }, {});
    this.on({
        drag: this.eventHandler.rbDrag,
        dragend: this.eventHandler.rbDragEnd,
        dragstart: this.eventHandler.rbDragStart
    });
    this._dragged = false;
};

ResizeBox.eventHandler.rbDragDeinit = function (event) {
    this.off({
        drag: this.eventHandler.rbDrag,
        dragend: this.eventHandler.rbDragEnd,
        dragstart: this.eventHandler.rbDragStart
    });
    var now = new Date().getTime();
    if (!this._dragged) {
        if (now - this._lastClickTime < 400) {
            this.emit('dblclick', Object.assign({}, event, { type: 'dblclick' }), this);
            this._lastClickTime = 0;
        }
        else {
            this.emit('click', Object.assign({}, event, { type: 'click' }), this);
            this._lastClickTime = now;
        }
    }
};


ResizeBox.eventHandler.rbDrag = function (event) {
    if (this._mousedownEventData.option.body && !this.canMove) return;
    this._dragged = true;
    event.preventDefault();
    this._mousemoveEventData = {
        clientX: event.clientX,
        clientY: event.clientY,
        clientX0: this._mousedownEventData.clientX,
        clientY0: this._mousedownEventData.clientY,
        clientDX: event.clientX - this._mousedownEventData.clientX,
        clientDY: event.clientY - this._mousedownEventData.clientY,
        target: this,
        originEvent: event,
        option: this._mousedownEventData.option,
        type: 'moving',
        begin: true
    };

    this.emit('moving', this._mousemoveEventData, this);

};


ResizeBox.eventHandler.rbDragStart = function (event) {
    event.preventDefault();
    this._optionNames = event.target.attr('class').match(/body|left|top|right|bottom/g);
    this._dragged = true;
    $(document.body)
        .addClass('as-resize-box-overiding')
        .addClass(this._optionNames.join('-'));
    var option = this._optionNames.reduce(function (ac, key) {
        ac[key] = true;
        return ac;
    }, {});
    this._mousedownEventData = {
        clientX: event.clientX,
        clientY: event.clientY,
        target: this,
        originEvent: event,
        prevented: false,
        preventDefault: function () {
            this.prevented = true;
        },
        option: option,
        begin: false,
        type: 'beginmove'
    };

    this.emit('beginmove', this._mousefinishEventData, this);

};


ResizeBox.eventHandler.rbDragEnd = function (event) {
    document.body.classList.remove('as-resize-box-overiding')
    document.body.classList.remove(this._optionNames.join('-'));
    this._mousefinishEventData = {
        clientX: event.clientX,
        clientY: event.clientY,
        clientX0: this._mousedownEventData.clientX,
        clientY0: this._mousedownEventData.clientY,
        clientDX: event.clientX - this._mousedownEventData.clientX,
        clientDY: event.clientY - this._mousedownEventData.clientY,
        target: this,
        originEvent: event,
        option: this._mousedownEventData.option,
        type: 'endmove'
    };
    this.emit('endmove', this._mousefinishEventData, this);
};




ResizeBox.property = {};

ResizeBox.property.canMove = {
    set: function (value) {
        if (value) {
            this.addClass('as-can-move');
        }
        else {
            this.removeClass('as-can-move');
        }
    },
    get: function () {
        return this.hasClass('as-can-move');
    }
};

ResizeBox.property.canResize = {
    set: function (value) {
        if (value) {
            this.addClass('as-can-resize');
        }
        else {
            this.removeClass('as-can-resize');
        }
    },
    get: function () {
        return this.hasClass('as-can-resize');
    }
};

ResizeBox.property.canClick = {
    set: function (value) {
        if (value) {
            this.addClass('as-can-click');
        }
        else {
            this.removeClass('as-can-click');
        }
    },
    get: function () {
        return this.hasClass('as-can-click');
    }
};

ACore.install(ResizeBox);


export default ResizeBox;