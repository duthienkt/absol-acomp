import '../css/modal.css';
import ACore from "../ACore";
import MessageDialog from "./MessageDialog";

var $ = ACore.$;
var _ = ACore._;

function Modal() {
    this._contentAlign = [];
    this.contentAlign = 'middle center';
    this.$content = $('.as-modal-content', this);
}


Modal.tag = 'modal';
Modal.render = function () {
    return _({ class: 'as-modal', child: '.as-modal-content' });
};

['findChildBefore', 'findChildAfter', 'removeChild', 'clearChild', 'addChild'].forEach(function (key) {
    Modal.prototype[key] = function () {
        this.$content[key].apply(this.$content, arguments);
    }
});

Modal.prototype.getChildren = function () {
    return this.$content.children;
};


Modal.property = {};
Modal.property.show = {
    set: function (value) {
        if (value)
            this.removeClass('as-hidden');
        else
            this.addClass('as-hidden');
    },
    get: function () {
        return !this.hasClass('as-hidden');
    }
};

Modal.property.contentAlign = {
    set: function (value) {
        var thisM = this;
        this._contentAlign.forEach(function (name) {
            thisM.removeClass('as-' + name);
        })
        value = value || '';
        if (typeof value === 'string') {
            this._contentAlign = value.split(/\s+/);
        }
        else if (value instanceof Array) {
            this._contentAlign = value;
        }
        else {
            throw new Error("Invalid contentAlign!");
        }
        var thisM = this;
        this._contentAlign.forEach(function (name) {
            thisM.addClass('as-' + name);
        })
    },
    get: function () {
        return this._contentAlign.join(' ');
    }
}


ACore.install(Modal);

export default Modal;


/**
 *
 * @param {ModalWindow} mw
 * @constructor
 */
function KVModalAdapter(mw) {
    this.mw = mw;
    /**
     *
     * @type {null|number}
     */
    this.index = null;
    /**
     * @type {"init"|"open"|"close"|"hide"}
     */
    this.state = 'init';
}


KVModalAdapter.prototype.open = function () {
    if (this.state !== 'init' && this.state !== 'close') return;
    this.state = 'open';
    var opt = this.mw.opt;
    var kvOpt = {
        title: opt.title,
        bodycontent: opt.content,
    };


    if (opt.actions && opt.actions.length > 0) {
        kvOpt.buttonlist = opt.actions.map((it, i) => {
            if (it.action === 'close') {
                kvOpt.closebutton = i;
            }
            return {
                text: it.text,
                type: it.variant,
                onclick: () => {
                    if (typeof opt.onAction === 'function') {
                        opt.onAction(it);
                    }
                }
            }
        });
    }

    this.index = window.HrModalElement.showWindow(kvOpt);
};

KVModalAdapter.prototype.close = function () {
    if ((this.state === 'open') || (this.state === 'hide')) {
        this.state = 'close';
        window.HrModalElement.close(this.index);
    }
};

KVModalAdapter.prototype.applyVisibility = function (flag) {
    if (flag) {
        if (this.state === 'hide') {
            window.HrModalElement.repaint(this.index);
            this.state = 'open';
        }

    }
    else {
        if (this.state === 'open') {
            window.HrModalElement.hide(this.index);
            this.state = 'hide';
        }
    }
};


/**
 *
 * @param {ModalWindow} mw
 * @constructor
 */
function ASModalAdapter(mw) {
    this.mw = mw;
    this.state = 'init';
}


ASModalAdapter.prototype.open = function () {
    if (this.state !== 'init' && this.state !== 'close') return;
    this.state = 'open';
    var opt = this.mw.opt;
    if (!this.$modal) {
        this.$modal = _({
            tag: 'modal',
            props: {
                contentAlign: ['top', 'center'],
            },
            child: {
                tag: MessageDialog,
                props: {
                    dialogTitle: opt.title || '',
                    content: opt.content || '',
                    dialogActions: opt.actions,
                },
                child: opt.content,
                on: {
                    action: e => {
                        if (typeof opt.onAction === 'function') {
                            opt.onAction(e.action);
                        }
                    }
                }
            }
        });
    }
    this.$modal.addTo(document.body);
    this.zIndex = this.shareInstances.reduce((ac, it) => {
        return Math.max(ac, it.zIndex || 0);
    }, 1e6) + 10;
    this.$modal.addStyle('z-index', this.zIndex);
    this.shareInstances.push(this);
};

ASModalAdapter.prototype.close = function () {
    if (this.state !== 'open' && this.state !== 'hide') return;
    this.state = 'close';
    this.$modal.remove();
    var index = this.shareInstances.indexOf(this);
    if (index >= 0) {
        this.shareInstances.splice(index, 1);
    }
};

ASModalAdapter.prototype.applyVisibility = function (flag) {
    if (flag) {
        if (this.state === 'hide') {
            this.$modal.removeClass('as-hidden');
            this.state = 'open';
        }
    }
    else {
        if (this.state === 'open') {
            this.$modal.addClass('as-hidden');
            this.state = 'hide';
        }
    }
}


ASModalAdapter.prototype.shareInstances = [];

/**
 * @typedef {Object} ModalWindowOptions
 * @property {string} [title] - The title of the modal window.
 * @property {string} [content] - The content of the modal window.
 * @property {function} [onAction] - The content of the modal window.
 */


/**
 * KeeView adapter
 * @param opt
 * @constructor
 */
export function ModalWindow(opt) {
    this.opt = Object.assign({}, opt);
    if (window.HrModalElement) {
        this.adapter = new KVModalAdapter(this);
    }
    else {
        this.adapter = new ASModalAdapter(this);
    }
}


ModalWindow.prototype.open = function () {
    this.adapter.open();
};

ModalWindow.prototype.close = function () {
    this.adapter.close();
};

ModalWindow.prototype.applyVisibility = function (flag) {
    this.adapter.applyVisibility(flag);
};


