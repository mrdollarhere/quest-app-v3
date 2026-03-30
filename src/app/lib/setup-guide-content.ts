/**
 * Static content registry for the Setup Guide.
 * Includes multi-language translations for installation protocols.
 */

export const SETUP_GUIDE_CONTENT = {
  en: {
    title: "Hosting Protocol",
    subtitle: "Self-Host This Platform",
    returnBase: "Exit Laboratory",
    launchConsole: "Open Console",
    step1: {
      num: "01",
      title: "Database Architecture",
      desc: "Provision your storage using Google Sheets™ as the master database.",
      alertTitle: "Critical Requirement",
      alertDesc: "You must create five core tabs named exactly: Tests, Users, Responses, Activity, Settings.",
      tabTests: "Tests",
      tabUsers: "Users",
      tabResponses: "Logs",
      tabActivity: "System",
      tabSettings: "Settings",
      testsTitle: "Database Tab: Tests",
      testsHeaders: "id, title, description, category, difficulty, duration, image_url",
      usersTitle: "Database Tab: Users",
      usersHeaders: "id, name, email, role, password",
      responsesTitle: "Database Tab: Responses",
      responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses",
      activityTitle: "Database Tab: Activity",
      activityHeaders: "Timestamp, User Name, User Email, Event, IP Address, Device",
      settingsTitle: "Database Tab: Settings",
      settingsHeaders: "key, value",
      dynamicTitle: "Module Sheets",
      dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
    },
    step2: {
      num: "02",
      title: "Data Bridge",
      desc: "Deploy the Google Apps Script backend to connect the UI to your Sheet.",
      codeTitle: "GAS Template",
      codeDesc: "Navigate to Extensions > Apps Script in your sheet and paste the template below.",
      deployTitle: "Cloud Deployment",
      deploy1: "Type: Web App",
      deploy2: "Execute as: Me",
      deploy3: "Access: Anyone",
      deployFooter: "Update src/lib/api-config.ts with the provided URL."
    },
    step3: {
      num: "03",
      title: "Frontend Setup",
      desc: "Initialize your repository and deploy the interface to the cloud.",
      repoTitle: "1. Repository Initialization",
      repoDesc: "Clone the framework and install dependencies.",
      configTitle: "2. Database Connection",
      configDesc: "Link your local code to your Google Sheet deployment.",
      deployFinalTitle: "3. Global Deployment",
      deployFinalDesc: "Push your code to production using Vercel or Firebase.",
      ready: "Setup Complete",
      launch: "Start Platform"
    }
  },
  vi: {
    title: "Hướng dẫn cài đặt",
    subtitle: "Tự triển khai hệ thống",
    returnBase: "Thoát",
    launchConsole: "Mở bảng điều khiển",
    step1: {
      num: "01",
      title: "Cấu trúc dữ liệu",
      desc: "Thiết lập Google Sheets™ làm kho lưu trữ dữ liệu chính.",
      alertTitle: "Yêu cầu bắt buộc",
      alertDesc: "Bạn phải tạo 5 tab chính: Tests, Users, Responses, Activity, Settings (Đúng chính tả).",
      tabTests: "Tests",
      tabUsers: "Users",
      tabResponses: "Kết quả",
      tabActivity: "Hệ thống",
      tabSettings: "Cấu hình",
      testsTitle: "Tab Danh Mục: Tests",
      testsHeaders: "id, title, description, category, difficulty, duration, image_url",
      usersTitle: "Tab Người dùng: Users",
      usersHeaders: "id, name, email, role, password",
      responsesTitle: "Tab Nhật ký: Responses",
      responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses",
      activityTitle: "Tab Hoạt động: Activity",
      activityHeaders: "Timestamp, User Name, User Email, Event, IP Address, Device",
      settingsTitle: "Tab Cấu hình: Settings",
      settingsHeaders: "key, value",
      dynamicTitle: "Tab Câu hỏi",
      dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
    },
    step2: {
      num: "02",
      title: "Cầu nối dữ liệu",
      desc: "Triển khai Google Apps Script để đồng bộ hóa dữ liệu.",
      codeTitle: "Mã nguồn GAS",
      codeDesc: "Vào Tiện ích mở rộng > Apps Script và dán mã nguồn từ nút bên dưới.",
      deployTitle: "Triển khai Web",
      deploy1: "Loại: Ứng dụng Web",
      deploy2: "Thực thi: Tôi (Me)",
      deploy3: "Truy cập: Mọi người (Anyone)",
      deployFooter: "Cập nhật URL vào file src/lib/api-config.ts."
    },
    step3: {
      num: "03",
      title: "Triển khai giao diện",
      desc: "Thiết lập mã nguồn và đưa website của bạn lên internet.",
      repoTitle: "1. Khởi tạo mã nguồn",
      repoDesc: "Tải mã nguồn và cài đặt các thư viện cần thiết.",
      configTitle: "2. Cấu hình kết nối",
      configDesc: "Kết nối giao diện với backend Google Sheets của bạn.",
      deployFinalTitle: "3. Đưa lên Internet",
      deployFinalDesc: "Sử dụng Vercel hoặc Firebase để chạy website chính thức.",
      ready: "Hệ thống sẵn sàng",
      launch: "Bắt đầu"
    }
  }
};
