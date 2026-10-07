const mongoose = require('mongoose');

// Ket noi 1: tai khoan CHI DOC -> phuc vu truy van xem danh sach
const readConn = mongoose.createConnection(process.env.MONGO_READ_URI);
// Ket noi 2: tai khoan CHI GHI -> phuc vu them sach moi
const writeConn = mongoose.createConnection(process.env.MONGO_WRITE_URI);

readConn.on('connected', () => console.log('[DB] Read connection (read_23IT224) OK'));
writeConn.on('connected', () => console.log('[DB] Write connection (write_23IT224) OK'));
readConn.on('error', (e) => console.error('[DB] Read connection error:', e.message));
writeConn.on('error', (e) => console.error('[DB] Write connection error:', e.message));

module.exports = { readConn, writeConn };
