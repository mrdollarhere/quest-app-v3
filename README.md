# DNTRNG™ - Intelligence Simplified

[![DNTRNG Protocol](https://img.shields.io/badge/DNTRNG-Protocol_v18.2-blue?style=for-the-badge&logo=google-sheets)](https://dntrng.com)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**DNTRNG™** is a premium, high-performance interactive assessment and intelligence engine. Built for speed and scale, it bridges the gap between modern React frontends and the ubiquitous power of Google Sheets™, allowing you to deploy complex intelligence modules in seconds.

---

## 🚀 Core Features | Tính Năng Cốt Lõi

- **Direct Cloud Sync**: Real-time bi-directional synchronization with Google Sheets™ as your database.
- **Advanced Interaction Modules**: Hotspots (Visual mapping), Ordering, Matching (Drag & Drop), Matrix Choice, and Multiple True/False.
- **Intelligence Zone Mapper**: Built-in visual CAD tool for administrators to map hotspot coordinates on any image asset.
- **Daily Access Protocol**: Dynamic, time-sensitive security keys generated algorithmically for session protection.
- **Identity Registry**: Personalized operator dashboards with live performance analytics.

---

## 🖥️ Desktop Deployment (Electron)

To run the DNTRNG™ Desktop Application locally:

1.  **Clone Source**: Download or clone this repository to your local machine.
2.  **Install Dependencies**: Run `npm install` in your terminal.
3.  **Launch Desktop Node**: Execute `npm run electron:dev`.
    *   This starts the Next.js server on port `9005`.
    *   The DNTRNG™ Desktop window will open automatically once the server is ready.
4.  **Build Binary**: To create a standalone executable (.exe or .app), run `npm run electron:build`.

---

## 🇺🇸 Operational Protocol (English)

### Phase 01: Sheet Architecture
Create a new Google Sheet and provision the following core tabs (Case-Sensitive).

1.  **`Tests`**: `id`, `title`, `description`, `category`, `difficulty`, `duration`, `image_url`
2.  **`Users`**: `id`, `name`, `email`, `role`, `password`
3.  **`Responses`**: `Timestamp`, `User Name`, `User Email`, `Test ID`, `Score`, `Total`, `Duration (ms)`, `Raw Responses`
4.  **Module Tabs**: Create a tab for every test `id` using: `id`, `question_text`, `question_type`, `options`, `correct_answer`, `order_group`, `image_url`, `metadata`, `required`

### Phase 02: Logic Injection
1. Open Google Sheet > **Extensions > Apps Script**.
2. Paste code from `src/app/lib/gas-template.ts`.
3. **Deploy > New Deployment > Web App**.
4. Execute as: **Me**, Access: **Anyone**.
5. Copy the **Web App URL** and update `src/lib/api-config.ts`.

### Phase 03: Deployment
- **Vercel**: Push to GitHub and connect your project. No extra config needed.
- **Firebase**: App Hosting is pre-configured. Use `firebase deploy`.

---

## 🇻🇳 Quy Trình Vận Hành (Tiếng Việt)

### Giai đoạn 01: Kiến Trúc Bảng Tính
Tạo Google Sheet mới và thiết lập các tab sau (Phân biệt chữ hoa/thường).

1.  **`Tests` (Danh Mục)**: Danh sách các bài kiểm tra.
2.  **`Users` (Người Dùng)**: Quản lý danh tính và quyền truy cập.
3.  **`Responses` (Nhật Ký)**: Lưu trữ kết quả và điểm số.
4.  **Tab Câu Hỏi**: Tạo tab riêng cho mỗi `id` bài test với các tiêu đề cột tiêu chuẩn.

### Giai đoạn 02: Triển Khai Backend
1. Vào Google Sheet > **Tiện ích mở rộng > Apps Script**.
2. Dán mã nguồn từ `src/app/lib/gas-template.ts`.
3. **Triển khai > Ứng dụng Web**. Cấu hình "Truy cập: Mọi người".
4. Sao chép URL vào `src/lib/api-config.ts`.

### Giai đoạn 03: Triển Khai Frontend
- **Vercel**: Đẩy mã nguồn lên GitHub và kết nối với dự án Vercel.
- **Firebase**: Sử dụng lệnh `firebase deploy` để triển khai qua App Hosting.

---

## 🔐 Identity Provisioning
Access the **DNTRNG™ Console** using default admin credentials:
*   **Identity:** `admin@dntrng.com`
*   **Secret:** `admin123`

## ⚖️ License
This project is part of the **DNTRNG™ Open Source Initiative**. All rights reserved.
