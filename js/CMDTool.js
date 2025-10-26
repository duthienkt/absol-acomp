import '../css/cmdtool.css';
import RibbonButton from "./RibbonButton";
import Fragment from 'absol/src/AppPattern/Fragment';
import SolidColorPicker from "./colorpicker/SolidColorPicker";
import { findMaxZIndex } from "./utils";
import Rectangle from "absol/src/Math/Rectangle";
import { getScreenSize } from "absol/src/HTML5/Dom";
import StaticTabbar from "./StaticTabbar";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";
import ACore, { $, _ } from "../ACore";
import { stringHashCode } from "absol/src/String/stringUtils";

/**
 * @typedef {Object} CMDTabListNodeDeclaration
 * @property {"tab_list"} type
 * @property {CMDTabNodeDeclaration[]} children
 */

/**
 * @typedef {Object} CMDTabNodeDeclaration
 * @property {"tab"} type
 * @property {string} name
 * @property {CMDGrupX2NodeDeclaration[]|CMDgroup_x1NodeDeclaration[]} children
 */


/**
 * @typedef {Object} CMDGrupX2NodeDeclaration
 * @property {"group_x2"} type
 * @property {CMDGrupX2NodeDeclaration[]|CMDgroup_x1NodeDeclaration[]} children
 */


/**
 * @typedef {Object} CMDgroup_x1NodeDeclaration
 * @property {"group_x1"} type
 * @property {CMDGrupX2NodeDeclaration[]|CMDgroup_x1NodeDeclaration[]} children
 */

/**
 * @typedef {Object} CMDCommandNodeDeclaration
 * @property {"trigger"|"font"|"color"} type
 */


/**
 * @extends Fragment
 * @constructor
 */
function CMDTool() {
    Fragment.call(this);
    this.$nodes = {};
    OOP.drillProperty(this, this, '$buttons', '$nodes');//adapt old version
    this.updateVisibility = this.updateVisibility.bind(this);
}

OOP.mixClass(CMDTool, Fragment);


CMDTool.prototype.onStart = function () {
    this.getView();
};

/**
 *
 * if param is empty, update all buttons
 */
CMDTool.prototype.updateVisibility = function (...args) {
    var delegate = this.delegate;
    if (!delegate) return;
    var keys = [];
    if (args.length === 0) {
        keys = Object.keys(this.$nodes).filter(k => k !== 'undefined');//remove apt nodes
    }
    else {
        keys = args.reduce((ac, cr) => {
            if (Array.isArray(cr)) ac = ac.concat(cr);
            else if (typeof cr === "string") ac.push(cr);
            return ac;
        }, []);
    }

    keys.forEach((name) => {
        if (!this.$nodes[name]) return;
        var descriptor = delegate.getCmdDescriptor(name);
        if (!descriptor) return;
        this.updateNode(this.$nodes[name], descriptor);

    });
};

CMDTool.prototype.onResume = function () {
    this.updateVisibility();
};


CMDTool.prototype.getView = function () {
    if (this.$view) return this.$view;
    this.$view = _({
        tag: 'bscroller',
        class: "as-form-cmd-tool",
    });

    this.refresh();
    return this.$view;
};

CMDTool.prototype.createNode = function (nd, par) {
    var handler;
    if (Array.isArray(nd)) {
        nd = { type: 'group_x2', children: nd };
        handler = this.cmdNodeHandlers[nd.type];
    }
    else if (typeof nd === "string") {
        nd = Object.assign({ name: nd, type: 'trigger' }, this.delegate.getCmdDescriptor(nd));
        if (typeof nd.desc === "function") {
            nd.desc = nd.desc.call(this.delegate);
        }
        handler = this.cmdNodeHandlers[nd.type];
    }
    else
        handler = this.cmdNodeHandlers[nd.type];


    var nodeElt = null;
    if (handler) {
        nodeElt = handler.create.call(this, nd, par);
        nodeElt.descriptor = nd;
        nodeElt.parentDescriptor = par;
        this.$nodes[nd.name] = nodeElt;
    }
    else {
        console.error("Not support node type: ", nd.type, nd);
    }

    return nodeElt;
};

CMDTool.prototype.updateNode = function (nodeElt, nd) {
    if (!nodeElt) return;
    nd = Object.assign({}, nodeElt.descriptor, { disabled: false }, nd);//default disabled = false
    if (typeof nd.desc === "function") {
        nd.desc = nd.desc.call(this.delegate);
    }
    nodeElt.descriptor = nd;
    var par = nodeElt.parentDescriptor;
    var handler = this.cmdNodeHandlers[nd.type];
    if (handler) {
        if (handler.update)
            handler.update.call(this, nd, par, nodeElt);
    }
    else {
        console.error("Not support node type: ", nd.type, nd);
    }
};


CMDTool.prototype.refresh = function () {
    var delegate = this.delegate;
    if (!delegate) return;
    this.getView();
    var groupTree = delegate.getCmdGroupTree();
    var hash = this.hashOf(groupTree);
    if (hash === this._lastGroupTreeHash) {
        this.updateVisibility();
        return;
    }
    else {
        this._lastGroupTreeHash = hash;
    }
    this.$view.clearChild();
    this.$nodes = {};
    var visit = (node) => {
        return this.createNode(node, null);
    }
    this.$view.addChild(visit(groupTree));
};

CMDTool.prototype.hashOf = function (nd) {
    if (nd === null) return 0;

    if (nd === undefined) return 0;
    var s = '';
    var keys;
    if (typeof nd === "object") {
        s += '{';
        keys = Object.keys(nd);
        keys.sort();
        s += keys.map(k => k + ':' + this.hashOf(nd[k])).join(',');
        s += '}'
    }
    else if (Array.isArray(nd)) {
        s += '[';
        s += nd.map(item => this.hashOf(item)).join(',');
        s += ']';
    }
    else {
        s += nd + '';
    }
    return stringHashCode(s);
};


CMDTool.prototype.cmdNodeHandlers = {
    tab_list: {
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        create: function (nd, par) {
            var items = nd.children.filter(c => c.type === 'tab').map((ch, idx) => {
                return {
                    text: ch.name,
                    value: idx + ''
                };
            });
            if (!this.$tabBar) {
                this.$tabBar = _({
                    tag: StaticTabbar,
                    style: {
                        size: 'small',
                        display: 'inline-block',
                        marginBottom: '5px'
                    },
                    props: {
                        value: '0'
                    },
                    on: {
                        change: () => {
                            var idx = parseInt(this.$tabBar.value);
                            this.$frames.forEach((frame, i) => {
                                frame.addStyle('display', i === idx ? '' : 'none');
                            });
                            ResizeSystem.updateUp(this.$tabBar);
                        }
                    }
                });
                this.$tabBarCtn = _({
                    style: {
                        textAlign: 'center',
                        backgroundColor: 'rgba(169, 169, 169, 0.15)'

                    },
                    child: [this.$tabBar]
                });

            }

            if (!this.$leftCtn) {
                this.$leftCtn = _({
                    class: 'as-cmd-tool-left-ctn'
                });
            }

            this.$tabBar.items = items;
            if (!items[this.$tabBar.value]) this.$tabBar.value = '0';
            if (!this.$tabList) {
                this.$tabList = _({
                    class: 'as-cmd-tool-tab-list',

                });
            }
            this.$leftCtn.clearChild();
            this.$tabList.clearChild();
            this.$tabList.addChild(this.$leftCtn);
            this.$tabList.addChild(this.$tabBarCtn);


            this.$frames = nd.children.filter(c => c.type === 'tab').map((ch, idx) => {
                return this.createNode(ch, nd).addStyle('display', idx + '' === this.$tabBar.value ? '' : 'none').addStyle({
                    'textAlign': 'left',
                    gridColumn: '1 / span 2'
                });
            });
            this.$tabList.addChild(this.$frames);
            this.$leftGroups = nd.children.filter(c => c.type === 'left_group').map((ch) => {
                return this.createNode(ch, nd);
            });
            this.$leftCtn.addChild(this.$leftGroups);
            return this.$tabList;
        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        update: function (nd, par) {

        }
    },
    tab: {
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        create: function (nd, par) {
            return _({
                class: 'as-cmd-tool-tab',
                attr: {
                    'data-name': nd.name
                },
                child: (nd.children || []).map((ch) => {
                    return this.createNode(ch, nd);
                })
            });
        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        update: function (nd, par) {

        }
    },
    group_x2: {
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        create: function (nd, par) {
            return _({
                class: 'as-cmd-tool-group-x2',
                child: (nd.children || []).map((ch) => {
                    return this.createNode(ch, nd);
                })
            });
        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        update: function (nd, par) {

        }
    },
    group_x1: {
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        create: function (nd, par) {
            return _({});

        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        update: function (nd, par) {

        }
    },
    trigger: {
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         */
        create: function (nd, par) {
            var extClasses = (!par || ['array', 'group_x2'].indexOf(par.type) >= 0) ? ['as-big'] : [];
            var title = nd.desc;
            var btn = _({
                tag: RibbonButton,
                class: extClasses,
                attr: { title: title, 'data-cmd-name': nd.name },
                props: {
                    disabled: !!nd.disabled,
                    descriptor: nd,
                    text: nd.desc,
                    icon: nd.icon,
                },
                on: {
                    click: () => {
                        this.execCmd.apply(this, [nd.name].concat(btn.descriptor.args || []));
                    }
                }
            });
            this.$nodes[nd.name] = btn;

            return btn;
        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         * @param nodeElt
         */
        update: function (nd, par, nodeElt) {
            nodeElt.disabled = !!nd.disabled;
            nodeElt.text = nd.desc;
            nodeElt.icon = nd.icon;
        }
    },
    toggle_switch: {
        /**
         * @this {CMDTool}
         */
        create: function (nd, par) {
            var name = nd.name;
            var self = this;
            var title = nd.desc;
            var btn = _({
                tag: RibbonButton,
                class: ['as-type-toggle-switch', 'as-big'],
                attr: {
                    title: title,
                    'data-group': nd.group,
                    "data-name": name,
                    'data-cmd-name': name
                },
                props: {
                    text: nd.desc,
                    icon: nd.icon,
                    disabled: !!nd.disabled,
                    descriptor: nd
                },
                on: {
                    click: function () {
                        var newChecked = !this.hasClass('as-checked');
                        if (newChecked && nd.group)
                            Object.keys(self.$nodes).forEach(function (otherName) {
                                var otherBtn = self.$nodes[otherName];
                                if (otherName === name) return;
                                if (otherBtn.hasClass('as-type-toggle-switch')
                                    && otherBtn.descriptor.group === nd.group
                                    && otherBtn.hasClass('as-checked')) {
                                    otherBtn.removeClass('as-checked');
                                    self.execCmd.apply(self, [otherBtn.attr('data-name'), false].concat(otherBtn.descriptor.args || []));
                                }
                            });
                        if (newChecked) {
                            this.addClass('as-checked');
                        }
                        else {
                            this.removeClass('as-checked');
                        }
                        self.execCmd.apply(self, [name, newChecked].concat(nd.args || []));
                    }
                }
            });
            if (nd.checked)
                btn.addClass('as-checked');
            return btn;
        },
        /**
         * @this {CMDTool}
         * @param nd
         * @param par
         * @param nodeElt
         */
        update: function (nd, par, nodeElt) {
            if (nd.checked)
                nodeElt.addClass('as-checked');
            else {
                nodeElt.removeClass('as-checked');
            }
            nodeElt.disabled = !!nd.disabled;
            nodeElt.text = nd.desc;
            nodeElt.icon = nd.icon;
        }
    },
    ribbon: {
        create: function (nd, par) {
            var name = nd.name;
            var self = this;
            var btn = _({
                tag: RibbonButton.tag,
                class: 'as-big',
                attr: {
                    'data-cmd-name': name
                },
                props: {
                    icon: nd.icon || nd.items[0].icon,
                    items: nd.items,
                    descriptor: nd,
                    disabled: !!nd.disabled,
                    text: nd.desc
                },
                on: {
                    select: function (event) {
                        //select a item in menu
                        var item = event.item;
                        this.icon = item.icon;
                        self.execCmd.apply(self, [name].concat(item.args || []).concat(this.descriptor.args || []));
                    },

                }
            });
            return btn;
        },
        update: function (nd, par, nodeElt) {
            nodeElt.items = nd.items;
        }
    },
    color: {
        create: function (nd, par) {
            var name = nd.name;
            var btn = _({
                tag: RibbonButton,
                class: ['as-big', 'as-type-color'],
                style: {
                    '--value': nd.value || 'black'
                },
                props: {
                    icon: nd.icon,
                    descriptor: nd,
                    text: nd.desc,
                }
            });


            btn.on('click', () => {
                if (btn.hasClass('as-checked')) return;
                btn.addClass('as-checked');
                var onClickOut = (event) => {
                    if (hitElement(picker, event)) return;
                    finish();
                }
                var finish = () => {
                    btn.removeClass('as-checked');
                    picker.remove();
                    document.removeEventListener('click', onClickOut);
                };

                setTimeout(() => {
                    document.addEventListener('click', onClickOut);
                }, 100)

                var applyValue = value => {
                    btn.addStyle('--value', value.toString('hex6'));
                    //todo: call cmd
                    this.execCmd(name, value);
                }

                var picker = _({
                    tag: SolidColorPicker,
                    style: {
                        position: 'fixed',
                        left: '0px',
                        top: '0px',
                        zIndex: findMaxZIndex(btn) + 1 + '',
                        visibility: 'hidden'
                    },
                    props: {
                        value: nd.value || 'black'
                    }
                }).addTo(document.body);

                var pickerBound = Rectangle.fromClientRect(picker.getBoundingClientRect());
                var btnBound = Rectangle.fromClientRect(btn.getBoundingClientRect());
                var screenSize = getScreenSize();
                var screenBound = new Rectangle(0, 0, screenSize.width, screenSize.height);
                var aBounds = [
                    new Rectangle(btnBound.x, btnBound.y + btnBound.height,
                        pickerBound.width, pickerBound.height),
                    new Rectangle(btnBound.x + btnBound.width - pickerBound.width, btnBound.y + btnBound.height, pickerBound.width, pickerBound.height),
                    new Rectangle(btnBound.x, btnBound.y - pickerBound.height, pickerBound.width, pickerBound.height),
                    new Rectangle(btnBound.x + btnBound.width - pickerBound.width, btnBound.y - pickerBound.height, pickerBound.width, pickerBound.height)
                ];

                var bestSquare = 0;
                var bestBound;
                var square;
                for (var i = 0; i < aBounds.length; ++i) {
                    square = aBounds[i].collapsedSquare(screenBound);
                    if (square > bestSquare) {
                        bestSquare = square;
                        bestBound = aBounds[i];
                    }
                }

                picker.addStyle({
                    left: bestBound.x + 'px',
                    top: bestBound.y + 'px',
                    visibility: 'visible'
                });

                picker.on('change', (event) => {
                    applyValue(picker.value);
                });
                picker.on('submit', (event) => {
                    finish();
                });
            });
            return btn;
        },
        update: function (nd, par, nodeElt) {
            nodeElt.addStyle('--value', nd.value || 'black');
        }
    },
    font: {
        create: function (nd, par) {
            var btn = _({
                tag: RibbonButton,
                props: {
                    icon: nd.icon,
                    text: nd.desc,
                }
            });

            return btn;
        },
        update: function (nd, par, nodeElt) {

        }
    },
    left_group: {
        create: function (nd, par) {
            var groupElt = _({
                class: 'as-cmd-tool-left-group',
                child: nd.children.map((ch) => {
                    return this.createNode(ch, nd);
                }),
            });


            return groupElt;
        }
    }
};


CMDTool.prototype.execCmd = function () {
    if (this._delegate)
        this._delegate.execCmd.apply(this._delegate, arguments);
};


Object.defineProperty(CMDTool.prototype, 'delegate', {
    /**
     *
     * @param {CMDToolDelegate} value
     */
    set: function (value) {
        if (this._delegate) {
            this._delegate.cmdToolPartner = null;
        }
        this._delegate = value;
        if (this._delegate) {
            this._delegate.cmdToolPartner = this;
        }

    },
    get: function () {
        return this._delegate;
    }
});


export default CMDTool;


export function CMDToolDelegate() {
    /**
     *
     * @type {null|CMDTool}
     */
    this.cmdToolPartner = null;
    /**
     * @type {null|CMDRunner}
     * @name cmdRunner
     * @memberOf CMDToolDelegate#
     */
}

/**
 *
 * @returns {*[]}
 */
CMDToolDelegate.prototype.getCmdGroupTree = function () {
    return [];
};

/**
 *
 * @param name
 * @returns {{type: string, icon: string, desc}} - return default descriptor
 */
CMDToolDelegate.prototype.getCmdDescriptor = function (name) {
    return {
        type: 'trigger',
        icon: 'span.mdi.mdi-command',
        desc: name
    };
};

CMDToolDelegate.prototype.execCmd = function (name, ...args) {
    if (this.cmdRunner)
        return this.cmdRunner.invoke(name, ...args);
};

CMDToolDelegate.prototype.refresh = function () {
    if (this.cmdToolPartner)
        this.cmdToolPartner.refresh();
};

CMDToolDelegate.prototype.updateVisibility = function (...args) {
    if (this.cmdToolPartner)
        this.cmdToolPartner.updateVisibility(...args);
};

