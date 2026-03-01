import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInAnonymously, linkWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyDxabPizF0ShqaQSaJ142Rapxa9JcNq65o",
    authDomain: "amalin-app.firebaseapp.com",
    projectId: "amalin-app",
    storageBucket: "amalin-app.firebasestorage.app",
    messagingSenderId: "745183481034",
    appId: "1:745183481034:web:23b7ba95bf02c355c8f833"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const provider = new GoogleAuthProvider();

// Simpan objek penting ke global (berguna buat export-card.js dll)
window.auth = auth;
window.db = db;
window.getDocs = getDocs;
window.query = query;
window.collection = collection;
window.where = where;

const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const nameInputFire = document.getElementById('user-name');

window.userCircleId = null;
let circleOwnerId = null;

signInAnonymously(auth).catch((error) => console.warn("Guest Auth:", error));

window.buyItem = async function(id, price) {
    if (auth.currentUser?.isAnonymous) {
        alert("⚠️ Tautkan akun Google-mu dulu di tab Stats untuk mengamankan item yang dibeli!");
        if(window.switchTab) window.switchTab('profile'); 
        return;
    }
    if (window.totalKoin < price) { alert("Koin kamu kurang!"); return; }
    if (!confirm(`Yakin tukar ${price} koin?`)) return;
    
    window.totalKoin -= price; window.unlockedItems.push(id);
    localStorage.setItem('totalKoin', window.totalKoin); localStorage.setItem('unlockedItems', JSON.stringify(window.unlockedItems));
    const koinDisp = document.getElementById('koin-display');
    if(koinDisp) koinDisp.innerText = window.totalKoin; 
    if(window.renderShop) window.renderShop();
    
    if(window.syncPurchaseToFirebase) window.syncPurchaseToFirebase(id, price);
};

window.syncPurchaseToFirebase = async (itemId, priceVal) => {
    const user = auth.currentUser;
    if(!user || user.isAnonymous) return;
    try { await updateDoc(doc(db, "users", user.uid), { koin: increment(-priceVal), unlocked_items: arrayUnion(itemId) });
    } catch (e) { console.warn("Sync Tertunda"); }
};

// --- FUNGSI FETCH LEADERBOARD BARU ---
window.fetchLeaderboard = async function() {
    const lbContainer = document.getElementById('leaderboard-container');
    if(!lbContainer) return;
    if(!auth.currentUser || auth.currentUser.isAnonymous) {
        lbContainer.innerHTML = '<div class="text-center text-xs py-4 text-indigo-200">Tautkan akun Google di tab Profil untuk melihat Peringkat!</div>';
        return;
    }
    
    lbContainer.innerHTML = '<div class="text-center text-xs py-4 text-indigo-200 animate-pulse">Menarik data dari langit... 📡</div>';
    
    try {
        if (typeof window.currentLbTab === 'undefined' || window.currentLbTab === 'individu') {
            const qLeaderboard = query(collection(db, "users"), orderBy("monthly_exp", "desc"), limit(10));
            const snapshot = await getDocs(qLeaderboard);
            lbContainer.innerHTML = ''; let rank = 1;
            
            snapshot.forEach((docSnap) => {
                const userL = docSnap.data();
                if(userL.monthly_exp > 0) {
                    let colorClasses = rank === 1 ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400' : rank === 2 ? 'border-gray-300/30 bg-gray-300/10 text-gray-300' : rank === 3 ? 'border-orange-400/30 bg-orange-400/10 text-orange-300' : 'border-white/10 bg-white/5 text-gray-400';
                    const el = document.createElement('div');
                    
                    el.className = `flex items-center justify-between p-2 rounded-2xl border backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform ${colorClasses}`;
                    
                    let safeName = userL.name || 'User';
                    let safeInitial = safeName.charAt(0).toUpperCase();
                    let safeExp = userL.monthly_exp || 0;
                    
                    let photoHTML = userL.photo 
                        ? `<img src="${userL.photo}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentNode.innerText='${safeInitial}'">` 
                        : safeInitial;
                    
                    el.innerHTML = `
                        <div class="flex items-center gap-3">
                            <span class="font-black text-lg w-5 text-center">${rank}</span>
                            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">${photoHTML}</div>
                            <span class="font-bold text-sm text-white truncate max-w-[120px] hover:text-yellow-300 transition">${safeName}</span>
                        </div>
                        <span class="text-xs font-black bg-black/30 px-2 py-1 rounded-lg">${safeExp} EXP</span>`;
                    
                    el.onclick = () => window.showUserPopup(safeName, 'Top Global Ranker', safeInitial, safeExp);
                    lbContainer.appendChild(el); rank++;
                }
            });
            if(rank === 1) lbContainer.innerHTML = '<div class="text-center text-xs py-4 text-indigo-200">Belum ada yang aktif bulan ini. Curi start sekarang!</div>';
        } else {
            // TAB CIRCLE
            const qCircleRank = query(collection(db, "circles"), orderBy("total_exp", "desc"), limit(10));
            const snapshot = await getDocs(qCircleRank);
            lbContainer.innerHTML = ''; let rank = 1;
            
            snapshot.forEach((docSnap) => {
                const cData = docSnap.data();
                let colorClasses = rank === 1 ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400' : rank === 2 ? 'border-gray-300/30 bg-gray-300/10 text-gray-300' : rank === 3 ? 'border-orange-400/30 bg-orange-400/10 text-orange-300' : 'border-white/10 bg-white/5 text-blue-200';
                const el = document.createElement('div');
                el.className = `flex items-center justify-between p-2 rounded-2xl border backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform ${colorClasses}`;
                
                let safeCName = cData.name || 'Circle';
                let safeCExp = cData.total_exp || 0;
                let safeCLogo = cData.logo || '';
                let safeCMotto = cData.motto || '';
                let safeCMembers = Array.isArray(cData.members) ? cData.members.length : 1;

                el.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="font-black text-lg w-5 text-center">${rank}</span>
                        <div class="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg overflow-hidden shadow-inner">${safeCLogo ? `<img src="${safeCLogo}" class="w-full h-full object-cover">` : '🛡️'}</div>
                        <span class="font-bold text-sm truncate max-w-[120px] hover:text-white transition">${safeCName}</span>
                    </div>
                    <span class="text-[10px] font-black bg-black/30 px-2 py-1 rounded-lg">${safeCExp} EXP</span>`;
                
                el.onclick = () => window.showCirclePopup(safeCName, safeCExp, safeCLogo, safeCMotto, safeCMembers);
                lbContainer.appendChild(el); rank++;
            });
            if(rank === 1) lbContainer.innerHTML = '<div class="text-center text-xs py-4 text-indigo-200">Belum ada circle yang terbentuk. Buat yang pertama!</div>';
        }
    } catch (e) { 
        lbContainer.innerHTML = '<div class="text-center text-xs py-4 text-rose-300">Gagal memuat. Cek koneksi internetmu.</div>'; 
        console.error("Leaderboard error:", e);
    }
};

const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
if(btnRefreshLeaderboard) btnRefreshLeaderboard.addEventListener('click', window.fetchLeaderboard);

let syncTimeout = null; let pendingExpSync = 0;
window.syncExpToFirebase = (expVal) => {
    if(!auth.currentUser || auth.currentUser.isAnonymous) return;
    pendingExpSync += expVal;
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
        const finalExp = pendingExpSync; pendingExpSync = 0; 
        try { 
            await updateDoc(doc(db, "users", auth.currentUser.uid), { total_exp: increment(finalExp), monthly_exp: increment(finalExp) });
            if(window.userCircleId) { await updateDoc(doc(db, "circles", window.userCircleId), { total_exp: increment(finalExp) }); window.fetchCircleData(window.userCircleId); }
        } catch (e) { console.warn("Firebase sync limit reached, retrying later."); }
    }, 2000); 
};

window.syncProfileToFirebase = async () => {
    const user = auth.currentUser; if(!user || user.isAnonymous) return;
    try { await updateDoc(doc(db, "users", user.uid), { name: document.getElementById('user-name').value, bio: document.getElementById('user-bio').value, quote: document.getElementById('user-quote').value });
    } catch (e) { console.warn("Gagal simpan profil ke cloud"); }
};

// FIX: Tambahkan data Streak ke Cloud Firestore agar aman saat pindah device!
window.syncStatsToFirebase = async () => {
    const user = auth.currentUser; if(!user || user.isAnonymous) return;
    try { 
        await updateDoc(doc(db, "users", user.uid), { 
            statsRadar: window.statsRadar, 
            activityHistory: window.activityHistory,
            streakNum: parseInt(localStorage.getItem('streakNum') || 0),
            lastStreakClaim: localStorage.getItem('lastStreakClaim') || ''
        });
    } catch (e) { console.warn("Gagal simpan stats ke cloud"); }
};

const btnEditProfile = document.getElementById('btn-edit-profile');
if(btnEditProfile) {
    btnEditProfile.addEventListener('click', async () => {
        if(!auth.currentUser || auth.currentUser.isAnonymous) { alert("Tautkan akun Google-mu dulu sebelum mengedit profil public!"); return; }
        let newName = prompt("Masukkan Username Baru:", nameInputFire.value);
        if(newName && newName.trim() !== "") {
            let newPhoto = prompt("Masukkan Link URL Foto Profil Baru (Kosongkan jika tidak ingin ganti):");
            try {
                let updateData = { name: newName };
                if(newPhoto && newPhoto.trim() !== "") updateData.photo = newPhoto;
                await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
                nameInputFire.value = newName; document.getElementById('user-name').value = newName; localStorage.setItem('userName', newName);
                
                if(updateData.photo) { document.getElementById('avatar-initial').innerHTML = `<img src="${updateData.photo}" class="w-full h-full object-cover">`; } 
                else { document.getElementById('avatar-initial').innerText = newName.charAt(0).toUpperCase(); }
                alert("Profil berhasil di-update bos!");
            } catch (e) { alert("Gagal update profil: " + e.message); }
        }
    });
}

// Global Mission
const daftarMisiGlobal = [
    { title: "Kumpulkan 50.000 Rakaat Sholat Jamaah (Se-Indonesia)", target: 50000 },
    { title: "25.000 Sedekah Kolektif Terkumpul", target: 25000 },
    { title: "100.000 Lembar Al-Quran Dibaca Bersama", target: 100000 },
    { title: "5.000 Jam Bebas Sosmed (Kumulatif)", target: 5000 }
];
const tglRilisFB = new Date("2026-02-01T00:00:00"); 
const todayFB = new Date();
const selisihMingguGlobal = Math.floor(Math.max(0, todayFB - tglRilisFB) / (1000 * 60 * 60 * 24 * 7));
const misiSaatIni = daftarMisiGlobal[selisihMingguGlobal % daftarMisiGlobal.length];
const nomorMinggu = selisihMingguGlobal + 1; 

const globalMisiRef = doc(db, "global_stats", `misi_minggu_ke_${nomorMinggu}`);
window.fetchGlobalProgress = async function() {
    try {
        const docSnap = await getDoc(globalMisiRef);
        let current = 0; if (docSnap.exists()) current = docSnap.data().current_count || 0;
        
        const target = misiSaatIni.target;
        let percent = (current / target) * 100; if (percent > 100) percent = 100;

        document.getElementById('global-progress-text').innerText = `${current.toLocaleString('id-ID')} / ${target.toLocaleString('id-ID')}`;
        document.getElementById('global-progress-percent').innerText = `${Math.floor(percent)}%`;
        document.getElementById('global-progress-bar').style.width = `${percent}%`;
        
        if (current >= target) {
            document.getElementById('global-progress-text').innerText = "🎉 TARGET TERCAPAI!";
            document.getElementById('global-progress-bar').classList.add('from-emerald-400', 'to-emerald-300');
            document.getElementById('global-progress-bar').classList.remove('from-yellow-400', 'to-yellow-300');
        }
    } catch (e) {}
};

window.addPendingGlobalMission = async (poin) => {
    if(!auth.currentUser || auth.currentUser.isAnonymous) return;
    document.getElementById('sync-status').innerText = "Menyumbang poin ke pusat... 📡";
    try {
        await setDoc(globalMisiRef, { current_count: increment(poin), target_count: misiSaatIni.target, nama_misi: misiSaatIni.title }, { merge: true });
        document.getElementById('sync-status').innerText = "✅ Tersinkronisasi!"; window.fetchGlobalProgress();
    } catch(e) { document.getElementById('sync-status').innerText = "❌ Gagal jaringan. Cek koneksi."; }
};

// Guild (Circle) System
const unjoinedUI = document.getElementById('circle-unjoined');
const joinedUI = document.getElementById('circle-joined');

const circleMembersDisplay = document.getElementById('circle-members-display');
if(circleMembersDisplay) circleMembersDisplay.addEventListener('click', () => { document.getElementById('circle-members-modal').classList.toggle('hidden'); });

const circleCoopQuests = [
    { id: "cq1", title: "Dzikir Smart Tasbih Massal", target: 50000, type: "tasbih" },
    { id: "cq2", title: "Rakaat Sholat Berjamaah", target: 5000, type: "sholat" },
    { id: "cq3", title: "Koin Sedekah Guild", target: 100000, type: "koin" }
];

window.fetchCircleData = async (circleId) => {
    if(!circleId) { if(unjoinedUI) unjoinedUI.classList.remove('hidden'); if(joinedUI) joinedUI.classList.add('hidden'); return; }
    try {
        const snap = await getDoc(doc(db, "circles", circleId));
        if(snap.exists()) {
            const data = snap.data();
            unjoinedUI.classList.add('hidden'); joinedUI.classList.remove('hidden');
            document.getElementById('circle-name-display').innerText = data.name;
            document.getElementById('circle-code-display').innerText = data.invite_code;
            document.getElementById('circle-members-display').innerText = `${data.members.length}/10 Anggota (Lihat)`;
            
            document.getElementById('circle-motto-display').innerText = data.motto ? `"${data.motto}"` : '"Solidaritas Jalur Langit"';
            if(data.logo) { document.getElementById('circle-logo-display').innerHTML = `<img src="${data.logo}" class="w-full h-full object-cover">`; } 
            else { document.getElementById('circle-logo-display').innerText = "🛡️"; }
            
            circleOwnerId = data.created_by; 

            let cExp = data.total_exp || 0; let cLvl = 1;
            while(cExp >= window.getGuildExpRequirement(cLvl)) { cLvl++; }
            let cExpCurrent = cExp - window.getGuildExpRequirement(cLvl - 1);
            let cExpNeed = window.getGuildExpRequirement(cLvl) - window.getGuildExpRequirement(cLvl - 1);
            
            document.getElementById('circle-level-display').innerText = `Lv. ${cLvl}`;
            document.getElementById('circle-exp-text').innerText = cExp.toLocaleString('id-ID');
            document.getElementById('circle-exp-target').innerText = window.getGuildExpRequirement(cLvl).toLocaleString('id-ID');
            document.getElementById('circle-exp-bar').style.width = `${(cExpCurrent / cExpNeed) * 100}%`;

            if(auth.currentUser?.uid === circleOwnerId) { document.getElementById('btn-edit-circle').classList.remove('hidden'); }

            let cqProgress = data.coop_progress || {};
            let cqHtml = '';
            circleCoopQuests.forEach(cq => {
                let prog = cqProgress[cq.id] || 0; let pct = Math.min(100, (prog / cq.target) * 100);
                cqHtml += `
                    <div class="bg-black/30 p-2 rounded-lg mb-2">
                        <div class="flex justify-between text-[10px] text-white font-bold mb-1">
                            <span>${cq.title}</span> <span>${prog.toLocaleString()}/${cq.target.toLocaleString()}</span>
                        </div>
                        <div class="w-full bg-black/50 rounded-full h-1.5 mb-1.5"><div class="bg-blue-400 h-1.5 rounded-full" style="width: ${pct}%"></div></div>
                        <button onclick="window.contributeCircleQuest('${cq.id}')" class="text-[9px] bg-white/20 hover:bg-white/30 text-white w-full py-1 rounded">⚔️ Sumbang Progres</button>
                    </div>
                `;
            });
            document.getElementById('circle-quests-container').innerHTML = cqHtml;

            const memberListDiv = document.getElementById('circle-members-list');
            memberListDiv.innerHTML = '<span class="text-[10px] text-blue-200 animate-pulse">Memuat anggota...</span>';
            
            let memberHtml = '';
            for (let uid of data.members) {
                let isMe = (uid === auth.currentUser?.uid); let isOwner = (uid === circleOwnerId);
                let userSnap = await getDoc(doc(db, "users", uid));
                let uname = userSnap.exists() ? userSnap.data().name : "User Misterius";
                let kickBtn = '';
                if (auth.currentUser?.uid === circleOwnerId && !isOwner) { kickBtn = `<button onclick="window.kickMember('${uid}')" class="text-[8px] bg-red-500/80 px-1.5 rounded text-white hover:bg-red-600">Kick</button>`; }
                memberHtml += `<div class="flex justify-between items-center bg-black/20 p-1.5 rounded-lg"><span class="text-[11px] text-white font-medium flex items-center gap-1">${isOwner ? '👑' : '👤'} ${uname} ${isMe ? '(Kamu)' : ''}</span>${kickBtn}</div>`;
            }
            memberListDiv.innerHTML = memberHtml;
        }
    } catch(e) { console.error("Error Circle:", e); }
};

window.contributeCircleQuest = async function(qId) {
    let amount = parseInt(prompt("Berapa banyak jumlah yang mau disumbangkan dari usahamu hari ini? (Hati-hati, sumbangan palsu dosanya ditanggung sendiri 🗿):", "10"));
    if(!amount || isNaN(amount) || amount <= 0) return;
    try {
        const circleRef = doc(db, "circles", window.userCircleId);
        await updateDoc(circleRef, { [`coop_progress.${qId}`]: increment(amount), total_exp: increment(amount * 2) });
        alert("Sumbangan berhasil masuk ke Circle! (+Bonus EXP Guild)");
        window.fetchCircleData(window.userCircleId);
    } catch(e) { alert("Gagal menyumbang: " + e.message); }
}

const btnEditCircle = document.getElementById('btn-edit-circle');
if(btnEditCircle) {
    btnEditCircle.addEventListener('click', async () => {
        let newLogo = prompt("Masukkan URL Logo Circle (Kosongkan jika tak ingin ubah):");
        let newMotto = prompt("Masukkan Motto Circle:");
        if(newLogo || newMotto) {
            let updates = {}; if(newLogo) updates.logo = newLogo; if(newMotto) updates.motto = newMotto;
            try {
                await updateDoc(doc(db, "circles", window.userCircleId), updates);
                window.fetchCircleData(window.userCircleId);
                alert("Berhasil mengupdate identitas Circle!");
            } catch(e) { alert("Gagal: " + e.message); }
        }
    });
}

window.kickMember = async (targetUid) => {
    if(!confirm("Tendang member ini dari Circle?")) return;
    try {
        const circleRef = doc(db, "circles", window.userCircleId);
        const circleSnap = await getDoc(circleRef);
        let currentMembers = circleSnap.data().members;
        let newMembers = currentMembers.filter(id => id !== targetUid);
        await updateDoc(circleRef, { members: newMembers });
        await updateDoc(doc(db, "users", targetUid), { circle_id: null });
        alert("Member berhasil di-kick!"); window.fetchCircleData(window.userCircleId);
    } catch(e) { alert("Error kick: " + e.message); }
};

const btnLeaveCircle = document.getElementById('btn-leave-circle');
if(btnLeaveCircle) {
    btnLeaveCircle.addEventListener('click', async () => {
        if(!confirm("Yakin ingin keluar dari Circle ini? EXP yang sudah disumbangkan tidak bisa ditarik lho!")) return;
        try {
            const circleRef = doc(db, "circles", window.userCircleId);
            const circleSnap = await getDoc(circleRef);
            let currentMembers = circleSnap.data().members;
            let newMembers = currentMembers.filter(id => id !== auth.currentUser.uid);
            await updateDoc(circleRef, { members: newMembers });
            await updateDoc(doc(db, "users", auth.currentUser.uid), { circle_id: null });
            window.userCircleId = null; alert("Berhasil keluar dari Circle."); window.fetchCircleData(null);
        } catch(e) { alert("Error: " + e.message); }
    });
}

const btnCreateCircle = document.getElementById('btn-create-circle');
if(btnCreateCircle) {
    btnCreateCircle.addEventListener('click', async () => {
        if(!auth.currentUser || auth.currentUser.isAnonymous) return alert("⚠️ Tautkan akun Google-mu dulu di tab Stats untuk buat Circle!");
        let userLevel = Math.floor(window.totalExp / 100) + 1;
        // FIX: Gunakan streakNum agar konsisten
        let userStreak = parseInt(localStorage.getItem('streakNum') || 0);
        
        if (userLevel < 5) return alert("Sabar Bos! Minimal Level 5 buat jadi Ketua Circle. Grinding EXP dulu ya.");
        if (userStreak < 3) return alert("Imam harus istiqomah! Buktikan Streak 🔥 3 hari berturut-turut dulu.");
        if (window.totalKoin < 500) return alert("Saldo koin kurang! Butuh 500 Koin untuk mahar bangun markas Circle.");

        const circleName = prompt("Masukkan Nama Circle (Misal: Pejuang Subuh Jaksel):");
        if(!circleName) return;
        
        window.totalKoin -= 500; localStorage.setItem('totalKoin', window.totalKoin);
        document.getElementById('koin-display').innerText = window.totalKoin;

        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newCircleId = `circle_${Date.now()}`;
        
        try {
            await setDoc(doc(db, "circles", newCircleId), { name: circleName, invite_code: inviteCode, members: [auth.currentUser.uid], total_exp: 0, created_by: auth.currentUser.uid });
            await updateDoc(doc(db, "users", auth.currentUser.uid), { circle_id: newCircleId });
            window.userCircleId = newCircleId;
            alert(`Berhasil! Circle "${circleName}" aktif. Saldo terpotong 500 Koin.\nKode Invite: ${inviteCode}\nBagikan kode ini ke temanmu!`);
            window.fetchCircleData(newCircleId);
            if(window.pushToLiveFeed) window.pushToLiveFeed(circleName, 'Markas baru telah didirikan!', 'circle_update');
        } catch(e) { alert("Gagal: " + e.message); }
    });
}

const btnJoinCircle = document.getElementById('btn-join-circle');
if(btnJoinCircle) {
    btnJoinCircle.addEventListener('click', async () => {
        if(!auth.currentUser || auth.currentUser.isAnonymous) return alert("⚠️ Tautkan akun Google-mu dulu di tab Stats sebelum gabung Circle!");
        const code = prompt("Masukkan Kode Invite (6 Huruf/Angka):");
        if(!code) return;

        try {
            const q = query(collection(db, "circles"), where("invite_code", "==", code.toUpperCase()));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty) return alert("Waduh, Circle tidak ditemukan! Cek lagi kodenya.");
         
            let foundCircleId = null, circleData = null;
            querySnapshot.forEach((doc) => { foundCircleId = doc.id; circleData = doc.data(); });
         
            if(circleData.members.length >= 10) return alert("Circle ini sudah penuh (Max 10)!");
            if(circleData.members.includes(auth.currentUser.uid)) return alert("Kamu sudah gabung di sini!");
         
            await updateDoc(doc(db, "circles", foundCircleId), { members: arrayUnion(auth.currentUser.uid) });
            await updateDoc(doc(db, "users", auth.currentUser.uid), { circle_id: foundCircleId });
            window.userCircleId = foundCircleId;
            alert(`Mantap! Berhasil gabung ke Circle "${circleData.name}"!`);
            window.fetchCircleData(foundCircleId);
        } catch(e) { alert("Gagal gabung: " + e.message); }
    });
}

// Notifications
const btnEnableNotif = document.getElementById('btn-enable-notif');
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: 'GANTI_DENGAN_VAPID_KEY_FIREBASE_KAMU' });
            if (token) {
                if(auth.currentUser && !auth.currentUser.isAnonymous) { await updateDoc(doc(db, "users", auth.currentUser.uid), { fcmToken: token }); }
                btnEnableNotif.classList.add('hidden'); alert("Alhamdulillah, Pengingat Ibadah diaktifkan!");
            }
        } else { alert("Akses notifikasi ditolak."); }
    } catch (error) { console.warn("Error Notifikasi:", error); }
}

if(btnEnableNotif) {
    btnEnableNotif.addEventListener('click', () => {
        if(confirm("🔔 Aktifkan Pengingat Ibadah?\n\nKlik OK untuk menerima notifikasi pengingat harian agar kamu tidak ketinggalan misi kebaikan!")) {
            requestNotificationPermission();
        }
    });
}

onMessage(messaging, (payload) => { alert(`Pesan Baru: ${payload.notification.title}\n${payload.notification.body}`); });

// Auth Logic
if(btnLogin) {
    btnLogin.addEventListener('click', async () => {
        try {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                await linkWithPopup(auth.currentUser, provider); alert("Mantap! Akun berhasil diamankan permanen ke Cloud Google!");
            } else { await signInWithPopup(auth, provider); }
        } catch (e) { 
            if(e.code === 'auth/credential-already-in-use') alert("Akun Google ini sudah terdaftar. Pakai akun lain ya bos.");
            else alert(e.message); 
        }
    });
}
if(btnLogout) btnLogout.addEventListener('click', async () => { await signOut(auth); });

const btnAdminReset = document.getElementById('btn-admin-reset');

onAuthStateChanged(auth, async (user) => {
    if (user && !user.isAnonymous) {
        if(btnLogin) btnLogin.classList.add('hidden'); 
        if(btnLogout) btnLogout.classList.remove('hidden');
        if(user.uid === "UID_ADMIN_KAMU_DISINI" && btnAdminReset) { btnAdminReset.classList.remove('hidden'); btnAdminReset.classList.add('block'); }
        if(Notification.permission !== 'granted' && btnEnableNotif) btnEnableNotif.classList.remove('hidden');

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        const currentMonthStr = `${window.today.getMonth() + 1}-${window.today.getFullYear()}`;
     
        const gmt = document.getElementById('global-mission-title');
        if(gmt) gmt.innerText = misiSaatIni.title;
     
        if (!docSnap.exists()) {
            let defaultName = user.displayName || "User";
            await setDoc(userRef, {
                name: defaultName, photo: user.photoURL || "",
                koin: window.totalKoin, total_exp: window.totalExp,
                monthly_exp: window.totalExp, unlocked_items: window.unlockedItems,
                statsRadar: window.statsRadar, activityHistory: window.activityHistory,
                streakNum: parseInt(localStorage.getItem('streakNum') || 0), // FIX: Simpan streak user baru
                lastStreakClaim: localStorage.getItem('lastStreakClaim') || '', // FIX: Simpan status klaim
                circle_id: null, last_reset_month: currentMonthStr 
            }, { merge: true });
            if(nameInputFire) nameInputFire.value = defaultName; 
            localStorage.setItem('userName', defaultName);
            if(user.photoURL) { document.getElementById('avatar-initial').innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover">`; }
        } else {
            const data = docSnap.data();
            let customName = data.name || user.displayName || "User";
            if(nameInputFire) nameInputFire.value = customName; 
            localStorage.setItem('userName', customName);
            
            if (data.photo && data.photo.trim() !== "") {
                document.getElementById('avatar-initial').innerHTML = `<img src="${data.photo}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentNode.innerText='${customName.charAt(0).toUpperCase()}'">`;
            } else { document.getElementById('avatar-initial').innerText = customName.charAt(0).toUpperCase(); }
            
            window.totalExp = data.total_exp || window.totalExp; window.totalKoin = data.koin || window.totalKoin;
            localStorage.setItem('totalExp', window.totalExp); localStorage.setItem('totalKoin', window.totalKoin);
            
            const koinDisp = document.getElementById('koin-display');
            if(koinDisp) koinDisp.innerText = window.totalKoin;
            if(typeof window.updateStatsUI === 'function') window.updateStatsUI();

            // FIX: Load Streak Data dari Cloud ke LocalStorage agar tersimpan saat ganti device
            if (data.streakNum !== undefined) {
                window.streakNum = data.streakNum;
                localStorage.setItem('streakNum', data.streakNum);
                if (data.lastStreakClaim) localStorage.setItem('lastStreakClaim', data.lastStreakClaim);
                if (window.initStreakSystem) window.initStreakSystem(); // Render ulang tombol claim
                
                const streakDisplay = document.getElementById('streak-display');
                if(streakDisplay && data.streakNum > 0) streakDisplay.innerText = `🔥 ${data.streakNum}`;
            }
            
            if(data.statsRadar) {
                let localTotal = Object.values(window.statsRadar).reduce((a, b) => a + b, 0);
                let cloudTotal = Object.values(data.statsRadar).reduce((a, b) => a + b, 0);
                
                if(cloudTotal >= localTotal) {
                    window.statsRadar = data.statsRadar; 
                    localStorage.setItem('statsRadar', JSON.stringify(data.statsRadar));
                } else {
                    window.syncStatsToFirebase(); 
                }
                if(window.renderCharts) window.renderCharts();
                if(window.updateBadges) window.updateBadges();
            }
            
            if(data.activityHistory) {
                if(data.activityHistory.length >= window.activityHistory.length) {
                    window.activityHistory = data.activityHistory; 
                    localStorage.setItem('activityHistory', JSON.stringify(data.activityHistory));
                }
                if(window.updateHeatmap) window.updateHeatmap();
            }

            if(data.last_reset_month !== currentMonthStr) {
                await updateDoc(userRef, { monthly_exp: 0, last_reset_month: currentMonthStr });
                alert("Bulan Baru, Lembaran Baru! Peringkat Global direset untuk memberikan kesempatan yang sama buat semua player.");
            }

            if(data.circle_id) { window.userCircleId = data.circle_id; window.fetchCircleData(window.userCircleId); }
        }
     
        if(nameInputFire) nameInputFire.readOnly = true; 
        window.fetchLeaderboard(); window.fetchGlobalProgress();
    } else {
        if(btnLogin) btnLogin.classList.remove('hidden'); 
        if(btnLogout) btnLogout.classList.add('hidden');
        if(btnAdminReset) btnAdminReset.classList.add('hidden'); 
        if(btnEnableNotif) btnEnableNotif.classList.add('hidden');
        if(nameInputFire) nameInputFire.readOnly = false; 
        window.userCircleId = null; window.fetchCircleData(null);
     
        if(window.renderCharts) window.renderCharts();
        if(window.updateBadges) window.updateBadges();

        const gmt = document.getElementById('global-mission-title');
        if(gmt) gmt.innerText = misiSaatIni.title;
        window.fetchLeaderboard(); window.fetchGlobalProgress();
    }
});

// --- LOGIKA UI/UX TABS LEADERBOARD ---
window.currentLbTab = 'individu'; 
const tabLbIndividu = document.getElementById('tab-lb-individu');
const tabLbCircle = document.getElementById('tab-lb-circle');

if(tabLbIndividu && tabLbCircle) {
    tabLbIndividu.addEventListener('click', () => {
        window.currentLbTab = 'individu';
        tabLbIndividu.className = "flex-1 text-xs font-bold py-1.5 rounded-lg bg-white/20 text-white shadow-sm transition";
        tabLbCircle.className = "flex-1 text-xs font-bold py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition";
        window.fetchLeaderboard();
    });

    tabLbCircle.addEventListener('click', () => {
        window.currentLbTab = 'circle';
        tabLbCircle.className = "flex-1 text-xs font-bold py-1.5 rounded-lg bg-white/20 text-white shadow-sm transition";
        tabLbIndividu.className = "flex-1 text-xs font-bold py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition";
        window.fetchLeaderboard();
    });
}
