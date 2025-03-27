var MApplication = absol.MApplication;
var MActivity = absol.MActivity;
var OOP = absol.OOP;

var _ = absol._;
var $ = absol.$;


function FirstPage(bundle) {
    MActivity.call(this);
}

OOP.mixClass(FirstPage, MActivity);

FirstPage.prototype.createView = function () {
    this.$view = _({
        class: ['am-activity', 'am-grid'],
        child: [
            {
                tag: 'mheaderbar',
                props: {
                    title: 'KeeView',
                    commands: [
                        {
                            icon: 'span.mdi.mdi-bell-outline',
                            name: 'notification'
                        },
                        {
                            icon: 'span.mdi.mdi-menu',
                            name: 'menu'
                        }
                    ]
                }
            },
            {
                class: 'am-activity-body',
                child: [
                    {
                        tag: 'mspringboardmenu',
                        class: 'as-style-desktop',
                        props: {
                            searching: {
                                // input: imputElement,//mặc định tự xử lý không cần truyền
                                items: [
                                    {
                                        name: 'Công việc',
                                        icon: '...',
                                        items: [
                                            {
                                                name: "Công việc",
                                                type: 'group',//mặc định không có thì nó là chức năng
                                                items: [
                                                    { name: 'Tác vụ', icon: 'ConfigurationFormOutlineIcon'.toLowerCase() },
                                                    { name: 'Check-in đối tác', icon: '...' },
                                                ]

                                            },
                                            {
                                                name: 'Đề xuất - Duyệt',
                                                type: 'group',
                                                items: [
                                                    { name: 'Đề xuất làm thêm', icon: '...' },
                                                    { name: 'Đề xuất nghỉ ngày', icon: '...' },
                                                    { name: 'Đề xuất đi muộn về sớm', icon: '...' },
                                                    { name: 'Đề xuất tạm ứng', icon: '...' },
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        name: 'Nhân sự',
                                        icon: '...',
                                        items: [
                                            {
                                                name: "Nhân sự", type: 'group',
                                                items: [
                                                    { name: 'Sơ đồ tổ chức', icon: '...' },
                                                    { name: ""}
                                                ]
                                            },
                                            { name: "Chấm công", icon: '...' },
                                            { name: 'Tính lương', icon: '...' },
                                            { name: "Báo cáo", icon: '...' },
                                            { name: "Hệ thống", icon: '...' }
                                        ]
                                    },
                                    {
                                        name: 'Quy trình và CRM',
                                        items: [
                                            {
                                                name: "Quy trình và CRm", type: 'group',
                                                items: [
                                                    { name: 'Quy trình', icon: '...' },
                                                    { name: 'Đối tác', icon: '...' },
                                                    { name: 'Check-in đối tác', icon: '...' },
                                                    { name: 'Liên hệ', icon: '...' }
                                                ]
                                            },
                                            {
                                                name: "Báo cáo", type: 'group',
                                                items: [
                                                    { name: 'Đối tượng', icon: '...' },
                                                    { name: 'Đối tác', icon: '...' },
                                                ]
                                            },
                                        ]
                                    }
                                ]
                            },
                            groups: [
                                {
                                    name: "Công việc",
                                    items: [
                                        {
                                            name: 'Tác vụ',
                                            icon: 'ConfigurationFormOutlineIcon'.toLowerCase()
                                        },
                                        {
                                            name: 'Check-in đối tác',
                                            icon:  'FunctionManagerIcon'.toLowerCase()
                                        },
                                        {
                                            name: 'Check-in chấm công',
                                            icon: 'DataTypeConfiguratorOutlineIcon'.toLowerCase()

                                        },
                                        {
                                            name: 'Đề xuất - Duyệt',
                                            icon: 'TimeBasedPayrollReportIcon'.toLowerCase()
                                        }
                                    ]
                                },
                                {
                                    name: "Quy trình và CRM",
                                    items: [
                                        {
                                            name: 'Quy trình',
                                            icon: 'ImportantOutlineIcon'.toLowerCase()
                                        },
                                        {
                                            name: "Đối tác",
                                            icon: 'span.mdi.mdi-store'
                                        },
                                        {
                                            name: 'Check-in đối tác',
                                            icon: 'span.mdi.mdi-store-marker-outline'

                                        },
                                        {
                                            name: 'Liên hệ',
                                            icon: 'span.mdi.mdi-card-account-phone-outline'
                                        }
                                    ]
                                },
                                {
                                    name: 'Quản lý văn bản',
                                    items: [
                                        { name: 'Quản lý văn bản', icon: 'span.mdi.mdi-text-box' }
                                    ]
                                },
                                {
                                    name: 'Đào tạo',
                                    items: [
                                        {
                                            name: 'Giáo trình',
                                            icon: 'span.mdi.mdi-book-open-blank-variant'
                                        },
                                        {
                                            name: 'Bài tập',
                                            icon: 'span.mdi.mdi-format-list-checks'
                                        },
                                        {
                                            name: 'Bài kiểm tra',
                                            icon: 'span.mdi.mdi-text-box-check-outline'
                                        }
                                    ]
                                },
                                {
                                    name: 'BSC',
                                    items: [
                                        {
                                            name: 'Nhập kết quả',
                                            icon: 'span.mdi.mdi-button-cursor'
                                        }
                                    ]
                                },
                                {
                                    name: 'Hệ thống',
                                    items: [
                                        {
                                            name: 'Hồ sơ cá nhân',
                                            icon: 'span.mdi.mdi-file-account-outline'
                                        },
                                        {
                                            name: 'Đăng xuất',
                                            icon: 'span.mdi.mdi-logout'
                                        }
                                    ]
                                }
                            ]
                        },
                        on: {
                            press: function (event) {
                                console.log(event.itemData);
                            }
                        }
                    }

                ]
            }
        ]
    });


    var menu = $('mspringboardmenu', this.$view);

    var colorBtn = _({
        tag: 'button',
        class: 'am-float-button',
        child: 'span.mdi.mdi-palette-outline',
        on: {
            click: () => {
                if (menu.hasClass('am-style-simple')) {
                    menu.removeClass('am-style-simple');
                }
                else {
                    menu.addClass('am-style-simple');

                }
            }
        }
    }).addTo(document.body);
};


var app = new MApplication();
app.getView().addTo(document.body);

app.start();
app.startActivity(FirstPage, {});