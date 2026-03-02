// ============================================================
// --- INISIALISASI STATE & DATA (ANTI-CRASH) ---
// ============================================================

// Ubah nama fungsi menjadi getShopSafeJSON agar tidak bentrok dengan player.js
const getShopSafeJSON = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return fallback;
    }
};

window.totalKoin = parseInt(localStorage.getItem('totalKoin')) || 10000; 
window.unlockedItems = getShopSafeJSON('unlockedItems', ["tasbih_kayu"]);
window.inventory = getShopSafeJSON('inventory', {});
window.equippedItems = getShopSafeJSON('equippedItems', { tasbih_skin: 'tasbih_kayu', name_fx: null, aura: null });
window.currentShopFilter = 'all';

// Sinkronisasi UI Koin Awal
const updateKoinUI = () => {
    const mainKoinDisplay = document.getElementById('koin-display');
    const shopKoinDisplay = document.getElementById('shop-koin-display');
    if(mainKoinDisplay) mainKoinDisplay.innerText = window.totalKoin; 
    if(shopKoinDisplay) shopKoinDisplay.innerText = window.totalKoin.toLocaleString('id-ID');
};
updateKoinUI();

// ============================================================
// --- DATA KATALOG TOKO & STYLES ---
// ============================================================

window.shopCatalog = [
    { id: "tasbih_kayu", name: "Kayu Kokka", price: 10000, icon: "🪵", type: "tasbih_skin", desc: "Desain klasik kayu kokka yang menenangkan hati." },
    { id: "tasbih_kristal", name: "Kristal Makkah", price: 18000, icon: "💎", type: "tasbih_skin", desc: "Tombol tasbih mewah berkilau layaknya permata." },
    { id: "tasbih_cyber", name: "Mecha Digital", price: 20000, icon: "🤖", type: "tasbih_skin", desc: "Desain tasbih futuristik dengan garis LED hijau." },
    { id: "tasbih_sss", name: "Tasbih Naga Emas", price: 0, icon: "🐉", type: "tasbih_skin", desc: "Tasbih mistis dari sisik naga emas! Eksklusif Gacha Premium.", gachaOnly: true },
    { id: "name_api", name: "Teks Membara", price: 12000, icon: "🔥", type: "name_fx", desc: "Namamu menyala dengan efek api merah di leaderboard." },
    { id: "name_neon", name: "Cyberpunk Neon", price: 15000, icon: "🟣", type: "name_fx", desc: "Teks nama glow-in-the-dark bergaya neon futuristik." },
    { id: "name_gold", name: "Emas Sultan", price: 20000, icon: "✨", type: "name_fx", desc: "Nama berlapis emas berkilau ala sultan AmalPad." },
    { id: "aura_koin", name: "Aura Koin", price: 8000, icon: "🪙", type: "aura", desc: "Memancarkan aura koin emas di belakang avatarmu." },
    { id: "aura_sakura", name: "Aura Sakura", price: 10000, icon: "🌸", type: "aura", desc: "Efek daun sakura merah muda di sekeliling profil." },
    
    // ITEM GACHA EXCLUSIVE
    { id: "aura_vip", name: "Aura VIP (SR)", price: 0, icon: "✨", type: "aura", desc: "Aura mistis VIP eksklusif! Hanya dari Gacha Premium.", gachaOnly: true },
    { id: "aura_sss", name: "Aura Sultan (SSS)", price: 0, icon: "👑", type: "aura", desc: "Aura Solo & Circle Permanen! Hanya dari Gacha Premium.", gachaOnly: true },
    
    // ITEM CONSUMABLES
    { id: "tiket_emas", name: "Tiket Emas Gacha", price: 5000, icon: "🎫", type: "item", desc: "Tiket premium untuk memutar Gacha Kebaikan. Peluang dapat Tier SSS!" },
    { id: "item_buff", name: "Ramuan 2x EXP", price: 5000, icon: "🧪", type: "item", desc: "Menggandakan perolehan EXP selama 24 jam!" },
    { id: "item_guild", name: "Tiket Pendiri", price: 15000, icon: "📜", type: "item", desc: "Syarat wajib mendirikan Circle/Guild baru." },
    { id: "item_freeze", name: "Pelindung Streak", price: 8000, icon: "❄️", type: "item", desc: "Menyelamatkan api streak harianmu jika terlewat 1 hari." },
    { id: "item_circle_plus", name: "Ekspansi Circle", price: 25000, icon: "🏕️", type: "item", desc: "Menambah batas maksimal anggota Circle-mu (+5 Slot)." }
];

window.previewStyles = {
    name_api: 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)]',
    name_neon: 'text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,1)]',
    name_gold: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]',
    aura_koin: 'bg-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.8)] scale-110 animate-pulse',
    aura_sakura: 'bg-pink-500/30 shadow-[0_0_50px_rgba(244,114,182,0.8)] scale-110'
};

// ============================================================
// --- FUNGSI AKSI (BELI & EQUIP) ---
// ============================================================

window.toggleEquipItem = function(id, type) {
    if (window.equippedItems[type] === id) {
        window.equippedItems[type] = null; // Lepas jika sedang dipakai
    } else {
        window.equippedItems[type] = id; // Pakai / Replace yang lama
    }
    
    localStorage.setItem('equippedItems', JSON.stringify(window.equippedItems));
    
    // Refresh UI secara instan
    window.renderShop();
    window.renderFeaturedItems();
    if(typeof window.updatePlayerUI === 'function') window.updatePlayerUI();
    
    // 👇 SINKRONISASI KE FIREBASE 👇
    if (typeof window.saveShopDataToFirebase === 'function') window.saveShopDataToFirebase();
};

window.buyItem = function(id, price) {
    const itemDef = window.shopCatalog.find(i => i.id === id);
    if (!itemDef) return;

    let qtyToBuy = 1;
    
    // Fitur Pembelian Multi (Hanya untuk tipe 'item' / consumable)
    if (itemDef.type === 'item') {
        let input = prompt(`Berapa banyak [${itemDef.name}] yang mau dibeli?\nHarga: 🪙 ${price.toLocaleString('id-ID')} / item.`, "1");
        if (input === null) return; // Batal
        qtyToBuy = parseInt(input);
        if (isNaN(qtyToBuy) || qtyToBuy <= 0) {
            alert("Jumlah tidak valid! Masukkan angka yang benar.");
            return;
        }
    }
    
    let totalPrice = price * qtyToBuy;

    if (window.totalKoin < totalPrice) { 
        alert(`Koin kamu kurang bos!\nButuh 🪙 ${totalPrice.toLocaleString('id-ID')} untuk membeli ${qtyToBuy}x ${itemDef.name}.`); 
        return; 
    }
    
    if (!confirm(`Yakin ingin menukarkan 🪙 ${totalPrice.toLocaleString('id-ID')} koin untuk membeli ${qtyToBuy}x ${itemDef.name}?`)) return;
    
    // Proses Transaksi
    window.totalKoin -= totalPrice; 
    localStorage.setItem('totalKoin', window.totalKoin);
    
    if (itemDef.type === 'item') {
        window.inventory[id] = (window.inventory[id] || 0) + qtyToBuy;
        localStorage.setItem('inventory', JSON.stringify(window.inventory));
    } else {
        window.unlockedItems.push(id);
        localStorage.setItem('unlockedItems', JSON.stringify(window.unlockedItems));
        
        // Auto-equip saat pertama kali beli Cosmetic
        window.equippedItems[itemDef.type] = id;
        localStorage.setItem('equippedItems', JSON.stringify(window.equippedItems));
        if(typeof window.updatePlayerUI === 'function') window.updatePlayerUI();
    }
    
    // Refresh UI
    updateKoinUI();
    window.renderShop();
    window.renderFeaturedItems();
    
    if(typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 80, zIndex: 9999, origin: { y: 0.6 } });
    }
    
    // 👇 SINKRONISASI KE FIREBASE 👇
    if (typeof window.saveShopDataToFirebase === 'function') window.saveShopDataToFirebase();
};

// ============================================================
// --- FUNGSI RENDER UI ---
// ============================================================

window.renderFeaturedItems = function() {
    const container = document.getElementById('featured-items-container');
    if(!container) return;
    
    // --- PROTEKSI ANTI CRASH ---
    if (!Array.isArray(window.unlockedItems)) {
        window.unlockedItems = ["tasbih_kayu"]; // Paksa jadi array jika corrupt
    }
    if (!window.equippedItems || typeof window.equippedItems !== 'object') {
        window.equippedItems = { tasbih_skin: 'tasbih_kayu', name_fx: null, aura: null };
    }
    if (!window.inventory || typeof window.inventory !== 'object') {
        window.inventory = {}; // Mencegah crash pembacaan inventory
    }
    // ---------------------------
    
    container.innerHTML = '';
    
    const featuredIds = ['aura_sss', 'tiket_emas'];
    
    featuredIds.forEach(id => {
        const item = window.shopCatalog.find(i => i.id === id);
        if(!item) return;
        
        const isOwned = window.unlockedItems.includes(item.id);
        const qty = window.inventory[item.id] || 0;
        
        const card = document.createElement('div');
        card.className = "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center gap-3 cursor-pointer hover:shadow-md transition group";
        card.onclick = () => window.previewItem(item.id);
        
        let priceLabel = `<span class="text-[10px] font-black text-amber-500 dark:text-amber-400 flex items-center gap-1">🪙 ${item.price.toLocaleString('id-ID')}</span>`;
        if (isOwned && item.type !== 'item') {
            priceLabel = `<span class="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">✓ Dimiliki</span>`;
        } else if (item.gachaOnly) {
            priceLabel = `<span class="text-[9px] font-bold text-yellow-500 flex items-center gap-1">✨ Via Gacha</span>`;
        } else if (item.type === 'item' && qty > 0) {
            priceLabel = `<span class="text-[9px] font-bold text-emerald-500 flex items-center gap-1">Punya: ${qty}</span>`;
        }

        card.innerHTML = `
            <div class="w-12 h-12 rounded-[1rem] ${isOwned ? 'bg-gradient-to-tr from-emerald-200 to-teal-300 dark:from-emerald-700 dark:to-teal-800' : 'bg-white dark:bg-gray-900'} flex items-center justify-center text-2xl shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                ${item.icon}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-[11px] font-black text-gray-800 dark:text-gray-100 truncate">${item.name}</h4>
                ${priceLabel}
            </div>
            <div class="w-7 h-7 rounded-full bg-white dark:bg-gray-600 border border-gray-100 dark:border-gray-500 flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-sm shrink-0 text-[10px] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-500 transition">
                👁️
            </div>
        `;
        container.appendChild(card);
    });
};

window.renderShop = function() {
    const container = document.getElementById('shop-container');
    if(!container) return; 
    
    // --- PROTEKSI ANTI CRASH ---
    if (!Array.isArray(window.unlockedItems)) {
        window.unlockedItems = ["tasbih_kayu"]; // Paksa jadi array jika corrupt
    }
    if (!window.equippedItems || typeof window.equippedItems !== 'object') {
        window.equippedItems = { tasbih_skin: 'tasbih_kayu', name_fx: null, aura: null };
    }
    if (!window.inventory || typeof window.inventory !== 'object') {
        window.inventory = {}; // Mencegah crash pembacaan inventory
    }
    // ---------------------------
    
    container.innerHTML = ''; 
    
    const filteredItems = window.shopCatalog.filter(item => window.currentShopFilter === 'all' || item.type === window.currentShopFilter);

    filteredItems.forEach(item => {
        const isConsumable = item.type === 'item';
        const isOwned = !isConsumable && window.unlockedItems.includes(item.id);
        const isEquipped = isOwned && window.equippedItems[item.type] === item.id;
        const qty = window.inventory[item.id] || 0;
        
        const typeColors = {
            tasbih_skin: 'text-teal-600 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800',
            name_fx: 'text-cyan-600 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/40 border-cyan-200 dark:border-cyan-800',
            aura: 'text-pink-600 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/40 border-pink-200 dark:border-pink-800',
            item: 'text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800'
        };
        
        let badgeColor = typeColors[item.type] || 'text-gray-500 bg-gray-100 border-gray-200';
        if(item.gachaOnly) badgeColor = 'text-yellow-600 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700';
        
        const cardClass = isOwned 
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : 'border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:border-emerald-300 dark:hover:border-emerald-600';
            
        const card = document.createElement('div');
        card.className = `relative p-3.5 rounded-[1.5rem] border-2 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl group overflow-hidden ${cardClass}`;
        
        const previewBtn = `<button onclick="window.previewItem('${item.id}')" class="absolute top-2.5 right-2.5 w-7 h-7 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition z-20" title="Coba (Preview)">👁️</button>`;

        // LOGIKA TOMBOL AKSI DI DALAM CARD
        let actionHTML = '';
        if (isOwned) {
            if (isEquipped) {
                actionHTML = `<button onclick="window.toggleEquipItem('${item.id}', '${item.type}')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition shadow-md flex items-center justify-center gap-1.5">✓ Dipakai</button>`;
            } else {
                actionHTML = `<button onclick="window.toggleEquipItem('${item.id}', '${item.type}')" class="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition flex items-center justify-center gap-1.5">Pakai</button>`;
            }
        } else if (item.gachaOnly) {
            actionHTML = `<button onclick="alert('Item ini sangat langka! Dapatkan lewat Gacha Kebaikan dengan menukarkan Tiket Emas.')" class="w-full bg-gray-800 border border-yellow-500/50 text-yellow-500 hover:bg-gray-700 py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition shadow-md flex items-center justify-center gap-1">🔒 Gacha Only</button>`;
        } else if (isConsumable) {
            actionHTML = `<button onclick="window.buyItem('${item.id}', ${item.price})" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1">Beli 🪙 ${item.price.toLocaleString('id-ID')} ${qty > 0 ? `(${qty})` : ''}</button>`;
        } else {
            actionHTML = `<button onclick="window.buyItem('${item.id}', ${item.price})" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-1.5 rounded-xl text-[11px] font-black active:scale-95 transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5">🪙 ${item.price.toLocaleString('id-ID')}</button>`;
        }

        let badgeText = item.gachaOnly ? 'TIER SSS/SR' : item.type.replace('_', ' ');

        card.innerHTML = `
            <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${badgeColor} backdrop-blur-sm z-10">${badgeText}</div>
            ${previewBtn}
            
            <div class="mt-7 mb-3 w-16 h-16 rounded-[1.2rem] ${isOwned ? 'bg-gradient-to-tr from-emerald-200 to-teal-300 dark:from-emerald-700 dark:to-teal-800 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} flex items-center justify-center text-4xl shadow-inner border border-white/50 dark:border-white/10 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10 cursor-pointer" onclick="window.previewItem('${item.id}')">
                ${item.icon}
            </div>
            
            <h3 class="font-black text-[12px] text-gray-800 dark:text-gray-100 mb-0.5 leading-tight w-full truncate px-1 relative z-10">${item.name}</h3>
            
            <p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium mb-3 w-full line-clamp-2 h-[28px] relative z-10">${item.desc}</p>
            
            <div class="w-full mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50 relative z-10 flex flex-col justify-end">
                ${actionHTML}
            </div>
        `;
        container.appendChild(card);
    });
    
    if(filteredItems.length === 0) {
        container.innerHTML = `<div class="col-span-2 text-center text-xs text-gray-400 py-5">Barang di kategori ini sedang kosong bos!</div>`;
    }
};

window.previewItem = function(itemId) {
    const item = window.shopCatalog.find(i => i.id === itemId);
    if(!item) return;

    const modal = document.getElementById('shop-preview-modal');
    const canvas = document.getElementById('preview-canvas');
    const title = document.getElementById('preview-title');
    const desc = document.getElementById('preview-desc');
    const actionBtn = document.getElementById('preview-action');
    
    if(!modal || !canvas) return; // Keamanan anti-crash
    
    title.innerText = item.name;
    desc.innerText = item.desc;
    canvas.className = 'w-full h-48 rounded-2xl flex flex-col items-center justify-center relative mb-5 shadow-inner border border-white/10 overflow-hidden bg-gray-800 transition-all duration-500';

    // RENDER CANVAS BERDASARKAN TIPE
    if (item.type === 'tasbih_skin') {
        let skinClass = "bg-gray-700 border-gray-800 border-[6px]";
        let textColor = "text-white";
        
        if(item.id === 'tasbih_kayu') {
            skinClass = "bg-amber-800 border-amber-900 shadow-[inset_0_-8px_15px_rgba(0,0,0,0.5)] border-[8px]";
            textColor = "text-amber-100";
        } else if(item.id === 'tasbih_kristal') {
            skinClass = "bg-gradient-to-br from-cyan-200 to-blue-400 border-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.6),inset_0_-8px_20px_rgba(255,255,255,0.8)] border-[6px]";
            textColor = "text-white drop-shadow-md";
        } else if(item.id === 'tasbih_cyber') {
            skinClass = "bg-gray-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5),inset_0_0_10px_rgba(16,185,129,0.5)] border-[4px]";
            textColor = "text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]";
        } else if(item.id === 'tasbih_sss') {
            skinClass = "bg-gradient-to-br from-yellow-600 via-amber-500 to-red-600 border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.8),inset_0_-8px_15px_rgba(0,0,0,0.6)] border-[6px] animate-pulse";
            textColor = "text-yellow-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]";
        }

        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gray-900 opacity-90 z-0"></div>
            <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div class="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black transition-transform active:scale-90 cursor-pointer ${skinClass} ${textColor}">33</div>
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
        if (item.id === 'aura_sss' || item.id === 'aura_vip') {
             let auraClass = item.id === 'aura_sss' ? 'avatar-aura-sss' : 'avatar-aura-vip';
             let textClass = item.id === 'aura_sss' ? 'name-aura-sss' : 'name-aura-vip';
             canvas.innerHTML = `
                 <div class="absolute inset-0 bg-gray-900 opacity-90 z-0"></div>
                 <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                     <div class="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black text-white ${auraClass} border-transparent!">A</div>
                     <h2 class="mt-6 font-black text-xl ${textClass}">Pemain Sultan</h2>
                     <p class="mt-4 text-[10px] text-yellow-500 font-bold uppercase tracking-widest bg-yellow-900/40 px-3 py-1 rounded border border-yellow-500/50">Efek Live Feed & Profil</p>
                 </div>
             `;
        } else {
            const fxStyle = window.previewStyles[item.id] || '';
            canvas.innerHTML = `
                <div class="absolute inset-0 bg-gray-900 opacity-80 z-0"></div>
                <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
                    <div class="relative flex items-center justify-center w-20 h-20">
                        <div class="absolute inset-0 rounded-full ${fxStyle} z-0"></div>
                        <div class="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-3xl text-white font-black z-10">A</div>
                    </div>
                    <p class="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contoh Avatar Profil</p>
                </div>
            `;
        }
    }
    else if (item.type === 'item') {
        canvas.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-tr from-amber-900/50 to-transparent z-0"></div>
            <div class="text-7xl drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-float z-10 relative">
                ${item.icon}
            </div>
        `;
    }

    // TOMBOL AKSI MODAL PREVIEW 
    const isConsumable = item.type === 'item';
    const isOwned = !isConsumable && window.unlockedItems.includes(item.id);
    const isEquipped = isOwned && window.equippedItems[item.type] === item.id;
    const qty = window.inventory[item.id] || 0;

    if(isOwned) {
        if (isEquipped) {
            actionBtn.innerHTML = `<button onclick="window.toggleEquipItem('${item.id}', '${item.type}'); window.closeShopPreview()" class="w-full bg-gray-800 border border-emerald-500 text-emerald-400 font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-gray-700">Lepas Item Ini</button>`;
        } else {
            actionBtn.innerHTML = `<button onclick="window.toggleEquipItem('${item.id}', '${item.type}'); window.closeShopPreview()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">Pakai Item Ini</button>`;
        }
    } else if (item.gachaOnly) {
        actionBtn.innerHTML = `<button onclick="window.closeShopPreview()" class="w-full bg-gray-800 border border-yellow-500/50 text-yellow-500 font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(234,179,8,0.2)] text-sm hover:bg-gray-700">🔒 Dapatkan dari Gacha</button>`;
    } else {
        const btnText = isConsumable 
            ? `Beli 🪙 ${item.price.toLocaleString('id-ID')} ${qty > 0 ? `<span class="text-xs font-medium ml-1">(Punya: ${qty})</span>` : ''}` 
            : `Beli 🪙 ${item.price.toLocaleString('id-ID')}`;
            
        actionBtn.innerHTML = `<button onclick="window.buyItem('${item.id}', ${item.price}); window.closeShopPreview()" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.4)] text-lg">${btnText}</button>`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeShopPreview = function() {
    const modal = document.getElementById('shop-preview-modal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

// ============================================================
// --- SISTEM GACHA PREMIUM (RNG DROP RATE) ---
// ============================================================

window.gachaPool = [
    { id: 'aura_sss', name: 'Aura Sultan SSS', type: 'cosmetic', tier: 'sss', probability: 0.01 }, 
    { id: 'tasbih_sss', name: 'Tasbih Naga Emas (SSS)', type: 'cosmetic', tier: 'sss', probability: 0.02 }, 
    { id: 'aura_vip', name: 'Aura VIP SR', type: 'cosmetic', tier: 'sr', probability: 0.08 },        
    { id: 'rare_coins', name: 'Jackpot 1.000 Koin', type: 'currency', tier: 'rare', probability: 0.30, value: 1000 }, 
    { id: 'item_buff', name: 'Ramuan 2x EXP', type: 'consumable', tier: 'common', probability: 0.59 } 
];

window.rollGachaPremium = function() {
    let tiketCount = window.inventory['tiket_emas'] || 0;
    
    if (tiketCount < 1) {
        alert("Bos, kamu tidak punya Tiket Emas 🎫!\nSilakan beli dulu di Toko Flexing harganya 1.000 Koin.");
        return;
    }
    
    if (!confirm("Gunakan 1 Tiket Emas untuk memutar Gacha Premium?")) return;
    
    window.inventory['tiket_emas'] -= 1;
    localStorage.setItem('inventory', JSON.stringify(window.inventory));

    const rand = Math.random();
    let cumulative = 0;
    let wonItem = window.gachaPool[window.gachaPool.length - 1]; 

    for (const item of window.gachaPool) {
        cumulative += item.probability;
        if (rand <= cumulative) {
            wonItem = item;
            break;
        }
    }
    
    let msg = `🎉 GACHA BERHASIL! 🎉\n\nKamu mendapatkan [TIER ${wonItem.tier.toUpperCase()}] - ${wonItem.name}!\n\n`;

    if (wonItem.type === 'currency') {
        window.totalKoin += wonItem.value;
        localStorage.setItem('totalKoin', window.totalKoin);
        msg += `Selamat! Saldo Koin kamu langsung bertambah +${wonItem.value}.`;
        
    } else if (wonItem.type === 'cosmetic') {
        if (window.unlockedItems.includes(wonItem.id)) {
            window.totalKoin += 500;
            localStorage.setItem('totalKoin', window.totalKoin);
            msg += `Karena kamu sudah punya item ini, hadiah dikonversi otomatis menjadi 500 Koin kompensasi!`;
        } else {
            window.unlockedItems.push(wonItem.id);
            localStorage.setItem('unlockedItems', JSON.stringify(window.unlockedItems));
            msg += `Wow! Item eksklusif ini telah ditambahkan ke Rak Koleksimu dan bisa langsung dipakai.`;
        }
        
    } else if (wonItem.type === 'consumable') {
        window.inventory[wonItem.id] = (window.inventory[wonItem.id] || 0) + 1;
        localStorage.setItem('inventory', JSON.stringify(window.inventory));
        msg += `Item Consumable telah disimpan dengan aman di dalam tasmu!`;
    }
    
    // Refresh Seluruh UI
    updateKoinUI();
    window.renderShop();
    window.renderFeaturedItems();

    // Ledakan Confetti
    if(typeof confetti === 'function') {
        if (wonItem.tier === 'sss') {
            confetti({ particleCount: 200, spread: 100, colors: ['#FFD700', '#FFA500', '#FFFFFF'], zIndex: 9999, origin: { y: 0.6 } });
        } else if (wonItem.tier === 'sr') {
            confetti({ particleCount: 150, spread: 80, colors: ['#b026ff', '#00d4ff'], zIndex: 9999, origin: { y: 0.6 } });
        } else {
            confetti({ particleCount: 80, spread: 50, zIndex: 9999, origin: { y: 0.6 } });
        }
    }

    setTimeout(() => alert(msg), 300);
    
    // 👇 SINKRONISASI KE FIREBASE 👇
    if (typeof window.saveShopDataToFirebase === 'function') window.saveShopDataToFirebase();
};

// ============================================================
// --- EVENT LISTENERS UI TOKO ---
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
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
                // teaserShop.classList.add('hidden'); // <-- Di-comment agar tidak hilang
                if(iconToggleShop) iconToggleShop.style.transform = 'rotate(180deg)';
                if(textToggleShop) textToggleShop.innerText = 'Tutup Katalog';
            } else {
                contentShop.classList.add('hidden');
                // teaserShop.classList.remove('hidden'); // <-- Di-comment agar tidak bentrok
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
});
