// ============================================================
// --- LIVE FEED SYSTEM & POP-UPS ---
// ============================================================
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
    try {
        const inputName = document.getElementById('user-name');
        const inputBio = document.getElementById('user-bio');
        
        if(document.getElementById('popup-name')) document.getElementById('popup-name').innerText = name;
        if(document.getElementById('popup-bio')) document.getElementById('popup-bio').innerText = `"${(inputName && name === inputName.value) ? (inputBio.value || 'Tetap semangat walau badai menerjang.') : 'Pejuang Jalur Langit.'}"`;
        if(document.getElementById('popup-avatar')) document.getElementById('popup-avatar').innerText = initial;
        
        let targetExp = simulatedExp !== null ? simulatedExp : (window.totalExp || 0);
        let info = window.calculateLevelInfo ? window.calculateLevelInfo(targetExp) : {level: 1};
        let titleStr = window.getTitle ? window.getTitle(info.level) : "Warga Baru";
        if(document.getElementById('popup-title')) document.getElementById('popup-title').innerText = `${titleStr} (Lv. ${info.level})`;

        let heatmapHtml = '';
        for(let i=0; i<7; i++) {
            let isActive = (inputName && name === inputName.value) ? (window.activityHistory && window.activityHistory.length > i) : (Math.random() > 0.3);
            heatmapHtml += `<div class="w-4 h-4 rounded-sm ${isActive ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}"></div>`;
        }
        if(document.getElementById('popup-heatmap')) document.getElementById('popup-heatmap').innerHTML = heatmapHtml;

        let overall = Math.floor(Math.random() * 40) + 50; 
        if(document.getElementById('popup-ovr')) document.getElementById('popup-ovr').innerText = `OVR ${overall}`;
        
        const vibesData = [
            { name: 'Pusat', color: 'bg-blue-400', pct: Math.floor(Math.random()*60)+40 },
            { name: 'Keren', color: 'bg-rose-400', pct: Math.floor(Math.random()*60)+40 },
            { name: 'Tenang', color: 'bg-yellow-400', pct: Math.floor(Math.random()*60)+40 }
        ];
        
        let vibesHtml = '';
        vibesData.forEach(v => {
            vibesHtml += `
            <div>
                <div class="flex justify-between text-[8px] font-bold text-gray-500 mb-0.5"><span>${v.name}</span><span>${v.pct}</span></div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"><div class="${v.color} h-1.5 rounded-full" style="width: ${v.pct}%"></div></div>
            </div>`;
        });
        if(document.getElementById('popup-vibes-bars')) document.getElementById('popup-vibes-bars').innerHTML = vibesHtml;

        const modal = document.getElementById('user-popup-modal');
        if(modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                const content = document.getElementById('user-popup-content');
                if(content) content.classList.remove('scale-95');
            }, 10);
        }
    } catch (e) {
        console.error("Popup User aman, dicegah dari crash:", e);
    }
}

window.closeUserPopup = function(e) {
    const modal = document.getElementById('user-popup-modal');
    const content = document.getElementById('user-popup-content');
    if(content) content.classList.add('scale-95');
    setTimeout(() => { 
        if(modal) {
            modal.classList.add('hidden'); 
            modal.classList.remove('flex'); 
        }
    }, 200);
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

        if(document.getElementById('popup-circle-name')) document.getElementById('popup-circle-name').innerText = safeName;
        if(document.getElementById('popup-circle-exp')) document.getElementById('popup-circle-exp').innerText = safeExp.toLocaleString('id-ID');

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
        if(document.getElementById('popup-circle-lvl')) document.getElementById('popup-circle-lvl').innerHTML = `Lv. ${lvl} &bull; ${circleTitle}`;

        const circleLogoEl = document.getElementById('popup-circle-logo');
        if(circleLogoEl) {
            if(safeLogoUrl && safeLogoUrl !== 'undefined') {
                circleLogoEl.innerHTML = `<img src="${safeLogoUrl}" onerror="this.style.display='none'; this.parentNode.innerText='🛡️'" class="w-full h-full object-cover">`;
            } else {
                circleLogoEl.innerText = "🛡️";
            }
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
        if(modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                const content = document.getElementById('circle-popup-content');
                if(content) content.classList.remove('scale-95');
            }, 10);
        }
    } catch(err) {
        console.error("Circle Popup aman, dicegah dari crash:", err);
    }
}

window.closeCirclePopup = function(e) {
    if(e) e.stopPropagation();
    const content = document.getElementById('circle-popup-content');
    if(content) content.classList.add('scale-95');
    setTimeout(() => {
        const modal = document.getElementById('circle-popup-modal');
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
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

// ============================================================
// --- LOGIKA UI/UX DROPDOWN MISI GOTONG ROYONG ---
// ============================================================
const btnToggleCoop = document.getElementById('btn-toggle-coop');
const containerCoop = document.getElementById('circle-quests-container');
const iconCoop = document.getElementById('icon-toggle-coop');

if(btnToggleCoop && containerCoop) {
    btnToggleCoop.addEventListener('click', () => {
        containerCoop.classList.toggle('hidden');
        if(iconCoop) iconCoop.style.transform = containerCoop.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });
}

// ============================================================
// --- AMALPAD WRAPPED: LAPORAN TULANG PUNGGUNG CIRCLE ---
// ============================================================
const badgesData = [
    { min: 90, name: "Suhu Admin Pusat", emoji: "👑" },
    { min: 75, name: "Tulang Punggung", emoji: "💪" },
    { min: 60, name: "Pilar Utama", emoji: "🏛️" },
    { min: 50, name: "MVP Circle", emoji: "🌟" },
    { min: 40, name: "Carry Tim", emoji: "🚀" },
    { min: 30, name: "Warga Teladan", emoji: "🎖️" },
    { min: 20, name: "Anggota Aktif", emoji: "🔥" },
    { min: 10, name: "Seksi Sibuk", emoji: "🏃" },
    { min: 5,  name: "Warga Biasa", emoji: "👨‍🌾" },
    { min: 0,  name: "Beban Sirkel", emoji: "🗿" }
];

const quotesData = {
    tierS: [
        "Tanpamu, circle ini cuma remahan rengginang. Kamu bener-bener carry tim bulan ini!",
        "Aura admin pusat menyala! Kehadiranmu bikin circle ini makin ditakuti di leaderboard.",
        "Effort-mu bulan ini luar biasa. Semua member circle sungkem sama dedikasimu!",
        "Nggak ada obat! Kamu bener-bener pilar terkuat yang menopang berdirinya circle ini.",
        "Punggung aman bro? Pasti pegel banget gendong satu circle sendirian sebulan penuh!"
    ],
    tierA: [
        "Kontribusimu sangat terasa. Kamu adalah alasan circle ini tetap solid dan terus naik rank!",
        "Melesat tajam! Kinerjamu bulan ini sukses bikin circle kita makin bersinar.",
        "Nggak cuma numpang nama, kamu buktiin kalau kamu pilar penting di circle ini!",
        "Diem-diem mematikan! Sekalinya login langsung setor EXP gede buat tim.",
        "Kerja bagus! Pertahankan terus prestasimu biar bulan depan bisa jadi MVP."
    ],
    tierB: [
        "Solid banget! Kalau semua member kayak kamu, circle kita pasti cepat max level.",
        "Rajin login dan sesekali bantu misi gotong royong. Mantap, bulan depan lebih gaspol lagi bos!",
        "Kontribusimu stabil! Nggak banyak gaya, tapi selalu ada saat circle membutuhkan.",
        "Performa yang sangat baik! Sedikit lagi push, kamu bisa mendominasi circle ini.",
        "Kamu adalah mesin penggerak circle yang nggak pernah kehabisan bensin!"
    ],
    tierC: [
        "Lumayan lah, seenggaknya kamu nggak AFK. Bulan depan wajib setor EXP lebih banyak!",
        "Kehadiranmu cukup ngebantu, walau kadang suka hilang ditelan bumi.",
        "Ayo push lagi! Kamu punya potensi buat ngasih kontribusi jauh lebih gede dari ini.",
        "Jangan cuma jadi tim hore, buktikan kalau kamu juga bisa bersaing di circle!",
        "Masih pemanasan ya? Ditunggu kejutan EXP-mu di bulan berikutnya."
    ],
    tierD: [
        "Wah parah, kamu lebih sering AFK daripada bantu circle. Pantes rank circle stuck!",
        "Nyumbang EXP dikit amat bos? Niat gabung circle atau cuma numpang nama doang nih?",
        "Awas di-kick leader! Bulan ini performamu sangat mengkhawatirkan sebagai member.",
        "Tidur mulu! Ayo bangun dan kerjain misi, circle butuh kontribusimu bro!",
        "Ini member apa NPC? Cuma nongkrong tapi nggak pernah nyumbang EXP."
    ]
};

// Disatukan agar tombol tutup HTML lama dan baru sama-sama berfungsi
window.closeRekapModal = window.tutupRekapModal = function() {
    const content = document.getElementById('rekap-circle-content');
    const modal = document.getElementById('rekap-circle-modal');
    if(content) {
        content.classList.remove('animate-pop');
        content.classList.add('scale-95');
    }
    setTimeout(() => {
        if(modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }, 200);
}

function initRekapSystem() {
    const btnRekap = document.getElementById('btn-rekap-circle');
    if(!btnRekap) return;

    const today = new Date();
    // Buka akses khusus di akhir bulan (Tanggal 28 ke atas). 
    // TIP: Jika kamu mau test sekarang juga, ganti angka 28 menjadi 1 sementara waktu.
    const isEndOfMonth = today.getDate() >= 28; 

    if (isEndOfMonth) {
        // Hapus gaya terkunci, berikan gaya tombol menyala/pulsing
        btnRekap.className = "flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/30 text-xs uppercase tracking-wide animate-pulse cursor-pointer";
        btnRekap.innerHTML = "🛡️ Buka Rekap Circle!";
        
        // Cukup tambahkan event listener ini (tanpa perlu hit firebase berkali-kali)
        btnRekap.addEventListener('click', () => {
            if (!window.userCircleId) {
                alert("Kamu harus bergabung atau membuat Circle terlebih dahulu untuk melihat Laporan Rekap Akhirat!");
                return;
            }

            // --- AMBIL DATA DARI UI (BEBAS LAG) ---
            const circleNameEl = document.getElementById('circle-name-display');
            const circleName = circleNameEl ? circleNameEl.innerText : "Circleku";
            
            const userNameEl = document.getElementById('user-name');
            const userName = userNameEl ? userNameEl.value : "Si Fulan";
            
            // Kalkulasi Persentase
            const circleExpEl = document.getElementById('circle-exp-text');
            const circleExpText = circleExpEl ? circleExpEl.innerText.replace(/\./g, '') : "1";
            const circleExp = parseInt(circleExpText) || 1; 
            const userExp = window.totalExp || 0;
            let percent = (userExp / circleExp) * 100;
            if (percent > 100) percent = 100; // Cap di 100%
            
            // Render Foto User
            const avatarSrcEl = document.getElementById('avatar-initial');
            const targetAvatarUser = document.getElementById('rekap-avatar-user');
            if(targetAvatarUser) {
                if(avatarSrcEl && avatarSrcEl.querySelector('img')) {
                    targetAvatarUser.innerHTML = `<img src="${avatarSrcEl.querySelector('img').src}" class="w-full h-full object-cover">`;
                } else {
                    let seed = encodeURIComponent(userName);
                    targetAvatarUser.innerHTML = `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=10b981" class="w-full h-full object-cover">`;
                }
            }

            // Render Logo Circle
            const circleLogoSrcEl = document.getElementById('circle-logo-display');
            const targetAvatarCircle = document.getElementById('rekap-avatar-circle');
            if(targetAvatarCircle) {
                if(circleLogoSrcEl && circleLogoSrcEl.querySelector('img')) {
                    targetAvatarCircle.innerHTML = `<img src="${circleLogoSrcEl.querySelector('img').src}" class="w-full h-full object-cover rounded-[0.8rem]">`;
                } else {
                    let seed = encodeURIComponent(circleName);
                    targetAvatarCircle.innerHTML = `<img src="https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=064e3b" class="w-full h-full object-cover rounded-[0.8rem]">`;
                }
            }

            // Tentukan Badge Kasta & Quotes yang sesuai
            const terpilihBadge = badgesData.find(b => percent >= b.min) || badgesData[badgesData.length - 1];
            let quotePool = [];
            if (percent >= 75) quotePool = quotesData.tierS;
            else if (percent >= 50) quotePool = quotesData.tierA;
            else if (percent >= 25) quotePool = quotesData.tierB;
            else if (percent >= 10) quotePool = quotesData.tierC;
            else quotePool = quotesData.tierD;
            const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];

            // Pasangkan Teks ke HTML Modal (menggunakan try agar aman)
            if(document.getElementById('rekap-circle-name')) document.getElementById('rekap-circle-name').innerText = circleName;
            if(document.getElementById('rekap-user-name')) document.getElementById('rekap-user-name').innerText = userName;
            if(document.getElementById('rekap-gelar')) document.getElementById('rekap-gelar').innerText = terpilihBadge.name;
            if(document.getElementById('rekap-emoji')) document.getElementById('rekap-emoji').innerText = terpilihBadge.emoji;
            if(document.getElementById('rekap-desc')) document.getElementById('rekap-desc').innerText = `"${randomQuote}"`;
            
            // Animasi Buka Modal & Hitung Angka
            const modal = document.getElementById('rekap-circle-modal');
            const content = document.getElementById('rekap-circle-content');
            const bar = document.getElementById('rekap-bar');
            const pctText = document.getElementById('rekap-pct');
            
            if(modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            
            if(content) {
                content.classList.remove('scale-95');
                content.classList.add('animate-pop');
            }

            if(bar) bar.style.width = '0%';
            if(pctText) pctText.innerText = '0%';

            setTimeout(() => {
                if(bar) bar.style.width = percent + '%';
                
                let current = 0;
                const increment = percent / 40; 
                if (increment > 0) {
                    const interval = setInterval(() => {
                        current += increment;
                        if (current >= percent) {
                            if(pctText) pctText.innerText = percent.toFixed(1) + '%';
                            clearInterval(interval);
                        } else {
                            if(pctText) pctText.innerText = current.toFixed(1) + '%';
                        }
                    }, 25);
                } else {
                    if(pctText) pctText.innerText = "0%";
                }

                // Ledakan Confetti
                if (typeof confetti === 'function') {
                    confetti({ 
                        particleCount: 200, spread: 120, origin: { y: 0.5 }, 
                        colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b'], zIndex: 100
                    });
                }
            }, 400);
        });
    } else {
        // Jika masih tanggal 1 - 27 (Tombol Terkunci)
        btnRekap.addEventListener('click', () => {
            alert("Sabar ya! Laporan Rekap Circle hanya bisa dibuka setiap tanggal 28-31 di akhir bulan. Push terus kontribusimu!");
        });
    }
}

// Inisialisasi setelah DOM beres
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initRekapSystem, 1000);
});
