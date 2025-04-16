import ACore, { _, $, $$ } from "../ACore";
import Follower from "./Follower";
import SearchTextInput from "./Searcher";
import { getMaterialDesignIconNames } from "./utils";
import { searchListByText } from "./list/search";

/**
 * @extends Follower
 * @constructor
 */
function MDIPicker() {
    this.$searchInput = $(SearchTextInput.tag, this).on('stoptyping', this.eventHandler.searchChange);
    this.cancelWaiting();
    var bodys = $$('.as-mdi-picker-body', this);
    this.$body = bodys[0];
    this.$searchResult = bodys[1];
    this.iconItems = [];
    this.$icons = {};
    getMaterialDesignIconNames().then(iconNames => {
        if (!iconNames) return;
        var row;
        var iconName;
        for (var i = 0; i < iconNames.length; i++) {
            iconName = iconNames[i];
            if (i % 8 === 0)
                row = _('.as-mdi-picker-row').addTo(this.$body);
            this.$icons[iconName] = _({
                tag: 'button',
                class: 'as-transparent-button',
                child: 'span.mdi.mdi-' + iconName,
                attr: {
                    'data-icon': iconName,
                    title: iconName
                }
            }).addTo(row);
            this.iconItems.push({ text: iconName, icon: iconName });

        }
        this.updatePosition()
    });
    this.on('click', this.eventHandler.click);
}

MDIPicker.tag = 'MDIPicker'.toLowerCase();

MDIPicker.render = function () {
    return _({
        tag: Follower,
        class: 'as-mdi-picker',
        extendEvent: 'pick',
        child: [
            {
                tag: SearchTextInput
            },
            {
                class: 'as-mdi-picker-body',
            },
            {
                style: {
                    display: 'none'
                },
                class: 'as-mdi-picker-body',
            }
        ]
    });
};


MDIPicker.prototype.focus = function () {
    this.$searchInput.focus();
};

MDIPicker.eventHandler = {};

/**
 * @this MDIPicker
 */
MDIPicker.eventHandler.searchChange = function () {
    var query = this.$searchInput.value;
    query = query.trim().toLowerCase().replace(/\s+/g, ' ');
    var res, row, i;
    var iconName;
    if (query.length > 0) {
        this.$body.addStyle('display', 'none');
        this.$searchResult.clearChild().removeStyle('display');
        res = searchListByText(query, this.iconItems);
        for (i = 0; i < res.length; i++) {
            iconName = res[i].text;
            if (i % 8 === 0)
                row = _('.as-mdi-picker-row').addTo(this.$searchResult);
             _({
                tag: 'button',
                class: 'as-transparent-button',
                child: 'span.mdi.mdi-' + iconName,
                attr: {
                    'data-icon': iconName,
                    title: iconName
                }
            }).addTo(row);
        }
    }
    else {
        this.$searchResult.addStyle('display', 'none');
        this.$body.removeStyle('display');
    }
};

MDIPicker.eventHandler.click = function (event) {
    var t = event.target;
    while (t) {
        if (t === this) break;
        if (t.hasClass && t.hasClass('as-transparent-button')) {
            this.emit('pick', { icon: t.attr('data-icon') });
        }
        t = t.parentElement;
    }
}


ACore.install(MDIPicker);

export default MDIPicker;
