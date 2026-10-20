# 🌸 INTERACTIVE FLOWER GIFT – 20/10

Một website nghệ thuật tương tác lãng mạn, tinh tế và giàu cảm xúc dành tặng ngày Phụ nữ Việt Nam 20/10.

Trang web đưa người xem qua 3 giai đoạn chuyển tiếp mượt mà (Cinematic Transitions):
1. **Bó hoa hồng giữa trời sao:** Bó hoa hồng bay lơ lửng giữa hàng trăm vì sao lấp lánh và cánh bướm chao nghiêng.
2. **Kỷ niệm ngọt ngào:** Chạm vào bó hoa, nhạc nền lãng mạn du dương vang lên với hiệu ứng fade-in êm ái, những bức ảnh Polaroid kỷ niệm lần lượt trồi lên từ trong bó hoa.
3. **Vũ trụ lời chúc 3D:** Nhấn giữ 800ms vào bó hoa để kích hoạt hiệu ứng camera bay xuyên không gian vào bầu trời 3D vô tận, nơi những câu chúc neon hồng, ảnh kỷ niệm và trái tim phát sáng trôi nổi theo chiều sâu.

---

## 📂 Cấu trúc thư mục

```text
Chuc20-10/
│
├── index.html                  # File HTML chính của website
│
├── css/
│   ├── style.css               # Phong cách Romantic Luxury, layout & màu sắc
│   ├── animations.css          # Hiệu ứng keyframes chuyển động & zoom cinematic
│   └── responsive.css          # Tối ưu hóa hiển thị Mobile, Tablet & Desktop
│
├── js/
│   ├── main.js                 # Điều phối khởi động ứng dụng & chuyển cảnh
│   ├── bouquet.js              # Xử lý tương tác bó hoa & thao tác nhấn giữ 800ms
│   ├── gallery.js              # Quản lý & hiệu ứng ảnh Polaroid trồi lên từ hoa
│   ├── wishes.js               # Đọc và xử lý danh sách lời chúc từ file TXT
│   ├── particles.js            # Bầu trời sao Canvas 2D & bụi sáng champagne
│   ├── audio.js                # Quản lý nhạc nền, fade-in & bộ tổng hợp âm thanh dự phòng
│   └── universe.js             # Vũ trụ 3D, camera bay vô tận & tương tác parallax
│
├── assets/
│   ├── bouquet.png             # Hình ảnh bó hoa hồng (nền trong suốt)
│   ├── bouquet_front.png       # Lớp nơ và nếp gấp phía trước bó hoa
│   ├── butterfly.png           # Cánh bướm bay lượn
│   ├── photos/                 # Thư mục chứa ảnh cá nhân (JPG, PNG, WebP)
│   │   ├── photo-01.jpg
│   │   ├── photo-02.jpg
│   │   └── ...
│   └── music/
│       └── background.mp3      # Nhạc nền lãng mạn
│
├── data/
│   ├── wishes.txt              # Danh sách câu chúc (mỗi dòng 1 câu)
│   └── photos.json             # Danh sách tên các file ảnh
│
└── README.md
```

---

## 💖 Hướng dẫn tùy biến nội dung (Không cần sửa mã nguồn JS)

### 1. Thêm ảnh cá nhân
- Chuẩn bị các bức ảnh của bạn (khuyên dùng định dạng `.jpg`, `.png`, hoặc `.webp`).
- Copy các file ảnh vào thư mục `assets/photos/`.

### 2. Cập nhật danh sách ảnh (`data/photos.json`)
- Mở file `data/photos.json` và cập nhật tên các file ảnh tương ứng:
```json
{
  "photos": [
    "photo-01.jpg",
    "photo-02.jpg",
    "photo-03.jpg",
    "photo-04.jpg",
    "photo-05.jpg",
    "photo-06.jpg"
  ]
}
```
*Lưu ý:* 6 ảnh đầu tiên sẽ được sắp xếp thành bó hoa kỷ niệm ở Giai đoạn 2. Tất cả ảnh sẽ bay xen kẽ trong Vũ trụ 3D ở Giai đoạn 3.

### 3. Thay đổi lời chúc (`data/wishes.txt`)
- Mở file `data/wishes.txt` bằng bất kỳ trình soạn thảo văn bản nào (VS Code, Notepad...).
- Mỗi dòng là một câu chúc riêng biệt. Hỗ trợ tiếng Việt có dấu đầy đủ (UTF-8).
- Ví dụ:
```text
Chúc Thu 20/10 thật vui vẻ
Mong Thu luôn xinh đẹp và rạng rỡ mỗi ngày
Lúc nào cũng cười thật tươi nhé
Mong những điều dịu dàng sẽ đến với Thu
Stress quá thì nhắn mình nhé
```
*Hệ thống tự động đọc và nhân bản ngẫu nhiên các câu chúc thành 50–70 đối tượng 3D phát sáng trong không gian.*

### 4. Thay đổi nhạc nền
- Thay file nhạc bạn muốn bằng cách chép đè vào đường dẫn: `assets/music/background.mp3`.
- Nhạc sẽ tự động lặp lại (loop) và tăng âm lượng êm ái khi người xem nhấn vào bó hoa.
- Nếu không có file nhạc, website tích hợp sẵn bộ phát âm thanh piano du dương bằng Web Audio API để không bao giờ bị gián đoạn.

### 5. Thay đổi hình ảnh bó hoa
- Thay thế file `assets/bouquet.png` bằng hình ảnh bó hoa bạn mong muốn (nên dùng ảnh PNG nền trong suốt để đạt hiệu quả thẩm mỹ cao nhất).

---

## 🚀 Hướng dẫn chạy thử nghiệm tại máy cá nhân (Local)

### Cách 1: Sử dụng tiện ích Live Server trong VS Code
1. Mở thư mục dự án `Chuc20-10` trong Visual Studio Code.
2. Cài đặt tiện ích mở rộng **Live Server** (nếu chưa có).
3. Nhấp chuột phải vào file `index.html` và chọn **"Open with Live Server"**.
4. Website sẽ tự động mở trên trình duyệt tại địa chỉ `http://127.0.0.1:5500`.

### Cách 2: Sử dụng Python HTTP Server
Mở terminal tại thư mục dự án và gõ:
```bash
python -m http.server 8000
```
Sau đó truy cập trình duyệt: `http://localhost:8000`.

### Cách 3: Sử dụng Node.js `npx serve`
```bash
npx serve .
```

---

## 🌐 Hướng dẫn triển khai lên mạng (Hosting miễn phí)

### Triển khai lên GitHub Pages:
1. Tạo một repository mới trên GitHub (ví dụ: `chuc-mung-20-10`).
2. Tải toàn bộ mã nguồn lên repository.
3. Vào **Settings** > **Pages** > tại mục **Branch**, chọn nhánh `main` (hoặc `master`) và thư mục `/ (root)`.
4. Nhấn **Save**. Sau khoảng 1-2 phút, bạn sẽ có đường link web miễn phí dạng: `https://ten-ban.github.io/chuc-mung-20-10/`.

### Triển khai lên Netlify (Nhanh nhất):
1. Truy cập [netlify.com](https://www.netlify.com/) và đăng nhập.
2. Kéo thả toàn bộ thư mục `Chuc20-10` vào khu vực **"Drag & drop your site folder here"**.
3. Netlify sẽ tạo link website trực tuyến ngay lập tức với HTTPS an toàn.

---

## ⚙️ Các thông số cấu hình quan trọng (Dành cho Developer)

- **Âm lượng mục tiêu & thời gian fade-in:** Chỉnh tại `js/audio.js` trong đối tượng `CONFIG`:
  - `targetVolume: 0.6` (60%)
  - `fadeInDuration: 1800` (1.8 giây)
- **Thời gian nhấn giữ chuyển cảnh:** Chỉnh tại `js/bouquet.js` biến `LONG_PRESS_DURATION: 800` (800ms).
- **Số lượng câu chúc & tốc độ bay trong không gian 3D:** Chỉnh tại `js/universe.js` trong đối tượng `CONFIG`:
  - `desktopWishesCount`: Số câu chúc trên màn hình lớn (mặc định: 55).
  - `mobileWishesCount`: Số câu chúc trên điện thoại (mặc định: 32).
  - `baseFlightSpeed`: Tốc độ bay xuyên không gian (mặc định: 1.15).

---

Chúc bạn có một món quà 20/10 thật ý nghĩa, lãng mạn và ngập tràn hạnh phúc! 🌹✨
