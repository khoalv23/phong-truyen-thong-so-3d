# Kế hoạch triển khai Góc 1 – Chuyển đổi số trong công tác Đoàn

## 0. Phạm vi và trạng thái tài liệu

Tài liệu này là kế hoạch kỹ thuật để triển khai nội dung vào khoang kiến trúc `goc5` phía Tây Nam. Kế hoạch không thay đổi vỏ phòng, mặt bằng, tường, trần, sàn, ốp chân tường hoặc nẹp hiện có.

Nguồn yêu cầu: `brief_codex_plan_goc_1_chuyen_doi_so.md`. Ngày khảo sát repository: 11/10/2026.

Quy ước mức độ chắc chắn:

- **Đã xác minh**: đọc trực tiếp từ source hoặc metadata tệp trong repository.
- **Đề xuất triển khai**: giá trị thiết kế cần được kiểm tra trực quan rồi tinh chỉnh trong biên độ nêu rõ.
- **Cần chủ dự án xác nhận**: repository không chứa đủ dữ liệu để kết luận.

Không tìm thấy tệp `AGENTS.md` nào trong phạm vi repository hiện tại.

## 1. Hiện trạng kỹ thuật đã xác minh

### 1.1. Công nghệ và quy trình chạy

- Ứng dụng là HTML/CSS/JavaScript thuần, dùng ES modules và Three.js `0.160.0` qua import map CDN trong `Chu_De_4.html`.
- Entry point: `scripts/chu-de-4.js`.
- Chạy local bằng `start-scene-4.ps1`; script mở `python -m http.server`, bắt đầu từ cổng 5174 và phục vụ URL `/scene/scene-4/Chu_De_4.html`.
- Font `Be Vietnam Pro` tải từ Google Fonts. Three.js và GLTFLoader tải từ jsDelivr; vì vậy lần chạy đầu cần mạng hoặc phải có phương án vendor cục bộ ở giai đoạn hardening.
- Không có `package.json`, bundler hoặc test runner trong thư mục này.

### 1.2. Module liên quan trực tiếp

| Tệp | Vai trò hiện tại | Dự kiến tác động |
|---|---|---|
| `scripts/config/scene-config.js` | Hình học phòng, màu nền, `ROOM_DEFS`, hệ F/R và các góc phòng | Chỉ bổ sung cấu hình nội dung/nhận diện Góc 1 nếu cần; không đổi kích thước kiến trúc |
| `scripts/builders/build-room-shell.js` | Dựng tường, ốp chân, nẹp và trần thả | Không sửa, trừ khi kiểm thử phát hiện sai lệch hiện trạng |
| `scripts/rooms/build-room.js` | Tạo group phòng, gọi shell và route nội dung | Gắn builder nội dung riêng cho `goc5` trước nhánh `clearContents` |
| `scripts/chu-de-4.js` | Entry point, factory hình ảnh/chữ, raycast, video cũ, ánh sáng và khởi tạo | Chỉ lắp module mới, truyền dependency và đăng ký lifecycle; tránh tiếp tục phình file |
| `scripts/data/content.js` | Nội dung placeholder cũ | Không dùng làm nguồn sự thật cho Góc 1 mới; chuyển dữ liệu sang tệp riêng |
| `scripts/ui/artifact-modal.js` | Modal ảnh, ảnh phân trang và chế độ sách | Mở rộng lifecycle/idle timer hoặc tái sử dụng cho ảnh quyết định và gallery |
| `scripts/runtime/navigation.js` | WASD/arrow/Q/E và vùng đi được | Không đổi polygon; dùng `isWalkable` hiện có để kiểm thử |
| `scripts/runtime/scene-registries.js` | Registry interactive/proximity/turntable | Tái sử dụng cho hotspot và màn hình |
| `scripts/runtime/scene-updates.js` | Cập nhật theo khoảng cách và visibility | Bổ sung controller media riêng, không nhét logic mới trực tiếp vào đây |
| `scripts/core/materials.js` | Material kiến trúc dùng chung | Giữ nguyên; material trưng bày có palette riêng nhưng tái sử dụng instance |
| `scripts/core/asset-loader.js` | Cache GLTF | Chưa cache texture/video; cần loader/lifecycle riêng cho media Góc 1 |
| `scripts/core/scene-audit.js` | Chữ ký scene và kiểm tra group phòng | Mở rộng audit cho số asset, hotspot, video và gallery |
| `scripts/ui/minimap.js` | Minimap và nhãn phòng | Đã ánh xạ `goc5` thành Góc 1; chỉ kiểm tra hồi quy |
| `styles/chu-de-4.css` | Modal, overlay và minimap | Bổ sung trạng thái điều khiển video/gallery nếu dùng DOM overlay |

### 1.3. Cách `goc5` được dựng

- `ROOM_DEFS.goc5.theta = 143.5089788569°`; group nội dung quay Y `-53.5089788569°`.
- `goc5` đã được đổi nhãn thành **Góc 1 – Chuyển đổi số trong công tác Đoàn** trong `scene-config.js`.
- `createDiagonalRoom('goc5')` gọi `buildRoom(...)`. Hiện `build-room.js` dựng shell rồi trả về ngay do `opts.clearContents !== false`, nên khoang đang trống nội dung đúng như brief mô tả.
- Có một ánh xạ nội dung cũ `goc5 -> contentByKey.goc3`; ánh xạ này là di sản placeholder và không được dùng cho nội dung mới.
- Vỏ phòng do `build-room-shell.js` dựng: tường sau, hai tường bên, ốp chân cao 1,05, nẹp chân 0,14, nẹp trần, trần thả. Tường ngoài phía Nam dày 3,00; các tường còn lại dày 0,30.

### 1.4. Tọa độ, camera và va chạm

- Đơn vị source được dùng như đơn vị thế giới Three.js; không có phép đổi mét riêng ở runtime.
- Kích thước phòng: rộng `36`, sâu `39`, trần `22.05`, mặt mở `D=39.0346545`, tường sau `D=78.0346545`.
- Hệ local của `goc5`: `H` là trục X local, `D` là trục Z local, Y là cao độ.
- `F=(-0.8039500658, 0.5946968065)`, `R=(-0.5946968065, -0.8039500658)`; đổi sang thế giới bằng `(X,Z)=D×F+H×R`.
- Camera là `PerspectiveCamera(55°, near=0.1, far=220)`, cao mắt `8.82` theo cấu hình hiện tại.
- Navigation giữ tâm camera cách tường ít nhất `WALL_T/2 + 0.35 = 0.50`; vật nổi khỏi tường vẫn phải có kiểm thử clearance riêng.
- Renderer dùng sRGB, ACES Filmic, exposure `1.12`, PCF soft shadows và pixel ratio tối đa `1.25`.

### 1.5. Tương tác, video và lifecycle hiện có

- Raycast chuột dùng mảng `interactive`; object mang `userData.kind` để mở artifact hoặc gọi toggle.
- Modal hiện hỗ trợ ảnh đơn, zoom và tập `pages` với nút trước/sau; chưa có màn hình tổng quan 10 thumbnail, nút “trở về thư viện” hoặc timeout 45 giây.
- Điều khiển hiện có là chuột và bàn phím. Repository không có gamepad/touch-controller abstraction, nên “phương thức điều khiển hiện có” trong brief được hiểu là click chuột + WASD/arrow/Q/E.
- Video cũ tự gọi `play()`, loop, muted và tự bật tiếng sau khi người dùng vào phòng/đã tương tác. Hành vi này không phù hợp yêu cầu mới “không tự phát âm thanh” và thiếu play/pause/replay/mute đầy đủ.
- Hằng `TV_VIDEO_SRC` đang trỏ tới `./image_v2/vtv1.mp4`, nhưng video thật nằm ở `./image_v2/Chuyển đổi số trong công tác đoàn/5/vtv1.mp4`.
- Chưa có hàm teardown/dispose toàn bộ texture/video khi tải lại scene; cần bổ sung rõ trong module Góc 1.

### 1.6. Giới hạn và sai khác cần lưu ý

- Source hiện có nhiều factory cũ nằm trong `chu-de-4.js`; kế hoạch ưu tiên module hóa phần mới và inject factory dùng chung, không viết thêm một khối lớn vào entry point.
- `Goc1.md` có một số chuỗi khác brief đã xác nhận, gồm “Hội trường 11/10” và “TS. Kiều Phương Thùy”. Khi triển khai phải dùng **Hội trường 11.10** và **TS. Kiều Phương Thúy** theo brief, không lấy chuỗi sai từ tài liệu phụ.
- Không có công cụ browser automation hoặc visual regression trong repository. Hiện chỉ có local server và `window.__scene4Audit()`.
- `ffprobe` không được cài trong môi trường khảo sát, nên codec, kích thước khung hình, FPS và thời lượng của `vtv1.mp4` chưa được xác minh. Dung lượng xác minh được là 20.548.633 byte.

## 2. Kiểm kê và ánh xạ tài sản

### 2.1. Kết luận kiểm kê

- Có đúng **50 tệp ảnh + 1 video** trong `image_v2/Chuyển đổi số trong công tác đoàn/`.
- Phân bổ khớp brief: 40 ảnh cố định, 10 ảnh gallery, 1 video.
- Không có tệp nào thiếu so với số lượng brief.
- Có một cặp trùng tuyệt đối theo SHA-256: ảnh Mùa hè xanh nhánh B `(6).jpg` và `(8).jpg`, cùng hash `441B90...D0E622`. Vẫn phải giữ cả hai đường dẫn trong manifest để truy xuất đủ 50 tệp; trước khi phát hành nên hỏi chủ dự án đây có phải bản sao ngoài ý muốn hay không.
- Hai ảnh lễ ra mắt chỉ `590×393`; một ảnh tập huấn AI chỉ `590×333`. Không phóng chúng thành ảnh hero; dùng khung phụ kích thước vật lý nhỏ và giữ tệp gốc.
- Ba ảnh Sáng mãi 2025 chỉ `900×900`; bốn ảnh Sáng mãi 2026 là `940×788`. Dùng theo cụm, không kéo giãn toàn tường.
- Chưa phát hiện bằng metadata kích thước dấu hiệu ảnh bị xoay 90°, nhưng kiểm tra thị giác từng derivative vẫn là cổng nghiệm thu bắt buộc.

### 2.2. Quy tắc dẫn xuất

- Không ghi đè tệp gốc. Tạo derivative dưới `image_v2/derived/goc1/` với tên ASCII ổn định và manifest ánh xạ ngược về nguồn.
- Ảnh chính: WebP chất lượng 82–86, cạnh dài 2048–3072 tùy khoảng nhìn; ảnh phụ: 1280–2048; thumbnail gallery: 512.
- Giữ đúng tỷ lệ ảnh. Crop chỉ tạo derivative và ghi `fit: cover/contain`, `focalPoint` trong manifest; không crop quyết định hoặc poster có chữ.
- Texture đặt `colorSpace=SRGBColorSpace`, bật mipmap, `LinearMipmapLinearFilter`, anisotropy theo `renderer.capabilities` nhưng giới hạn hợp lý (8 hoặc max thấp hơn).

### 2.3. Bảng ánh xạ từng tệp

Ký hiệu xử lý: `D2048` = derivative cạnh dài tối đa 2048; `D3072` = tối đa 3072; `T512` = thumbnail 512; `K` = giữ nguyên tỷ lệ/tệp gốc, không upscale.

| # | Đường dẫn tương đối dưới `image_v2/` | Kích thước nguồn | Vai trò / vị trí | Đầu ra và xử lý |
|---:|---|---:|---|---|
| 1 | `Chuyển đổi số trong công tác đoàn/1/Chia sẻ của diễn giả tại tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số”.jpeg` | 7662×5108 | Ảnh chính A2 | D3072, crop derivative 3:2 nếu cần |
| 2 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (1).jpeg` | 5184×3456 | Ảnh phụ A2 | D2048, crop 3:2 |
| 3 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (2).jpeg` | 8688×5792 | Ảnh phụ A2 | D2048, crop 3:2 |
| 4 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (3).jpeg` | 8629×5753 | Ảnh phụ A2 | D2048, crop 3:2 |
| 5 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (4).jpeg` | 8688×5792 | Ảnh phụ A2 | D2048, crop 3:2 |
| 6 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (5).jpeg` | 7711×5141 | Ảnh phụ A2 | D2048, crop 3:2 |
| 7 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số” (6).jpeg` | 8629×5753 | Ảnh phụ A2 | D2048, crop 3:2 |
| 8 | `.../1/Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số”.jpeg` | 8394×5596 | Ảnh phụ A2 | D2048, crop 3:2 |
| 9 | `.../2/Cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ năm 2025 (2).jpg` | 900×900 | Ảnh cố định A1/2025 | K, khung vuông nhỏ |
| 10 | `.../2/Cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ năm 2025 (3).jpg` | 900×900 | Ảnh cố định A1/2025 | K, khung vuông nhỏ |
| 11 | `.../2/Cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ năm 2025 (4).jpg` | 900×900 | Ảnh cố định A1/2025 | K, khung vuông nhỏ |
| 12 | `.../3/Lễ ra mắt Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội (1) (1).jpg` | 590×393 | Ảnh phụ B2 | K, không upscale, khung nhỏ |
| 13 | `.../3/Lễ ra mắt Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội (2) (1).jpg` | 590×393 | Ảnh phụ B2 | K, không upscale, khung nhỏ |
| 14 | `.../4/A/Đội Bình dân học vụ số triển khai hoạt động Dạy học và hỗ trợ AI trong Chiến dịch Mùa hè xanh 2026 tại Ninh Bình (2) (2).jpg` | 2048×1486 | Ảnh chính C1/A | D2048, contain/crop nhẹ |
| 15 | `.../4/A/Đội Bình dân học vụ số triển khai hoạt động Dạy học và hỗ trợ AI trong Chiến dịch Mùa hè xanh 2026 tại Ninh Bình (3) (2).jpg` | 2048×1365 | Ảnh phụ C1/A | D2048 |
| 16 | `.../4/A/Triển khai chiến dịch Dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành phân hiệu Hà Nam (1).jpg` | 2048×1365 | Ảnh phụ C1/A | D2048 |
| 17 | `.../4/B/Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành Phân hiệu Hà Nam (5).jpg` | 2048×1365 | Ảnh phụ C1/B | D2048 |
| 18 | `.../4/B/Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành Phân hiệu Hà Nam (6).jpg` | 2048×1365 | Ảnh phụ C1/B | D2048; trùng #20 |
| 19 | `.../4/B/Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành Phân hiệu Hà Nam (7).jpg` | 2048×1365 | Ảnh phụ C1/B | D2048 |
| 20 | `.../4/B/Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành Phân hiệu Hà Nam (8).jpg` | 2048×1365 | Ảnh phụ C1/B | D2048; cùng nội dung #18, vẫn khai báo manifest |
| 21 | `.../4/B/Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại trường Nguyễn Tất Thành Phân hiệu Hà Nam (9).jpg` | 2048×1365 | Ảnh phụ C1/B | D2048 |
| 22 | `.../5/Phóng sự của VTV1 về hoạt động chuyển đổi số của Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội. (2).png` | 1688×932 | Still C2 cạnh màn hình | WebP 1600, giữ tỷ lệ |
| 23 | `.../5/Phóng sự của VTV1 về hoạt động chuyển đổi số của Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội. (3).png` | 1672×941 | Still C2 cạnh màn hình | WebP 1600, giữ tỷ lệ |
| 24 | `.../5/Phóng sự VTV1 về hoạt động chuyển đổi số Đội Bình dân học vụ số (1) (1).png` | 1682×935 | Texture chờ + still C2 | WebP 1600, giữ tỷ lệ |
| 25 | `.../5/vtv1.mp4` | 20.548.633 B | Video C2/VTV1 | Giữ nguồn; xác minh H.264/1080p trước khi phát hành |
| 26 | `.../6/Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026 (5).jpg` | 2048×1365 | Ảnh chính B2 | D2048 |
| 27 | `.../6/Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026 (6).jpg` | 2048×1365 | Ảnh phụ B2 | D2048 |
| 28 | `.../6/Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026 (7).jpg` | 2048×1365 | Ảnh phụ B2 | D2048 |
| 29 | `.../6/Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026 (8).jpg` | 2048×1365 | Ảnh phụ B2 | D2048 |
| 30 | `.../6/Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026 (9).jpg` | 2048×1365 | Ảnh phụ B2 | D2048 |
| 31 | `.../7/Lớp tập huấn “ứng dụng trí tuệ nhân tạo (AI) trong học tập và nghiên cứu khoa học dành cho sinh viên” (1).jpg` | 1322×2048 | Ảnh dọc chính B3 | D2048, contain, không crop chữ/người |
| 32 | `.../7/Lớp tập huấn “ứng dụng trí tuệ nhân tạo (AI) trong học tập và nghiên cứu khoa học dành cho sinh viên” (2).jpg` | 590×333 | Ảnh phụ B3 | K, khung nhỏ |
| 33 | `.../7/Lớp tập huấn “ứng dụng trí tuệ nhân tạo (AI) trong học tập và nghiên cứu khoa học dành cho sinh viên” (3).jpg` | 2048×1366 | Ảnh phụ B3 | D2048 |
| 34 | `.../7/Lớp tập huấn “ứng dụng trí tuệ nhân tạo (AI) trong học tập và nghiên cứu khoa học dành cho sinh viên” (4).jpg` | 2048×1365 | Ảnh phụ B3 | D2048 |
| 35 | `.../7/Lớp tập huấn “ứng dụng trí tuệ nhân tạo (AI) trong học tập và nghiên cứu khoa học dành cho sinh viên”.jpg` | 2048×1365 | Ảnh phụ B3 | D2048 |
| 36 | `.../8/Công bố giải thưởng cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ (1).jpg` | 940×788 | Ảnh cố định A1/2026 | K, không upscale |
| 37 | `.../8/Công bố giải thưởng cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ (2).jpg` | 940×788 | Ảnh cố định A1/2026 | K, không upscale |
| 38 | `.../8/Công bố giải thưởng cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_ (3).jpg` | 940×788 | Ảnh cố định A1/2026 | K, không upscale |
| 39 | `.../8/Công bố giải thưởng cuộc thi _Sáng mãi tư tưởng Hồ Chí Minh_.jpg` | 940×788 | Ảnh cố định A1/2026 | K, không upscale |
| 40 | `.../9/Poster cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_.jpg` | 2048×1448 | Poster cố định C3 | D2048, contain, không crop chữ |
| 41 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (1).jpg` | 1440×1800 | Gallery item 1 | D2048 + T512, contain |
| 42 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (2).jpg` | 1463×2048 | Gallery item 2 | D2048 + T512, contain |
| 43 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (3).jpg` | 1391×1800 | Gallery item 3 | D2048 + T512, contain |
| 44 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (4).jpg` | 1447×2048 | Gallery item 4 | D2048 + T512, contain |
| 45 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (5).jpg` | 1448×2048 | Gallery item 5 | D2048 + T512, contain |
| 46 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (6).jpg` | 1448×2048 | Gallery item 6 | D2048 + T512, contain |
| 47 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (7).jpg` | 1583×2048 | Gallery item 7 | D2048 + T512, contain |
| 48 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (8).jpg` | 1440×1800 | Gallery item 8 | D2048 + T512, contain |
| 49 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_ (9).jpg` | 1110×2048 | Gallery item 9 | D2048 + T512, contain |
| 50 | `.../9/Sản phẩm dự thi cuộc thi _ECHOES OF THE OCEAN - ÂM VANG BIỂN XANH_.jpg` | 1527×1018 | Gallery item 10 | D2048 + T512, contain |
| 51 | `.../10/QĐ thành lập đội bình dân học vụ (1).jpg` | 1536×2048 | Chứng tích B1 + bản phóng to | D2048 + preview 768, contain, không crop |

Tên tác phẩm của 10 poster chưa có metadata nguồn ngoài chỉ số tệp. UI chỉ hiển thị “Tác phẩm 01…10” như mã định danh tạm, không đặt tên sáng tác; thay bằng tên chính thức khi chủ dự án cung cấp.

## 3. Cấu trúc mã đề xuất

Tạo mới:

- `scripts/data/goc1-digital-transformation.js`: manifest 51 asset, chuỗi nội dung đã chuẩn hóa và metadata kiểm kê.
- `scripts/rooms/build-goc1-digital-room.js`: dựng A1–A3, B1–B3, C1–C3 và title sign trong group local của `goc5`.
- `scripts/objects/exhibits/media-frame.js`: factory khung ảnh lì, tái sử dụng geometry/material, hỗ trợ `contain/cover`.
- `scripts/objects/exhibits/video-screen.js`: màn hình 16:9, trạng thái chờ và control explicit.
- `scripts/objects/exhibits/poster-gallery.js`: lưới thumbnail 2×5, selection, previous/next/back.
- `scripts/core/texture-loader.js`: cache texture theo URL, chuẩn hóa color space/mipmap/anisotropy và reference-count/dispose.
- `scripts/runtime/goc1-media-controller.js`: idle timer 45 giây, reset video khi rời trigger, pause/dispose khi teardown.

Chỉnh sửa có kiểm soát:

- `scripts/rooms/build-room.js`: route `key === 'goc5'` sang builder mới; giữ nguyên shell.
- `scripts/chu-de-4.js`: import builder/controller, inject `registerArtifact`, `registerInteractiveObject`, `requestRender`, renderer/camera; sửa đường dẫn video cũ hoặc loại bỏ TV cũ khỏi luồng Góc 1.
- `scripts/ui/artifact-modal.js` và `styles/chu-de-4.css`: chỉ mở rộng nếu gallery dùng DOM modal; giữ backward compatibility với artifact hiện có.
- `scripts/core/scene-audit.js`: thêm audit `goc1.fixedImageCount=40`, `galleryCount=10`, `videoCount=1`, số trigger và trạng thái duplicate URL.
- `README.md`: cập nhật module mới và cách kiểm thử Góc 1.

## 4. Danh sách hạng mục triển khai

### 4.1. Kiến trúc và nền

- Giữ nguyên toàn bộ mesh `goc5-*` do `build-room-shell.js` tạo.
- Tạo duy nhất `goc1-exhibit-root` làm con của `goc5-room-content`; mọi nội dung mới ở local coordinates.
- Mặt khung cách mặt trong tường 0,03–0,05. Tổng độ nổi màn hình không quá 0,35.
- Không đặt pedestal hoặc vật sàn trong trục nhìn H≈0 từ cửa đến B2; lối đi giữa phòng luôn rộng trên 4 đơn vị.

### 4.2. Hệ khung ảnh

- Một geometry profile khung, ba material dùng chung: đồng sẫm, nền trung tính lì, kính tùy chọn rất nhẹ.
- Không dùng `MeshPhysicalMaterial` phản xạ mạnh trên ảnh; ưu tiên `MeshBasicMaterial` cho mặt ảnh hoặc standard material roughness cao để giữ màu.
- Mỗi cụm chỉ tạo group transform; ảnh không tự tạo light riêng.

### 4.3. Tường A

- A1: timeline **Sáng mãi tư tưởng Hồ Chí Minh 2025–2026**, 3 ảnh năm 2025 và 4 ảnh năm 2026, dải đỏ trầm `#9B302F`.
- A2: 8 ảnh tọa đàm, 1 ảnh hero + 7 ảnh phụ; khóa ba từ **Văn hóa số – Trách nhiệm số – Thích ứng số**.
- A3: dải chuyển tiếp bằng mạng điểm/đường tuyến tính dẫn tới hạt nhân, không thêm ảnh mới.
- Thông điệp tường: **BẢN LĨNH TRONG THỜI ĐẠI SỐ**.

### 4.4. Tường sau

- B1: quyết định luôn hiện tĩnh; số `120/XXI-QĐ-TNSP`, ngày `01/10/2025`, `25 thành viên` đọc được không cần click; click mở bản contain phóng to.
- B2: hợp nhất 2 ảnh lễ ra mắt và 5 ảnh lễ phát động/tập huấn thành một câu chuyện, tránh hai tiêu đề lặp.
- B3: 5 ảnh tập huấn AI và bốn trụ cột Công cụ/Học tập/Nghiên cứu/Sử dụng có trách nhiệm.
- Heading trung tâm đọc được từ sảnh: **ĐỘI BÌNH DÂN HỌC VỤ SỐ** và subtitle theo brief.

### 4.5. Tường B

- C1: 8 ảnh Mùa hè xanh; tiêu đề chính bắt buộc **Ninh Bình**. Nhánh A/B có thể chú thích địa điểm trường theo dữ liệu nguồn nhưng không thay tiêu đề địa bàn chính.
- C2: màn hình VTV1 5,8×3,3; 3 still xung quanh; không autoplay âm thanh.
- C3: poster giới thiệu cố định + gallery 10 tác phẩm.
- Thông điệp tường: **TỪ NĂNG LỰC SỐ ĐẾN HÀNH ĐỘNG CỘNG ĐỒNG**.

### 4.6. Màn hình VTV1

- Trạng thái đầu: still #24, tên “Buổi sáng thức giấc”, nút play.
- Click play mới tạo/gắn `VideoTexture` nếu chưa có và phát muted; bật tiếng chỉ qua nút âm lượng riêng.
- Control: play/pause, replay từ 0, mute/unmute. Không dùng hành vi “vào phòng là bật tiếng”.
- Rời trigger: pause ngay; sau 15 giây không quay lại thì `currentTime=0`, muted, trả placeholder. Khi teardown: pause, bỏ `src`, `load()`, dispose VideoTexture/material map.
- Phụ đề chỉ thêm khi có tệp transcript/VTT chính thức; không tự chép lời từ suy đoán.

### 4.7. Gallery poster

- Overview 2×5 thumbnail 512 px; poster giới thiệu đứng độc lập cạnh màn hình.
- Click thumbnail mở detail contain; previous/next theo thứ tự tệp; nút back trở về overview.
- Mọi thao tác đều qua object raycast/click hiện hành và nút DOM nếu modal mở; Escape đóng.
- 45 giây không pointer/click/keyboard trong gallery thì về overview, không đóng toàn bộ modal nếu người dùng vừa tương tác ngoài gallery.

### 4.8. Biển và đồ họa

- Palette đúng brief; vàng `#D6A84B` chỉ làm chỉ hướng/nhấn nhỏ, không phủ mảng tường.
- Đường mạng điểm: A tuyến tính, tường sau hội tụ, B lan tỏa; dùng geometry nhẹ và material không neon.
- Text tạo canvas texture ở độ phân giải đủ cao, `Be Vietnam Pro`; kiểm tra fallback sans-serif khi font CDN chưa tải.

### 4.9. Chiếu sáng

- 13 vùng rọi: A=4, sau=5, B=4; màu gần 3500 K, góc 28–35°.
- Ưu tiên spotlight chia sẻ theo cụm, không vượt budget 26 point/spot light toàn scene. Nếu budget hiện tại không đủ, dùng emissive panel/rect-light giả lập thay vì bật thêm light bị `optimizeDynamicLights()` vô hiệu hóa.
- Không chiếu trực diện lên VTV1/gallery; B2 sáng hơn ảnh phụ khoảng 15%.

### 4.10. Hiệu năng

- Lazy load C2/C3 detail khi camera vào `goc5`; title/still/thumbnail tải trước.
- Cache theo URL và reuse material/geometry; không tạo 40 geometry profile khác nhau.
- Giới hạn tổng texture resident của Góc 1 bằng derivative; thumbnail và detail không cùng giữ nếu detail đã đóng lâu.
- Audit số texture/material/video và kiểm tra dispose sau reload.

## 5. Bảng tọa độ triển khai đề xuất

Tọa độ local ghi `(H,Y,D)`, thế giới ghi `(X,Y,Z)`. Đây là tâm group/panel. Kích thước ghi theo chiều ngang trên tường × cao × độ nổi. Sai số hiệu chỉnh cho phép sau visual review: vị trí ±0,4, kích thước ±8%, không vượt các vùng D/H đã khóa.

Yaw local: tường A `+90°`, tường sau `180°`, tường B `-90°`. Yaw thế giới tương ứng: `36.491°`, `126.491°`, `-143.509°`.

| Hạng mục | Local `(H,Y,D)` | World `(X,Y,Z)` | Yaw local/world | Kích thước | Hướng nhìn |
|---|---|---|---|---|---|
| Biển tên Góc 1 | `(0,17.4,40.2)` | `(-32.319,17.4,23.907)` | `180° / 126.491°` | `15.0×1.2×0.12` | Ra sảnh, `-F` |
| A1 | `(-17.70,9.6,48.0)` | `(-28.063,9.6,42.775)` | `+90° / 36.491°` | `7.4×11.2×0.22` | Vào trong, `+R` |
| A2 | `(-17.70,9.6,60.5)` | `(-38.113,9.6,50.209)` | `+90° / 36.491°` | `12.2×11.2×0.22` | Vào trong, `+R` |
| A3 | `(-17.70,9.0,72.0)` | `(-47.358,9.0,57.048)` | `+90° / 36.491°` | `5.2×10.0×0.15` | Vào trong, `+R` |
| B1 | `(-12.0,9.8,77.78)` | `(-55.395,9.8,55.903)` | `180° / 126.491°` | `8.0×11.0×0.25` | Về cửa, `-F` |
| B2 | `(-2.0,9.8,77.78)` | `(-61.342,9.8,47.863)` | `180° / 126.491°` | `9.5×11.0×0.25` | Về cửa, `-F` |
| B3 | `(11.5,9.8,77.78)` | `(-69.370,9.8,37.010)` | `180° / 126.491°` | `11.0×11.0×0.25` | Về cửa, `-F` |
| C1 | `(17.70,9.5,69.0)` | `(-65.999,9.5,26.804)` | `-90° / -143.509°` | `9.4×11.0×0.22` | Vào trong, `-R` |
| C2 | `(17.70,9.5,58.5)` | `(-57.557,9.5,20.560)` | `-90° / -143.509°` | `6.4×11.0×0.30` | Vào trong, `-R` |
| Màn hình VTV1 | `(17.62,10.2,58.5)` | `(-57.510,10.2,20.624)` | `-90° / -143.509°` | `5.8×3.3×0.30` | Vào trong, `-R` |
| C3 | `(17.70,9.5,48.0)` | `(-49.116,9.5,14.316)` | `-90° / -143.509°` | `9.4×11.0×0.30` | Vào trong, `-R` |
| Màn gallery | `(17.62,9.6,48.0)` | `(-49.068,9.6,14.380)` | `-90° / -143.509°` | `6.8×5.2×0.30` | Vào trong, `-R` |
| Trigger video | `(12.0,1.6,58.5)` | `(-54.167,1.6,25.142)` | Không render | hộp `7×3×8` | Bao vùng đứng xem C2 |
| Trigger gallery | `(12.0,1.6,48.0)` | `(-45.726,1.6,18.898)` | Không render | hộp `8×3×9` | Bao vùng đứng xem C3 |
| Trigger quyết định | `(-8.0,1.6,72.0)` | `(-53.127,1.6,49.250)` | Không render | hộp `8×3×8` | Bao vùng xem B1 |

### 5.1. Tọa độ vùng đèn

Mỗi spotlight ở Y=18,5, cách tường khoảng 3 đơn vị. Rotation không hard-code Euler; gọi `lookAt(target)` để tránh sai do group rotation. Target Y mặc định 9,5; riêng B2 target intensity 1,15 lần các vùng phụ.

| Vùng | Local `(H,Y,D)` | World `(X,Y,Z)` | Target |
|---|---|---|---|
| A-L1 | `(-14.7,18.5,47.0)` | `(-29.044,18.5,39.769)` | A1 `(H=-17.7,Y=9.5,D=47)` |
| A-L2 | `(-14.7,18.5,55.5)` | `(-35.877,18.5,44.824)` | A2 đầu |
| A-L3 | `(-14.7,18.5,63.5)` | `(-42.309,18.5,49.581)` | A2 cuối |
| A-L4 | `(-14.7,18.5,71.5)` | `(-48.740,18.5,54.339)` | A3 |
| B-L1 | `(-14,18.5,74.78)` | `(-51.794,18.5,55.727)` | B1 |
| B-L2 | `(-7,18.5,74.78)` | `(-55.957,18.5,50.099)` | B1/B2 |
| B-L3 | `(0,18.5,74.78)` | `(-60.119,18.5,44.471)` | B2, +15% |
| B-L4 | `(7,18.5,74.78)` | `(-64.282,18.5,38.844)` | B2/B3 |
| B-L5 | `(14,18.5,74.78)` | `(-68.445,18.5,33.216)` | B3 |
| C-L1 | `(14.7,18.5,47.5)` | `(-46.930,18.5,16.430)` | C3, tránh màn hình |
| C-L2 | `(14.7,18.5,56.5)` | `(-54.165,18.5,21.782)` | still C2, lệch màn hình |
| C-L3 | `(14.7,18.5,64.5)` | `(-60.597,18.5,26.540)` | C1 đầu |
| C-L4 | `(14.7,18.5,72.5)` | `(-67.028,18.5,31.297)` | C1 cuối |

## 6. Kế hoạch triển khai theo bước

### Bước 1 – Đóng băng baseline

- **Mục tiêu:** có chữ ký scene và ảnh chụp trước thay đổi.
- **Tệp:** không sửa; chạy `Chu_De_4.html`, lưu kết quả `window.__scene4Audit()` vào ghi chú kiểm thử.
- **Phụ thuộc:** local server hoạt động và CDN truy cập được.
- **Kiểm tra:** đủ bốn room content group, một merged East group, navigation không lỗi console.
- **Rủi ro:** không có browser automation; ảnh baseline phải chụp thủ công từ các waypoint cố định.

### Bước 2 – Tạo manifest nội dung và validator

- **Mục tiêu:** mọi asset có ID, source, derivative, cluster, role và metadata; khóa đúng tên riêng.
- **Tệp:** tạo `scripts/data/goc1-digital-transformation.js`; có thể tạo script tooling riêng ngoài runtime để kiểm kê derivative.
- **Phụ thuộc:** bảng mục 2.
- **Kiểm tra:** validator báo 50 ảnh, 10 gallery, 40 fixed, 1 video; không URL thiếu; duplicate #18/#20 được flag có chủ đích.
- **Rủi ro:** đường dẫn Unicode; luôn dùng URL qua `encodeURI` hoặc `new URL(..., import.meta.url)`.

### Bước 3 – Chuẩn bị derivative

- **Mục tiêu:** giảm VRAM/tải mạng mà giữ bản gốc.
- **Tệp:** tạo `image_v2/derived/goc1/**` và cập nhật manifest.
- **Phụ thuộc:** bước 2.
- **Kiểm tra:** so tỷ lệ trước/sau, không ảnh nào méo/xoay sai; chữ trên poster/quyết định còn nguyên; dung lượng tổng giảm có đo lường.
- **Rủi ro:** crop tự động cắt nhân vật/chữ; mọi focal point phải review thủ công.

### Bước 4 – Dựng hệ khung và ba vùng tường

- **Mục tiêu:** dựng blockout A/B/C bằng placeholder theo đúng bảng tọa độ, chưa bật media nặng.
- **Tệp:** tạo `media-frame.js`, `build-goc1-digital-room.js`; sửa `build-room.js`.
- **Phụ thuộc:** bước 2; không phụ thuộc derivative để blockout.
- **Kiểm tra:** scene audit nhận group A1–C3; bounding box không cắt chân tường/trần; độ nổi ≤0,35; camera không mắc kẹt.
- **Rủi ro:** nhầm `goc1` logic cũ với khoang `goc5`; mọi nhánh mới phải kiểm tra key đúng `goc5`.

### Bước 5 – Gắn 40 ảnh cố định và text

- **Mục tiêu:** hoàn thiện luồng kể chuyện và toàn bộ nội dung tĩnh.
- **Tệp:** manifest, builder Góc 1, texture loader.
- **Phụ thuộc:** bước 3–4.
- **Kiểm tra:** audit đếm đúng 40 mặt ảnh; kiểm tra gần/trung/xa FOV 55°; đối chiếu ba tên riêng bắt buộc và tiêu đề Ninh Bình.
- **Rủi ro:** ảnh 590 px mờ khi phóng; giới hạn kích thước vật lý như bảng asset.

### Bước 6 – Tương tác quyết định thành lập

- **Mục tiêu:** thông tin cốt lõi luôn thấy, ảnh chi tiết có thể phóng to.
- **Tệp:** builder và `artifact-modal.js` nếu cần API teardown.
- **Phụ thuộc:** bước 5.
- **Kiểm tra:** không click vẫn đọc được số/ngày/25 thành viên; click mở ảnh contain, zoom và Escape/close hoạt động.
- **Rủi ro:** ảnh tài liệu dọc bị crop; bắt buộc `contain`.

### Bước 7 – Màn hình VTV1

- **Mục tiêu:** explicit playback, không autoplay tiếng, reset khi rời vùng.
- **Tệp:** tạo `video-screen.js`, `goc1-media-controller.js`; sửa wiring trong entry point.
- **Phụ thuộc:** bước 4 và xác minh codec.
- **Kiểm tra:** ma trận play/pause/replay/mute; lần vào đầu muted; rời trigger reset; tải lỗi vẫn có still; chỉ một audio phát.
- **Rủi ro:** browser policy, codec không H.264 hoặc video không 1080p; cần kiểm bằng `video.videoWidth/videoHeight`, `canPlayType` hoặc ffprobe ở máy dev.

### Bước 8 – Gallery 10 poster

- **Mục tiêu:** overview 10 thumbnail, detail, previous/next/back và idle reset.
- **Tệp:** tạo `poster-gallery.js`; mở rộng modal/CSS hoặc dựng UI 3D tương thích raycast.
- **Phụ thuộc:** bước 3–4.
- **Kiểm tra:** thứ tự đủ 10; không tự đặt tên tác phẩm; timeout 45±1 giây; timer reset trên click/key/pointer; đóng modal giải phóng detail texture theo policy.
- **Rủi ro:** click kéo nhìn bị nhận thành chọn; dùng ngưỡng `suppressClick` hiện có.

### Bước 9 – Đồ họa và chiếu sáng

- **Mục tiêu:** hoàn thiện nhận diện, mạng điểm và 13 vùng rọi.
- **Tệp:** builder Góc 1, material/config nội dung; không sửa material kiến trúc.
- **Phụ thuộc:** nội dung tĩnh và media đã ổn định.
- **Kiểm tra:** light budget sau `optimizeDynamicLights()`, màn hình không lóe, B2 sáng hơn khoảng 15%, không banding/z-fighting.
- **Rủi ro:** optimizer tắt light thêm sau ngưỡng 26; audit `visible` và intensity thực tế sau optimize.

### Bước 10 – Lifecycle và tối ưu

- **Mục tiêu:** lazy load, cache, dispose và tải lại ổn định.
- **Tệp:** texture loader, media controller, render loop wiring, scene audit.
- **Phụ thuộc:** bước 5–9.
- **Kiểm tra:** vào/ra Góc 1 nhiều lần; số texture/video không tăng; paused video không giữ render loop hoạt động; WebGL memory ổn định.
- **Rủi ro:** cache reference count sai gây texture trắng hoặc leak; test hai consumer dùng chung texture.

### Bước 11 – QA và hiệu chỉnh cuối

- **Mục tiêu:** đạt checklist mục 8 ở cấu hình mục tiêu.
- **Tệp:** chỉ chỉnh config tọa độ/kích thước/ánh sáng trong biên độ cho phép; cập nhật README và audit.
- **Phụ thuộc:** toàn bộ bước trước.
- **Kiểm tra:** chạy toàn bộ kế hoạch kiểm thử mục 7, `node --check` mọi JS, `git diff --check`, không lỗi console.
- **Rủi ro:** chưa có thông số thiết bị mục tiêu; phải xin cấu hình trước khi chốt KPI FPS.

## 7. Kế hoạch kiểm thử

### 7.1. Waypoint bắt buộc

1. Cửa A, nhìn dọc A1→A3 rồi về tường sau.
2. Cửa B, nhìn C3→C1 rồi về tường sau.
3. Sảnh trung tâm, ngắm H=0 tới heading B2.
4. Khoảng gần 2–3 đơn vị trước mỗi cụm.
5. Khoảng trung bình 6–10 đơn vị trước mỗi cụm.
6. Khoảng xa tại mặt mở phòng.

Ở mỗi waypoint chụp ảnh cùng viewport 1920×1080, FOV 55°, ghi FPS và số texture/material qua renderer info.

### 7.2. Ma trận kiểm thử

| Nhóm | Ca kiểm thử | Kết quả đạt |
|---|---|---|
| Hai cửa | Vào từ A và B, đi hết vòng nội dung | Không bị điều hướng sai, luồng đọc hợp lý từ cả hai phía |
| Trục sảnh | Nhìn H≈0 từ sảnh | Heading/hạt nhân đọc được, không vật chắn |
| Chữ | Gần/trung/xa | Không vỡ texture; heading đọc từ sảnh, chú thích đọc ở gần |
| Va chạm | Đi sát ba tường và các góc khung | Không xuyên tường/khung, không mắc kẹt, clearance ≥0,5 cho camera |
| VTV1 | Play, pause, replay, mute, unmute, rời/vào trigger | Không tự phát tiếng; đúng trạng thái; không audio chồng |
| Gallery | Chọn cả 10, next/prev/back, Escape, idle 45 s | Đúng thứ tự, đủ ảnh, trở overview đúng hạn |
| Quyết định | Xem tĩnh và zoom | Số/ngày/25 người luôn thấy; detail không crop |
| Hình ảnh | Quan sát xiên hai phía | Có mipmap/anisotropy, không nhòe quá mức, không méo tỷ lệ |
| Hình học | Soi mép khung/tường | Không z-fighting; offset 0,03–0,05 ổn định |
| Ánh sáng | Tắt/bật từng vùng debug | Không cháy sáng/phản xạ; B2 +15%; màn hình không bị spot trực diện |
| Reload | Reload trang 10 lần, vào/ra phòng | Không tăng video element/texture ngoài baseline cho phép |
| Lỗi mạng | Chặn một ảnh, chặn video/CDN font | Có placeholder/fallback, scene không crash |
| Hiệu năng | Máy mục tiêu, DPR 1 và 1,25 | KPI được chủ dự án chốt; đề xuất tối thiểu 45 FPS, frame pacing ổn định |

### 7.3. Kiểm tra tự động/console đề xuất

- `node --check` cho toàn bộ `scripts/**/*.js`.
- `git diff --check`.
- Mở `window.__scene4Audit()` và assert: architecture valid, fixed images 40, gallery 10, videos 1, không URL manifest thiếu.
- Thêm debug helper trả về trạng thái video, gallery page, idle timer, texture reference count; không để helper ghi dữ liệu production.
- Nếu bổ sung Playwright sau này, test click theo data attribute DOM và chụp snapshot tại waypoint; hiện repository chưa có hạ tầng này.

## 8. Điểm cần xác nhận từ chủ dự án

Các việc có thể tự suy ra và đã khóa: khoang là `goc5`; hệ local/world; phân bổ 40/10/1; cụm nội dung theo số thư mục; tên Ninh Bình, Hội trường 11.10, TS. Kiều Phương Thúy.

Các việc cần xác minh từ file ở giai đoạn triển khai: codec/FPS/resolution/thời lượng video; crop/focal point trực quan; khả năng đọc sau khi render; light budget thực tế sau optimizer.

Các việc thực sự cần chủ dự án trả lời trước nghiệm thu cuối:

- Ảnh Mùa hè xanh `(6)` và `(8)` trùng tuyệt đối có phải chủ ý không; nếu không, cung cấp tệp thay thế. Nếu chưa có, hệ thống vẫn liệt kê cả hai ID để đủ 50 asset nhưng chỉ nên trưng một bản cố định và cho bản còn lại truy cập trong detail metadata.
- Tên tác giả/tên chính thức của 10 tác phẩm Echoes of the Ocean.
- Có transcript hoặc tệp phụ đề VTT chính thức cho video VTV1 hay không.
- Cấu hình phần cứng/trình duyệt mục tiêu và KPI FPS chính thức.

## 9. Checklist nghiệm thu

- [ ] Chủ đề “Chuyển đổi số trong công tác Đoàn” nhận biết ngay từ sảnh.
- [ ] `goc5` vẫn giữ nguyên vỏ kiến trúc, kích thước, tường, sàn, trần, ốp và nẹp.
- [ ] Đội Bình dân học vụ số là điểm nhấn rõ nhất trên tường sau.
- [ ] Luồng nội dung đi từ bản lĩnh số đến tổ chức, năng lực, cộng đồng và sáng tạo số.
- [ ] Manifest có đúng 50 ảnh và 1 video; audit xác nhận 40 ảnh cố định + 10 gallery.
- [ ] Cả hai ID của cặp ảnh trùng vẫn truy xuất được hoặc đã được thay bằng asset chủ dự án cung cấp.
- [ ] VTV1 phát ổn định, không tự phát âm thanh, có play/pause/replay/mute.
- [ ] Rời vùng video thì pause/reset đúng policy và không giữ render loop vô ích.
- [ ] Gallery hiển thị đủ 10 thumbnail, detail, trước/sau/trở về và timeout 45 giây.
- [ ] Quyết định luôn cho thấy `120/XXI-QĐ-TNSP`, `01/10/2025`, `25 thành viên` mà không cần click.
- [ ] Ghi đúng **Ninh Bình**, **Hội trường 11.10**, **TS. Kiều Phương Thúy**.
- [ ] Ảnh và chữ không cắt vào ốp chân hoặc nẹp trần.
- [ ] Không có z-fighting; mặt ảnh cách tường 0,03–0,05.
- [ ] Không vật cản trên trục nhìn H≈0 từ sảnh; lối hữu dụng ≥4 đơn vị.
- [ ] Camera không xuyên tường, khung hoặc màn hình và không mắc kẹt.
- [ ] Chữ đọc được với camera FOV 55° tại các waypoint gần/trung/xa.
- [ ] Ảnh không méo tỷ lệ, không xoay sai, ảnh nguồn nhỏ không bị upscale quá mức.
- [ ] Đèn không cháy sáng/phản xạ mạnh trên ảnh, TV hoặc gallery.
- [ ] B2 sáng hơn ảnh phụ khoảng 15% và vẫn nằm trong light budget toàn scene.
- [ ] Reload/ra-vào phòng không làm tăng texture, video element hoặc listener vô hạn.
- [ ] Scene hoạt động khi asset lỗi bằng placeholder, không có unhandled exception.
- [ ] Tất cả JavaScript qua `node --check`; `git diff --check` sạch.
- [ ] Các component mới tuân thủ module hiện có, tái sử dụng geometry/material/registry và có lifecycle dispose.

