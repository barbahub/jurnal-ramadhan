// File: js/main.js
// Fungsi: Entry point (Penghubung semua modul)

import { playerState, addExp, addKoin, addRadarStat } from './state.js';
import { updatePlayerUI } from './player.js';
import './quests.js'; // 👈 TAMBAHKAN BARIS INI!

console.log("🚀 AmalPad Modular V2 Berhasil Booting!");

// 1. Inisialisasi Tampilan Profil
updatePlayerUI();

// =======================================================
// 🌉 JEMBATAN TRANSISI (LEGACY BRIDGE)
// =======================================================
// Memberi akses sistem baru ke file lama (quests.js, shop.js dll) 
// agar game tidak crash saat kita refactor bertahap.
window.addExp = addExp;
window.addKoin = addKoin;
window.addRadarStat = addRadarStat;
window.updatePlayerUI = updatePlayerUI;

// Sinkronkan variabel window lama yang masih dicari oleh file quests.js dan lainnya
window.totalExp = playerState.exp;
window.totalKoin = playerState.koin;
window.unlockedItems = playerState.unlockedItems;
window.inventory = playerState.inventory;
window.equippedItems = playerState.equippedItems;
window.statsRadar = playerState.statsRadar;
window.vipBuff = playerState.vipBuff;

// =======================================================
// 2. Fungsi Pendengar Perubahan Data (Auto-Reactive)
document.addEventListener('stateUpdated', (e) => {
    const data = e.detail;
    
    // Jaga variabel jembatan tetap up-to-date
    window.totalExp = data.exp;
    window.totalKoin = data.koin;
    window.statsRadar = data.statsRadar;

    // Update UI Koin di Header & Toko
    const koinDisplay = document.getElementById('koin-display');
    const shopKoinDisplay = document.getElementById('shop-koin-display');
    if(koinDisplay) koinDisplay.innerText = data.koin.toLocaleString('id-ID');
    if(shopKoinDisplay) shopKoinDisplay.innerText = data.koin.toLocaleString('id-ID');

    // Setiap ada Koin/EXP masuk atau statsRadar berubah, otomatis perbarui tampilan profil
    updatePlayerUI();
});
