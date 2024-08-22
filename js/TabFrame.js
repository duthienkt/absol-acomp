import ACore from "../ACore";
import { revokeResource } from "./utils";

var $ = ACore.$;
var _ = ACore._;

/**
 * @extends {AElement}
 * @constructor
 */
function TabFrame() {
    this.on('remove', this._onRemove);
}

TabFrame.tag = 'tabframe';
TabFrame.render = function () {
    return _({
        tag: 'frame',
        class: 'absol-tab-frame',
        extendEvent: ['requestremove', 'remove']
    }, true);
}

TabFrame.property = {};

TabFrame.property.name = {
    set: function (value) {

        if (typeof name == "undefined") {
            this._name = undefined;
        }
        else {
            this._name = value + '';
        }
        if (this.$parent) {
            if (this.$parent.notifyUpdateName)
                this.$parent.notifyUpdateName(this);
        }
    },
    get: function () {
        return this._name;
    }
};


TabFrame.property.modified = {
    set: function (value) {
        this._modified = !!value;
        if (this.$parent) {
            if (this.$parent.notifyUpdateModified)
                this.$parent.notifyUpdateModified(this);
        }
    },
    get: function () {
        return !!this._modified;
    }
};


TabFrame.property.desc = {
    set: function (value) {
        if (typeof value == "undefined") {
            this._desc = undefined;
        }
        else {
            this._desc = value + '';
        }
        if (this.$parent) {
            if (this.$parent.notifyUpdateDesc)
                this.$parent.notifyUpdateDesc(this);
        }

    },
    get: function () {
        return this._desc;
    }
};

TabFrame.property.preventClosing = {
    set: function (value) {
        if (value) {
            this.addClass('as-prevent-closing');
        }
        else {
            this.removeClass('as-prevent-closing');
        }
        if (this.$parent && this.$parent.notifyUpdatePreventClosing) {
            this.$parent.notifyUpdatePreventClosing(this);
        }

    },
    get: function () {
        return this.hasClass('as-prevent-closing');
    }
};

TabFrame.attribute = {};

TabFrame.attribute.name = {
    set: function (value) {
        this.name = value;
    },
    get: function () {
        return this.name;
    },
    remove: function () {
        this.name = undefined;
    }
};


TabFrame.attribute.desc = {
    set: function (value) {
        this.desc = value;
    },
    get: function () {
        return this.desc;
    },
    remove: function () {
        this.desc = undefined;
    }
};

TabFrame.attribute.modified = {
    set: function (value) {
        this.modified = value == 'true' || value == '1' || value === true;
    },
    get: function () {
        return this.modified ? 'true' : undefined;
    },
    remove: function () {
        this.desc = false;
    }
};


TabFrame.prototype.requestRemove = function () {
    if (this.$parent && this.$parent.removeTab) {
        this.$parent.removeTab(this.id, false);
    }
    else {
        this.selfRemove();
    }
};

TabFrame.prototype._onRemove = function () {
    setTimeout(() => {
        if (!this.isDescendantOf(document.body)) {
            this.revokeResource();
        }
    }, 100);
};

TabFrame.prototype.revokeResource = function () {
    this.off('remove', this._onRemove);
    while (this.lastChild) {
        if (location.href.indexOf('localhost') >= 0 || location.href.indexOf('lab.') >= 0)//for testing
            revokeResource(this.lastChild);
        this.lastChild.remove();
    }
};

ACore.install(TabFrame);
export default TabFrame;