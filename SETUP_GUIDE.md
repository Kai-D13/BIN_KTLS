# 🚀 HƯỚNG DẪN SETUP VÀ CHẠY HỆ THỐNG

## ⚠️ YÊU CẦU QUAN TRỌNG

### 1. Update Node.js lên version 20+

Hệ thống yêu cầu Node.js >= 20.9.0. Hiện tại bạn đang dùng v18.18.2.

**Cách update:**

#### Option 1: Download trực tiếp
1. Vào https://nodejs.org/
2. Tải bản **LTS** (Long Term Support) - hiện tại là v20.x hoặc v22.x
3. Cài đặt (sẽ tự động ghi đè version cũ)
4. Verify: `node --version`

#### Option 2: Dùng nvm (Node Version Manager) - Khuyến nghị
```powershell
# Download nvm-windows từ: https://github.com/coreybutler/nvm-windows/releases
# Sau khi cài nvm:
nvm install 20
nvm use 20
node --version
```

---

## 📁 CẤU TRÚC PROJECT ĐÃ TẠO

```
bin-recovery-system/
├── app/
│   ├── page.tsx              # Login page
│   └── dashboard/
│       └── page.tsx          # Main dashboard
├── components/
│   ├── AdminUpload.tsx       # Upload Excel interface
│   ├── DataTable.tsx         # Data table với pagination
│   ├── FilterPanel.tsx       # Bộ lọc HUB/Employee/Search
│   └── SummaryCards.tsx      # Cards hiển thị thống kê
├── lib/
│   ├── supabase.ts           # Supabase client & types
│   ├── store.ts              # Zustand state management
│   └── excel-parser.ts       # Parse & export Excel
├── .env.local                # Environment variables
├── supabase-schema.sql       # Database schema
└── package.json
```

---

## 🗄️ SETUP SUPABASE (MIỄN PHÍ)

### Bước 1: Tạo Supabase Project

1. Vào https://supabase.com
2. Sign up (miễn phí) bằng GitHub
3. Click **New Project**
4. Điền:
   - Name: `bin-recovery-system`
   - Database Password: Tạo password mạnh (lưu lại)
   - Region: **Southeast Asia (Singapore)** (gần VN nhất)
5. Click **Create new project** (chờ ~2 phút)

### Bước 2: Chạy SQL Schema

1. Vào project vừa tạo
2. Sidebar > **SQL Editor**
3. Click **New query**
4. Copy toàn bộ nội dung file `supabase-schema.sql`
5. Paste vào editor
6. Click **Run** (phải thấy "Success. No rows returned")

### Bước 3: Lấy API Keys

1. Sidebar > **Settings** > **API**
2. Copy 2 giá trị:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJxxx...`

### Bước 4: Setup Auto-Delete (Xóa data cũ hơn 28 ngày)

1. Sidebar > **Database** > **Extensions**
2. Tìm `pg_cron` > Click **Enable**
3. Vào **SQL Editor** > **New query**
4. Chạy:

```sql
SELECT cron.schedule(
  'delete-old-records',
  '0 2 * * *',
  'SELECT delete_old_records()'
);
```

5. Verify: `SELECT * FROM cron.job;` (phải thấy job vừa tạo)

---

## ⚙️ CẤU HÌNH PROJECT

### Bước 1: Update file `.env.local`

Mở file `c:\Users\admin\web_driver\bin-recovery-system\.env.local` và update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_PASSWORD=KTLS2025
```

### Bước 2: Cài lại dependencies (sau khi update Node.js)

```powershell
cd c:\Users\admin\web_driver\bin-recovery-system
npm install
```

---

## 🏃 CHẠY ỨNG DỤNG

### Development Mode (Local)

```powershell
cd c:\Users\admin\web_driver\bin-recovery-system
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

### Production Build (Test trước khi deploy)

```powershell
npm run build
npm start
```

---

## 📖 HƯỚNG DẪN SỬ DỤNG

### 1. Login
- Mở http://localhost:3000
- Nhập password: `KTLS2025`
- Click **Đăng nhập**

### 2. Upload File (Admin Mode)

1. Click nút **Admin Mode** ở góc phải
2. Chọn tab:
   - **Danh sách cần thu hồi** (File thứ 6)
   - **Chốt đền bù** (File thứ 4)
3. Click **Chọn file Excel** > Browse file
4. Chọn **Tuần** (1, 2, 3, hoặc 4)
5. Click **Upload File**
6. Chờ thông báo "Upload thành công..."

### 3. Xem và Filter Data (View Mode)

1. Click nút **View Mode**
2. Sử dụng bộ lọc:
   - **HUB Name**: Dropdown chọn hub
   - **Nhân viên**: Dropdown chọn employee
   - **Tìm kiếm**: Nhập bin_code, tên khách hàng, reference code
3. Summary cards tự động cập nhật theo filter
4. Scroll table, dùng pagination ở dưới
5. Click **Export Excel** để tải filtered data

### 4. Logout
- Click nút **Đăng xuất** ở góc phải

---

## 🌐 DEPLOY LÊN PRODUCTION (VERCEL - MIỄN PHÍ)

### Bước 1: Push code lên GitHub

```powershell
cd c:\Users\admin\web_driver\bin-recovery-system
git init
git add .
git commit -m "Initial commit - BIN Recovery System"

# Tạo repo mới trên GitHub > Copy URL
git remote add origin https://github.com/your-username/bin-recovery-system.git
git push -u origin main
```

### Bước 2: Deploy lên Vercel

1. Vào https://vercel.com
2. Sign up bằng GitHub
3. Click **Add New** > **Project**
4. Import GitHub repo `bin-recovery-system`
5. **Environment Variables** > Add:
   - `NEXT_PUBLIC_SUPABASE_URL`: paste URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: paste anon key
   - `NEXT_PUBLIC_APP_PASSWORD`: `KTLS2025`
6. Click **Deploy**
7. Chờ ~2 phút > Nhận được URL: `https://bin-recovery-system.vercel.app`

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Node.js version not supported"
→ Update Node.js lên version 20+

### Lỗi: "Supabase connection failed"
→ Kiểm tra `.env.local` có đúng URL và anon key không

### Lỗi: "Failed to parse Excel"
→ Đảm bảo file Excel có đúng cấu trúc columns như mẫu

### Data không hiển thị
→ Vào Supabase > **Table Editor** > Check có data trong `bin_pickup_pending` không

### Upload file bị lỗi
→ Mở **Console** (F12) trong browser > Check error message chi tiết

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, gửi screenshots:
1. Error message trong terminal
2. Console log trong browser (F12)
3. Supabase Table Editor

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Update Node.js lên v20+
- [ ] Tạo Supabase project
- [ ] Chạy SQL schema
- [ ] Enable pg_cron extension
- [ ] Setup cron job auto-delete
- [ ] Update .env.local với Supabase credentials
- [ ] npm install thành công
- [ ] npm run dev chạy OK
- [ ] Login với password KTLS2025
- [ ] Upload file Excel test thành công
- [ ] Filter và search hoạt động
- [ ] Export Excel OK
- [ ] Deploy lên Vercel (optional)

---

**🎉 Hoàn thành! Hệ thống đã sẵn sàng sử dụng!**
