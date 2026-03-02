// ==========================================
// --- 0. UTILITAS KEAMANAN (ANTI-CRASH) ---
// ==========================================

// Mengambil data dengan fallback aman untuk mencegah error JSON.parse(null/undefined)
const getSafeJSON = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return (item && item !== "undefined") ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return fallback;
    }
};

// ==========================================
// --- 1. INISIALISASI DATA PLAYER ---
// ==========================================

// Mengambil data player dari localStorage atau set nilai default
window.playerData = getSafeJSON('playerData', {
    name: localStorage.getItem('userName') || "",
    bio: localStorage.getItem('userBio') || "",
    quote: localStorage.getItem('userQuote') || "",
    level: 1,
    exp: 0,
    title: "Fase Nyasar",
    lastActive: new Date().toISOString()
});

// Backward compatibility: Menyelaraskan dengan sistem EXP & Koin lama
window.totalExp = parseInt(localStorage.getItem('totalExp')) || window.playerData.exp || 0;
window.playerData.exp = window.totalExp; // Sinkronkan ke objek utama
window.totalKoin = parseInt(localStorage.getItem('totalKoin')) || 0;

// Referensi Elemen DOM Player (Anti-Bug: Aman jika elemen tidak ada di halaman tertentu)
const inputName = document.getElementById('user-name');
const inputBio = document.getElementById('user-bio');
const inputQuote = document.getElementById('user-quote');
const displayLevel = document.getElementById('display-level');
const displayExp = document.getElementById('display-exp');
const expBar = document.getElementById('exp-bar');
const displayTitleBot = document.getElementById('display-title-bot');
const avatarInitial = document.getElementById('avatar-initial');
const headerLevel = document.getElementById('header-level');
const headerTitle = document.getElementById('header-title');
const koinDisplay = document.getElementById('koin-display');


// ==========================================
// --- 2. SISTEM LEVELING & GELAR (TITLES) ---
// ==========================================

window.getExpRequirement = function(level) { 
    return 50 * level * (level + 1); 
};

window.getTitle = function(lvl) {
    if(lvl < 10) return "NPC Duniawi";
    if(lvl < 20) return "Skena Ibadah";
    if(lvl < 30) return "Pendekar Subuh";
    if(lvl < 40) return "Suhu Akhlaq";
    if(lvl < 50) return "Bestie Hijrah";
    return "Backingan Pusat";
};

window.calculateLevelInfo = function(totalExp) {
    let lvl = 1;
    let isCapped = false;
    let nextExamLvl = null;

    while (totalExp >= window.getExpRequirement(lvl)) {
        let targetLevel = lvl + 1;
        if (targetLevel % 10 === 0 && targetLevel <= 50) {
            if (localStorage.getItem(`exam_passed_${targetLevel}`) !== 'true') {
                isCapped = true; 
                nextExamLvl = targetLevel; 
                break; 
            }
        }
        lvl++;
        if (lvl >= 50) { lvl = 50; break; }
    }

    let expForCurrentLvl = lvl === 1 ? 0 : window.getExpRequirement(lvl - 1);
    let expForNextLvl = window.getExpRequirement(lvl);
    let requiredExp = expForNextLvl - expForCurrentLvl;
    let currentLevelExp = totalExp - expForCurrentLvl;
    
    if (isCapped && totalExp >= expForNextLvl) currentLevelExp = requiredExp; 
    
    // Update playerData level
    window.playerData.level = lvl;
    
    return { level: lvl, expCurrent: currentLevelExp, expRequired: requiredExp, isCapped, nextExamLvl };
};

// ==========================================
// --- 3. FUNGSI UPDATE UI KESELURUHAN ---
// ==========================================

window.updatePlayerUI = function() {
    // 1. Update Input Fields
    if(inputName) inputName.value = window.playerData.name;
    if(inputBio) inputBio.value = window.playerData.bio;
    if(inputQuote) inputQuote.value = window.playerData.quote;
    if(koinDisplay) koinDisplay.innerText = window.totalKoin.toLocaleString('id-ID');

    // 2. Update Avatar Inisial
    if (window.playerData.name && avatarInitial) {
        avatarInitial.innerText = window.playerData.name.charAt(0).toUpperCase();
    } else if (avatarInitial) {
         avatarInitial.innerText = "A";
    }

    // 3. Kalkulasi Info Level Terbaru (Berdasarkan Limit Break)
    let info = window.calculateLevelInfo(window.totalExp);
    let currentTitle = window.getTitle(info.level);
    window.playerData.title = currentTitle; // Simpan ke state
    
    let percent = (info.expCurrent / info.expRequired) * 100;
    if (percent > 100) percent = 100;

    // 4. Update Header Utama
    if(headerLevel) headerLevel.innerText = `Lv. ${info.level}`;
    if(headerTitle) headerTitle.innerText = currentTitle;
    if(displayLevel) displayLevel.innerText = `Level ${info.level}`;
    
    // 5. Update Progress Bar & Kondisi Limit Break (Ujian)
    if(expBar && displayExp && displayTitleBot) {
        if (info.isCapped && info.expCurrent >= info.expRequired) {
            displayExp.innerHTML = `<span class="text-rose-500 animate-pulse font-black">🔒 MAX (Butuh Ujian)</span>`;
            expBar.style.width = '100%';
            expBar.className = "bg-gradient-to-r from-rose-500 to-orange-500 h-3.5 rounded-full transition-all duration-1000 shadow-md cursor-pointer animate-pulse";
            expBar.onclick = () => window.openExamModal(info.nextExamLvl);
            displayTitleBot.innerHTML = `⚠️ <span class="underline text-rose-500 cursor-pointer font-bold" onclick="window.openExamModal(${info.nextExamLvl})">KLIK UNTUK UJIAN NAIK KE LV.${info.nextExamLvl}</span>`;
        } else {
            displayExp.innerText = `${info.expCurrent.toLocaleString('id-ID')} / ${info.expRequired.toLocaleString('id-ID')} EXP`;
            expBar.style.width = `${percent}%`;
            expBar.className = "bg-gradient-to-r from-emerald-400 to-teal-500 h-3.5 rounded-full transition-all duration-1000 ease-out shadow-md";
            expBar.onclick = null;
            displayTitleBot.innerText = `🏆 Gelar: ${currentTitle}`;
        }
    }

    // 6. Terapkan Kosmetik (Aura Gacha / Default Border)
    applyCosmetics(info.level);
};

// ==========================================
// --- 4. SISTEM KOSMETIK & AURA ---
// ==========================================

function applyCosmetics(level) {
    if(!avatarInitial) return;
    
    // Reset Class Kosmetik (Aura) dan Text Style secara bersih
    avatarInitial.className = "w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full mx-auto flex items-center justify-center mb-4 text-4xl text-white font-extrabold relative z-10 transition-all duration-700";
    if(inputName) inputName.className = "w-full bg-transparent outline-none py-1 mb-1 font-black text-2xl text-center transition relative z-10 placeholder-gray-300";

    // Cek inventory & item yang sedang dipakai (equipped) dengan fallback aman
    const equipped = window.equippedItems || getSafeJSON('equippedItems', {});

    // 1. Terapkan Aura yang Sedang Dipakai
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
        // Default Border Berdasarkan Level jika tidak pakai aura
        if (level >= 30) { 
            avatarInitial.classList.add('ring-4', 'ring-yellow-400', 'shadow-lg', 'shadow-yellow-400/50'); 
        } 
        else if (level >= 10) { 
            avatarInitial.classList.add('ring-4', 'ring-blue-400'); 
        } 
        else { 
            avatarInitial.classList.add('ring-4', 'ring-gray-200', 'dark:ring-gray-600'); 
        }
    }

    // 2. Terapkan Gaya Nama (Name FX) jika dipakai
    if (equipped.name_fx && window.previewStyles && inputName) {
        const styles = window.previewStyles[equipped.name_fx];
        if (styles) {
            // Mencegah error jika styles string kosong
            const classArray = styles.split(' ').filter(c => c.trim() !== '');
            if(classArray.length > 0) inputName.classList.add(...classArray);
        }
    } else if (inputName && equipped.aura !== 'aura_sss' && equipped.aura !== 'aura_vip') {
        // Default warna jika tidak pakai Name FX atau Aura khusus
        inputName.classList.add('text-gray-800', 'dark:text-gray-100');
    }
}

// ==========================================
// --- 5. FUNGSI SAVE & AUTO-SAVE ---
// ==========================================

function savePlayerData() {
    if(inputName) {
        window.playerData.name = inputName.value;
        localStorage.setItem('userName', inputName.value); // Backward comp
    }
    if(inputBio) {
        window.playerData.bio = inputBio.value;
        localStorage.setItem('userBio', inputBio.value);
    }
    if(inputQuote) {
        window.playerData.quote = inputQuote.value;
        localStorage.setItem('userQuote', inputQuote.value);
    }
    
    // Update Inisial Avatar saat ngetik real-time
    if (window.playerData.name && avatarInitial) {
        avatarInitial.innerText = window.playerData.name.charAt(0).toUpperCase();
    }
    
    localStorage.setItem('playerData', JSON.stringify(window.playerData));
    if(window.syncProfileToFirebase) window.syncProfileToFirebase(); 
}

// Event Listeners untuk Input (Auto Save)
if (inputName) inputName.addEventListener('change', savePlayerData);
if (inputBio) inputBio.addEventListener('change', savePlayerData);
if (inputQuote) inputQuote.addEventListener('change', savePlayerData);

// ==========================================
// --- 6. FUNGSI TAMBAH EXP KESELURUHAN ---
// ==========================================

window.addExp = function(amount) {
    // Cek Buff EXP (Gacha Consumable) - Gunakan fallback aman
    const inventory = window.inventory || getSafeJSON('inventory', {});
    if (inventory['item_buff'] > 0) {
        amount *= 2; // EXP Double jika ada buff
    }

    // Ambil info sebelum tambah EXP untuk cek level up
    let oldInfo = window.calculateLevelInfo(window.totalExp);
    
    window.totalExp += amount;
    window.playerData.exp = window.totalExp;
    
    localStorage.setItem('totalExp', window.totalExp);
    localStorage.setItem('playerData', JSON.stringify(window.playerData));
    
    // Ambil info setelah tambah EXP
    let newInfo = window.calculateLevelInfo(window.totalExp);

    window.updatePlayerUI();

    // Trigger perayaan jika naik level
    if (newInfo.level > oldInfo.level && !newInfo.isCapped) {
        if(typeof confetti === 'function') {
             confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, zIndex: 100 });
        }
        alert(`Selamat! Kamu naik ke Level ${newInfo.level} 🎉\nGelar barumu: ${window.getTitle(newInfo.level)}`);
        if(window.pushToLiveFeed) window.pushToLiveFeed(window.playerData.name || "Pemain", `Naik ke Level ${newInfo.level}!`, 'user_level');
    }
};

// ==========================================
// --- 7. SISTEM UJIAN LIMIT BREAK (RANK) ---
// ==========================================

window.openExamModal = function(targetLevel) {
    const modal = document.getElementById('exam-modal');
    const list = document.getElementById('exam-requirements-list');
    if(!modal || !list) return;

    document.getElementById('exam-level-target').innerText = targetLevel;
    
    let html = ''; 
    let isEligible = true;
    let streak = parseInt(localStorage.getItem('streakNum') || 0);
    let totalDzikir = parseInt(localStorage.getItem('tasbih_subhanallah')||0) + parseInt(localStorage.getItem('tasbih_alhamdulillah')||0) + parseInt(localStorage.getItem('tasbih_allahuakbar')||0);

    if (targetLevel === 10) {
        let req1 = streak >= 3; let req2 = totalDzikir >= 333;
        html += `<li class="flex items-center gap-2 ${req1 ? 'text-emerald-400' : 'text-gray-400'}">${req1 ? '✅' : '❌'} Streak Ibadah min. 🔥 3 Hari (Skor: ${streak}/3)</li>`;
        html += `<li class="flex items-center gap-2 ${req2 ? 'text-emerald-400' : 'text-gray-400'}">${req2 ? '✅' : '❌'} Total Dzikir Tasbih 333x (Skor: ${totalDzikir}/333)</li>`;
        isEligible = req1 && req2;
    } else if (targetLevel === 20) {
        let req1 = window.statsRadar && window.statsRadar.derma >= 100; let req2 = streak >= 7;
        html += `<li class="flex items-center gap-2 ${req1 ? 'text-emerald-400' : 'text-gray-400'}">${req1 ? '✅' : '❌'} Poin Aura Derma > 100</li>`;
        html += `<li class="flex items-center gap-2 ${req2 ? 'text-emerald-400' : 'text-gray-400'}">${req2 ? '✅' : '❌'} Konsisten Streak 🔥 7 Hari</li>`;
        isEligible = req1 && req2;
    } else {
        let req1 = streak >= 10;
        html += `<li class="flex items-center gap-2 ${req1 ? 'text-emerald-400' : 'text-gray-400'}">${req1 ? '✅' : '❌'} Konsisten Streak 🔥 10 Hari</li>`;
        isEligible = req1;
    }

    list.innerHTML = html;
    const btnSubmit = document.getElementById('btn-submit-exam');
    
    if(isEligible) {
        btnSubmit.disabled = false;
        btnSubmit.className = "flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3 rounded-xl transition shadow-lg shadow-emerald-500/30 text-sm";
        btnSubmit.innerText = "Selesaikan Ujian!"; 
        btnSubmit.setAttribute('data-target', targetLevel);
    } else {
        btnSubmit.disabled = true;
        btnSubmit.className = "flex-1 bg-gray-600 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed text-sm";
        btnSubmit.innerText = "Syarat Belum Cukup"; 
        btnSubmit.removeAttribute('data-target');
    }
    modal.classList.remove('hidden'); 
    modal.classList.add('flex');
};

window.closeExamModal = function() {
    const modal = document.getElementById('exam-modal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.submitExam = function() {
    const btn = document.getElementById('btn-submit-exam');
    const target = btn.getAttribute('data-target');
    if(target) {
        localStorage.setItem(`exam_passed_${target}`, 'true'); 
        window.closeExamModal();
        if(typeof confetti === 'function') confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 }, zIndex: 100 });
        alert(`🎊 LULUS! Selamat, Limit Break berhasil!\nKamu sekarang berhak naik ke Level ${target}. EXP yang tertahan kini terbuka kembali.`);
        window.updatePlayerUI();
        if(window.pushToLiveFeed) window.pushToLiveFeed(window.playerData.name || "Pemain", `Lulus Ujian Limit Break Lv.${target}!`, 'user_level');
    }
};

// ==========================================
// --- 8. RAK TROFI BADGE ---
// ==========================================

window.badgeData = [
    { id: 'bdg_pusat', icon: '🕋', name: 'Admin Pusat', type: 'pusat', reqStat: 50, reqExam: 10, desc: 'Pancaran ibadah wajib yang tiada tara.' },
    { id: 'bdg_aura', icon: '✨', name: 'Aura Memikat', type: 'aura', reqStat: 50, reqExam: 10, desc: 'Karisma dan adab yang menyejukkan hati.' },
    { id: 'bdg_peka', icon: '👼', name: 'Malaikat Peka', type: 'peka', reqStat: 50, reqExam: 20, desc: 'Punya empati tinggi, pendengar curhat terbaik.' },
    { id: 'bdg_sigma', icon: '🗿', name: 'Sigma Sejati', type: 'sigma', reqStat: 50, reqExam: 20, desc: 'Mandiri, disiplin, tangguh, dan selalu on-time.' },
    { id: 'bdg_derma', icon: '🎁', name: 'Sultan Sedekah', type: 'derma', reqStat: 50, reqExam: 30, desc: 'Dermawan sejati yang tangannya selalu di atas.' },
    { id: 'bdg_stoic', icon: '🧊', name: 'Master Stoic', type: 'stoic', reqStat: 50, reqExam: 30, desc: 'Ketenangan batin bagai air, pantang tersulut emosi.' },
    { id: 'bdg_habit', icon: '🔥', name: 'Habit Builder', type: 'streak', reqStat: 7, reqExam: 10, desc: 'Menjaga konsistensi adalah kunci segalanya.' }
];

window.updateBadges = function() {
    const container = document.getElementById('badge-rack-container');
    if(!container) return;
    
    let html = '';
    let userStreak = parseInt(localStorage.getItem('streakNum') || 0);

    window.badgeData.forEach(b => {
        let currentVal = b.type === 'streak' ? userStreak : (window.statsRadar && window.statsRadar[b.type] || 0);
        let isStatMet = currentVal >= b.reqStat;
        let isExamMet = localStorage.getItem(`exam_passed_${b.reqExam}`) === 'true';
        let isUnlocked = isStatMet && isExamMet;

        let stateClass = isUnlocked 
            ? "bg-white dark:bg-gray-800 border-emerald-400 shadow-emerald-500/20 shadow-md transform hover:-translate-y-1" 
            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 grayscale";
        
        let iconClass = isUnlocked ? "text-emerald-500 drop-shadow-md" : "text-gray-400";
        let titleColor = isUnlocked ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400";
        
        let infoContent = `<span class='text-sm text-emerald-600 block mb-2'>${b.desc}</span><b>Syarat Mendapatkan Trofi:</b><br><br>`;
        infoContent += `<div class='text-left ml-2'>`;
        infoContent += `${isStatMet ? '✅' : '❌'} Poin <b>${b.type.toUpperCase()}</b> capai ${b.reqStat} <span class='text-[10px] text-gray-500'>(Skormu: ${currentVal})</span><br>`;
        infoContent += `${isExamMet ? '✅' : '❌'} Lulus <b>Ujian Rank Lv.${b.reqExam}</b>`;
        infoContent += `</div>`;

        html += `
        <div onclick="window.openInfoModal('${isUnlocked ? '🎉 ' : '🔒 '}${b.name}', \`${infoContent}\`)" class="snap-center cursor-pointer flex-shrink-0 w-[95px] rounded-2xl p-3 border-2 text-center transition-all duration-300 ${stateClass}">
            <div class="text-3xl mb-2 flex items-center justify-center h-10 ${iconClass}">${isUnlocked ? b.icon : '🔒'}</div>
            <p class="text-[10px] font-extrabold uppercase tracking-wide leading-tight ${titleColor}">${b.name}</p>
        </div>
        `;
    });
    container.innerHTML = html;
};

// ==========================================
// --- 9. SISTEM STREAK HARIAN (API APIAN) ---
// ==========================================

window.initStreakSystem = function() {
    const btnStreak = document.getElementById('btn-claim-streak');
    const displayStreak = document.getElementById('streak-display');
    if(!btnStreak || !displayStreak) return;

    let currentStreak = parseInt(localStorage.getItem('streakNum') || 0);
    let lastClaimDate = localStorage.getItem('lastStreakClaim');
    let todayStr = new Date().toDateString();

    let isClaimedToday = (lastClaimDate === todayStr);

    if (!isClaimedToday) {
        btnStreak.className = "bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 rounded-full text-xs font-black shadow-[0_0_15px_rgba(249,115,22,0.6)] border border-orange-300 transition-all cursor-pointer animate-pulse transform hover:scale-105 text-white flex items-center justify-center";
        displayStreak.innerText = currentStreak > 0 ? "Klaim 🔥" : "Mulai 🔥";
        btnStreak.disabled = false;
    } else {
        btnStreak.className = "bg-white/20 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border border-white/30 transition-all cursor-not-allowed opacity-80 text-white flex items-center justify-center";
        displayStreak.innerText = `🔥 ${currentStreak}`;
        btnStreak.disabled = true;
    }

    btnStreak.onclick = function() {
        if (isClaimedToday) return;

        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let yesterdayStr = yesterday.toDateString();

        if (lastClaimDate === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        localStorage.setItem('streakNum', currentStreak);
        localStorage.setItem('lastStreakClaim', todayStr);
        window.streakNum = currentStreak; 
        isClaimedToday = true;

        if(window.syncStatsToFirebase) window.syncStatsToFirebase();

        btnStreak.className = "bg-white/20 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border border-white/30 transition-all cursor-not-allowed opacity-80 text-white flex items-center justify-center";
        displayStreak.innerText = `🔥 ${currentStreak}`;
        btnStreak.disabled = true;

        // EXP Gratisan karena login harian
        window.addExp(10);

        if(typeof confetti === 'function') {
            confetti({ 
                particleCount: 60, 
                spread: 70, 
                origin: { y: 0.1, x: 0.7 }, 
                colors: ['#f97316', '#ef4444', '#fbbf24'] 
            });
        }
    };
};

// ==========================================
// --- 10. BOOTSTRAP INITIALIZATION ---
// ==========================================

// Panggil fungsi-fungsi ini saat script dimuat pertama kali
document.addEventListener('DOMContentLoaded', () => {
    window.updatePlayerUI();
    setTimeout(window.updateBadges, 500); // Beri jeda agar radar chart siap dulu
    window.initStreakSystem();
});
