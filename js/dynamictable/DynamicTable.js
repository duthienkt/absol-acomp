import ACore, { $, _ } from "../../ACore";
import DTDataAdapter from "./DTDataAdapter";
import '../../css/dynamictable.css';
import PageSelector from "../PageSelector";
import DTWaitingViewController from "./DTWaitingViewController";
import noop from "absol/src/Code/noop";

/***
 * @extends AElement
 * @constructor
 */
function DynamicTable() {
    /***
     *
     * @type {SearchTextInput|null}
     */
    this.$searchInput = null;
    /***
     *
     * @type {AElement}
     */
    this.$table = $('.as-dynamic-table', this);
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
    this.$pageSelector = $('pageselector', this)
        .on('change', this.eventHandler.pageSelectorChange);

    this.$filterInputs = [];
    //controller
    this.table = null;
    /***
     *
     * @type {DTDataTable||null}
     */
    this.adapter = null;

    this.waitingCtl = new DTWaitingViewController(this);

}


DynamicTable.tag = 'DynamicTable'.toLowerCase();

DynamicTable.render = function () {
    return _({
        extendEvent: ['orderchange'],
        class: 'as-dynamic-table-wrapper',
        child: [
            {
                tag: 'table',
                class: 'as-dynamic-table',
                child: [
                    {
                        tag: 'thead',
                        class: 'as-dt-header'

                    },
                    {
                        tag: 'tbody',
                        class: 'as-dt-body'
                    }
                ]
            },
            {
                tag: PageSelector.tag,
                props: {
                    pageRange: 5,
                    pageOffset: 1,
                    selectedIndex: 1,
                    pageCount: 15
                }
            }
        ]
    });
};


DynamicTable.prototype.addRowBefore = function (rowData, bf) {
    return this.table.body.addRowBefore(rowData, bf);
};


DynamicTable.prototype.addRowAfter = function (rowData, at) {
    return this.table.body.addRowAfter(rowData, at);
};


DynamicTable.prototype.addRow = function (rowData, idx) {
    return this.table.body.addRow(rowData, idx);
};

DynamicTable.prototype.addRows = function (rowsData, idx) {
    return this.table.body.addRows(rowsData, idx);
};

DynamicTable.prototype.removeRow = function (row) {
    return this.table.body.removeRow(row);
};

DynamicTable.prototype.rowAt = function (idx) {
    return this.table.body.rowAt(idx);
};

DynamicTable.prototype.rowOf = function (o) {
    return this.table.body.rowOf(o);
};


DynamicTable.prototype.getRows = function () {
    return this.table.body.rows;
};

DynamicTable.prototype.requireRows = function (start, end) {
    return this.table.body.requireRows(start, end);
};

DynamicTable.prototype.viewIntoRow = function (row) {
    this.table.body.viewIntoRow(row);
};

DynamicTable.prototype.attachSearchInput = function (inputElt) {
    if (this.$searchInput) {
        this.$searchInput.off('stoptyping', this.eventHandler.searchModify);
        this.$searchInput.off('keyup', this.eventHandler.searchKeyUp);
    }
    this.$searchInput = inputElt;
    if (this.$searchInput) {
        if (this.$searchInput.$table) {
            this.$searchInput.off('stoptyping', this.$searchInput.$table.eventHandler.searchModify);
            this.$searchInput.off('keyup', this.$searchInput.$table.eventHandler.searchKeyUp);

        }
        this.$searchInput.$table = this;
        this.$searchInput.on('stoptyping', this.eventHandler.searchModify);
        this.$searchInput.on('keyup', this.eventHandler.searchKeyUp);
    }
};

DynamicTable.prototype.filter = function (filter) {
    var query = {};
    var queryText = (this.$searchInput && this.$searchInput.value) || '';
    queryText = queryText.trim().replace(/\s\s+/g, ' ');
    var i;
    if (filter) {
        for (i in filter) {
            query.filter = filter;
            break;
        }
    }

    if (queryText && queryText.length > 0)
        query.text = queryText;
    for (i in query) {
        this.query(query);
        return;
    }
    this.query(null);
};


DynamicTable.prototype.makeQuery = function () {
    var query = {};
    var textQuery = this.$searchInput.value.trim().replace(/\s\s+/, ' ');
    if (textQuery.length > 0) query.text = textQuery;
    var i;
    var filter = this.$filterInputs.reduce(function (ac, elt) {
        if (elt.exportFilter) {
            elt.exportFilter(ac);
        }
        else if (elt.name) {
            ac[elt.name] = elt.value;
        }
        return ac;
    }, {});

    for (i in filter) {
        query.filter = filter;
        break;
    }


    for (i in query) {
        return query;
    }
    return null;
};


DynamicTable.prototype.requestQuery = function () {
    var query = this.makeQuery();
    this.query(query);
};


DynamicTable.prototype.query = function (query) {
    this.table.body.query(query);
}


DynamicTable.prototype.notifyRowsChange = noop();

DynamicTable.property = {};

DynamicTable.property.adapter = {
    set: function (data) {
        this._adapterData = data;
        if (data) {
            this._adapter = new DTDataAdapter(this, data);
            this._adapter.render();
        }
        else {
            //todo
        }
    },
    get: function () {
        return this._adapterData;
    }
};
DynamicTable.property.filterInputs = {
    set: function (inputs) {
        inputs = inputs || [];
        this.$filterInputs.forEach(function (elt) {
            elt.off('change', this.eventHandler.searchModify);
        }.bind(this));
        this.$filterInputs = inputs;
        this.$filterInputs.forEach(function (elt) {
            elt.on('change', this.eventHandler.searchModify);
        }.bind(this));
    },
    get: function () {
        return this.$filterInputs;
    }
};


/***
 * @memberOf {DynamicTable#}
 * @type {{}}
 */
DynamicTable.eventHandler = {};


DynamicTable.eventHandler.pageSelectorChange = function (event) {
    this.table.body.selectPage(this.$pageSelector.selectedIndex - 1, event);
};

/***
 * @this DynamicTable#
 * @param event
 */
DynamicTable.eventHandler.searchModify = function (event) {
    this.requestQuery();


};

/***
 * @this DynamicTable#
 * @param event
 */
DynamicTable.eventHandler.searchKeyUp = function (event) {
    setTimeout(function () {
        var query = this.$searchInput.value;
        query = query.trim().replace(/\s+/, ' ');
        if (query.length)
            this.table.body.startSearchingIfNeed();
    }.bind(this), 30);
};


ACore.install(DynamicTable);

export default DynamicTable;