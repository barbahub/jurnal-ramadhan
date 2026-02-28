// Event Listener Tombol Generate Player Card (AURA AURA CARD)
const btnShare = document.getElementById('btn-share');

if(btnShare) {
    btnShare.addEventListener('click', async () => {
        btnShare.innerText = "⏳ Menarik Aura...";
        btnShare.disabled = true;
 
        try {
            // Ambil info dari window yang sudah di-set di player.js
            let info = window.calculateLevelInfo ? window.calculateLevelInfo(window.totalExp) : {level: 1};
            let overall = Math.min(99, Math.floor(info.level * 1.8) + 10); 
            
            // 1. Set Basic Info
            const cardOvr = document.getElementById('card-ovr');
            if(cardOvr) cardOvr.innerText = overall;

            const userNameEl = document.getElementById('user-name');
            const cardName = document.getElementById('card-name');
            if(cardName) cardName.innerText = userNameEl ? (userNameEl.value || 'PLAYER') : 'PLAYER';
            
            const cardTitle = document.getElementById('card-title');
            if(cardTitle) cardTitle.innerText = window.getTitle ? window.getTitle(info.level) : "NPC Duniawi";
            
            const cardExp = document.getElementById('card-exp');
            if(cardExp) cardExp.innerText = (window.totalExp || 0).toLocaleString('id-ID');
 
            // 1.5 Set Info Circle Dinamis
            const circleNameDisp = document.getElementById('circle-name-display');
            const circleLogoDisp = document.getElementById('circle-logo-display');
            if(window.userCircleId && circleNameDisp && circleNameDisp.innerText !== 'Memuat...') {
                document.getElementById('card-circle-name').innerText = circleNameDisp.innerText;
                if(circleLogoDisp.querySelector('img')) {
                    document.getElementById('card-circle-logo').innerHTML = `<img src="${circleLogoDisp.querySelector('img').src}" crossorigin="anonymous" class="w-8 h-8 rounded-md object-cover inline-block shadow-sm">`;
                } else {
                    document.getElementById('card-circle-logo').innerText = circleLogoDisp.innerText || "🛡️";
                }
            } else {
                const cardCircleName = document.getElementById('card-circle-name');
                const cardCircleLogo = document.getElementById('card-circle-logo');
                if(cardCircleName) cardCircleName.innerText = "Solo Player";
                if(cardCircleLogo) cardCircleLogo.innerText = "👤";
            }
 
            // 2. Set Foto Profil (Layout 50% Top)
            const avatarSrcEl = document.getElementById('avatar-initial');
            const cardAvatarDest = document.getElementById('card-avatar');
            if(avatarSrcEl && cardAvatarDest) {
                if(avatarSrcEl.querySelector('img')) {
                    cardAvatarDest.innerHTML = `<img src="${avatarSrcEl.querySelector('img').src}" crossorigin="anonymous" class="w-full h-full object-cover">`;
                } else { 
                    cardAvatarDest.innerHTML = avatarSrcEl.innerHTML; 
                }
            }
 
            // 3. Set 6 Atribut (Formula: Stat/2 + 20)
            const getStat = (val) => Math.min(99, Math.floor((val || 0) / 2) + 20);
            const radar = window.statsRadar || {};
            let stPusat = getStat(radar.pusat);
            let stAura = getStat(radar.aura);
            let stPeka = getStat(radar.peka);
            let stSigma = getStat(radar.sigma);
            let stDerma = getStat(radar.derma);
            let stStoic = getStat(radar.stoic);
 
            if(document.getElementById('stat-pusat')) document.getElementById('stat-pusat').innerText = stPusat;
            if(document.getElementById('stat-aura')) document.getElementById('stat-aura').innerText = stAura;
            if(document.getElementById('stat-peka')) document.getElementById('stat-peka').innerText = stPeka;
            if(document.getElementById('stat-sigma')) document.getElementById('stat-sigma').innerText = stSigma;
            if(document.getElementById('stat-derma')) document.getElementById('stat-derma').innerText = stDerma;
            if(document.getElementById('stat-stoic')) document.getElementById('stat-stoic').innerText = stStoic;
 
            // 4. Kalkulasi Aura Dominan
            const allStats = { 'Pusat': stPusat, 'Aura': stAura, 'Peka': stPeka, 'Sigma': stSigma, 'Derma': stDerma, 'Stoic': stStoic };
            const domName = Object.keys(allStats).reduce((a, b) => allStats[a] > allStats[b] ? a : b);
            const statEmojis = { 'Pusat': '🕋', 'Aura': '✨', 'Peka': '👼', 'Sigma': '🗿', 'Derma': '🤝', 'Stoic': '🧊' };
            
            const cardDomIcon = document.getElementById('card-dom-icon');
            const cardDomText = document.getElementById('card-dom-text');
            if(cardDomIcon) cardDomIcon.innerText = statEmojis[domName];
            if(cardDomText) cardDomText.innerText = domName;
 
            // 5. Cek Rank Global (Query ke Firebase untuk presisi)
            const rankBanner = document.getElementById('card-rank-banner');
            if(rankBanner) rankBanner.classList.add('hidden'); // Reset dulu
            
            if (window.auth && window.auth.currentUser && !window.auth.currentUser.isAnonymous) {
                try {
                    // Firebase di-load dari file module
                    if(window.getDocs && window.query && window.collection && window.db && window.where) {
                        const qRank = window.query(window.collection(window.db, "users"), window.where("monthly_exp", ">", window.totalExp));
                        const snapRank = await window.getDocs(qRank);
                        let actualRank = snapRank.size + 1; 
                        
                        if (actualRank <= 10 && window.totalExp > 0 && rankBanner) {
                            rankBanner.innerText = `GLOBAL RANK ${actualRank}`;
                            rankBanner.classList.remove('hidden');
                        }
                    }
                } catch(e) { console.warn("Rank fetch failed", e); }
            }
 
            // 6. Render Card
            const card = document.getElementById('export-card');
            if(card) {
                setTimeout(() => {
                    html2canvas(card, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = `AmalPad_AuraCard_${new Date().getTime()}.png`;
                        link.href = canvas.toDataURL('image/png'); link.click();
                        
                        btnShare.innerText = "🃏 Flex Prayer Card"; btnShare.disabled = false;
                        if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, colors: ['#a855f7', '#eab308'] });
                    }).catch(err => {
                        alert('Gagal render Card. Mungkin karena limitasi browser/CORS gambar.');
                        btnShare.innerText = "🃏 Flex Prayer Card"; btnShare.disabled = false;
                    });
                }, 800);
            }
 
        } catch (err) {
            console.error(err);
            btnShare.innerText = "🃏 Flex Prayer Card"; btnShare.disabled = false;
        }
    });
}
