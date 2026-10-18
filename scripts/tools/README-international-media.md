# Pipeline media – Hội nhập quốc tế

## Nguồn và manifest

Nguồn gốc được giữ nguyên trong `image_v2/Hội nhập quốc tế`.

Tạo lại manifest:

```powershell
node scripts/tools/build-international-manifest.mjs
```

Kết quả: `scripts/data/international-integration-media.js`, gồm đường dẫn, chủ đề, vùng tường, hash trùng lặp và chế độ hiển thị.

## Tạo bản dẫn xuất

Cần cài `ffmpeg` trong PATH, sau đó chạy:

```powershell
node scripts/tools/derive-international-media.mjs
```

Dùng `--force` để tạo lại toàn bộ. Script sinh thumbnail WebP 512 px, ảnh hiển thị WebP tối đa 4096 px và video H.264 1080p trong `image_v2/.generated/international-integration`, rồi tự cập nhật manifest. File nguồn không bị sửa.

Nếu chưa có FFmpeg, scene dùng trực tiếp JPG/AVIF/MP4 tương thích trình duyệt; HEIF/HEIC vẫn được giữ trong manifest nhưng không dùng làm ảnh cố định.
