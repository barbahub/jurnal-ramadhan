// File: js/player.js
// Fungsi: Mengatur logika Level, Gelar, dan Tampilan Profil Pemain

import { playerState } from './state.js';

// --- 1. REFERENSI ELEMEN UI (Aman dari Crash) ---
const inputName = document.getElementById('user-name');
const displayLevel = document.getElementById('display-level');
const displayExp = document.getElementById('display-exp');
const expBar = document.getElementById('exp-bar');
const displayTitleBot = document.getElementById('display-title-bot');
const avatarInitial = document.getElementById('avatar-initial');
const headerLevel = document.getElementById('header-level');
const headerTitle = document.getElementById('header-title');

// --- 2. LOGIKA LEVEL & GELAR ---
export function getExpRequirement(level) {
    return 50 * level * (level + 1);
}

export function getTitle(lvl) {
    if(lvl < 10) return "NPC Duniawi";
    if(lvl < 20) return "Skena Ibadah";
    if(lvl < 30) return "Pendekar Subuh";
    if(lvl < 40) return "Suhu Akhlaq";
    if(lvl < 50) return "Bestie Hijrah";
    return "Backingan Pusat";
}

export function calculateLevelInfo(totalExp) {
    let lvl = 1;
    while (totalExp >= getExpRequirement(lvl)) {
        lvl++;
        if (lvl >= 50) { lvl = 50; break; } // Max level 50
    }
    let expForCurrentLvl = lvl === 1 ? 0 : getExpRequirement(lvl - 1);
    let expForNextLvl = getExpRequirement(lvl);
    let currentLevelExp = totalExp - expForCurrentLvl;
    let requiredExp = expForNextLvl - expForCurrentLvl;

    return { level: lvl, expCurrent: currentLevelExp, expRequired: requiredExp };
}

// --- 3. FUNGSI KOSMETIK (AURA & NAMA) ---
function applyCosmetics(level) {
    if(!avatarInitial) return;
    
    // Reset Class Kosmetik (Aura) dan Text Style secara bersih
    avatarInitial.className = "w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full mx-auto flex items-center justify-center mb-4 text-4xl text-white font-extrabold relative z-10 transition-all duration-700";
    if(inputName) inputName.className = "w-full bg-transparent outline-none py-1 mb-1 font-black text-2xl text-center transition relative z-10 placeholder-gray-300";

    // Ambil data kosmetik terbaru (sinkronisasi dengan state/shop)
    let equipped = playerState.equippedItems || {};

    // A. Terapkan Aura di Avatar Profil
    if (equipped.aura === 'aura_sss') {
        avatarInitial.classList.add('avatar-aura-sss');
        if(inputName) inputName.classList.add('name-aura-sss');
    } else if (equipped.aura === 'aura_vip') {
        avatarInitial.classList.add('avatar-aura-vip');
        if(inputName) inputName.classList.add('name-aura-vip');
    } else if (equipped.aura === 'aura_koin') {
        avatarInitial.classList.add('shadow-[0_0_30px_rgba(250,204,21,0.8)]', 'ring-4', 'ring-yellow-400');
    } else if (equipped.aura === 'aura_sakura') {
        avatarInitial.classList.add('shadow-[0_0_30px_rgba(244,114,182,0.8)]', 'ring-4', 'ring-pink-400');
    } else {
        // Default Border Berdasarkan Level jika tidak memakai item Aura
        if (level >= 30) { 
            avatarInitial.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50'); 
        } else if (level >= 10) { 
            avatarInitial.classList.add('ring-4', 'ring-blue-400'); 
        } else { 
            avatarInitial.classList.add('ring-4', 'ring-gray-200', 'dark:ring-gray-600'); 
        }
    }

    // B. Terapkan Gaya Nama (Name FX)
    if (equipped.name_fx && window.previewStyles && inputName) {
        const styles = window.previewStyles[equipped.name_fx];
        if (styles) {
            const classArray = styles.split(' ').filter(c => c.trim() !== '');
            if(classArray.length > 0) inputName.classList.add(...classArray);
        }
    } else if (inputName && equipped.aura !== 'aura_sss' && equipped.aura !== 'aura_vip') {
        inputName.classList.add('text-gray-800', 'dark:text-gray-100'); // Warna default
    }
}

// --- 4. FUNGSI UPDATE UI KESELURUHAN ---
export function updatePlayerUI() {
    let info = calculateLevelInfo(playerState.exp);
    let currentTitle = getTitle(info.level);

    // Update Input
    if (inputName && playerState.name !== undefined) inputName.value = playerState.name;
    
    // Mencegah overwrite foto profil dari Firebase jika sudah ada gambar (img tag)
    if (avatarInitial) {
        const hasImage = avatarInitial.querySelector('img');
        if (!hasImage) {
            avatarInitial.innerText = playerState.name ? playerState.name.charAt(0).toUpperCase() : "A";
        }
    }

    // Update Text Header & Profil
    if (headerLevel) headerLevel.innerText = `Lv. ${info.level}`;
    if (headerTitle) headerTitle.innerText = currentTitle;
    if (displayLevel) displayLevel.innerText = `Level ${info.level}`;

    // Update Progress Bar EXP yang dinamis
    let percent = (info.expCurrent / info.expRequired) * 100;
    if (expBar && displayExp && displayTitleBot) {
        displayExp.innerText = `${info.expCurrent.toLocaleString('id-ID')} / ${info.expRequired.toLocaleString('id-ID')} EXP`;
        expBar.style.width = `${Math.min(percent, 100)}%`;
        displayTitleBot.innerText = `🏆 Gelar: ${currentTitle}`;
    }

    // PANGGIL FUNGSI KOSMETIK SETIAP KALI UI DIPERBARUI!
    applyCosmetics(info.level);
}

// --- 5. EVENT LISTENER AUTO-SAVE NAMA ---
if (inputName) {
    inputName.addEventListener('change', (e) => {
        playerState.name = e.target.value;
        localStorage.setItem('userName', e.target.value);
        updatePlayerUI();
    });
}

// --- 6. LISTENER OTOMATIS DARI BRANKAS DATA ---
// Jika EXP bertambah di state.js, otomatis perbarui UI Profil tanpa lag!
document.addEventListener('stateUpdated', updatePlayerUI);
