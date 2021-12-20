import ACore, {$, _} from "../ACore";
import '../css/filelistinput.css';
import ExtIcons from "../assets/exticons/catalog.json";
import MessageInput from "./MessageInput";
import {isURLAddress} from "./utils";

/***
 * @extends AElement
 * @constructor
 */
function FileListItem() {
    this.$icon = $('.as-file-list-item-icon', this);
    this.$name = $('.as-file-list-item-name', this);
    this.value = null;
    this.fileType = null;
    this.fileName = '';
}

FileListItem.tag = 'FileListItem'.toLowerCase();


FileListItem.render = function () {
    return _({
        class: 'as-file-list-item',
        child: [
            {
                tag: 'img',
                class: 'as-file-list-item-icon',
                props: {
                    src: MessageInput.iconAssetRoot + '/' + 'blank' + '.svg'
                }
            },
            {
                class: 'as-file-list-item-name',
                child: {text: '..'}
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
        } else {
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
        var type = null;
        var size = null;
        var name = null;
        if ((value instanceof File) || (value instanceof Blob)) {
            size = value.size;
            name = value.name;
            type = name.split('.').pop().toLowerCase();

        } else if (isURLAddress(value)) {
            type = value.replace(/\.upload$/, '').split('.').pop();
            name = value.split('/').pop().replace(/%20/g, ' ');
            this.attr('title', value);
        } else if (value && value.name && value.url) {//keeview file format
            this.attr('title', value.url);
            name = value.name;
            type = name.split('.').pop().toLowerCase();
        }
        this._value = value;
        this.fileSize = size;
        this.fileName = name;
        this.fileType = type;
        if (value) {
            this.addClass('as-has-value');
        } else {
            this.removeClass('as-has-value');
        }
    },
    get: function () {
        return this._value;
    }
}


ACore.install(FileListItem);

export default FileListItem;