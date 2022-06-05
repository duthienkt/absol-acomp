import { $, _ } from "../../../ACore";
import { generateJSVariable } from "absol/src/JSMaker/generator";
import FlexiconButton from "../../FlexiconButton";
import Modal from "../../Modal";
import MessageDialog from "../../MessageDialog";
import { randomIdent } from "absol/src/String/stringGenerate";
import RadioInput from "../../RadioInput";
import { stringHashCode } from "absol/src/String/stringUtils";
import RadioButton from "../../RadioButton";
import OMTSelectOptionsDialog from "../dialog/OMTSelectOptionsDialog";

/**
 *
 * @constructor
 */
function OMTBaseType(tool, parent, descriptor) {
    this.tool = tool;
    this.parent = parent;
    this.level = parent ? parent.level + 1 : 0;
    this.descriptor = descriptor;
    this.render();
    this.elt.omtNode = this;
}

OMTBaseType.prototype.type = 'base';

OMTBaseType.prototype.commands = [
    {
        name: 'select_other',
        icon: 'span.mdi.mdi-menu-down',
        title: 'Select'
    }
];

OMTBaseType.prototype.render = function () {
    var self = this;
    var displayName = 'ROOT';
    if (this.descriptor.displayName !== undefined) displayName = this.descriptor.displayName + '';
    else if (this.descriptor.name !== undefined) displayName = this.descriptor.name + '';
    if (this.descriptor.desc) displayName += this.descriptor.desc;
    this.elt = _({
        class: ['as-omt-field', 'as-type-' + this.type],
        style: {
            '--level': this.level
        },
        child: [
            {
                class: 'as-omt-field-header',
                child: [
                    {
                        class: 'as-omt-field-name',
                        child: {
                            text: displayName
                        }
                    }
                ]
            },
            {
                class: 'as-omt-field-body'
            },
            {
                class: 'as-omt-field-raw-ctn'
            },
            {
                class: 'as-omt-field-command-ctn',
                child: this.commands.map(command => ({
                    tag: FlexiconButton.tag,
                    props: {
                        icon: command.icon,
                        title: command.title
                    },
                    on: {
                        click: this.execCmd.bind(this, command.name, command)
                    }
                }))
            }
        ],
        on: {
            dblclick: function (event) {
                var target = event.target;
                while (target) {
                    if (target === this) break;
                    if (target.tagName === 'BUTTON') return;
                    target = target.parentElement;
                }
                this.execCmd('select_other');
            }.bind(this)
        }
    });
    this.$commandCtn = $('.as-omt-field-command-ctn', this.elt);
    this.$rawCtn = $('.as-omt-field-raw-ctn', this.elt);
    this.$viewModeBtn = _({
        tag: FlexiconButton.tag,
        props: {
            icon: 'span.mdi.mdi.mdi-code-braces',//code-braces
            title: 'View Raw'
        },
        on: {
            click: function () {
                if (self.elt.hasClass('as-mode-raw')) {
                    self.elt.removeClass('as-mode-raw');
                    this.icon = 'span.mdi.mdi-code-braces';
                    this.title = 'View Raw';
                }
                else {
                    self.elt.addClass('as-mode-raw');
                    this.icon = 'span.mdi.mdi-view-dashboard-edit-outline';
                    this.title = 'View Guide';
                    self.updateRaw();
                }
            }
        }
    });
    this.$commandCtn.addChild(this.$viewModeBtn);
    this.$body = $('.as-omt-field-body', this.elt);
};

OMTBaseType.prototype.updateRaw = function () {
    var rawElt = _(this.getRaw());
    this.$rawCtn.clearChild().addChild(rawElt);
};


OMTBaseType.prototype.getRaw = function () {
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT")+': ' }
            },
            {
                tag: 'code',
                child: { text: generateJSVariable(this.export()) }
            }
        ]
    };
};

OMTBaseType.prototype.assign = function (o) {
    this.value = o;
    this.$body.clearChild().addChild(_({
        tag: 'code',
        child: {
            text: generateJSVariable(o)
        }
    }));
};

OMTBaseType.prototype.getHash = function () {
    return stringHashCode(generateJSVariable(this.export()));
};


OMTBaseType.prototype.export = function () {
    return this.value;
};

OMTBaseType.prototype.execCmd = function (commandName, command) {
    if (commandName === 'select_other') {
        this.userSelect();
    }
};

OMTBaseType.prototype.getSelectOptions = function () {
    if (!this.parent) return this.tool.objects;
    var parentOptions = this.parent.getSelectOptions().filter(x => !!x);
    var name = this.descriptor.name;
    return parentOptions.map(ot => ot[name]).filter(ot => ot !== undefined);
};

OMTBaseType.prototype.userSelect = function () {
    new OMTSelectOptionsDialog(this);
    return;

    var self = this;
    var options = this.getSelectOptions();
    var ident = randomIdent(5);
    var curHash = this.getHash();
    var selectedHash = curHash;
    var selectedOption = null;
    var hashDict = {};

    var dialog = _({
        tag: MessageDialog.tag,
        class: 'as-omt-dialog',
        props: {
            dialogTitle: 'Options',
            dialogActions: [
                {
                    class: 'secondary',
                    text: 'Cancel',
                    name: 'cancel'
                },
                {
                    class: 'primary',
                    text: 'OK',
                    name: 'ok'
                }
            ]
        },
        on: {
            action: function (event) {
                var action = event.action;
                modal.remove();
                if (action.name === 'cancel') return;
                if (action.name === 'ok') {
                    if (selectedHash !== curHash) {
                        self.assign(selectedOption);
                        self.updateRaw();
                        self.tool.notifyChange();
                    }
                }
            }
        }
    });

    var makeOption = (ot, i) => {
        var descriptor = Object.assign({}, this.descriptor);
        if (i === -1) {
            descriptor.desc = '(current-mixed)';
        }
        var node = OMTBaseType.make(this.tool, this.parent, descriptor);
        node.assign(ot);
        var nodeHash = node.getHash();
        if (hashDict[nodeHash]) return;
        hashDict[nodeHash] = node;
        var radio = _({
            tag: RadioButton.tag,
            style: {
                marginRight: '10px'
            },
            props: {
                name: ident,
                checked: nodeHash === curHash
            },
            on: {
                change: function () {
                    if (radio.checked) {
                        selectedHash = nodeHash;
                        selectedOption = ot;
                    }
                }
            }
        });
        var row = _({
            class: 'as-omt-option-row',
            child: [
                radio,
                node.elt
            ]
        });

        return row;
    };
    var rows = options.map(makeOption).filter(x => !!x);
    if (!hashDict[curHash]) {
        rows.unshift(makeOption(this.export(), -1));
    }

    dialog.addChild(rows);


    var modal = _({
        tag: Modal.tag,
        child: dialog
    });
    document.body.appendChild(modal);
};


OMTBaseType.classes = {};

/***
 *
 * @param tool
 * @param parent
 * @param descriptor
 * @returns {OMTBaseType}
 */
OMTBaseType.make = function (tool, parent, descriptor) {
    var clazz = OMTBaseType.classes[descriptor.type] || OMTBaseType;
    return new clazz(tool, parent, descriptor);
};


export default OMTBaseType;