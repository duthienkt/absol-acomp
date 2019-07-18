import Acore from "../ACore";


var _ = Acore._;
var $ = Acore.$;

function PageSelector() {
    var res = _({
        class: ['absol-page-selector'],
        extendEvent: ['change'],
        child:
            [
                {
                    class: 'page-number-input',
                    child: [{
                        tag: 'label',
                        child: { text: "Page" }
                    },
                    {
                        tag:'input',
                        attr:{
                            type:'text'
                        }
                    }]
                },

                {
                    tag: 'ul',
                    class: 'page-number-buttons',
                    child: [
                        ` <li class="page-first">
                        <a href="#" aria-controls="dtBasicExample" data-dt-idx="0" tabindex="0" class="page-link">First</a>
                    </li>`,
                        ` <li class="page-previous">
                        <a href="#" aria-controls="dtBasicExample" data-dt-idx="0" tabindex="0" class="page-link">Previous</a>
                    </li>`,

                        `<li class="page-next" >
                        <a href="#" aria-controls="dtBasicExample" data-dt-idx="7" tabindex="0" class="page-link">Next</a>
                    </li>`,
                        ` <li class="page-last">
                        <a href="#" aria-controls="dtBasicExample" data-dt-idx="0" tabindex="0" class="page-link">Last</a>
                    </li>`,
                    ]
                }
            ]
    });



    res.$pageInput = $('.page-number-input input', res);
    res.$pageInput.on('keyup', PageSelector.eventHandler.pressEnterKey.bind(res));
    res.$prevBtn = $('li.page-previous', res);
    res.$nextBtn = $('li.page-next', res);
    res.$firstBtn = $('li.page-first', res);
    res.$lastBtn = $('li.page-last', res);
    res.$nextBtn.on('click', PageSelector.eventHandler.clickNext.bind(res));
    res.$prevBtn.on('click', PageSelector.eventHandler.clickPrev.bind(res));
    res.$firstBtn.on('click', PageSelector.eventHandler.clickFirst.bind(res));
    res.$lastBtn.on('click', PageSelector.eventHandler.clickLast.bind(res));
    res.$buttonContainer = $('.page-number-buttons', res);
    res._buttons = [];
    res._pageOffset = 1;
    res._selectedIndex = 1;
    res._pageCount = 1;
    res._pageRange = 1;
    res.$pageInput.value = res._selectedIndex;

    return res;
};


PageSelector.eventHandler = {};

PageSelector.eventHandler.pressEnterKey = function(event){
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
        class: 'page-number',
        child: {
            tag: 'a',
            attr: { href: '#', 'data-index': index },
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
    if (this._buttons.length > 0) throw new Error("Not implement change pageCount");
    while (this._buttons.length < pageCount) {
        this._buttons.push(this._createButton(this._buttons.length));
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
    if (index > this._selectedIndex){
        if (index == (this._pageOffset + this._pageRange - 1)) this.setStartPage(index - parseInt(this._pageRange / 2));
    }
    if (index < this._selectedIndex){
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
};

PageSelector.property = {};

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
};


Acore.install('pageselector', PageSelector);

export default PageSelector;