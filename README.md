# Quan ly Sach - Bai kiem tra giua ki Dien toan dam may

## Cai dat (Windows)
1. Copy `.env.example` thanh `.env`, dien 3 connection string + mat khau that.
2. Mo terminal tai thu muc project:
   ```
   npm install
   node server.js
   ```
3. Mo trinh duyet: http://localhost:3000

## Kiem tra dung yeu cau de bai
- Them sach co ma KHONG bat dau bang `224` -> bi tu choi (400).
- Them sach ma `224-...` -> luu thanh cong, gia sau thue = gia * 1.08.
- Refresh trang nhieu lan: so "luot xem trong phien" tang dan (session luu tren Atlas, khong mat khi restart server).
- Footer hien: Ho ten - MSSV - VAT 8%.

## Trien khai Render
- Start Command: `node server.js`
- Cac bien moi truong: nhap toan bo noi dung `.env` vao muc Environment (KHONG commit .env).
