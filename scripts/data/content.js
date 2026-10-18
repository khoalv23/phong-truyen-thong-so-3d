/* ==========================================================================================
   1. DỮ LIỆU NỘI DUNG TRƯNG BÀY THEO TỪNG PHÒNG (STT1 gần cửa / STT2 tường cuối / STT3 góc trong)
   ========================================================================================== */
export const CONTENT = {
  goc1: {
    stt1: { kind: "video", title: "Tổng quan Chuyển đổi số", desc: "Sự thay đổi phương thức quản lý, giáo dục và sinh hoạt chuyên môn của Đoàn sang các nền tảng App, Website, mạng xã hội và số hóa dữ liệu." },
    stt2: {
      title: "Đội hình \"Bình dân học vụ số\"",
      items: [
        { kind: "doc",   title: "Quyết định thành lập", desc: "Quyết định thành lập đội hình Bình dân học vụ số của Đoàn trường." },
        { kind: "photo", title: "Lớp học số cộng đồng", desc: "Hoạt động phổ cập kỹ năng số cho người dân và sinh viên." },
        { kind: "photo", title: "Hướng dẫn dịch vụ công trực tuyến", desc: "Hỗ trợ thao tác trên các nền tảng dịch vụ công, ứng dụng số." },
        { kind: "video", title: "Sản phẩm truyền thông đa phương tiện", desc: "Các clip, ấn phẩm truyền thông số do đội hình thực hiện." },
        { kind: "doc",   title: "Số liệu lan tỏa", desc: "Thống kê quy mô, số lượt tiếp cận của các hoạt động Bình dân học vụ số." }
      ]
    },
    stt3: { kind: "video", title: "Góc chia sẻ chuyên gia", desc: "Phỏng vấn, chia sẻ từ thầy cô và Ban chủ nhiệm CLB Bình dân học vụ số." }
  },
  goc3: {
    stt1: {
      title: "Bảng ghim ý tưởng khởi nghiệp",
      items: [
        { kind: "doc",   title: "Dự án khởi nghiệp A", desc: "Dự án khởi nghiệp sinh viên đã gọi vốn thành công." },
        { kind: "doc",   title: "Dự án khởi nghiệp B", desc: "Dự án đạt giải cao tại cuộc thi khởi nghiệp sinh viên." },
        { kind: "doc",   title: "Dự án khởi nghiệp C", desc: "Sản phẩm khởi nghiệp ứng dụng công nghệ giáo dục." },
        { kind: "doc",   title: "Góc đóng góp ý tưởng mới", desc: "Không gian mở, cho phép sinh viên tiếp tục ghim thêm ý tưởng." }
      ]
    },
    stt2: { kind: "photo", title: "Hệ sinh thái khởi nghiệp HNUE", desc: "Mô hình triển khai hệ sinh thái khởi nghiệp từ ý tưởng đến kinh doanh của Đoàn Thanh niên – Hội Sinh viên." },
    stt3: {
      title: "Sản phẩm sáng tạo",
      items: [
        { kind: "model3d", title: "Sản phẩm sáng tạo 01", desc: "Mô hình 3D sản phẩm thực tế từ hoạt động sáng tạo của sinh viên." },
        { kind: "model3d", title: "Sản phẩm sáng tạo 02", desc: "Mô hình 3D sản phẩm thực tế từ hoạt động sáng tạo của sinh viên." }
      ]
    }
  },
  goc4: {
    stt1: { kind: "map", title: "HNUE vươn tầm thế giới", desc: "Bản đồ thế giới thể hiện các đường kết nối từ ĐHSP Hà Nội đến các châu lục có sinh viên hiện diện." },
    stt2: {
      title: "Hành trình đại sứ sinh viên",
      items: [
        { kind: "photo", title: "Đại sứ sinh viên 01", desc: "Sinh viên tiêu biểu tham gia chương trình trao đổi quốc tế." },
        { kind: "photo", title: "Đại sứ sinh viên 02", desc: "Sinh viên tiêu biểu tham gia tổ chức Đoàn – Hội quốc tế." },
        { kind: "photo", title: "Đại sứ sinh viên 03", desc: "Chia sẻ cá nhân về hành trình hội nhập quốc tế." },
        { kind: "photo", title: "Đại sứ sinh viên 04", desc: "Chia sẻ cá nhân về hành trình hội nhập quốc tế." }
      ]
    },
    stt3: { kind: "video", title: "Câu chuyện hội nhập", desc: "Video, podcast kể về quá trình hội nhập, trao đổi sinh viên, thể hiện vị thế hiện đại của Nhà trường." }
  },
  goc5: {
    stt1: {
      title: "Sứ mệnh vì cộng đồng",
      items: [
        { kind: "photo", title: "Mang chữ lên vùng cao", desc: "Hoạt động dạy học tình nguyện tại các địa bàn khó khăn." },
        { kind: "photo", title: "Bảo vệ môi trường", desc: "Hoạt động bảo vệ môi trường của tuổi trẻ Sư phạm." },
        { kind: "photo", title: "Xây dựng nông thôn mới", desc: "Đóng góp của sinh viên trong phong trào nông thôn mới." }
      ]
    },
    stt2: { kind: "video", title: "Dấu ấn tình nguyện hè", desc: "Hoạt động của các đội hình tình nguyện tham gia phát triển kinh tế – xã hội tại các địa phương." },
    stt3: {
      title: "Ký ức tri ân",
      items: [
        { kind: "letter", title: "Thư cảm ơn 01", desc: "Lời cảm ơn của học sinh vùng cao gửi tới sinh viên tình nguyện." },
        { kind: "letter", title: "Thư cảm ơn 02", desc: "Dòng tâm sự của học trò dành cho thầy cô, anh chị tình nguyện." },
        { kind: "letter", title: "Sổ lưu bút số", desc: "Không gian để người xem để lại một dòng cảm nhận cá nhân." }
      ]
    }
  }
};

