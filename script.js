// Fungsi Navigasi Tab
function switchTab(tabName) {
    document.getElementById('tab-kasir').classList.add('d-none');
    document.getElementById('tab-produk').classList.add('d-none');
    document.getElementById('tab-laporan').classList.add('d-none');

    document.querySelectorAll('.navbar-nav .nav-link').forEach(el => el.classList.remove('active'));

    if (tabName === 'kasir') {
        document.getElementById('tab-kasir').classList.remove('d-none');
        event.target.classList.add('active');
        renderProductKasir();
    } else if (tabName === 'produk') {
        document.getElementById('tab-produk').classList.remove('d-none');
        event.target.classList.add('active');
        renderProductTable();
    } else if (tabName === 'laporan') {
        document.getElementById('tab-laporan').classList.remove('d-none');
        event.target.classList.add('active');
        renderTransactionTable();
    }
}

// ================= FITUR KASIR =================
function renderProductKasir() {
    const keyword = document.getElementById('searchProduct').value.toLowerCase();
    const grid = document.getElementById('productGridKasir');
    grid.innerHTML = '';

    const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted">Produk tidak ditemukan</div>`;
        return;
    }

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="col">
                <div class="card h-100 border shadow-sm product-card" style="cursor: pointer;" onclick="addToCart(${p.id})">
                    <div class="card-body p-3">
                        <h6 class="card-title fw-bold text-dark mb-1">${p.name}</h6>
                        <p class="text-success fw-semibold mb-1">${formatRupiah(p.price)}</p>
                        <span class="badge bg-secondary">Stok: ${p.stock}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product.stock <= 0) {
        alert('Stok produk habis!');
        return;
    }

    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        if (cartItem.qty < product.stock) {
            cartItem.qty++;
        } else {
            alert('Jumlah melebihi stok yang tersedia!');
        }
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }
    renderCart();
}

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';

    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Keranjang masih kosong</td></tr>`;
        document.getElementById('cartTotal').innerText = formatRupiah(0);
        document.getElementById('changeAmount').innerText = formatRupiah(0);
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        let subtotal = item.price * item.qty;
        total += subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary px-1 py-0" onclick="changeQty(${index}, -1)">-</button>
                    <span class="mx-1">${item.qty}</span>
                    <button class="btn btn-sm btn-outline-secondary px-1 py-0" onclick="changeQty(${index}, 1)">+</button>
                </td>
                <td>${formatRupiah(subtotal)}</td>
                <td><button class="btn btn-sm text-danger p-0" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });

    document.getElementById('cartTotal').innerText = formatRupiah(total);
    calculateChange();
}

function changeQty(index, delta) {
    const item = cart[index];
    const product = products.find(p => p.id === item.id);
    
    let newQty = item.qty + delta;
    if (newQty > 0 && newQty <= product.stock) {
        item.qty = newQty;
    } else if (newQty > product.stock) {
        alert('Stok tidak mencukupi!');
    } else {
        cart.splice(index, 1);
    }
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cash = parseFloat(document.getElementById('cashAmount').value) || 0;
    const change = cash - total;

    const changeEl = document.getElementById('changeAmount');
    if (change >= 0) {
        changeEl.innerText = formatRupiah(change);
        changeEl.className = "fw-bold text-success";
    } else {
        changeEl.innerText = "Uang kurang " + formatRupiah(Math.abs(change));
        changeEl.className = "fw-bold text-danger";
    }
}

// ================= FITUR DOWNLOAD NOTA OTOMATIS =================
function downloadReceipt(trx) {
    let strukText = `================================\n`;
    strukText += `        KOPERASI SISWA          \n`;
    strukText += `================================\n`;
    strukText += `ID Transaksi : ${trx.id}\n`;
    strukText += `Tanggal      : ${trx.date}\n`;
    strukText += `--------------------------------\n`;
    
    trx.items.forEach(item => {
        let subTotal = item.price * item.qty;
        strukText += `${item.name}\n`;
        strukText += `  ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(subTotal)}\n`;
    });
    
    strukText += `--------------------------------\n`;
    strukText += `Total Belanja  : ${formatRupiah(trx.total)}\n`;
    strukText += `Tunai Dibayar  : ${formatRupiah(trx.cash)}\n`;
    strukText += `Kembalian      : ${formatRupiah(trx.change)}\n`;
    strukText += `================================\n`;
    strukText += `   TERIMA KASIH TELAH BERBELANJA  \n`;
    strukText += `================================\n`;

    const blob = new Blob([strukText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nota-${trx.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function checkout() {
    if (cart.length === 0) {
        alert('Keranjang belanja masih kosong!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cash = parseFloat(document.getElementById('cashAmount').value) || 0;

    if (cash < total) {
        alert('Jumlah uang bayar kurang dari total belanja!');
        return;
    }

    cart.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.id);
        if (prod) {
            prod.stock -= cartItem.qty;
        }
    });

    const transaction = {
        id: 'TRX-' + Date.now().toString().slice(-6),
        date: new Date().toLocaleString('id-ID'),
        items: [...cart],
        total: total,
        cash: cash,
        change: cash - total
    };

    transactions.unshift(transaction);
    saveData();

    // Panggil fungsi download nota otomatis
    downloadReceipt(transaction);

    alert('Transaksi Berhasil! Nota otomatis diunduh. Kembalian: ' + formatRupiah(transaction.change));

    cart = [];
    document.getElementById('cashAmount').value = '';
    renderCart();
    renderProductKasir();
}

// ================= FITUR KELOLA PRODUK =================
function renderProductTable() {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada produk</td></tr>`;
        return;
    }

    products.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${p.name}</td>
                <td>${formatRupiah(p.price)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn btn-sm btn-warning text-white me-1" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const stock = parseInt(document.getElementById('prodStock').value);

    if (id) {
        const prod = products.find(p => p.id == id);
        prod.name = name;
        prod.price = price;
        prod.stock = stock;
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, price, stock });
    }

    saveData();
    resetProductForm();
    renderProductTable();
}

function editProduct(id) {
    const prod = products.find(p => p.id === id);
    document.getElementById('editProductId').value = prod.id;
    document.getElementById('prodName').value = prod.name;
    document.getElementById('prodPrice').value = prod.price;
    document.getElementById('prodStock').value = prod.stock;

    document.getElementById('formProductTitle').innerHTML = `<i class="fas fa-edit me-2"></i>Edit Produk`;
    document.getElementById('btnSaveProd').innerText = 'Perbarui Produk';
    document.getElementById('btnCancelEdit').classList.remove('d-none');
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('formProductTitle').innerHTML = `<i class="fas fa-plus-circle me-2"></i>Tambah Produk Baru`;
    document.getElementById('btnSaveProd').innerText = 'Simpan Produk';
    document.getElementById('btnCancelEdit').classList.add('d-none');
}

function deleteProduct(id) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderProductTable();
    }
}

// ================= FITUR LAPORAN =================
function renderTransactionTable() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada riwayat transaksi</td></tr>`;
        return;
    }

    transactions.forEach(trx => {
        let itemsList = trx.items.map(i => `${i.name} (${i.qty}x)`).join(', ');
        tbody.innerHTML += `
            <tr>
                <td><span class="fw-bold text-primary">${trx.id}</span></td>
                <td>${trx.date}</td>
                <td><small>${itemsList}</small></td>
                <td class="fw-bold">${formatRupiah(trx.total)}</td>
                <td>${formatRupiah(trx.cash)}</td>
                <td class="text-success">${formatRupiah(trx.change)}</td>
            </tr>
        `;
    });
}

function clearTransactions() {
    if (confirm('Yakin ingin menghapus semua riwayat laporan transaksi?')) {
        transactions = [];
        saveData();
        renderTransactionTable();
    }
}

// Inisialisasi awal saat halaman dibuka
renderProductKasir();