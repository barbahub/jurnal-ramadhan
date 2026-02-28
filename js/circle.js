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
