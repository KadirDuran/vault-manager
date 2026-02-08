# Vault Manager Kurulum Rehberi

Bu rehber, Vault Manager projesini sıfırdan kurmanıza ve çalıştırmanıza yardımcı olacaktır.

## Ön Gereksinimler

*   **Docker & Docker Compose**: Uygulamanın en kolay kurulum yöntemi Docker kullanmaktır.
*   **Git**: Projeyi indirmek için.
*   *(Opsiyonel)* **Node.js 18+**: Frontend geliştirmesi yapmak isterseniz.
*   *(Opsiyonel)* **Python 3.11+**: Backend geliştirmesi yapmak isterseniz.

---

## Hızlı Kurulum (Prodüksiyon / Docker)

Bu yöntem, uygulamayı sunucuda veya kendi bilgisayarınızda tek komutla çalıştırmak için en uygun yöntemdir.

### 1. Projeyi İndirin
Terminal veya Komut İstemi'ni (CMD/PowerShell) açın ve şu komutu yazın:
```bash
git clone https://github.com/KadirDuran/vault-manager.git
cd vault-manager
```

### 2. Ayarları Yapılandırın
Sizin için hazırladığımız otomatik kurulum aracını çalıştırın:

**Windows (PowerShell):**
```powershell
.\deploy\setup_prod.ps1
```

Bu araç size şu soruları soracaktır:
1.  **Docker Kullanıcı Adınız:** (Docker Hub kullanmıyorsanız boş geçebilirsiniz)
2.  **Veritabanı Seçimi:**
    *   `1`: Kendi içinde yeni bir veritabanı kurar (Kolay Yöntem).
    *   `2`: Mevcut bir Postgres sunucusuna bağlanır (Gelişmiş).

Seçim yaptıktan sonra otomatik olarak `.env` dosyası oluşturulacaktır.

### 3. Uygulamayı Başlatın
Kurulum aracının size verdiği komutu çalıştırın. Genellikle şöyledir:

**Harici Veritabanı ile:**
```bash
docker-compose up -d
```

**Dahili Veritabanı ile:**
```bash
docker-compose --profile local-db up -d
```

### 4. Erişim
Tarayıcınızı açın:
*   **Web Arayüzü:** [http://localhost:3000](http://localhost:3000)
*   **API Dokümantasyonu:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Geliştirici Kurulumu (Local Development)

Projeyi geliştirmek (kod değiştirmek) istiyorsanız bu adımları izleyin.

### Backend Kurulumu

1.  Klasöre girin:
    ```bash
    cd backend
    ```
2.  Sanal ortam oluşturun ve aktif edin:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Kütüphaneleri yükleyin:
    ```bash
    pip install -r requirements.txt
    ```
4.  `.env` dosyasını oluşturun (`.env.example`'dan kopyalayın) ve veritabanı ayarlarını yapın.
5.  Sunucusu başlatın:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Kurulumu

1.  Klasöre girin:
    ```bash
    cd frontend
    ```
2.  Paketleri yükleyin:
    ```bash
    npm install
    ```
3.  Başlatın:
    ```bash
    npm start
    ```

---

## Sorun Giderme

**Hata:** `database connection` hatası alıyorum.
**Çözüm:** Veritabanı bilgilerinizin `.env` dosyasında doğru olduğundan emin olun. Eğer harici veritabanı kullanıyorsanız, `pg_hba.conf` ayarlarının dış erişime açık olduğunu kontrol edin.

**Hata:** `docker pull` hatası.
**Çözüm:** İnternet bağlantınızı kontrol edin ve Docker Desktop uygulamasının açık olduğundan emin olun.
