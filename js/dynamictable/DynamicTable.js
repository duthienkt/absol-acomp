import ACore, { $, _ } from "../../ACore";
import DTDataAdapter from "./DTDataAdapter";
import '../../css/dynamictable.css';
import PageSelector from "../PageSelector";

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
    //controller
    this.table = null;
    /***
     *
     * @type {DTDataTable||null}
     */
    this.adapter = null;


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

DynamicTable.prototype.removeRow = function (row) {
    return this.table.body.removeRow(row);
};

DynamicTable.prototype.rowAt = function (idx) {
    return this.table.body.rowAt(idx);
};


DynamicTable.prototype.getRows = function () {
    return this.table.body.rows;
};

DynamicTable.prototype.requireRows = function (start, end){
    return this.table.body.requireRows(start, end);
};

DynamicTable.prototype.viewIntoRow = function (row) {
    this.table.body.viewIntoRow(row);
};

DynamicTable.prototype.attachSearchInput = function (inputElt) {
    if (this.$searchInput) {
        this.$searchInput.off('stoptyping', this.eventHandler.searchModify);
    }
    this.$searchInput = inputElt;
    if (this.$searchInput) {
        if (this.$searchInput.$table) {
            this.$searchInput.off('stoptyping', this.$searchInput.$list.eventHandler.searchModify);
        }
        this.$searchInput.$table = this;
        this.$searchInput.on('stoptyping', this.eventHandler.searchModify);
    }
};


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
    var query = this.$searchInput.value;
    query = query.trim().replace(/\s+/, ' ');
    this.table.body.searchFor(query);

};


ACore.install(DynamicTable);

export default DynamicTable;