import Acore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";


var _ = Acore._;
var $ = Acore.$;


function ResizeBox() {
    this.on('mousedown', this.eventHandler.mouseDownBody);
    this._mousedownEventData = undefined;
    this._mousemoveEventData = undefined;
}

ResizeBox.render = function () {
    return _({
        class: 'as-resize-box',
        extendEvent: ['beginmove', 'endmove', 'moving', 'click'],//override click event
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

ResizeBox.eventHandler.mouseDownBody = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    event.preventDefault();
    this._optionNames = event.target.attr('class').match(/body|left|top|right|bottom/g);
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

    $(document.body).on('mousemove', this.eventHandler.mouseMoveBody);
    $(document.body)
        .on('mouseup', this.eventHandler.mouseFinishBody)
        .on('mouseleave', this.eventHandler.mouseFinishBody);

};

ResizeBox.eventHandler.mouseMoveBody = function (event) {
    if (this._mousedownEventData.option.body && !this.canMove) return;
    if (this._mousedownEventData && !this._mousedownEventData.begin && !this._mousedownEventData.prevented) {
        this.emit('beginmove', this._mousedownEventData, this);
        if (this._mousedownEventData.prevented) {
            $(document.body).off('mousemove', this.eventHandler.mouseMoveBody);
        }
        else {
            this._mousedownEventData.begin = true;
            $(document.body)
                .addClass('as-resize-box-overiding')
                .addClass(this._optionNames.join('-'));
        }

    }


    if (this._mousedownEventData.begin) {
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
            type: 'moving'
        };

        this.emit('moving', this._mousemoveEventData, this);
    }
};

ResizeBox.eventHandler.mouseFinishBody = function (event) {

    $(document.body).off('mousemove', this.eventHandler.mouseMoveBody)
        .off('mouseup', this.eventHandler.mouseFinishBody)
        .off('mouseleave', this.eventHandler.mouseFinishBody)
        .removeClass('as-resize-box-overiding')
        .removeClass(this._optionNames.join('-'));
    this._optionNames = undefined;

    if (this._mousedownEventData.begin) {
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
    }
    else {
        if (EventEmitter.hitElement(this, event))
            this.emit('click', event, this);
    }
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
        return this.containsClass('as-can-move');
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
        return this.containsClass('as-can-resize');
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
        return this.containsClass('as-can-click');
    }
};

Acore.install('resizebox', ResizeBox);


export default ResizeBox;