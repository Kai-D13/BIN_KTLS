# 🚀 BIN Recovery System - Deployment Guide

## ✅ Hoàn thành các tính năng

### 1. **XÓA DỮ LIỆU THEO TUẦN** ✅
- Component `DeleteData.tsx` đã được tích hợp vào Admin Panel
- Chỉ hiện khi Admin Mode được bật
- Có xác nhận trước khi xóa (modal cảnh báo)
- Xóa toàn bộ dữ liệu của 1 tuần cụ thể (từ 1-4)

### 2. **PHÂN QUYỀN ADMIN - CHỈ BẠN MỚI THẤY ADMIN MODE** ✅
- Hệ thống có 2 chế độ đăng nhập:
  - **User Login:** Mật khẩu `KTLS2025` - Chỉ xem dữ liệu
  - **Admin Login:** Mật khẩu `KTLS_ADMIN_2025` - Có quyền Upload và Delete

#### Cách sử dụng:
1. Mở trang login, click nút **Admin** (màu đỏ)
2. Nhập mật khẩu: `KTLS_ADMIN_2025`
3. Sau khi đăng nhập thành công → Nút **Admin Mode** sẽ hiện
4. User bình thường (đăng nhập bằng `KTLS2025`) → KHÔNG thấy nút Admin Mode

⚠️ **QUAN TRỌNG:** Chỉ bạn biết mật khẩu admin `KTLS_ADMIN_2025`, đừng chia sẻ với ai!

### 3. **HỖ TRỢ MOBILE (RESPONSIVE DESIGN)** ✅
- **Login Page:** Responsive hoàn toàn, button nhỏ gọn trên mobile
- **Dashboard Header:** Flex column trên mobile, button full-width
- **Tabs:** Horizontal scroll, không bị tràn
- **Filter Panel:** Grid 1 cột mobile → 2 cột tablet → 3 cột desktop
- **Data Table:** 
  - Desktop: Table đầy đủ các cột
  - Mobile: Card view với thông tin gọn gàng
- **Pagination:** Compact trên mobile, ẩn text "Trước/Sau", chỉ giữ icon
- **Admin Panel:** Upload + Delete responsive, button full-width trên mobile

---

## 📱 Hướng dẫn sử dụng trên Mobile

### Đăng nhập Admin trên điện thoại:
1. Mở website trên trình duyệt mobile (Chrome, Safari)
2. Click nút **Admin** (màu đỏ)
3. Nhập `KTLS_ADMIN_2025`
4. Click "Đăng nhập"

### Upload file trên Mobile:
1. Click **Admin Mode** button (góc trên phải)
2. Chọn tuần (Week 1-4)
3. Chọn tab (Danh sách cần thu hồi / Chốt đền bù)
4. Click "Chọn file Excel" → Chọn file từ Google Drive, Downloads, v.v.
5. Click "Upload"

### Xem dữ liệu trên Mobile:
- Table tự động chuyển sang **Card View** (dễ đọc hơn)
- Swipe để xem pagination
- Filter panel full-width, dễ chọn

---

## 🔐 Thông tin đăng nhập

### User bình thường:
- **Mật khẩu:** `KTLS2025`
- **Quyền:** Chỉ xem dữ liệu, lọc, export Excel
- **KHÔNG thấy:** Nút Admin Mode

### Admin (chỉ bạn):
- **Mật khẩu:** `KTLS_ADMIN_2025`
- **Quyền:** 
  - ✅ Upload file Excel
  - ✅ Xóa dữ liệu theo tuần
  - ✅ Xem, lọc, export như user
- **Thấy:** Nút Admin Mode (chuyển đổi giữa Admin Panel và View Mode)

---

## 🌐 Deploy lên Vercel (Production)

### Bước 1: Chuẩn bị
```bash
cd c:\Users\admin\web_driver\bin-recovery-system
git init
git add .
git commit -m "Initial commit - BIN Recovery System"
```

### Bước 2: Tạo repository trên GitHub
1. Vào https://github.com/new
2. Tạo repository tên: `bin-recovery-system`
3. **QUAN TRỌNG:** Chọn **Private** (để bảo mật)
4. Không chọn Initialize with README
5. Copy lệnh push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bin-recovery-system.git
git branch -M main
git push -u origin main
```

### Bước 3: Deploy lên Vercel
1. Vào https://vercel.com/new
2. Import repository từ GitHub
3. Chọn `bin-recovery-system`
4. **Environment Variables** → Add các biến sau:

```
NEXT_PUBLIC_SUPABASE_URL=https://rbuovilgbykugjaoyirk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJidW92aWxnYnlrdWdqYW95aXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjQ4MTUsImV4cCI6MjA3ODk0MDgxNX0.XAHROv3Zc9lFMIvXvh0auxPxJcifjuC1puE8tZYSJIk
NEXT_PUBLIC_APP_PASSWORD=KTLS2025
NEXT_PUBLIC_ADMIN_PASSWORD=KTLS_ADMIN_2025
```

5. Click **Deploy**
6. Đợi 2-3 phút → Nhận link production (VD: `https://bin-recovery-system.vercel.app`)

### Bước 4: Test Production
1. Mở link production trên mobile và desktop
2. Test đăng nhập User (KTLS2025)
3. Test đăng nhập Admin (KTLS_ADMIN_2025)
4. Test upload file
5. Test xóa dữ liệu
6. Test filter, export Excel

---

## 🛠️ Supabase Auto-Delete (Optional)

Để tự động xóa dữ liệu cũ hơn 28 ngày:

### Bước 1: Enable pg_cron extension
1. Vào Supabase Dashboard → Database → Extensions
2. Tìm `pg_cron` → Click Enable

### Bước 2: Chạy SQL command
```sql
-- Schedule auto-delete to run daily at 2 AM
SELECT cron.schedule(
  'delete-old-bin-records',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT delete_old_records();
  $$
);
```

### Kiểm tra cron job:
```sql
SELECT * FROM cron.job;
```

---

## 📊 Thống kê hiện tại

- **Supabase Database:** ✅ Kết nối thành công
- **Tables:** 3 bảng (bin_pickup_pending, bin_compensation, import_history)
- **Dữ liệu hiện có:** 909 bản ghi (Week 1, Danh sách cần thu hồi)
- **RLS Policies:** ✅ Đã setup (public read/insert)
- **Auto-delete function:** ✅ Đã tạo (cần setup pg_cron để tự động chạy)

---

## 🎯 Workflow sử dụng hàng tuần

### Thứ 4 (Wednesday):
1. Nhận file "Wednesday 4" từ hệ thống
2. Đăng nhập Admin
3. Chọn tab **Chốt đền bù**
4. Chọn tuần hiện tại (Week 1-4)
5. Upload file Excel
6. Kiểm tra dữ liệu trong bảng

### Thứ 5 (Thursday):
1. Nhận file "Thursday 6" từ hệ thống
2. Đăng nhập Admin
3. Chọn tab **Danh sách cần thu hồi**
4. Chọn tuần hiện tại (Week 1-4)
5. Upload file Excel
6. Share link với team để họ xem

### Cuối tháng (hoặc khi cần):
1. Đăng nhập Admin
2. Bật Admin Mode
3. Chọn tab cần xóa
4. Click "Xóa dữ liệu" → Chọn tuần cũ
5. Xác nhận xóa

---

## 🔧 Troubleshooting

### Nếu không thấy nút Admin Mode sau khi đăng nhập:
- ✅ Đảm bảo bạn đã chọn **Admin** tab trước khi đăng nhập
- ✅ Đảm bảo mật khẩu là `KTLS_ADMIN_2025` (không phải `KTLS2025`)
- ✅ Logout và đăng nhập lại

### Nếu upload file bị lỗi:
- ✅ Kiểm tra file Excel có đúng format không (cột HẠN THU HỒI, MÃ ĐƠN, v.v.)
- ✅ Kiểm tra kết nối internet
- ✅ Check console logs (F12 → Console)

### Nếu mobile không responsive:
- ✅ Clear cache trình duyệt
- ✅ Hard reload (Ctrl + Shift + R)
- ✅ Thử trình duyệt khác (Chrome, Safari)

---

## 📞 Liên hệ

Nếu cần hỗ trợ kỹ thuật, gửi thông tin:
- URL của website
- Screenshot lỗi
- Bước thao tác gây ra lỗi

---

**Chúc bạn sử dụng hệ thống hiệu quả! 🎉**
