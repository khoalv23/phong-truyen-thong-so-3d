const ROOT = './image_v2/ĐỔI MỚI SÁNG TẠO KHỞI NGHIỆP';
const at = path => `${ROOT}/${path}`;

const AWARDS_2023 = 'Hội nghị tổng kết, trao Giải thưởng Khoa học – Công nghệ và Ý tưởng Khởi nghiệp dành cho học sinh, sinh viên năm 2023';
const PITCH_2023 = 'Vòng chung khảo cuộc thi “Học sinh, sinh viên trường đại học sư phạm hà nội với ý tưởng khởi nghiệp năm 2023';
const TEAM_JOURNEY = 'Đội thi trường Đại học Sư phạm Hà Nội tham gia cuộc thi “Bệ phóng khởi nghiệp” lần thứ II ';
const STARTUP_2025 = 'Cuộc thi Học sinh, sinh viên Trường Đại học Sư phạm Hà Nội với ý tưởng khởi nghiệp năm 2025';
const NATIONAL_2026 = 'Vòng chung kết Quốc gia cuộc thi “Học sinh, sinh viên với ý tưởng khởi nghiệp - sv_Startup lần thứ VIII”';

// Danh sách tường minh để không sinh đường dẫn tới những ảnh không có trong bộ tư liệu.
export const GOC2_IMAGES = {
  awards2023: [at(`1/${AWARDS_2023}.jpg`), at(`1/${AWARDS_2023} (3).jpg`), at(`1/${AWARDS_2023} (4).jpg`), at(`1/${AWARDS_2023} (6).jpg`)],
  pitch2023: [at(`2/${PITCH_2023}.jpg`), at(`2/${PITCH_2023} (4).jpg`), at(`2/${PITCH_2023} (5).jpg`), at(`2/${PITCH_2023} (6).jpg`)],
  teamJourney: [4, 5, 6, 7].map(number => at(`3/${TEAM_JOURNEY} (${number}).jpg`)),
  startup2025: [1, 3, 5, 6].map(number => at(`4/${STARTUP_2025} (${number}).jpg`)),
  projects: {
    heritage: [1, 2, 3].map(number => at(`Khởi nghiệp/Dự án Bộ thẻ Heritage XR_Bảo tồn Di sản văn hoá Việt Nam/${number}.jpg`)),
    bioto: at('Khởi nghiệp/Dự án Thức ăn chăn nuôi từ bã đậu nành lên men Bioto của sinh viên Trường Đại học Sư phạm Hà Nội tại Cuộc thi Học sinh, Sinh/Dự án _Thức ăn chăn nuôi từ bã đậu nành lên men Bioto_ của sinh viên Trường Đại học Sư phạm Hà Nội tại Cuộc thi Học sinh, Sinh viên với ý tưởng khởi nghiệp lần thứ VII.jpg')
  },
  national2026: {
    unlock: at('5/Nhóm sinh viên thực hiện dự án “Unlock Your Body” của khoa Công tác xã hội - Dự án đạt giải Ba (1).jpg'),
    escape: at('5/Nhóm sinh viên thực hiện dự án “Escaperoom Khoa học” của khoa Vật lí - Dự án đạt giải Khuyến khích (1).jpg'),
    finals: [3, 4, 5].map(number => at(`5/${NATIONAL_2026} (${number}).jpg`))
  }
};

export const GOC2_DESCRIPTIONS = {
  awards2023: 'Ngày 12/01/2024, Trường Đại học Sư phạm Hà Nội tổng kết hoạt động khoa học – công nghệ và ý tưởng khởi nghiệp năm 2023. Có 65 đề tài đạt giải cấp Trường; 12 công trình tham gia giải thưởng cấp quốc gia đều đạt giải; hoạt động thu hút học sinh, sinh viên từ 23 khoa và các trường phổ thông trực thuộc.',
  pitch2023: 'HNUE_STARTUP_2023 tạo môi trường để học sinh, sinh viên trình bày, phản biện và hoàn thiện ý tưởng. Mỗi vòng thi là một bước rèn luyện tư duy dự án, kỹ năng thuyết trình, làm việc nhóm và khả năng hiện thực hóa sáng kiến.',
  teamJourney: 'Hành trình đội thi HNUE tại sân chơi “Bệ phóng khởi nghiệp” ghi lại quá trình thử sức, giao lưu, tiếp nhận phản hồi và hoàn thiện sản phẩm trong môi trường cạnh tranh rộng mở.',
  startup2025: 'Ngày 09/12/2025, Chung kết HNUE_STARTUP_2025 quy tụ 15 dự án được chọn từ hơn 50 dự án tham gia. Các ý tưởng hướng tới giáo dục, công nghệ, hỗ trợ người khuyết tật và bảo vệ môi trường.',
  heritage: 'Bộ thẻ Heritage XR kết hợp trải nghiệm mở rộng với nội dung văn hóa, đưa di sản Việt Nam đến gần người học bằng một hình thức trực quan và giàu tính tương tác.',
  bioto: 'Dự án Bioto khai thác bã đậu nành lên men để phát triển thức ăn chăn nuôi, thể hiện hướng tiếp cận kinh tế tuần hoàn và chuyển hóa kết quả nghiên cứu thành giải pháp thực tiễn.',
  national2026: 'Từ 17–19/04/2026, HNUE lần đầu có hai dự án vào Chung kết quốc gia SV_STARTUP lần thứ VIII, tranh tài cùng 50 dự án và ý tưởng của các cơ sở giáo dục đại học trên cả nước.',
  unlock: '“Unlock Your Body” của sinh viên Khoa Công tác xã hội đạt Giải Ba tại Chung kết quốc gia SV_STARTUP lần thứ VIII năm 2026.',
  escape: '“Escaperoom Khoa học” của sinh viên Khoa Vật lí đạt Giải Khuyến khích tại Chung kết quốc gia SV_STARTUP lần thứ VIII năm 2026.'
};
