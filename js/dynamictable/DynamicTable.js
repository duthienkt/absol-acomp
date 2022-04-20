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


DynamicTable.eventHandler.pageSelectorChange= function (event){
    this.table.offset = (this.$pageSelector.selectedIndex - 1) * this.adapter.rowsPerPage;
}


ACore.install(DynamicTable);

export default DynamicTable;