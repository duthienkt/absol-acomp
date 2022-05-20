// if ('CKEDITOR' in window)


import { isDomNode } from "absol/src/HTML5/Dom";
import { $ } from "../../ACore";

function CKEditorWrapper(sync) {
    this.editor = null;
    var bk = ['on', 'setData'].reduce(function (ac, cr){
        var f = this[cr];

        this[cr] = function (){
            var args = Array.prototype.slice.call(arguments);
            console.log(args)
            sync.then(function (editor){
                editor[cr].apply(editor, args);
            })
        }
        ac[cr] = f;
        return ac;
    }.bind(this), {})
    this.sync = sync.then(function (editor) {
        this.editor = editor;
        Object.assign(this, bk);
        return editor;
    }.bind(this));
}

CKEditorWrapper.prototype.on = function () {
    this.editor.on.apply(this.editor, arguments);
};


CKEditorWrapper.prototype.getData = function () {
    return this.editor && this.editor.getData();
};

export default function makeCKEditor4Compatible() {
    if ('CKEDITOR' in window) return;
    var CKEDITOR = {}
    window.CKEDITOR = CKEDITOR;
    CKEDITOR.stylesSet = {};
    CKEDITOR.stylesSet.add = function () {
    };
    CKEDITOR.plugins = {};
    CKEDITOR.plugins.add = function () {
    };

    CKEDITOR.replace = function (elt) {
        elt = $(elt);
        var e;
        return new CKEditorWrapper(CKEDITOR5.ClassicEditor.create(elt)
            .catch(error => {
                console.error(error);
            }));
    }

    CKEDITOR.inline = function (elt) {
        elt = $(elt);
        return new CKEditorWrapper(CKEDITOR5.ClassicEditor.create(elt)
            .catch(error => {
                console.error(error);
            }));
    }

}
