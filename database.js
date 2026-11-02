// Data Inisialisasi awal produk & riwayat jika Local Storage kosong
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Minyak Goreng 1L', price: 18000, stock: 15 },
    { id: 2, name: 'Beras Premium 5kg', price: 65000, stock: 10 },
    { id: 3, name: 'Gula Pasir 1kg', price: 14500, stock: 20 },
    { id: 4, name: 'Telur Ayam 1kg', price: 26000, stock: 12 },
    { id: 5, name: 'Mie Instan Goreng', price: 3000, stock: 100 }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Fungsi Simpan ke LocalStorage
function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format Mata uang Rupiah
function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}