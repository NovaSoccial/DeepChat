import telebot
import requests
import uuid
from datetime import datetime

# Yapılandırma
TOKEN = "8216293009:AAFaVEicQN5lhaM-Hk43mYCptwOV14_bvLQ"
FIREBASE_URL = "https://deepchat-d84d7-default-rtdb.firebaseio.com/"

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    welcome_text = (
        "🛡️ *DeepChat Sentinel v5.0 Protokolü Aktif*\n\n"
        "Sisteme kayıt olabilmek için lütfen numaranızı giriniz.\n"
        "_(Örnek: 5051234567)_"
    )
    bot.reply_to(message, welcome_text, parse_mode='Markdown')

@bot.message_handler(regexp=r"^[5]\d{9}$")
def handle_registration(message):
    chat_id = str(message.chat.id)
    phone_number = message.text
    
    # 16 Haneli Benzersiz Master Key Üretimi
    raw_key = uuid.uuid4().hex.upper()
    master_key = f"DC-{raw_key[:16]}"
    
    # Firebase Veri Yapısı
    user_data = {
        "phone": phone_number,
        "masterKey": master_key,
        "status": "active",
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    }
    
    try:
        # Firebase'e PUT isteği (Kullanıcı ID'sine göre kaydeder)
        response = requests.put(
            f"{FIREBASE_URL}users/{chat_id}.json", 
            json=user_data
        )
        
        if response.status_code == 200:
            success_text = (
                "✅ *Kimlik Doğrulama Başarılı!*\n\n"
                f"🔑 *Master Key:* `{master_key}`\n\n"
                "⚠️ *ÖNEMLİ:* Bu anahtar sadece size özeldir, güvenli bir yerde saklayınız."
            )
            bot.reply_to(message, success_text, parse_mode='Markdown')
        else:
            bot.reply_to(message, "❌ Sistem hatası oluştu. Lütfen sonra tekrar deneyin.")
            
    except Exception as e:
        print(f"Hata: {e}")
        bot.reply_to(message, "⚠️ Veritabanı bağlantısı kurulamadı.")

print("🚀 DeepChat Botu GitHub/Render üzerinden çalışmaya hazır...")
bot.infinity_polling()
