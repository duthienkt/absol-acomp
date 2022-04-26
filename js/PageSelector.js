import '../css/pageselector.css';
import ACore from "../ACore";


var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function PageSelector() {
    this.$pageCount = $('.absol-page-count', this);
    this.$pageInput = $('.absol-page-number-input input', this);
    this.$pageInput.on('keyup', this.eventHandler.pressEnterKey);
    this.$prevBtn = $('li.page-previous', this);
    this.$nextBtn = $('li.page-next', this);
    this.$firstBtn = $('li.page-first', this);
    this.$lastBtn = $('li.page-last', this);
    this.$nextBtn.on('click', this.eventHandler.clickNext);
    this.$prevBtn.on('click', this.eventHandler.clickPrev);
    this.$firstBtn.on('click', this.eventHandler.clickFirst);
    this.$lastBtn.on('click', this.eventHandler.clickLast);
    this.$buttonContainer = $('.absol-page-number-buttons', this);
    this._buttons = [];
    this._pageOffset = 1;
    this._selectedIndex = 1;
    this._pageCount = 1;
    this._pageRange = 1;
    this.$pageInput.value = this._selectedIndex;
}

PageSelector.tag = 'PageSelector'.toLowerCase();

PageSelector.render = function () {
    return _({
        class: ['absol-page-selector'],
        extendEvent: ['change'],
        child:
            [
                {
                    class: 'absol-page-number-input',
                    child: [{
                        tag: 'label',
                        child: { text: "Page" }
                    },
                        {
                            tag: 'input',
                            attr: {
                                type: 'text'
                            }
                        },
                        {
                            tag: 'span', child: { text: '/ ' }
                        },
                        {
                            tag: 'span',
                            class: 'absol-page-count',
                            child: { text: '1' }
                        }
                    ]
                },

                {
                    tag: 'ul',
                    class: 'absol-page-number-buttons',
                    child: [
                        {
                            tag: 'li',
                            class: "page-first",
                            attr: { title: 'First' },
                            child: 'a.mdi.mdi-chevron-double-left'
                        },
                        {
                            tag: 'li',
                            attr: { title: 'Previous' },
                            class: 'page-previous',
                            child: 'a.mdi.mdi-chevron-left'
                        },
                        {
                            tag: 'li',
                            attr: { title: 'Next' },
                            class: 'page-next',
                            child: 'a.mdi.mdi-chevron-right'
                        },
                        {
                            tag: 'li',
                            attr: { title: 'Last' },
                            class: 'page-last',
                            child: 'a.mdi.mdi-chevron-double-right'
                        }
                    ]
                }
            ]
    });
}


PageSelector.eventHandler = {};

PageSelector.eventHandler.pressEnterKey = function (event) {
    if (event.keyCode != 13) return;
    var index = parseInt(this.$pageInput.value.trim(), 10);
    if ((index < 1) || (index > this._pageCount)) {
        this.$pageInput.value = this._selectedIndex;
        return;
    }
    this.selectPage(index, true);
}

PageSelector.eventHandler.clickLast = function (event) {
    this.selectPage(this._pageCount, true);
};

PageSelector.eventHandler.clickFirst = function (event) {
    this.selectPage(1, true);
};

PageSelector.eventHandler.clickNext = function (event) {
    if (this._selectedIndex == this._pageCount) return;
    this.selectPage(this._selectedIndex + 1, true);
};

PageSelector.eventHandler.clickPrev = function (event) {
    if (this._selectedIndex == 1) return;
    this.selectPage(this._selectedIndex - 1, true);
}


PageSelector.eventHandler.clickIndex = function (index, event) {
    this.selectPage(index + this._pageOffset, true);
};

PageSelector.prototype._createButton = function (index) {
    var button = _({
        tag: 'li',
        class: 'absol-page-number',
        child: {
            tag: 'a',
            attr: { 'data-index': index },
            child: { text: '' + index }
        },
        on: {
            click: PageSelector.eventHandler.clickIndex.bind(this, index)
        }
    });
    this.$buttonContainer.addChildBefore(button, this.$nextBtn);
    return button;
};

PageSelector.prototype.setPageRange = function (pageCount) {
    this._pageRange = pageCount;
    while (this._buttons.length < pageCount) {
        this._buttons.push(this._createButton(this._buttons.length));

    }
    while (this._buttons.length > pageCount) {
        this._buttons.pop().remove();
    }
};

PageSelector.prototype.setStartPage = function (index) {
    this._buttons.forEach(function (e, i) {
        e.childNodes[0].innerHTML = i + index + '';
    });
    this._pageOffset = index;
};

PageSelector.prototype.selectPage = function (index, userActive) {
    if (index == this._selectedIndex) this.setStartPage(index - parseInt(this._pageRange / 2));
    if (index > this._selectedIndex) {
        if (index == (this._pageOffset + this._pageRange - 1)) this.setStartPage(index - parseInt(this._pageRange / 2));
    }
    if (index < this._selectedIndex) {
        if (index == this._pageOffset) this.setStartPage(index - parseInt(this._pageRange / 2));
    }

    if (index > (this._pageCount - parseInt(this._pageRange / 2))) this.setStartPage(this._pageCount - this._pageRange + 1);
    if (index <= (parseInt(this._pageRange / 2))) this.setStartPage(1);

    var pageOffset = this._pageOffset;
    this._buttons.forEach(function (e, i) {
        if (i + pageOffset == index) {
            e.addClass('active');
        }
        else {
            e.removeClass('active');
        }
    });
    if (this._selectedIndex != index) {
        this._selectedIndex = index;
        this.$pageInput.value = index;
        this.emit('change', { target: this, selectedIndex: index, userActive: !!userActive }, this);
    }
};

PageSelector.prototype.getSelectedPage = function () {
    return this._selectedIndex;
}

PageSelector.prototype.setPageCount = function (count) {
    this._pageCount = count;
    this.$pageCount.firstChild.data = '' + count;
};

PageSelector.property = {};

PageSelector.property.selectedIndex = {
    set: function (value) {
        this.selectPage(value, false);
    },
    get: function () {
        return this._selectedIndex;
    }
};

PageSelector.property.pageCount = {
    set: function (value) {
        this.setPageCount(value);
    },
    get: function () {
        return this._pageCount;
    }
};

PageSelector.property.pageOffset = {
    set: function (value) {
        this.setStartPage(value);
    },
    get: function () {
        return this._pageOffset;
    }
};

PageSelector.property.pageRange = {
    set: function (value) {
        this.setPageRange(value);
    },
    get: function () {
        return this._pageRange;
    }
}


PageSelector.prototype.init = function (props) {
    props = props || {};
    props.pageOffset = props.pageOffset || 1;
    props.pageRange = props.pageRange || 5;
    props.pageCount = props.pageCount || 15;
    props.selectedIndex = typeof (props.selectedIndex) == "number" ? props.selectedIndex : props.pageOffset;
    if (props.pageCount < props.pageRange) props.pageRange = props.pageCount;
    this.setPageCount(props.pageCount);
    this.setPageRange(props.pageRange);
    this.setStartPage(props.pageOffset);
    this.selectPage(props.selectedIndex);
    props = Object.assign({}, props);
    delete props.pageOffset;
    delete props.pageRange;
    delete props.pageCount;
    delete props.selectedIndex;
};


ACore.install(PageSelector);

export default PageSelector;