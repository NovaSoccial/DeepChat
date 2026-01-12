import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBA1H0C7y4Cbt2ZUBtGRnvu-HgPv8F-iog", 
    authDomain: "novasoccial.firebaseapp.com",
    projectId: "novasoccial",
    storageBucket: "novasoccial.firebasestorage.app",
    messagingSenderId: "680106218526",
    appId: "1:680106218526:web:0edcdbe46ff1c84582ca0f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });

// 1. TÜRKİYE FİLTRELİ GİRİŞ
window.login = async () => {
    const phone = document.getElementById('phoneInput').value;
    if (!phone.startsWith("+90")) {
        alert("Sadece Türkiye numaraları kabul edilmektedir!");
        return;
    }

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        const code = prompt("SMS Kodunu Girin:");
        if (code) {
            const result = await confirmationResult.confirm(code);
            // Kayıt Logu (Admin Paneli İçin) [cite: 2026-01-11]
            await setDoc(doc(db, "users", result.user.uid), {
                phone: result.user.phoneNumber,
                joined: serverTimestamp()
            });
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('main-screen').style.display = 'flex';
        }
    } catch (err) { alert("Hata: " + err.message); }
};

// 2. SEKME DEĞİŞTİRME MANTIĞI
window.switchTab = (tabName) => {
    const tabs = ['sohbetler', 'durumlar', 'kanallar', 'aramalar'];
    tabs.forEach(t => {
        document.getElementById('tab-' + t).style.display = 'none';
    });
    document.getElementById('tab-' + tabName).style.display = 'block';

    // FAB İkonunu Değiştir
    const fabIcon = document.getElementById('fab-icon');
    if(tabName === 'sohbetler') fabIcon.innerText = "💬";
    else if(tabName === 'durumlar') fabIcon.innerText = "📷";
    else if(tabName === 'aramalar') fabIcon.innerText = "📞";
};

// 3. FAB BUTONU AKSİYONU (Grup Kurma / Rehber)
window.handleFabAction = () => {
    const currentTab = document.querySelector('.nav-item.active span').innerText;
    alert(currentTab + " için işlem başlatılıyor... Rehber taranıyor.");
};