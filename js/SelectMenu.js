import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch, wordsMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import Dom from "absol/src/HTML5/Dom";

/*global absol*/
var _ = Acore._;
var $ = Acore.$;


Acore.creator['dropdown-ico'] = function () {
    return _([
        '<svg class="dropdown" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<g transform="translate(0,-197)">',
        '<path d="m6.3152 218.09a4.5283 4.5283 0 0 0-3.5673 7.3141l43.361 55.641a4.5283 4.5283 0 0 0 7.1421 7e-3l43.496-55.641a4.5283 4.5283 0 0 0-3.5673-7.3216z" />',
        '</g>',
        '</svg>'
    ].join(''));
};


function SelectMenu() {
    var res = _({
        class: ['absol-selectmenu'],
        extendEvent: ['change', 'minwidthchange'],
        attr: {
            tabindex: '1'
        },
        child: [
            '.absol-selectmenu-holder-item',
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, SelectMenu.eventHandler);

    res.$holderItem = $('.absol-selectmenu-holder-item', res);


    res.$anchorCtn = SelectMenu.getAnchorCtn();
    res.$anchor = _('.absol-selectmenu-anchor.absol-disabled').addTo(res.$anchorCtn);
    res.$anchorContentCtn = _('.absol-selectmenu-anchor-content-container').addTo(res.$anchor);

    res.$dropdownBox = _('.absol-selectmenu-dropdown-box').addTo(res.$anchorContentCtn);
    res.$searchTextInput = _('searchtextinput').addStyle('display', 'none').addTo(res.$dropdownBox);
    res.$vscroller = _('bscroller').addTo(res.$dropdownBox);
    res.$selectlist = _('selectlist', res).addTo(res.$vscroller);

    res.$scrollTrackElts = [];



    res.$searchTextInput.on('stoptyping', res.eventHandler.searchModify);
    res._searchCache = {};
    res.$selectlist.on('change', res.eventHandler.selectlistChange, true);
    res.$selectlist.on('pressitem', function () {
        res.isFocus = false;
    }, true);


    res.on('mousedown', res.eventHandler.click, true);
    res.on('blur', res.eventHandler.blur);

    OOP.drillProperty(res, res.$selectlist, 'selectedIndex');

    res.selectListBound = { height: 0, width: 0 };
    res.$attachhook = $('attachhook', res)
        .on('error', res.eventHandler.attached);

    res.sync = new Promise(function (rs) {
        $('attachhook', res).once('error', function () {
            rs();
        });
    });

    return res;
};


// //will remove after SelectMenu completed
SelectMenu.getRenderSpace = function () {
    if (!SelectMenu.getRenderSpace.warned) {
        console.warn('SelectMenu.getRenderSpace() will be removed in next version');
    }
    SelectMenu.getRenderSpace.warned = true;
    if (!SelectMenu.$renderSpace) {
        SelectMenu.$renderSpace = _('.absol-selectmenu-render-space')
            .addTo(document.body);
    };
    return SelectMenu.$renderSpace;
};


SelectMenu.getAnchorCtn = function () {
    if (!SelectMenu.$anchorCtn) {
        SelectMenu.$anchorCtn = _('.absol-selectmenu-anchor-container')
            .addTo(document.body);
    };
    return SelectMenu.$anchorCtn;
};


SelectMenu.EXTRA_MATCH_SCORE = 2;
SelectMenu.UNCASE_MATCH_SCORE = 1;
SelectMenu.UVN_MATCH_SCORE = 3;
SelectMenu.EQUAL_MATCH_SCORE = 4;
SelectMenu.WORD_MATCH_SCORE = 3;


SelectMenu.prepareItem = function (item) {
    if (typeof item == 'string') item = { text: item, value: item };
    var spliter = /\s+/;

    item.__text__ = item.text.replace(/([\s\b\-()\[\]]|&#8239;|&nbsp;|&#xA0;|\s)+/g, ' ').trim();
    item.__words__ = item.__text__.split(spliter);

    item.__textNoneCase__ = item.__text__.toLowerCase();
    item.__wordsNoneCase__ = item.__textNoneCase__.split(spliter);


    item.__nvnText__ = nonAccentVietnamese(item.__text__);
    item.__nvnWords__ = item.__nvnText__.split(spliter);

    item.__nvnTextNoneCase__ = item.__nvnText__.toLowerCase();
    item.__nvnWordsNoneCase__ = item.__nvnTextNoneCase__.split(spliter);
    return item;
};


/**
 * @param {SearchItem} queryItem
 * @param {SearchItem} item
 */
SelectMenu.calScore = function (queryItem, item) {
    var score = 0;

    if (item.__text__ == queryItem.__text__)
        score += SelectMenu.EQUAL_MATCH_SCORE * queryItem.__text__.length;

    var extraIndex = item.__text__.indexOf(queryItem.__text__);

    if (extraIndex >= 0) {
        score += SelectMenu.EXTRA_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__textNoneCase__.indexOf(queryItem.__textNoneCase__);
    if (extraIndex >= 0) {
        score += SelectMenu.UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__nvnTextNoneCase__.indexOf(queryItem.__nvnTextNoneCase__);
    if (extraIndex >= 0) {
        score += SelectMenu.UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    score += wordsMatch(queryItem.__nvnWordsNoneCase__, item.__nvnWordsNoneCase__) / (queryItem.__nvnWordsNoneCase__.length + 1 + item.__nvnWordsNoneCase__.length) * 2 * SelectMenu.WORD_MATCH_SCORE;
    score += wordsMatch(queryItem.__wordsNoneCase__, item.__wordsNoneCase__) / (queryItem.__wordsNoneCase__.length + 1 + item.__wordsNoneCase__.length) * 2 * SelectMenu.WORD_MATCH_SCORE;
    return score;
};

SelectMenu.prototype.updateItem = function () {
    this.$holderItem.clearChild();
    if (this.$selectlist.$selectedItem) {
        var elt = _({ tag: 'selectlistitem', props: { data: this.$selectlist.$selectedItem.data } }).addTo(this.$holderItem);
        elt.$descCtn.addStyle('width', this.$selectlist._descWidth + 'px');
    }
};



SelectMenu.prototype.init = function (props) {
    props = props || {};
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });

    if (!('value' in props)) {
        if (props.items && props.items.length > 0) props.value = typeof props.items[0] == 'string' ? props.items[0] : props.items[0].value;
    }

    this.super(props);
};

SelectMenu.property = {};
SelectMenu.property.items = {
    set: function (value) {
        this._searchCache = {};
        this._items = value;
        this.$selectlist.items = value || [];
        this.selectListBound = this.$selectlist.getBoundingClientRect();
        this.addStyle('min-width', this.selectListBound.width + 2 + 37 + 'px');
        this.emit('minwidthchange', { target: this, value: this.selectListBound.width + 2 + 37, type: 'minwidthchange' }, this);
        this.updateItem();
    },
    get: function () {
        return this._items || [];
    }
};

SelectMenu.property.value = {
    set: function (value) {
        this.$selectlist.value = value;
        this.updateItem();
    },
    get: function () {
        return this.$selectlist.value;
    }
};


SelectMenu.property.enableSearch = {
    set: function (value) {
        this._enableSearch = !!value;
        if (value) {
            this.$searchTextInput.removeStyle('display');
        }
        else {
            this.$searchTextInput.addStyle('display', 'none');
        }
    },
    get: function () {
        return !!this._enableSearch;
    }
};

SelectMenu.prototype.updateDropdownPostion = function (updateAnchor) {
    if (!this.isFocus) {
        this.$anchorContentCtn
            .removeStyle('left')
            .removeStyle('top');
        return;
    }
    var bound = this.getBoundingClientRect();
    if (!updateAnchor) {
        var outBound = Dom.traceOutBoundingClientRect(this);

        if (!this.isFocus || bound.top > outBound.bottom || bound.bottom < outBound.top) {
            this.isFocus = false;
            return;
        }


        var anchorOutBound = Dom.traceOutBoundingClientRect(this.$anchor);
        var searchBound = this.$searchTextInput.getBoundingClientRect();
        var availableTop = bound.top - anchorOutBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
        var availableBottom = anchorOutBound.bottom - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 20;

        if (this.forceDown || availableBottom >= this.selectListBound.height || availableBottom > availableTop) {
            this.isDropdowUp = false;
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);
            this.$vscroller.addStyle('max-height', availableBottom + 'px');

        }
        else {
            this.isDropdowUp = true;
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
            this.$vscroller.addStyle('max-height', availableTop + 'px');
        }
        this.$dropdownBox.addStyle('min-width', bound.width + 'px');
        this.scrollToSelectedItem();
    }
    var anchorBound = this.$anchor.getBoundingClientRect();
    if (this.isDropdowUp) {
        this.$anchorContentCtn.addStyle({
            left: bound.left - anchorBound.left + 'px',
            top: bound.top - anchorBound.top - this.$dropdownBox.clientHeight - 1 + 'px',
        });
    }
    else {
        this.$anchorContentCtn.addStyle({
            left: bound.left - anchorBound.left + 'px',
            top: bound.bottom - anchorBound.top + 'px',
        });
    }
};

SelectMenu.prototype.scrollToSelectedItem = function () {
    var self = this;
    setTimeout(function () {
        if (self.$selectlist.$selectedItem) {
            self.$vscroller.scrollInto(self.$selectlist.$selectedItem);
        }
    }.bind(this), 30);
};



SelectMenu.prototype.startTrackScroll = function () {
    var trackElt = this.parentElement;
    while (trackElt) {
        if (trackElt.addEventListener) {
            trackElt.addEventListener('scroll', this.eventHandler.scrollParent, false);
            // trackElt.addEventListener('scroll', this.eventHandler.scrollParent, true);

        }
        else {
            trackElt.attachEvent('onscroll', this.eventHandler.scrollParent, false);
            // trackElt.attachEvent('onscroll', this.eventHandler.scrollParent, true);
        }

        this.$scrollTrackElts.push(trackElt);
        trackElt = trackElt.parentElement;
    }
    if (document.addEventListener) {
        document.addEventListener('scroll', this.eventHandler.scrollParent, false);

        document.addEventListener('wheel', this.eventHandler.wheelDocument, true);
    }
    else {
        document.attachEvent('onscroll', this.eventHandler.scrollParent, false);
    }
    this.$scrollTrackElts.push(document);

};

SelectMenu.prototype.stopTrackScroll = function () {
    var trackElt;
    for (var i = 0; i < this.$scrollTrackElts.length; ++i) {
        trackElt = this.$scrollTrackElts[i];
        if (trackElt.removeEventListener) {
            trackElt.removeEventListener('scroll', this.eventHandler.scrollParent, false);
        }
        else {
            trackElt.dettachEvent('onscroll', this.eventHandler.scrollParent, false);

        }
    }
    this.$scrollTrackElts = [];
};

SelectMenu.property.isFocus = {
    set: function (value) {
        var self = this;
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.startTrackScroll();
            this.$anchor.removeClass('absol-disabled');
            var isAttached = false;
            setTimeout(function () {
                if (isAttached) return;
                $('body').on('mousedown', self.eventHandler.bodyClick);
                isAttached = true;
            }, 1000);
            $('body').once('click', function () {
                setTimeout(function () {
                    if (isAttached) return;
                    $('body').on('mousedown', self.eventHandler.bodyClick);
                    isAttached = true;
                }, 10);
            });

            if (this.enableSearch) {
                setTimeout(function () {
                    self.$searchTextInput.focus();
                }, 50);
            }

            this.updateDropdownPostion();

        }
        else {
            this.$anchor.addClass('absol-disabled');
            this.stopTrackScroll();
            $('body').off('mousedown', this.eventHandler.bodyClick);
            setTimeout(function () {
                if (self.$searchTextInput.value != 0) {
                    self.$searchTextInput.value = '';
                    self.$selectlist.items = self.items;
                }
            }, 100)
            this.updateItem();
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};


SelectMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
        }
    },
    get: function () {
        return this.containsClass('disabled');
    }
};


SelectMenu.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('hidden');
        }
        else {
            this.removeClass('hidden');
        }
    },
    get: function () {
        return this.addClass('hidden');
    }
};

SelectMenu.eventHandler = {};

SelectMenu.eventHandler.attached = function () {
    if (this._updateInterval) return;
    if (!this.$anchor.parentNode) this.$anchor.addTo(this.$anchorCtn);
    this.$attachhook.updateSize = this.$attachhook.updateSize || this.updateDropdownPostion.bind(this);
    Dom.addToResizeSystem(this.$attachhook);
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$anchor.selfRemove();
            this.stopTrackScroll();
        }
    }.bind(this), 10000);
};



SelectMenu.eventHandler.scrollParent = function (event) {
    var self = this;
    if (this._scrollFrameout > 0) {
        this._scrollFrameout = 10;
        return;
    }
    this._scrollFrameout = this._scrollFrameout || 10;
    function update() {
        self.updateDropdownPostion(false);
        self._scrollFrameout--;
        if (self._scrollFrameout > 0) requestAnimationFrame(update);
    }
    update();
};

SelectMenu.eventHandler.click = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    this.isFocus = !this.isFocus;
};



SelectMenu.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this, event) && !EventEmitter.hitElement(this.$anchor, event)) {
        setTimeout(function () {
            this.isFocus = false;
        }.bind(this), 5)
    }
};

SelectMenu.eventHandler.selectlistChange = function (event) {
    this.updateItem();
    this.selectMenuValue = this.value;
    if (this._lastValue != this.value) {
        setTimeout(function () {
            this.emit('change', event, this);
        }.bind(this), 1)
        this._lastValue = this.value;
    }
};


SelectMenu.eventHandler.searchModify = function (event) {
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this.$selectlist.items = this.items;
    }
    else {
        var view = [];
        if (!this._searchCache[filterText]) {
            if (filterText.length == 1) {
                view = this.items.map(function (item) {
                    var res = { item: item, text: typeof item === 'string' ? item : item.text };
                    return res;
                }).map(function (it) {
                    it.score = 0;
                    var text = it.text.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
                    it.score += text.toLowerCase().indexOf(filterText.toLowerCase()) >= 0 ? 100 : 0;
                    text = nonAccentVietnamese(text);
                    it.score += text.toLowerCase().indexOf(filterText.toLowerCase()) >= 0 ? 100 : 0;
                    return it;
                });

                view.sort(function (a, b) {
                    if (b.score - a.score == 0) {
                        if (nonAccentVietnamese(b.text) > nonAccentVietnamese(a.text)) return -1;
                        return 1;
                    }
                    return b.score - a.score;
                });
                view = view.filter(function (x) {
                    return x.score > 0;
                })
            }
            else {
                var its = this.items.map(function (item) {
                    var res = { item: item, text: typeof item === 'string' ? item : item.text };
                    var text = res.text.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
                    res.score = (phraseMatch(text, filterText)
                        + phraseMatch(nonAccentVietnamese(text), nonAccentVietnamese(filterText))) / 2;
                    if (nonAccentVietnamese(text).replace(/s/g, '').toLowerCase().indexOf(nonAccentVietnamese(filterText).toLowerCase().replace(/s/g, '')) > -1)
                        res.score = 100;
                    return res;
                });
                if (its.length == 0) return;

                its.sort(function (a, b) {
                    if (b.score - a.score == 0) {
                        if (nonAccentVietnamese(b.text) > nonAccentVietnamese(a.text)) return -1;
                        return 1;
                    }
                    return b.score - a.score;
                });
                var view = its.filter(function (x) {
                    return x.score > 0.5;
                });
                if (view.length == 0) {
                    var bestScore = its[0].score;
                    view = its.filter(function (it) {
                        return it.score + 0.001 >= bestScore;
                    });
                }
                if (view[0].score == 0) view = [];
            }
            view = view.map(function (e) {
                return e.item;
            });
            this._searchCache[filterText] = view;
        }
        else {
            view = this._searchCache[filterText];
        }
        this.$selectlist.items = view;
    }

    this.selectListBound = this.$selectlist.getBoundingClientRect();
    this.updateDropdownPostion(true);
};

Acore.creator.selectmenu = SelectMenu;

export default SelectMenu;