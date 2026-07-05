let currentMode = 'keuangan';
let dbKeuangan = [];
let dbTabungan = [];
let pendingDeleteId = null;
let grafikInstance = null; // Menyimpan instance grafik agar tidak tumpang tindih

const form = document.getElementById('mainForm');
let KURS_USD_TO_IDR = 17994.40;
let KURS_CENT_TO_IDR = 179.944;

// --- SISTEM LATAR BELAKANG FLUID DRAWER (SEMUA GIF TERBARU DARI REPO KAMU) ---
const listFileGif = [
    "9976-bubu-lol.gif",
    "10814-bubu-and-dudu-drink-glass.gif",
    "18713-bubu.gif",
    "23724-unyel.gif",
    "4178-bubuwinterhopyellow.gif",
    "4393-bearbounce.gif",
    "4694-sleep-bubupanda.gif",
    "4699-bubududu-ignore.gif",
    "55578-pandasquishy.gif",
    "6192-bubupanda-secret.gif",
    "6809-bubpanda-toilet.gif",
    "70798-bearsquish.gif",
    "7425-cleaning-bubupanda.gif",
    "7600-christmaspandawink.gif",
    "86953-bubududu-kiss.gif"
];

const containerBg = document.getElementById('bg-container');
const activeGifs = [];
let animationFrameId = null;

function inisialisasiGifLatar() {
    if (!containerBg) return;
    containerBg.innerHTML = ''; 
    activeGifs.length = 0; 

    listFileGif.forEach((namaFile) => {
        const img = document.createElement('img');
        img.src = namaFile;
        img.className = 'floating-gif';
        
        const posX = Math.random() * (window.innerWidth - 100);
        const posY = Math.random() * (window.innerHeight - 100);
        
        let dx = (Math.random() - 0.5) * 1.5;
        let dy = (Math.random() - 0.5) * 1.5;
        
        if (Math.abs(dx) < 0.4) dx = dx < 0 ? -0.5 : 0.5;
        if (Math.abs(dy) < 0.4) dy = dy < 0 ? -0.5 : 0.5;

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

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updatePosisiGif);
}

function updatePosisiGif() {
    const lebarLayar = window.innerWidth;
    const tinggiLayar = window.innerHeight;

    activeGifs.forEach((obj) => {
        obj.x += obj.dx;
        obj.y += obj.dy;

        if (obj.x <= 0) {
            obj.x = 0;
            obj.dx *= -1;
        } else if (obj.x + obj.width >= lebarLayar) {
            obj.x = lebarLayar - obj.width;
            obj.dx *= -1;
        }

        if (obj.y <= 0) {
            obj.y = 0;
            obj.dy *= -1;
        } else if (obj.y + obj.height >= tinggiLayar) {
            obj.y = tinggiLayar - obj.height;
            obj.dy *= -1;
        }

        obj.element.style.transform = `translate3d(${obj.x}px, ${obj.y}px, 0)`;
    });

    animationFrameId = requestAnimationFrame(updatePosisiGif);
}

window.addEventListener('resize', () => {
    activeGifs.forEach(obj => {
        if (obj.x + obj.width > window.innerWidth) obj.x = window.innerWidth - obj.width;
        if (obj.y + obj.height > window.innerHeight) obj.y = window.innerHeight - obj.height;
    });
});

// --- SISTEM KUSTOM AUDIO SYNTHESIZER BUBU DUDU ---
let audioCtx = null;

function dapatkanAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function mainkanSuaraKetik() {
    const menuSuara = document.getElementById('menuSuara');
    if (!menuSuara) return; 
    const modeSuara = menuSuara.value;
    if (modeSuara === 'OFF') return;
    
    const ctx = dapatkanAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const sekarang = ctx.currentTime;
    
    if (modeSuara === '1') {
        buatNada(659.25, sekarang, 0.05);
        buatNada(880.00, sekarang + 0.05, 0.08);
    } else if (modeSuara === '2') {
        let osc = ctx.createOscillator();
        let gain = ctx.createGain();
        let filter = ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, sekarang);
        osc.frequency.exponentialRampToValueAtTime(220, sekarang + 0.15);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, sekarang);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
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
        const ctx = dapatkanAudioContext();
        let osc = ctx.createOscillator();
        let gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frekuensi, mulai);
        gain.gain.setValueAtTime(0.06, mulai);
        gain.gain.exponentialRampToValueAtTime(0.005, mulai + durasi);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(mulai); osc.stop(mulai + durasi);
    } catch(e){}
}

// --- SISTEM GANTI FONT DINAMIS ---
function gantiFontAplikasi(namaFontBaru) {
    const body = document.getElementById('mainBody');
    if (body) {
        body.classList.remove('font-fredoka', 'font-quicksand', 'font-pacifico', 'font-comfortaa', 'font-patrick');
        body.classList.add(namaFontBaru);
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
        }
    } catch (error) {}
    renderView();
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
    if (!modal || !box) {
        if (type !== 'danger' && !showCancel) {
            alert(`${title}: ${message}`);
            if (onConfirm) onConfirm();
        } else {
            if (confirm(`${title}\n\n${message}`)) {
                if (onConfirm) onConfirm();
            }
        }
        return;
    }

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
    const fContainerBulan = document.getElementById('kategoriContainerBulan');
    const canvasGrafik = document.getElementById('grafikKeuangan');

    if (mode === 'keuangan') {
        if (btnKeuangan) btnKeuangan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer bg-[#FFB6C1] text-white shadow-sm";
        if (btnTabungan) btnTabungan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer text-[#CD853F] hover:text-[#D2691E]";
        if (labelToko) labelToko.innerText = "🏪 Toko / Sumber Uang";
        if (labelDetail) labelDetail.innerText = "🍭 Keterangan Barang";
        if (katContainer) katContainer.classList.remove('hidden');
        if (fContainerBulan) fContainerBulan.classList.remove('hidden');
        if (canvasGrafik && canvasGrafik.parentElement) canvasGrafik.parentElement.classList.remove('hidden');
        if (tTitle) tTitle.innerText = "📈 Semua Histori Keuangan (Total)";
    } else {
        if (btnTabungan) btnTabungan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer bg-[#FFB6C1] text-white shadow-sm";
        if (btnKeuangan) btnKeuangan.className = "w-1/2 py-2 text-xs font-cute rounded-xl transition-all cursor-pointer text-[#CD853F] hover:text-[#D2691E]";
        if (labelToko) labelToko.innerText = "🐣 Nama Celengan / Wadah";
        if (labelDetail) labelDetail.innerText = "🎯 Target / Goal Nabung";
        if (katContainer) katContainer.classList.add('hidden');
        if (fContainerBulan) fContainerBulan.classList.add('hidden');
        if (canvasGrafik && canvasGrafik.parentElement) canvasGrafik.parentElement.classList.add('hidden');
        if (tTitle) tTitle.innerText = "🐣 Catatan Tabungan Bubu Dudu";
    }
    renderView();
}

function updateGrafikKeuangan(dataTerfilter) {
    const ctxCanvas = document.getElementById('grafikKeuangan');
    if (!ctxCanvas || currentMode !== 'keuangan') return;

    const dataPerTanggal = {};
    dataTerfilter.forEach(item => {
        const tgl = item.tanggal || 'Tanpa Tanggal';
        if (!dataPerTanggal[tgl]) {
            dataPerTanggal[tgl] = { pemasukan: 0, pengeluaran: 0 };
        }
        if (item.jenis === 'Pemasukan') {
            dataPerTanggal[tgl].pemasukan += item.jumlah;
        } else if (item.jenis === 'Pengeluaran') {
            dataPerTanggal[tgl].pengeluaran += item.jumlah;
        }
    });

    const labelSumbuX = Object.keys(dataPerTanggal).sort((a, b) => new Date(a) - new Date(b));
    const datasetMasuk = labelSumbuX.map(tgl => dataPerTanggal[tgl].pemasukan);
    const datasetKeluar = labelSumbuX.map(tgl => dataPerTanggal[tgl].pengeluaran);

    if (grafikInstance) {
        grafikInstance.destroy();
    }

    grafikInstance = new Chart(ctxCanvas, {
        type: 'bar',
        data: {
            labels: labelSumbuX,
            datasets: [
                {
                    label: '🎁 Uang Masuk',
                    data: datasetMasuk,
                    backgroundColor: 'rgba(14, 165, 233, 0.6)', 
                    borderColor: 'rgb(14, 165, 233)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: '💸 Uang Keluar',
                    data: datasetKeluar,
                    backgroundColor: 'rgba(251, 113, 133, 0.6)', 
                    borderColor: 'rgb(251, 113, 133)',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { family: 'Quicksand', weight: 'bold', size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Quicksand', size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: 'Quicksand', size: 10 },
                        callback: function(value) {
                            if (value >= 1000000) return 'Rp ' + (value / 1000000) + 'M';
                            if (value >= 1000) return 'Rp ' + (value / 1000) + 'rb';
                            return 'Rp ' + value;
                        }
                    }
                }
            }
        }
    });
}

function renderView() {
    const summary = document.getElementById('summarySection');
    const headerRow = document.getElementById('tableHeaderRow');
    const tbody = document.getElementById('tabelBody');
    const inputTanggal = document.getElementById('tanggal');
    const selectJenis = document.getElementById('jenis');
    const filterBulan = document.getElementById('filterBulan')?.value || 'SEMUA';
    
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

        let dataTerfilter = dbKeuangan;
        if (filterBulan !== 'SEMUA') {
            dataTerfilter = dbKeuangan.filter(item => {
                if (!item.tanggal) return false;
                const bulanItem = item.tanggal.split('-')[1]; 
                return bulanItem === filterBulan;
            });
        }

        let totalPemasukan = dataTerfilter.filter(x => x.jenis === 'Pemasukan').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        let totalPengeluaran = dataTerfilter.filter(x => x.jenis === 'Pengeluaran').reduce((acc, c) => acc + (parseFloat(c.jumlah) || 0), 0);
        
        if (summary) {
            summary.innerHTML = `
                <div class="bg-[#E0FFFF]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-sky-200 shadow-xs">
                    <p class="text-[10px] font-bold text-sky-600 uppercase">🎁 Total Masuk (${filterBulan === 'SEMUA' ? 'Semua' : 'Bulan Ini'})</p>
                    <p class="text-md font-cute text-sky-700">${formatRupiah(totalPemasukan)}</p>
                </div>
                <div class="bg-[#FFE4E1]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-rose-200 shadow-xs">
                    <p class="text-[10px] font-bold text-rose-500 uppercase">💸 Total Keluar (${filterBulan === 'SEMUA' ? 'Semua' : 'Bulan Ini'})</p>
                    <p class="text-md font-cute text-rose-600">${formatRupiah(totalPengeluaran)}</p>
                </div>
                <div class="bg-[#FFF0F5]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-purple-200 shadow-xs">
                    <p class="text-[10px] font-bold text-purple-500 uppercase">👛 Sisa Dompet</p>
                    <p class="text-md font-cute text-[#D2691E]">${formatRupiah(totalPemasukan - totalPengeluaran)}</p>
                </div>
            `;
        }

        updateGrafikKeuangan(dataTerfilter);

        dataTerfilter.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        if (dataTerfilter.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400 italic">Belum ada catatan keuangan harian pada periode ini.</td></tr>`;
        } else {
            dataTerfilter.forEach(item => {
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

        const ctx = dapatkanAudioContext();
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
            const newId = Date.now().toString();
            if (currentMode === 'keuangan') {
                dbKeuangan.push({ id: newId, tanggal, namaToko, keterangan, alasan, kategori, jenis, jumlah });
                localStorage.setItem('jurnalKeuangan', JSON.stringify(dbKeuangan));
            } else {
                dbTabungan.push({ id: newId, tanggal, namaToko, keterangan, alasan, jenis, jumlah });
                localStorage.setItem('jurnalTabungan', JSON.stringify(dbTabungan));
            }
        }

        buatNada(523.25, ctx.currentTime, 0.08);
        buatNada(659.25, ctx.currentTime + 0.08, 0.08);
        buatNada(783.99, ctx.currentTime + 0.16, 0.15);

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
            if(document.getElementById('dataId')) document.getElementById('dataId').value = target.id;
            if(document.getElementById('tanggal')) document.getElementById('tanggal').value = target.tanggal;
            if(document.getElementById('namaToko')) document.getElementById('namaToko').value = target.namaToko || '';
            if(document.getElementById('keterangan')) document.getElementById('keterangan').value = target.keterangan || '';
            if(document.getElementById('alasan')) document.getElementById('alasan').value = target.alasan || '';
            if(document.getElementById('jenis')) document.getElementById('jenis').value = target.jenis;
            if(document.getElementById('jumlah')) document.getElementById('jumlah').value = target.jumlah; 
            
            if (currentMode === 'keuangan' && document.getElementById('kategori')) {
                document.getElementById('kategori').value = target.kategori || 'Umum';
            }
            if(document.getElementById('mataUang')) document.getElementById('mataUang').value = 'IDR'; 
            if(document.getElementById('formTitle')) document.getElementById('formTitle').innerText = "🔄 Mode Edit Data";
            if(document.getElementById('submitBtn')) document.getElementById('submitBtn').innerText = "Simpan Perubahan ✨";
            
            const cancelBtn = document.getElementById('cancelBtn');
            if (cancelBtn) cancelBtn.classList.remove('hidden');
        }
    });
}

function resetForm() {
    if (form) form.reset();
    const dataIdInput = document.getElementById('dataId');
    if (dataIdInput) dataIdInput.value = '';
    
    const tanggalInput = document.getElementById('tanggal');
    if (tanggalInput) tanggalInput.value = new Date().toISOString().split('T')[0];
    
    if(document.getElementById('formTitle')) document.getElementById('formTitle').innerText = "📝 Tambah Catatan";
    if(document.getElementById('submitBtn')) document.getElementById('submitBtn').innerText = currentMode === 'keuangan' ? "Simpan Transaksi ✨" : "Simpan Tabungan ✨";
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
    
    const mataUangInput = document.getElementById('mataUang');
    if (mataUangInput) mataUangInput.value = 'IDR';
}

const cancelBtnHtml = document.getElementById('cancelBtn');
if (cancelBtnHtml) {
    cancelBtnHtml.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });
}

function mintaHapus(id) {
    pendingDeleteId = id;
    let database = currentMode === 'keuangan' ? dbKeuangan : dbTabungan;
    const target = database.find(x => x.id === id);
    if (!target) return;

    showModal({
        boxId: "modalBox",
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

function pasangEfekSuaraKetik() {
    if (!form) return;
    form.removeEventListener('input', tanganiSuaraInputForm);
    form.addEventListener('input', tanganiSuaraInputForm);
}

function tanganiSuaraInputForm(e) {
    if (e.target && e.target.classList.contains('input-efek-suara')) {
        mainkanSuaraKetik();
    }
}

function downloadPDF() {
    const elemenTabel = document.getElementById('tabelBody')?.parentElement;
    const judulLaporan = document.getElementById('tableTitle')?.innerText || 'Laporan Bubu Dudu';

    if (!elemenTabel) {
        showModal({ title: "Gagal", message: "Tabel data tidak ditemukan untuk dicetak!", type: "warning", showCancel: false });
        return;
    }

    const wrapperKloning = document.createElement('div');
    wrapperKloning.style.padding = '20px';
    wrapperKloning.style.fontFamily = 'sans-serif';
    
    wrapperKloning.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #FFDAB9; padding-bottom: 10px;">
            <h1 style="color: #D2691E; margin: 0; font-size: 20px;">🧸 ${judulLaporan} 🧸</h1>
            <p style="color: #CD853F; margin: 5px 0 0 0; font-size: 12px;">Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
    `;

    const tabelKloning = elemenTabel.cloneNode(true);
    const semuaBaris = tabelKloning.querySelectorAll('tr');
    
    semuaBaris.forEach(baris => {
        if (baris.lastElementChild) {
            baris.removeChild(baris.lastElementChild);
        }
    });

    wrapperKloning.appendChild(tabelKloning);

    const opsiPdf = {
        margin:       10,
        filename:     `${judulLaporan.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opsiPdf).from(wrapperKloning).save();
    } else {
        showModal({ 
            title: "Mengalihkan Cetak", 
            message: "Library PDF eksternal belum siap di halaman ini. Ingin mencetak menggunakan modul cetak browser? (Silakan pilih opsi 'Simpan sebagai PDF')", 
            type: "info", 
            confirmText: "Buka Cetak",
            onConfirm: () => {
                window.print();
            },
            showCancel: true 
        });
    }
}

// --- FUNGSI POPUP PESAN ROMANTIS BARU ---
function pencetTombolRomantis() {
    // 1. Mengumpulkan semua opsi pesan romantis ke dalam Array
    const daftarPesan = [
        "Tahu enggak kenapa hari ini cerah? Karena senyum kamu baru saja lewat di pikiran aku. 😉",
        "Semangatnya udah sampai, langsung bikin detak jantung aku sedikit lebih cepat. Tanggung jawab, lho... 💓",
        "Kalau kangen itu ada hitungan matematisnya, mungkin aku udah kehabisan angka buat ngitung seberapa sering mikirin kamu. 📊✨",
        "Fokus aku hari ini cuma dua: selesaiin kerjaan, sama bayangin senyum manis kamu. Mmwah! 💋",
        "Hari ini kamu kelihatan lebih manis deh, padahal kita belum ketemu. Kok bisa ya? 🍯"
    ];

    // 2. Mengambil satu pesan secara acak biar seru tiap kali dipencet
    const pesanAcak = daftarPesan[Math.floor(Math.random() * daftarPesan.length)];

    // 3. Memasukkan konten ke komponen Modal kustom kamu
    const mIcon = document.getElementById('modalIcon');
    if (mIcon) mIcon.innerText = '💖';

    const mTitle = document.getElementById('modalTitle');
    if (mTitle) mTitle.innerText = 'Pesan Spesial Buat Kamu! ✨';

    const mMessage = document.getElementById('modalMessage');
    if (mMessage) mMessage.innerText = pesanAcak;
    
    // 4. Membuat tombol konfirmasi kustom "Mwah 💖" dengan aman
    const wadahTombol = document.getElementById('modalActionButtons');
    if (wadahTombol) {
        wadahTombol.innerHTML = `
            <button onclick="closeModal()" class="w-full bg-[#FFB6C1] hover:bg-[#FF9999] text-white font-cute py-2 px-4 rounded-xl transition text-xs shadow-xs cursor-pointer btn-nyala">
                Mwah 💖
            </button>
        `;
    }

    // 5. Menampilkan modal (menghapus class opacity-0 dan pointer-events-none)
    const modal = document.getElementById('customModal');
    const box = document.getElementById('modalBox');
    if (modal) modal.classList.remove('pointer-events-none', 'opacity-0');
    if (box) box.classList.remove('scale-95');
}
