import '../css/verticaltreediagram.css';

import ACore, {_, $} from '../ACore';
import OOP from "absol/src/HTML5/OOP";

export function VerticalTreeDiagramNode() {
    this.$childCtn = $('.as-vertical-tree-diagram-child-ctn', this);
    this.$name = $('.as-vertical-tree-diagram-node-name', this);
    OOP.drillProperty(this, this.$name.firstChild, 'name', 'data');
    this.name = "UndefinedNodeName";
}

VerticalTreeDiagramNode.tag = 'VerticalTreeDiagramNode'.toLowerCase();


VerticalTreeDiagramNode.render = function () {
    return _({
        class: 'as-vertical-tree-diagram-node',
        child: [
            {
                class: 'as-vertical-tree-diagram-node-name-ctn',
                child: {
                    class: 'as-vertical-tree-diagram-node-name',
                    child: { text: "" }
                }
            },
            {
                class: 'as-vertical-tree-diagram-child-ctn'
            }
        ]
    });
};

['addChild', 'removeChild', 'clearChild', 'addChildBefore', 'addChildAfter',
    'findChildBefore', 'findChildAfter'
].forEach(function (name) {
    VerticalTreeDiagramNode.prototype[name] = function () {
        this.$childCtn[name].apply(this.$childCtn, arguments);
        if (this.$childCtn.childNodes.length > 0) {
            this.addClass('as-has-child');
            if (this.$childCtn.childNodes.length === 1) {
                this.addClass('as-has-1-child');
            }
            else {
                this.removeClass('as-has-1-child');
            }
        }
        else {
            this.removeClass('as-has-child');
            this.removeClass('as-has-1-child');
        }
    };
});


function VerticalTreeDiagram(data) {
    this.data = data || {};
}

VerticalTreeDiagram.tag = 'VerticalTreeDiagram'.toLowerCase();

VerticalTreeDiagram.render = function () {
    return _(VerticalTreeDiagramNode.tag, true);
}

VerticalTreeDiagram.property = {};

VerticalTreeDiagram.property.data = {
    set: function (data) {
        data = data || {};
        this._data = data;

        function makeNode(nodeData) {
            return _({
                tag: VerticalTreeDiagramNode.tag,
                props: {
                    name: nodeData.name
                },
                child: (nodeData.child && nodeData.child.length > 0 && nodeData.child.map(makeNode)) || []
            });
        }

        this.name = data.name + '';
        this.clearChild();
        if (data.child)
            this.addChild(data.child.map(makeNode));
    },
    get: function () {
        return this._data;
    }
};

ACore.install(VerticalTreeDiagramNode);
ACore.install(VerticalTreeDiagram);

export default VerticalTreeDiagram;

