const ROOT = "./image_v2/ĐỔI MỚI SÁNG TẠO KHỞI NGHIỆP";
const item = (number, section, title, description, extension = number >= 18 ? ".jpg" : ".png") => ({
  number, section, title, description, path: `${ROOT}/${number}${extension}`
});
export const GOC2_MEDIA = [
  item(1,"research","Hội thảo Khoa học Cán bộ trẻ lần thứ XIII – năm 2025","Hội thảo ngày 22/08/2025 giới thiệu bốn báo cáo tiêu biểu của giảng viên trẻ, tập trung vào đổi mới giáo dục và khả năng ứng dụng trong thực tiễn."),
  item(2,"research","Tổng kết và trao Giải thưởng Khoa học và Công nghệ sinh viên năm 2025","Năm 2025, sinh viên Nhà trường hoàn thành 743 đề tài; 103 đề tài dự thi cấp Trường, 38 đề tài vào chung khảo và 16 đề tài đạt giải cấp Bộ."),
  item(3,"research","Tổng kết Giải thưởng Khoa học và Công nghệ năm 2024","Hội nghị ngày 15/01/2025 ghi nhận thành tích nghiên cứu của giảng viên trẻ và sinh viên, đồng thời phát động phong trào nghiên cứu khoa học năm 2025."),
  item(4,"research","Giải Nhì Giải thưởng Sinh viên nghiên cứu khoa học Euréka 2023","Nhóm sinh viên Khoa Hóa học đạt Giải Nhì với hệ thống thí nghiệm lượng nhỏ phục vụ dạy học Khoa học tự nhiên theo định hướng hóa học xanh."),
  item(5,"research","Dấu ấn HNUE tại Giải thưởng Euréka lần thứ XXVI","Ba đề tài của sinh viên HNUE đạt một Giải Nhì và hai Giải Khuyến khích trong các lĩnh vực khoa học giáo dục, khoa học xã hội và hóa học."),
  item(6,"research","Chung khảo Giải thưởng Khoa học và Công nghệ sinh viên năm 2025","Vòng chung khảo ngày 29/05/2025 tạo diễn đàn học thuật để sinh viên trình bày kết quả, trao đổi chuyên môn và phát triển năng lực nghiên cứu."),
  item(7,"research","Gương mặt Nữ sinh Khoa học Công nghệ Việt Nam 2024","Sinh viên Lê Thị Phương, Khoa Sinh học, là một trong 20 nữ sinh được vinh danh nhờ thành tích nổi bật trong học tập, nghiên cứu và hoạt động cộng đồng."),
  item(8,"research","Chung khảo Giải thưởng Khoa học và Công nghệ cấp Trường năm 2026","Hoạt động thường niên ngày 28/05/2026 ghi nhận các kết quả nghiên cứu tiêu biểu và khẳng định vai trò của khoa học trong đào tạo đại học."),
  item(9,"research","Chung khảo Giải thưởng Khoa học và Công nghệ cấp Trường năm 2024","Ba mươi bảy đề tài thuộc ba hội đồng chuyên môn được lựa chọn từ vòng cấp khoa để trình bày tại vòng chung khảo."),
  item(10,"research","Thành tích tại Giải thưởng Khoa học và Công nghệ sinh viên toàn quốc năm 2025","Trong 628 đề tài từ 112 cơ sở giáo dục đại học, sinh viên HNUE đạt hai Giải Nhất và ba Giải Nhì; Khoa Lịch sử nhận Bằng khen của Bộ trưởng Bộ Giáo dục và Đào tạo."),
  item(11,"training","Chung kết phần thi Tranh biện – Hội thi Nghiệp vụ cấp Trường năm 2024","Vòng chung kết lựa chọn Khoa Vật lí đạt Giải Nhất, Khoa Sinh học đạt Giải Nhì; Khoa Lịch sử và Khoa Tâm lí Giáo dục đạt Giải Ba."),
  item(12,"training","Hội thi Nghiệp vụ Sư phạm cấp Trường năm 2022","Hai mươi mốt khoa và bộ môn tham gia các phần thi truyền thông và sân khấu hóa, thể hiện năng lực chuyên môn, sáng tạo và tinh thần nghề nghiệp."),
  item(13,"training","Hội thi Nghiệp vụ cấp Trường năm 2023","Hội thi đánh giá toàn diện năng lực sinh viên qua các phần thi hiểu biết, tranh biện, truyền thông và sân khấu hóa."),
  item(14,"training","Chung kết Hội thi Nghiệp vụ Sư phạm cấp Trường năm 2025","Các đội thi thể hiện kiến thức chuyên môn và năng lực vận dụng nghiệp vụ qua hai phần thi Hiểu biết và Xử lí tình huống."),
  item(15,"training","Hội thi Nghiệp vụ Sư phạm cấp Trường năm 2020","Hoạt động thường niên góp phần củng cố kỹ năng nghề nghiệp và bồi đắp tình yêu nghề cho sinh viên sư phạm."),
  item(16,"training","Hội thi Nghiệp vụ Sư phạm cấp Trường năm 2024","Phần thi Clip truyền thông và Sáng tạo Photo-booth khuyến khích sinh viên phát huy năng lực truyền thông, thiết kế và làm việc nhóm."),
  item(17,"startup","Chung kết HNUE STARTUP 2025","Mười lăm dự án được lựa chọn từ hơn 50 hồ sơ, tập trung vào giáo dục, công nghệ, hỗ trợ người khuyết tật và phát triển bền vững."),
  item(18,"startup","Đội thi HNUE tham gia “Bệ phóng khởi nghiệp” lần thứ II","Sân chơi giúp sinh viên thử nghiệm ý tưởng, tiếp nhận phản hồi, mở rộng kết nối và hoàn thiện sản phẩm khởi nghiệp."),
  item(19,"startup","Dự án “Unlock Your Body” đạt Giải Ba","Dự án của sinh viên Khoa Công tác xã hội đạt Giải Ba tại Chung kết quốc gia cuộc thi Học sinh, sinh viên với ý tưởng khởi nghiệp lần thứ VIII."),
  item(20,"startup","Dự án “Escaperoom Khoa học” đạt Giải Khuyến khích","Dự án của sinh viên Khoa Vật lí đạt Giải Khuyến khích tại Chung kết quốc gia cuộc thi Học sinh, sinh viên với ý tưởng khởi nghiệp lần thứ VIII.")
];
