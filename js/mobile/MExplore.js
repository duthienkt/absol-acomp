import ACore, { _, $ } from "../../ACore";
import '../../css/mobileapp.css';


var makeTextToNode = (data, pElt) => {
    var node;
    if (typeof data === "string") {
        node = _({ text: data });
    }
    else if (data instanceof Array) {
        data.forEach(it => makeTextToNode(it, pElt));
    }
    if (node)
        pElt.addChild(node);
}

var makeIconToNode = (data, pElt) => {
    var node;
    if (data) node = _(data);
    if (node) pElt.addChild(node);
}

export function MExploreSectionBreak() {
    this._name = '';
    this.$name = $('.am-explore-section-break-name', this);
}

MExploreSectionBreak.tag = 'MExploreSectionBreak'.toLowerCase();

MExploreSectionBreak.render = function () {
    return _({
        class: 'am-explore-section-break',
        child: [
            {
                class: 'am-explore-section-break-name',
            },
            '.am-explore-section-break-line'
        ]
    });
};

MExploreSectionBreak.property = {};

MExploreSectionBreak.property.name = {
    set: function (value) {
        if (value === null || value === undefined) value = '';
        this._name = value;
        this.$name.clearChild();
        makeTextToNode(value, this.$name);

    },
    get: function () {
        return this._name;
    }
};


export function MExploreItemBlock() {
    this.$name = $('.am-explore-item-block-name', this);
    this._name = '';
    this._icon = null;
    this.$icon = $('.am-explore-item-block-icon', this);
    this.$name = $('.am-explore-item-block-name', this);

    /**
     * @name name
     * @type {string}
     * @memberof MExploreItemBlock#
     */

    /**
     * @name icon
     * @memberof MExploreItemBlock#
     */
}


MExploreItemBlock.tag = 'MExploreItemBlock'.toLowerCase();

MExploreItemBlock.render = function () {
    return _({
        class: 'am-explore-item-block',
        child: [
            {
                class: 'am-explore-item-block-icon'
            },
            {
                class: 'am-explore-item-block-name'
            }
        ]
    });
};

MExploreItemBlock.property = {};

MExploreItemBlock.property.icon = {
    set: function (value) {
        value = value || null;
        makeIconToNode(value, this.$icon)
    },
    get: function () {
        return this._icon;
    }
};

MExploreItemBlock.property.name = {
    set: function (value) {
        if (value === null || value === undefined) value = '';
        makeTextToNode(value, this.$name);
    },
    get: function () {
        return this._name;
    }
};

MExploreItemBlock.property.hidden  = {
    set: function (value) {
        if (value) {
            this.addClass('as-hidden');
        }
        else {
            this.removeClass('as-hidden');
        }
    },
    get: function () {
        return this.hasClass('as-hidden');
    }
}


export function MExploreItemList() {

}

MExploreItemList.tag = 'MExploreItemList'.toLowerCase();


MExploreItemList.render = function () {

}

/**
 * @extends AElement
 * @constructor
 */
export function MExploreGroup() {
    this.$br = $(MExploreSectionBreak.tag, this);
    this._items = [];
    this.$items = [];

    /**
     * @name items
     * @type {[]}
     * @memberof MExploreGroup#
     */
}


MExploreGroup.tag = 'MExploreGroup'.toLowerCase();


MExploreGroup.render = function () {
    return _({
        class: 'am-explore-group',
        extendEvent: ['press'],
        child: [
            {
                tag: MExploreSectionBreak
            }
        ]
    });
};


MExploreGroup.property = {};
MExploreGroup.property.name = {
    set: function (value) {
        value = value ||'';
        this.$br.name = value;
        if (value) {
            this.$br.removeStyle('display');
        }
        else {
            this.$br.addStyle('display', 'none');
        }
    },
    get: function () {
        return this.$br.name;
    }
};

MExploreGroup.property.items = {
    set: function (items) {
        if (!items || !items.slice || !items.map) items = [];
        items = items.slice();
        this._items = items;
        while (this.$items.length) {
            this.$items.pop().selfRemove();
        }
        this.$items = items.map(it => {
            var elt = _({
                tag: MExploreItemBlock,
                props: {
                    data: it,
                    name: it.name,
                    icon: it.icon,
                    hidden: !!it.hidden
                },
                on: {
                    click: event => {
                        this.emit('press', {
                            type: 'press',
                            target: elt,
                            itemData: it,
                            originalEvent: event,
                            itemElt: elt
                        }, this);
                    }
                }
            });
            return elt;
        });
        this.addChild(this.$items);
    },
    get: function () {
        return this._items;
    }
}


export function MSpringboardMenu() {
    this.$groups = [];
}

MSpringboardMenu.tag = 'MSpringboardMenu'.toLowerCase();

MSpringboardMenu.render = function () {
    return _({
        class: 'am-springboard-menu',
        extendEvent: ['press']
    });
};


MSpringboardMenu.property = {};

MSpringboardMenu.property.groups = {
    set: function (groups) {
        if (!(groups instanceof Array)) groups = [];
        this.$groups.forEach(elt => elt.selfRemove());
        this.$groups = groups.map(group => {
            var elt = _({
                tag: MExploreGroup,
                props: {
                    data: group,
                    name: group.name,
                    items: group.items || []
                },
                on: {
                    press: (event) => {
                        this.emit('press', Object.assign({ groupElt: elt, groupData: group }, event), this);
                    }
                }
            });
            return elt;
        });
        this.addChild(this.$groups);
    },
    get: function () {
        return this.$groups.map(gr => gr.data);
    }
};
