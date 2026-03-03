// File: js/main.js
// Fungsi: Entry point (Penghubung semua modul)

import { playerState, addExp, addKoin } from './state.js';

console.log("🚀 AmalPad Modular V2 Berhasil Booting!");
console.log("Koin saat ini:", playerState.koin);

// Fungsi pendengar: Tiap kali Koin/EXP bertambah, update UI otomatis!
document.addEventListener('stateUpdated', (e) => {
    const data = e.detail;
    
    // Update tampilan koin
    const koinDisplay = document.getElementById('koin-display');
    const shopKoinDisplay = document.getElementById('shop-koin-display');
    
    if(koinDisplay) koinDisplay.innerText = data.koin.toLocaleString('id-ID');
    if(shopKoinDisplay) shopKoinDisplay.innerText = data.koin.toLocaleString('id-ID');
    
    console.log("UI Terupdate! Koin baru:", data.koin);
});

// TEST SISTEM: Kita coba tambah 50 koin secara otomatis setelah 2 detik
setTimeout(() => {
    console.log("Menjalankan test penambahan koin dari main.js...");
    addKoin(50);
}, 2000);
