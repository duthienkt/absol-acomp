import ACore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";


var _ = ACore._;
var $ = ACore.$;

export function ContextCaptor() {
    this.attachedElt = null;
    this.$textarea = $('textarea', this)
        .on('contextmenu', this.eventHandler.contextmenu, true);
    this._ss = 0;
    this.mousedownEvent = null;
    this.sync = Promise.resolve();
};

ContextCaptor.prototype.attachTo = function (elt) {
    if (this.attachedElt) {
        this.attachedElt.removeEventListener('mousedown', this.eventHandler.mousedown);
        this.attachedElt = null;
    }
    this.attachedElt = elt;
    if (this.attachedElt) {
        this.attachedElt.addEventListener('mousedown', this.eventHandler.mousedown);
    }
    return this;
};


ContextCaptor.render = function () {
    return _({
        class: 'absol-context-menu-anchor',
        extendEvent: 'requestcontextmenu',
        child: [
            'textarea'
        ]
    });
}

ContextCaptor.prototype.showContextMenu = function (x, y, props, onSelectItems, onCancel) {
    var self = this;
    var anchor = _('.absol-context-menu-anchor').addTo(document.body);
    var finish = function () {
        (document.body).off('click', finish);
        self.off('requestcontextmenu', finish);
        setTimeout(function () {
            anchor.selfRemove();
        }, 10);
    };
    var vmenu = _({
        tag: 'vmenu',
        props: props,
        on: {
            press: onSelectItems || function () { }
        }
    }).addTo(anchor);
    setTimeout(function () {
        var screenSize = Dom.getScreenSize();
        var menuBound = vmenu.getBoundingClientRect();
        if (x + menuBound.width > screenSize.width - 17) {
            x -= menuBound.width;
        }
        if (y + menuBound.height > screenSize.height - 17) {
            y -= menuBound.height;
        }

        anchor.addStyle({
            left: x + 'px',
            top: y + 'px'
        });
        anchor.addClass('absol-active');
    }, 30);

    (document.body).on('click', finish);
    this.on('requestcontextmenu', finish);
};


/**
 * @type {ContextCaptor}
 */
ContextCaptor.eventHandler = {};
ContextCaptor.eventHandler.mousedown = function (event) {
    if (EventEmitter.isMouseRight(event)) {
        var current = event.target;
        var needHandle = false;
        while (current && !needHandle) {
            if (current.isSupportedEvent && current.isSupportedEvent('contextmenu'))
                needHandle = true;
            current = current.parentElement;
        }
        if (needHandle) {
            this._ss++;
            this.$target = event.target;
            this.mousedownEvent = event;
            this.addStyle({
                left: event.clientX - 10 + 'px',
                top: event.clientY - 10 + 'px'
            });
            this.addClass('absol-active');
            $(document.body).on('mousemove', this.eventHandler.mousemove)
                .on('mouseup', this.eventHandler.mousefinish)
                .on('mouseleave', this.eventHandler.mousefinish);
        }
    }
};

ContextCaptor.eventHandler.mousemove = function () {
    this.addStyle({
        left: event.clientX - 10 + 'px',
        top: event.clientY - 10 + 'px'
    });
};


ContextCaptor.eventHandler.mousefinish = function () {
    $(document.body).off('mousemove', this.eventHandler.mousemove)
        .off('mouseup', this.eventHandler.mousefinish)
        .off('mouseleave', this.eventHandler.mousefinish);
    var ss = this._ss;
    var self = this;
    setTimeout(function () {
        if (self._ss == ss)
            self.removeClass('absol-active');
    }, 30);
    //todo
};

ContextCaptor.eventHandler.contextmenu = function (event) {
    this.emit('requestcontextmenu', event, this);
    var self = this;
    event.preventDefault();

    var propagation = true;
    var localEvent = {
        clientX: event.clientX,
        clientY: event.clientY,
        target: this.$target,
        showContextMenu: function (props, onSelectItems) {
            self.sync = self.sync.then(function () {
                return new Promise(function (rs) {
                    setTimeout(function () {
                        self.showContextMenu(event.clientX, event.clientY, props, onSelectItems);
                        rs();
                    }, 30)
                });
            })
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


ContextCaptor.auto = function () {
    if (ContextCaptor.$elt) return;
    ContextCaptor.$elt = _('contextcaptor');
    Dom.documentReady.then(function () {
        ContextCaptor.$elt.addTo(document.body); 
        ContextCaptor.$elt.attachTo(document.body);
    });
};

ACore.install('contextcaptor', ContextCaptor);

export default ContextCaptor;