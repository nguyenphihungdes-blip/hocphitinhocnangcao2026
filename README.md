# Biểu xác nhận học phí Tin học hè 2026

Bộ mã gồm:

- `index.html`, `style.css`, `script.js`: giao diện đưa lên GitHub Pages.
- `assets/qr-sacombank.jpg`: ảnh QR chuyển khoản.
- `apps-script/Code.gs`: backend nhận ảnh, lưu Drive và ghi Google Sheets.
- `apps-script/appsscript.json`: cấu hình dự án Apps Script.

## 1. Tạo Google Apps Script

1. Mở `https://script.google.com` bằng tài khoản có quyền chỉnh sửa thư mục Drive đã cung cấp.
2. Tạo **Dự án mới**.
3. Xóa mã mặc định và dán toàn bộ nội dung trong `apps-script/Code.gs`.
4. Vào **Cài đặt dự án** → bật hiển thị tệp manifest nếu muốn dùng `appsscript.json`, sau đó dán nội dung tương ứng. Bước này không bắt buộc nếu bạn chọn múi giờ Việt Nam thủ công.
5. Bấm **Triển khai** → **Lượt triển khai mới** → loại **Ứng dụng web**.
6. Thiết lập:
   - Thực thi với tư cách: **Tôi**.
   - Người có quyền truy cập: **Bất kỳ ai**.
7. Cấp quyền truy cập Drive và Google Sheets.
8. Sao chép URL kết thúc bằng `/exec`.

## 2. Gắn URL Apps Script vào website

Mở `script.js`, thay dòng:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

bằng URL `/exec` vừa sao chép.

## 3. Đưa website lên GitHub Pages

1. Tạo repository mới trên GitHub.
2. Tải các tệp ở thư mục gốc lên repository: `index.html`, `style.css`, `script.js`, thư mục `assets`.
3. Vào **Settings** → **Pages**.
4. Chọn triển khai từ nhánh `main`, thư mục `/root`.
5. Chờ GitHub cung cấp đường link website.

## 4. Dữ liệu được lưu như thế nào

Khi phụ huynh gửi biểu mẫu:

- Ảnh được lưu trực tiếp vào thư mục Drive có mã:
  `1LcA6Vjyuoz8O8PEVCxasaJFW_EcrBZvj`
- Google Sheets tên **Tổng hợp học phí Tin học hè 2026** được tự tạo trong cùng thư mục.
- Mỗi học sinh chỉ được ghi nhận một lần theo tổ hợp **Lớp + Tên học sinh**.
- Một phụ huynh vẫn có thể đóng cho nhiều học sinh khác nhau vì hệ thống không khóa theo thiết bị hay số điện thoại.

## 5. Kiểm tra trước khi gửi link cho phụ huynh

- Mở URL Apps Script `/exec`; phải thấy thông báo hệ thống đang hoạt động.
- Gửi thử một ảnh với một học sinh.
- Kiểm tra ảnh và Google Sheets trong thư mục Drive.
- Thử gửi lại cùng học sinh; hệ thống phải báo đã có xác nhận.

## Lưu ý

Google Sheets là tệp bảng tính trực tuyến và có thể tải xuống Excel bằng **Tệp → Tải xuống → Microsoft Excel (.xlsx)**. Dữ liệu luôn được cập nhật trực tiếp trong Google Sheets; tệp `.xlsx` tải xuống chỉ là bản chụp tại thời điểm tải.
