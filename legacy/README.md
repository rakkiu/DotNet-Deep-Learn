# Phiên bản full stack trước đây

Các file ASP.NET Core / EF Core, database SQLite cũ và kiểm thử API trước đây được giữ tại đây để bảo toàn công việc và dữ liệu. Chúng không nằm trong quy trình build/chạy/kiểm thử của bản client-side hiện tại. Nội dung học hiện tại có nguồn duy nhất là `client/src/data/catalog.json` ở thư mục gốc, không sửa bản snapshot trong legacy.

Để chuyển hồ sơ cũ: `python3 scripts/export_sqlite.py legacy/server/Data/learning.db --output legacy-data/sqlite-profile.json` từ thư mục gốc, sau đó nhập JSON trong trang **Dữ liệu & sao lưu**. Database và tệp sao lưu cá nhân không được đưa vào Git. Chưa tự động nhập dữ liệu vào trình duyệt nào.
