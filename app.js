import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Firebase Yapılandırman
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

// 2. Robot Kontrolü (Görünmez Recaptcha)
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    'size': 'invisible'
});

// 3. SMS KODU GÖNDERME
window.login = async () => {
    const phoneNumber = document.getElementById('phoneInput').value; // Örn: +90530...
    const appVerifier = window.recaptchaVerifier;

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        
        // Numara girişini gizle, kod girişini göster
        const code = prompt("Telefonuna gelen 6 haneli SMS kodunu gir:");
        if (code) {
            verifyCode(code);
        }
    } catch (error) {
        console.error("SMS Gönderilemedi:", error);
        alert("Hata: " + error.message);
    }
};

// 4. KODU DOĞRULAMA VE GİRİŞ
async function verifyCode(code) {
    try {
        const result = await window.confirmationResult.confirm(code);
        const user = result.user;
        console.log("Giriş Başarılı!", user.uid);
        
        // Arayüzü Değiştir
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('main-chat').style.display = 'flex';
        
        initChat(); // Mesajları yükle
    } catch (error) {
        alert("Kod hatalı veya süresi dolmuş!");
    }
}

// 5. ŞİFRELİ MESAJ GÖNDERME
window.sendMessage = async () => {
    const input = document.getElementById('msgInput');
    const DEEP_KEY = "Deep_Secure_Key_2026"; // Gizli şifreleme anahtarı

    if(input.value) {
        // Arka planda şifrele (DeepChat Zırhı)
        const encrypted = CryptoJS.AES.encrypt(input.value, DEEP_KEY).toString();

        await addDoc(collection(db, "deep_messages"), {
            text: encrypted,
            sender: auth.currentUser.phoneNumber,
            timestamp: serverTimestamp()
        });
        input.value = "";
    }
};

// 6. MESAJLARI ANLIK DİNLEME
function initChat() {
    const q = query(collection(db, "deep_messages"), orderBy("timestamp"));
    onSnapshot(q, (snapshot) => {
        const display = document.getElementById('messages');
        display.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const DEEP_KEY = "Deep_Secure_Key_2026";
            
            // Şifreyi sadece senin telefonun çözer
            const bytes = CryptoJS.AES.decrypt(msg.text, DEEP_KEY);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);

            const div = document.createElement('div');
            div.className = msg.sender === auth.currentUser.phoneNumber ? 'msg sent' : 'msg received';
            div.innerText = originalText;
            display.appendChild(div);
        });
        display.scrollTop = display.scrollHeight;
    });
}
