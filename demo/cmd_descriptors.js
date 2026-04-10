module.exports = {
    'new': {
        type: 'trigger',
        desc: "New",
        icon: 'span.mdi.mdi-file-plus-outline'
    },
    reload:{
        type: 'trigger',
        desc: "Reload",
        icon: 'span.mdi.mdi-reload'
    },
    editRootLayout: {
        type: 'trigger',
        desc: "Edit Root Layout",
        icon: 'span.mdi.mdi-border-outside'
    },
    edit: {
        type: 'trigger',
        icon: 'span.mdi.mdi-pencil-outline',
        desc: 'Edit'
    },
    preview: {
        type: 'trigger',
        icon: 'span.mdi.mdi-play',
        desc: 'Preview',
        bindKey: { win: 'Ctrl-K', mac: 'TODO?' }
    },
    runTest: {
        type: 'trigger',
        icon: 'span.mdi.mdi-bug-play[style="color:rgb(155, 30, 255)"]',
        desc: 'Run Test'
    },
    cut: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-cut',
        desc: 'Cut',
        bindKey: { win: 'Ctrl-X', mac: 'TODO?' }
    },
    copy: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-copy',
        desc: 'Copy',
        bindKey: { win: 'Ctrl-C', mac: 'TODO?' }
    },
    paste: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-paste',
        desc: 'Paste',
        bindKey: { win: 'Ctrl-V', mac: 'TODO?' }
    },
    pasteSCBlock: {
        type: 'ribbon',
        desc: 'Depth Select',
        icon: 'span.mdi.mdi-content-paste',
        items: [
            {
                text: 'Paste In',
                icon: 'span.mdi.mdi-content-paste',
                args: ['IN']
            },
            {
                text: 'Paste Before',
                icon: 'span.mdi.mdi-content-paste',
                args: ['BEFORE']
            },
            {
                text: 'Paste After',
                icon: 'span.mdi.mdi-content-paste',
                args: ['AFTER']
            }
        ]
    },
    viewClipboard: {
        type: 'trigger',
        icon: 'clipboard-view-ico',
        desc: 'View Clipboard',
    },
    delete: {
        type: 'trigger',
        icon: 'span.mdi.mdi-delete-variant',
        desc: 'Delete',
        bindKey: { win: 'Delete', mac: 'Delete' }

    },
    save: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-save',
        desc: 'Save',
        bindKey: { win: 'Ctrl-S', mac: '//todo' }
    },
    save2: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-save',
        desc: 'Save',
        bindKey: { win: 'Ctrl-S', mac: '//todo' }
    },
    saveAs: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-save-edit',
        desc: 'Save As'
    },
    saveAsSystem: {
        type: 'trigger',
        icon: 'span.mdi.mdi-content-save-cog-outline',
        desc: 'Save As System'
    },
    saveCircuit:{
        type: 'trigger',
        icon:'savecircuitico',
        desc: 'Save Circuit'
    },
    importFromJson: {
        type: 'trigger',
        icon: 'span.mdi.mdi-cloud-upload[style="color:#1da8f2"]',
        desc: 'Import From JSON',
        bindKey: { win: 'Ctrl-Shift-I', mac: 'TODO?' }
    },
    importFromFile: {
        type: 'trigger',
        icon: 'span.mdi.mdi-cloud-upload[style="color:#1da8f2"]',
        desc: 'Import From File',
        bindKey: { win: 'Ctrl-Shift-I', mac: 'TODO?' }
    },
    export2Json: {
        type: 'trigger',
        icon: 'span.mdi.mdi-cloud-download-outline',
        desc: 'Export To JSON',
        bindKey: { win: 'Ctrl-Shift-E', mac: 'TODO?' }
    },
    export2sharpEncode: {
        type: 'trigger',
        icon: 'span.mdi.mdi-music-accidental-sharp',
        desc: 'Export Use EncodingClass',
        bindKey: { win: 'Ctrl-Shift-#', mac: 'TODO?' }
    },
    exportToFile: {
        type: 'trigger',
        icon: 'span.mdi.mdi-cloud-download-outline',
        desc: 'Export To File'
    },
    export2clipboard: {
        type: 'trigger',
        icon: 'span.mdi.mdi-clipboard-arrow-down-outline',
        desc: 'Copy JS To clipboard',
        // bindKey: { win: 'Ctrl-Shift-C', mac: 'TODO?' }
    },
    undo: {
        type: 'trigger',
        icon: 'span.mdi.mdi-undo',
        desc: 'Undo',
        bindKey: { win: 'Ctrl-Z', mac: 'TODO?' }
    },
    redo: {
        type: 'trigger',
        icon: 'span.mdi.mdi-redo',
        desc: 'Redo',
        bindKey: { win: 'Ctrl-Y', mac: 'TODO?' }
    },
    toggleHistory: {
        type: 'trigger',
        icon: 'history-ico',
        desc: 'Undo History',
        bindKey: { win: 'Ctrl-H', mac: 'TODO?' }
    },
    selectAll: {
        type: 'trigger',
        desc: 'Select All',
        icon: 'span.mdi.mdi-select-all',
        bindKey: { win: 'Ctrl-A', mac: 'TODO?' }
    },
    setSelectMode: {
        type: 'ribbon',
        desc: 'Depth Select',
        icon: 'span.mdi.mdi-selection',
        items: [
            {
                text: 'Select In Current Layout',
                icon: 'span.mdi.mdi-selection',
                args: ['CURRENT_LAYOUT']
            },
            {
                text: 'Depth Select',
                icon: 'depth-select-ico',
                args: ['DEPTH']
            }
        ]
    },
    zoomIn: {
        type: 'trigger',
        desc: 'Zoom In',
        icon: 'span.mdi.mdi-magnify-plus-outline'
    },
    zoomOut: {
        type: 'trigger',
        desc: 'Zoom Out',
        icon: 'span.mdi.mdi-magnify-minus-outline'
    },
    resetZoom: {
        type: 'trigger',
        desc: 'Reset Zoom ',
        icon: 'span.mdi.mdi-magnify-close'
    },

    autoAlignPosition: {
        type: 'trigger',
        icon: 'span.mdi.mdi-auto-fix',
        desc: 'Auto Align Position'
    },
    scrollIntoNodes: {
        type: 'trigger',
        icon: 'span.mdi.mdi-image-filter-center-focus-weak',
        desc: 'Scroll Into Nodes'

    },
    scrollIntoBlock: {
        type: 'trigger',
        icon: 'span.mdi.mdi-image-filter-center-focus-weak',
        desc: "Scroll Into Block"
    },
    openIncludedBlockManager: {
        type: 'trigger',
        icon: { tag: 'span', class: ['mdi', 'mdi-package-variant-plus'], style: { color: 'rgb(30, 200, 200)' } },
        desc: 'Included Block Manager'
    },

    system_owner_lock: {
        type: 'trigger',
        desc: "System Lock",
        icon: { tag: 'span', style: { color: 'red' }, class: ['mdi', 'mdi-lock-outline'] }
    },
    system_owner_unlock: {
        type: 'trigger',
        desc: "System Unlock",
        icon: { tag: 'span', style: { color: 'rgb(100, 100, 255)' }, class: ['mdi', 'mdi-lock-open-variant-outline'] }
    },
    addComponent: {
        type: 'trigger',
        icon: {
            tag: 'span',
            style: {
                color: 'rgb(68,138,251)'
            },
            class: ['mdi', 'mdi-shape-plus']
        },
        desc: 'Add Component'
    },
    transformComponentType: {
        type: 'trigger',
        icon: 'transform-ico'
    },
    moveUp: {
        type: 'trigger',
        icon: 'span.mdi.mdi-arrow-up',
        desc: 'Move Up'
    },
    moveDown: {
        type: 'trigger',
        icon: 'span.mdi.mdi-arrow-down',
        desc: 'Move Down'
    },
    remotePreview: {
        type: 'trigger',
        icon: 'span.mdi.mdi-cellphone-play',
        desc: 'Remote Preview'
    },
    editAsSCLang: {
        type: 'trigger',
        icon: 'span.mdi.mdi-text-box-edit-outline[style="color: green;"]',
        desc: 'Edit as Script'
    },
    pageSetting: {
        type: 'trigger',
        icon: 'span.mdi.mdi-file-cog-outline',
        desc: 'Page Setting(print)'
    },
    editContent: {
        type: 'trigger',
        icon: 'span.mdi.mdi-edit',
        desc: 'EditContent',
        bindKey: { win: 'F2', mac: 'TODO?' }
    },
    moveTo: {
        type: 'trigger',
        icon: 'span.mdi.mdi-swap-vertical',
        desc: 'Move To',
    },
    moveOrderToFirst: {
        type: 'trigger',
        icon: 'span.mdi.mdi-chevron-double-up',
        desc: 'Move To First',
        keyBinding: '⇧ + ↑'
    },
    moveOrderToPrevious: {
        type: 'trigger',
        icon: 'span.mdi.mdi-chevron-up',
        desc: 'Move To Previous',
        keyBinding: '↑'
    },
    moveOrderToNext: {
        type: 'trigger',
        icon: 'span.mdi.mdi-chevron-down',
        desc: 'Move To Next',
        keyBinding: '↓'
    },
    moveOrderToLast: {
        type: 'trigger',
        icon: 'span.mdi.mdi-chevron-double-down',
        desc: 'Move To Last',
        keyBinding: '⇧ + ↓'
    },
    formatFont: {
        type: 'font',
        icon: 'span.mdi.mdi-format-font',
        desc: 'Format Font'
    },
    hyperDisplayAs: {
        type: 'trigger',
        desc: 'Display As',
    },
    hyperDisplayAsInline: {
        type: 'trigger',
        desc: 'Inline',
        icon: 'span.mdi.mdi-format-wrap-inline'
    },
    hyperDisplayAsBlock: {
        type: 'trigger',
        desc: "Block",
        icon: 'span.mdi.mdi-view-array-outline'
    },
    hyperDisplayAsParagraph: {
        type: 'trigger',
        icon: 'span.mdi.mdi-view-day-outline',
        desc: 'Paragraph'
    },
    hyperDisplayFrontOfText: {
        type: 'trigger',
        icon: 'span.mdi.mdi-arrange-bring-to-front',
        desc: 'Front Of Text'
    },
    formatStyle: {
        desc: "Format Style"
    },
    beautifyJS: {
        type: 'trigger',
        icon: 'span.mdi.mdi-auto-fix',
        desc: 'Format Code'
    },
    formatTextBold: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-bold'
    },
    formatTextItalic: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-italic'
    },
    formatTextUnderline: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-underline'
    },
    formatTextAlignLeft: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-align-left'
    },
    formatTextAlignCenter: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-align-center'
    },
    formatTextAlignRight: {
        type: 'toggle_switch',
        icon: 'span.mdi.mdi-format-align-right'
    },
    insertProcessBlock: {
        type: 'trigger',
        icon: 'span.mdi.mdi-puzzle-plus',
        desc: "Insert Process"
    },
    insertSubProcedureBlock: {
        type: 'trigger',
        icon: 'span.mdi.mdi-chart-sankey-variant',
        desc: "Insert SubProcess"
    },
    distributeVerticalDistance: {
        type: 'trigger',
        desc: "Distribute Verlical Distance",
        icon: '<svg width="24" height="24" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\
                    <path d="m7 3h10v5h5v2h-20v-2h5v-5"/>\
                    <path d="m2 16v-2h20v2h-3v5h-14v-5z"/>\
                </svg>'
    },
    distributeVerticalBottom: {
        type: 'trigger',
        desc: "Distribute Vertical Bottom",
        icon: 'span.mdi.mdi-distribute-vertical-bottom'
    },
    distributeVerticalCenter: {
        type: 'trigger',
        desc: "Distribute Vertical Center",
        icon: 'span.mdi.mdi-distribute-vertical-center'
    },
    distributeVerticalTop: {
        type: 'trigger',
        desc: "Distribute Vertical Top",
        icon: 'span.mdi.mdi-distribute-vertical-top'
    },
    distributeHorizontalDistance: {
        icon: '<svg width="24" height="24" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\
                    <path d="m21 7v10h-5v5h-2v-20h2v5h5"/>\
                    <path d="m8 2h2v20h-2v-3h-5v-14h5z"/>\
                </svg>',
        type: 'trigger',
        desc: "Distribute Horizontal Distance"
    },
    distributeHorizontalRight: {
        type: 'trigger',
        desc: "Distribute Horizontal Right",
        icon: 'span.mdi.mdi-distribute-horizontal-right'
    },
    distributeHorizontalCenter: {
        icon: 'span.mdi.mdi-distribute-horizontal-center',
        type: 'trigger',
        desc: "Distribute Horizontal Center"
    },
    distributeHorizontalLeft: {
        icon: 'span.mdi.mdi-distribute-horizontal-left',
        type: 'trigger',
        desc: "Distribute Horizontal Left"
    },
    equaliseHeight: {
        type: 'trigger',
        icon: 'span.mdi.mdi-arrow-expand-vertical',
        desc: 'Equalise Height',
    },
    alignVerticalCenter: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-vertical-center',
        desc: 'Align Vertical Center'
    },
    alignBottomEdge: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-vertical-bottom',
        desc: 'Align Bottom Edges',
    },
    alignTopEdge: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-vertical-top',
        desc: 'Align Top Edges'
    },
    equaliseWidth: {
        type: 'trigger',
        icon: 'span.mdi.mdi-arrow-expand-horizontal',
        desc: 'Equalise Width'
    },
    alignHorizontalCenter: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-horizontal-center',
        desc: 'Align Horizontal Center'
    },
    alignRightEdge: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-horizontal-right',
        desc: 'Align Right Edges',
    },
    alignLeftEdge: {
        type: 'trigger',
        icon: 'span.mdi.mdi-align-horizontal-left',
        desc: 'Align Left Edges',
    },
    sendBackward: {
        type: 'trigger',
        desc: 'Send Backward',
        icon: 'span.mdi.mdi-arrange-send-backward'
    },
    insertImage: {
        type: 'trigger',
        desc: 'Insert Image',
        icon: 'span.mdi.mdi-image-plus'
    },
    openHangTool: {
        type: 'toggle_switch',
        desc: 'Hang Tool(Middle Mouse Drag)',
        icon: 'span.mdi.mdi-hand-back-left-outline'
    },
    openSelectTool: {
        type: 'toggle_switch',
        desc: 'Select Tool',
        icon: 'select-tool-ico'
    },
    cancelActivatedTool: {
        type: 'trigger',
        desc: 'Cancel Activated Tool',
        icon: 'span.mdi.mdi-close-circle',
        bindKey: { win: 'escape', mac: 'Esc' }
    },
    openDrawLineTool: {
        type: 'toggle_switch',
        desc: 'Path Tool',
        icon: 'span.mdi.mdi-vector-polyline-plus'
    },
    lineColor: {
        type: 'color',
        desc: 'Line Color',
        icon: 'drawpenico'
    },
    select:{
        type: 'trigger',
        desc: 'Select',
        icon: 'span.mdi.mdi-select'
    },
    selectSimilarByTag: {
        type: 'trigger',
        desc: 'Select Similar By Tag',
    },
    selectSimilarByTagAndX:{
        type: 'trigger',
        desc: 'Select Similar By Tag and Column',
    },
    selectSimilarByX:{
        type: 'trigger',
        desc: 'Select Similar By Column'
    }
};

