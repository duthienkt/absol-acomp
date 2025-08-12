var ELECmdTree = {
    type: 'tab_list',
    children: [
        {
            type: 'tab',
            name: 'Home',
            children: [
                {
                    type: 'group_x2',
                    children: ['runTest']
                },
                {
                    type: 'group_x2',
                    children: [
                        'save',
                        'saveAs',
                        'saveAsSystem'
                    ]
                },
                {
                    type: 'group_x2',
                    children: [
                        'undo',
                        'redo',
                        'toggleHistory'
                    ]
                },

                {
                    type: 'group_x2',
                    children: [
                        'cut',
                        'copy',
                        'paste',
                        'delete'
                    ]
                }
            ]
        },
        {
            type: 'tab',
            name: 'Edit',
            children: [
                {
                    type: 'group_x2',
                    children: [
                        'addComponent'
                    ]
                },
                {
                    type: 'group_x2',
                    children: [
                        'pageSetting',
                        'editRootLayout',
                        'selectAll',
                        'setSelectMode'
                    ]
                },
                {
                    type: 'group_x2',
                    children: [
                        'moveOrderToFirst',
                        'moveOrderToPrevious',
                        'moveOrderToNext',
                        'moveOrderToLast'
                    ]
                }
            ]
        },
        {
            type: 'tab',
            name: 'Data',
            children: [
                {
                    type: 'group_x2',
                    children: [
                        'importFromJson',
                        'export2Json',
                        'export2sharpEncode',
                        'export2clipboard',
                    ]
                }
            ]
        },

        {
            type: 'tab',
            name: 'Layout & Format'
        },
        {
            type:'left_group',
            children: ['save']
        }
    ]
};



var delegate = new absol.CMDToolDelegate();
var cmdTool = new absol.CMDTool();
cmdTool.getView().addTo(document.body);

delegate.getCmdGroupTree = function () {
    return ELECmdTree;
};

delegate.getCmdDescriptor = function (name) {
    return {
        type: 'trigger',
        name: name,
        icon: 'span.mdi.mdi-apple-keyboard-command',
        desc: name
    }
};

cmdTool.delegate = delegate;
cmdTool.refresh();

