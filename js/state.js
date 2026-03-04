// File: js/state.js
// Fungsi: Brankas data utama (State Management) terpusat

/**
 * ==========================================
 * 1. UTILITIES & DATA EXTRACTORS
 * ==========================================
 */

// Ekstraktor Data dengan Strict Type Validation (O(1) Time Complexity)
const getSafeJSON = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        // Validasi perlindungan ganda terhadap anomali string null/undefined
        if (!item || item === "undefined" || item === "null") return fallback;
        
        const parsed = JSON.parse(item);
        
        // Proteksi: Jika fallback adalah Array, pastikan data yang diambil juga Array
        if (Array.isArray(fallback)) {
            return Array.isArray(parsed) ? parsed : fallback;
        } 
        // Proteksi: Jika fallback adalah Object murni, pastikan datanya Object murni
        else if (typeof fallback === 'object' && fallback !== null) {
            return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : fallback;
        }
        
        return parsed !== null ? parsed : fallback;
    } catch (e) {
        console.error(`[AmalPad Diagnostics] Error parsing data korup pada ${key}, mereset ke default aman.`, e);
        return fallback;
    }
};

// [BARU] Helper Ekstraktor Integer untuk mencegah NaN Propagation (O(1) Time Complexity)
const getSafeInt = (key, fallback = 0) => {
    const val = parseInt(localStorage.getItem(key), 10);
    return isNaN(val) ? fallback : val;
};

/**
 * ==========================================
 * 2. INITIAL STATE
 * ==========================================
 */
export const playerState = {
    name: localStorage.getItem('userName') || "",
    exp: getSafeInt('totalExp', 0),
    koin: getSafeInt('totalKoin', 0),
    level: 1,
    unlockedItems: getSafeJSON('unlockedItems', ["tasbih_kayu"]),
    inventory: getSafeJSON('inventory', {}),
    equippedItems: getSafeJSON('equippedItems', { tasbih_skin: 'tasbih_kayu', name_fx: null, aura: null }),
    vipBuff: localStorage.getItem('vip_buff_active') === 'true',
    statsRadar: getSafeJSON('statsRadar', { pusat: 10, aura: 10, peka: 10, sigma: 10, derma: 10, stoic: 10 })
};

/**
 * ==========================================
 * 3. CENTRALIZED DISPATCHER (Prinsip DRY & SRP)
 * ==========================================
 * Fungsi tunggal untuk menangani penulisan ke storage dan memicu event UI.
 * Ini mengurangi redundansi dan memudahkan debugging di masa depan.
 */
const syncState = (key, value) => {
    const storageValue = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, storageValue);
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
};

/**
 * ==========================================
 * 4. STATE MUTATORS (Actions)
 * ==========================================
 */

export function addExp(amount) {
    if (typeof amount !== 'number' || amount <= 0) return; // Guard clause pencegah eksploitasi

    // Ekstraksi inventory check, fallback ke 0 jika item_buff tidak ada
    const hasBuff = (playerState.inventory['item_buff'] || 0) > 0;
    playerState.exp += hasBuff ? (amount * 2) : amount;
    
    syncState('totalExp', playerState.exp);
}

export function addKoin(amount) {
    if (typeof amount !== 'number' || amount <= 0) return;
    
    playerState.koin += amount;
    syncState('totalKoin', playerState.koin);
}

export function addRadarStat(type, amount) {
    if (typeof amount !== 'number' || playerState.statsRadar[type] === undefined) return;
    
    const currentVal = playerState.statsRadar[type];
    if (currentVal >= 100) return; // Optimasi I/O: Cegah proses write jika nilai sudah maksimum

    playerState.statsRadar[type] = Math.min(100, currentVal + amount);
    syncState('statsRadar', playerState.statsRadar);
}

/**
 * ==========================================
 * 5. FITUR KASIR TOKO
 * ==========================================
 */

export function spendKoin(amount) {
    // Validasi input dan ketersediaan saldo dalam satu baris (Early Return)
    if (typeof amount !== 'number' || amount <= 0 || playerState.koin < amount) {
        return false; 
    }
    
    playerState.koin -= amount;
    syncState('totalKoin', playerState.koin);
    return true; 
}

export function updateInventory(itemId, quantity = 1) {
    // Time Complexity O(N) pada includes() tidak masalah karena array unlockedItems relatif kecil.
    // Jika kelak item mencapai ribuan, refactor unlockedItems menjadi Set (O(1)).
    if (!playerState.unlockedItems.includes(itemId)) {
        playerState.unlockedItems.push(itemId);
        localStorage.setItem('unlockedItems', JSON.stringify(playerState.unlockedItems));
    }
    
    const currentQty = playerState.inventory[itemId] || 0;
    playerState.inventory[itemId] = currentQty + quantity;
    localStorage.setItem('inventory', JSON.stringify(playerState.inventory));
    
    // Dispatch event hanya dipanggil 1x di akhir operasi untuk menghemat CPU cycle
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
}

export function updateEquipped(category, itemId) {
    // Optimasi I/O: Jangan tulis ke memori jika item yang dipasang sama dengan yang lama
    if (playerState.equippedItems[category] === itemId) return; 

    playerState.equippedItems[category] = itemId;
    syncState('equippedItems', playerState.equippedItems);
}
