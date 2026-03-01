// --- INSISIALISASI DATA TOKO ---
// Mengambil data Koin dari localStorage (Pastikan tersinkronisasi dengan Firebase milikmu di app aslinya)
window.totalKoin = parseInt(localStorage.getItem('totalKoin') || 10000); 

// Update tampilan koin di UI Toko
const shopKoinDisplay = document.getElementById('shop-koin-display');
if(shopKoinDisplay) {
    shopKoinDisplay.innerText = window.totalKoin.toLocaleString('id-ID');
}

// --- DATA KATALOG TOKO ---
window.shopCatalog = [
    { id: "tasbih_kayu", name: "Kayu Kokka", price: 10000, icon: "🪵", type: "tasbih_skin", desc: "Desain klasik kayu kokka yang menenangkan hati." },
    { id: "tasbih_kristal", name: "Kristal Makkah", price: 18000, icon: "💎", type: "tasbih_skin", desc: "Tombol tasbih mewah berkilau layaknya permata." },
    { id: "tasbih_cyber", name: "Mecha Digital", price: 20000, icon: "🤖", type: "tasbih_skin", desc: "Desain tasbih futuristik dengan garis LED hijau." },
    { id: "name_api", name: "Teks Membara", price: 12000, icon: "🔥", type: "name_fx", desc: "Namamu menyala dengan efek api merah di leaderboard." },
    { id: "name_neon", name: "Cyberpunk Neon", price: 15000, icon: "🟣", type: "name_fx", desc: "Teks nama glow-in-the-dark bergaya neon futuristik." },
    { id: "name_gold", name: "Emas Sultan", price: 20000, icon: "✨", type: "name_fx", desc: "Nama berlapis emas berkilau ala sultan AmalPad." },
    { id: "aura_koin", name: "Aura Sultan", price: 8000, icon: "🪙", type: "aura", desc: "Memancarkan aura koin emas di belakang avatarmu." },
    { id: "aura_sakura", name: "Aura Sakura", price: 10000, icon: "🌸", type: "aura", desc: "Efek daun sakura merah muda di sekeliling profil." },
    { id: "aura_vip", name: "VIP Live Feed", price: 45000, icon: "👑", type: "aura", desc: "Namamu akan menyala Emas Sultan di Live Feed Global!" },
    { id: "item_gacha", name: "Tiket Premium", price: 3000, icon: "🎫", type: "item", desc: "Mendapatkan ekstra 1x Gacha Misi Harian hari ini." },
    { id: "item_buff", name: "Ramuan 2x EXP", price: 5000, icon: "🧪", type: "item", desc: "Menggandakan perolehan EXP selama 24 jam!" },
    { id: "item_guild", name: "Tiket Pendiri", price: 15000, icon: "📜", type: "item", desc: "Syarat wajib mendirikan Circle/Guild baru." },
    { id: "item_freeze", name: "Pelindung Streak", price: 8000, icon: "❄️", type: "item", desc: "Menyelamatkan api streak harianmu jika terlewat 1 hari." },
    { id: "item_circle_plus", name: "Ekspansi Circle", price: 25000, icon: "🏕️", type: "item", desc: "Menambah batas maksimal anggota Circle-mu (+5 Slot)." }
];

// --- GAYA RENDER PREVIEW (CSS Styles) ---
window.previewStyles = {
    name_api: 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)]',
    name_neon: 'text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,1)]',
    name_gold: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]',
    aura_koin: 'bg-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.8)] scale-110 animate-pulse',
    aura_sakura: 'bg-pink-500/30 shadow-[0_0_50px_rgba(244,114,182,0.8)] scale-110'
};

// Mengambil data inventori dan barang terbuka
window.unlockedItems = JSON.parse(localStorage.getItem('unlockedItems')) || ["tasbih_kayu"];
window.inventory = JSON.parse(localStorage.getItem('inventory')) || {};
window.currentShopFilter = 'all';

// --- RENDER TEASER ITEM (SPESIAL MINGGU INI) ---
window.renderFeaturedItems = function() {
    const container = document.getElementById('featured-items-container');
    if(!container) return;
    container.innerHTML = '';
    
    // Kita pilih 2 item paling menarik sebagai bait (Tasbih Kristal & Aura Sultan)
    const featuredIds = ['tasbih_kristal', 'aura_koin'];
    
    featuredIds.forEach(id => {
        const item = window.shopCatalog.find(i => i.id === id);
        if(!item) return;
        
        const isOwned = window.unlockedItems.includes(item.id);
        
        const card = document.createElement('div');
        card.className = "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center gap-3 cursor-pointer hover:shadow-md transition group";
        card.onclick = () => window.previewItem(item.id);
        
        card.innerHTML = `
            <div class="w-12 h-12 rounded-[1rem] ${isOwned ? 'bg-gradient-to-tr from-emerald-200 to-teal-300 dark:from-emerald-700 dark:to-teal-800' : 'bg-white dark:bg-gray-900'} flex items-center justify-center text-2xl shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                ${item.icon}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-[11px] font-black text-gray-800 dark:text-gray-100 truncate">${item.name}</h4>
                ${isOwned 
                    ? `<span class="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">✓ Dimiliki</span>` 
                    : `<span class="text-[10px] font-black text-amber-500 dark:text-amber-400 flex items-center gap-1">🪙 ${item.price.toLocaleString('id-ID')}</span>`
                }
            </div>
            <div class="w-7 h-7 rounded-full bg-white dark:bg-gray-600 border border-gray-100 dark:border-gray-500 flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-sm shrink-0 text-[10px] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-500 transition">
                👁️
            </div>
        `;
        container.appendChild(card);
    });
};

// --- RENDER UI TOKO KESELURUHAN ---
window.renderShop = function() {
    const container = document.getElementById('shop-container');
    if(!container) return; 
    container.innerHTML = ''; 
    
    const filteredItems = window.shopCatalog.filter(item => window.currentShopFilter === 'all' || item.type === window.currentShopFilter);

    filteredItems.forEach(item => {
        const isConsumable = item.type === 'item';
        const isOwned = !isConsumable && window.unlockedItems.includes(item.id);
        const qty = window.inventory[item.id] || 0;
        
        const typeColors = {
            tasbih_skin: 'text-teal-600 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800',
            name_fx: 'text-cyan-600 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/40 border-cyan-200 dark:border-cyan-800',
            aura: 'text-pink-600 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/40 border-pink-200 dark:border-pink-800',
            item: 'text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800'
        };
        
        const badgeColor = typeColors[item.type] || 'text-gray-500 bg-gray-100 border-gray-200';
        
        const card = document.createElement('div');
        card.className = `relative p-3.5 rounded-[1.5rem] border-2 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl group overflow-hidden ${isOwned ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:border-emerald-300 dark:hover:border-emerald-600'}`;
        
        const previewBtn = `<button onclick="window.previewItem('${item.id}')" class="absolute top-2.5 right-2.5 w-7 h-7 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition z-20" title="Coba (Preview)">👁️</button>`;

        let actionHTML = '';
        if (isConsumable) {
            actionHTML = `<button onclick="window.buyItem('${item.id}', ${item.price})" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1">Beli 🪙 ${item.price.toLocaleString('id-ID')} ${qty > 0 ? `(Punya: ${qty})` : ''}</button>`;
        } else if (isOwned) {
            actionHTML = `<div class="w-full text-emerald-600 dark:text-emerald-400 py-1.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50"><span>✓</span> Terpasang</div>`;
        } else {
            actionHTML = `<button onclick="window.buyItem('${item.id}', ${item.price})" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-1.5 rounded-xl text-[11px] font-black active:scale-95 transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5">🪙 ${item.price.toLocaleString('id-ID')}</button>`;
        }

        card.innerHTML = `
            <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${badgeColor} backdrop-blur-sm z-10">${item.type}</div>
            ${previewBtn}
            
            <div class="mt-7 mb-3 w-16 h-16 rounded-[1.2rem] ${isOwned ? 'bg-gradient-to-tr from-emerald-200 to-teal-300 dark:from-emerald-700 dark:to-teal-800 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} flex items-center justify-center text-4xl shadow-inner border border-white/50 dark:border-white/10 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10 cursor-pointer" onclick="window.previewItem('${item.id}')">
                ${item.icon}
            </div>
            
            <h3 class="font-black text-[12px] text-gray-800 dark:text-gray-100 mb-0.5 leading-tight w-full truncate px-1 relative z-10">${item.name}</h3>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium mb-3 w-full truncate relative z-10">${item.desc}</p>
            
            <div class="w-full mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50 relative z-10">
                ${actionHTML}
            </div>
        `;
        container.appendChild(card);
    });
    
    if(filteredItems.length === 0) {
        container.innerHTML = `<div class="col-span-2 text-center text-xs text-gray-400 py-5">Barang di kategori ini sedang kosong bos!</div>`;
    }
};

// --- SISTEM PREVIEW ---
window.previewItem = function(itemId) {
    const item = window.shopCatalog.find(i => i.id === itemId);
    if(!item) return;

    const modal = document.getElementById('shop-preview-modal');
    const canvas = document.getElementById('preview-canvas');
    const title = document.getElementById('preview-title');
    const desc = document.getElementById('preview-desc');
    const actionBtn = document.getElementById('preview-action');
    
    title.innerText = item.name;
    desc.innerText = item.desc;
    canvas.className = 'w-full h-48 rounded-2xl flex flex-col items-center justify-center relative mb-5 shadow-inner border border-white/10 overflow-hidden bg-gray-800 transition-all duration-500';

    // RENDER CANVAS BERDASARKAN TIPE
    if (item.id === 'aura_vip') {
        canvas.className = 'w-full h-48 rounded-2xl flex flex-col items-center justify-center relative mb-5 shadow-inner border border-white/10 overflow-hidden bg-gray-900 transition-all duration-500';
        canvas.innerHTML = `
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/40 via-gray-900 to-black z-0"></div>
            <div class="w-full px-5 relative z-10 animate-float">
                <div class="bg-gray-800/80 backdrop-blur-md p-3 rounded-xl border border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.2)] flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-xl shadow-inner border-2 border-yellow-200 shrink-0">👑</div>
                    <div class="text-left flex-1 min-w-0">
                        <p class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 font-black text-sm drop-shadow-md flex items-center gap-1.5 truncate">Player Name <span class="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">VIP</span></p>
                        <p class="text-[10px] text-gray-400 mt-0.5 truncate">Selesai Sholat Subuh 🕋</p>
                    </div>
                </div>
            </div>
            <p class="absolute bottom-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest z-10">Contoh Tampilan Live Feed</p>
        `;
    }
    else if (item.type === 'tasbih_skin') {
        let skinClass = "";
        let textColor = "";
        if(item.id === 'tasbih_kayu') {
            skinClass = "bg-amber-800 border-amber-900 shadow-[inset_0_-8px_15px_rgba(0,0,0,0.5)] border-[8px]";
            textColor = "text-amber-100";
        }
        if(item.id === 'tasbih_kristal') {
            skinClass = "bg-gradient-to-br from-cyan-200 to-blue-400 border-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.6),inset_0_-8px_20px_rgba(255,255,255,0.8)] border-[6px]";
            textColor = "text-white drop-shadow-md";
        }
        if(item.id === 'tasbih_cyber') {
            skinClass = "bg-gray-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5),inset_0_0_10px_rgba(16,185,129,0.5)] border-[4px]";
            textColor = "text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]";
        }

        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gray-900 opacity-90 z-0"></div>
            <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div class="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black transition-transform active:scale-90 cursor-pointer ${skinClass} ${textColor}">
                    33
                </div>
                <p class="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Contoh Bentuk<br>Tombol Smart Tasbih</p>
            </div>
        `;
    } 
    else if (item.type === 'name_fx') {
        const fxStyle = window.previewStyles[item.id] || '';
        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gray-900 opacity-90 z-0"></div>
            <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div class="bg-gray-800/80 px-6 py-4 rounded-2xl border border-gray-700 shadow-lg text-center">
                    <h2 class="text-3xl font-black uppercase tracking-widest ${fxStyle}">Si Fulan</h2>
                    <p class="text-[10px] text-gray-500 mt-2 font-medium">Level 25 • Bestie Hijrah</p>
                </div>
                <p class="mt-5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contoh Gaya Nama Profil</p>
            </div>
        `;
    }
    else if (item.type === 'aura') {
        const fxStyle = window.previewStyles[item.id] || '';
        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gray-900 opacity-80 z-0"></div>
            <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div class="relative flex items-center justify-center w-20 h-20">
                    <div class="absolute inset-0 rounded-full ${fxStyle} z-0"></div>
                    <div class="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-3xl text-white font-black z-10">
                        A
                    </div>
                </div>
                <p class="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contoh Avatar Profil</p>
            </div>
        `;
    }
    else if (item.type === 'item') {
        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-tr from-amber-900/50 to-transparent z-0"></div>
            <div class="text-7xl drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-float z-10 relative">
                ${item.icon}
            </div>
        `;
    }

    // TOMBOL AKSI (Beli / Dimiliki)
    const isConsumable = item.type === 'item';
    const isOwned = !isConsumable && window.unlockedItems.includes(item.id);
    const qty = window.inventory[item.id] || 0;

    if(isOwned) {
        actionBtn.innerHTML = `<button onclick="window.closeShopPreview()" class="w-full bg-gray-800 border border-gray-600 text-emerald-400 font-bold py-3 rounded-xl transition shadow-inner">Sudah Dimiliki / Terpasang</button>`;
    } else if (isConsumable) {
        actionBtn.innerHTML = `<button onclick="window.buyItem('${item.id}', ${item.price}); window.closeShopPreview()" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.4)] text-lg">Beli 🪙 ${item.price.toLocaleString('id-ID')} ${qty > 0 ? `<span class="text-xs font-medium ml-1">(Punya: ${qty})</span>` : ''}</button>`;
    } else {
        actionBtn.innerHTML = `<button onclick="window.buyItem('${item.id}', ${item.price}); window.closeShopPreview()" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.4)] text-lg">Beli 🪙 ${item.price.toLocaleString('id-ID')}</button>`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeShopPreview = function() {
    const modal = document.getElementById('shop-preview-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

// --- SISTEM PEMBELIAN ---
window.buyItem = function(id, price) {
    if (window.totalKoin < price) { 
        alert("Koin kamu kurang bos! Selesaikan misi ibadah dulu ya."); 
        return; 
    }
    
    if (!confirm(`Yakin ingin menukarkan ${price.toLocaleString('id-ID')} koin untuk membeli item ini?`)) return;
    
    window.totalKoin -= price; 
    
    const itemDef = window.shopCatalog.find(i => i.id === id);
    if (itemDef && itemDef.type === 'item') {
        window.inventory[id] = (window.inventory[id] || 0) + 1;
        localStorage.setItem('inventory', JSON.stringify(window.inventory));
    } else {
        window.unlockedItems.push(id);
        localStorage.setItem('unlockedItems', JSON.stringify(window.unlockedItems));
    }
    
    localStorage.setItem('totalKoin', window.totalKoin); 
    
    // Update UI Koin di header utama dan toko
    const mainKoinDisplay = document.getElementById('koin-display');
    const shopKoinDisplay = document.getElementById('shop-koin-display');
    if(mainKoinDisplay) mainKoinDisplay.innerText = window.totalKoin; 
    if(shopKoinDisplay) shopKoinDisplay.innerText = window.totalKoin.toLocaleString('id-ID'); 
    
    window.renderShop();
    window.renderFeaturedItems();
    
    if(typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 80, zIndex: 9999, origin: { y: 0.6 } });
    }
    
    // CATATAN UNTUK FIREBASE:
    // Jika integrasi firebase sudah berjalan, panggil fungsi updateDoc ke database Firestore di sini
    // Contoh: updateDoc(doc(db, "users", userId), { koin: totalKoin, inventory: inventory, unlockedItems: unlockedItems });
};

// --- EVENT LISTENERS UI TOKO ---

// 1. Accordion Toggle
const btnToggleShop = document.getElementById('btn-toggle-shop');
const contentShop = document.getElementById('shop-content-wrapper');
const teaserShop = document.getElementById('shop-teaser');
const iconToggleShop = document.getElementById('icon-toggle-shop');
const textToggleShop = document.getElementById('text-toggle-shop');

if (btnToggleShop && contentShop && teaserShop) {
    btnToggleShop.addEventListener('click', () => {
        const isClosed = contentShop.classList.contains('hidden');
        
        if (isClosed) {
            contentShop.classList.remove('hidden');
            teaserShop.classList.add('hidden');
            if(iconToggleShop) iconToggleShop.style.transform = 'rotate(180deg)';
            if(textToggleShop) textToggleShop.innerText = 'Tutup Katalog';
        } else {
            contentShop.classList.add('hidden');
            teaserShop.classList.remove('hidden');
            if(iconToggleShop) iconToggleShop.style.transform = 'rotate(0deg)';
            if(textToggleShop) textToggleShop.innerText = 'Buka Katalog Lengkap';
        }
    });
}

// 2. Tab Filter Kategori
document.querySelectorAll('.shop-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.shop-tab').forEach(b => {
            b.classList.remove('bg-emerald-500', 'text-white', 'shadow-sm');
            b.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
        });
        e.target.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
        e.target.classList.add('bg-emerald-500', 'text-white', 'shadow-sm');
        
        window.currentShopFilter = e.target.getAttribute('data-type');
        window.renderShop();
    });
});

// Inisialisasi awal saat script dimuat
window.renderShop();
window.renderFeaturedItems();
