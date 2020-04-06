import ACore from "../ACore";
import EventEmitter from 'absol/src/HTML5/EventEmitter';
import { openFileDialog } from "./utils";
var _ = ACore._;
var $ = ACore.$;

var extSupport = [
    "3g2", "3ga", "3gp", "7z", "aa", "aac", "ac", "accdb", "accdt", "ace", "adn",
    "ai", "aif", "aifc", "aiff", "ait", "amr", "ani", "apk", "app", "applescript",
    "asax", "asc", "ascx", "asf", "ash", "ashx", "asm", "asmx", "asp", "aspx",
    "asx", "au", "aup", "avi", "axd", "aze", "bak", "bash", "bat", "bin",
    "blank", "bmp", "bowerrc", "bpg", "browser", "bz2", "bzempty", "c", "cab",
    "cad", "caf", "cal", "cd", "cdda", "cer", "cfg", "cfm", "cfml", "cgi",
    "chm", "class", "cmd", "code-workspace", "codekit", "coffee", "coffeelintignore",
    "com", "compile", "conf", "config", "cpp", "cptx", "cr2", "crdownload", "crt",
    "crypt", "cs", "csh", "cson", "csproj", "css", "csv", "cue", "cur", "dart",
    "dat", "data", "db", "dbf", "deb", "default", "dgn", "dist", "diz", "dll",
    "dmg", "dng", "doc", "docb", "docm", "docx", "dot", "dotm", "dotx", "download",
    "dpj", "ds_store", "dsn", "dtd", "dwg", "dxf", "editorconfig", "el",
    "elf", "eml", "enc", "eot", "eps", "epub", "eslintignore", "exe", "f4v",
    "fax", "fb2", "fla", "flac", "flv", "fnt", "folder", "fon", "gadget",
    "gdp", "gem", "gif", "gitattributes", "gitignore", "go", "gpg", "gpl",
    "gradle", "gz", "h", "handlebars", "hbs", "heic", "hlp", "hs", "hsl",
    "htm", "html", "ibooks", "icns", "ico", "ics", "idx", "iff", "ifo",
    "image", "img", "iml", "in", "inc", "indd", "inf", "info", "ini", "inv",
    "iso", "j2", "jar", "java", "jpe", "jpeg", "jpg", "js", "json", "jsp",
    "jsx", "key", "kf8", "kmk", "ksh", "kt", "kts", "kup", "less", "lex",
    "licx", "lisp", "lit", "lnk", "lock", "log", "lua", "m", "m2v", "m3u",
    "m3u8", "m4", "m4a", "m4r", "m4v", "map", "master", "mc", "md", "mdb",
    "mdf", "me", "mi", "mid", "midi", "mk", "mkv", "mm", "mng", "mo", "mobi",
    "mod", "mov", "mp2", "mp3", "mp4", "mpa", "mpd", "mpe", "mpeg", "mpg",
    "mpga", "mpp", "mpt", "msg", "msi", "msu", "nef", "nes", "nfo", "nix",
    "npmignore", "ocx", "odb", "ods", "odt", "ogg", "ogv", "ost", "otf",
    "ott", "ova", "ovf", "p12", "p7b", "pages", "part", "pcd", "pdb",
    "pdf", "pem", "pfx", "pgp", "ph", "phar", "php", "pid", "pkg", "pl",
    "plist", "pm", "png", "po", "pom", "pot", "potx", "pps", "ppsx",
    "ppt", "pptm", "pptx", "prop", "ps", "ps1", "psd", "psp", "pst",
    "pub", "py", "pyc", "qt", "ra", "ram", "rar", "raw", "rb", "rdf",
    "rdl", "reg", "resx", "retry", "rm", "rom", "rpm", "rpt", "rsa",
    "rss", "rst", "rtf", "ru", "rub", "sass", "scss", "sdf", "sed",
    "sh", "sit", "sitemap", "skin", "sldm", "sldx", "sln", "sol",
    "sphinx", "sql", "sqlite", "step", "stl", "svg", "swd", "swf", "swift",
    "swp", "sys", "tar", "tax", "tcsh", "tex", "tfignore", "tga", "tgz", "tif",
    "tiff", "tmp", "tmx", "torrent", "tpl", "ts", "tsv", "ttf", "twig", "txt",
    "udf", "vb", "vbproj", "vbs", "vcd", "vcf", "vcs", "vdi", "vdx", "vmdk",
    "vob", "vox", "vscodeignore", "vsd", "vss", "vst", "vsx", "vtx", "war", "wav",
    "wbk", "webinfo", "webm", "webp", "wma", "wmf", "wmv", "woff", "woff2", "wps",
    "wsf", "xaml", "xcf", "xfl", "xlm", "xls", "xlsm", "xlsx", "xlt", "xltm",
    "xltx", "xml", "xpi", "xps", "xrb", "xsd", "xsl", "xspf", "xz", "yaml", 
    "yml", "z", "zip", "zsh"];

function MessageInput() {
    this.$preInput = $('preinput', this);
    this.$preInput.on('change', this.eventHandler.preInputChange)
        .on('keyup', this.eventHandler.preInputKeyUp)
        .on('keypress', setTimeout.bind(window, this.notifySizeChange.bind(this), 1))
        .on('pasteimg', this.eventHandler.preInputPasteImg);
    //every can make size change
    this._imageFiles = [];
    this._files = [];

    this._latBound = {};

    this.$fileList = $('.as-message-input-file-list', this);
    this.$emojiBtn = $('.as-message-input-plugin-btn.as-message-input-plugin-emoji', this)
        .on('click', this.eventHandler.clickEmojiBtn);
    this.$fileBtn = $('.as-message-input-plugin-btn.as-message-input-plugin-file', this)
        .on('click', this.openFileDialog.bind(this));

    this.$extenalTool = $('.as-message-input-extenal-tools', this);
    this.$emojiPickerCtn = _('.as-message-input-extenal-tools-popup');
    this.$emojiPicker = _('emojipicker').addTo(this.$emojiPickerCtn)
        .on('pick', this.eventHandler.pickEmoji);
    this.$attachhook = _('attachhook').addTo(this).on('error', this.notifySizeChange.bind(this));
}


MessageInput.render = function (data) {
    data = data || {};
    return _({
        class: 'as-message-input',
        extendEvent: ['sizechange'],
        child: [
            {
                class: 'as-message-input-extenal-tools',
                child: [

                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-emoji'],
                        child: 'span.mdi.mdi-sticker-emoji'
                    },
                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-image'],
                        child: 'span.mdi.mdi-image'
                    },

                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-file'],

                        child: 'span.mdi.mdi-paperclip'
                    }

                ]
            },
            {
                class: 'as-message-input-body',
                child: [
                    'preinput.as-message-input-text-input.absol-bscroller'
                ]
            },
            {
                class: 'as-message-input-file-list'
            }
        ]
    });
};

MessageInput.prototype.toggleEmoji = function () {
    if (this.containsClass('as-message-input-show-emoji'))
        this.closeEmoji();
    else
        this.showEmoji();
};


MessageInput.prototype.showEmoji = function () {
    if (this.containsClass('as-message-input-show-emoji')) return;
    var value = this.$preInput.value;
    this._lastInputSelectPosion = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
    this.addClass('as-message-input-show-emoji');
    this.$extenalTool.addChild(this.$emojiPickerCtn);
    var thisMi = this;
    setTimeout(function () {
        $(document.body).on('mousedown', thisMi.eventHandler.mousedownOutEmoji);

    }, 100);
};


MessageInput.prototype.addImageFiles = function (imageFiles) {
    var iFile;
    for (var i = 0; i < imageFiles.length; ++i) {
        iFile = imageFiles[i];
        console.log(iFile.name);

    }
};

MessageInput.prototype.closeEmoji = function () {
    if (!this.containsClass('as-message-input-show-emoji')) return;
    this.removeClass('as-message-input-show-emoji');
    this.$extenalTool.removeChild(this.$emojiPickerCtn);
    $(document.body).off('mousedown', this.eventHandler.mousedownOutEmoji);
};

MessageInput.prototype.openFileDialog = function () {
    var thisMi = this;
    openFileDialog({ multiple: true }).then(function (files) {
        if (files.length > 0)
            thisMi.addImageFiles(files);
    });
};


MessageInput.prototype.openImageFileDialog = function () {
    openFileDialog({ multiple: true }).then(function (files) {

    });
};


MessageInput.prototype.notifySizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._latBound.width != bound.width || this._latBound.height != bound.height) {
        this._latBound.width = bound.width;
        this._latBound.height = bound.height;
        this.emit('sizechange', { name: 'sizechange', bound: bound, target: this }, this);
    }
};



MessageInput.eventHandler = {};

MessageInput.eventHandler.preInputChange = function (event) {
    this.notifySizeChange();
};

MessageInput.eventHandler.preInputKeyUp = function (event) {
    var value = this.$preInput.value;
    this._lastInputSelectPosion = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
};

MessageInput.eventHandler.preInputPasteImg = function (event) {

};


MessageInput.eventHandler.clickEmojiBtn = function () {
    this.toggleEmoji();
};

MessageInput.eventHandler.mousedownOutEmoji = function (event) {
    if (EventEmitter.hitElement(this.$emojiPicker, event) || EventEmitter.hitElement(this.$emojiBtn, event)) return;
    this.closeEmoji();
};

MessageInput.eventHandler.pickEmoji = function (event) {
    var text = this.$preInput.value;
    var newText = text.substr(0, this._lastInputSelectPosion.start) + event.key + text.substr(this._lastInputSelectPosion.end);
    var selected = this._lastInputSelectPosion;
    var newOffset = selected.start + event.key.length;
    this._lastInputSelectPosion = { start: newOffset, end: newOffset };
    this.$preInput.applyData(newText, newOffset);
    this.$preInput.commitChange(newText, newOffset);
    this.notifySizeChange();
    this.$preInput.focus();//older firefox version will be lost focus
};

ACore.install('messageinput', MessageInput);

export default MessageInput;