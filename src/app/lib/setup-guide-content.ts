/**
 * Static content registry for the Setup Guide.
 * Updated: v19.0.0 - Consolidated telemetry registry into a single 'System_Activity' tab.
 */

export const SETUP_GUIDE_CONTENT = {
  en: {
    title: "Setup Guide",
    subtitle: "Self-Hosting Protocol",
    returnBase: "Back",
    launchConsole: "Admin Console",
    step1: {
      num: "01",
      title: "Database Setup",
      desc: "Use Google Sheets™ as your primary database.",
      alertTitle: "Required Tabs",
      alertDesc: "Create FIVE tabs with these exact names: Tests, Users, Responses, System_Activity, Settings.",
      tabTests: "Tests",
      tabUsers: "Users",
      tabResponses: "Logs",
      tabActivity: "Activity",
      tabEvents: "Events",
      tabSettings: "Settings",
      testsTitle: "Tab: Tests",
      testsHeaders: "id, title, description, category, difficulty, duration, image_url, certificate_enabled, passing_threshold",
      usersTitle: "Tab: Users",
      usersHeaders: "id, name, email, role, password, image_url",
      responsesTitle: "Tab: Responses",
      responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses, Certificate ID",
      activityTitle: "Tab: System_Activity (Unified Audit)",
      activityHeaders: "timestamp, user_name, user_email, user_role, event_type, context, details, ip_address, device, browser, status, session_id",
      settingsTitle: "Tab: Settings",
      settingsHeaders: "key, value",
      dynamicTitle: "Question Tabs",
      dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
    },
    step2: {
      num: "02",
      title: "Backend Bridge",
      desc: "Connect the frontend to your sheet using Google Apps Script.",
      codeTitle: "GAS Template",
      codeDesc: "Open Extensions > Apps Script in your sheet and paste the code below.",
      deployTitle: "Deployment",
      deploy1: "Type: Web App",
      deploy2: "Execute as: Me",
      deploy3: "Access: Anyone",
      deployFooter: "Copy the provided URL for the next step."
    },
    step3: {
      num: "03",
      title: "Frontend Deployment",
      desc: "Run the interface and connect it to your database.",
      repoTitle: "1. Initialization",
      repoDesc: "Clone the repository and install dependencies.",
      configTitle: "2. Connection",
      configDesc: "Set your API URL in the environment configuration.",
      deployFinalTitle: "3. Launch",
      deployFinalDesc: "Deploy to Vercel or run locally.",
      ready: "Setup Ready",
      launch: "Launch App"
    }
  },
  vi: {
    title: "Hướng dẫn cài đặt",
    subtitle: "Tự triển khai hệ thống",
    returnBase: "Quay lại",
    launchConsole: "Trang quản trị",
    step1: {
      num: "01",
      title: "Cấu trúc dữ liệu",
      desc: "Sử dụng Google Sheets™ làm cơ sở dữ liệu chính.",
      alertTitle: "Các tab bắt buộc",
      alertDesc: "Tạo 5 tab với tên chính xác: Tests, Users, Responses, System_Activity, Settings.",
      tabTests: "Tests",
      tabUsers: "Users",
      tabResponses: "Kết quả",
      tabActivity: "Hoạt động",
      tabEvents: "Sự kiện",
      tabSettings: "Cấu hình",
      testsTitle: "Tab: Tests",
      testsHeaders: "id, title, description, category, difficulty, duration, image_url, certificate_enabled, passing_threshold",
      usersTitle: "Tab: Users",
      usersHeaders: "id, name, email, role, password, image_url",
      responsesTitle: "Tab: Responses",
      responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses, Certificate ID",
      activityTitle: "Tab: System_Activity (Nhật ký hợp nhất)",
      activityHeaders: "timestamp, user_name, user_email, user_role, event_type, context, details, ip_address, device, browser, status, session_id",
      settingsTitle: "Tab: Settings",
      settingsHeaders: "key, value",
      dynamicTitle: "Tab câu hỏi",
      dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
    },
    step2: {
      num: "02",
      title: "Kết nối Backend",
      desc: "Sử dụng Google Apps Script để kết nối giao diện với bảng tính.",
      codeTitle: "Mã nguồn GAS",
      codeDesc: "Vào Tiện ích mở rộng > Apps Script và dán đoạn mã bên dưới.",
      deployTitle: "Triển khai",
      deploy1: "Loại: Ứng dụng Web",
      deploy2: "Thực thi: Tôi (Me)",
      deploy3: "Truy cập: Mọi người (Anyone)",
      deployFooter: "Lưu lại URL được cấp để cấu hình frontend."
    },
    step3: {
      num: "03",
      title: "Triển khai Frontend",
      desc: "Chạy giao diện và kết nối với cơ sở dữ liệu.",
      repoTitle: "1. Khởi tạo",
      repoDesc: "Tải mã nguồn và cài đặt thư viện.",
      configTitle: "2. Cấu hình",
      configDesc: "Thiết lập API URL trong biến môi trường.",
      deployFinalTitle: "3. Hoàn tất",
      deployFinalDesc: "Đưa website lên môi trường chính thức.",
      ready: "Sẵn sàng",
      launch: "Bắt đầu"
    }
  }
};
