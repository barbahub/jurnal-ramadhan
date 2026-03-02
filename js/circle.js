// --- LIVE FEED SYSTEM & POP-UPS ---
window.pushToLiveFeed = function(title, desc, type = 'task', extraValue = null) {
    const feedContainer = document.getElementById('live-feed-container');
    if(!feedContainer) return;
    if(feedContainer.querySelector('p.text-gray-400')) feedContainer.innerHTML = ''; 
    
    const item = document.createElement('div');
    let iconHtml = '';
    let bgClass = 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
    let titleClass = 'text-gray-800 dark:text-gray-200';
    let descClass = 'text-emerald-600 dark:text-emerald-400';
    let rightBadge = '';
    let onClickHtml = '';

    let safeTitle = title.replace(/'/g, "\\'");
    let safeDesc = desc.replace(/'/g, "\\'");

    if (type === 'task') {
        const initial = title.charAt(0).toUpperCase();
        iconHtml = `<div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 text-xs font-bold uppercase shrink-0">${initial}</div>`;
        rightBadge = `<span class="text-[10px] font-black text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg shrink-0">+${extraValue}</span>`;
        onClickHtml = `onclick="window.showUserPopup('${safeTitle}', '${safeDesc}', '${initial}')"`;
    } else if (type === 'user_level') {
        const initial = title.charAt(0).toUpperCase();
        iconHtml = `<div class="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">🌟</div>`;
        bgClass = 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700/50';
        titleClass = 'text-yellow-700 dark:text-yellow-400';
        descClass = 'text-orange-600 dark:text-orange-300';
        onClickHtml = `onclick="window.showUserPopup('${safeTitle}', '${safeDesc}', '${initial}')"`;
    } else if (type === 'circle_update') {
        let exp = extraValue || Math.floor(Math.random() * 50000);
        let randMembers = Math.floor(Math.random() * 10) + 1;
        onClickHtml = `onclick="window.showCirclePopup('${safeTitle}', ${exp}, '', 'Solidaritas Jalur Langit', ${randMembers})"`;
        
        iconHtml = `<div class="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">🛡️</div>`;
        bgClass = 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/50';
        titleClass = 'text-blue-700 dark:text-blue-400';
        descClass = 'text-indigo-600 dark:text-indigo-300';
    }

    item.className = `p-3 rounded-2xl border shadow-sm flex items-center gap-3 animate-[fadeIn_0.5s_ease-out] cursor-pointer hover:scale-[1.02] transition-transform ${bgClass}`;
    item.setAttribute('onclick', onClickHtml.replace('onclick="', '').replace(/"$/, ''));

    item.innerHTML = `
        ${iconHtml}
        <div class="flex-1">
            <p class="text-[11px] font-bold ${titleClass} transition">${title}</p>
            <p class="text-xs font-bold ${descClass} truncate max-w-[180px]">${desc}</p>
        </div>
        ${rightBadge}
    `;
    
    feedContainer.prepend(item); 
    if (feedContainer.children.length > 15) feedContainer.lastElementChild.remove();
}

window.showUserPopup = function(name, lastQuest, initial, simulatedExp = null) {
    const inputName = document.getElementById('user-name');
    const inputBio = document.getElementById('user-bio');
    
    document.getElementById('popup-name').innerText = name;
    document.getElementById('popup-bio').innerText = `"${(inputName && name === inputName.value) ? (inputBio.value || 'Tetap skuy walau badai menerjang.') : 'Pejuang Jalur Langit.'}"`;
    document.getElementById('popup-avatar').innerText = initial;
    
    let targetExp = simulatedExp !== null ? simulatedExp : window.totalExp;
    let info = window.calculateLevelInfo ? window.calculateLevelInfo(targetExp) : {level: 1};
    let titleStr = window.getTitle ? window.getTitle(info.level) : "NPC Duniawi";
    document.getElementById('popup-title').innerText = `${titleStr} (Lv. ${info.level})`;

    let heatmapHtml = '';
    for(let i=0; i<7; i++) {
        let isActive = (inputName && name === inputName.value) ? (window.activityHistory && window.activityHistory.length > i) : (Math.random() > 0.3);
        heatmapHtml += `<div class="w-4 h-4 rounded-sm ${isActive ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}"></div>`;
    }
    document.getElementById('popup-heatmap').innerHTML = heatmapHtml;

    let overall = Math.floor(Math.random() * 40) + 50; 
    document.getElementById('popup-ovr').innerText = `OVR ${overall}`;
    
    const vibesData = [
        { name: 'Pusat', color: 'bg-blue-400', pct: Math.floor(Math.random()*60)+40 },
        { name: 'Sigma', color: 'bg-rose-400', pct: Math.floor(Math.random()*60)+40 },
        { name: 'Stoic', color: 'bg-yellow-400', pct: Math.floor(Math.random()*60)+40 }
    ];
    
    let vibesHtml = '';
    vibesData.forEach(v => {
        vibesHtml += `
        <div>
            <div class="flex justify-between text-[8px] font-bold text-gray-500 mb-0.5"><span>${v.name}</span><span>${v.pct}</span></div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"><div class="${v.color} h-1.5 rounded-full" style="width: ${v.pct}%"></div></div>
        </div>`;
    });
    document.getElementById('popup-vibes-bars').innerHTML = vibesHtml;

    const modal = document.getElementById('user-popup-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('user-popup-content').classList.remove('scale-95'), 10);
}

window.closeUserPopup = function(e) {
    const modal = document.getElementById('user-popup-modal');
    document.getElementById('user-popup-content').classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 200);
}

// Fungsi Gelar Circle Tiap Kelipatan 20 Level
window.getCircleTitle = function(lvl) {
    if(lvl < 20) return "Perintis Langit";
    if(lvl < 40) return "Sirkel Solid";
    if(lvl < 60) return "Pasukan Elit";
    if(lvl < 80) return "Suhu Berjamaah";
    if(lvl < 100) return "Keluarga Inti";
    return "Sirkel Admin Pusat"; 
}

// Requirement untuk menghindari function undefined di dummy live feed
window.getGuildExpRequirement = function(lvl) {
    return 1000 * lvl * (lvl + 1);
}

window.showCirclePopup = function(name, exp, logoUrl, motto, memberCount) {
    try {
        let safeExp = parseInt(exp) || 0;
        let safeName = name ? String(name) : 'Circle Tanpa Nama';
        let safeLogoUrl = logoUrl ? String(logoUrl).trim() : '';
        let safeMotto = motto ? String(motto).trim() : '';
        let safeMemberCount = parseInt(memberCount) || 1;

        document.getElementById('popup-circle-name').innerText = safeName;
        document.getElementById('popup-circle-exp').innerText = safeExp.toLocaleString('id-ID');

        let lvl = 1;
        while(safeExp >= window.getGuildExpRequirement(lvl)) { lvl++; }

        let currentLvlBaseExp = lvl === 1 ? 0 : window.getGuildExpRequirement(lvl - 1);
        let nextLvlExp = window.getGuildExpRequirement(lvl);
        let expNeeded = nextLvlExp - currentLvlBaseExp;
        let expProgress = safeExp - currentLvlBaseExp;
        let percent = Math.min(100, Math.max(0, (expProgress / expNeeded) * 100));

        let progressBar = document.getElementById('popup-circle-progress');
        if(progressBar) progressBar.style.width = `${percent}%`;
        let progressText = document.getElementById('popup-circle-progress-text');
        if(progressText) progressText.innerText = `${Math.floor(percent)}%`;

        let circleTitle = window.getCircleTitle(lvl);
        document.getElementById('popup-circle-lvl').innerHTML = `Lv. ${lvl} &bull; ${circleTitle}`;

        if(safeLogoUrl && safeLogoUrl !== 'undefined') {
            document.getElementById('popup-circle-logo').innerHTML = `<img src="${safeLogoUrl}" onerror="this.style.display='none'; this.parentNode.innerText='🛡️'" class="w-full h-full object-cover">`;
        } else {
            document.getElementById('popup-circle-logo').innerText = "🛡️";
        }

        const mottoEl = document.getElementById('popup-circle-motto-text');
        if(mottoEl) {
            mottoEl.innerText = (safeMotto && safeMotto !== 'undefined') ? `"${safeMotto}"` : '"Solidaritas Jalur Langit"';
        }

        const memEl = document.getElementById('popup-circle-members');
        if(memEl) {
            memEl.innerText = `${safeMemberCount}/10`;
        }

        const modal = document.getElementById('circle-popup-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => document.getElementById('circle-popup-content').classList.remove('scale-95'), 10);
    } catch(err) {
        console.error("Circle Popup Error:", err);
    }
}

window.closeCirclePopup = function(e) {
    if(e) e.stopPropagation();
    document.getElementById('circle-popup-content').classList.add('scale-95');
    setTimeout(() => {
        const modal = document.getElementById('circle-popup-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
}

// Dummy Interval Animasi Live Feed
const dummyNames = ["Bima_Sigma", "Putri.Skuy", "Abdi_Pusat", "Rina_Chill", "Deni_Core"];
setInterval(() => {
    let rand = Math.random();
    let rName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    
    if(rand > 0.6 && window.dailyQuests) {
        let rQuest = window.dailyQuests[Math.floor(Math.random() * window.dailyQuests.length)];
        window.pushToLiveFeed(rName, `Menyelesaikan ${rQuest.title}`, 'task', rQuest.exp);
    } else if (rand > 0.3) {
        let levels = [10, 20, 30, 40, 50];
        let rLvl = levels[Math.floor(Math.random() * levels.length)];
        let rTitle = window.getTitle ? window.getTitle(rLvl) : "Suhu";
        window.pushToLiveFeed(rName, `Naik ke Level ${rLvl} (${rTitle})!`, 'user_level');
    } else {
        let circleNames = ["Pejuang Subuh", "Sirkel Akhirat", "Skena Hijrah", "Pasukan Langit"];
        let cName = circleNames[Math.floor(Math.random() * circleNames.length)];
        let cLvls = [2, 5, 10, 15, 20];
        let cLvl = cLvls[Math.floor(Math.random() * cLvls.length)];
        let dummyExp = window.getGuildExpRequirement(cLvl) + Math.floor(Math.random() * 500);
        window.pushToLiveFeed(cName, `Mencapai Level ${cLvl} (${window.getCircleTitle(cLvl)})!`, 'circle_update', dummyExp);
    }
}, 12000);

// --- LOGIKA UI/UX DROPDOWN MISI GOTONG ROYONG ---
const btnToggleCoop = document.getElementById('btn-toggle-coop');
const containerCoop = document.getElementById('circle-quests-container');
const iconCoop = document.getElementById('icon-toggle-coop');

if(btnToggleCoop && containerCoop) {
    btnToggleCoop.addEventListener('click', () => {
        containerCoop.classList.toggle('hidden');
        if(iconCoop) iconCoop.style.transform = containerCoop.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });
}

// --- AMALPAD WRAPPED: LAPORAN TULANG PUNGGUNG CIRCLE ---
window.closeRekapModal = function() {
    const modal = document.getElementById('rekap-circle-modal');
    document.getElementById('rekap-circle-content').classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 200);
}

const btnRekap = document.getElementById('btn-rekap-circle');

// 1. Cek status aktif/terkunci saat halaman dimuat
function checkRekapStatus() {
    if(!btnRekap) return;
    const today = new Date();
    // Jika ingin ngetes hari ini juga, kamu bisa ubah ">= 28" jadi ">= 1"
    const isEndOfMonth = today.getDate() >= 28; 
    
    if (isEndOfMonth) {
        btnRekap.className = "flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl transition shadow-lg shadow-blue-500/30 text-xs uppercase tracking-wide animate-pulse";
        btnRekap.innerHTML = "🛡️ Buka Rekap Circle!";
    }
}

// Jalankan saat script dimuat
setTimeout(checkRekapStatus, 1000); 

// 2. Logika ketika ditekan
if (btnRekap) {
    btnRekap.addEventListener('click', async () => {
        const today = new Date();
        const isEndOfMonth = today.getDate() >= 28; // Jika ngetes ubah >= 1
        
        if (!window.userCircleId) {
            alert("Kamu harus bergabung atau membuat Circle terlebih dahulu untuk melihat Laporan Rekap!");
            return;
        }

        if (!isEndOfMonth) {
            alert("Sabar bos! Laporan Rekap Circle hanya bisa dibuka setiap tanggal 28-31 di akhir bulan. Terus push EXP Circle-mu!");
            return;
        }

        // Tampilkan loading state
        const originalText = btnRekap.innerHTML;
        btnRekap.innerHTML = "⏳ Menghitung Data...";
        btnRekap.disabled = true;

        try {
            // Kita pakai objek Firebase yang sudah di-export di firebase-db.js
            const circleRef = window.doc(window.db, "circles", window.userCircleId);
            const circleSnap = await window.getDoc(circleRef);

            if (circleSnap.exists()) {
                const circleData = circleSnap.data();
                const circleTotalExp = circleData.total_exp || 1; // hindari pembagian nol
                const userExp = window.totalExp || 0;

                // Kalkulasi kontribusi %
                let contributionPct = (userExp / circleTotalExp) * 100;
                // Cap di 100% jika user main solo tapi belum ada yang join
                if (contributionPct > 100) contributionPct = 100; 

                let gelar = "", deskripsi = "", emoji = "";

                // Tentukan Kasta berdasarkan kontribusi
                if (contributionPct >= 40) {
                    gelar = "Tulang Punggung";
                    deskripsi = `"Tanpamu, circle ini cuma remahan rengginang. Kamu bener-bener carry tim bulan ini!"`;
                    emoji = "💪";
                } else if (contributionPct >= 20) {
                    gelar = "Pilar Penting";
                    deskripsi = `"Kontribusimu sangat terasa. Kamu adalah alasan circle ini tetap solid dan terus naik rank!"`;
                    emoji = "🔥";
                } else if (contributionPct >= 5) {
                    gelar = "Warga Taat";
                    deskripsi = `"Rajin login dan sesekali bantu misi gotong royong. Lumayan lah, bulan depan lebih gaspol lagi bos!"`;
                    emoji = "👨‍🌾";
                } else {
                    gelar = "Beban Sirkel";
                    deskripsi = `"Wah parah, kamu lebih sering AFK daripada bantu circle. Pantes rank circle stuck, ayo berubah bulan depan!"`;
                    emoji = "🗿";
                }

                // Render ke UI Modal
                document.getElementById('rekap-circle-name').innerText = circleData.name;
                document.getElementById('rekap-pct').innerText = contributionPct.toFixed(1) + "%";
                document.getElementById('rekap-gelar').innerText = gelar;
                document.getElementById('rekap-desc').innerText = deskripsi;
                document.getElementById('rekap-emoji').innerText = emoji;
                
                // Animasi Progress Bar
                document.getElementById('rekap-bar').style.width = '0%';
                setTimeout(() => {
                    document.getElementById('rekap-bar').style.width = contributionPct + '%';
                }, 500);

                // Tampilkan Modal
                const modal = document.getElementById('rekap-circle-modal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setTimeout(() => document.getElementById('rekap-circle-content').classList.remove('scale-95'), 10);

                // Ledakan Confetti sesuai gelar
                if (typeof confetti === 'function') {
                    if (contributionPct >= 40) {
                        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#fbbf24', '#f59e0b'] }); // Confetti emas
                    } else if (contributionPct >= 20) {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); // Standard
                    }
                }
            }
        } catch (error) {
            console.error("Gagal ambil rekap:", error);
            alert("Sistem gagal mengambil data rahasia Circle. Coba lagi nanti.");
        } finally {
            // Kembalikan status tombol
            btnRekap.innerHTML = originalText;
            btnRekap.disabled = false;
        }
    });
}
