import '../css/dynamictable.css';
import { $, _ } from "../ACore";
import { randomIdent } from "absol/src/String/stringGenerate";
import Hanger from "./Hanger";
import { HScrollbar, VScrollbar } from "./Scroller";
import DomSignal from "absol/src/HTML5/DomSignal";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { getScreenSize } from "absol/src/HTML5/Dom";

var execAsync = (commands, whileFunc) => {
    return commands.reduce((ac, act) => {
        if (!whileFunc()) return;
        if (ac && ac.then) {
            return ac.then(act);
        }
        return act();
    }, null);
}

/**
 * @extends AElement
 * @constructor
 */
function EfficientTable() {
    this.layoutCtrl = new ETLayoutController(this);
    this._adapter = null;
    this.table = null;

    /**
     * @name adapter
     * @type {ETAdapter}
     * @memberof EfficientTable#
     */
}


EfficientTable.tag = 'EfficientTable'.toLowerCase();

EfficientTable.render = function (data, domDesc) {
    var width = domDesc.style && domDesc.style.width;
    var classList = ['as-dynamic-table-wrapper'];
    if (width === 'match_parent') {
        classList.push('as-width-match-parent');
    }
    var id = domDesc.id || (domDesc.attr && domDesc.attr.id) || 'no-id-' + randomIdent(10);
    return _({
        id: id,
        extendEvent: ['colresize'],
        class: classList,
        child: [
            {
                tag: Hanger.tag,
                class: 'as-dynamic-table-viewport',
                child: [
                    {
                        class: 'as-dynamic-table-space',
                    },
                    {
                        class: 'as-dynamic-table-fixed-y-ctn'
                    },
                    {
                        class: 'as-dynamic-table-fixed-x-ctn'
                    },
                    {
                        class: 'as-dynamic-table-fixed-xy-ctn'
                    }
                ]
            },
            {
                tag: VScrollbar,
                class: 'as-dynamic-table-vb'
            },
            {
                tag: HScrollbar,
                class: 'as-dynamic-table-hb'
            },
        ]
    });
};


EfficientTable.prototype.requestUpdateSize = function () {
    this.layoutCtrl.requestUpdateSize();
};

EfficientTable.prototype.notifyDataSheetChange = function () {
    if (this.adapter) this.adapter.notifyDataSheetChange();
};

EfficientTable.property = {};

EfficientTable.property.adapter = {
    set: function (value) {
        this._adapter = new ETAdapter(this, value);
        this.table = new ETTable(this, this._adapter.data);
        this.layoutCtrl.$space.addChild(this.table.elt);
        this._adapter.notifyDataSheetChange();
    },
    get: function () {
        return this._adapter;
    }
};

export default EfficientTable;


// ETAdapter.prototype.


/**
 *
 * @param {EfficientTable} elt
 * @constructor
 */
function ETLayoutController(elt) {
    this.elt = elt;
    /***
     *
     * @type {SearchTextInput|null}
     */
    this.$searchInput = null;
    /***
     *
     * @type {AElement}
     */
    this.$table = $('.as-dynamic-table', elt);
    /***
     *
     * @type {AElement}
     */
    this.$thead = $('.as-dynamic-table>thead', this.$table);
    /***
     *
     * @type {AElement}
     */
    this.$tbody = $('.as-dynamic-table>tbody', this.$table);

    this.$filterInputs = [];

    this.$attachhook = _('attachhook').addTo(elt);
    this.domSignal = new DomSignal(_('attachhook').addTo(elt));
    //controller
    this.$space = $('.as-dynamic-table-space', elt);
    this.$fixedYCtn = $('.as-dynamic-table-fixed-y-ctn', elt);
    this.$fixedXCtn = $('.as-dynamic-table-fixed-x-ctn', elt);
    this.$fixedXYCtn = $('.as-dynamic-table-fixed-xy-ctn', elt);
    this.$viewport = $('.as-dynamic-table-viewport', elt);
    this.$hscrollbar = $('.as-dynamic-table-hb', elt);
    this.$vscrollbar = $('.as-dynamic-table-vb', elt);

    this.extendStyle = {};

    // this.$attachhook.requestUpdateSize = this.fixedContentCtrl.updateSize.bind(this.fixedContentCtrl);
    this.$attachhook.requestUpdateSize = this.requestUpdateSize.bind(this);
    this.$attachhook.on('attached', () => {
        ResizeSystem.add(this.$attachhook);
        this.onAttached();
        this.onAttached();
        // manager.add(this);
        setTimeout(() => {
            this.requestUpdateSize();
        }, 10);

    })
}

ETLayoutController.prototype.onAttached = function () {
    if (this.elt.table) {
        this.updateOverflowStatus();
    }
};

ETLayoutController.prototype.requestUpdateSize = function () {

};

ETLayoutController.prototype.getMaxHeight = function () {
    return  Infinity;//ground
    var screenSize = getScreenSize();

    return screenSize.height;

};


ETLayoutController.prototype.updateOverflowStatus = function () {
    var contentBound = this.elt.table ? this.elt.table.elt.getBoundingClientRect() : { width: 0, height: 0 };
    this.elt.addStyle('--dt-content-height', contentBound.height + 'px');
    this.elt.addStyle('--dt-content-width', contentBound.width + 'px');
    var bound = this.elt.getBoundingClientRect();
    if (bound.width < contentBound.width) {
        this.elt.addClass('as-overflow-x');
    }
    else {
        this.elt.removeClass('as-overflow-x');
        this.$space.removeStyle('left');
    }

    if (bound.height < contentBound.height) {
        this.elt.addClass('as-overflow-y');
    }
    else {
        this.elt.removeClass('as-overflow-y');
        this.$space.removeStyle('top');
    }
};


function ETAdapter(elt, adapterData) {
    this.data = adapterData.data;
    this.raw = adapterData;
    this.asyncSession = Math.random();
}

ETAdapter.prototype.notifyDataSheetChange = function () {
    var asyncSession = Math.random();
    this.asyncSession = asyncSession;
    var cmdArr = [
        () => this.getLength(),
        value => {
            this.length = value;
        },
        () => {
            console.log(this.length)
        }
    ];
    execAsync(cmdArr, () => this.asyncSession === asyncSession);
};

ETAdapter.prototype.getLength = function () {
    var body = this.raw.data.body;
    console.log(body)
    var length;
    if (typeof body.length === "number") {
        length = body.rows.length;
    }
    else if (body.length && body.length.then) {
        length = body.length;
    }
    else if (typeof body.getLength === "function") {
        length = this.raw.data.body.getLength(this);
    }
    else if (body.rows) length = body.rows.length;
    return length;
};

ETAdapter.prototype.getRowAt = function (idx) {
    var data;
    var body = this.raw.data.body;

    if (typeof body.getRowAt === "function") {
        data = body.getRowAt(idx, this);
    }
    else if (body.rows) data = body.rows;
    return data;
};

ETAdapter.prototype.renderHeadCell = function (elt, data, controller) {
    if (data.child) {
        if (data.child.map) {
            elt.addChild(data.child.map(function (it) {
                return _(it);
            }));
        }
        else {
            elt.addChild(_(data.child));
        }
    }
    if (data.render) {
        data.render.call(null, elt, data, controller);
    }
};


/**
 *
 * @param {EfficientTable} wrapper
 * @param data
 * @constructor
 */
function ETTable(wrapper, data) {
    this.wrapper = wrapper;
    this.adapter = this.wrapper.adapter;
    this.data = data;
    this.head = new ETHead(this, this.data.head);
    this.body = new ETBody(this, this.data.body);
    this.elt = _({
        tag: 'table',
        class: 'as-dynamic-table',
        child: [
            this.head.elt,
            this.body.elt
        ]
    });
}


/**
 *
 * @param {ETTable} table
 * @param data
 * @constructor
 */
function ETHead(table, data) {
    this.table = table;
    this.data = data || {};
    if (!this.data.rows) this.data.rows = [];
    this.rows = this.data.rows.map(rowData => new ETHeadRow(this, rowData));
    this.elt = _({
        tag: 'thead',
        class: 'as-dt-header',
        child: this.rows.map(it => it.elt)
    });
}

/**
 *
 * @param {ETHead} head
 * @param data
 * @constructor
 */
function ETHeadRow(head, data) {
    this.head = head;
    this.data = data || {};
    if (!this.data.cells) this.data.cells = [];
    this.cells = this.data.cells.map(cellData => new ETHeadCell(this, cellData))
    this.elt = _({
        tag: 'tr',
        class: 'as-dt-header-row',
        child: this.cells.map(it => it.elt)
    });
}

// (ETHeadRow)


function ETHeadCell(row, data) {
    this.row = row;
    this.data = data || {};
    this.elt = _({
        tag: 'th',
        class: 'as-dt-header-cell'
    });
    this.row.head.table.adapter.renderHeadCell(this.elt, this.data, this);
}

/**
 *
 * @param {ETTable} table
 * @param data
 * @constructor
 */
function ETBody(table, data) {
    this.data = data;
    this.table = table;
    this.elt = _({
        tag: 'tbody',
        class: 'as-dt-body'
    });
}

function ETBodyRow(body, data) {

}