module.exports = {
    "items": [{
        "name": "Quản trị công việc",
        "type": "group",
        "items": [{
            "name": "Công việc",
            "icon": "span.mdi.mdi-order-bool-ascending-variant",
            "task": "activities_main",
            "items": [{
                "name": "Công việc",
                "type": "group",
                "items": [{
                    "name": "Công việc",
                    "icon": "span.mdi.mdi-order-bool-ascending-variant",
                    "hidden": false,
                    "task": "tasks2"
                }, {
                    "name": "Nhóm công việc",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "task_groups"
                }, {
                    "name": "Nhãn công việc",
                    "icon": "span.mdi.mdi-label",
                    "hidden": false,
                    "task": "task_labels"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "task_privileges"
                }]
            }]
        }, {
            "name": "Phê duyệt",
            "icon": "span.mdi.mdi-file-document-check-outline",
            "task": "approval_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Phê duyệt",
                    "icon": "span.mdi.mdi-file-document-check",
                    "hidden": false,
                    "task": "approvals"
                }, {
                    "name": "Nhóm phê duyệt",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "approval_groups"
                }, {
                    "name": "Nhãn phê duyệt",
                    "icon": "span.mdi.mdi-label",
                    "hidden": false,
                    "task": "approval_labels"
                }, {
                    "name": "Loại bảng kê",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "list_types"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "approval_privileges"
                }]
            }]
        }, {
            "name": "Tài liệu",
            "icon": "span.mdi.mdi-clipboard-file-outline",
            "hidden": false,
            "task": "document2_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Tài liệu",
                    "icon": "span.mdi.mdi-clipboard-file",
                    "hidden": false,
                    "task": "documents2"
                }, {
                    "name": "Nhóm",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "document_groups"
                }, {
                    "name": "Nhãn tài liệu",
                    "icon": "span.mdi.mdi-label",
                    "hidden": false,
                    "task": "document_labels"
                }]
            }]
        }, {
            "name": "Đào tạo",
            "icon": "span.mdi.mdi-school-outline",
            "hidden": false,
            "task": "training_main",
            "items": [{
                "name": "Đào tạo",
                "type": "group",
                "items": [{
                    "name": "Giáo trình",
                    "icon": "span.mdi.mdi-book-open-blank-variant",
                    "hidden": false,
                    "task": "lesson"
                }, {
                    "name": "Bài tập",
                    "icon": "span.mdi.mdi-format-list-checks",
                    "hidden": false,
                    "task": "exercise"
                }, {
                    "name": "Bài kiểm tra",
                    "icon": "span.mdi.mdi-format-list-checks",
                    "hidden": false,
                    "task": "examination"
                }, {
                    "name": "Ngân hàng câu hỏi",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "question_pool"
                }]
            }, {
                "name": "Hệ thống",
                "type": "group",
                "items": [{
                    "name": "Thiết lập gửi mail",
                    "icon": "span.mdi.mdi-cog-outline",
                    "hidden": false,
                    "task": "examination_config_mail"
                }, {
                    "name": "Nhóm giáo trình",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "lesson_category"
                }, {
                    "name": "Nhóm bài kiểm tra",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "examination_category"
                }, { "name": "Template", "icon": "templateicon", "hidden": false, "task": "training_templates" }]
            }]
        }, {
            "name": "Tài sản",
            "icon": "span.mdi.mdi-laptop",
            "task": "assets_main",
            "items": [{
                "name": "Tài sản",
                "type": "group",
                "items": [{
                    "name": "Bàn giao",
                    "searchName": "Bàn giao Tài sản",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "asset_handover"
                }, {
                    "name": "Thu hồi",
                    "searchName": "Thu hồi Tài sản",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "asset_recall"
                }, {
                    "name": "Danh mục",
                    "searchName": "Danh mục Tài sản",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "assets"
                }]
            }, {
                "name": "Công cụ, dụng cụ",
                "type": "group",
                "items": [{
                    "name": "Bàn giao",
                    "searchName": "Bàn giao Công cụ, dụng cụ",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "instruments_and_tools_handover"
                }, {
                    "name": "Danh mục",
                    "searchName": "Danh mục Công cụ, dụng cụ",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "instruments_and_tools"
                }]
            }, {
                "name": "Báo cáo",
                "type": "group",
                "items": [{
                    "name": "Tài sản",
                    "searchName": "Báo cáo Tài sản",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "my_assets"
                }, {
                    "name": "Tùy chọn",
                    "searchName": "Báo cáo Tùy chọn",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "asset_reports"
                }]
            }, {
                "name": "Hệ thống",
                "type": "group",
                "items": [{
                    "name": "Kho",
                    "icon": "span.mdi.mdi-warehouse",
                    "hidden": false,
                    "task": "warehouses"
                }, {
                    "name": "Nhóm tài sản",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "asset_category"
                }, {
                    "name": "Nhóm công cụ dụng cụ",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "instruments_and_tools_category"
                }, {
                    "name": "Template",
                    "icon": "templateicon",
                    "hidden": false,
                    "task": "asset_templates"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "asset_privileges"
                }]
            }]
        }, {
            "name": "Thiết bị",
            "icon": "span.mdi.mdi-car-outline",
            "task": "equipments_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Đề xuất thiết bị",
                    "icon": "span.mdi.mdi-store-clock",
                    "hidden": false,
                    "task": "equipment_proposals"
                }, {
                    "name": "Nhóm đề xuất thiết bị",
                    "icon": "span.mdi.mdi-store-clock",
                    "hidden": false,
                    "task": "equipment_proposal_groups"
                }, {
                    "name": "Nhãn đề xuất thiết bị",
                    "icon": "span.mdi.mdi-store-clock",
                    "hidden": false,
                    "task": "equipment_proposal_labels"
                }, {
                    "name": "Thiết bị",
                    "icon": "span.mdi.mdi-car",
                    "hidden": false,
                    "task": "equipments"
                }, {
                    "name": "Nhóm thiết bị",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "equipment_groups"
                }]
            }]
        }]
    }, {
        "name": "Quản trị nhân sự", "type": "group", "items": [{
            "name": "Hồ sơ nhân viên",
            "icon": "span.mdi.mdi-file-account-outline",
            "task": "employee_profile_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Hồ sơ nhân viên",
                    "icon": "span.mdi.mdi-file-account",
                    "hidden": false,
                    "task": "orgs"
                }, {
                    "name": "Chức danh",
                    "icon": "span.mdi.mdi-account-tie-hat",
                    "hidden": false,
                    "task": "position_2"
                }]
            }, {
                "name": "Danh mục",
                "type": "group",
                "items": [{
                    "name": "Nhóm nhân viên",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "employee_groups"
                }, {
                    "name": "Địa điểm",
                    "icon": "span.mdi.mdi-google-maps",
                    "hidden": false,
                    "task": "geopos"
                }, {
                    "name": "Công ty",
                    "icon": "span.mdi.mdi-home",
                    "hidden": false,
                    "task": "companies"
                }, {
                    "name": "Dân tộc",
                    "icon": "span.mdi.mdi-account-group",
                    "hidden": false,
                    "task": "ethnics"
                }, {
                    "name": "Tôn giáo",
                    "icon": "span.mdi.mdi-account-group-outline",
                    "hidden": false,
                    "task": "religions"
                }, {
                    "name": "Quốc gia",
                    "hidden": false,
                    "icon": "countryicon",
                    "task": "nations"
                }, {
                    "name": "Thành phố",
                    "icon": "cityicon",
                    "hidden": false,
                    "task": "cities"
                }, {
                    "name": "Nhóm chức danh",
                    "icon": "span.mdi.mdi-account-box-multiple",
                    "hidden": false,
                    "task": "position_groups"
                }, {
                    "name": "Template",
                    "icon": "templateicon",
                    "hidden": false,
                    "task": "templates"
                }, {
                    "name": "Nhóm template",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "template_category"
                }]
            }]
        }, {
            "name": "Hợp đồng lao động",
            "icon": "span.mdi.mdi-file-document-edit-outline",
            "hidden": false,
            "task": "employment_contract_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Hợp đồng lao động",
                    "icon": "span.mdi.mdi-file-document-edit",
                    "hidden": false,
                    "task": "employment_contract"
                }, {
                    "name": "Loại hợp đồng lao động",
                    "icon": "span.mdi.mdi-file-document-multiple",
                    "hidden": false,
                    "task": "employment_contract_types"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "employment_contract_privileges"
                }]
            }]
        }, {
            "name": "Chính sách nhân sự",
            "icon": "span.mdi.mdi-account-details-outline",
            "hidden": false,
            "task": "human_resource_policies_main",
            "items": [{
                "name": "Chính sách nhân sự",
                "type": "group",
                "items": [{
                    "task": "leave_policies",
                    "name": "Nghỉ ngày",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "late_early_checkin_policies",
                    "name": "Đi muộn về sớm",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "advance_payment_policies",
                    "name": "Tạm ứng",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "allowance_policies",
                    "name": "Phụ cấp",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "benefit_policies",
                    "name": "Phúc lợi",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "bonus_policies",
                    "name": "Thưởng",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "punishment_policies",
                    "name": "Phạt",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "insurance_policies",
                    "name": "Bảo hiểm",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "trade_union_policies",
                    "name": "Công đoàn",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "tax_policies",
                    "name": "Thuế",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "other_liability_policies",
                    "name": "Nghĩa vụ khác",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "overtime_policies",
                    "name": "Làm thêm",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "standard_workday_policies",
                    "name": "Công chuẩn",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "piece_wage_policies",
                    "name": "Lương sản phẩm",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "attendance_clock_policies",
                    "name": "Chấm công",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }, {
                    "task": "other_policies",
                    "name": "Khác",
                    "icon": "span.mdi.mdi-account-details",
                    "hidden": false
                }]
            }, {
                "name": "Nhóm chính sách nhân sự",
                "type": "group",
                "items": [{
                    "task": "leave_policy_groups",
                    "name": "Nghỉ ngày",
                    "icon": "span.mdi.mdi-account-arrow-right",
                    "hidden": false
                }, {
                    "task": "late_early_checkin_policy_groups",
                    "name": "Đi muộn về sớm",
                    "icon": "span.mdi.mdi-alarm-plus",
                    "hidden": false
                }, {
                    "task": "advance_payment_policy_groups",
                    "name": "Tạm ứng",
                    "icon": "span.mdi.mdi-cash-fast",
                    "hidden": false
                }, {
                    "task": "allowance_policy_groups",
                    "name": "Phụ cấp",
                    "icon": "span.mdi.mdi-file-phone",
                    "hidden": false
                }, {
                    "task": "benefit_policy_groups",
                    "name": "Phúc lợi",
                    "icon": "span.mdi.mdi-cash-plus",
                    "hidden": false
                }, {
                    "task": "bonus_policy_groups",
                    "name": "Thưởng",
                    "icon": "span.mdi.mdi-cash-plus",
                    "hidden": false
                }, {
                    "task": "punishment_policy_groups",
                    "name": "Phạt",
                    "icon": "span.mdi.mdi-cash-minus",
                    "hidden": false
                }, {
                    "task": "insurance_policy_groups",
                    "name": "Bảo hiểm",
                    "icon": "span.mdi.mdi-hospital-box",
                    "hidden": false
                }, {
                    "task": "trade_union_policy_groups",
                    "name": "Công đoàn",
                    "icon": "span.mdi.mdi-account-group",
                    "hidden": false
                }, {
                    "task": "tax_policy_groups",
                    "name": "Thuế",
                    "icon": "span.mdi.mdi-cash-minus",
                    "hidden": false
                }, {
                    "task": "other_liability_policy_groups",
                    "name": "Nghĩa vụ khác",
                    "icon": "span.mdi.mdi-cash-minus",
                    "hidden": false
                }, {
                    "task": "overtime_policy_groups",
                    "name": "Làm thêm",
                    "icon": "span.mdi.mdi-clock-plus",
                    "hidden": false
                }, {
                    "task": "standard_workday_policy_groups",
                    "name": "Công chuẩn",
                    "icon": "span.mdi.mdi-calendar-account",
                    "hidden": false
                }, {
                    "task": "piece_wage_policy_groups",
                    "name": "Lương sản phẩm",
                    "icon": "span.mdi.mdi-package-variant",
                    "hidden": false
                }, {
                    "task": "attendance_clock_policy_groups",
                    "name": "Chấm công",
                    "icon": "span.mdi.mdi-account-clock",
                    "hidden": false
                }, {
                    "task": "other_policy_groups",
                    "name": "Khác",
                    "icon": "span.mdi.mdi-cash-minus",
                    "hidden": false
                }]
            }]
        }, {
            "name": "Quyết định nhân sự",
            "icon": "span.mdi.mdi-account-box-outline",
            "hidden": false,
            "task": "decision_on_employee_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "task": "salary_decisions",
                    "name": "Quyết định lương",
                    "icon": "span.mdi.mdi-currency-usd",
                    "hidden": false
                }, {
                    "task": "emulation_reward",
                    "name": "Quyết định khen thưởng",
                    "icon": "span.mdi.mdi-seal-variant",
                    "hidden": false
                }, {
                    "task": "discipline",
                    "name": "Quyết định kỷ luật",
                    "icon": "span.mdi.mdi-needle",
                    "hidden": false
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "decision_on_employee_privileges"
                }]
            }]
        }, {
            "name": "Nhân viên mới",
            "icon": "span.mdi.mdi-account-plus-outline",
            "hidden": false,
            "task": "onboarding_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Nhân viên mới",
                    "icon": "span.mdi.mdi-account-plus",
                    "hidden": false,
                    "task": "onboarding"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "onboarding_privileges"
                }]
            }]
        }, {
            "name": "Nhân viên nghỉ việc",
            "icon": "span.mdi.mdi-account-minus-outline",
            "hidden": false,
            "task": "offboarding_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Nhân viên nghỉ việc",
                    "icon": "span.mdi.mdi-account-minus",
                    "hidden": false,
                    "task": "offboarding"
                }, {
                    "name": "Loại nghỉ việc",
                    "icon": "span.mdi.mdi-account-minus",
                    "hidden": false,
                    "task": "offboarding_types"
                }, {
                    "name": "Lý do nghỉ việc",
                    "icon": "span.mdi.mdi-account-question",
                    "hidden": false,
                    "task": "offboarding_reasons"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "offboarding_privileges"
                }]
            }]
        }, {
            "name": "Ca làm việc",
            "icon": "span.mdi.mdi-clipboard-text-clock-outline",
            "hidden": false,
            "task": "shift_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Xếp ca làm việc",
                    "icon": "span.mdi.mdi-clipboard-text-clock",
                    "hidden": false,
                    "task": "shift_schedule"
                }, {
                    "name": "Ngày nghỉ lễ",
                    "icon": "span.mdi.mdi-calendar-minus",
                    "hidden": false,
                    "task": "holidays"
                }, { "name": "Ca làm việc", "icon": "span.mdi.mdi-calendar-range", "hidden": false, "task": "shifts" }]
            }]
        }, {
            "name": "Chấm công",
            "icon": "span.mdi.mdi-store-clock-outline",
            "task": "attendance_clock_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Thời gian bấm giờ",
                    "icon": "span.mdi.mdi-timer",
                    "hidden": false,
                    "task": "worktime_checkins"
                }, {
                    "name": "Thời gian vào/ ra",
                    "icon": "span.mdi.mdi-timer-check",
                    "hidden": false,
                    "task": "worktime_logs"
                }, {
                    "name": "Bảng chấm công",
                    "icon": "span.mdi.mdi-store-clock",
                    "hidden": false,
                    "task": "timesheet"
                }, {
                    "name": "Mã chấm công",
                    "icon": "span.mdi.mdi-identifier",
                    "hidden": false,
                    "task": "timekeeping_code"
                }, {
                    "name": "Máy chấm công",
                    "icon": "span.mdi.mdi-home-clock",
                    "hidden": false,
                    "task": "worktime_machines"
                }, {
                    "name": "Dự án",
                    "icon": "span.mdi.mdi-store-marker",
                    "hidden": false,
                    "task": "projects"
                }, {
                    "name": "Loại công",
                    "icon": "span.mdi.mdi-calendar-range",
                    "hidden": false,
                    "task": "pay_percentage"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "timekeeping_privileges"
                }]
            }]
        }, {
            "name": "Tính lương",
            "icon": "timebasedpayrollreporticon",
            "task": "payroll_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Bảng lương thời gian",
                    "icon": "timebasedpayrollreporticon",
                    "hidden": false,
                    "task": "pay_sheet"
                }, {
                    "name": "Lương sản phẩm",
                    "icon": "span.mdi.mdi-package-variant",
                    "hidden": false,
                    "task": "piece_wage"
                }, {
                    "name": "Chu kỳ tính lương",
                    "icon": "span.mdi.mdi-arrow-left-right-bold",
                    "hidden": false,
                    "task": "payroll_cycle"
                }, {
                    "name": "Sản phẩm",
                    "icon": "span.mdi.mdi-package-variant",
                    "hidden": false,
                    "task": "products"
                }, {
                    "name": "Nhóm sản phẩm",
                    "icon": "span.mdi.mdi-webpack",
                    "hidden": false,
                    "task": "product_groups"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "payroll_privileges"
                }]
            }]
        }, {
            "name": "Báo cáo",
            "icon": "span.mdi.mdi-chart-box-outline",
            "task": "report_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Báo cáo (tùy chọn)",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_orgs"
                }, {
                    "name": "Lý do nghỉ việc",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_offboarding_reason"
                }, {
                    "name": "Nghỉ phép",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_annual_leave"
                }, {
                    "name": "Biến động nhân sự",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_personnel_change"
                }, {
                    "name": "Biến động lương",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_salary_fluctuations"
                }, {
                    "name": "Báo cáo bộ phận",
                    "icon": "span.mdi.mdi-account-cog",
                    "hidden": false,
                    "task": "report_department"
                }]
            }]
        }]
    }, {
        "name": "Nâng cao", "type": "group", "items": [{
            "name": "Quy trình và CRM",
            "icon": "span.mdi.mdi-alpha-w-circle-outline",
            "hidden": false,
            "task": "work_flows_and_crm_main",
            "items": [{
                "name": "Quy trình và CRM",
                "type": "group",
                "items": [{
                    "name": "Quy trình",
                    "icon": "span.mdi.mdi-stack-overflow",
                    "hidden": false,
                    "task": "work_flows"
                }, {
                    "name": "Đối tác",
                    "icon": "span.mdi.mdi-store",
                    "hidden": false,
                    "task": "partner"
                }, {
                    "name": "Liên hệ",
                    "icon": "span.mdi.mdi-store-marker-outline",
                    "hidden": false,
                    "task": "contact"
                }, {
                    "name": "Tác vụ",
                    "icon": "span.mdi.mdi-format-list-checks",
                    "hidden": false,
                    "task": "activities"
                }, {
                    "name": "Check-in đối tác",
                    "icon": "span.mdi.mdi-map-marker-check",
                    "hidden": false,
                    "task": "partner_checkin"
                }, {
                    "name": "Danh mục check-in đối tác",
                    "icon": "span.mdi.mdi-card-account-phone-outline",
                    "hidden": false,
                    "task": "partner_checkin_list"
                }]
            }, {
                "name": "Báo cáo",
                "type": "group",
                "items": [{
                    "name": "Đối tượng",
                    "hidden": false,
                    "icon": "span.mdi.mdi-store",
                    "task": "report_objects"
                }, { "name": "Đối tác", "icon": "span.mdi.mdi-store", "hidden": false, "task": "report_partner" }]
            }, {
                "name": "Hệ thống",
                "type": "group",
                "items": [{
                    "name": "Nhóm quy trình",
                    "icon": "span.mdi.mdi-folder-multiple",
                    "hidden": false,
                    "task": "work_flow_groups"
                }, {
                    "name": "Loại đối tác",
                    "icon": "span.mdi.mdi-store-settings",
                    "hidden": false,
                    "task": "partner_class"
                }, {
                    "name": "Template nhân viên",
                    "icon": "span.mdi.mdi-account-details-outline",
                    "hidden": false,
                    "task": "employee_templates"
                }, {
                    "name": "Template",
                    "icon": "templateicon",
                    "hidden": false,
                    "task": "work_flows_crm_templates"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "work_flows_and_crm_privileges"
                }]
            }]
        }, {
            "name": "BSC",
            "icon": "span.mdi.mdi-gauge",
            "hidden": false,
            "task": "bsc_main",
            "items": [{
                "name": "ScoreCard",
                "type": "group",
                "items": [{
                    "name": "ScoreCard",
                    "icon": "span.mdi.mdi-card-text-outline",
                    "hidden": false,
                    "task": "bsc_scorecards"
                }, {
                    "name": "Khóa Scorecard",
                    "icon": "span.mdi.mdi-pen-lock",
                    "hidden": false,
                    "task": "bsc_lock_scorecards"
                }, {
                    "name": "Nhập kết quả",
                    "icon": "span.mdi.mdi-button-cursor",
                    "hidden": false,
                    "task": "bsc_input_values"
                }, {
                    "name": "Duyệt kết quả",
                    "icon": "span.mdi.mdi-invoice-text-check-outline",
                    "hidden": false,
                    "task": "bsc_approval_values"
                }, {
                    "name": "Mở khóa kết quả",
                    "icon": "span.mdi.mdi-lock-open-variant-outline",
                    "hidden": false,
                    "task": "bsc_lock_values"
                }, {
                    "name": "Tổng hợp kết quả",
                    "icon": "span.mdi.mdi-file-tree-outline",
                    "hidden": false,
                    "task": "bsc_accumulate_values"
                }, {
                    "name": "Ghi đè hiệu suất",
                    "icon": "span.mdi.mdi-debug-step-over",
                    "hidden": false,
                    "task": "bsc_overridden_result"
                }]
            }, {
                "name": "Ma trận chức năng",
                "type": "group",
                "items": [{
                    "name": "Ma trận chức năng",
                    "icon": "span.mdi.mdi-matrix",
                    "hidden": false,
                    "task": "functional_matrix"
                }]
            }, {
                "name": "Báo cáo",
                "type": "group",
                "items": [{
                    "name": "Báo cáo ScoreCard",
                    "searchName": "Báo cáo ScoreCard",
                    "icon": "span.mdi.mdi-file-chart-outline",
                    "hidden": false,
                    "task": "bsc_report_scorecards"
                }, {
                    "name": "Báo cáo KPI",
                    "searchName": "Báo cáo Kpi",
                    "icon": "span.mdi.mdi-file-chart-outline",
                    "hidden": false,
                    "task": "bsc_report_kpis"
                }, {
                    "name": "Báo cáo ScoreCard gộp",
                    "searchName": "Báo cáo ScoreCard gộp",
                    "icon": "span.mdi.mdi-file-chart-outline",
                    "hidden": false,
                    "task": "bsc_report_scorecard_union"
                }, {
                    "name": "Báo cáo bộ phận",
                    "searchName": "Báo cáo Bộ phận",
                    "icon": "span.mdi.mdi-file-chart-outline",
                    "hidden": false,
                    "task": "bsc_report_department"
                }]
            }, {
                "name": "Hệ thống",
                "type": "group",
                "items": [{
                    "name": "Danh mục KPI",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "bsc_criteriadefinitions"
                }, {
                    "name": "Công thức tính hiệu suất",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "bsc_formulas"
                }, {
                    "name": "Scorecard Template",
                    "icon": "span.mdi.mdi-card-bulleted-outline",
                    "hidden": false,
                    "task": "bsc_scorecard_templates"
                }, {
                    "name": "Phương pháp nhập kết quả",
                    "icon": "span.mdi.mdi-calculator-variant-outline",
                    "hidden": false,
                    "task": "bsc_result_input_method"
                }, {
                    "name": "Template",
                    "icon": "templateicon",
                    "hidden": false,
                    "task": "bsc_templates"
                }, {
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "bsc_privileges"
                }]
            }]
        }, {
            "name": "Năng lực và lương",
            "icon": "span.mdi.mdi-currency-usd",
            "hidden": false,
            "task": "competency_and_salary_main",
            "items": [{
                "name": "Hệ thống",
                "type": "group",
                "items": [{
                    "icon": "span.mdi.mdi-format-list-bulleted-square",
                    "name": "Danh mục dự án",
                    "hidden": false,
                    "task": "competency_profiles"
                }, {
                    "icon": "span.mdi.mdi-book-open-variant",
                    "name": "Thư viện tiêu chí Keeview",
                    "hidden": false,
                    "task": "competency_dictionary"
                }]
            }, {
                "name": "Dự án",
                "type": "group",
                "items": [{
                    "icon": "span.mdi.mdi-information",
                    "hidden": false,
                    "name": "Thông tin chung",
                    "task": "competency_profile_infor"
                }, {
                    "icon": "span.mdi.mdi-sitemap",
                    "name": "Sơ đồ tổ chức",
                    "task": "salary_organizational"
                }, {
                    "icon": "span.mdi.mdi-account-wrench",
                    "name": "Phân quyền",
                    "hidden": false,
                    "task": "competency_privileges"
                }, {
                    "icon": "span.mdi.mdi-history",
                    "name": "Lịch sử chấm điểm",
                    "hidden": false,
                    "task": "competency_evaluate_logs"
                }]
            }, {
                "name": "Tiêu chí, chấm điểm",
                "type": "group",
                "items": [{
                    "icon": "span.mdi.mdi-book-open-blank-variant",
                    "name": "Tiêu chí",
                    "hidden": false,
                    "task": "competency_criteria"
                }, {
                    "icon": "span.mdi.mdi-gauge",
                    "name": "Chấm điểm",
                    "hidden": false,
                    "task": "competency_evaluate"
                }, {
                    "icon": "span.mdi.mdi-lock",
                    "name": "Khoá chấm điểm",
                    "hidden": false,
                    "task": "competency_evaluate_lock"
                }, {
                    "icon": "span.mdi.mdi-wrench",
                    "name": "Thiết lập",
                    "hidden": false,
                    "task": "competency_scoreboard_setting"
                }]
            }, {
                "name": "Báo cáo",
                "type": "group",
                "items": [{
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Chấm điểm chức danh",
                    "hidden": false,
                    "task": "competency_position_evaluation"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Lương chức danh",
                    "hidden": false,
                    "task": "competency_position_salary"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Bậc lương",
                    "hidden": false,
                    "task": "competency_salary_step"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Chấm điểm nhân viên",
                    "hidden": false,
                    "task": "competency_employee_evaluation"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Lương nhân viên",
                    "hidden": false,
                    "task": "competency_employee_salary"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Năng lực nhân viên",
                    "hidden": false,
                    "task": "competency_employee_competency"
                }, {
                    "icon": "span.mdi.mdi-file-document",
                    "name": "Quỹ lương",
                    "hidden": false,
                    "task": "competency_salary_fund"
                }]
            }]
        }, {
            "name": "Quy trình",
            "icon": "span.mdi.mdi-stack-overflow",
            "task": "work_flows_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Procedures",
                    "icon": "procedureoutlineicon",
                    "hidden": false,
                    "task": "procedures"
                }, {
                    "name": "Processes",
                    "icon": "processoutlineicon",
                    "hidden": false,
                    "task": "procedure_processes"
                }]
            }]
        }]
    }, {
        "name": "Hệ thống",
        "type": "group",
        "items": [{
            "name": "Phân quyền",
            "icon": "span.mdi.mdi-account-wrench-outline",
            "hidden": false,
            "task": "permission_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{
                    "name": "Phân quyền",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "privileges"
                }, {
                    "name": "Admin chức năng",
                    "icon": "span.mdi.mdi-account-wrench",
                    "hidden": false,
                    "task": "function_admin_rights"
                }]
            }]
        }, {
            "name": "Người dùng",
            "icon": "span.mdi.mdi-account-outline",
            "hidden": false,
            "task": "user_main",
            "items": [{
                "name": "",
                "type": "group",
                "items": [{ "name": "Người dùng", "icon": "span.mdi.mdi-account", "hidden": false, "task": "user" }]
            }]
        }, {
            "name": "Hệ thống",
            "icon": "span.mdi.mdi-cog-outline",
            "task": "system_main",
            "items": [{
                "name": "Cơ bản",
                "type": "group",
                "items": [{
                    "name": "Tùy chọn",
                    "icon": "span.mdi.mdi-cog",
                    "hidden": false,
                    "task": "options"
                }, {
                    "name": "Ngôn ngữ",
                    "icon": "span.mdi.mdi-translate",
                    "hidden": false,
                    "task": "languages"
                }, {
                    "name": "Media manager",
                    "icon": "span.mdi.mdi-multimedia",
                    "hidden": false,
                    "task": "paths"
                }, {
                    "name": "Template",
                    "icon": "templateicon",
                    "hidden": false,
                    "task": "templates"
                }, {
                    "name": "Nhóm template",
                    "icon": "span.mdi.mdi-checkbox-blank",
                    "hidden": false,
                    "task": "template_category"
                }]
            }, {
                "name": "Nâng cao",
                "type": "group",
                "items": [{
                    "name": "Input form",
                    "icon": "inputformoutlineicon",
                    "hidden": false,
                    "task": "input_form"
                }, {
                    "name": "Mobile input form",
                    "icon": "mobileinputformoutlineicon",
                    "hidden": false,
                    "task": "input_form_mobile"
                }, {
                    "name": "Output form",
                    "icon": "outputformoutlineicon",
                    "hidden": false,
                    "task": "output_form"
                }, {
                    "name": "Mobile output form",
                    "icon": "mobileoutputformoutlineicon",
                    "hidden": false,
                    "task": "output_form_mobile"
                }, {
                    "name": "Cấu hình form",
                    "icon": "configurationformoutlineicon",
                    "hidden": false,
                    "task": "form_config"
                }, {
                    "name": "Biến và tham số",
                    "icon": "span.mdi.mdi-variable",
                    "hidden": false,
                    "task": "output_form_mobile"
                }, {
                    "name": "Quản lý hàm",
                    "icon": "functionmanagericon",
                    "hidden": false,
                    "task": "functions"
                }, {
                    "name": "Kiểu dữ liệu",
                    "icon": "datatypeconfiguratoroutlineicon",
                    "hidden": false,
                    "task": "datatypes"
                }]
            }, {
                "name": "Tác vụ",
                "type": "group",
                "items": [{
                    "name": "Danh sách",
                    "searchName": "Danh sách Tác vụ",
                    "icon": "span.mdi.mdi-format-list-bulleted",
                    "hidden": false,
                    "task": "processes"
                }, {
                    "name": "Thực thi",
                    "searchName": "Thực thi Tác vụ",
                    "icon": "span.mdi.mdi-cog-play-outline",
                    "hidden": false,
                    "task": "execute"
                }]
            }]
        }, {
            "name": "Hồ sơ cá nhân",
            "icon": "span.mdi.mdi-account-circle-outline",
            "hidden": false,
            "task": "personal_profile"
        }, {
            "name": "Hướng dẫn sử dụng",
            "icon": "span.mdi.mdi-help-box-outline",
            "hidden": false,
            "task": "help"
        }, { "name": "Đăng xuất", "icon": "span.mdi.mdi-logout", "hidden": false, "task": "logout" }]
    }],
    "input": {
        "eventHandler": {},
        "_azar_extendAttributes": {},
        "_azar_extendTags": {},
        "$button": { "eventHandler": {}, "_azar_extendAttributes": {}, "_azar_extendTags": {} },
        "$input": { "eventHandler": {}, "_azar_extendAttributes": {}, "_azar_extendTags": {} },
        "_updateTimeOut": 159349,
        "_lastTextModified": "dự án"
    }
};