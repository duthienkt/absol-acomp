import Acore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

/**
 * If a element want to capture contextmenu event, it extendEvent: 'contextmenu'
 * 
 */
function ContextHook() {
    var res = _({
        tag: 'textarea',
        class: 'absol-context-menu-hook'
    });

    res.eventHandler = OOP.bindFunctions(res, ContextHook.eventHandler);
    res.on('contextmenu', res.eventHandler.contextmenu, true);
    return res;
};

ContextHook.prototype.handle = function (event) {
    if (!this.parentElement) return;
    var isRightMB;
    event = event || window.event;
    var body = $(document.body);

    if ("which" in event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = event.which == 3;
    else if ("button" in event)  // IE, Opera 
        isRightMB = event.button == 2;

    var needHandle = false;
    if (isRightMB) {
        var current = event.target;
        while (current && !needHandle) {
            if (current.isSupportedEvent && current.isSupportedEvent('contextmenu'))
                needHandle = true;
            current = current.parentElement;
        }

        if (needHandle) {
            this.$target = event.target;

            this.addStyle('z-index', '1000000');
            this.removeStyle('display');

            this.moveTo(event);
            body.on('mouseup', this.eventHandler.mousefinish);
            body.on('mouseleave', this.eventHandler.mousefinish);
            body.on('mousemove', this.eventHandler.mousemove);
        }
    }

    return needHandle;
};

ContextHook.prototype.moveTo = function (event) {
    if (!this.parentElement) return;
    var parentBound = this.parentElement.getBoundingClientRect();

    this.addStyle('left', -parentBound.left + event.clientX - 7 + 'px');
    this.addStyle('top', -parentBound.top + event.clientY - 7 + 'px');
}


ContextHook.eventHandler = {};
ContextHook.eventHandler.contextmenu = function (event) {
    this.addStyle('z-index', '-1000');
    event.preventDefault();

    var parentBound = this.parentElement.getBoundingClientRect();
    var propagation = true;

    var localEvent = {
        clientX: event.clientX,
        clientY: event.clientY,
        target: this.$target,
        hinge: this.parentElement,
        relativeX: event.clientX - parentBound.left,
        relativeY: event.clientY - parentBound.top,
        showContextMenu: function (props, onSelectItems) {
            this.hinge.showContextMenu(props, event, onSelectItems);
        },
        stopPropagation: function () {
            propagation = false;
        }
    }

    var current = this.$target;
    while (current && propagation) {
        if (current.isSupportedEvent && current.isSupportedEvent('contextmenu')) {
            current.emit('contextmenu', localEvent, current, this);
        }
        current = current.parentElement;
    }

};


ContextHook.eventHandler.mousemove = function (event) {
    this.moveTo(event);
};

ContextHook.eventHandler.mousefinish = function (event) {
    setTimeout(function () {
        this.addStyle('z-index', '-1000');
        this.addStyle('display', 'none');
    }.bind(this), 1);
    var body = $(document.body);
    body.off('mouseup', this.eventHandler.mousefinish);
    body.off('mouseleave', this.eventHandler.mousefinish);
    body.off('mousemove', this.eventHandler.mousemove);
};


/**
 * Add this element to some thing like body, and when mousedown event was fired, let call `thisElement.handle`
 * every element in event pathlist will fire contextmenu event if supported  
 * */
function ContextCaptor() {

    var res = _({
        extendEvent: 'requestcontextmenu',
        class: 'absol-context-hinge',
        child: ['contexthook', 'vmenu.absol-context-menu']
    });
    res.$contexHook = $('contexthook', res);
    res.$contextMenu = $('vmenu.absol-context-menu', res);
    res._contextMenuSync = Promise.resolve();

    return res;
};

ContextCaptor.prototype.handle = function (event) {
    return this.$contexHook.handle(event);
};

/**
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
ContextCaptor.prototype.attachTo = function (element) {
    if (!this._listener) {
        this._listener = this.handle.bind(this);
    }
    if (this._attachedElement) {
        this._attachedElement.removeEventListener('mousedown', this._listener, true);
        this._attachedElement = undefined;
    }
    this._attachedElement = element;
    if (element) {
        element.addEventListener('mousedown', this._listener, true);
    }
    return this;
};



/**
 * 
 * @param {Object} props vmenu property
 * @param {Event} event for align menu
 */
ContextCaptor.prototype.showContextMenu = function (props, event, onSelectItems) {
    Object.assign(this.$contextMenu, props);
    onSelectItems = onSelectItems || function () { };
    var bound = this.getBoundingClientRect();
    var viewableBound = Dom.traceOutBoundingClientRect(this);
    var left = event.clientX - bound.left;
    var top = event.clientY - bound.top;
    var body = $('body');
    this.emit('requestcontextmenu', EventEmitter.copyEvent(event, { target: this }));
    this._contextMenuSync = this._contextMenuSync.then(function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                this.$contextMenu.addStyle('z-index', '1000');
                this.$contextMenu.addStyle('visibility', 'visible');

                var viewBound = Dom.traceOutBoundingClientRect(this.$contextMenu.parentElement);
                var menuBound = this.$contextMenu.getBoundingClientRect();
                if (menuBound.width + event.clientX > viewBound.right) {
                    this.$contextMenu.addStyle('left', left - menuBound.width + 'px');

                }
                else {
                    this.$contextMenu.addStyle('left', left + 'px');
                }

                if (menuBound.height + event.clientY > viewBound.bottom) {
                    this.$contextMenu.addStyle('top', top - menuBound.height + 'px');
                }
                else {
                    this.$contextMenu.addStyle('top', top + 'px');
                }

                var finishCallback = function (event) {

                    body.off('click', finishCallback);
                    this.off('contextmenu', finishCallback);
                    this.off('requestcontextmenu', finishCallback);
                    this.$contextMenu.off('press', onSelectItems, true);
                    this.$contextMenu.off('press', finishCallback);
                    this.hideContextMenu();
                    resolve();
                }.bind(this);

                var mouseDownEventHandler = function (event) {
                    if (EventEmitter.isMouseRight(event))
                        finishCallback.call(this, event);
                }

                body.on('mousedown', mouseDownEventHandler);
                body.on('click', finishCallback);
                this.on('contextmenu', finishCallback);
                this.on('requestcontextmenu', finishCallback);
                this.$contextMenu.on('press', onSelectItems, true);
                this.$contextMenu.on('press', finishCallback);
            }.bind(this), 50);
        }.bind(this));
    }.bind(this));
};


ContextCaptor.prototype.hideContextMenu = function () {
    this.$contextMenu.addStyle({ 'z-index': ' -1000', top: '0', left: '-1000' });
    this.$contextMenu.removeStyle('visibility');

};

Acore.creator.contextcaptor = ContextCaptor;
Acore.creator.contexthook = ContextHook;
//todo: may be need closeContextMenu