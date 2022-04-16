import '../css/kvcommentitem.css';
import ACore, { _, $ } from "../ACore";
import { formatDateTime } from "absol/src/Time/datetime";
import ContextCaptor from "./ContextMenu";
import { cleanMenuItemProperty } from "./utils";

/***
 * @extends AElement
 * @constructor
 */
function KVCommentItem() {
    this._time = new Date();
    this._text = '';
    this.$text = $('.kv-comment-item-text', this);
    this.$time = $('.kv-comment-item-time', this);
    this.$avatar = $('.kv-comment-avatar', this);
    this.quickmenu = null;
    this.on('contextmenu', this.eventHandler.kv_contextmenu)
    ContextCaptor.auto();
}

KVCommentItem.tag = 'KVCommentItem'.toLowerCase();


KVCommentItem.render = function () {
    return _({
        extendEvent:'contextmenu',
        class: "kv-comment-item",
        child: [
            {
                class: "kv-comment-avatar-ctn",
                child: {
                    class: 'kv-comment-avatar',
                    style: {
                        backgroundImage: 'url(https://raw.githubusercontent.com/duthienkt/absol/master/logo.svg?sanitize=true)'
                    }
                }
            },
            {
                class: "kv-comment-item-content",
                child: [
                    {
                        class: 'kv-comment-item-text',
                        child: { text: '' }
                    },
                    {
                        class: 'kv-comment-item-time',
                        child: { text: formatDateTime(new Date(), 'dd/MM/yyyy HH:mm') }
                    }
                ]
            },
            {
                class: "kv-comment-item-flag-ctn",
                child: ['.kv-comment-item-flag-unread']

            }
        ]
    });
}


KVCommentItem.property = {};


KVCommentItem.property.text = {
    set: function (value) {
        value = value || '';
        if (typeof value === 'string')
            this.$text.innerHTML = value;
        else if (absol.Dom.isDomNode(value)) {
            this.$text.clearChild().addChild(value);
        }
        else {
            this.$text.clearChild().addChild(_(value));
        }
        this._text = value;
    },
    get: function () {
        return this._text;
    }
}

KVCommentItem.property.unread = {
    set: function (value) {
        if (value) {
            this.addClass('as-unread');
        }
        else {
            this.removeClass('as-unread');
        }
    },
    get: function () {
        return this.hasClass('as-unread');
    }
};

KVCommentItem.property.time = {
    set: function (value) {
        this._time = value;
        var text = '';
        if (typeof value === 'string') text = value;
        else if (value instanceof Date){
            text = formatDateTime(value, 'dd/MM/yyyy HH:mm')
        }
        this.$time.firstChild.data =  text;
    },
    get: function () {
        return this._time;
    }
};

KVCommentItem.property.avatar = {
    set: function (value){
        value = value ||'https://raw.githubusercontent.com/duthienkt/absol/master/logo.svg?sanitize=true';
        this._avatar = value;
        this.$avatar.addStyle('backgroundImage','url('+value+')')

    },
    get: function (){
       return  this._avatar;
    }
};

/***
 * @memberOf KVCommentItem#
 * @type {{}}
 */
KVCommentItem.eventHandler = {};


/***
 * @this KVCommentItem
 * @param event
 */
KVCommentItem.eventHandler.kv_contextmenu = function (event){
    if (this.quickmenu){
        event.showContextMenu(this.quickmenu.props,  function (event){
            var menuItem =  cleanMenuItemProperty(event.menuItem);
            if (this.quickmenu.onSelect){
                this.quickmenu.onSelect.call(this, menuItem);
            }
        }.bind(this))
    }
};

ACore.install(KVCommentItem);

export default KVCommentItem;