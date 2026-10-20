const ROOT = "./image_v2/Chuyển đổi số trong công tác đoàn";
const media = (number, title, zone, extension = ".jpg", extra = {}) => ({
  id: `goc1-selected-${number}`,
  number,
  title,
  caption: title,
  displayPath: `${ROOT}/${number}${extension}`,
  extension: extension.toLowerCase(),
  mediaType: extension.toLowerCase() === ".mp4" ? "video" : "image",
  zone,
  ...extra
});

export const GOC1_SELECTED_MEDIA = [
  media(1, "Tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số”", "platform", ".jpeg"),
  media(2, "Chia sẻ của diễn giả tại tọa đàm “Văn hóa ứng xử và năng lực thích ứng của sinh viên trong bối cảnh chuyển đổi số”", "platform", ".jpeg"),
  media(3, "Tập huấn ứng dụng AI trong học tập và nghiên cứu khoa học 2025", "platform"),
  media(4, "Tọa đàm “Blockchain và AI trong giáo dục và đào tạo giáo viên”", "platform"),
  media(5, "Hội nghị trực tuyến toàn quốc nghiên cứu, học tập, quán triệt nghị quyết và chương trình hành động của Đoàn TNCS Hồ Chí Minh", "platform"),
  media(6, "Đội Bình dân học vụ số với hành trình lan tỏa tri thức, nâng cao kỹ năng số cho cộng đồng", "movement"),
  media(7, "Ra mắt ứng dụng HNUE Youth", "platform"),
  media(8, "Cuộc thi trực tuyến “Sáng mãi tư tưởng Hồ Chí Minh”", "platform"),
  media(9, "Ra mắt HNUE STEM Ecosystem – kiến tạo hệ sinh thái giáo dục STEM toàn diện", "platform"),
  media(10, "Lễ ra mắt Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội", "movement"),
  media(11, "Triển khai chiến dịch dạy học và hỗ trợ học sinh tiếp cận AI tại Trường Nguyễn Tất Thành, Phân hiệu Hà Nam", "community"),
  media(12, "Đội Bình dân học vụ số dạy học và hỗ trợ AI trong Chiến dịch Mùa hè xanh 2026 tại Ninh Bình", "community"),
  media(13, "Đội Bình dân học vụ số dạy học và hỗ trợ AI trong Chiến dịch Mùa hè xanh 2026 tại Ninh Bình", "community"),
  media(14, "Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại Trường Nguyễn Tất Thành, Phân hiệu Hà Nam", "community"),
  media(15, "Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại Trường Nguyễn Tất Thành, Phân hiệu Hà Nam", "community"),
  media(16, "Hoạt động dạy học và hỗ trợ học sinh tiếp cận AI tại Trường Nguyễn Tất Thành, Phân hiệu Hà Nam", "community"),
  media(17, "Phóng sự của VTV1 về hoạt động chuyển đổi số của Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội", "movement", ".png"),
  media(18, "Video phóng sự của VTV1 về hoạt động chuyển đổi số của Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội", "movement", ".mp4", { posterPath: `${ROOT}/17.png` }),
  media(19, "Lễ phát động phong trào “Bình dân học vụ số” và tập huấn kỹ năng cán bộ Đoàn chủ chốt năm học 2025–2026", "movement"),
  media(20, "Mùa hè xanh 2024", "community"),
  media(21, "Mùa hè xanh 2025", "community", ".JPG"),
  media(22, "Hoạt động phối hợp cùng Đoàn phường Cầu Giấy", "community")
];

