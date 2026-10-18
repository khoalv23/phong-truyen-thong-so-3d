// Nguồn dữ liệu cho kiosk: môn học → chủ đề con → câu hỏi trắc nghiệm.
// Được đồng bộ tự động và đầy đủ từ ngân hàng 8 đề thi trong thư mục de_thi.
// Tổng cộng: 180 câu hỏi trắc nghiệm chuẩn xác.
export const KIOSK_QUIZ_DATA = [
  {
    "id": "tu-tuong-hcm",
    "title": "Tư tưởng Hồ Chí Minh",
    "shortTitle": "TTHCM",
    "topics": [
      {
        "id": "tthcm-muc1-nht",
        "title": "Mục 1 – Văn hóa, đạo đức & phong cách HCM (10 câu)",
        "questions": [
          {
            "question": "Trong Thư gửi học sinh nhân ngày khai trường đầu tiên của nước Việt Nam Dân chủ Cộng hòa (tháng 9-1945), Chủ tịch Hồ Chí Minh nhấn mạnh điều gì đối với thế hệ trẻ?",
            "choices": [
              "Tương lai đất nước phụ thuộc phần lớn vào sự học tập của thế hệ trẻ.",
              "Thanh niên cần tích cực tham gia các phong trào xã hội.",
              "Học sinh phải chuẩn bị tham gia xây dựng kinh tế đất nước.",
              "Thế hệ trẻ cần mở rộng giao lưu văn hóa quốc tế."
            ],
            "answer": 0
          },
          {
            "question": "Trong Đề cương văn hóa Việt Nam năm 1943, nền văn hóa mới được xác định cần mang những tính chất cơ bản nào?",
            "choices": [
              "Nhân văn, tiến bộ và sáng tạo.",
              "Dân chủ, hiện đại và hội nhập.",
              "Dân tộc, khoa học và đại chúng.",
              "Tự do, bình đẳng và phát triển."
            ],
            "answer": 2
          },
          {
            "question": "Trong tác phẩm “Đời sống mới” (1947), việc rèn luyện các phẩm chất “cần, kiệm, liêm, chính” được nhấn mạnh nhằm mục tiêu chủ yếu nào?",
            "choices": [
              "Phát triển các hoạt động kinh tế trong xã hội.",
              "Nâng cao hiệu quả quản lý trong bộ máy nhà nước.",
              "Tăng cường kỷ luật trong các tổ chức chính trị.",
              "Hình thành chuẩn mực đạo đức cho xã hội mới."
            ],
            "answer": 3
          },
          {
            "question": "Trong Di chúc viết năm 1969, nội dung liên quan đến thế hệ trẻ được nhấn mạnh là",
            "choices": [
              "tăng cường đào tạo lao động kỹ thuật.",
              "bồi dưỡng thế hệ cách mạng cho đời sau.",
              "phát triển lực lượng thanh niên trong quân đội.",
              "mở rộng hoạt động giáo dục trong nhà trường."
            ],
            "answer": 1
          },
          {
            "question": "Năm 1946, khi trả lời các nhà báo nước ngoài, Chủ tịch Hồ Chí Minh khẳng định: “Một dân tộc dốt là một dân tộc yếu”. Quan điểm này nhấn mạnh nhiệm vụ nào đối với thanh niên?",
            "choices": [
              "Mở rộng các hoạt động giao lưu văn hóa quốc tế.",
              "Tham gia các phong trào xã hội trong cộng đồng.",
              "Tích cực học tập để nâng cao trình độ tri thức.",
              "Phát triển các hoạt động kinh tế cá nhân."
            ],
            "answer": 2
          },
          {
            "question": "Trong những năm kháng chiến chống Pháp (1946 - 1954), lối sống giản dị của Chủ tịch Hồ Chí Minh tại chiến khu Việt Bắc thể hiện rõ bài học nào về phong cách lãnh đạo?",
            "choices": [
              "Đề cao tính linh hoạt trong hoạt động ngoại giao.",
              "Chú trọng xây dựng hình ảnh lãnh đạo trước công chúng.",
              "Tăng cường kỷ luật và tác phong trong công việc.",
              "Gắn bó với nhân dân và thực hành tiết kiệm trong đời sống."
            ],
            "answer": 3
          },
          {
            "question": "Khi phát động phong trào “Đời sống mới” năm 1947, việc vận động nhân dân thực hành tiết kiệm và chống lãng phí nhằm mục tiêu chủ yếu nào?",
            "choices": [
              "Xây dựng nếp sống văn hóa và đạo đức trong xã hội.",
              "Phát triển các hoạt động kinh tế trong kháng chiến.",
              "Nâng cao hiệu quả quản lý của chính quyền địa phương.",
              "Tăng cường kỷ luật trong các tổ chức quần chúng."
            ],
            "answer": 0
          },
          {
            "question": "Trong tác phẩm “Sửa đổi lối làm việc” (1947), Chủ tịch Hồ Chí Minh nhấn mạnh yêu cầu quan trọng nào đối với đội ngũ cán bộ, đảng viên?",
            "choices": [
              "Thường xuyên tự phê bình và phê bình trong công tác.",
              "Tăng cường đào tạo chuyên môn nghiệp vụ cho cán bộ.",
              "Mở rộng các hình thức tuyên truyền trong quần chúng.",
              "Đẩy mạnh hoạt động kiểm tra của các tổ chức đảng."
            ],
            "answer": 0
          },
          {
            "question": "Việc Hồ Chí Minh luôn giữ lối sống giản dị, từ trang phục, nơi ở đến sinh hoạt hằng ngày trong suốt thời gian lãnh đạo đất nước (1945-1969) thể hiện rõ nhất quan điểm nào về đạo đức cách mạng?",
            "choices": [
              "Người lãnh đạo cần xây dựng hình ảnh gần gũi với quần chúng.",
              "Người lãnh đạo phải nêu gương trong đời sống và công tác.",
              "Người lãnh đạo phải chú trọng tác phong trong hoạt động.",
              "Người lãnh đạo cần duy trì kỷ luật trong sinh hoạt cá nhân."
            ],
            "answer": 1
          },
          {
            "question": "Trong quá trình xây dựng xã hội mới sau Cách mạng tháng Tám năm 1945, việc Hồ Chí Minh nhấn mạnh giáo dục đạo đức và xây dựng đời sống văn hóa nhằm mục tiêu lâu dài nào?",
            "choices": [
              "Hình thành con người mới với phẩm chất đạo đức và ý thức xã hội.",
              "Tăng cường hiệu quả quản lý của chính quyền cách mạng.",
              "Mở rộng các hoạt động giáo dục trong toàn xã hội.",
              "Phát triển các phong trào văn hóa trong quần chúng."
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "tthcm-muc1-tda",
        "title": "Mục 1 – Tư tưởng HCM về thanh niên & xây dựng con người mới (20 câu)",
        "questions": [
          {
            "question": "Đồng chí hãy cho biết, trong “Gửi thanh niên và nhi đồng toàn quốc nhân dịp Tết sắp đến” năm 1946, Chủ tịch Hồ Chí Minh đã căn dặn thanh niên thực hành “đời sống mới” bao gồm những nội dung nào sau đây?",
            "choices": [
              "Hăng hái, kiên quyết, không sợ khó, không sợ khổ/Phải siêng học, phải siêng làm, phải tiết kiệm/Việc nên làm thì ta không chờ ai nhắc nhủ và thúc giục để trở thành công dân mới.",
              "Hăng hái, kiên quyết, không sợ khó, không sợ khổ/Phải siêng học, phải siêng làm, phải tiết kiệm/Việc nên làm thì ta không chờ ai nhắc nhủ/Việc nên tránh thì ta không đợi ai ngăn ngừa.",
              "Thanh niên là hăng hái, kiên quyết, không sợ khó, không sợ khổ/Phải siêng học, phải siêng làm, phải tiết kiệm/Việc không nên làm thì ta kiên quyết phải đấu tránh, loại bỏ, không để bị lôi kéo trở thành những phần tử phản cách mạng.",
              "Đâu cần thanh niên có, thanh niên không sợ khó, không sợ khổ/Phải siêng học, phải siêng làm, phải tiết kiệm/Việc không nên làm thì ta kiên quyết phải đấu tránh, loại bỏ, không để bị lôi kéo trở thành những phần tử phản cách mạng."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong “Thư gửi các bạn thanh niên” nhân dịp Hội nghị thanh niên Việt Nam vào ngày 17/08/1947, Chủ tịch Hồ Chí Minh căn dặn “…chớ đặt những chương trình, kế hoạch mênh mông, đọc nghe sướng tai nhưng không thực hiện được. Việc gì cũng cần phải thiết thực, nói được, làm được. Việc gì cũng phải từ nhỏ dần dần đến to, từ dễ dần dần đến khó, từ thấp dần dần đến cao. Một chương trình nhỏ mà thực hành được hẳn hoi, hơn là một trăm chương trình to tát mà làm không được” hàm chứa ý nghĩa gì trong các khẳng định dưới đây?",
            "choices": [
              "Một chương trình nhỏ mà thực hành được hắn hoi, hơn là một trăm chương trình to tát mà làm không được.",
              "Một chương trình lớn được đưa ra cần phải tạo được tiếng vang thì mới là một chương trình có ý nghĩa đối với thanh niên.",
              "Một chương trình đưa ra nên được thực hiện các việc nhỏ trước rồi hãy thực hiện đến các việc khó sau thì mới thật sự thành công.",
              "Một chương trình lớn được coi là một chương trình thành công là nhờ sự góp sức thiết thực của những chương trình nhỏ."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, Chủ tịch Hồ Chí Minh đã từng khẳng định “Thế nào là đời sống mới trong một trường học?” với tư cách là những người thầy và học trò?",
            "choices": [
              "Trong một trường học, mỗi thầy cô cần phải tìm ra cách dạy sao cho phù hợp với từng đối tượng học trò/Mỗi học trò cần đua nhau học tập để trở thành những người thanh niên dân chủ xã hội chủ nghĩa.",
              "Để có một đời sống mới trong trường học, từng thầy cô cần mạnh dạn đề xuất cách dạy học phù hợp với học trò/Mỗi học trò cần đua nhau học tập để trở thành những người thanh niên dân chủ xã hội chủ nghĩa.",
              "Trong một trường học, các thầy nên thi nhau tìm cách dạy sao cho dễ hiểu, dễ nhớ, nhanh chóng và thiết thực/Các trò nên đua nhau học. Đồng thời, biết tiết kiệm giấy bút, biết giữ kỷ luật.",
              "Để có một đời sống mới trong trường học, các thầy nên thi nhau tìm cách dạy sao cho dễ hiểu, dễ nhớ, nhanh chóng và thiết thực/Các trò nên đua nhau học. Đồng thời, biết tiết kiệm giấy bút, biết giữ kỷ luật."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, theo Chủ tịch Hồ Chí Minh trong “Thư gửi thanh niên” nhân dịp Hội nghị thanh niên Việt Nam năm 1947 đã từng khẳng định nhiệm vụ của thanh niên phải tìm đủ mọi cách để gây một phong trào thanh niên to lớn và mạnh mẽ, muốn đạt được mục đích đó thì mỗi thanh niên, nhất là một cán bộ phải kiên quyết làm bằng được điều gì đầu tiên?",
            "choices": [
              "Các việc đáng làm, thì có khó mấy cũng cố chịu quyết làm cho kỳ được, không ham địa vị và công danh phú quý trong đời sống.",
              "Đem lòng chí công vô tư mà đối với người, đối với việc, quyết tâm làm gương về mặt siêng năng, tiết kiệm và trong sạch.",
              "Ham làm những việc ích quốc lợi dân, chớ kiêu ngạo, tự mãn, tự túc, nói ít làm nhiều, thân ái đoàn kết.",
              "Các sự hy sinh khó nhọc thì mình làm trước người ta, còn sự sung sướng thanh nhàn thì mình nhường người ta hưởng trước."
            ],
            "answer": 3
          },
          {
            "question": "Đồng chí hãy cho biết, trên đường đi công tác, tại khu rừng Nà Tu, Chủ tịch Hồ Chí Minh đã đến thăm đơn vị Thanh niên xung phong 312 làm nhiệm vụ bảo vệ cầu Nà Cù, sau khi ân cần thăm hỏi và căn dặn các đội viên khắc phục khó khăn, hoàn thành nhiệm vụ, Người đã làm bài thơ nào tặng thanh niên?",
            "choices": [
              "Không có việc gì khó.",
              "Khuyên thanh niên.",
              "Lên Đàng",
              "Thế hệ cách mạng."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong bài “Nói chuyện với nam nữ thanh niên học sinh các trường trung học Nguyễn Trãi, Chu Văn An và Trưng Vương (Hà Nội)” năm 1954, Chủ tịch Hồ chí Minh đã khẳng định nhiệm vụ chính của họ là:",
            "choices": [
              "kháng chiến.",
              "học tập.",
              "thi đua.",
              "làm cách mạng."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong bài “Nói chuyện với nam nữ thanh niên học sinh các trường trung học Nguyễn Trãi, Chu Văn An và Trưng Vương (Hà Nội)” năm 1954, Chủ tịch Hồ chí Minh đã khẳng định mục đích của việc học là để phụng sự ai?",
            "choices": [
              "phụng sự Tổ quốc, phụng sự nhân dân, làm cho dân giàu, nước mạnh.",
              "phụng sự Tổ quốc, phụng sự nhân dân ưa chuộng hoà bình trên thế giới.",
              "phụng sự Tổ quốc, phụng sự đồng bào, phụng sự nhân dân cần lao.",
              "phụng sự Tổ quốc, phụng sự nhân dân, phụng sự người làm cách mạng."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, theo tư tưởng Hồ Chí Minh, ngày nay, khi đã giành được độc lập, tự do, việc học của thanh niên học sinh đã khác hẳn mục đích giáo dục nô lệ của thực dân phong kiến chỉ để đào tạo ra những trí thức nô lệ để hầu hạ chúng, cho nên bây giờ phải học để yêu:",
            "choices": [
              "Tổ quốc, nhân dân, lao động, học tập, đạo đức.",
              "Tổ quốc, đồng bào, lao động, khoa học, đạo đức.",
              "Tổ quốc, nhân dân, lao động, khoa học, đạo đức.",
              "Tổ quốc, đồng bào, lao động, học tập, đạo đức."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, trong “Thư gửi giáo viên, học sinh, cán bộ thanh niên và nhi đồng” năm 1955, Chủ tịch Hồ Chí Minh đã nêu rõ nhiệm vụ của cấp giáo dục đại học là:",
            "choices": [
              "cần kết hợp lý luận khoa học với thực hành, ra sức học tập lý luận và khoa học tiên tiến của các nước bạn, kết hợp với thực tiễn nước ta, để thiết thực giúp ích cho công cuộc xây dựng nước nhà.",
              "cần kết hợp lý luận với thực tiễn, ra sức học tập lý luận và khoa học tiên tiến của các nước bạn, kết hợp với thực tiễn nước ta, để thiết thực giúp ích cho công cuộc phát triển Tổ quốc xã hội chủ nghĩa.",
              "cần kết hợp lý luận khoa học với thực tiễn, ra sức học tập lý luận chính trị và khoa học tiên tiến của các nước bạn, kết hợp với thực tiễn nước ta, để thiết thực giúp ích cho công cuộc xây dựng nước nhà.",
              "cần kết hợp lý luận với thực tiễn, ra sức học tập chính trị và khoa học tiên tiến của các nước bạn, kết hợp với thực tiễn nước ta, để thiết thực giúp ích cho công cuộc phát triển Tổ quốc xã hội chủ nghĩa."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, trong “Thư gửi giáo viên, học sinh, cán bộ thanh niên và nhi đồng” năm 1955, Chủ tịch Hồ Chí Minh đã nêu rõ nhiệm vụ của cấp giáo dục trung học là:",
            "choices": [
              "cần đảm bảo cho học trò những tri thức phổ thông chắc chắn, thiết thực, thích hợp với nhu cầu và tiền đồ xây dựng nước nhà, bỏ những phần nào không cần thiết cho đời sống thực tế.",
              "cần phổ biến cho học trò những tri thức phổ thông nền tảng, thiết thực, thích hợp với nhu cầu và tiền đồ xây dựng đất nước, bỏ những phần không cần thiết cho đời sống thực tế.",
              "cần đảm bảo cho học trò được học đi đôi với hành, những tri thức phổ thông phải là nền tảng, thiết thực, thích hợp với nhu cầu và tiền đồ xây dựng đất nước, bỏ những phần không cần thiết cho đời sống thực tế.",
              "cần phổ biến cho học trò những tri thức phổ thông để làm nền tảng thiết thực đáp ứng nhu cầu và tiền đồ xây dựng đất nước, bỏ những phần không cần thiết cho đời sống thực tế."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, trong “Thư gửi giáo viên, học sinh, cán bộ thanh niên và nhi đồng” năm 1955, Chủ tịch Hồ Chí Minh đã nêu rõ nhiệm vụ của cấp giáo dục tiểu học là:",
            "choices": [
              "cần giáo dục yêu Tổ quốc, yêu đồng bào, yêu lao động, yêu học tập, kính trên nhường dưới.",
              "giáo dục yêu Tổ quốc, giáo dục đức tính khiêm tốn – thật thà – dũng cảm – hy sinh vì lý tưởng cách mạng.",
              "giáo dục yêu Tổ quốc, giáo dục đức tính cần – kiệm – liêm – chính – chí công vô tư – hy sinh vì lý tưởng cách mạng.",
              "cần giáo dục yêu Tổ quốc, yêu nhân dân, yêu lao động, yêu khoa học, trọng của công."
            ],
            "answer": 3
          },
          {
            "question": "Đồng chí hãy cho biết, khi phát biểu tại lễ khai giảng khóa I ở trường Đại học Nhân dân Việt Nam ngày 19/01/1955, Chủ tịch Hồ Chí Minh đã từng nói một trong những điều thanh niên nên làm là “phải quan tâm đến việc xây dựng và khôi phục lại nước nhà”. Vì vậy, nhiệm vụ của thanh niên là:",
            "choices": [
              "Không phải là hỏi nước nhà đã cho mình những gì. Mà phải tự hỏi mình đã làm gì cho nước nhà?",
              "Không phải là hỏi nước nhà đã cho mình những gì. Mà phải tự hỏi mình đã sẵn. sàng vì lý tưởng của nước nhà hay chưa?",
              "Không phải là hỏi nước nhà đã cho mình những gì. Mà phải tự hỏi mình đã sẵn sàng vì Tổ quốc hay chưa?",
              "Không phải là hỏi nước nhà đã cho mình những gì. Mà phải tự hỏi mình đã vì lợi ích nước nhà mà hy sinh phấn đấu chừng nào?"
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy lựa chọn đáp án đúng để hoàn thiện câu nói sau đây của Chủ tịch Hồ Chí Minh: “… sẽ làm chủ nước nhà, phải … mãi, … mãi, mới thật là …” (Bài viết “Nhiệm vụ của thanh niên ta” đăng trên Báo Nhân dân, số 657, ngày 20/12/1955).",
            "choices": [
              "Thanh niên, phụng sự, lao động, thanh niên.",
              "Thanh niên, phụng sự, tiến bộ, thanh niên.",
              "Thanh niên, học tập, tiến bộ, thanh niên.",
              "Thanh niên, học tập, lao động, thanh niên."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, trong bản “Di chúc” của Chủ tịch Hồ Chí Minh, Người đã căn dặn “Đảng cần phải chăm lo giáo dục đạo đức cách mạng cho *họ,* đào tạo *họ* thành những người thừa kế xây dựng chủ nghĩa xã hội vừa “hồng” vừa “chuyên”, “họ” ở đây là lực lượng nào?",
            "choices": [
              "Đoàn viên và chiến sĩ.",
              "Sinh viên và học sinh.",
              "Thanh niên học sinh và cán bộ.",
              "Đoàn viên và thanh niên."
            ],
            "answer": 3
          },
          {
            "question": "Đồng chí hãy cho biết nhận định trong “Thư gửi thanh niên” Bác viết tháng 04/1951, Bác đã khẳng định huy hiệu của thanh niên ta là:",
            "choices": [
              "Tay cầm cờ đỏ búa liềm xung phong.",
              "Tay cầm cờ đỏ búa liềm tiến lên.",
              "Tay cầm cờ đỏ sao vàng xung phong.",
              "Tay cầm cờ đỏ sao vàng tiến lên."
            ],
            "answer": 3
          },
          {
            "question": "Đồng chí hãy cho, câu nói “Một năm khởi đầu từ mùa Xuân. Một đời khởi đầu từ tuổi trẻ. Tuổi trẻ là mùa xuân của xã hội” của Chủ tịch Hồ Chí Minh được Người nêu ra vào thời gian nào?",
            "choices": [
              "Năm 1945.",
              "Năm 1946.",
              "Năm 1947.",
              "Năm 1948."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết nhận định: “Thanh niên là người chủ tương lai là người chủ tương lai của nước nhà. Thật vậy nước nhà thịnh hay suy, yếu hay mạnh một phần lớn là do các thanh niên. Thanh niên muốn làm người chủ tương lai cho xứng đáng thì ngay hiện tại phải rèn luyện tinh thần và lực lượng của mình, phải ra làm việc để chuẩn bị cái tương lai đó.**”** của chủ tịch Hồ Chí Minh đề cập đến trong tác phẩm nào?",
            "choices": [
              "Thư gửi đồng bào Nam Bộ (1946).",
              "Di chúc (1969).",
              "Thư gửi các bạn thanh niên (17/8/1947).",
              "Thư gửi cán bộ Đoàn Thanh niên Lao động Việt Nam toàn miền Bắc (1962)."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, theo tư tưởng Hồ Chí Minh, trong công cuộc kiến thiết nước nhà, văn hóa đứng ngang với mấy lĩnh vực hoạt động khác của xã hội?",
            "choices": [
              "3.",
              "4.",
              "5.",
              "6."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết bốn vấn đề mà Chủ tịch Hồ Chí Minh cho rằng: “Trong công cuộc kiến thiết nước nhà có bốn vấn đề cùng phải chú ý đến, cùng phải coi trọng ngang nhau” là những vấn đề gì?",
            "choices": [
              "Khoa học, văn hóa, văn nghệ, thể thao.",
              "Chính trị, kinh tế, xã hội, văn hóa.",
              "Công nghiệp, nông nghiệp, dịch vụ, thương mại.",
              "Văn hóa, y tế, giáo dục, thể thao."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong “Bài nói chuyện tại Đại hội Đại biểu toàn quốc Đoàn Thanh niên Lao động Việt Nam”, Chủ tịch Hồ Chí Minh đã căn dặn muốn Đoàn củng cố và phát triển, thì tất cả đoàn viên phải gương mẫu:",
            "choices": [
              "giữ vững đạo đức cách mạng, lối sống trong sáng, tác phong nhanh nhẹn, xung phong trong mọi công tác, ra sức học tập chính trị, văn hoá, rèn luyện thân thể.",
              "giữ vững đạo đức cách mạng, lối sống lành mạnh, tác phong nhanh nhẹn, xung phong trong mọi công tác, ra sức học tập chính trị, văn hoá, rèn luyện thân thể.",
              "giữ vững đạo đức cách mạng, xung kích trong mọi công tác, cố gắng học tập lý luận, khoa học, thực hành nghề nghiệp, rèn luyện thân thể cho khoẻ mạnh.",
              "giữ vững đạo đức cách mạng, xung phong trong mọi công tác, cố gắng học tập chính trị, văn hoá, nghề nghiệp, rèn luyện thân thể cho khoẻ mạnh."
            ],
            "answer": 3
          }
        ]
      },
      {
        "id": "tthcm-muc3-hieu-biet-doan",
        "title": "Mục 3 – Hiểu biết chung về Đoàn TNCS Hồ Chí Minh (30 câu)",
        "questions": [
          {
            "question": "Đoàn Thanh niên Cộng sản Hồ Chí Minh được thành lập vào ngày nào?",
            "choices": [
              "03/02/1930",
              "26/03/1930",
              "26/03/1931",
              "02/09/1945"
            ],
            "answer": 2
          },
          {
            "question": "Tên gọi đầu tiên của Đoàn Thanh niên Cộng sản Hồ Chí Minh là gì?",
            "choices": [
              "Đoàn Thanh niên Dân chủ Đông Dương",
              "Đoàn Thanh niên Cộng sản Đông Dương",
              "Đoàn Thanh niên Phản đế Đông Dương",
              "Đoàn Thanh niên Lao động Việt Nam"
            ],
            "answer": 1
          },
          {
            "question": "Đoàn Thanh niên Cộng sản Hồ Chí Minh là tổ chức chính trị – xã hội của ai?",
            "choices": [
              "Thanh niên và sinh viên Việt Nam",
              "Sinh niên Việt Nam",
              "Thanh niên ưu tú Việt Nam",
              "Thanh niên Việt Nam do Đảng Cộng sản Việt Nam lãnh đạo"
            ],
            "answer": 3
          },
          {
            "question": "Phong trào “Ba sẵn sàng” ra đời trong thời kỳ nào?",
            "choices": [
              "Kháng chiến chống Pháp",
              "Kháng chiến chống Mỹ",
              "Thời kỳ đổi mới",
              "Thời kỳ xây dựng CNXH ở miền Bắc"
            ],
            "answer": 1
          },
          {
            "question": "Khẩu hiệu hành động của công tác Đoàn và phong trào Thanh niên Trường ĐHSP Hà Nội được công bố tại Đại hội Đoàn Trường Đại học Sư phạm Hà Nội lần thứ XXI, nhiệm kỳ 2024 – 2027 là gì?",
            "choices": [
              "Đoàn kết – Tiên phong – Năng động – Hội nhập – Phát triển",
              "Đoàn kết – Tiên phong – Năng động – Sáng tạo – Phát triển",
              "Chuẩn mực – Tiên phong – Năng động – Hội nhập - Phát triển",
              "Chuẩn mực – Tiên phong – Năng động – Sáng tạo - Phát triển"
            ],
            "answer": 1
          },
          {
            "question": "Chương trình “Thanh niên tình nguyện” chính thức được phát động mạnh mẽ từ năm nào?",
            "choices": [
              "1986",
              "1990",
              "2000",
              "2010"
            ],
            "answer": 2
          },
          {
            "question": "Cuộc vận động “Tuổi trẻ Việt Nam học tập và làm theo lời Bác” gắn với tư tưởng của ai?",
            "choices": [
              "Võ Nguyên Giáp",
              "Trường Chinh",
              "Hồ Chí Minh",
              "Phạm Văn Đồng"
            ],
            "answer": 2
          },
          {
            "question": "Đại hội Đoàn toàn quốc lần thứ XII (2022–2027) xác định khẩu hiệu hành động là gì?",
            "choices": [
              "Đoàn kết – Xung kích – Sáng tạo – Phát triển",
              "Khát vọng – Tiên phong – Đoàn kết – Bản lĩnh – Sáng tạo – Phát triển",
              "Thanh niên Việt Nam bản lĩnh, trí tuệ, xung kích, sáng tạo",
              "Tuổi trẻ Việt Nam tiên phong chuyển đổi số"
            ],
            "answer": 1
          },
          {
            "question": "Đội Thiếu niên Tiền phong Hồ Chí Minh do tổ chức nào phụ trách?",
            "choices": [
              "Hội Sinh viên Việt Nam",
              "Hội Liên hiệp Thanh niên Việt Nam",
              "Đoàn Thanh niên Cộng sản Hồ Chí Minh",
              "Bộ Giáo dục và Đào tạo"
            ],
            "answer": 2
          },
          {
            "question": "Một trong ba phong trào hành động cách mạng lớn của Đoàn hiện nay là:",
            "choices": [
              "Thanh niên lập nghiệp",
              "Tuổi trẻ sáng tạo",
              "Khi tôi 18",
              "Sinh viên 5 tốt"
            ],
            "answer": 1
          },
          {
            "question": "Cờ của Đoàn Thanh niên Cộng sản Hồ Chí Minh có đặc điểm nào sau đây?",
            "choices": [
              "Nền đỏ, hình chữ nhật, chiều rộng bằng 1/2 chiều dài.",
              "Nền đỏ, hình chữ nhật, chiều rộng bằng 2/3 chiều dài.",
              "Nền đỏ, hình chữ nhật, chiều rộng bằng 2/5 chiều dài.",
              "Nền đỏ, hình chữ nhật, chiều rộng bằng 3/4 chiều dài."
            ],
            "answer": 1
          },
          {
            "question": "Đường kính huy hiệu trên cờ Đoàn bằng bao nhiêu so với chiều rộng lá cờ?",
            "choices": [
              "1/3 chiều rộng cờ.",
              "1/2 chiều rộng cờ.",
              "2/5 chiều rộng cờ.",
              "3/5 chiều rộng cờ."
            ],
            "answer": 2
          },
          {
            "question": "Tác giả của huy hiệu Đoàn Thanh niên Cộng sản Hồ Chí Minh là ai?",
            "choices": [
              "Họa sĩ Tôn Đức Lượng.",
              "Họa sĩ Huỳnh Văn Thuận.",
              "Họa sĩ Phạm Ngữ.",
              "Họa sĩ Hoàng Hòa."
            ],
            "answer": 1
          },
          {
            "question": "Ý tưởng chủ đạo khi sáng tác huy hiệu Đoàn là gì?",
            "choices": [
              "Hình ảnh thanh niên lao động xây dựng đất nước.",
              "Hình ảnh bàn tay cầm lá cờ đỏ sao vàng tiến lên.",
              "Hình ảnh đoàn viên đứng dưới cờ Tổ quốc.",
              "Hình ảnh thanh niên học tập và rèn luyện."
            ],
            "answer": 1
          },
          {
            "question": "Bài ca chính thức của Đoàn Thanh niên Cộng sản Hồ Chí Minh là bài nào?",
            "choices": [
              "Tiến quân ca.",
              "Thanh niên xung phong.",
              "Thanh niên làm theo lời Bác.",
              "Tuổi trẻ thế hệ Bác Hồ."
            ],
            "answer": 2
          },
          {
            "question": "Câu thơ của Chủ tịch Hồ Chí Minh đã trở thành cảm hứng cho bài hát “Thanh niên làm theo lời Bác” là gì?",
            "choices": [
              "Vì lợi ích mười năm trồng cây.",
              "Không có việc gì khó, chỉ sợ lòng không bền.",
              "Đâu cần thanh niên có, đâu khó có thanh niên.",
              "Tuổi trẻ là mùa xuân của xã hội."
            ],
            "answer": 1
          },
          {
            "question": "Độ tuổi được xét kết nạp vào Đoàn Thanh niên Cộng sản Hồ Chí Minh là:",
            "choices": [
              "Từ 15 đến 30 tuổi",
              "Từ 16 đến 30 tuổi",
              "Từ 16 đến 28 tuổi",
              "Từ 18 đến 30 tuổi"
            ],
            "answer": 1
          },
          {
            "question": "Hội nghị chi đoàn xét kết nạp đoàn viên khi có sự tán thành của:",
            "choices": [
              "Trên 1/3 số đoàn viên có mặt",
              "Trên 1/2 số đoàn viên có mặt",
              "Trên 2/3 số đoàn viên có mặt",
              "Toàn bộ đoàn viên"
            ],
            "answer": 1
          },
          {
            "question": "Đoàn viên không tham gia sinh hoạt hoặc không đóng đoàn phí trong bao lâu (không có lý do chính đáng) thì có thể bị xóa tên?",
            "choices": [
              "2 tháng trong một năm",
              "3 tháng trong một năm",
              "4 tháng trong một năm",
              "6 tháng trong một năm"
            ],
            "answer": 1
          },
          {
            "question": "Nhiệm kỳ của Đại hội đại biểu toàn quốc Đoàn TNCS Hồ Chí Minh là:",
            "choices": [
              "3 năm",
              "4 năm",
              "5 năm",
              "6 năm"
            ],
            "answer": 2
          },
          {
            "question": "Đoàn viên quá bao nhiêu tuổi thì làm lễ trưởng thành Đoàn?",
            "choices": [
              "28 tuổi",
              "30 tuổi",
              "32 tuổi",
              "35 tuổi"
            ],
            "answer": 1
          },
          {
            "question": "Đoàn TNCS Hồ Chí Minh là:",
            "choices": [
              "Đội dự bị của Đảng Cộng sản Việt Nam",
              "Cánh tay của Đảng",
              "Tổ chức xã hội của thanh niên",
              "Tổ chức độc lập"
            ],
            "answer": 0
          },
          {
            "question": "Đoàn TNCS Hồ Chí Minh lấy chủ nghĩa nào làm nền tảng tư tưởng?",
            "choices": [
              "Chủ nghĩa Mác – Lênin",
              "Chủ nghĩa Mác – Lênin và tư tưởng Hồ Chí Minh",
              "Tư tưởng Hồ Chí Minh",
              "Chủ nghĩa xã hội"
            ],
            "answer": 1
          },
          {
            "question": "Cơ sở của tổ chức Đoàn là:",
            "choices": [
              "Chi đoàn",
              "Đoàn cơ sở",
              "Huyện đoàn",
              "Tỉnh đoàn"
            ],
            "answer": 0
          },
          {
            "question": "Chi đoàn được thành lập khi có ít nhất:",
            "choices": [
              "2 đoàn viên",
              "3 đoàn viên",
              "4 đoàn viên",
              "5 đoàn viên"
            ],
            "answer": 1
          },
          {
            "question": "Một trong những nhiệm vụ của đoàn viên là:",
            "choices": [
              "Tham gia hoạt động kinh doanh",
              "Phấn đấu vì lý tưởng xã hội chủ nghĩa",
              "Quản lý các tổ chức xã hội",
              "Điều hành các phong trào thanh niên"
            ],
            "answer": 1
          },
          {
            "question": "Một trong những quyền của đoàn viên là:",
            "choices": [
              "Được tham gia quản lý nhà nước",
              "Được ứng cử, đề cử và bầu cử cơ quan lãnh đạo của Đoàn",
              "Được tham gia điều hành chính quyền",
              "Được thành lập tổ chức chính trị"
            ],
            "answer": 1
          },
          {
            "question": "Một trong những nhiệm vụ của tổ chức cơ sở Đoàn là:",
            "choices": [
              "Đại diện, chăm lo và bảo vệ lợi ích chính đáng của đoàn viên, thanh thiếu nhi",
              "Quản lý thanh niên trong xã hội",
              "Điều hành các cơ quan nhà nước",
              "Quản lý các doanh nghiệp"
            ],
            "answer": 0
          },
          {
            "question": "Một trong những nội dung của phong trào **“Thanh niên lập nghiệp”** là:",
            "choices": [
              "Tham gia hoạt động ngoại giao",
              "Phát triển các mô hình thanh niên tham gia phát triển kinh tế – xã hội",
              "Quản lý các cơ quan nhà nước",
              "Tổ chức các hoạt động nghệ thuật"
            ],
            "answer": 1
          },
          {
            "question": "Mỗi đoàn viên TNCS Hồ Chí Minh phải có những giấy tờ, vật dụng nào?",
            "choices": [
              "Sổ đoàn viên, thẻ đoàn viên, huy hiệu Đoàn",
              "Sổ đoàn viên và giấy giới thiệu",
              "Thẻ đoàn viên và sổ sinh hoạt",
              "Huy hiệu Đoàn và giấy chứng nhận"
            ],
            "answer": 0
          }
        ]
      }
    ]
  },
  {
    "id": "dai-hoi-xiv",
    "title": "Đại hội XIV & Phát triển đất nước",
    "shortTitle": "ĐH XIV",
    "topics": [
      {
        "id": "dhxiv-kinh-te-xa-hoi",
        "title": "Định hướng phát triển kinh tế – xã hội & Chuyển đổi số (20 câu)",
        "questions": [
          {
            "question": "Một trong những định hướng phát triển đất nước trong giai đoạn mới được nhấn mạnh tại Đại hội XIV là",
            "choices": [
              "thúc đẩy tăng trưởng kinh tế gắn với bảo đảm tiến bộ và công bằng xã hội.",
              "đẩy mạnh phát triển công nghiệp nặng dựa trên khai thác tài nguyên.",
              "mở rộng quy mô sản xuất nông nghiệp theo hướng tự cung tự cấp.",
              "tăng cường đầu tư vào các ngành sản xuất truyền thống."
            ],
            "answer": 0
          },
          {
            "question": "Trong chiến lược phát triển quốc gia, chuyển đổi số được xem là",
            "choices": [
              "động lực quan trọng thúc đẩy đổi mới mô hình tăng trưởng.",
              "giải pháp hỗ trợ quản lý hành chính trong khu vực nhà nước.",
              "công cụ chủ yếu phục vụ hoạt động thương mại điện tử.",
              "phương thức ứng dụng công nghệ trong lĩnh vực công nghiệp."
            ],
            "answer": 0
          },
          {
            "question": "Một trong những động lực quan trọng của phát triển kinh tế được xác định trong giai đoạn mới là",
            "choices": [
              "mở rộng quy mô lao động phổ thông.",
              "tăng cường khai thác tài nguyên thiên nhiên.",
              "phát triển nguồn nhân lực chất lượng cao.",
              "gia tăng quy mô đầu tư công."
            ],
            "answer": 2
          },
          {
            "question": "Đại hội XIV tiếp tục nhấn mạnh yêu cầu",
            "choices": [
              "đổi mới phương thức quản lý trong hệ thống hành chính.",
              "mở rộng quy mô tổ chức đảng trong doanh nghiệp.",
              "tăng cường luân chuyển cán bộ giữa các địa phương.",
              "xây dựng Đảng trong sạch, vững mạnh toàn diện."
            ],
            "answer": 3
          },
          {
            "question": "Một định hướng quan trọng của phát triển bền vững là",
            "choices": [
              "tăng cường nhập khẩu công nghệ nước ngoài.",
              "tăng trưởng kinh tế dựa trên khai thác tài nguyên.",
              "mở rộng quy mô các ngành sản xuất truyền thống.",
              "gắn phát triển kinh tế với bảo vệ môi trường sinh thái."
            ],
            "answer": 3
          },
          {
            "question": "Trong bối cảnh phát triển kinh tế tri thức, thanh niên cần chú trọng",
            "choices": [
              "nâng cao trình độ học tập và năng lực chuyên môn.",
              "mở rộng các hoạt động kinh doanh cá nhân.",
              "phát triển các ngành nghề truyền thống.",
              "tham gia các hoạt động văn hóa cộng đồng."
            ],
            "answer": 0
          },
          {
            "question": "Một trong những yêu cầu quan trọng đối với thanh niên hiện nay là",
            "choices": [
              "tập trung phát triển kinh tế cá nhân lâu dài.",
              "phát huy tinh thần sáng tạo trong học tập và lao động.",
              "mở rộng quan hệ giao lưu văn hóa quốc tế.",
              "tăng cường các hoạt động giải trí tập thể."
            ],
            "answer": 1
          },
          {
            "question": "Trong công cuộc phát triển đất nước, thanh niên được kỳ vọng là",
            "choices": [
              "lực lượng chủ yếu trong hoạt động thương mại.",
              "lực lượng lao động phổ thông trong sản xuất.",
              "lực lượng tiên phong trong đổi mới sáng tạo.",
              "lực lượng hỗ trợ trong các ngành dịch vụ."
            ],
            "answer": 2
          },
          {
            "question": "Một địa phương đẩy mạnh ứng dụng công nghệ số trong quản lý đô thị và dịch vụ công. Chính sách này phản ánh định hướng nào của Đại hội XIV?",
            "choices": [
              "Thúc đẩy chuyển đổi số trong quản trị và phát triển kinh tế.",
              "Mở rộng quy mô đầu tư công trong hạ tầng giao thông.",
              "Phát triển các ngành công nghiệp truyền thống.",
              "Gia tăng khai thác tài nguyên phục vụ sản xuất."
            ],
            "answer": 0
          },
          {
            "question": "Một chương trình đào tạo nhân lực công nghệ cao được triển khai trên phạm vi quốc gia. Chính sách này phù hợp với định hướng nào?",
            "choices": [
              "Phát triển nguồn nhân lực chất lượng cao.",
              "Mở rộng quy mô đào tạo nghề truyền thống.",
              "Gia tăng số lượng lao động phổ thông.",
              "Tăng cường xuất khẩu lao động."
            ],
            "answer": 0
          },
          {
            "question": "Việc tăng cường đầu tư cho nghiên cứu khoa học và đổi mới sáng tạo nhằm mục tiêu chủ yếu nào sau đây?",
            "choices": [
              "Phát triển các ngành nghề truyền thống.",
              "Mở rộng quy mô sản xuất công nghiệp nặng.",
              "Tăng cường khai thác tài nguyên thiên nhiên.",
              "Nâng cao năng lực cạnh tranh của nền kinh tế."
            ],
            "answer": 3
          },
          {
            "question": "Một địa phương triển khai các dự án phát triển kinh tế gắn với bảo vệ hệ sinh thái tự nhiên. Chính sách này thể hiện rõ nhất định hướng nào?",
            "choices": [
              "Mở rộng quy mô các ngành công nghiệp nặng.",
              "Phát triển kinh tế gắn với bảo vệ môi trường.",
              "Gia tăng khai thác tài nguyên thiên nhiên.",
              "Tăng cường phát triển sản xuất truyền thống."
            ],
            "answer": 1
          },
          {
            "question": "Một nhóm sinh viên khởi nghiệp với sản phẩm công nghệ phục vụ nông nghiệp thông minh. Hoạt động này thể hiện rõ nhất vai trò nào của thanh niên?",
            "choices": [
              "Hỗ trợ phát triển các ngành nghề truyền thống.",
              "Góp phần mở rộng các hoạt động thương mại quốc tế.",
              "Tham gia thúc đẩy đổi mới sáng tạo trong phát triển kinh tế.",
              "Thúc đẩy các hoạt động dịch vụ trong cộng đồng."
            ],
            "answer": 2
          },
          {
            "question": "Một thanh niên tích cực tham gia tuyên truyền thông tin chính thống và phản bác tin giả trên mạng xã hội. Hành động này phù hợp với yêu cầu nào hiện nay?",
            "choices": [
              "Tăng cường quảng bá hình ảnh cá nhân.",
              "Phát triển các hoạt động truyền thông cá nhân.",
              "Mở rộng các hoạt động giao lưu trực tuyến.",
              "Tham gia bảo vệ nền tảng tư tưởng của Đảng."
            ],
            "answer": 3
          },
          {
            "question": "Một chương trình giáo dục khuyến khích thanh niên học tập suốt đời và nâng cao kỹ năng nghề nghiệp. Chính sách này nhằm mục tiêu",
            "choices": [
              "phát triển nguồn nhân lực chất lượng cao.",
              "mở rộng thị trường lao động quốc tế.",
              "gia tăng số lượng lao động phổ thông.",
              "thúc đẩy phát triển thương mại dịch vụ."
            ],
            "answer": 0
          },
          {
            "question": "Một địa phương khuyến khích thanh niên tham gia các dự án khởi nghiệp đổi mới sáng tạo. Chính sách này nhằm mục tiêu",
            "choices": [
              "thúc đẩy phát triển kinh tế dựa trên tri thức và công nghệ.",
              "mở rộng quy mô các ngành sản xuất truyền thống.",
              "gia tăng hoạt động thương mại trong khu vực.",
              "phát triển các ngành dịch vụ du lịch địa phương."
            ],
            "answer": 0
          },
          {
            "question": "Việt Nam muốn nâng cao năng lực cạnh tranh trong bối cảnh cách mạng công nghiệp mới, giải pháp phù hợp nhất với định hướng phát triển hiện nay là",
            "choices": [
              "gia tăng số lượng lao động phổ thông trong sản xuất.",
              "mở rộng khai thác tài nguyên thiên nhiên quy mô lớn.",
              "phát triển nguồn nhân lực chất lượng cao và khoa học công nghệ.",
              "tập trung phát triển các ngành sản xuất truyền thống."
            ],
            "answer": 2
          },
          {
            "question": "Một nền kinh tế đạt tốc độ tăng trưởng cao nhưng môi trường sinh thái suy giảm nghiêm trọng. Theo định hướng phát triển hiện nay, giải pháp phù hợp nhất là",
            "choices": [
              "đẩy mạnh các hoạt động thương mại quốc tế.",
              "tiếp tục mở rộng quy mô sản xuất công nghiệp nặng.",
              "tăng cường khai thác tài nguyên phục vụ tăng trưởng.",
              "điều chỉnh mô hình tăng trưởng theo hướng phát triển bền vững."
            ],
            "answer": 3
          },
          {
            "question": "Trong bối cảnh chuyển đổi số toàn cầu, nếu thanh niên không chủ động nâng cao năng lực công nghệ, sẽ có hệ quả trực tiếp nào?",
            "choices": [
              "Các ngành nghề truyền thống suy giảm nhanh chóng.",
              "Hoạt động giao lưu văn hóa quốc tế bị thu hẹp.",
              "Khả năng thích ứng với thị trường lao động mới bị hạn chế.",
              "Hoạt động thương mại điện tử gặp nhiều khó khăn."
            ],
            "answer": 2
          },
          {
            "question": "Việt Nam chú trọng phát triển khoa học công nghệ, giáo dục và đổi mới sáng tạo. Chiến lược này phù hợp nhất với mục tiêu nào?",
            "choices": [
              "Tạo nền tảng phát triển kinh tế tri thức trong dài hạn.",
              "Mở rộng quy mô các ngành sản xuất truyền thống.",
              "Gia tăng khai thác tài nguyên thiên nhiên.",
              "Phát triển các hoạt động thương mại ngắn hạn."
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "dhxiv-thanh-nien-giao-duc",
        "title": "Đại hội XIV – Giáo dục, Thanh niên & Đột phá chiến lược (10 câu)",
        "questions": [
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội Đại biểu toàn quốc lần thứ XIV của Đảng Cộng sản Việt Nam, đột phá chiến lược về nguồn nhân lực đã nhấn mạnh việc phát triển nhân lực chất lượng cao phải gắn liền với lĩnh vực nào là trọng tâm?",
            "choices": [
              "Khoa học, công nghệ và đổi mới sáng tạo.",
              "Quản lý nhà nước và năng lực hội nhập quốc tế.",
              "Tăng cường năng lực số và ngoại ngữ cho người lao động.",
              "Nhu cầu của thị trường lao động và đào tạo nghề."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội Đại biểu toàn quốc lần thứ XIV của Đảng Cộng sản Việt Nam đã nhấn mạnh có bao nhiêu đột phá chiến lược mang tính thên chốt đã được nêu ra?",
            "choices": [
              "1.",
              "2.",
              "3.",
              "4."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, để phát huy mạnh mẽ vai trò làm chủ của thế hệ trẻ Việt Nam, trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã đặt ra yêu cầu gì đối với công tác giáo dục?",
            "choices": [
              "Tăng cường giáo dục về tri thức cách mạng, đạo đức, lối sống, lòng yêu nước, tự hào dân tộc, nuôi dưỡng lẽ sống thanh niên, khát vọng cống hiến, trách nhiệm đối với Tổ quốc, với Nhân dân.",
              "Tăng cường giáo dục về lý tưởng cách mạng, đạo đức, lối sống, lòng yêu nước, tự hào dân tộc, nuôi dưỡng ước mơ, hoài bão, ý chí, khát vọng cống hiến, nêu cao trách nhiệm đối với đất nước, xã hội.",
              "Tăng cường giáo dục về tri thức cách mạng, niềm tin cách mạng, năng lực hành động cách mạng, lòng yêu nước, tinh thần tự tôn dân tộc, khát vọng cống hiến, nêu cao trách nhiệm đối với đất nước, xã hội.",
              "Tăng cường về lý tưởng cách mạng, đạo đức, tác phong, chuyên môn – nghiệp vụ, ý thức tổ chức kỉ luật, nuôi dưỡng ước mơ, hoài bão, ý chí, khát vọng cống hiến, nêu cao trách nhiệm đối với đất nước, xã hội."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã định hướng xây dựng nền giáo dục quốc dân như thế nào?",
            "choices": [
              "Xây dựng nền giáo dục quốc dân tiên tiến, số hoá, thông minh và hiện đại",
              "Xây dựng nền giáo dục quốc dân tiên tiến, chất lượng cao và hội nhập quốc tế.",
              "Xây dựng nền giáo dục quốc dân hiện đại, ngang tầm khu vực và thế giới.",
              "Xây dựng nền giáo dục quốc dân hiện đại, phát triển nhanh và bền vững."
            ],
            "answer": 2
          },
          {
            "question": "Đồng chí hãy cho biết, kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã xác định tư duy, tầm nhìn, những quyết sách chiến lược để chúng ta vững bước tiến mạnh trong kỷ nguyên mới, thực hiện thắng lợi các mục tiêu phát triển đất nước đến năm 2030 dựa trên phương châm:",
            "choices": [
              "Ổn định – Cầu thị – Đột phá – Hội nhập – Phát triển.",
              "Kỷ cương – Đổi mới – Sáng tạo  – Đột phá– Phát triển.",
              "Dân chủ – Kỷ cương – Đoàn kết – Hội nhập – Phát triển.",
              "Đoàn kết – Dân chủ – Kỷ cương – Đột phá – Phát triển."
            ],
            "answer": 3
          },
          {
            "question": "Đồng chí hãy cho biết, Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam xác định thực hiện thắng lợi mục tiêu nào trong các mục tiêu dưới đây?",
            "choices": [
              "Thực hiện thắng lợi mục tiêu đến năm 2030 trở thành nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao; hiện thực hoá tầm nhìn đến năm 2045 trở thành nước phát triển, thu nhập cao.",
              "Thực hiện thắng lợi mục tiêu đến năm 2030 trở thành nước công nghiệp phát triển hiện đại, có thu nhập trung bình cao; hiện thực hoá tầm nhìn đến năm 2045 trở thành nước phát triển, thu nhập cao.",
              "Thực hiện thắng lợi mục tiêu đến năm 2030 trở thành nước đang phát triển có công nghiệp hiện đại, vượt mức thu nhập trung bình cao; hiện thực hoá tầm nhìn đến năm 2045 trở thành nước công nghiệp phát triển, thu nhập cao.",
              "Thực hiện thắng lợi mục tiêu đến năm 2030 trở thành nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao; hiện thực hoá tầm nhìn đến năm 2045 trở thành nước phát triển, có công nghiệp hiện đại, thu nhập cao."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã xác định tiếp tục xây dựng, hoàn thiện đồng bộ thể chế phát triển nhanh và bền vững, trong đó thể chế nào được coi là then chốt?",
            "choices": [
              "thể chế phát triển kinh tế là then chốt.",
              "thể chế chính trị là then chốt.",
              "thể chế quản lý xã hội là then chốt.",
              "thể chế phát triển giáo dục và đào tạo là then chốt."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã xác định những mục tiêu phát triển nào là chủ yếu trong giai đoạn 2026 – 2030?",
            "choices": [
              "Kinh tế – Văn hoá – Xã hội.",
              "Kinh tế – Xã hội – Môi trường.",
              "Kinh tế – Xã hội – Đổi mới sáng tạo.",
              "Kinh tế – Văn hoá – Khoa học công nghệ."
            ],
            "answer": 0
          },
          {
            "question": "Đồng chí hãy cho biết, trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam đã xác lập mô hình tăng trưởng mới với mục tiêu là:",
            "choices": [
              "thúc đẩy tiến bộ, công bằng xã hội, làm cho mọi thành quả của tăng trưởng đều thuộc về Nhân dân.",
              "nâng cao năng suất, chất lượng, hiệu quả, giá trị gia tăng và sức cạnh tranh của nền kinh tế.",
              "nâng cao chất lượng nguồn nhân lực kinh tế số, kinh tế xanh, kinh tế tuần hoàn, kinh tế dữ liệu.",
              "giải phóng sức sản xuất, giải phóng con người, nâng cao sức chống chịu của nền kinh tế."
            ],
            "answer": 1
          },
          {
            "question": "Đồng chí hãy cho biết, nội dung phát triển con người Việt Nam được nêu trong kỳ Đại hội lần thứ XIV của Đảng Cộng sản Việt Nam là gì?",
            "choices": [
              "Phát triển toàn diện con người Việt Nam về đạo đức, trí tuệ, tác phong, ý thức tổ chức kỷ luật, tinh thần thượng tôn pháp luật, sống và làm việc theo Hiến pháp nước Cộng hoà xã hội chủ nghĩa Việt Nam, có năng lực hội nhập quốc tế.",
              "Phát triển toàn diện con người Việt Nam về đạo đức, trí tuệ, tác phong, ý thức tổ chức kỷ luật, tinh thần thượng tôn pháp luật, có năng lực đổi mới sáng tạo, thẩm mỹ, thể lực, kỹ năng sống, kỹ năng nghề nghiệp, kỹ năng số.",
              "Phát triển toàn diện con người Việt Nam về đạo đức, trí tuệ, trách nhiệm công dân, tinh thần thượng tôn pháp luật, sống và làm việc theo Hiến pháp nước Cộng hoà xã hội chủ nghĩa Việt Nam, có năng lực hội nhập quốc tế.",
              "Phát triển toàn diện con người Việt Nam về đạo đức, trí tuệ, ý thức dân tộc, trách nhiệm công dân, thượng tôn pháp luật, năng lực sáng tạo, thẩm mỹ, thể lực, kỹ năng sống, kỹ năng nghề nghiệp, kỹ năng số."
            ],
            "answer": 3
          }
        ]
      }
    ]
  },
  {
    "id": "lich-su-hnue",
    "title": "Truyền thống & Phong trào ĐHSP Hà Nội",
    "shortTitle": "HNUE",
    "topics": [
      {
        "id": "hnue-75-nam-xay-dung-phat-trien",
        "title": "Quá trình 75 năm xây dựng và phát triển HNUE (30 câu)",
        "questions": [
          {
            "question": "Trường Đại học Sư phạm Hà Nội được thành lập vào ngày, tháng, năm nào?",
            "choices": [
              "11/10/1945",
              "10/11/1950",
              "11/10/1951",
              "10/111954"
            ],
            "answer": 2
          },
          {
            "question": "Triết lí giáo dục hiện nay của Trường Đại học Sư phạm Hà Nội là gì?",
            "choices": [
              "Đào tạo nhà giáo, nhà khoa học và chuyên gia xuất sắc có tinh thần nhân văn, tư duy hiện đại, hành động tích cực vì sự phát triển cộng đồng.",
              "Đào tạo nhà giáo, nhà khoa học và chuyên gia giáo dục xuất sắc có tinh thần nhân văn, tư duy hiện đại, hành động tích cực vì sự phát triển cộng đồng.",
              "Đào tạo nhà giáo, nhà khoa học và chuyên gia xuất sắc có tinh thần nhiệt huyết, tư duy hiện đại, hành động tích cực vì sự phát triển của ngành giáo dục.",
              "Đào tạo nhà giáo, nhà khoa học và chuyên gia giáo dục xuất sắc có tinh thần nhân văn, tư duy hiện đại, hành động tích cực vì sự phát triển giáo dục và cộng đồng."
            ],
            "answer": 0
          },
          {
            "question": "Tầm nhìn của Trường Đại học Sư phạm Hà Nội hiện nay là:",
            "choices": [
              "Đến năm 2050, Nhà trường trở thành Đại học Sư phạm trọng điểm đa ngành, đa lĩnh vực hàng đầu trong khu vực và có vị thế cao trên thế giới.",
              "Đến năm 2045, Nhà trường trở thành Đại học Sư phạm trọng điểm đa ngành, đa lĩnh vực hàng đầu trong khu vực và có vị thế cao trên thế giới.",
              "Đến năm 2045, Nhà trường trở thành Đại học Sư phạm Quốc gia trọng điểm đa ngành, đa lĩnh vực hàng đầu trong khu vực và có vị thế cao trên thế giới",
              "Đến năm 2050, Nhà trường trở thành Đại học Sư phạm Quốc gia trọng điểm đa ngành, đa lĩnh vực hàng đầu trong khu vực và có vị thế cao trên thế giới"
            ],
            "answer": 1
          },
          {
            "question": "Năm 2025, Trường Đại học Sư phạm Hà Nội thành lập 3 trường thuộc, là những trường nào?",
            "choices": [
              "Trường Khoa học Giáo dục, Trường Toán học, Trường Giáo dục trẻ thơ.",
              "Trường Giáo dục, Trường Toán học và Công nghệ thông tin, Trường Khoa học phát triển trẻ thơ",
              "Trường Khoa học Giáo dục, Trường Toán học và Công nghệ thông tin, Trường Khoa học phát triển trẻ thơ",
              "Trường Giáo dục, Trường Toán học và Công nghệ thông tin, Trường Khoa học trẻ thơ."
            ],
            "answer": 2
          },
          {
            "question": "Hiệu trưởng đầu tiên của Trường Đại học Sư phạm Hà Nội là ai?",
            "choices": [
              "GS.TSKH. Lê Văn Thiêm",
              "GS.VS. Phạm Huy Thông",
              "GS. Đặng Thai Mai",
              "GS. Nguyễn Lương Ngọc"
            ],
            "answer": 0
          },
          {
            "question": "Hai sinh viên Khoá 75 Khoa Giáo dục Thể chất, Trường Đại học Sư phạm Hà Nội tại SEA Games 33 đã đạt Huy chương Đồng ở nội dung thi đấu nào?",
            "choices": [
              "Nhảy cầu",
              "Cầu lông",
              "Bóng bàn",
              "Đấu kiếm"
            ],
            "answer": 0
          },
          {
            "question": "Đoàn Trường Đại học Sư phạm Hà Nội đón nhận Huân chương Lao động hạng Ba lần thứ hai vào năm nào?",
            "choices": [
              "2025",
              "2024",
              "2023",
              "2022"
            ],
            "answer": 0
          },
          {
            "question": "Chủ tịch Hồ Chí Minh đã về thăm Trường Đại học Sư phạm Hà Nội vào những năm nào?",
            "choices": [
              "1954 và 1958",
              "1960 và 1964",
              "1965 và 1970",
              "1973 và 1975"
            ],
            "answer": 1
          },
          {
            "question": "Trường Sư phạm Cao cấp (nay là Trường Đại học Sư phạm Hà Nội) được thành lập theo nghị định nào của Bộ Quốc gia Giáo dục?",
            "choices": [
              "Nghị định 123/NĐ – Ngày 11/10/1951",
              "Nghị định 276/NĐ - Ngày 11/10/1951",
              "Nghị định 97/CP - Ngày 11/10/1951",
              "Nghị định 201/QĐ-TTg - Ngày 11/10/1951"
            ],
            "answer": 1
          },
          {
            "question": "Trường Đại học Sư phạm Hà Nội chính thức mang tên “Trường Đại học Sư phạm Hà Nội” vào năm nào?",
            "choices": [
              "1999",
              "1997",
              "1995",
              "1998"
            ],
            "answer": 0
          },
          {
            "question": "Trường Đại học Sư phạm Hà Nội được nhận Huân chương Lao động hạng Nhất cho những thành tích xuất sắc trong công tác giáo dục và đào tạo từ năm học 2015 – 2016 đến năm học 2019 – 2022, góp phần vào sự nghiệp xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc năm nào?",
            "choices": [
              "2021",
              "2022",
              "2019",
              "2020"
            ],
            "answer": 0
          },
          {
            "question": "Đâu là giá trị cốt lõi hiện nay của Trường Đại học Sư phạm Hà Nội?",
            "choices": [
              "\"Tiên học lễ, hậu học văn\".",
              "\"Chuẩn mực - Sáng tạo – Tiên phong\".",
              "\"Sáng tạo - Trách nhiệm - Nhân văn\".",
              "\"Đoàn kết - Dân chủ - Đổi mới\"."
            ],
            "answer": 1
          },
          {
            "question": "Chiến dịch tình nguyện hè thường niên lớn nhất của sinh viên HNUE có tên là gì?",
            "choices": [
              "Mùa hè xanh.",
              "Tiếp sức mùa thi.",
              "Chiến dịch Thanh niên tình nguyện Hè.",
              "Sắc vàng hoàng yến."
            ],
            "answer": 0
          },
          {
            "question": "Trường Trung học cơ sở Năng khiếu Đại học Sư phạm, Trường Đại học Sư phạm Hà Nội được thành lập năm nào?",
            "choices": [
              "2025",
              "2024",
              "2026",
              "2023"
            ],
            "answer": 0
          },
          {
            "question": "Cuộc vận động nào sau đây của Đoàn Thanh niên - Hội Sinh viên trường nhằm khích lệ sinh viên rèn luyện toàn diện về Đạo đức, Học tập, Thể lực, Tình nguyện và Hội nhập?",
            "choices": [
              "Phong trào \"Thanh niên tình nguyện\".",
              "Phong trào \"Tuổi trẻ sáng tạo\".",
              "Danh hiệu \"Sinh viên 5 tốt\".",
              "Chương trình \"Đồng hành với thanh niên khởi nghiệp\"."
            ],
            "answer": 2
          },
          {
            "question": "Một trong những nhiệm vụ trọng tâm năm 2026 của Trường Đại học Sư phạm Hà Nội liên quan trực tiếp đến chuyển đổi số là:",
            "choices": [
              "Chuyển đổi số trong công tác khảo thí và quản trị Nhà trường",
              "Chuyển đổi số trong thương mại điện tử",
              "Chuyển đổi số trong công nghiệp",
              "Chuyển đổi số trong nông nghiệp"
            ],
            "answer": 0
          },
          {
            "question": "Ban Chấp hành Đoàn TNCS Trường Đại học Sư phạm Hà Nội đã phát động phong trào “Tam bất kì” vào năm nào?",
            "choices": [
              "Năm 1960",
              "Năm 1962",
              "Năm 1964",
              "Năm 1966"
            ],
            "answer": 2
          },
          {
            "question": "Đâu KHÔNG phải nội dung của phong trào “Tam bất kì” do Đoàn TNCS Trường Đại học Sư phạm Hà Nội khởi xướng?",
            "choices": [
              "Bất kì đi đến nơi nào mà Tổ quốc cần đến.",
              "Bất kì gánh vác trọng trách nào mà tổ chức giao phó.",
              "Bất kì làm nhiệm vụ gì mà Đảng và nhân dân yêu cầu.",
              "Bất kì chế độ hưởng thụ nào cũng chấp nhận."
            ],
            "answer": 1
          },
          {
            "question": "Ý nào sau đây KHÔNG thuộc Ba nhiệm vụ đột phá được xác định tại Đại hội đại biểu toàn quốc Đoàn TNCS Hồ Chí Minh lần thứ XII nhiệm kỳ 2022 – 2027?",
            "choices": [
              "Tập trung xây dựng đội ngũ cán bộ đoàn có bản lĩnh chính trị, có đạo đức, trách nhiệm, năng lực, uy tín, tiên phong, gương mẫu",
              "Nâng cao năng lực ngoại ngữ cho thanh thiếu niên trong nhà trường",
              "Triển khai sâu rộng chương trình \"Thanh niên khởi nghiệp\"",
              "Nâng cao năng lực số nhằm hỗ trợ thanh thiếu niên có nhận thức, thái độ đúng đắn về chuyển đổi số"
            ],
            "answer": 1
          },
          {
            "question": "Theo Quyết định 128/CP, ngày 14/8/1967 của Hội đồng Chính phủ, Trường Đại học Sư phạm Hà Nội được chia thành 3 trường đại học, là những trường nào?",
            "choices": [
              "Trường Đại học Sư phạm Hà Nội I, Trường Đại học Sư phạm Hà Nội II, Trường Đại học Sư phạm Thái Nguyên",
              "Trường Đại học Sư phạm Hà Nội I, Trường Đại học Sư phạm Hà Nội II, Trường Đại học Sư phạm Ngoại ngữ Hà Nội",
              "Trường Đại học Sư phạm Hà Nội I, Trường Đại học Sư phạm Hà Nội II, Trường Đại học Sư phạm Thái Nguyên",
              "Trường Đại học Sư phạm Hà Nội, Trường Đại học Sư phạm Ngoại ngữ Hà Nội, Trường Đại học Sư phạm Thái Nguyên"
            ],
            "answer": 1
          },
          {
            "question": "Giải thưởng “Sáng tạo trẻ” do Ban Chấp hành Đoàn TNCS Trường Đại học Sư phạm Hà Nội tổ chức xét là giải thưởng nhằm phát hiện, tôn vinh, trao tặng cho các cá nhân có sự sáng tạo và đạt thành tích cao trong các lĩnh vực nào dưới đây?",
            "choices": [
              "Lĩnh vực giảng dạy, học tập",
              "Lĩnh vực giảng dạy, học tập và lĩnh vực nghiên cứu khoa học",
              "Lĩnh vực giảng dạy, học tập; lĩnh vực nghiên cứu khoa học; lĩnh vực hoạt động đoàn thể, hoạt động cộng đồng",
              "Lĩnh vực chính trị - tư tưởng; lĩnh vực giảng dạy, học tập; lĩnh vực nghiên cứu khoa học; lĩnh vực hoạt động đoàn thể, hoạt động cộng đồng"
            ],
            "answer": 2
          },
          {
            "question": "Trong những năm tháng sục sôi khí thế “chống Mỹ, cứu nước”, tinh thần xung phong “đi B” đã trở thành niềm vinh dự đặc biệt của thế hệ trẻ Trường Đại học Sư phạm Hà Nội. Hãy cho biết, “đi B” ở đây có nghĩa là gì?",
            "choices": [
              "Đi công tác, chiến đấu ở chiến trường miền Bắc",
              "Đi công tác, chiến đấu ở chiến trường miền Trung",
              "Đi công tác, chiến đấu ở chiến trường miền Nam",
              "Đi công tác, chiến đấu ở đường Trường Sơn"
            ],
            "answer": 2
          },
          {
            "question": "Hãy điền từ còn thiếu trong chỗ trống Đại hội đại biểu toàn quốc Đoàn TNCS Hồ Chí Minh lần thứ XII nhiệm kỳ 2022 – 2027 có khẩu hiệu hành động là: \"Khát vọng - Tiên phong - Đoàn kết - … - Sáng tạo\".",
            "choices": [
              "Đổi mới",
              "Bản lĩnh",
              "Xung kích",
              "Chuẩn mực"
            ],
            "answer": 1
          },
          {
            "question": "Giải thưởng “Sáng tạo trẻ” do Ban Chấp hành Đoàn TNCS Trường Đại học Sư phạm Hà Nội tổ chức xét và trao tặng lần đầu tiên vào năm nào?",
            "choices": [
              "Năm 2015",
              "Năm 2016",
              "Năm 2017",
              "Năm 2018"
            ],
            "answer": 3
          },
          {
            "question": "“Giải thưởng 26 tháng 3” của Đoàn Trường Đại học Sư phạm Hà Nội dành cho các đồng chí cán bộ Đoàn và cán bộ Hội Sinh viên có nhiều thành tích trong học tập, công tác và đóng góp xuất sắc cho công tác Đoàn, phong trào sinh viên Nhà trường được thành lập vào năm nào?",
            "choices": [
              "2001",
              "2004",
              "2007",
              "2010"
            ],
            "answer": 1
          },
          {
            "question": "Tiền thân của Trường Đại học Sư phạm là tổ chức nào?",
            "choices": [
              "Đại học Đông Dương",
              "Trường Cao đẳng Sư phạm Hà Nội",
              "Đại học Quốc gia Hà Nội",
              "Ban Đại học Văn khoa"
            ],
            "answer": 3
          },
          {
            "question": "Trường Đại học Sư phạm Hà Nội là cơ sở đầu tiên thực hiện “đại học hoá” giáo viên Tiểu học, Mầm non và giáo viên dạy trẻ khuyết tật. Việc thực hiện này bắt đầu từ thời gian nào?",
            "choices": [
              "Từ cuối những năm 60 của thế kỉ XX",
              "Từ đầu những năm 70 của thế kỉ XX",
              "Từ đầu những năm 80 của thế kỉ XX",
              "Từ đầu những năm 90 của thế kỉ XX"
            ],
            "answer": 2
          },
          {
            "question": "Vào năm 2004, Trường Đại học Sư phạm vinh dự được nhận danh hiệu cao quý nào?",
            "choices": [
              "Anh hùng Lực lượng vũ trang",
              "Anh hùng Lao động",
              "Huân chương Sao vàng",
              "Huân chương Độc lập"
            ],
            "answer": 1
          },
          {
            "question": "Hãy điền từ còn thiếu vào chỗ trống Trong lần về thăm trường năm 1964, Chủ tịch Hồ Chí Minh đã căn dặn: \"Làm thế nào để Nhà trường này chẳng những là trường … mà còn là trường … của cả nước\"",
            "choices": [
              "sư phạm – mô phạm",
              "mô phạm – sư phạm",
              "sư phạm – khoa học",
              "sư phạm - trọng điểm"
            ],
            "answer": 0
          },
          {
            "question": "Hãy điền từ còn thiếu vào chỗ trống Bác Hồ đã nói rằng:** “***Người thầy giáo tốt - thầy giáo xứng đáng là thầy giáo - là người … nhất. Dù tên tuổi không được đăng trên báo, không được thưởng Huân chương, song những người thầy giáo tốt là …\"",
            "choices": [
              "vẻ vang – những anh hùng vô danh",
              "vẻ vang - những người thầy vô danh",
              "nhiệt huyết - người truyền cảm hứng",
              "nhiệt huyết - những anh hùng vô danh"
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "hnue-hoat-dong-doan-hoi",
        "title": "Hoạt động Đoàn – Hội sinh viên Trường ĐHSP Hà Nội (30 câu)",
        "questions": [
          {
            "question": "Đoàn Trường Đại học Sư phạm Hà Nội phát động phong trào nào nhằm xây dựng hình ảnh sinh viên “trí tuệ – bản lĩnh – nhân văn – trách nhiệm”?",
            "choices": [
              "Thanh niên tình nguyện hè",
              "Xây dựng văn hóa, văn minh học đường",
              "Hội thao Sức trẻ thanh niên",
              "Chào đón tân sinh viên"
            ],
            "answer": 1
          },
          {
            "question": "“Giải thưởng 26 tháng 3” của Đoàn trường ĐHSP Hà Nội dành cho các đồng chí cán bộ Đoàn và cán bộ Hội Sinh viên có nhiều thành tích trong học tập, công tác và đóng góp xuất sắc cho công tác Đoàn, phong trào sinh viên Nhà trường được thành lập vào thời gian nào?",
            "choices": [
              "Năm 2021",
              "Năm 2004",
              "Năm 2006",
              "Năm 2011"
            ],
            "answer": 1
          },
          {
            "question": "Hội thao dành cho Đoàn viên, sinh viên do Đoàn Trường ĐHSP Hà Nội tổ chức năm 2025 có tên gọi là gì?",
            "choices": [
              "Sức trẻ thanh niên",
              "Đại hội thể thao toàn quốc",
              "Vận động thanh niên khỏe",
              "Giải bóng rổ sinh viên"
            ],
            "answer": 0
          },
          {
            "question": "CLB nào sau đây thuộc Hội Sinh viên Trường ĐHSP Hà Nội?",
            "choices": [
              "CLB Robocon Quốc gia",
              "CLB Kịch sân khấu",
              "CLB Chess Vietnam",
              "CLB Nhảy Hip-hop"
            ],
            "answer": 1
          },
          {
            "question": "Chương trình hiến máu được tổ chức thường niên bởi Câu lạc bộ Thanh niên vận động hiến máu - một đơn vị trực thuộc Hội sinh viên Trường và Hội Thanh niên vận động hiến máu Hà Nội có tên là gì?",
            "choices": [
              "Tháng Ba rực rỡ",
              "Sức trẻ thanh niên",
              "Sắc vàng hoàng yến",
              "Hương sắc tháng Ba"
            ],
            "answer": 2
          },
          {
            "question": "Giải thưởng Sáng tạo trẻ năm 2026 của Đoàn trường ĐHSP Hà Nội được trao cho các cá nhân có thành tích xuất sắc trong học t ập và nghiên cứu khoa học là lần thứ bao nhiêu?",
            "choices": [
              "Lần thứ VIII",
              "Lần thứ IX",
              "Lần thứ X",
              "Lần thứ XI"
            ],
            "answer": 1
          },
          {
            "question": "Ngày truyền thống Học sinh, Sinh viên Việt Nam được tổ chức vào ngày nào?",
            "choices": [
              "9/1",
              "26/3",
              "20/11",
              "1/6"
            ],
            "answer": 0
          },
          {
            "question": "Nhân kỷ niệm 60 năm ngày Khởi xướng phong trào “Ba sẵn sàng”, Đoàn trường Đại học Sư phạm Hà Nội đã tổ chức Hội thảo có tên là gì?",
            "choices": [
              "Hội thảo khoa học cán bộ trẻ",
              "Hội thảo khoa học cán bộ trẻ các Trường Sư phạm Toàn quốc",
              "Hội thảo khoa học Từ ba sẵn sàng đến Thanh niên Tình nguyện",
              "Hội thảo khoa học Đổi mới sáng tạo trong dạy học và đào tạo giáo viên"
            ],
            "answer": 2
          },
          {
            "question": "Năm 1966, Đoàn trường Đại học Sư phạm Hà Nội thành lập “Đội Thanh niên Xung phong chống Mĩ cứu nước” gồm 109 thành viên do đồng chí Nguyễn Văn Mạo - Bí thư Đoàn trường - làm Đội trưởng. Đội đã vào tham gia chiến đấu và phục vụ chiến đấu tại địa điểm  nào thuộc tỉnh Thanh Hóa?",
            "choices": [
              "Cầu Hàm Rồng",
              "Cầu Nhật Tân",
              "Cầu Phong Châu",
              "Cầu Long Biên"
            ],
            "answer": 0
          },
          {
            "question": "Đoàn trường Đại học Sư phạm Hà Nội vinh dự là Đoàn trường đầu tiên trong cả nước được Chủ tịch nước tặng thưởng Huân chương Lao động hạng Ba năm nào?",
            "choices": [
              "Năm 2001",
              "Năm 2012",
              "Năm 2024",
              "Năm 2025"
            ],
            "answer": 0
          },
          {
            "question": "Ý nào sau đây không thuộc nội dung của phong trào “Tam bất kì” do Đoàn trường ĐHSP khởi xướng năm 1964?",
            "choices": [
              "Bất kì đi đến nơi nào mà Tổ quốc cần đến;",
              "Bất kì làm nhiệm vụ gì mà Đảng và nhân dân yêu cầu.",
              "Bất kì gánh vác trọng trách nào mà tổ chức giao phó.",
              "Bất kì chế độ hưởng thụ nào cũng chấp nhận."
            ],
            "answer": 2
          },
          {
            "question": "Năm 1963, cuộc vận động này được Đoàn trường Đại học Sư phạm Hà Nội phát động và sau đó nhanh chóng lan rộng ra nhiều trường đại học ở miền Bắc. Đó là cuộc vận động “Xây dựng Phong cách …..mới”. Hãy điền từ còn thiếu trong dấu “…”",
            "choices": [
              "sống",
              "khoa học",
              "nghiên cứu",
              "học tập"
            ],
            "answer": 3
          },
          {
            "question": "Nhân vật chính trong truyện “Em Ngọc” của bác sỹ Nguyễn Trinh Cơ được đưa vào “Tuyển tập Văn thơ cách mạng và kháng chiến” và sách Tiếng Việt cấp tiểu học gây xúc động mạnh mẽ trong thanh, thiếu niên kháng chiến là ai?",
            "choices": [
              "Nhà giáo Trịnh Ngọc Trình",
              "Nhà giáo Đặng Thai Mai",
              "Nhà giáo Lê Văn Thiêm",
              "Nhà giáo Lê Hùng"
            ],
            "answer": 0
          },
          {
            "question": "Đoàn Thanh niên Lao động Hồ Chí Minh Trường Đại học Sư phạm Hà Nội đổi thành “Đoàn Thanh niên Cộng sản Hồ Chí Minh Trường Đại học Sư phạm Hà Nội” vào năm nào?",
            "choices": [
              "1975",
              "1976",
              "1977",
              "1978"
            ],
            "answer": 1
          },
          {
            "question": "Trong những năm tháng sục sôi khí thế “chống Mỹ, cứu nước”, tinh thần xung phong “đi B” (đi công tác, chiến đấu ở chiến trường miền Nam) đã trở thành niềm vinh dự đặc biệt của thế hệ trẻ Trường Đại học Sư phạm Hà Nội. Đã có nhiều đoàn viên thanh niên của Trường ĐHSP Hà Nội tham gia chiến đấu dũng cảm và hy sinh anh dũng, trong đó có em ruột của đồng chí Trường Chinh. Nhân vật đó tên họ là gì?",
            "choices": [
              "Đặng Xuân Rương (Phó Bí thư Đoàn Trường ĐHSP Hà Nội)",
              "Đặng Xuân Phương (Phó Bí thư Đoàn Trường ĐHSP Hà Nội)",
              "Đặng Xuân Dương (Phó Bí thư Đoàn Trường ĐHSP Hà Nội)",
              "Đặng Xuân Hương (Phó Bí thư Đoàn Trường ĐHSP Hà Nội)"
            ],
            "answer": 0
          },
          {
            "question": "Năm 1977, Liên chi đoàn của một khoa trực thuộc Trường Đại học Sư phạm Hà Nội trở thành một trong hai đơn vị đầu tiên trong các trường đại học và trung học chuyên nghiệp trên cả nước được công nhận danh hiệu “Tập thể học sinh xã hội chủ nghĩa” toàn khoa. Đó là Khoa nào?",
            "choices": [
              "Khoa Toán Tin",
              "Khoa Ngữ Văn",
              "Khoa Vật lý",
              "Khoa Hóa học"
            ],
            "answer": 3
          },
          {
            "question": "Danh hiệu dành cho học sinh khối THPT do Trung ương Đoàn TNCS Hồ Chí Minh phát động là gì?",
            "choices": [
              "Học sinh 3 tốt",
              "Sinh viên 5 tốt",
              "Thanh niên tiên tiến",
              "Nhà giáo trẻ tiêu biểu"
            ],
            "answer": 0
          },
          {
            "question": "Cơ quan Đoàn cấp trên trực tiếp của Đoàn trường Trường Đại học Sư phạm Hà Nội là tổ chức nào?",
            "choices": [
              "Trung ương Đoàn TNCS Hồ Chí Minh",
              "Thành đoàn Hà Nội",
              "Hội Sinh viên Việt Nam",
              "Bộ Giáo dục và Đào tạo"
            ],
            "answer": 1
          },
          {
            "question": "Văn phòng Đoàn TNCS Hồ Chí Minh Trường ĐHSP Hà Nội có địa chỉ là gì?",
            "choices": [
              "Phòng 315 nhà Hành chính Hiệu bộ",
              "Phòng 506 nhà Hành chính Hiệu bộ",
              "Phòng 508 nhà Hành chính Hiệu bộ",
              "Phòng 513 nhà Hành chính Hiệu bộ"
            ],
            "answer": 1
          },
          {
            "question": "Chiến dịch Thanh niên Tình nguyện hè của Đoàn Trường ĐHSP Hà Nội năm 2025 có bao nhiêu đội hình?",
            "choices": [
              "8",
              "9",
              "10",
              "11"
            ],
            "answer": 3
          },
          {
            "question": "Chương trình chào mừng ngày 8/3 năm 2026 của Đoàn Trường ĐHSP Hà Nội có tên là gì?",
            "choices": [
              "Hoa khôi sinh viên",
              "Baking with love",
              "Ngày hội văn hóa các dân tộc Việt Nam",
              "Tập huấn trí tuệ nhân tạo AI cho sinh viên"
            ],
            "answer": 1
          },
          {
            "question": "Chương trình xuân 2026 của Đoàn Trường ĐHSP Hà Nội có tên là gì?",
            "choices": [
              "Hoa tháng Giêng",
              "Baking with love",
              "Ngày hội văn hóa các dân tộc Việt Nam",
              "Sắc Xuân Tết Việt"
            ],
            "answer": 3
          },
          {
            "question": "Hằng năm, Đoàn Trường ĐHSP Hà Nội tổ chức bao nhiêu đợt học Đoàn viên ưu tú?",
            "choices": [
              "1",
              "2",
              "3",
              "4"
            ],
            "answer": 1
          },
          {
            "question": "Đoàn Trường ĐHSP Hà Nội tổ chức lớp bồi dưỡng Đoàn viên ưu tú đợt I vào thời gian nào?",
            "choices": [
              "Tháng 1",
              "Tháng 2",
              "Tháng 3",
              "Tháng 4"
            ],
            "answer": 0
          },
          {
            "question": "Năm 2025, số lượng đề tài NCKH của sinh viên Trường ĐHSP Hà Nội là bao nhiêu?",
            "choices": [
              "443",
              "543",
              "643",
              "743"
            ],
            "answer": 3
          },
          {
            "question": "Trong cuộc thi “Văn minh học đường” của Đoàn Trường ĐHSP Hà Nội năm 2025, khoa nào đạt giải Nhất?",
            "choices": [
              "Khoa Lịch sử",
              "Khoa Tiếng Anh",
              "Khoa Ngữ văn",
              "Khoa Công tác xã hội"
            ],
            "answer": 0
          },
          {
            "question": "Chủ đề của cuộc thi Dance Storm 2025 là gì?",
            "choices": [
              "Timeless Harmony",
              "Tide over triumph",
              "Into the Wonderland",
              "World Edition"
            ],
            "answer": 1
          },
          {
            "question": "Chuyên viên văn phòng Đoàn Trường Đại học Sư phạm Hà Nội là ai?",
            "choices": [
              "Phạm Thị Hiền",
              "Mai Hà Phương",
              "Đỗ Ba Chín",
              "Phạm Thị Thanh Thúy"
            ],
            "answer": 0
          },
          {
            "question": "Bí thư Đoàn Trường Đại học Sư phạm Hà Nội là ai?",
            "choices": [
              "Đinh Hoàng Dương",
              "Đỗ Ba Chín",
              "Phạm Thị Thanh Thúy",
              "Nguyễn Hà Phương"
            ],
            "answer": 2
          },
          {
            "question": "Chủ tịch Hội sinh viên Trường Đại học Sư phạm Hà Nội là ai?",
            "choices": [
              "Đinh Hoàng Dương",
              "Đỗ Ba Chín",
              "Phạm Thị Thanh Thúy",
              "Nguyễn Hà Phương"
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "hnue-phong-trao-ba-san-sang",
        "title": "Phong trào Ba sẵn sàng & Các phong trào thanh niên HNUE (30 câu)",
        "questions": [
          {
            "question": "Tại Lễ phát động Phong trào “Ba sẵn sàng” của Đoàn Thanh niên Trường Đại học Sư phạm Hà Nội ngày 30/4/1964, đoàn viên thanh niên nhà trường đã tuyên thệ những nội dung nào sau đây?",
            "choices": [
              "Sẵn sàng chiến đấu, sẵn sàng nhập ngũ đánh thắng Đế quốc Mỹ xâm lược; Sẵn sàng hy sinh bảo vệ miền Bắc xã hội chủ nghĩa, giải phóng miền Nam, thống nhất Tổ quốc; Sẵn sàng đi bất cứ nơi nào, làm bất cứ việc gì Đảng và nhân dân yêu cầu mà không đòi hỏi đãi ngộ.",
              "Sẵn sàng chiến đấu, sẵn sàng nhập ngũ bảo vệ miền Bắc xã hội chủ nghĩa; sẵn sàng hy sinh để xây dựng hậu phương lớn, chi viện cho miền Nam; sẵn sàng đi bất cứ nơi nào, làm bất cứ việc gì Tổ quốc cần mà không đòi hỏi quyền lợi.",
              "Sẵn sàng chiến đấu chống đế quốc Mỹ xâm lược; sẵn sàng bảo vệ miền Bắc xã hội chủ nghĩa và tham gia giải phóng miền Nam; sẵn sàng đi bất cứ nơi nào, làm bất cứ việc gì theo sự phân công của Đoàn Thanh niên.",
              "Sẵn sàng chiến đấu bảo vệ Tổ quốc; sẵn sàng tham gia lao động sản xuất và phục vụ chiến đấu; sẵn sàng đi bất cứ nơi nào, làm bất cứ việc gì khi đất nước cần đến thanh niên."
            ],
            "answer": 0
          },
          {
            "question": "Nội dung nào sau đây không thuộc phong trào “Tam bất kì” do Ban Chấp hành Đoàn Trường Đại học Sư phạm Hà Nội phát động?",
            "choices": [
              "Bất kì đi đến nơi nào mà Tổ quốc cần đến.",
              "Bất kì làm nhiệm vụ gì mà Đảng và nhân dân yêu cầu.",
              "Bất kì chế độ hưởng thụ nào cũng chấp nhận.",
              "Bất kì hoàn cảnh nào cũng quyết tâm học tập và rèn luyện tốt."
            ],
            "answer": 3
          },
          {
            "question": "Phong trào “Ba sẵn sàng” của Đoàn Thanh niên Trường Đại học Sư phạm Hà Nội được phát động tại đâu và vào thời gian nào?",
            "choices": [
              "Nghĩa trang Mai Dịch (huyện Từ Liêm), ngày **30/4/1964",
              "Quảng trường Ba Đình (Hà Nội), ngày 19/5/1964",
              "Nghĩa trang Mai Dịch (huyện Từ Liêm), ngày 30/4/1965",
              "Nhà hát Lớn Hà Nội, ngày 2/9/1964"
            ],
            "answer": 0
          },
          {
            "question": "Phong trào “Ba sẵn sàng” của Đoàn Trường Đại học Sư phạm Hà Nội đã trải qua quá trình đổi tên như thế nào?",
            "choices": [
              "Ban đầu là “Tam bất kì”, sau đó đổi thành “Ba bất kì” và cuối cùng là “Ba sẵn sàng”.",
              "Ban đầu là “Ba bất kì”, sau đó đổi thành “Tam bất kì” và cuối cùng là “Ba sẵn sàng”.",
              "Ban đầu là “Tam bất kì”, sau đó đổi thành “Ba sẵn sàng” rồi mới gọi là “Ba bất kì”.",
              "Ban đầu là “Ba sẵn sàng”, sau đó đổi thành “Ba bất kì” rồi mới gọi là “Tam bất kì”."
            ],
            "answer": 0
          },
          {
            "question": "Những giá trị truyền thống quý báu, nổi bật của Đoàn Trường Đại học Sư phạm Hà Nội được thể hiện qua những nội dung nào sau đây?",
            "choices": [
              "Truyền thống yêu nước nồng nàn, trung thành với Đảng; truyền thống hiếu học, yêu nghề và kính thầy, trọng bạn; truyền thống xung kích, sáng tạo trong công tác Đoàn và phong trào thanh niên – sinh viên.",
              "Truyền thống yêu nước, đoàn kết quốc tế; truyền thống học tập và nghiên cứu khoa học; truyền thống tình nguyện vì cộng đồng và xã hội.",
              "Truyền thống hiếu học, yêu nghề sư phạm; truyền thống đoàn kết, giúp đỡ lẫn nhau; truyền thống tham gia lao động sản xuất và xây dựng đất nước.",
              "Truyền thống yêu nước, bảo vệ Tổ quốc; truyền thống học tập, rèn luyện đạo đức; truyền thống tham gia các hoạt động văn hóa và thể thao."
            ],
            "answer": 0
          },
          {
            "question": "Tổ chức Đoàn đầu tiên của Trường Đại học Sư phạm Hà Nội được thành lập năm 1951, đã có nhiều cống hiến góp phần cùng Nhà trường xây dựng nền móng cho sự phát triển nền văn hóa, giáo dục nước nhà và sự thắng lợi của cuộc kháng chiến chống thực dân Pháp?",
            "choices": [
              "Chi đoàn Thanh niên Cứu quốc Trường Sư phạm Cao cấp.",
              "Chi đoàn Thanh niên Lao động Trường Sư phạm Trung ương.",
              "Chi đoàn Thanh niên Việt Nam Trường Đại học Sư phạm Hà Nội.",
              "Chi đoàn Thanh niên Cộng sản Hồ Chí Minh Trường Đại học Sư phạm Hà Nội."
            ],
            "answer": 0
          },
          {
            "question": "Mùa hè năm 1966, Trường Đại học Sư phạm Hà Nội đã thành lập “Đội Thanh niên Xung phong chống Mỹ cứu nước” gồm 109 thành viên, tham gia chiến đấu tại khu vực nào?",
            "choices": [
              "Đặc khu Vĩnh Linh (Quảng Trị)",
              "Mặt trận Khe Sanh (Quảng Trị)",
              "Cầu Hàm Rồng (Thanh Hóa)",
              "Truông Bồn (Nghệ An)"
            ],
            "answer": 2
          },
          {
            "question": "Phong trào “Thanh niên tình nguyện” của Đoàn Trường Đại học Sư phạm Hà Nội được Đoàn Trường chủ động thực hiện từ thời gian nào?",
            "choices": [
              "Đầu những năm 1980.",
              "Đầu những năm 1990.",
              "Cuối những năm 1990.",
              "Đầu những năm 2000."
            ],
            "answer": 1
          },
          {
            "question": "Trong thời kỳ kháng chiến chống Mỹ, đoàn viên và cán bộ Đoàn Trường Đại học Sư phạm Hà Nội tích cực tham gia phong trào nào sau đây?",
            "choices": [
              "Phong trào “Thanh niên lập nghiệp, tuổi trẻ giữ nước”.",
              "Phong trào “Xếp bút nghiên lên đường đánh Mỹ”.",
              "Phong trào “Ba xung phong xây dựng và bảo vệ Tổ quốc”.",
              "Phong trào “Tuổi trẻ sáng tạo vì tương lai đất nước”."
            ],
            "answer": 1
          },
          {
            "question": "Năm 1972, Đại đội tự vệ Trường Đại học Sư phạm Hà Nội đã phối hợp với lực lượng quân sự địa phương nào để bắn rơi một máy bay F4 của Mỹ?",
            "choices": [
              "Lực lượng quân sự quận Ba Đình.",
              "Lực lượng quân sự huyện Đông Anh.",
              "Lực lượng quân sự huyện Từ Liêm.",
              "Lực lượng quân sự huyện Gia Lâm."
            ],
            "answer": 2
          },
          {
            "question": "Tổ đài quan sát của Đại đội tự vệ Trường Đại học Sư phạm Hà Nội đặt trên sân thượng nhà A7, được gọi là** “con mắt phía Tây Thành phố”**, đã được** tặng thưởng danh hiệu nào sau đây?",
            "choices": [
              "Huân chương Lao động hạng Ba.",
              "Huân chương Kháng chiến hạng Ba.",
              "Huân chương Chiến công hạng Ba.",
              "Huân chương Bảo vệ Tổ quốc hạng Ba."
            ],
            "answer": 1
          },
          {
            "question": "Ai là người nhen nhóm và khởi xướng phong trào “Ba sẵn sàng” trong thanh niên Trường Đại học Sư phạm Hà Nội?",
            "choices": [
              "Đồng chí Trịnh Ngọc Trình",
              "Đồng chí Đặng Xuân Rương",
              "Đồng chí Phạm Tiến Duật",
              "Đồng chí Nghiêm Xuân Danh"
            ],
            "answer": 0
          },
          {
            "question": "Đoàn TNCS Hồ Chí Minh Trường Đại học Sư phạm Hà Nội vinh dự là Đoàn trường đầu tiên được Chủ tịch nước tặng Huân chương Lao động hạng mấy?",
            "choices": [
              "Hạng Nhất",
              "Hạng Nhì",
              "Hạng Ba",
              "Cả 3 đáp án trên đều đúng"
            ],
            "answer": 0
          },
          {
            "question": "Chương trình hiến máu được tổ chức thường niên bởi Câu lạc bộ Thanh niên vận động hiến máu - một đơn vị trực thuộc Hội sinh viên Trường và Hội Thanh niên vận động hiến máu Hà Nội có tên là gì?",
            "choices": [
              "Giọt Máu Lạc Hồng",
              "Sắc Vàng Hoàng Yến",
              "Máu Sư Phạm",
              "Giọt Hồng Tri Ân"
            ],
            "answer": 1
          },
          {
            "question": "Giải thưởng “Sáng tạo trẻ” do Ban Chấp hành Đoàn TNCS Trường Đại học Sư phạm Hà Nội tổ chức xét là giải thưởng nhằm phát hiện, tôn vinh, trao tặng cho các cá nhân có sự sáng tạo và đạt thành tích cao trong các lĩnh vực nào dưới đây?",
            "choices": [
              "Lĩnh vực giảng dạy, học tập",
              "Lĩnh vực giảng dạy, học tập và lĩnh vực nghiên cứu khoa học",
              "Lĩnh vực giảng dạy, học tập; lĩnh vực nghiên cứu khoa học; lĩnh vực hoạt động đoàn thể, hoạt động cộng đồng",
              "Lĩnh vực chính trị - tư tưởng; lĩnh vực giảng dạy, học tập; lĩnh vực nghiên cứu khoa học; lĩnh vực hoạt động đoàn thể, hoạt động cộng đồng"
            ],
            "answer": 2
          },
          {
            "question": "Ai là thủ lĩnh thanh niên khởi xướng phong trào “Ba sẵn sàng”, nguyên Bí thư Thành đoàn Hà Nội?",
            "choices": [
              "Đồng chí Hồ Trúc",
              "Đồng chí Nguyễn Hoàng Tùng",
              "Đồng chí Nguyễn Lam",
              "Đồng chí Vũ Hữu Loan"
            ],
            "answer": 3
          },
          {
            "question": "Trong những năm tháng sục sôi khí thế “chống Mỹ, cứu nước”, tinh thần xung phong “đi B” đã trở thành niềm vinh dự đặc biệt của thế hệ trẻ Trường Đại học Sư phạm Hà Nội. Hãy cho biết “đi B” ở đây có nghĩa là gì?",
            "choices": [
              "Đi công tác, chiến đấu ở chiến trường miền Bắc",
              "Đi công tác, chiến đấu ở chiến trường miền Trung",
              "Đi công tác, chiến đấu ở chiến trường miền Nam",
              "Đi công tác, chiến đấu ở đường Trường Sơn"
            ],
            "answer": 2
          },
          {
            "question": "Trong thời gian Trường Đại học Sư phạm Hà Nội sơ tán lần thứ hai vào tháng 4/1972, lãnh đạo nhà trường đã chỉ đạo các Liên chi đoàn hưởng ứng khẩu hiệu: “Bám trường, bám lớp, bám \\_\\_\\_\\_\\_\\_\\_\\_, kiên quyết không để một học sinh bỏ học, bỏ lớp”.",
            "choices": [
              "giáo viên",
              "lớp học",
              "học sinh",
              "giảng đường"
            ],
            "answer": 2
          },
          {
            "question": "Năm 1977, Liên chi đoàn của một khoa trực thuộc Trường Đại học Sư phạm Hà Nội trở thành một trong hai đơn vị đầu tiên trong các trường đại học và trung học chuyên nghiệp trên cả nước được công nhận danh hiệu “Tập thể học sinh xã hội chủ nghĩa” toàn khoa. Đó là Khoa nào?",
            "choices": [
              "Khoa Hóa học",
              "Khoa Ngữ văn",
              "Khoa Toán học",
              "Khoa Vật lí"
            ],
            "answer": 0
          },
          {
            "question": "Câu lạc bộ nào của Trường Đại học Sư phạm Hà Nội được thành lập năm 2003, do thầy Phạm Đăng Dư làm Chủ tịch đầu tiên?",
            "choices": [
              "Câu lạc bộ Cựu cán bộ Đoàn Thanh niên.",
              "Câu lạc bộ Cựu cán bộ Đoàn – Hội nhà trường.",
              "Câu lạc bộ Cựu Bí thư Đoàn trường.",
              "Câu lạc bộ Cựu sinh viên công tác Đoàn."
            ],
            "answer": 2
          },
          {
            "question": "Từ năm 1991 đến nay, phong trào nào của sinh viên Trường Đại học Sư phạm Hà Nội luôn đạt thành tích dẫn đầu trong các trường đại học trên toàn quốc?",
            "choices": [
              "Phong trào sinh viên nghiên cứu khoa học.",
              "Phong trào sinh viên tình nguyện vì cộng đồng.",
              "Phong trào sinh viên khởi nghiệp sáng tạo.",
              "Phong trào sinh viên học tập và rèn luyện."
            ],
            "answer": 0
          },
          {
            "question": "Năm 2011, Trường Đại học Sư phạm Hà Nội được **Chủ tịch nước tặng Cờ thưởng** về thành tích nổi bật trong lĩnh vực nào sau đây?",
            "choices": [
              "Công tác đào tạo giáo viên và cán bộ quản lý giáo dục.",
              "Thành tích sinh viên nghiên cứu khoa học.",
              "Thành tích phong trào thanh niên tình nguyện.",
              "Thành tích đổi mới chương trình đào tạo."
            ],
            "answer": 1
          },
          {
            "question": "Từ sau lần tổ chức đầu tiên vào năm 2008, *Hội thảo khoa học của cán bộ trẻ* do Đoàn Trường Đại học Sư phạm Hà Nội tổ chức đã trở thành hoạt động như thế nào?",
            "choices": [
              "Hoạt động thường niên của cán bộ trẻ trong toàn trường.",
              "Hoạt động giao lưu học thuật giữa sinh viên các khoa.",
              "Hoạt động nghiên cứu khoa học dành cho học sinh phổ thông.",
              "Hoạt động hợp tác nghiên cứu giữa các trường đại học."
            ],
            "answer": 0
          },
          {
            "question": "Năm 2008, Đoàn Trường Đại học Sư phạm Hà Nội đã tổ chức lần đầu tiên hoạt động nào sau đây?",
            "choices": [
              "Diễn đàn sinh viên nghiên cứu khoa học.",
              "Hội nghị cán bộ trẻ toàn trường.",
              "Hội thảo khoa học của cán bộ trẻ.",
              "Hội thảo đổi mới phương pháp giảng dạy."
            ],
            "answer": 2
          },
          {
            "question": "Câu nói nổi tiếng “Cuộc đời đẹp nhất là trên trận tuyến diệt quân thù” gắn liền với tên tuổi của người anh hùng nào trong phong trào “Ba sẵn sàng”?",
            "choices": [
              "Anh hùng Trịnh Tố Tâm.",
              "Anh hùng Lê Mã Lương.",
              "Anh hùng Vũ Xuân Thiều.",
              "Anh hùng Bùi Ngọc Dương."
            ],
            "answer": 1
          },
          {
            "question": "Anh hùng nào trong phong trào “Ba sẵn sàng” đã 53 lần được tặng danh hiệu “Dũng sĩ diệt Mỹ”?",
            "choices": [
              "Trịnh Tố Tâm.",
              "Lê Mã Lương.",
              "Vũ Xuân Thiều.",
              "Đặng Thùy Trâm."
            ],
            "answer": 0
          },
          {
            "question": "Trong nhiệm kỳ 2008 – 2012, các cấp bộ Đoàn đã tổ chức hàng chục nghìn lớp \\_\\_\\_\\_\\_\\_\\_\\_ nhằm góp phần nâng cao dân trí cho nhân dân.",
            "choices": [
              "bồi dưỡng kỹ năng sống",
              "xóa mù chữ",
              "đào tạo nghề ngắn hạn",
              "giáo dục pháp luật"
            ],
            "answer": 1
          },
          {
            "question": "Trong nhiệm kỳ 2008 – 2012, hàng trăm trí thức trẻ tình nguyện đã được cử đến tham gia phát triển kinh tế – xã hội tại những khu vực nào sau đây?",
            "choices": [
              "Các khu công nghiệp và đô thị lớn.",
              "Các vùng biên giới, vùng sâu và vùng xa.",
              "Các trung tâm nghiên cứu khoa học.",
              "Các thành phố ven biển phát triển."
            ],
            "answer": 1
          },
          {
            "question": "Trong nhiệm kỳ 2008 – 2012, thanh niên, sinh viên Việt Nam đã tham gia nhiều hoạt động tình nguyện quốc tế như làm đường giao thông nông thôn, sửa chữa nhà và khám chữa bệnh cho nhân dân các nước** \\_\\_\\_\\_\\_\\_\\_\\_.",
            "choices": [
              "Thái Lan và Lào",
              "Campuchia và Myanmar",
              "Lào và Trung Quốc",
              "Lào và Campuchia"
            ],
            "answer": 3
          },
          {
            "question": "Câu nói nổi tiếng:** **“Một năm khởi đầu từ mùa xuân. Một đời khởi đầu từ tuổi trẻ. Tuổi trẻ là mùa xuân của xã hội”** **là của ai?",
            "choices": [
              "Chủ tịch Tôn Đức Thắng.",
              "Tổng Bí thư Lê Duẩn.",
              "Chủ tịch Hồ Chí Minh.",
              "Đại tướng Võ Nguyên Giáp."
            ],
            "answer": 2
          }
        ]
      }
    ]
  }
];
