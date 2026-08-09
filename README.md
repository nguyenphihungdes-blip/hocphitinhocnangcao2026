# Xác nhận học phí Tin học tháng 8/2026

Trang GitHub Pages dành cho phụ huynh xác nhận học phí. Biểu mẫu chỉ có hai lựa chọn bắt buộc:

- Lớp học.
- Tên học sinh thuộc lớp đã chọn.

Không yêu cầu số điện thoại hoặc ảnh minh chứng chuyển khoản.

## Danh sách lớp

- **Lớp Nền Tảng Vững:** 3 học sinh.
- **Lớp Bứt Phá Nâng Cao:** 13 học sinh.

Danh sách ở giao diện và Google Apps Script được đối chiếu với bảng lớp tháng 8/2026.

## Cấu trúc mã

- `index.html`, `style.css`, `script.js`: giao diện GitHub Pages.
- `assets/qr-sacombank.jpg`: mã QR chuyển khoản.
- `apps-script/Code.gs`: mã Google Apps Script đang dùng.
- `apps-script/appsscript.json`: cấu hình Apps Script.

## Dữ liệu được ghi nhận

Google Apps Script ghi vào trang tính **Học phí tháng 8/2026** gồm thời gian xác nhận, lớp, tên học sinh, số tiền, nội dung chuyển khoản và trạng thái. Mỗi học sinh chỉ được xác nhận một lần trong đúng lớp; tên ngoài danh sách sẽ bị từ chối.

Web app đang triển khai với quyền truy cập **Bất kỳ ai** và được gắn sẵn trong `script.js`.
