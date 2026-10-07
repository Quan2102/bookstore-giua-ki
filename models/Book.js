const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    maSach: { type: String, required: true },
    tenSach: { type: String, required: true },
    tacGia: { type: String, default: '' },
    gia: { type: Number, required: true }, // gia goc truoc thue
    giaSauThue: { type: Number, required: true }, // gia sau khi ap VAT
    vat: { type: Number, required: true }
  },
  { timestamps: true, collection: 'books' }
);

// Tao model tren tung connection rieng (read / write)
module.exports = (conn) => conn.model('Book', bookSchema);
