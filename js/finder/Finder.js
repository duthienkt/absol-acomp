import '../../css/finder.css';
import '../../css/mobileapp.css';
import ACore, { _, $, $$ } from "../../ACore";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import FlexiconButton from "../FlexiconButton";
import OOP from "absol/src/HTML5/OOP";
import { ExpGroup, ExpTree } from "../ExpTree";
import MessageInput from "../messageinput/MessageInput";
import ext2MineType from "absol/src/Converter/ext2MineType";
import { fileInfoOf, measureText, openFileDialog, openYesNoQuestionDialog, vScrollIntoView } from "../utils";
import { randomArbitrary } from "absol/src/Math/random";
import TaskManager from "absol/src/AppPattern/TaskManager";
import Modal from "../Modal";
import MessageDialog from "../MessageDialog";
import Hanger from "../Hanger";
import Vec2 from "absol/src/Math/Vec2";
import Rectangle from "absol/src/Math/Rectangle";
import WindowBox from "../WindowBox";
import { saveAs } from "absol/src/Network/FileSaver";
import DropZone from "../DropZone";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import EventEmitter, { isMouseRight } from "absol/src/HTML5/EventEmitter";
import ContextCaptor from "../ContextMenu";
import TextArea2 from "../TextArea2";
import FileThumbnail from "./FileThumbnail";
import noop from "absol/src/Code/noop";
import SearchTextInput from "../Searcher";
import Context from "absol/src/AppPattern/Context";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { randomIdent } from "absol/src/String/stringGenerate";
import DomSignal from "absol/src/HTML5/DomSignal";
import RibbonButton from "../RibbonButton";

var isMobile = BrowserDetector.isMobile;

/***
 * @extends AElement
 * @constructor
 */
function Finder() {
    if (isMobile) this.addClass('as-mobile');
    // if (BrowserDetector.isMobile) alert("Chưa hỗ trợ điện thoại!");

    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.requestUpdateSize = () => {
        this.layoutCtn.update();
        this.navCtrl.notifyVisibleContentItems();
    };
    this.$attachhook.once('attached', () => {
        ResizeSystem.add(this.$attachhook);
        this.layoutCtn.update();
        this.navCtrl.onStart();
        this.navCtrl.notifyVisibleContentItems();
        ContextCaptor.auto();
    });

    this.domSignal = new DomSignal(_('attachhook').addTo(this));
    this.$header = $('.as-finder-header', this);
    this.$nomalActionCtn = $('.as-finder-normal-action-button-ctn', this);
    this.$tinyActionCtn = $('.as-finder-tiny-action-button-ctn', this);
    this.$contentHeader = $('.as-finder-content-header', this);

    this.$navCtn = $('.as-finder-nav-ctn', this);
    this.$nav = $(ExpGroup.tag, this.$navCtn);

    this.$searchCtn = $('.as-finder-search-ctn', this);


    this.$contentCtn = $('.as-finder-content-ctn', this);
    this.$content = $('.as-finder-content', this);
    this.$body = $('.as-finder-body', this);
    this.$commandButtons = $$('.as-finder-nav-header button', this)
        .concat($$('.as-finder-content-header button', this))
        .concat($$('.as-finder-search-footer button', this))
        .concat($$('.as-finder-search-header button', this))
        .reduce((ac, cr) => {
            var name = cr.attr('name');
            ac[name] = cr;
            if (cr.items) {//ribbon button
                cr.on('select', (event) => {
                    this.execCommand(name, event.item.value,event.item );
                });
            }
            else {
                cr.on('click', () => {
                    this.execCommand(name);
                });
            }
            return ac;
        }, {});

    this.$searchTypeSelect = $('.as-finder-search-type-select', this);
    this.$searchText = $('.as-finder-search-text', this);

    this.fileSystem = new AbsolFileSystem();
    this.layoutCtn = new LayoutController(this);
    this.navCtrl = new NavigatorController(this);
    this.selectCtrl = isMobile ? new MobileSelectController(this) : new SelectController(this);
    this.uploadCtrl = new UploadController(this);
    this.commandCtrl = new CommandController(this);
    this.folderDialog = new FolderDialog(this);
    this.searchCtrl = new SearchController(this);

    /***
     * @type {string}
     * @name displayPath
     * @memberOf Finder#
     */
    /***
     * @type {string}
     * @name path
     * @memberOf Finder#
     */
    /***
     * @type {string}
     * @name rootPath
     * @memberOf Finder#
     */

    /***
     * @type {string}
     * @name accept
     * @memberOf Finder#
     */
}

Finder.tag = 'Finder'.toLowerCase();

Finder.render = function () {
    return _({
        class: 'as-finder',
        extendEvent: ['selectedchange', 'dblclickfile'],
        attr: {
            'data-selected-file-count': '0',
            'data-selected-folder-count': '0'
        },
        child: [
            {
                class: 'as-finder-header',
                child: [
                    {
                        class: 'as-finder-normal-action-button-ctn',
                        /* child: Finder.prototype.actions.map(act => ({
                             tag: FlexiconButton.tag,
                             attr: { name: act.name },
                             props: {
                                 text: act.text,
                                 // icon: act.icon
                             }
                         }))*/
                    },
                    {
                        class: 'as-finder-tiny-action-button-ctn',
                        /*child: Finder.prototype.actions.map(act => ({
                            tag: 'button',
                            attr: { name: act.name, title: act.text },
                            child: act.icon
                        }))*/
                    }
                ]
            },
            {
                class: ['as-finder-nav-ctn'],
                child: [
                    {
                        class: 'as-finder-nav-header',
                        child: [
                            {
                                class: 'as-finder-nav-header-left',
                                child: [{
                                    tag: 'button',
                                    class: 'as-transparent-button',
                                    attr: { title: "Close Navigator", name: 'nav_toggle' },
                                    child: 'span.mdi.mdi-menu-open'
                                }]
                            },
                            {
                                class: 'as-finder-nav-header-right',
                                child: [
                                    {
                                        tag: 'button',
                                        class: 'as-transparent-button',
                                        attr: { title: "Search", name: 'switch_to_search' },
                                        child: 'span.mdi.mdi-magnify',
                                    },
                                    {
                                        tag: 'button',
                                        class: 'as-transparent-button',
                                        attr: { title: "Expand All", name: 'nav_expand_all' },

                                        child: 'span.mdi.mdi-arrow-expand-vertical',
                                    },
                                    {
                                        tag: 'button',
                                        class: 'as-transparent-button',
                                        attr: { title: "Collapse All", name: 'nav_collapse_all' },
                                        child: 'span.mdi.mdi-arrow-collapse-vertical'
                                    },
                                    {
                                        tag: 'button',
                                        class: 'as-transparent-button',
                                        attr: { title: "Reload", name: 'reload' },

                                        child: 'span.mdi.mdi-reload'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        tag: ExpGroup.tag,
                        class: 'as-bscroller'
                    }
                ]
            },
            {
                class: 'as-finder-search-ctn',
                child: [
                    {
                        class: 'as-finder-search-header',
                        child: [{
                            tag: 'button',
                            class: 'as-transparent-button',
                            attr: { title: "Close Navigator", name: 'nav_toggle' },
                            child: 'span.mdi.mdi-menu-open'
                        }]
                    },
                    {
                        class: 'as-finder-search-body',
                        child: [
                            {
                                tag: SearchTextInput.tag,
                                class: 'as-finder-search-text',
                            },
                            {
                                class: 'as-finder-search-field',
                                child: [
                                    { child: { text: 'Kiểu' } },
                                    {
                                        child: {
                                            tag: 'selectmenu',
                                            class: 'as-finder-search-type-select',
                                            props: {
                                                items: [
                                                    { text: 'Tất cả', value: 'all', icon: 'span.mdi.mdi-asterisk' },
                                                    {
                                                        text: 'Hình ảnh',
                                                        value: 'image',
                                                        icon: 'span.mdi.mdi-image-outline'
                                                    },
                                                    {
                                                        text: 'Tài liệu',
                                                        value: 'document',
                                                        icon: 'span.mdi.mdi-file-document'
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                class: 'as-finder-search-footer',
                                child: [
                                    {
                                        tag: FlexiconButton.tag,
                                        attr: { name: 'start_search' },
                                        props: {
                                            text: 'OK'
                                        }
                                    },
                                    {
                                        tag: FlexiconButton.tag,
                                        attr: { name: 'cancel_search' },
                                        props: {
                                            text: 'Hủy'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                tag: DropZone.tag,
                attr: { 'data-view-as': 'list' },
                class: ['as-finder-body'],
                child: [
                    {
                        class: 'as-finder-content-header',
                        child: [
                            {
                                class: 'as-finder-content-header-left',
                                child: [
                                    {
                                        tag: 'button',
                                        attr: { title: 'Open Navigator', name: 'nav_toggle' },
                                        class: 'as-transparent-button',
                                        child: ['span.mdi.mdi-menu']
                                    },
                                    {
                                        tag: RibbonButton,
                                        attr: { title: 'View As', name: 'content_view_as' },
                                        class: 'as-transparent-button',
                                        props: {
                                            text: 'List',
                                            icon: 'span.mdi.mdi-format-list-bulleted-square',
                                            items: [
                                                {
                                                    icon: 'span.mdi.mdi-format-list-bulleted-square',
                                                    text: 'List',
                                                    value: 'list',
                                                }, {
                                                    text: 'Medium Icons',
                                                    icon: 'span.mdi.mdi-grid',
                                                    value: 'content'
                                                },
                                                {
                                                    text: 'Lage Icons',
                                                    icon: 'span.mdi.mdi-image-outline',
                                                    value: 'lage_icons'
                                                }
                                            ]
                                        },
                                        // child: ['span.mdi.mdi-format-list-bulleted-square']
                                    }
                                ]
                            },
                            {
                                class: 'as-finder-content-header-right',
                            }
                        ]
                    },
                    {
                        tag: Hanger.tag,
                        class: 'as-finder-content-ctn',
                        props: {
                            hangOn: 5
                        },
                        child: {
                            class: ['as-finder-content',]
                        }
                    },
                    {
                        class: 'as-finder-upload-overlay',
                        child: [
                            {
                                class: 'as-finder-upload-overlay-icon-ctn',
                                child: 'span.mdi.mdi-cloud-upload-outline'
                            },
                            {
                                child: { text: 'Thả file vào đây để tải lên' }
                            }
                        ]

                    }
                ]
            }

        ]
    });
};


Finder.property = {};

Finder.property.fileSystem = {
    set: function (fs) {
        this._fileSystem = fs;
    },
    get: function () {
        return this._fileSystem;
    }
};

Finder.property.path = {
    set: function (path) {
        this.navCtrl.path = path;
    },
    get: function () {
        return this.navCtrl.path;
    }
};

Finder.property.displayPath = {
    // set: function (path) {
    //     this.navCtrl.path = path;
    // },
    get: function () {
        return this.navCtrl.displayPath;
    }
};

Finder.property.rootPath = {
    set: function (path) {
        this.navCtrl.rootPath = path;
    },
    get: function () {
        return this.navCtrl.rootPath;
    }
};


Finder.property.selectedFiles = {
    get: function () {
        return this.selectCtrl.$selectedItems.filter(elt => elt.stat && !elt.stat.isDirectory).map(elt => elt.stat);
    }
}

Finder.prototype.execCommand = function (name) {
    return this.commandCtrl.execCommand.apply(this.commandCtrl, arguments);
};

Finder.prototype.addCommand = function (name, descriptor) {
    this.commandCtrl.addCommand(name, descriptor);
};


Finder.prototype.addButton = function (name, bf) {
    this.commandCtrl.addButton(name, bf);
};


/****
 *
 * @param {string} name
 * @param {string=} bf
 */
Finder.prototype.addFolderMenuItem = function (name, bf) {
    this.commandCtrl.addFolderMenuItem(name, bf);
};


Finder.prototype.findZIndex = function () {
    var c = this;
    var res = 0;
    var zIndex;
    while (c) {
        zIndex = parseInt(getComputedStyle(c).getPropertyValue('z-index'));
        if (!isNaN(zIndex)) res = Math.max(zIndex, res);
        c = c.parentElement;
    }
    return res;
};

ACore.install(Finder);

export default Finder;

export var FinderCommands = {};
Finder.prototype.commands = FinderCommands;


FinderCommands.upload = {
    text: 'Tải lên',
    icon: 'span.mdi.mdi-upload-outline',
    match: function (fileElt) {
        return !fileElt && this.searchCtrl.state !== 'RUNNING' && this.dirStat && this.dirStat.writable;
    },
    /***
     * @this Finder
     */
    exec: function () {
        openFileDialog({ multiple: true }).then(files => {
            if (files && files.length > 0) {
                this.uploadCtrl.upload(files);
            }
        })
    }
};

FinderCommands.upload_to_folder = {
    text: 'Tải lên',
    icon: 'span.mdi.mdi-upload-outline',
    match: function (treElt) {
        return treElt && treElt.stat && treElt.stat.writable;
    },
    /***
     * @this Finder
     */
    exec: function () {
        //todo: selected folder
        openFileDialog({ multiple: true }).then(files => {
            if (files && files.length > 0) {
                this.uploadCtrl.upload(files);
            }
        })
    }
};

FinderCommands.delete = {
    icon: 'span.mdi.mdi-delete-outline',
    text: 'Xóa',
    /***
     * @this Finder
     */
    match: function (fileElt) {
        return fileElt && this.selectCtrl.$selectedItems.length > 0 && this.selectCtrl.$selectedItems.every(elt => elt.stat && !elt.stat.isDirectory && elt.stat.writable);
    },
    /***
     * @this Finder
     */
    exec: function () {
        var paths = this.selectCtrl.$selectedItems.map(elt => elt.stat.path);
        var names = this.selectCtrl.$selectedItems.map(elt => elt.fileName);
        if (names.length === 0) return;
        var contentElt = _({
            style: { maxHeight: '50vh', overflow: 'auto' },
            child: {
                style: { display: 'table' },
                child: names.map(name => ({
                    style: { display: 'table-row' },
                    child: [
                        {
                            style: { display: 'table-cell', padding: '5px 20px 5px 10px' },
                            child: {
                                style: {
                                    'min-width': '30em',
                                },
                                child: { text: name }
                            }
                        },
                        {
                            style: { display: 'table-cell', padding: '5px 10px' },
                            child: {
                                class: 'as-finder-task-check',
                                style: {
                                    'min-width': '3em',
                                    textAlign: 'right',
                                },
                                child: 'span'
                            }
                        }
                    ]
                }))
            }
        });
        var modal = _({
            tag: Modal.tag,
            style: { zIndex: this.findZIndex() + 9000 },
            child: {
                tag: MessageDialog.tag,
                props: {
                    dialogTitle: 'Xóa file',
                    dialogActions: [
                        { name: "ok", text: "OK" },
                        { name: 'cancel', text: 'Hủy' }
                    ]
                },
                child: [{ child: { tag: 'span', child: { text: "Xác nhận xóa những file dưới đây: " } } }, contentElt],
                on: {
                    action: (event, sender) => {
                        var promises;
                        var errors = [];
                        if (event.action.name === 'ok') {
                            sender.$actionBtns[0].disabled = true;
                            sender.$actionBtns[0].text = "Đang tiến hành xóa..";
                            sender.$actionBtns[1].disabled = true;
                            promises = paths.map((path, i) => {
                                return this.fileSystem.unlink(path).then(() => {
                                    $('.as-finder-task-check', contentElt.firstChild.childNodes[i]).addChild(_('span.mdi.mdi-check'))
                                }).catch(err => {
                                    errors.push(err);
                                    $('.as-finder-task-check', contentElt.firstChild.childNodes[i])
                                        .addChild(_('span.mdi.mdi-alert-decagram-outline'))
                                        .addChild(_({
                                            tag: 'span',
                                            class: '.as-finder-task-error-message',
                                            child: { text: err.message }
                                        }))
                                });
                            });
                            Promise.all(promises).then(() => {
                                var commands = {};
                                if (errors.length > 0) {
                                    errors.forEach(err => {
                                        if (err.command) {
                                            commands[err.command] = true;
                                        }
                                    });
                                    if (commands.reload) this.execCommand('reload');
                                    sender.$actionBtns[1].disabled = false;
                                    sender.$actionBtns[0].text = "Hoàn thành";
                                }
                                else {
                                    this.navCtrl.reload(this.path, true).then(() => modal.remove());
                                }
                            });
                        }
                        else {
                            modal.remove();

                        }
                    }
                }
            }
        }).addTo(document.body);
    }
};


FinderCommands.view = {
    icon: 'span.mdi.mdi-eye-outline',
    text: 'Xem',
    match: function (fileElt) {
        return !!fileElt;
    },
    /***
     * @this Finder
     */
    exec: function () {
        var elt = this.selectCtrl.$selectedItems[0];
        if (!elt) return;
        if (elt.stat.isDirectory) {
            this.navCtrl.viewDir(elt.stat.path);
            return;
        }
        var url = elt.stat.url;
        if (!url) return;
        var type = elt.fileType;
        if (type === 'xlsx' || type === 'docx' || type === 'xls' || type === 'doc' || type === 'ppt' || type === 'pptx') {
            url = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url);
        }
        else {
            url = encodeURI(url);
        }

        var mineType = ext2MineType[type] || 'none';
        var content;
        if (mineType.startsWith('video')) {
            content = _({
                tag: 'video',
                style: {
                    maxWidth: 'calc(90vw - 20px)',
                    maxHeight: 'calc(90vh - 80px)',
                    width: '900px',
                    height: 'auto'
                },
                attr: {
                    autoplay: 'true',
                    controls: 'true'
                },
                props: {
                    src: url
                }
            });
        }
        else if (mineType.startsWith('audio')) {
            content = _({
                tag: 'audio',
                style: {
                    margin: '5px'
                },
                attr: {
                    autoplay: 'true',
                    controls: 'true'
                },
                props: {
                    src: url
                }

            });
        }
        else if (mineType.startsWith('image')) {
            content = _({
                tag: 'img',
                style: {
                    maxWidth: 'calc(90vw - 20px)',
                    maxHeight: 'calc(90vh - 80px)',
                    width: 'auto',
                    height: 'auto'
                },
                attr: {},
                props: {
                    src: url
                }
            });
        }
        else {
            content = _({
                tag: 'iframe',
                style: {
                    maxWidth: 'calc(90vw - 20px)',
                    maxHeight: 'calc(90vh - 80px)',
                    width: '900px',
                    height: '600px'
                },
                props: {
                    src: url,
                    onload: function () {
                        // console.log(this.contentWindow.document.body.offsetHeight, this.contentWindow.document.body.offsetWidth)
                    }
                }

            });
        }

        var modal = _({
            tag: Modal.tag,
            style: { zIndex: this.findZIndex() + 9000 },
            child: {
                tag: WindowBox.tag,
                child: content,
                props: {
                    windowTitle: elt.stat.displayName || elt.stat.name,
                    windowActions: [
                        { name: 'close', icon: 'span.mdi.mdi-close' }
                    ]
                },
                on: {
                    action: () => {
                        modal.remove();
                    }
                }
            }
        }).addTo(document.body);
    }
};


FinderCommands.download = {
    icon: 'span.mdi.mdi-download-outline',
    text: 'Tải về',
    match: function (elt) {
        return elt && this.selectCtrl.$selectedItems.length > 0
            && this.selectCtrl.$selectedItems.every(elt => elt.stat && !elt.stat.isDirectory);
    },
    /***
     * @this Finder
     */
    exec: function () {
        var taskMng = new TaskManager({ limit: 4 });
        this.selectCtrl.$selectedItems.forEach(elt => {
            if (elt.isDirectory) return;
            var url = elt.stat.url;
            if (!url) return;
            taskMng.requestTask(function (onFinish, bundle) {
                saveAs(bundle.url, bundle.name)
                setTimeout(onFinish, 100);
            }, { url: url, name: elt.fileName });
        });
    }
};


FinderCommands.rename = {
    icon: 'span.mdi.mdi-rename',
    text: 'Đổi tên',
    /***
     * @this Finder
     */
    match: function (elt) {
        return elt && this.selectCtrl.$selectedItems.length === 1 && elt.stat && !elt.stat.isDirectory && elt.stat.writable;//todo: rename folder
    },
    /***
     * @this Finder
     */
    exec: function () {
        var elt = this.selectCtrl.$selectedItems[0];
        if (!elt) return;
        var path = elt.stat.path;
        var value = elt.fileName;
        var input = _({
            tag: TextArea2.tag,
            style: {
                outline: 'none',
                position: 'absolute',
                zIndex: 100,
                left: 0,
                bottom: 0,
                width: '100%'
            },
            props: {
                value: elt.fileName
            },
            on: {
                blur: () => {
                    var newValue = input.value.replace(/<>:\\\/\|\?\*\^/g, '').trim();
                    input.remove();
                    if (!value) return;
                    if (value === newValue) return;
                    this.fileSystem.rename(path, newValue).then(newStat => {
                        elt.stat = newStat;
                        elt.value = newStat.url;
                        elt.fileName = newStat.displayName || newStat.name;
                    });
                }
            }
        });
        elt.addChild(input);
        input.on('keydown', function (event) {
            if (event.key.match(/<>:\\\/\|\?\*\^/)) {
                event.preventDefault();
                setTimeout(() => input.updateSize(), 30)
            }
            else if (event.key === 'Enter') {
                input.blur();
            }
            else if (event.key === 'Escape') {
                input.value = value;
                input.updateSize();
                input.blur();
            }
        }, true);
        input.updateSize();
        input.focus();
        var ext = value.match(/\.[a-zA-Z0-9]+$/);
        if (ext) {
            ext = ext[0];
        }
        else {
            ext = '';
        }
        input.setSelectionRange(0, value.length - ext.length);

    }
};

FinderCommands.copy = {
    icon: 'span.mdi.mdi-content-copy',
    text: 'Sao chép',
    exec: function () {

    }
};

FinderCommands.move = {
    text: 'Di chuyển',
    icon: 'span.mdi.mdi-file-move-outline',
    match: function (fileElt) {
        if (arguments.length === 0) {
            return this.selectCtrl.$selectedItems.every(elt => elt.stat.writable);
        }

        return fileElt && fileElt.stat && fileElt.stat.writable;
    },
    /***
     * @this Finder
     */
    exec: function () {
        var itemElements = this.selectCtrl.$selectedItems.slice();
        var paths = itemElements.map(elt => elt.stat.path);
        var names = itemElements.map(elt => elt.fileName);
        if (names.length === 0) return;
        var currentFolderPath = this.path;
        this.folderDialog.open(currentFolderPath, false, (newFolderPath, stat) => newFolderPath !== currentFolderPath && stat.writable, 'Di chuyển file').then(newFolderPath => {
            if (!newFolderPath) return;
            if (newFolderPath === currentFolderPath) return;
            var contentElt = _({
                style: { maxHeight: '50vh', overflow: 'auto' },
                child: {
                    style: { display: 'table' },
                    child: names.map(name => ({
                        style: { display: 'table-row' },
                        child: [
                            {
                                style: { display: 'table-cell', padding: '5px 20px 5px 10px' },
                                child: {
                                    style: {
                                        'min-width': '30em',
                                    },
                                    child: { text: name }
                                }
                            },
                            {
                                style: { display: 'table-cell', padding: '5px 10px' },
                                child: {
                                    class: 'as-finder-task-check',
                                    style: {
                                        'min-width': '3em',
                                        textAlign: 'right',
                                    },
                                    child: 'span'
                                }
                            }
                        ]
                    }))
                }
            });
            var modal = _({
                tag: Modal.tag,
                style: { zIndex: this.findZIndex() + 9000 },
                child: {
                    tag: MessageDialog.tag,
                    props: {
                        dialogTitle: 'Di chuyển file',
                        dialogActions: [{
                            name: 'close',
                            text: 'Đóng'
                        }]
                    },
                    child: [{
                        child: {
                            tag: 'span',
                            child: { text: "Danh sách đang di chuyển: " }
                        }
                    }, contentElt],
                    on: {
                        action: (event, sender) => {
                            modal.remove();
                        }
                    }
                }
            }).addTo(document.body);
            var errors = [];
            var promises = paths.map((path, i) => {
                var newPath = newFolderPath + '/' + path.split('/').pop();
                return this.fileSystem.move(path, newPath).then(() => {
                    $('.as-finder-task-check', contentElt.firstChild.childNodes[i]).addChild(_('span.mdi.mdi-check'))
                }).catch(err => {
                    errors.push(err);
                    $('.as-finder-task-check', contentElt.firstChild.childNodes[i])
                        .addChild(_('span.mdi.mdi-alert-decagram-outline')).addChild(_({
                        tag: 'span',
                        class: '.as-finder-task-error-message',
                        child: { text: err.message }
                    }));
                });
            });
            Promise.all(promises).then(() => {
                var commands = {};
                if (errors.length > 0) {
                    errors.forEach(err => {
                        if (err.command) {
                            commands[err.command] = true;
                        }
                    });
                    if (commands.reload) this.execCommand('reload');
                }
                else {
                    this.navCtrl.reload(this.path, true).then(() => modal.remove());
                }
            });

        });
    }
};


FinderCommands.move_dir = {
    text: 'Di chuyển',
    icon: 'span.mdi.mdi-folder-arrow-right-outline',
    match: function (expElt) {
        return expElt && expElt.stat && expElt.stat.writable && !expElt.stat.isVirtual;
    },
    /***
     * @this Finder
     */
    exec: function (expElt) {
        var path = expElt.stat.path;
        var currentFolderPath = path.split('/');
        var name = currentFolderPath.pop();
        currentFolderPath = currentFolderPath.join('/');
        this.folderDialog.open(currentFolderPath, true, newPath => !newPath.startsWith(path), 'Di chuyển thư mục').then(newFolderPath => {
            if (!newFolderPath) return;
            return this.fileSystem.move(path, newFolderPath + '/' + name).then(() => {
                this.path = newFolderPath + '/' + name;
                this.navCtrl.reload(this.rootPath).then(() => {
                    this.navCtrl.viewDir(this.path)
                });
            });
        })
    }
};


FinderCommands.rmdir = {
    text: 'Xóa',
    icon: 'span.mdi.mdi-delete-outline',
    /***
     * @this Finder
     * @param elt
     */
    match: function (elt) {
        if (elt.stat && elt.stat.isVirtual) return false;
        if (elt) return elt.stat && elt.stat.writable;
        return false;
    },
    exec: function (elt) {

    }
};


FinderCommands.select_all = {
    text: 'Chọn tất cả',
    icon: 'span.mdi.mdi-select-all',
    match: function (fileElt) {
        return !fileElt;
    },
    /***
     * @this Finder
     */
    exec: function () {
        this.selectCtrl.selectAll();
    }
};

FinderCommands.nav_expand_all = {
    /***
     * @this Finder
     */
    exec: function () {
        this.navCtrl.expandAll();
    }
};

FinderCommands.nav_collapse_all = {
    /***
     * @this Finder
     */
    exec: function () {
        this.navCtrl.collapseAll();
    }
};


FinderCommands.reload = {
    /***
     * @this Finder
     */
    exec: function () {
        this.fileSystem.clearCache();
        this.navCtrl.reload().then(() => {
            this.navCtrl.viewDir(this.path);
        });
    }
};

FinderCommands.content_view_as = {
    /***
     * @this Finder
     */
    exec: function (value, item) {
        this.$commandButtons['content_view_as'].text = item.text;
        this.$commandButtons['content_view_as'].icon = item.icon;
        this.$body.attr('data-view-as', value);

    }
};

FinderCommands.switch_to_search = {
    /***
     * @this Finder
     */
    exec: function () {
        this.searchCtrl.start();
    }
};

FinderCommands.cancel_search = {
    /***
     * @this Finder
     */
    exec: function () {
        this.searchCtrl.stop();
        this.navCtrl.viewDir(this.path);
    }
};


FinderCommands.start_search = {
    /***
     * @this Finder
     */
    exec: function () {
        this.searchCtrl.search();
    }
};

FinderCommands.nav_toggle = {
    icon: 'span.mdi.mdi-menu',
    exec: function () {
        if (this.hasClass('as-nav-open')) {
            this.removeClass('as-nav-open');
        }
        else {
            this.addClass('as-nav-open');
        }
    }
};


/***
 *
 * @param {Finder} elt
 * @constructor
 */
function LayoutController(elt) {
    this.elt = elt;
    this.actionButtonWidth = 0;
    this.elt.domSignal.on('requestUpdateActionButtonSize', this.updateActionButtonSize.bind(this));
    this.elt.on('click', this.ev_click.bind(this))

}

LayoutController.prototype.requestUpdateActionButtonSize = function () {
    this.elt.domSignal.emit('requestUpdateActionButtonSize');
};

LayoutController.prototype.updateActionButtonSize = function () {
    var font = this.elt.$nomalActionCtn.getComputedStyleValue('font');
    var fontSize = this.elt.$nomalActionCtn.getFontSize();
    this.actionButtonWidth = Array.prototype.reduce.call(this.elt.$nomalActionCtn.childNodes, (ac, cr) => {
        return ac + Math.max(110, 0.715 * fontSize * 2 + measureText(cr.text, font).width) + 10;
    }, 60);
    this.update();
};

LayoutController.prototype.update = function () {
    var bound = this.elt.getBoundingClientRect();
    if (bound.width < 500) {
        if (!this.elt.hasClass('as-mini-layout'))
            this.elt.addClass('as-mini-layout');
    }
    else {
        if (this.elt.hasClass('as-mini-layout')) {
            this.elt.removeClass('as-mini-layout');
            this.elt.removeClass('as-nav-open');
        }
    }
    if (this.elt.hasClass('as-action-button-minimized')) {
        if (this.actionButtonWidth <= bound.width) {
            this.elt.removeClass('as-action-button-minimized');
        }
    }
    else {
        if (this.actionButtonWidth > bound.width) {
            this.elt.addClass('as-action-button-minimized');
        }
    }
    var bodyBound = this.elt.$body.getBoundingClientRect();
    var col = Math.floor(bodyBound.width / 300) || 1;
    this.elt.$body.addStyle('--col', col + '');
};

LayoutController.prototype.ev_click = function (event) {
    if (event.target === this.elt) {
        this.elt.removeClass('as-nav-open');
    }
};

/***
 *
 * @param {Finder} elt
 * @constructor
 */

function CommandController(elt) {
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });

    this.elt = elt;
    this.$normalActionCtn = this.elt.$nomalActionCtn;
    this.$tinyActionCtn = this.elt.$tinyActionCtn;
    this.commands = Object.assign({}, this.elt.commands);
    this.buttonNames = ['upload', 'view', 'download', 'move', 'rename', 'delete'];
    this.folderMenuItemNames = ['upload_to_folder', 'move_dir'];
    this.contentMenuItemNames = ['view', 'download', 'upload', 'select_all', 'move', 'delete', 'rename'];

    this.$navCtn = this.elt.$navCtn;
    this.$navCtn.defineEvent('contextmenu').on('contextmenu', this.ev_navContextMenu);
    this.$contentCtn = this.elt.$contentCtn;
    this.$contentCtn.defineEvent('contextmenu').on('contextmenu', this.ev_contentContextMenu);

    this.updateButtons();
}

CommandController.prototype.updateButtons = function () {
    this.$normalActionCtn.clearChild();
    var buttons = this.buttonNames.map(name => {
        var desc = this.commands[name] || {};
        return _({
            tag: FlexiconButton.tag,
            attr: { name: name },
            props: {
                text: desc.text || name
            },
            on: {
                click: () => {
                    this.execCommand(name);
                }
            }
        });
    });
    this.$normalActionCtn.addChild(buttons);

    buttons = this.buttonNames.map(name => {
        var desc = this.commands[name] || {};
        return _({
            tag: 'button',
            class: 'as-transparent-button',
            attr: { name: name },
            child: desc.icon,
            on: {
                click: () => {
                    this.execCommand(name);
                }
            }
        });
    });
    this.$tinyActionCtn.addChild(buttons);


    this.elt.layoutCtn.requestUpdateActionButtonSize();
};


CommandController.prototype.execCommand = function (name) {
    var args = Array.prototype.slice.call(arguments, 1);
    var desc = this.commands[name];
    if (desc && typeof desc.exec === 'function') {
        return desc.exec.apply(this.elt, args);
    }
    return null;
};


CommandController.prototype.addCommand = function (name, desc) {
    this.commands[name] = Object.assign({}, this.commands[name], desc);
};

/****
 *
 * @param {string} name
 * @param {string=} bf
 */
CommandController.prototype.addButton = function (name, bf) {
    var idx = this.buttonNames.indexOf(bf);
    var bfElt, smallBfElt;
    if (idx >= 0) {
        this.buttonNames.splice(idx, 0, name);
        bfElt = $(`button[name="${name}"]`, this.$normalActionCtn);
        smallBfElt = $(`button[name="${name}"]`, this.$tinyActionCtn);
    }
    else {
        this.buttonNames.push(name);
    }
    var desc = this.commands[name] || {};
    this.$normalActionCtn.addChildBefore(_({
        tag: FlexiconButton.tag,
        attr: { name: name },
        props: {
            text: desc.text || name
        },
        on: {
            click: () => {
                this.execCommand(name);
            }
        }
    }), bfElt);

    this.$tinyActionCtn.addChild(_({
        tag: 'button',
        class: 'as-transparent-button',
        attr: { name: name },
        child: desc.icon,
        on: {
            click: () => {
                this.execCommand(name);
            }
        }
    }), smallBfElt);


    this.elt.layoutCtn.requestUpdateActionButtonSize();
};

/****
 *
 * @param {string} name
 * @param {string=} bf
 */
CommandController.prototype.addFolderMenuItem = function (name, bf) {
    idx = this.folderMenuItemNames.indexOf(name);
    if (idx >= 0) return;
    var idx = this.folderMenuItemNames.indexOf(bf);
    if (idx >= 0)
        this.folderMenuItemNames.splice(idx, 0, name);
    else this.folderMenuItemNames.push(name);
};

/****
 *
 * @param {string} name
 * @param {string=} bf
 */
CommandController.prototype.addContentMenuItem = function (name, bf) {
    idx = this.folderMenuItemNames.indexOf(name);
    if (idx >= 0) return;//todo
    var idx = this.folderMenuItemNames.indexOf(bf);
    if (idx >= 0)
        this.folderMenuItemNames.splice(idx, 0, name);
    else this.folderMenuItemNames.push(name);
};


CommandController.prototype.ev_navContextMenu = function (event) {
    var expTree;
    var c = event.target;
    while (c && !expTree) {
        if (c.stat) expTree = c;
        c = c.parentElement;
    }
    if (expTree) this.elt.navCtrl.viewDir(expTree.stat.path, [this.elt.rootPath].concat(expTree.getPath()).join('/'));
    var items = this.folderMenuItemNames.map(name => {
        var desc = this.commands[name];
        if (!desc) return null;
        if (typeof desc.match === "function") {
            if (!desc.match.call(this.elt, expTree)) return null;
        }
        return {
            text: desc.text,
            icon: desc.icon,
            cmd: name
        }
    }).filter(x => !!x);
    if (items.length > 0) {
        event.showContextMenu({ items: items }, (event) => {
            var cmd = event.menuItem.cmd;
            this.execCommand(cmd, expTree);
        });
    }
};


CommandController.prototype.ev_contentContextMenu = function (event) {
    var fileElt;
    var c = event.target;
    while (c && !fileElt) {
        if (c.stat) fileElt = c;
        c = c.parentElement;
    }

    var selectedElements = this.elt.selectCtrl.$selectedItems;
    if (fileElt && selectedElements.indexOf(fileElt) < 0) {
        this.elt.selectCtrl.deselectAll();
        this.elt.selectCtrl.select(fileElt);

    }
    // if (expTree) this.elt.navCtrl.viewDir(expTree.stat.path, [this.elt.rootPath].concat(expTree.getPath()).join('/'));
    var items = this.contentMenuItemNames.map(name => {
        var desc = this.commands[name];
        if (!desc) return null;
        if (typeof desc.match === "function") {
            if (!desc.match.call(this.elt, fileElt)) return null;
        }
        return {
            text: desc.text,
            icon: desc.icon,
            cmd: name
        }
    }).filter(x => !!x);
    if (items.length > 0) {
        event.showContextMenu({ items: items }, (event) => {
            var cmd = event.menuItem.cmd;
            this.execCommand(cmd, fileElt);
        });
    }
};


/***
 * for desktop
 * @param {Finder} elt
 * @constructor
 */
function SelectController(elt) {
    this.elt = elt;
    this.$selectedItems = [];// first element is focus
    this.$content = this.elt.$content;
    this.$contentCtn = this.elt.$contentCtn;
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });
    this._setupSelectTool();

}

/***
 *
 * @protected
 */
SelectController.prototype._setupSelectTool = function () {
    this._draged = false;
    this._dragOffset = new Vec2(0, 0);
    this.$selectArea = _('.as-finder-select-area');
    this.$contentCtn.on('draginit', this.ev_dragInit)
        .on('dragdeinit', this.ev_dragDeinit)
        .on('dragstart', this.ev_dragStart)
        .on('drag', this.ev_drag)
        .on('dragend', this.ev_dragEnd);
};

SelectController.prototype.deselectAll = function () {
    while (this.$selectedItems.length > 0) {
        this.$selectedItems.pop().checked = false;
    }
    this._updateCount();
    this.elt.emit('selectedchange');
};

SelectController.prototype.select = function (elt) {//todo: more option
    this.deselectAll();
    this.$selectedItems.push(elt);
    elt.checked = true;
    this._updateCount();
    this.elt.emit('selectedchange');
};

SelectController.prototype.selectAll = function () {//todo: more option
    this.deselectAll();
    var fileElements = Array.prototype.slice.call(this.$content.childNodes);
    this.$selectedItems.push.apply(this.$selectedItems, fileElements);
    fileElements.forEach(elt => {
        elt.checked = true;
    });
    this._updateCount();
    this.elt.emit('selectedchange');
};


SelectController.prototype.ev_dragInit = function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        event.cancel();
        return;
    }
    // event.preventDefault();
    this._draged = false;
};


SelectController.prototype.ev_dragDeinit = function (event) {
    if (!this._draged) this.ev_click(event);
};

SelectController.prototype.ev_dragStart = function (event) {
    this._draged = true;
    this.elt.addClass('as-dragging');
    this.$selectArea.addStyle('z-index', this.elt.findZIndex() + 100 + '').addTo(document.body);
    var bound = Rectangle.fromClientRect(this.$content.getBoundingClientRect());
    this._dragOffset = event.currentPoint.sub(bound.A());
    var pos = bound.A().add(this._dragOffset);
    this.$selectArea.addStyle({
        left: pos.x + 'px',
        top: pos.y + 'px',
    });
};

SelectController.prototype.ev_drag = function (event) {
    this._draged = true;
    var bound = Rectangle.fromClientRect(this.$content.getBoundingClientRect());
    var A = bound.A().add(this._dragOffset);
    var C = event.currentPoint;
    var sRect = Rectangle.boundingPoints([A, C]);

    this.$selectArea.addStyle({
        left: sRect.x + 'px',
        top: sRect.y + 'px',
        width: sRect.width + 'px',
        height: sRect.height + 'px',
    });
};

SelectController.prototype.ev_dragEnd = function () {
    while (this.$selectedItems.length > 0) {
        this.$selectedItems.pop().checked = false;
    }
    var selectBound = Rectangle.fromClientRect(this.$selectArea.getBoundingClientRect());
    Array.prototype.forEach.call(this.$content.childNodes, elt => {
        var bound = Rectangle.fromClientRect(elt.getBoundingClientRect());
        if (selectBound.isCollapse(bound, 0)) {
            this.$selectedItems.push(elt);
            elt.checked = true;
        }
    });
    this._draged = true;
    this.$selectArea.remove();
    this.elt.removeClass('as-dragging');
    this._updateCount();
    this.elt.layoutCtn.update();
    this.elt.emit('selectedchange');
};


SelectController.prototype._updateCount = function () {
    var folderCount = this.$selectedItems.filter(elt => elt.stat.isDirectory).length;
    this.elt.attr('data-selected-file-count', this.$selectedItems.length - folderCount + '');
    this.elt.attr('data-selected-folder-count', folderCount + '');
}

SelectController.prototype.ev_click = function (event) {
    event = event.originalEvent || event.originEvent || event;

    var c = event.target;
    var itemElt;
    while (c && !itemElt) {
        if (c.hasClass && c.hasClass('as-file-thumbnail')) {
            itemElt = c;
            break;
        }

        c = c.parentElement;
    }

    var focusIdx;
    var currentIdx;
    if (this.$selectedItems.length === 0 && itemElt) {
        this.$selectedItems.push(itemElt);
        itemElt.checked = true;
    }
    else if (isMouseRight(event)) {

    }
    else if (!event.ctrlKey && !event.shiftKey) {
        while (this.$selectedItems.length > 0) {
            this.$selectedItems.pop().checked = false;
        }
        if (itemElt) {
            this.$selectedItems.push(itemElt);
            itemElt.checked = true;
        }
    }
    else if (event.shiftKey) {
        if (itemElt) {
            focusIdx = Array.prototype.indexOf.call(this.$content.childNodes, this.$selectedItems[0]);
            currentIdx = Array.prototype.indexOf.call(this.$content.childNodes, itemElt);
            while (this.$selectedItems.length > 1) {
                this.$selectedItems.pop().checked = false;
            }
            while (currentIdx !== focusIdx) {
                itemElt = this.$content.childNodes[currentIdx];
                this.$selectedItems.push(itemElt);
                itemElt.checked = true;
                if (currentIdx < focusIdx) currentIdx++;
                else currentIdx--;
            }
        }
    }
    else if (event.ctrlKey) {
        if (itemElt) {
            currentIdx = this.$selectedItems.indexOf(itemElt);
            if (currentIdx >= 0) {
                this.$selectedItems.splice(currentIdx, 1);
                itemElt.checked = false;
            }
            else {
                this.$selectedItems.unshift(itemElt);
                itemElt.checked = true;
            }
        }
    }

    this._updateCount();
    this.elt.layoutCtn.update();
    this.elt.emit('selectedchange');
};

/***
 * @extends SelectController
 * @param elt
 * @constructor
 */
function MobileSelectController(elt) {
    SelectController.apply(this, arguments);
}


OOP.mixClass(MobileSelectController, SelectController);

MobileSelectController.prototype._setupSelectTool = function () {
    this.$content.on('click', this.ev_click);
};


/***
 *
 * @param {Finder} elt
 * @constructor
 */
function UploadController(elt) {
    /***
     *
     * @type {Finder}
     */
    this.elt = elt;
    this.$body = this.elt.$body;
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });

    this.$body.on({
        fileenter: this.ev_fileEnter,
        filedrop: this.ev_fileDrop
    })
}

UploadController.prototype.upload = function (files) {
    var contentElt = _({
        style: { maxHeight: '50vh', overflow: 'auto' },
        child: {
            style: { display: 'table' },
            child: files.map(file => ({
                style: { display: 'table-row' },
                child: [
                    {
                        style: { display: 'table-cell', padding: '5px 20px 5px 10px' },
                        child: {
                            style: {
                                'min-width': '30em',
                            },
                            child: { text: file.name }
                        }
                    },
                    {
                        style: { display: 'table-cell', padding: '5px 10px' },
                        child: {
                            class: 'as-upload-percent',
                            style: {
                                'min-width': '3em',
                                textAlign: 'right',
                                color: 'rgb(30,237,219)'
                            },
                            child: { text: '' }
                        }
                    }
                ]
            }))
        }
    });
    var modal = _({
        tag: Modal.tag,
        style: { zIndex: this.elt.findZIndex() + 9000 },
        child: {
            tag: MessageDialog.tag,
            props: {
                dialogTitle: 'Tải lên',
            },
            child: contentElt
        }
    }).addTo(document.body);

    var syncs = files.map((file, i) => {
        var percentText = $('.as-upload-percent', contentElt.firstChild.childNodes[i]);
        return this.elt.fileSystem.writeFile(this.elt.path + '/' + file.name, file, done => {
            var textBound = percentText.getBoundingClientRect();
            var ctnBound = contentElt.getBoundingClientRect();
            if (textBound.bottom > ctnBound.bottom) {
                contentElt.scrollTop += textBound.bottom - ctnBound.bottom;
            }
            percentText.firstChild.data = Math.round(done * 100) + '%';
        });
    });
    Promise.all(syncs).then(() => {
        this.elt.navCtrl.reload(this.elt.path, true).then(() => modal.remove());
    });
}


UploadController.prototype.ev_fileEnter = function (event) {
    var files = Array.prototype.slice.call(event.dataTransfer.files);
    if (files.length === 0) return;
};


UploadController.prototype.ev_fileDrop = function (event) {
    if (this.elt.searchCtrl.state === "RUNNING") return;
    var files = event.files;
    if (files.length > 0)
        this.upload(files);
};

/***
 * @extends EventEmitter
 * @param {Finder} elt
 * @constructor
 */
function FolderDialog(elt) {
    EventEmitter.call(this);
    this.elt = elt;
}

OOP.mixClass(FolderDialog, EventEmitter);

FolderDialog.prototype._init = function () {
    if (this.$modal) return;
    this.$modal = _({
        tag: 'modal',
        class: 'as-finder-folder-dialog-modal',
        child: {
            tag: MessageDialog.tag,
            props: {
                dialogTitle: 'Duyệt thư mục',
                dialogActions: [
                    { name: 'ok', text: 'OK' },
                    { name: 'cancel', text: 'Hủy' }
                ]
            },
            child: [
                {
                    class: 'as-finder-folder-dialog-content',
                    child: [
                        {
                            class: 'as-finder-folder-dialog-selected-ctn',
                            child: [
                                { tag: 'span', child: { text: 'Đã chọn thư mục: ' } },
                                { tag: 'span', child: { text: ' ... ' } }
                            ]
                        },
                        {
                            class: 'as-finder-folder-dialog-tree-ctn',
                            child: [
                                {
                                    tag: ExpGroup.tag
                                },
                                {
                                    tag: ExpTree.tag,
                                    class: 'as-finder-folder-dialog-tree-root',
                                    props: {
                                        name: 'root',
                                        icon: 'span.mdi.mdi-harddisk'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    });
    this.$dialog = $(MessageDialog.tag, this.$modal);
    this.$treeCtn = $('.as-finder-folder-dialog-tree-ctn', this.$modal);
    this.$rootTree = $('.as-finder-folder-dialog-tree-root', this.$modal);
    this.$content = $('.as-finder-folder-dialog-content', this.$modal);
    this.$expGroup = $(ExpGroup.tag, this.$content);
    this.$selectedCtn = $('.as-finder-folder-dialog-selected-ctn', this.$content);
    this.$selectedPath = this.$selectedCtn.childNodes[1];
    this.$activeNode = null;
}

FolderDialog.prototype.open = function (initPath, showRoot, checkFunc, title) {
    var cPath = initPath;
    this._init();
    var fileSystem = this.elt.fileSystem;
    var zIndex = this.elt.findZIndex() + 9000;
    this.$modal.addStyle('z-index', zIndex + '');
    this.$modal.addTo(document.body);
    if (this.$activeNode) {
        this.$activeNode.active = false;
        this.$activeNode = null;
    }

    this.$dialog.$actionBtns[0].disabled = true;
    this.$dialog.dialogTitle = title || 'Duyệt';


    var makeTree = (path, ctnElt, level) => {
        level = level || 0;
        return fileSystem.readDir(path).then(dirs => Promise.all(dirs.map(dir => fileSystem.stat(path + '/' + dir))))
            .then(stats => stats.filter(stat => {
                return stat.isDirectory
            }))
            .then(stats => {
                var syncs = [];
                ctnElt.clearChild();
                var children = stats.map(stat => {
                    var nodePath = path + '/' + stat.name;
                    var node = _({
                        tag: ExpTree.tag,
                        props: {
                            stat: stat,
                            name: stat.displayName || stat.name,
                            icon: { tag: 'img', props: { src: MessageInput.iconAssetRoot + '/folder.svg' } },
                            path: nodePath
                        },
                        on: {
                            statuschage: () => {
                            },
                            press: () => {
                                if (this.$activeNode) this.$activeNode.active = false;
                                this.$activeNode = node;
                                this.$activeNode.active = true;
                                this.$selectedPath.firstChild.data = node.getPath().join('/');
                                cPath = nodePath;
                                if (checkFunc && !checkFunc(cPath, stat)) {
                                    this.$dialog.$actionBtns[0].disabled = true;
                                }
                                else {
                                    this.$dialog.$actionBtns[0].disabled = false;
                                }
                            }
                        }

                    });
                    if (nodePath === cPath) {
                        node.active = true;
                        this.$activeNode = node;
                    }
                    if (checkFunc && !checkFunc(nodePath, stat)) {
                        node.getNode().addStyle('opacity', 0.3 + '');
                    }
                    node.getNode().on({
                        dblclick: () => {
                            if (node.status === 'close') {
                                node.status = 'open';
                            }
                            else if (node.status === 'open') {
                                node.status = 'close';
                            }
                        }
                    });
                    if (stat.name !== 'node_modules')
                        syncs.push(makeTree(nodePath, node, level + 1));

                    return node;
                });
                children.forEach(c => {
                    ctnElt.addChild(c);
                });
                if (children.length) {
                    ctnElt.status = level > 1 ? 'close' : 'open';
                }
                else {
                    ctnElt.status = 'none';
                }
                return Promise.all(syncs);
            });
    }

    var onRootPress;

    if (showRoot) {
        this.$expGroup.addStyle('display', 'none');
        this.$rootTree.removeStyle('display');
        if (cPath === this.elt.rootPath) {
            this.$activeNode = this.$rootTree;
            this.$activeNode.active = true;
        }

        onRootPress = () => {
            var node = this.$rootTree;
            var nodePath = this.elt.rootPath;
            if (this.$activeNode) this.$activeNode.active = false;
            this.$activeNode = node;
            this.$activeNode.active = true;
            this.$selectedPath.firstChild.data = node.getPath().join('/');
            cPath = nodePath;
            if (cPath === initPath || (checkFunc && !checkFunc(cPath, { writable: true }))) {
                this.$dialog.$actionBtns[0].disabled = true;
            }
            else {
                this.$dialog.$actionBtns[0].disabled = false;
            }
        };
        this.$rootTree.on('press', onRootPress);
    }
    else {
        this.$expGroup.removeStyle('display');
        this.$rootTree.addStyle('display', 'none');
    }

    makeTree(this.elt.rootPath, showRoot ? this.$rootTree : this.$expGroup).then(() => {
        var p;
        if (this.$activeNode) {
            this.$selectedPath.firstChild.data = this.$activeNode.getPath().join('/');
            p = this.$activeNode.getParent();
            while (p) {
                if (p.status === 'close') {
                    p.status = 'open';
                }
                p = p.getParent && p.getParent();
            }
            setTimeout(() => {
                vScrollIntoView(this.$activeNode.firstChild);
            }, 10)
        }
    });


    return new Promise((resolve) => {
        var finish = (event) => {
            this.$dialog.off('action', finish);
            this.$modal.remove();
            if (event.action.name === 'cancel') resolve(null);
            else resolve(cPath);
            if (onRootPress) {
                this.$rootTree.off('press', onRootPress);
            }
        }

        this.$dialog.on('action', finish);
    });
};

var isMatchAccept = (accept, statInfo) => {
    if (accept && (typeof accept === "object") && accept.accept) accept = accept.accept;
    if (typeof accept !== "string") return true;
    if (!accept) return true;
    if (statInfo.isDirectory) return true;
    var fileInfo = fileInfoOf(statInfo);
    if (accept.startsWith('image')) {
        return fileInfo.mimeType && fileInfo.mimeType.startsWith('image');
    }
    return true;// not handle other case
}

/***
 *
 * @param {Finder} elt
 * @constructor
 */
function NavigatorController(elt) {
    this.elt = elt;
    this.path = '';
    this.rootPath = '';

    this._states = {};
    this._notifiedVisibleIdx = 0;

    this.$navCtn = this.elt.$navCtn;
    this.$nav = this.elt.$nav;
    this.$contentCtn = this.elt.$contentCtn;
    this.$content = this.elt.$content;

    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });

    this.$contentCtn.on('scroll', this.ev_contentScroll);
}

NavigatorController.prototype.onStart = function () {
    /**
     *
     * @type {AbsolFileSystem}
     */
    this.fileSystem = this.elt.fileSystem;

    this.$treeByPath = {};
    this.$treeByPath[this.rootPath || '..'] = this.$nav;
    this.reload(this.rootPath, true);
};

NavigatorController.prototype.reload = function (fromPath, autoOpen) {
    var opened = !autoOpen;

    var makeTree = (path, ctnElt) => {
        if (!opened && ctnElt.path) {
            this.viewDir(ctnElt.path, [this.elt.rootPath].concat(ctnElt.getPath()).join('/'));
            opened = true;
        }
        return this.fileSystem.readDir(path).then(dirs => Promise.all(dirs.map(dir => this.fileSystem.stat(path + '/' + dir))))
            .then(stats => stats.filter(stat => {
                return stat.isDirectory
            }))
            .then(stats => {
                var syncs = [];
                ctnElt.clearChild();
                var children = stats.map(stat => {
                    var nodePath = path + '/' + stat.name;
                    var node = _({
                        tag: ExpTree.tag,

                        props: {
                            stat: stat,
                            name: stat.displayName || stat.name,
                            icon: { tag: 'img', props: { src: MessageInput.iconAssetRoot + '/folder.svg' } },
                            path: nodePath,
                        },
                        on: {
                            statuschage: () => {
                                this._states[path + '/' + stat.name] = node.status;
                            },
                            press: () => {
                                if (this.path !== nodePath)
                                    this.viewDir(nodePath, [this.elt.rootPath].concat(node.getPath()).join('/'));
                            }
                        }

                    });
                    node.getNode().on({
                        dblclick: () => {
                            if (node.status === 'close') {
                                node.status = 'open';
                            }
                            else if (node.status === 'open') {
                                node.status = 'close';
                            }
                            this._states[nodePath] = node.status;
                        }
                    });
                    this.$treeByPath[nodePath] = node;
                    if (stat.name !== 'node_modules')
                        syncs.push(makeTree(nodePath, node));
                    if (!opened) {
                        this.viewDir(nodePath, [this.elt.rootPath].concat(node.getPath()).join('/'));
                        opened = true;
                    }
                    return node;
                });
                children.forEach(c => {
                    ctnElt.addChild(c);
                });
                if (children.length) {
                    if (this._states[ctnElt.path] === 'close' || this._states[ctnElt.path] === 'open') {
                        ctnElt.status = this._states[ctnElt.path];
                    }
                    else {
                        ctnElt.status = 'close';
                    }
                }
                else {
                    ctnElt.status = 'none';
                }
                return Promise.all(syncs);
            });

    }


    if (this.$treeByPath[fromPath || '..'])
        return makeTree(fromPath, this.$treeByPath[fromPath || '..']);
    return Promise.resolve();
};

NavigatorController.prototype.viewDir = function (path) {
    this.elt.selectCtrl.deselectAll();
    if (this.$treeByPath[this.path]) {
        this.$treeByPath[this.path].active = false;
        this.$treeByPath[this.path].active = false;
    }
    this.path = path;
    this.$treeByPath[this.path].active = true;
    var c = this.$treeByPath[this.path].getParent();
    while (c) {
        if (c.status === 'close') c.status = 'open';
        c = c.getParent && c.getParent();
    }

    vScrollIntoView(this.$treeByPath[this.path].firstChild);


    this.fileSystem.stat(path).then(stat => {
        this.elt.dirStat = stat;
        if (this.path !== path) return;
        if (stat.writable) this.elt.addClass('as-writable-folder');
        else this.elt.removeClass('as-writable-folder');
        if (stat.isVirtual) {
            this.elt.addClass('as-virtual-folder');
        }
        else {
            this.elt.removeClass('as-virtual-folder');
        }
    })
    this.fileSystem.readDir(path).then(dirs => Promise.all(dirs.map(dir => this.fileSystem.stat(path + '/' + dir))))
        .then(stats => {
            if (this.path !== path) return;
            stats.sort((a, b) => {
                var aName, bName;
                if (a.isDirectory === b.isDirectory) {
                    aName = a.displayName || a.name;
                    bName = b.displayName || b.name;
                    if (aName < bName) return -1;
                    return 1;
                }
                else {
                    if (a.isDirectory) return -1;
                    return 1;
                }
            });
            stats = stats.filter(x=> isMatchAccept(this.elt.accept,x));
            this.viewContent(stats);
        });
};

NavigatorController.prototype.viewContent = function (stats) {
    this.clearContent();
    stats.forEach(stat => {
        this.pushContentItem(stat);

    });
    this.notifyVisibleContentItems();
};

NavigatorController.prototype.clearContent = function () {
    this._notifiedVisibleIdx = 0;
    this.$content.clearChild();
};

NavigatorController.prototype.pushContentItem = function (stat) {
    var elt = _({
        tag: FileThumbnail.tag,
        extendEvent: ['visible'],
        attr: {
            title: stat.displayName || stat.name
        },
        props: {
            isDirectory: stat.isDirectory,
            value: stat.url,
            fileName: stat.displayName || stat.name,
            stat: stat
        },
        on: {
            visible: () => {
                var mineType = ext2MineType[elt.fileType];
                if (mineType && mineType.startsWith('image/')) {
                    elt.thumbnail = stat.url;
                }
            },
            dblclick: () => {
                var prevented = false;
                var event;
                if (!stat.isDirectory) {
                    event = {
                        fileElt: elt,
                        stat: stat,
                        preventDefault: () => {
                            prevented = true;
                        }
                    };
                    this.elt.emit('dblclickfile', event);
                }
                if (!prevented)
                    this.elt.execCommand('view');

            }
        }
    });

    this.$content.addChild(elt);
};


NavigatorController.prototype.notifyVisibleContentItems = function () {
    var elt;
    var bound = this.$contentCtn.getBoundingClientRect();
    var eBound;
    while (this._notifiedVisibleIdx < this.$content.childNodes.length) {
        elt = this.$content.childNodes[this._notifiedVisibleIdx];
        eBound = elt.getBoundingClientRect();
        if (eBound.top < bound.bottom) {
            elt.emit('visible');
        }
        else {
            break;
        }
        this._notifiedVisibleIdx++;
    }
};

NavigatorController.prototype.expandAll = function () {
    var visit = nodeElt => {
        if (nodeElt.status === 'close') {
            nodeElt.status = 'open';
            this._states[nodeElt.path] = 'open';
        }
        if (nodeElt.status === 'open') {
            nodeElt.getChildren().forEach(visit);
        }
    };

    Array.prototype.forEach.call(this.$nav.childNodes, visit);
};


NavigatorController.prototype.collapseAll = function () {
    var visit = nodeElt => {
        if (nodeElt.status === 'open') {
            nodeElt.status = 'close';
            this._states[nodeElt.path] = 'close';
        }
        if (nodeElt.status === 'close') {
            nodeElt.getChildren().forEach(visit);
        }
    };

    Array.prototype.forEach.call(this.$nav.childNodes, visit);
};

NavigatorController.prototype.ev_contentScroll = function (event) {
    this.notifyVisibleContentItems();
};

var fileTextQuery2Regex = text => {
    var code = nonAccentVietnamese(text.toLowerCase())
        .replace(/[.,+^$()\[\]{}|\\]/g, x => '\\' + x)
        .replace(/\*+/g, '(.*)')
        .replace(/\?/g, '.');

    return new RegExp(code, 'i');
}


/***
 * @extends Context
 * @param {Finder} elt
 * @constructor
 */
function SearchController(elt) {
    Context.apply(this);
    this.elt = elt;
    this.$searchText = this.elt.$searchText.on('keydown', event => {
        if (event.key === 'Enter') {
            this.$searchText.blur();
            this.search();
        }
    });
}


OOP.mixClass(SearchController, Context);


SearchController.prototype.onStart = function () {
    // console.log('start')
    this.elt.addClass('as-searching');
    this.$searchText.value = '';
    this.$searchText.focus();
};


SearchController.prototype.onStop = function () {
    this.elt.removeClass('as-searching');
    this.session = randomIdent(10);
    this.$searchText.waiting = false;

};

SearchController.prototype.search = function () {
    var session = randomIdent(10);
    this.session = session;
    this.elt.navCtrl.clearContent();
    this.$searchText.waiting = true;
    var fileSystem = this.elt.fileSystem;
    var rootPath = this.elt.rootPath;
    var result = [];
    var type = this.elt.$searchTypeSelect.value;
    var text = this.$searchText.value.trim();
    var regex = fileTextQuery2Regex(text);


    var isMatched = stat => {
        var fileInfo = fileInfoOf(stat.displayName || stat.name);
        var mineType = fileInfo.mimeType || '';
        var fileType = fileInfo.type || '';
        fileType = fileType.toLowerCase();

        if (mineType && type !== 'all') {
            if (type === 'image' && !mineType.startsWith('image') && type !== 'svg') {
                return false;
            }
            else if (type === 'document' && ['doc', 'docx', 'pdf', 'xlsx'].indexOf(fileType) < 0 && !mineType.startsWith('text')) {
                return false;
            }
        }
        if (text.length === 0) return true;
        if (stat.displayName && stat.displayName.match(regex)) return true;
        if (stat.name && nonAccentVietnamese(stat.name.toLowerCase()).match(regex)) return true;

        return false;
    }


    var handleStat = stat => {
        if (session !== this.session) return;
        if (stat.isDirectory) return visitDir(stat.path);
        if (isMatched(stat)) {
            this.elt.navCtrl.pushContentItem(stat);
            this.elt.navCtrl.notifyVisibleContentItems();
        }
    };

    var handleDirResult = (dir, names) => {
        var syncs = names.map(name => {
            return fileSystem.stat(dir + '/' + name).then(stat => {
                if (session !== this.session) return;
                if (stat)
                    return handleStat(stat);
            });
        });
        return Promise.all(syncs);
    }

    var visitDir = path => {
        return fileSystem.readDir(path).then((names => handleDirResult(path, names)));
    }

    visitDir(rootPath).then(() => {
        if (session !== this.session) return;
        this.$searchText.waiting = false;
    });

};


/***
 *
 * @constructor
 */
export function FinderFileSystem() {

}

FinderFileSystem.prototype.supporteDisplayName = false;

FinderFileSystem.prototype.readDir = function (path) {

};


FinderFileSystem.prototype.unlink = function (path) {
    console.log(path);
};

FinderFileSystem.prototype.stat = function (path) {

};

FinderFileSystem.prototype.rmdir = function (path) {

};

FinderFileSystem.prototype.mkdir = function (path) {

};


FinderFileSystem.prototype.writeFile = function (file, data) {

};

FinderFileSystem.prototype.copy = function () {

};


FinderFileSystem.prototype.rename = function (path, name) {

};

FinderFileSystem.prototype.move = function (oldPath, newPath) {

};

FinderFileSystem.prototype.clearCache = function () {

};

/***
 * @extends FinderFileSystem
 * @constructor
 */
function AbsolFileSystem() {
    FinderFileSystem.apply(this, arguments);
    this.sync = Promise.resolve();
    this.cache = { readDir: {}, stats: {} };
    this.taskMng = new TaskManager({ limit: 4 });
}

OOP.mixClass(AbsolFileSystem, FinderFileSystem);

AbsolFileSystem.prototype.clearCache = function () {
    this.cache = { readDir: {}, stats: {} };
};

AbsolFileSystem.prototype.readDir = function (path) {
    this.sync = this.sync.then(() => {
        if (this.cache.readDir[path || '..']) return this.cache.readDir[path || '..'];
        return fetch('/filesystem/ls.php', {
            method: 'POST',
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: path
            })
        }).then(res => res.json()).then(res => {
            res = res.filter(c => c.path.startsWith('/html'));
            res.forEach(c => {
                c.name = c.path.split('/').pop();
                c.url = c.path.replace('/html', location.origin)
            });
            this.cache.readDir[path || '..'] = res.map(c => c.name);
            res.forEach(c => {
                this.cache.stats[c.path] = c;
            });

        }).then(() => {
            return this.cache.readDir[path || '..'];
        });
    });
    return this.sync;
};

AbsolFileSystem.prototype.stat = function (path) {
    return this.sync.then(() => {
        path = path || '';
        if (this.cache.stats[path || '..']) return this.cache.stats[path || '..'];
        var dir = path.split('/');
        dir.pop();
        dir = dir.join('/');
        return this.readDir(dir).then(() => {
            return this.cache.stats[path || '..'];
        })
    });
}

/***
 *
 * @param file
 * @param {File|Blob}data
 * @param {function(done: number):void=}onProcess
 */
AbsolFileSystem.prototype.writeFile = function (file, data, onProcess) {
    if (file.toLowerCase().endsWith('.php')) file += '.txt';
    var folderPath = file.split('/');
    folderPath.pop();
    folderPath = folderPath.join('/');
    delete this.cache.readDir[folderPath];
    var prefix = ['file', new Date().getTime(), randomArbitrary(0, 1000000) >> 0].join('_');
    var parts = [];
    var chuck_limit = 2 << 20;
    var partName;
    var fileSize = data.size;
    var fileStartOffset = 0;
    var fileEndOffset = 0;

    var idx = 0;
    var syncs = [];
    var syncDone = 0;

    var bundle;
    var began = false;
    var handle = bundle => {
        return new Promise(rs => {
            this.taskMng.requestTask((finishTask, bundle) => {
                if (typeof onProcess === "function" && !began) {
                    began = true;
                    onProcess(syncDone / (syncs.length || 1));
                }
                var form = new FormData();
                form.append('action', 'upload_part');
                form.append('fileUpload', bundle.file, bundle.name);
                fetch('/filesystem/writefile.php', {
                    method: 'POST',
                    body: form
                }).then(res => res.text()).then(text => {
                    if (text !== 'OK') throw new Error(text);
                    syncDone++;
                    if (typeof onProcess === "function") {
                        onProcess(syncDone / (syncs.length || 1));
                    }
                    rs(location.origin);
                    finishTask();
                });
            }, bundle);
        })
    }
    while (fileStartOffset < fileSize) {
        fileEndOffset = Math.min(fileStartOffset + chuck_limit, fileSize);
        partName = prefix + '.p' + idx;
        parts.push(partName);
        bundle = {
            file: data.slice(fileStartOffset, fileEndOffset),
            idx: idx,
            name: partName
        };
        idx++;
        fileStartOffset = fileEndOffset;
        syncs.push(handle(bundle));
    }

    return Promise.all(syncs).then(() => {
        var form = new FormData();
        form.append('action', 'join_parts');
        form.append('parts', parts.join(';'));
        form.append('path', file);
        fetch('/filesystem/writefile.php', {
            method: 'POST',
            body: form
        }).then(res => res.text()).then(text => {
            if (text !== 'OK') throw new Error(text);
        });
    });
};

AbsolFileSystem.prototype.unlink = function (path) {
    var folderPath = path.split('/');
    folderPath.pop();
    folderPath = folderPath.join('/');
    delete this.cache.readDir[folderPath];
    var form = new FormData();
    form.append('action', 'delete_files');
    form.append('paths', path);
    return fetch('/filesystem/writefile.php', {
        method: 'POST',
        body: form
    }).then(res => res.text()).then(text => {
        if (text !== 'OK') throw new Error(text);
    });
};


AbsolFileSystem.prototype.rename = function (path, name) {
    var folderPath = path.split('/');
    folderPath.pop();
    folderPath = folderPath.join('/');
    var form = new FormData();
    form.append('action', 'rename');
    form.append('path', path);
    form.append('new_name', name);
    return fetch('/filesystem/writefile.php', {
        method: 'POST',
        body: form
    }).then(res => res.text()).then(text => {
        if (text !== 'OK') throw new Error(text);
        var newPath = folderPath + '/' + name;
        delete this.cache.readDir[folderPath];
        delete this.cache.stats[path];
        return {
            url: newPath.replace('/html', location.origin),
            path: newPath,
            name: name
        }
    });

};


AbsolFileSystem.prototype.move = function (oldPath, newPath) {
    var oldFolderPath = oldPath.split('/');
    oldFolderPath.pop();
    oldFolderPath = oldFolderPath.join('/');
    var newFolderPath = newPath.split('/');
    newFolderPath.pop();
    newFolderPath = newFolderPath.join('/');
    var form = new FormData();
    form.append('action', 'move');
    form.append('old_path', oldPath);
    form.append('new_path', newPath);
    return fetch('/filesystem/writefile.php', {
        method: 'POST',
        body: form
    }).then(res => res.text()).then(text => {
        if (text !== 'OK') throw new Error(text);
        delete this.cache.readDir[oldFolderPath];
        delete this.cache.readDir[newFolderPath];
        delete this.cache.stats[oldPath];
    });
};
