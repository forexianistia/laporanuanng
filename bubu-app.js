let currentMode = 'keuangan';
let dbKeuangan = [];
let dbTabungan = [];
let pendingDeleteId = null;

const form = document.getElementById('mainForm');
let KURS_USD_TO_IDR = 17994.40;
let KURS_CENT_TO_IDR = 179.944;

// --- SISTEM LATAR BELAKANG FLUID DRAWER (GIF BERGERAK BEBAS) ---
const listFileGif = [
    "9976-bubu-lol.gif",
    "10814-bubu-and-dudu-drink-glass.gif",
    "18713-bubu.gif",
    "23724-unyel.gif",
    "55578-pandasquishy.gif",
    "70798-bearsquish.gif",
    "86953-bubududu-kiss.gif",
    "4178-bubuwinterhopyellow.gif",
    "4393-bearbounce.gif",
    "4694-sleep-bubupanda.gif"
];

const containerBg = document.getElementById('bg-container');
const activeGifs = [];

function inisialisasiGifLatar() {
    if (!containerBg) return;
    containerBg.innerHTML = ''; // Reset container untuk menghindari duplikasi rendering ganda

    listFileGif.forEach((namaFile) => {
        const img = document.createElement('img');
        img.src = namaFile;
        img.className = 'floating-gif';
        
        // Atur posisi awal acak di layar browser agar menyebar rata
        const posX = Math.random() * (window.innerWidth - 100);
        const posY = Math.random() * (window.innerHeight - 100);
        
        // Menentukan arah gerak acak (Delta X & Delta Y)
        let dx = (Math.random() - 0.5) * 1.0;
        let dy = (Math.random() - 0.5) * 1.0;
        
        // Menjaga agar tidak ada gambar yang diam di tempat (kecepatan minimum)
        if (Math.abs(dx) < 0.3) dx = dx < 0 ? -0.4 : 0.4;
        if (Math.abs(dy) < 0.3) dy = dy < 0 ? -0.4 : 0.4;

        img.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
        containerBg.appendChild(img);

        activeGifs.push({
            element: img,
            x: posX,
            y: posY,
            dx: dx,
            dy: dy,
            width: 75,
            height: 75
        });
    });

    // Jalankan siklus pembaruan posisi animasi frame demi frame secara konstan
    requestAnimationFrame(updatePosisiGif);
}

function updatePosisiGif() {
    const lebarLayar = window.innerWidth;
    const tinggiLayar = window.innerHeight;

    activeGifs.forEach((obj) => {
        obj.x += obj.dx;
        obj.y += obj.dy;

        // Memantulkan arah gerakan jika menyentuh dinding samping browser
        if (obj.x <= 0) {
            obj.x = 0;
            obj.dx *= -1;
        } else if (obj.x + obj.width >= lebarLayar) {
            obj.x = lebarLayar - obj.width;
            obj.dx *= -1;
        }

        // Memantulkan arah gerakan jika menyentuh langit-langit/lantai browser
        if (obj.y <= 0) {
            obj.y = 0;
            obj.dy *= -1;
        } else if (obj.y + obj.height >= tinggiLayar) {
            obj.y = tinggiLayar - obj.height;
            obj.dy *= -1;
        }

        // Terapkan posisi baru menggunakan akselerasi GPU (hardware-accelerated)
        obj.element.style.transform = `translate3d(${obj.x}px, ${obj.y}px, 0)`;
    });

    requestAnimationFrame(updatePosisiGif);
}

// --- SISTEM KUSTOM AUDIO SYNTHESIZER BUBU DUDU ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function mainkanSuaraKetik() {
    const modeSuara = document.getElementById('menuSuara').value;
    if (modeSuara === 'OFF') return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const sekarang = audioCtx.currentTime;
    
    if (modeSuara === '1') {
        buatNada(659.25, sekarang, 0.05);
        buatNada(880.00, sekarang + 0.05, 0.08);
    } else if (modeSuara === '2') {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, sekarang);
        osc.frequency.exponentialRampToValueAtTime(220, sekarang + 0.15);
        gain.connect(audioCtx.destination); osc.connect(gain);
        gain.gain.setValueAtTime(0.08, sekarang);
        gain.gain.exponentialRampToValueAtTime(0.01, sekarang + 0.15);
        osc.start(sekarang); osc.stop(sekarang + 0.15);
    } else if (modeSuara === '3') {
        buatNada(349.23, sekarang, 0.04);
        buatNada(523.25, sekarang + 0.04, 0.04);
        buatNada(698.46, sekarang + 0.08, 0.1);
    }
}

function buatNada(frekuensi, mulai, durasi) {
    try {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frekuensi, mulai);
        gain.gain.setValueAtTime(0.06, mulai);
        gain.gain.exponentialRampToValueAtTime(0.005, mulai + durasi);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(mulai); osc.stop(mulai + durasi);
    } catch(e){}
}

// --- SISTEM GANTI FONT DINAMIS ---
function gantiFontAplikasi(namaFontBaru) {
    const body = document.getElementById('mainBody');
    if (body) {
        // Bersihkan seluruh class font yang lama agar tidak bentrok
        body.classList.remove('font-fredoka', 'font-quicksand', 'font-pacifico', 'font-comfortaa', 'font-patrick');
        // Masukkan font baru sesuai value dari dropdown select menu
        body.classList.add(namaFontBaru);
        
        // Simpan preferensi font di localStorage biar gak ke-reset saat refresh halaman
        localStorage.setItem('fontAplikasiPilihan', namaFontBaru);
    }
}

// --- CORE FUNCTIONALITIES ---
async function ambilKursTerbaru() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!response.ok) throw new Error("API bermasalah");
        const data = await response.json();
        if (data.rates && data.rates.IDR) {
            KURS_USD_TO_IDR = data.rates.IDR;
            KURS_CENT_TO_IDR = data.rates.IDR / 100;
            renderView();
        }
    } catch (error) {
        renderView();
    }
}

try {
    dbKeuangan = JSON.parse(localStorage.getItem('jurnalKeuangan')) || [];
    dbTabungan = JSON.parse(localStorage.getItem('jurnalTabungan')) || [];
} catch (e) {
    dbKeuangan = []; dbTabungan = [];
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(angka) || 0);
}

function showModal({ title, message, type, confirmText, onConfirm, showCancel = true }) {
    const modal = document.getElementById('customModal');
    const box = document.getElementById('modalBox');
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    
    const mIcon = document.getElementById('modalIcon');
    if (mIcon) mIcon.innerHTML = type === 'danger' ? '😭' : type === 'success' ? '💖' : '🧸';

    const btnContainer = document.getElementById('modalActionButtons');
    if (btnContainer) {
        btnContainer.innerHTML = '';
        const cBtn = document.createElement('button');
        cBtn.className = `w-full text-white px-4 py-2 rounded-xl font-cute text-xs cursor-pointer ${type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#FFB6C1] hover:bg-[#FF9999]'}`;
        cBtn.innerText = confirmText || 'OK Oke!';
        cBtn.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };
        btnContainer.appendChild(cBtn);

        if (showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = "w-full bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer";
            cancelBtn.innerText = 'Batal';
            cancelBtn.onclick = closeModal;
            btnContainer.appendChild(cancelBtn);
        }
    }
    modal.classList.remove('pointer-events-none', 'opacity-0');
    box.classList.remove('scale-95');
}

function closeModal() {
    const modal = document.getElementById('customModal');
    const box = document.getElementById('modalBox');
    if (modal) modal.classList.add('pointer-events-none', 'opacity-0');
    if (box) box.classList.add('scale-95');
}

function switchMode(mode) {
    currentMode = mode;
    resetForm();
    const btnKeuangan = document.getElementById('tabKeuangan');
    const btnTabungan = document.getElementById('tabTabungan');
    const labelToko = document.getElementById('labelToko');
    const labelDetail = document.getElementById('labelDetail');
    const katContainer = document.getElementById('kategoriContainer');
    const tTitle = document.getElementById('tableTitle');

    if (mode === 'keuangan') {
        btnKeuangan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer bg-[#FFB6C1] text-white shadow-sm";
        btnTabungan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer text-[#CD853F] hover:text-[#D2691E]";
        labelToko.innerText = "🏪 Toko / Sumber Uang";
        labelDetail.innerText = "🍭 Keterangan Barang";
        katContainer.classList.remove('hidden');
        tTitle.innerText = "📈 Histori Keuangan Bulanan";
    } else {
        btnTabungan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer bg-[#FFB6C1] text-white shadow-sm";
        btnKeuangan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer text-[#CD853F] hover:text-[#D2691E]";
        labelToko.innerText = "🐷 Nama Celengan / Wadah";
        labelDetail.innerText = "🎯 Target / Goal Nabung";
        katContainer.classList.add('hidden');
        tTitle.innerText = "🐷 Catatan Tabungan Bubu Dudu";
    }
    renderView();
}

function renderView() {
    const summary = document.getElementById('summarySection');
    const headerRow = document.getElementById('tableHeaderRow');
    const tbody = document.getElementById('tabelBody');
    const inputTanggal = document.getElementById('tanggal');
    const selectJenis = document.getElementById('jenis');
    
    if (inputTanggal && !inputTanggal.value) {
        inputTanggal.value = new Date().toISOString().split('T')[0];
    }
    if (!tbody) return; 
    tbody.innerHTML = '';

    if (currentMode === 'keuangan') {
        if (selectJenis) {
            selectJenis.innerHTML = `
                <option value="Pengeluaran">💸 Pengeluaran (Uang Keluar)</option>
                <option value="Pemasukan">🎁 Pemasukan (Uang Masuk)</option>
            `;
        }
        if (headerRow) {
            headerRow.innerHTML = `
                <th class="p-2.5">Tanggal</th><th class="p-2.5">Toko</th><th class="p-2.5">Detail</th>
                <th class="p-2.5">Alasan</th><th class="p-2.5">Kategori</th><th class="p-2.5">Jenis</th>
                <th class="p-2.5 text-right">Jumlah</th><th class="p-2.5 text-center">Aksi</th>
            `;
        }

        let totalPemasukan = dbKeuangan.filter(x => x.jenis === 'Pemasukan').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        let totalPengeluaran = dbKeuangan.filter(x => x.jenis === 'Pengeluaran').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        
        if (summary) {
            summary.innerHTML = `
                <div class="bg-[#E0FFFF]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-sky-200 shadow-xs">
                    <p class="text-[10px] font-bold text-sky-600 uppercase">🎁 Total Masuk</p>
                    <p class="text-md font-cute text-sky-700">${formatRupiah(totalPemasukan)}</p>
                </div>
                <div class="bg-[#FFE4E1]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-rose-200 shadow-xs">
                    <p class="text-[10px] font-bold text-rose-500 uppercase">💸 Total Keluar</p>
                    <p class="text-md font-cute text-rose-600">${formatRupiah(totalPengeluaran)}</p>
                </div>
                <div class="bg-[#FFF0F5]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-purple-200 shadow-xs">
                    <p class="text-[10px] font-bold text-purple-500 uppercase">👛 Sisa Dompet</p>
                    <p class="text-md font-cute text-[#D2691E]">${formatRupiah(totalPemasukan - totalPengeluaran)}</p>
                </div>
            `;
        }

        dbKeuangan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        if (dbKeuangan.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400 italic">Belum ada catatan keuangan harian.</td></tr>`;
        } else {
            dbKeuangan.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-rose-50/30 border-b border-dashed border-[#FFDAB9] text-xs";
                tr.innerHTML = `
                    <td class="p-2.5 whitespace-nowrap">${item.tanggal || '-'}</td>
                    <td class="p-2.5 font-bold text-slate-700">${item.namaToko || '-'}</td>
                    <td class="p-2.5">${item.keterangan || '-'}</td>
                    <td class="p-2.5 text-slate-400 max-w-[100px] truncate" title="${item.alasan || ''}">${item.alasan || '-'}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 text-[10px] bg-[#FFF5EE] text-[#CD853F] rounded-full font-bold">${item.kategori || 'Umum'}</span></td>
                    <td class="p-2.5 font-bold ${item.jenis === 'Pemasukan' ? 'text-sky-500' : 'text-rose-400'}">${item.jenis}</td>
                    <td class="p-2.5 text-right font-bold text-slate-700">${formatRupiah(item.jumlah)}</td>
                    <td class="p-2.5 text-center space-x-1.5 whitespace-nowrap font-bold">
                        <button onclick="siapkanEdit('${item.id}')" class="text-sky-500 hover:underline cursor-pointer">Edit</button>
                        <button onclick="mintaHapus('${item.id}')" class="text-rose-400 hover:underline cursor-pointer">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } else {
        if (selectJenis) {
            selectJenis.innerHTML = `
                <option value="Simpanan">📥 Masuk Tabungan (+)</option>
                <option value="Penarikan">📤 Ambil Tabungan (-)</option>
            `;
        }
        if (headerRow) {
            headerRow.innerHTML = `
                <th class="p-2.5">Tanggal</th><th class="p-2.5">Nama Wadah Celengan</th><th class="p-2.5">Target Impian</th>
                <th class="p-2.5">Alasan Keterangan</th><th class="p-2.5">Jenis Aliran</th>
                <th class="p-2.5 text-right">Jumlah</th><th class="p-2.5 text-center">Aksi</th>
            `;
        }

        let totalSimpanan = dbTabungan.filter(x => x.jenis === 'Simpanan').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        let totalPenarikan = dbTabungan.filter(x => x.jenis === 'Penarikan').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        
        if (summary) {
            summary.innerHTML = `
                <div class="bg-[#FFF3E0]/90 backdrop-blur-xs p-3.5 rounded-2xl border-2 border-amber-200 text-center col-span-full shadow-xs">
                    <p class="text-[11px] font-cute text-[#CD853F] uppercase tracking-wider">🌟 Isi Celengan Bubu Dudu Sekarang 🌟</p>
                    <p class="text-xl font-cute text-[#D2691E]">${formatRupiah(totalSimpanan - totalPenarikan)}</p>
                </div>
            `;
        }

        dbTabungan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        if (dbTabungan.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400 italic">Celengan masih kosong, yuk mulai menabung!</td></tr>`;
        } else {
            dbTabungan.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-amber-50/30 border-b border-dashed border-[#FFDAB9] text-xs";
                tr.innerHTML = `
                    <td class="p-2.5 whitespace-nowrap">${item.tanggal || '-'}</td>
                    <td class="p-2.5 font-bold text-slate-700">${item.namaToko || '-'}</td>
                    <td class="p-2.5">${item.keterangan || '-'}</td>
                    <td class="p-2.5 text-slate-400 max-w-[100px] truncate" title="${item.alasan || ''}">${item.alasan || '-'}</td>
                    <td class="p-2.5 font-bold ${item.jenis === 'Simpanan' ? 'text-amber-500' : 'text-slate-400'}">${item.jenis === 'Simpanan' ? '📥 Simpan' : '📤 Ambil'}</td>
                    <td class="p-2.5 text-right font-bold text-slate-700">${formatRupiah(item.jumlah)}</td>
                    <td class="p-2.5 text-center space-x-1.5 whitespace-nowrap font-bold">
                        <button onclick="siapkanEdit('${item.id}')" class="text-sky-500 hover:underline cursor-pointer">Edit</button>
                        <button onclick="mintaHapus('${item.id}')" class="text-rose-400 hover:underline cursor-pointer">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('dataId')?.value;
        const tanggal = document.getElementById('tanggal')?.value;
        const namaToko = document.getElementById('namaToko')?.value;
        const keterangan = document.getElementById('keterangan')?.value;
        const alasan = document.getElementById('alasan')?.value;
        const kategori = document.getElementById('kategori')?.value || 'Umum';
        const jenis = document.getElementById('jenis')?.value;
        const mataUang = document.getElementById('mataUang')?.value || 'IDR';
        
        let jumlahInput = parseFloat(document.getElementById('jumlah')?.value) || 0;
        let jumlah = jumlahInput;

        if (mataUang === 'USD') jumlah = Math.round(jumlahInput * KURS_USD_TO_IDR);
        if (mataUang === 'CENT') jumlah = Math.round(jumlahInput * KURS_CENT_TO_IDR);

        if (jumlah <= 0) {
            showModal({ title: "Gagal", message: "Isi jumlah uangnya yang bener dong!", type: "warning", showCancel: false });
            return;
        }

        if (id) {
            if (currentMode === 'keuangan') {
                dbKeuangan = dbKeuangan.map(x => x.id === id ? { id, tanggal, namaToko, keterangan, alasan, kategori, jenis, jumlah } : x);
                localStorage.setItem('jurnalKeuangan', JSON.stringify(dbKeuangan));
            } else {
                dbTabungan = dbTabungan.map(x => x.id === id ? { id, tanggal, namaToko, keterangan, alasan, jenis, jumlah } : x);
                localStorage.setItem('jurnalTabungan', JSON.stringify(dbTabungan));
            }
            showModal({ title: "Sukses!", message: "Catatan kamu berhasil diubah, mwah!", type: "success", showCancel: false });
        } else {
            if (currentMode === 'keuangan') {
                dbKeuangan.push({ id: Date.now().toString(), tanggal, namaToko, keterangan, alasan, kategori, jenis, jumlah });
                localStorage.setItem('jurnalKeuangan', JSON.stringify(dbKeuangan));
            } else {
                dbTabungan.push({ id: Date.now().toString(), tanggal, namaToko, keterangan, alasan, jenis, jumlah });
                localStorage.setItem('jurnalTabungan', JSON.stringify(dbTabungan));
            }
        }

        buatNada(523.25, audioCtx.currentTime, 0.08);
        buatNada(659.25, audioCtx.currentTime + 0.08, 0.08);
        buatNada(783.99, audioCtx.currentTime + 0.16, 0.15);

        resetForm();
        renderView();
    });
}

function siapkanEdit(id) {
    let database = currentMode === 'keuangan' ? dbKeuangan : dbTabungan;
    const target = database.find(x => x.id === id);
    if (!target) return;

    showModal({
        title: "Ubah Data?",
        message: `Mau edit data "${target.keterangan || target.namaToko}" ini kah?`,
        type: "info",
        confirmText: "Ya, Atur Form",
        onConfirm: () => {
            document.getElementById('dataId').value = target.id;
            document.getElementById('tanggal').value = target.tanggal;
            document.getElementById('namaToko').value = target.namaToko || '';
            document.getElementById('keterangan').value = target.keterangan || '';
            document.getElementById('alasan').value = target.alasan || '';
            document.getElementById('jenis').value = target.jenis;
            document.getElementById('jumlah').value = target.jumlah;
            
            if (currentMode === 'keuangan') {
                document.getElementById('kategori').value = target.kategori || 'Umum';
            }
            document.getElementById('mataUang').value = 'IDR';
            document.getElementById('formTitle').innerText = "🔄 Mode Edit Data";
            document.getElementById('submitBtn').innerText = "Simpan Perubahan ✨";
            document.getElementById('cancelBtn').classList.remove('hidden');
        }
    });
}

function resetForm() {
    if (form) form.reset();
    document.getElementById('dataId').value = '';
    document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('formTitle').innerText = "📝 Tambah Catatan";
    document.getElementById('submitBtn').innerText = currentMode === 'keuangan' ? "Simpan Transaksi ✨" : "Simpan Tabungan ✨";
    document.getElementById('cancelBtn').classList.add('hidden');
    document.getElementById('mataUang').value = 'IDR';
}

function mintaHapus(id) {
    pendingDeleteId = id;
    let database = currentMode === 'keuangan' ? dbKeuangan : dbTabungan;
    const target = database.find(x => x.id === id);
    if (!target) return;

    showModal({
        title: "Hapus Data?",
        message: `Data "${target.keterangan || target.namaToko}" senilai ${formatRupiah(target.jumlah)} mau dibuang? 🥺`,
        type: "danger",
        confirmText: "Ya, Buang!",
        onConfirm: eksekusiHapus
    });
}

function eksekusiHapus() {
    if (!pendingDeleteId) return;
    if (currentMode === 'keuangan') {
        dbKeuangan = dbKeuangan.filter(x => x.id !== pendingDeleteId);
        localStorage.setItem('jurnalKeuangan', JSON.stringify(dbKeuangan));
    } else {
        dbTabungan = dbTabungan.filter(x => x.id !== pendingDeleteId);
        localStorage.setItem('jurnalTabungan', JSON.stringify(dbTabungan));
    }
    if (document.getElementById('dataId')?.value === pendingDeleteId) resetForm();
    pendingDeleteId = null;
    renderView();
}

// Hubungkan event listener suara ketik ke input yang ada secara otomatis
function pasangEfekSuaraKetik() {
    document.querySelectorAll('.input-efek-suara').forEach(element => {
        element.removeEventListener('input', mainkanSuaraKetik); // Hindari penumpukan ganda
        element.addEventListener('input', mainkanSuaraKetik);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    ambilKursTerbaru();
    inisialisasiGifLatar();
    pasangEfekSuaraKetik();
    
    // Auto-load font yang tersimpan di memori lokal, default ke font-fredoka jika belum ada
    const fontTersimpan = localStorage.getItem('fontAplikasiPilihan') || 'font-fredoka';
    gantiFontAplikasi(fontTersimpan);
    
    // Sinkronisasi value select dropdown agar sesuai dengan font aktif
    const selectMenuFont = document.getElementById('menuFont');
    if (selectMenuFont) {
        selectMenuFont.value = fontTersimpan;
    }
});
