var FileMenuConfig = {
    items: [
        {
            tag: 'div',
            class: 'bsc-logo-ctn',
            child: {
                tag: 'img',
                props: {
                    src: 'https://storage.moqups.com/repo/SdL0ybkYC5/wzxXVyMS6I.png'
                }
            }
        },
        {
            text: 'File',
            items: [
                {
                    text: "New",
                    items: [
                        {
                            text: "Module",
                            iconSrc: 'http://absol.cf/exticons/extra/folder-git.svg'
                        },
                        {
                            text: "Project",
                            iconSrc: 'http://absol.cf/exticons/extra/folder-classic.svg'
                        },
                        {
                            text: "Solution",
                            cmd: "new_solution",
                            iconSrc: 'http://absol.cf/exticons/extra/folder-svn.svg'
                        }
                    ]
                },
                { text: "New Node from template", cmd: 'template_new', disable: true },
                { text: "Open Node", key: 'Ctrl+O', cmd: 'open', disable: true },
                {
                    disable: true,
                    text: "Open Recent",
                    items: [
                        { text: "Node A" },
                        { text: "Node B" },
                        { text: "Node C" },
                        {
                            text: "Node D",
                            items: [
                                { text: "Node D" },
                                { text: "Node E" },
                                { text: "Node F" },
                                { text: "Node G" }]
                        }
                    ]
                },
                '=================================',
                { text: "Save", key: 'Ctrl+S', disable: true },
                { text: "Save As", key: 'Ctrl+Shift+S', disable: true },
                { text: "Save All", disable: true },
                '=================================',
                { text: "Auto Save", disable: true },
                { text: "Prereferences" },
                '=================================',
                {
                    text: "Open Project", key: 'Ctrl+Alt+O',
                    cmd: 'open_project'
                },
                {
                    text: "Open Solution",
                    key: 'Ctrl+Alt+O',
                    cmd: 'open_solution'
                },
                {
                    text: "Open Recent Project",

                    items: [
                        { text: "Project A" },
                        { text: "Project E" },
                        { text: "Project F" },
                        { text: "Project G" }]
                    , disable: true
                },
                {
                    text: 'Logout', cmd: 'logout'
                }
            ]
        },
        {
            text: 'Edit',
            items: [
                { text: 'Undo', key: 'Ctrl+Z', cmd: 'undo' },
                { text: 'Redo', key: 'Ctrl+Y', cmd: 'redo' },
                "================================",
                { text: 'Cut', key: 'Ctrl+X', cmd: 'cut' },
                { text: 'Copy', key: 'Ctrl+C', cmd: 'copy' },
                { text: 'Paste', key: 'Ctrl+V', cmd: 'paste' },
                "==============================",
                { text: 'Find', key: 'Ctrl+F', cmd: 'find' },
                { text: 'Replace', key: 'Ctrl+R', cmd: 'replace' },
                "=============================",
                { text: 'Find in Nodes', key: 'Ctrl+Shift+F' },
                { text: 'Replace in Nodes', key: 'Ctrl+Shift+R' }
            ]
        },
        {
            text: 'Selection',
            items: [
                { text: 'Select All', key: 'Ctrl+A', cmd: 'selectall' },
                { text: 'Expand Selection', key: 'Ctrl+Shift+M', cmd: 'expandToMatching' },
                { text: 'Delete Line', key: 'Ctrl+D', cmd: 'removeline' },
                "================================",
                { text: 'Copy Line Up', key: 'Alt+Shift+ArrowUp', cmd: 'copylinesup' },
                { text: 'Copy Line Down', key: 'Alt+Shift+ArrowDown', cmd: 'copylinesdown' },
                { text: 'Move Line Up', key: 'Alt+ArrowUp', cmd: 'movelinesup' },
                { text: 'Move Line Down', key: 'Alt+ArrowDown', cmd: 'movelinesdown' },
            ]
        },
        {
            text: 'View',
            items: [{ text: 'Nothing to View' }]
        },
        {
            text: 'Help',

            items: [

                {
                    text: 'Documentation',
                    cmd: 'doc'
                },
                { text: "About Frame" }
            ]
        }
    ]
};

var BSCMenuConfig = {
    items: [
        {
            tag: 'div',
            class: 'bsc-logo-ctn',
            child: {
                tag: 'img',
                props: {
                    src: 'https://storage.moqups.com/repo/SdL0ybkYC5/wzxXVyMS6I.png'
                }
            }
        },
        {
            "text": "BSC",
            "items": [{ "text": "Scorecard" }, { icon:'span.mdi.mdi-map-marker-check-outline',"text": "Bản đồ chiến lược" }, { "text": "Ma trận chức năng" }]
        },
        { "text": "Đề xuất", "items": [{ "text": "Đề xuất mục tiêu" }, { "text": "Đề xuất KQ" }] }, {
            "text": "Duyệt",
            "items": [{ "text": "Duyệt mục tiêu" }, { "text": "Duyệt kế hoạch thực hiện" }, { "text": "Duyệt kết quả" }, { "text": "Duyệt kế hoạch báo cáo" }]
        },
        {
            icon:'span.mdi.mdi-alert',
            "text": "Cảnh báo"
        },
        {
            icon:'span.mdi.mdi-file-chart',
            "text": "Báo cáo",
            "items": [{ "text": "Tổng quan" }, { "text": "Báo cáo KPI" }, { "text": "Báo cáo bộ phận, nhân viên" }, { "text": "Báo cáo so sánh mục tiêu theo bộ phận, nhân viên" }, { "text": "Báo cáo so sánh mục tiêu theo KPI" }, { "text": "Hiệu suất" }, { "text": "Báo cáo hiệu suất 12 tháng" }, { "text": "Ma trận bộ phận và KPI" }, { "text": "Báo cáo hiệu suất và năng lực nhân viên" }, { "text": "Báo cáo định vị tăng lương" }, { "text": "Map profile" }, { "text": "Báo cáo cập nhật KPI" }]
        },
        {
            "text": "Danh mục",
            "items": [{ "text": "Hồ sơ BSC" }, { "text": "Chỉ số" }, { "text": "Công thức tính" }, { "text": "Viễn cảnh" }, { "text": "Sơ đồ tổ chức BSC" }, { "text": "Ngôn ngữ" }]
        }, {
            "text": "Hệ thống",
            "items": [{ "text": "Người dùng" }, { "text": "Nhóm người dùng" }, "======", { "text": "Tùy chọn" }, { "text": "Mở khóa kế hoạch thực hiện" }, { "text": "Sao lưu và phục hồi" }, "=====", { "text": "Undo" }, "=====", { "text": "Thư viện chỉ số" }, "=====", { "text": "Hồ sơ cá nhân" }, { "text": "Đăng xuất" }]
        },
        {
            text: 'Admin',
            items: [
                {
                    tag: 'div',
                    style: {
                        'text-align': 'center',
                        padding: '5px'
                    },
                    on: {
                        click: function () {
                            alert("Bạn có thể thêm hàm ở đây");
                        }
                    },
                    child: {
                        tag: 'img',
                        props: {
                            src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNjAgNjAiPjxkZWZzPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9InRyYW5zcGFyZW50IiBjbGFzcz0ic3RlbmNpbF9fc2VsZWN0aW9uLWhlbHBlciI+PC9yZWN0PjxwYXRoIGQ9Ik0zMCAwQzEzLjQ0MDAwMDAwMDAwMDAwMSAwIDAgMTMuNDQwMDAwMDAwMDAwMDAxIDAgMzAgMCA0Ni41NiAxMy40NDAwMDAwMDAwMDAwMDEgNjAgMzAgNjAgNDYuNTYgNjAgNjAgNDYuNTYgNjAgMzAgNjAgMTMuNDQwMDAwMDAwMDAwMDAxIDQ2LjU2IDAgMzAgMCAzMCAwIDMwIDAgMzAgME0zMCA5QzM0Ljk4MDAwMDAwMDAwMDAwNCA5IDM5IDEzLjAyIDM5IDE4IDM5IDIyLjk4IDM0Ljk4MDAwMDAwMDAwMDAwNCAyNyAzMCAyNyAyNS4wMiAyNyAyMSAyMi45OCAyMSAxOCAyMSAxMy4wMiAyNS4wMiA5IDMwIDkgMzAgOSAzMCA5IDMwIDlNMzAgNTEuNTk5OTk5OTk5OTk5OTk0QzIyLjc2MDMwMDc3Nzk5ODI5IDUxLjU5OTk5OTk5OTk5OTk5NCAxNi4wMDE5NDQ4NDkzMjY0NCA0Ny45NzMwNDkxNjY3MTUxIDEyIDQxLjk0IDEyLjA5IDM1Ljk3IDI0IDMyLjcgMzAgMzIuNyAzNS45NyAzMi43IDQ3LjkxIDM1Ljk3IDQ4IDQxLjk0IDQzLjk5ODA1NTE1MDY3MzU2NSA0Ny45NzMwNDkxNjY3MTUxIDM3LjIzOTY5OTIyMjAwMTcxIDUxLjU5OTk5OTk5OTk5OTk5NCAzMCA1MS41OTk5OTk5OTk5OTk5OTQgMzAgNTEuNTk5OTk5OTk5OTk5OTk0IDMwIDUxLjU5OTk5OTk5OTk5OTk5NCAzMCA1MS41OTk5OTk5OTk5OTk5OTQiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlPSJub25lIiBzdHJva2UtZGFzaGFycmF5PSJub25lIiBmaWxsPSJyZ2IoMjU1LCAyNTUsIDI1NSkiIGZpbGwtcnVsZT0iZXZlbk9kZCI+PC9wYXRoPjwvc3ZnPg=='
                        }
                    }
                },
                { text: 'Hồ sơ cá nhân' },
                {
                    text: 'Đăng xuất'
                }
            ]
        }
    ]
};