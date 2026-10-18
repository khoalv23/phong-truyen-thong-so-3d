# Scene 4 — Phòng Truyền Thống 3D (Chủ đề 4)

`Chu_De_4.html` là vỏ trang duy nhất. Toàn bộ logic Three.js và giao diện được chia thành các module ES riêng biệt để dễ bảo trì.

Đọc `struture.md` để hiểu bố cục phòng trưng bày. Đọc `GEOMETRY_GUARDRAILS.md` trước khi thay đổi bất kỳ hình học nào (tường, sàn, trần, thảm, lối đi).

---

## Cấu trúc mã nguồn hiện tại

```text
scene/scene-4/
├── Chu_De_4.html                        # Vỏ trang: canvas, script type=module, HTML khung UI
├── GEOMETRY_GUARDRAILS.md               # Quy tắc bất biến về hình học — đọc trước khi sửa layout
├── README.md                            # Tài liệu này
├── start-scene-4.ps1                    # Script PowerShell khởi động HTTP server cục bộ
├── struture.md                          # Mô tả bố cục phòng và các góc trưng bày
│
├── styles/
│   └── chu-de-4.css                     # Toàn bộ CSS: UI overlay, modal, minimap, loading screen
│
├── scripts/
│   ├── chu-de-4.js                      # Entry point: khởi tạo Three.js, gắn sự kiện, render loop
│   │
│   ├── config/
│   │   └── scene-config.js             # Hằng số kiến trúc (kích thước phòng, bán kính, màu sắc, logo)
│   │
│   ├── data/
│   │   └── content.js                  # Nội dung trưng bày theo từng góc phòng (video, ảnh, tài liệu)
│   │
│   ├── core/                           # Tiện ích nền — không phụ thuộc trạng thái toàn cục
│   │   ├── asset-loader.js             # GLTFLoader dùng chung, cache model theo URL
│   │   ├── materials.js                # Tạo bảng vật liệu Three.js dùng chung cho toàn scene
│   │   ├── scene-audit.js              # Thu thập chữ ký scene để kiểm tra hồi quy trực quan
│   │   └── scene-context.js            # Đối tượng context chia sẻ giữa các builder (scene, camera, registries)
│   │
│   ├── builders/                       # Xây dựng kiến trúc vật lý — không chứa nội dung trưng bày
│   │   ├── build-central-hall.js       # Khối trung tâm hình trụ (hub core)
│   │   ├── build-room-shell.js         # Vỏ kiến trúc một phòng chéo (tường, sàn, trần hạ)
│   │   └── build-merged-east-room.js   # Vùng đông hợp nhất gồm hai góc phòng liền kề
│   │
│   ├── rooms/
│   │   └── build-room.js              # Xây dựng một phòng chéo hoàn chỉnh (shell + nội dung trưng bày)
│   │
│   ├── objects/                        # Đối tượng 3D có thể tái sử dụng
│   │   ├── architecture/
│   │   │   └── primitives.js           # Hàm tạo Box/Mesh thuần — không gắn vào scene
│   │   └── decor/
│   │       └── potted-plant.js         # Clone và đặt chậu cây từ model đã tải
│   │
│   ├── idea-tree/                      # Hệ thống "Cây Ý tưởng" — tự chứa hoàn toàn
│   │   ├── idea-tree-runtime.js        # Runtime: tải GLB, gắn khung ảnh lên anchor, hiệu ứng dây
│   │   ├── idea-tree.config.js         # Tham số chất lượng (low/medium/high), vị trí cây, niche
│   │   └── idea-tree.data.js           # Dữ liệu khung ảnh gắn trên cây (anchor, loại khung, tiêu đề)
│   │
│   ├── runtime/                        # Vòng lặp và điều phối per-frame
│   │   ├── navigation.js               # Điều hướng FPS: giới hạn di chuyển theo polygon, bàn phím
│   │   ├── render-loop.js              # requestAnimationFrame, uỷ thác cập nhật scene theo frame
│   │   ├── scene-registries.js         # Hàm đăng ký đối tượng vào registry (interactive, turntable…)
│   │   └── scene-updates.js            # Cập nhật per-frame: proximity icon, turntable, visibility
│   │
│   └── ui/
│       ├── artifact-modal.js           # Registry artifact và hành vi mở/đóng modal
│       ├── dom-elements.js             # Tra cứu phần tử DOM dùng chung
│       └── minimap.js                  # Vẽ SVG minimap và cập nhật marker vị trí người dùng
│
├── assets/
│   ├── models/
│   │   └── idea-tree/
│   │       ├── idea-tree-placeholder.glb          # Placeholder trong khi tải model chính
│   │       ├── idea-tree-production.glb            # Model cây sản xuất chính thức
│   │       ├── idea-tree-validation.glb            # GLB kiểm tra anchor
│   │       ├── idea-tree-art-blockout.glb          # Blockout nghệ thuật
│   │       ├── idea-tree-blockout-template.glb     # Template blockout
│   │       ├── idea-tree-art-blockout.blend        # Source Blender blockout nghệ thuật
│   │       ├── idea-tree-production.blend          # Source Blender sản xuất
│   │       ├── IDEA_TREE_ASSET_CONTRACT.md         # Đặc tả tên anchor, cấu trúc GLB bắt buộc
│   │       ├── PRODUCTION_RUNTIME_REVIEW_CHECKLIST.md
│   │       ├── art-blockout-*.png / production-review-*.png   # Ảnh review
│   │       └── tools/                              # Script Blender/Node.js build, audit, render GLB
│   │           ├── build-art-blockout-glb.cjs
│   │           ├── build-validation-glb.cjs
│   │           ├── audit-production-preview.mjs
│   │           ├── audit-validation-glb.mjs
│   │           ├── create-blender-art-blockout.py
│   │           ├── create-production-sculpt.py
│   │           ├── export-art-blockout-glb.py
│   │           ├── production-sculpt-pass2.py
│   │           ├── render-art-blockout-review.py
│   │           ├── render-production-review.py
│   │           └── (+ các script khác)
│   └── textures/
│       └── idea-tree/
│           └── production/
│               ├── tree_bark_basecolor.png
│               ├── tree_bark_normal.png
│               └── tree_bark_roughness.png
│
├── image/                              # Ảnh tĩnh trưng bày (định dạng cũ — v1)
│   ├── HNUE_logo.png
│   ├── doan_logo.png
│   ├── test.mp4
│   ├── Giay_khen/                      # Ảnh giấy khen theo năm (1999–2016)
│   ├── hoat_dong/                      # Ảnh hoạt động sự kiện
│   ├── huan_chuong/                    # Ảnh huân chương lao động
│   └── lanh_dao/                       # Ảnh chân dung lãnh đạo (GS. Đặng Thai Mai, Nguyễn Cảnh Toàn…)
│
└── image_v2/                           # Ảnh trưng bày v2 — tổ chức theo chủ đề phòng
    ├── vtv1.mp4
    ├── CĐS/                            # Chuyển đổi số — ảnh/video theo sự kiện con
    │   ├── Lễ ra mắt đội bình dân học vụ số/
    │   ├── Lễ phát động phong trào "Bình dân học vụ số"…/
    │   ├── Hoạt động của Đội Bình dân học vụ số…/
    │   ├── Đội Bình dân học vụ số ĐHSPHN được giới thiệu trên VTV1/
    │   └── QĐ thành lập đội bình dân học vụ.jpg
    ├── Hội nhập quốc tế/               # Trao đổi sinh viên quốc tế (16 sự kiện)
    │   ├── Chương trình trao đổi sinh viên tại ĐH Strasbourg (Pháp)/
    │   ├── Sinh viên Khoa Sinh học nhận học bổng tại Hàn Quốc/
    │   ├── Sinh viên ĐHSPHN nhận học bổng Semester@NIE Singapore/
    │   └── (+ 13 sự kiện khác)
    └── Đổi mới sáng tạo khởi nghiệp/  # Cuộc thi khởi nghiệp sinh viên
        ├── Cuộc thi HS-SV với ý tưởng khởi nghiệp năm 2025/
        └── Trường ĐHSPHN tham gia vòng CK Quốc gia sv_Startup lần VIII/
```

---

## Chạy cục bộ

Vì scene sử dụng ES modules, **không** mở `Chu_De_4.html` trực tiếp qua `file://`. Phải dùng HTTP server:

```powershell
.\scene\scene-4\start-scene-4.ps1
```

Sau đó mở URL mà script in ra trong terminal.

---

## Trách nhiệm module — tóm tắt nhanh

| Thư mục / File | Trách nhiệm |
|---|---|
| `chu-de-4.js` | Entry point — khởi tạo, lắp module, bắt đầu render loop |
| `config/scene-config.js` | Hằng số kiến trúc, màu sắc, kích thước phòng |
| `data/content.js` | Dữ liệu nội dung trưng bày theo góc phòng |
| `core/` | Tiện ích nền không phụ thuộc state (loader, material, context, audit) |
| `builders/` | Xây kiến trúc vật lý (hub, vỏ phòng, vùng đông) |
| `rooms/build-room.js` | Kết hợp shell + nội dung thành một phòng hoàn chỉnh |
| `objects/` | Primitive và decor tái sử dụng (box, chậu cây) |
| `idea-tree/` | Hệ thống Cây Ý tưởng — runtime, config, data |
| `runtime/` | Vòng lặp render, điều hướng FPS, cập nhật per-frame |
| `ui/` | Modal artifact, DOM lookup, minimap SVG |

---

## Hướng phát triển tiếp theo

- Ảnh trưng bày từ `image/` đang được nâng cấp dần sang `image_v2/` với tổ chức theo chủ đề.
- Khi cần thêm phòng hoặc chủ đề mới, tạo entry trong `data/content.js` và thêm thư mục ảnh tương ứng trong `image_v2/`.
- Nếu cần thêm đối tượng 3D tái sử dụng, đặt trong `objects/architecture/` (kiến trúc) hoặc `objects/decor/` (trang trí).
- Model GLB mới phải tuân theo đặc tả trong `assets/models/idea-tree/IDEA_TREE_ASSET_CONTRACT.md`.
