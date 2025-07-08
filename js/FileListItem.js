import ACore, { $, _ } from "../ACore";
import '../css/filelistinput.css';
import ExtIcons from "../assets/exticons/catalog.json";
import MessageInput from "./messageinput/MessageInput";
import { autoNormalizeFileName, fileInfoOf, isURLAddress } from "./utils";
import QuickMenu from "./QuickMenu";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import CheckboxInput from "./CheckBoxInput";
import OOP from "absol/src/HTML5/OOP";
import { hitElement, isMouseLeft } from "absol/src/HTML5/EventEmitter";

/***
 * @extends AElement
 * @constructor
 */
function FileListItem() {
    this.$parent = null;
    this.$icon = $('.as-file-list-item-icon', this);
    this.$name = $('.as-file-list-item-name', this);
    this.$quickMenuBtn = $('.as-file-list-item-quick-btn', this);
    this.$check = $('.as-file-list-item-check', this);
    this.value = null;
    this.fileType = null;
    this.fileName = '';
    OOP.drillProperty(this, this.$check, 'checked');
    this.on('click', this.eventHandler.click);
    QuickMenu.toggleWhenClick(this.$quickMenuBtn, {
        getMenuProps: () => {
            var list = this.parentElement;
            if (list.disabled) return;
            var self = this;
            var itemElt = this
            var menuItems = [];
            menuItems.push({
                text: LanguageSystem.getText('txt_download') || "Download",
                icon: 'span.mdi.mdi-download',
                cmd: 'download'
            });
            if (!list.readOnly) {
                if (itemElt)
                    menuItems.push({
                        text: LanguageSystem.getText('txt_delete') || "Delete",
                        icon: 'span.mdi.mdi-delete',
                        cmd: 'delete'
                    });
                menuItems.push(
                    {
                        text: LanguageSystem.getText('txt_delete_all') || "Delete All",
                        icon: 'span.mdi.mdi-delete-empty',
                        cmd: 'delete_all'
                    });
            }
            return {
                items: menuItems
            };
        },
        onSelect: function (menuItem) {
            var itemElt = this;
            var self = this.parentElement;
            var files;
            switch (menuItem.cmd) {
                case 'download':
                    self.downloadFileItemElt(itemElt);
                    break;
                case 'delete':
                    self.deleteFileItemElt(itemElt);
                    self.emit('change', {
                        type: 'change',
                        item: itemElt.fileData,
                        target: this,
                        action: 'delete'
                    }, this);
                    break;
                case 'delete_all':
                    files = self.files;
                    self.files = [];
                    self.emit('change', { type: 'change', items: files, target: this, action: 'delete_all' }, this);
                    break;
            }
        }.bind(this)
    });

    this.$check.on('change', function (event) {
        if (this.$parent) {
            this.$parent.emit('check', { target: this.$parent, elt: this, type: 'check' }, this.$parent);
        }
    }.bind(this));

    /***
     * @name checked
     * @type {boolean}
     * @memberOf FileListItem#
     */
}

FileListItem.tag = 'FileListItem'.toLowerCase();


FileListItem.render = function () {
    return _({
        class: 'as-file-list-item',
        child: [
            {
                tag: CheckboxInput,
                class: 'as-file-list-item-check'
            },
            {
                tag: 'img',
                class: 'as-file-list-item-icon',
                props: {
                    src: MessageInput.iconAssetRoot + '/' + 'blank' + '.svg'
                }
            },
            {
                class: 'as-file-list-item-name',
                child: { text: '..' }
            },
            {
                tag: 'button',
                class: 'as-file-list-item-quick-btn',
                child: 'span.mdi.mdi-dots-vertical'
            }
        ]
    });
};

FileListItem.property = {};

FileListItem.property.fileType = {
    set: function (value) {
        this._fileType = value;
        if (value) {
            if (ExtIcons.indexOf(value) >= 0)
                this.$icon.src = MessageInput.iconAssetRoot + '/' + value + '.svg';
            else
                this.$icon.src = MessageInput.iconAssetRoot + '/' + 'blank' + '.svg';
        }
        else {
            this.$icon.src = MessageInput.iconAssetRoot + '/' + 'blank' + '.svg';
        }
    },
    get: function () {
        return this._fileType;
    }
};

FileListItem.property.fileName = {
    set: function (value) {
        this.$name.firstChild.data = value + '';
    },
    get: function () {
        return this.$name.firstChild.data;
    }
};


FileListItem.property.value = {
    set: function (value) {
        value = value || null;
        autoNormalizeFileName(value);
        var info = fileInfoOf(value);
        var type = info.type || null;
        var size = info.size || null;
        var name = info.name || null;
        this._value = value;
        this.fileSize = size;
        this.fileName = name;
        this.fileType = type;
        if (value) {
            this.addClass('as-has-value');
        }
        else {
            this.removeClass('as-has-value');
        }
    },
    get: function () {
        return this._value;
    }
};

FileListItem.eventHandler = {};

/***
 * @this FileListItem
 * @param event
 */
FileListItem.eventHandler.click = function (event) {
    if (!isMouseLeft(event)) return;
    if (hitElement(this.$check, event) || hitElement(this.$quickMenuBtn, event)) return;
    if (this.$parent && this.$parent.showCheck) {
        this.$check.checked = !this.$check.checked;
        this.$check.notifyChange();
    }
};

ACore.install(FileListItem);

export default FileListItem;