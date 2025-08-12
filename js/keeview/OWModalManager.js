import { $, _ } from "../../ACore";
import '../../css/keeview/owmodal.css'
import { isDomNode } from "absol/src/HTML5/Dom";
import FlexiconButton from "../FlexiconButton";

function implicitNode(data) {
    if (!data) return _('div');
    if (data instanceof Array) {
        return data.map(implicitNode);
    }
    else if (isDomNode(data)) {
        return data;
    }
    else if (typeof data === "string") {
        return _({ tag: 'span', child: { text: data } });
    }
    else if (typeof data === "object") {
        return _(data);
    }
    else return _('div');
}


/***
 *
 * @constructor
 */
function OWModalManager() {

}

OWModalManager.prototype.getView = function () {
    if (!this.$view) this.createView();
    return this.$view;
};

OWModalManager.prototype.createView = function () {
    this.$view = _('.kv-ow-modal-manager');
};


OWModalManager.prototype.createModal = function (opt, caller) {
    // console.trace(1);
    opt = opt || {};
    var modal = _({
        class: 'kv-ow-modal',
        child: {
            class: 'kv-ow-modal-window',
            child: [
                {
                    class: 'kv-ow-modal-header',
                    child: [
                        {
                            class: 'kv-ow-modal-title',
                            child: { text: 'Tiêu đề' }
                        }
                    ]

                },
                {
                    class: 'kv-ow-modal-body',
                    child: Array(3).fill({
                        tag: 'span',
                        child: { text: 'Bạn có chắc muốn thoát khỏi nhóm? Đây là nội dung hơi bị dài luôn nè' }
                    })
                },
                {
                    class: 'kv-ow-modal-footer'
                }
            ]
        }
    });

    modal.$body = $('.kv-ow-modal-body', modal);
    modal.$title = $('.kv-ow-modal-title', modal);
    modal.$footer = $('.kv-ow-modal-footer', modal);
    if (modal.$title) {
        if (typeof opt.title === "string") {
            modal.$title.clearChild().addChild(_({ text: opt.title }));
        }
        else {
            modal.$title.clearChild().addChild(implicitNode(opt.title));
        }
    }
    else {
        modal.$title.addStyle('display', 'none');
    }
    modal.$body.clearChild();
    if (opt.content || opt.contentbody) {
        modal.$body.addChild(implicitNode(opt.content || opt.contentbody));
    }

    modal.$footer.clearChild();
    if (opt.buttons || opt.buttonlist) {
        modal.$footer.addChild((opt.buttons || opt.buttonlist).map(function (bt) {
            var props = Object.assign({}, bt);
            delete props.onclick;
            var onclick = bt.onclick;
            return _({
                tag: FlexiconButton.tag,
                props: props,
                on: {
                    click: function (event) {
                        if (typeof onclick === "function") {
                            onclick.call(this, event, modal, caller);
                        }
                    }
                }
            })
        }));
    }

    return modal;
};

OWModalManager.prototype.showModal = function (opt, caller) {
    var modal = this.createModal(opt, caller);
    var minZIndex = Array.prototype.reduce.call(this.getView(), function (ac, cr) {
        return Math.max(ac, parseFloat(cr.style.zIndex) || 0)
    }, 0);
    modal.addStyle('zIndex', minZIndex + 1 + '');
    this.$view.addChild(modal);
    return modal;
};


export default OWModalManager;