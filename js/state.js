// File: js/state.js
// Fungsi: Brankas data utama (State Management)

const getSafeJSON = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return (item && item !== "undefined") ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return fallback;
    }
};

// State Utama (Gudang Data)
export const playerState = {
    name: localStorage.getItem('userName') || "",
    exp: parseInt(localStorage.getItem('totalExp')) || 0,
    koin: parseInt(localStorage.getItem('totalKoin')) || 0,
    level: 1,
    unlockedItems: getSafeJSON('unlockedItems', ["tasbih_kayu"]),
    inventory: getSafeJSON('inventory', {}),
    equippedItems: getSafeJSON('equippedItems', { tasbih_skin: 'tasbih_kayu', name_fx: null, aura: null }),
    
    // --- TAMBAHAN: Data Radar & VIP Misi ---
    vipBuff: localStorage.getItem('vip_buff_active') === 'true',
    statsRadar: getSafeJSON('statsRadar', { pusat: 10, aura: 10, peka: 10, sigma: 10, derma: 10, stoic: 10 })
};

// Fungsi Utama untuk merubah data (Action)
export function addExp(amount) {
    if (playerState.inventory['item_buff'] > 0) amount *= 2; 
    playerState.exp += amount;
    localStorage.setItem('totalExp', playerState.exp);
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
}

export function addKoin(amount) {
    playerState.koin += amount;
    localStorage.setItem('totalKoin', playerState.koin);
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
}

// Fungsi baru untuk Misi (Nambah Poin Radar Aura)
export function addRadarStat(type, amount) {
    if(playerState.statsRadar[type] !== undefined) {
        // Math.min memastikan nilai radar mentok di 100 (tidak over-limit)
        playerState.statsRadar[type] = Math.min(100, playerState.statsRadar[type] + amount);
        localStorage.setItem('statsRadar', JSON.stringify(playerState.statsRadar));
        document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
    }
}

// ==========================================
// --- FITUR KASIR TOKO ---
// ==========================================

export function spendKoin(amount) {
    if (playerState.koin >= amount) {
        playerState.koin -= amount;
        localStorage.setItem('totalKoin', playerState.koin);
        document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
        return true; // Transaksi sukses
    }
    return false; // Koin tidak cukup
}

export function updateInventory(itemId, quantity = 1) {
    // Tambah ke daftar unlock jika belum ada
    if (!playerState.unlockedItems.includes(itemId)) {
        playerState.unlockedItems.push(itemId);
        localStorage.setItem('unlockedItems', JSON.stringify(playerState.unlockedItems));
    }
    // Tambah jumlah item di inventory
    playerState.inventory[itemId] = (playerState.inventory[itemId] || 0) + quantity;
    localStorage.setItem('inventory', JSON.stringify(playerState.inventory));
    
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
}

export function updateEquipped(category, itemId) {
    playerState.equippedItems[category] = itemId;
    localStorage.setItem('equippedItems', JSON.stringify(playerState.equippedItems));
    document.dispatchEvent(new CustomEvent('stateUpdated', { detail: playerState }));
}
