require('dotenv').config();
const express = require('express');

// ---- Kiem tra bien moi truong bat buoc (bao loi ro rang thay vi crash kho hieu) ----
const REQUIRED_ENV = ['MONGO_READ_URI', 'MONGO_WRITE_URI', 'MONGO_SESSION_URI', 'SESSION_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('\n[ERROR] Thieu bien moi truong trong file .env: ' + missing.join(', '));
  console.error('-> Copy file .env.example thanh .env roi dien day du thong tin.\n');
  process.exit(1);
}

const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');
const { readConn, writeConn } = require('./config/db');
const makeBookModel = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Thong tin ca nhan hoa theo de bai ----
const MSSV = process.env.MSSV || '23IT224';
const FULLNAME = process.env.FULLNAME || 'Nguyen Van Minh Quan';
const PREFIX = MSSV.slice(-3); // 3 so cuoi MSSV -> tien to ma sach
const VAT = parseInt(MSSV.slice(-1), 10) + 4; // (chu so cuoi MSSV + 4)%

// ---- View engine: Handlebars ----
app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

// ---- Session STATELESS: luu tap trung xuong MongoDB Atlas ----
// Tuyet doi KHONG luu session trong RAM -> auto-scaling khong mat phien
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'doi-chuoi-bi-mat-nay',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SESSION_URI,
      collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 } // 1 gio
  })
);

// ---- Bien dung chung cho footer (Ho ten - MSSV - VAT) ----
app.use((req, res, next) => {
  res.locals.fullname = FULLNAME;
  res.locals.mssv = MSSV;
  res.locals.vat = VAT;
  next();
});

// Model doc tren connection READ, model ghi tren connection WRITE
const BookRead = makeBookModel(readConn);
const BookWrite = makeBookModel(writeConn);

// ---- GET / : xem danh sach sach (luong READ -> tai khoan read) ----
app.get('/', async (req, res) => {
  try {
    req.session.views = (req.session.views || 0) + 1; // dem so luot xem trong phien (chung minh session hoat dong)
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();
    res.render('books', { books, views: req.session.views });
  } catch (err) {
    res.status(500).send('Loi doc du lieu: ' + err.message);
  }
});

// ---- POST /add : them sach moi (luong WRITE -> tai khoan write) ----
app.post('/add', async (req, res) => {
  const { maSach, tenSach, tacGia, gia } = req.body;
  const renderWithError = async (error) => {
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();
    return res.status(400).render('books', { books, error, views: req.session.views || 0 });
  };

  // Bo loc 1: ma sach bat buoc co tien to = 3 so cuoi MSSV
  if (!maSach || !maSach.startsWith(PREFIX)) {
    return renderWithError(`Ma sach phai bat dau bang "${PREFIX}" (3 so cuoi MSSV ${MSSV}). He thong tu choi xu ly.`);
  }
  const giaGoc = parseFloat(gia);
  if (isNaN(giaGoc) || giaGoc <= 0) {
    return renderWithError('Gia sach phai la so duong.');
  }

  // Bo loc 2: tu dong tinh gia sau thue VAT truoc khi luu
  const giaSauThue = Math.round(giaGoc * (1 + VAT / 100));

  try {
    await BookWrite.create({ maSach, tenSach, tacGia, gia: giaGoc, giaSauThue, vat: VAT });
    res.redirect('/');
  } catch (err) {
    renderWithError('Loi ghi du lieu: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | MSSV=${MSSV} | PREFIX=${PREFIX} | VAT=${VAT}%`);
});
