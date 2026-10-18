# Cấu Trúc Tổng Quan Scene 4

Tài liệu này mô tả cấu trúc hình thành của toàn bộ không gian `scene-4`. Mục tiêu là giúp các lần chỉnh sửa sau luôn bám theo logic kiến trúc gốc, không tự ý thêm các mảng hình học rời rạc hoặc phá vỡ bố cục tổng thể.

Tài liệu chỉ mô tả nguyên lý cấu trúc. Các kích thước, bán kính, chiều cao, độ rộng, độ sâu cụ thể phải được đọc và chỉnh trong file cấu hình/source tương ứng, không xem tài liệu này như một bộ thông số cố định.

## Ý Tưởng Mặt Bằng

Toàn bộ căn phòng được tổ chức theo dạng một không gian trung tâm tỏa ra bốn hướng chéo, giống một mặt bằng dạng bông hoa bốn cánh.

Ở giữa là lõi trung tâm. Bao quanh lõi là sảnh trung tâm dạng vòng, nơi người xem có thể di chuyển quanh lõi và tiếp cận các phòng chủ đề.

Từ sảnh trung tâm mở ra bốn phòng chéo. Mỗi phòng là một nhánh không gian riêng, được xoay theo hướng của nó thay vì đặt song song theo trục ngang/dọc thông thường.

## Các Thành Phần Chính

Không gian gồm các thành phần kiến trúc chính:

```text
1. Lõi trung tâm
2. Sảnh vòng quanh lõi
3. Bốn phòng chủ đề đặt chéo quanh trung tâm
4. Các khoảng nối giữa các phòng
5. Lối vào chính phía Nam
6. Hệ tường bao và tường đóng connector
7. Hệ trần theo từng vùng không gian
8. Sàn/thảm dẫn hướng
```

Các phần nội thất, hiện vật, tranh ảnh, video, âm thanh và bảng nội dung phải được đặt bên trong các vùng kiến trúc này, không được dùng để định hình lại cấu trúc căn phòng.

## Lõi Trung Tâm

Lõi trung tâm là điểm neo của toàn bộ mặt bằng. Đây là tâm hình học của scene và là điểm để các phòng, hành lang, connector được tính hướng tỏa ra.

Lõi không phải là phòng để đi xuyên qua. Người xem di chuyển quanh lõi trong vùng sảnh vòng bao quanh.

Khi chỉnh sửa, cần giữ nguyên nguyên tắc:

```text
Lõi trung tâm ở giữa.
Sảnh vòng bao quanh lõi.
Các phòng tỏa ra từ ngoài sảnh vòng.
```

Không nên đặt phòng, hành lang hoặc vật thể lớn cắt xuyên qua lõi trung tâm.

## Sảnh Trung Tâm

Sảnh trung tâm là vùng đi lại chính bao quanh lõi. Đây là vùng chuyển tiếp giữa lõi và bốn phòng chủ đề.

Sảnh có vai trò:

```text
- Cho phép người xem định hướng tổng thể.
- Kết nối tới bốn phòng chéo.
- Kết nối tới lối vào chính.
- Là vùng trung gian giữa các chủ đề.
```

Sảnh trung tâm nên được hiểu như một vành không gian liên tục. Các mảng sàn, thảm, trần và đèn của sảnh phải bám theo vùng này, không mở rộng tùy ý ra đến tận mép ngoài của các phòng.

## Bốn Phòng Chủ Đề

Bốn phòng chủ đề là bốn nhánh chính của mặt bằng. Mỗi phòng có cùng nguyên lý hình học:

```text
- Bắt đầu từ mép ngoài của sảnh trung tâm.
- Kéo sâu ra phía ngoài theo hướng riêng của phòng.
- Có hai tường bên.
- Có một tường cuối.
- Có sàn và trần riêng.
- Nội dung trưng bày nằm trên hoặc gần các mặt trong của phòng.
```

Các phòng không nên được xem là bốn khối độc lập đặt thủ công. Chúng là bốn nhánh được suy ra từ cùng một hệ quy chiếu chung quanh lõi trung tâm.

Khi chỉnh phòng, cần giữ các nguyên tắc:

```text
Phòng phải mở về phía sảnh trung tâm.
Tường cuối phòng nằm ở phía sâu nhất của phòng.
Tường bên đi theo chiều sâu phòng.
Nội dung trưng bày nằm trong lòng phòng, không nằm phía ngoài tường.
```

## Hướng Phòng

Mỗi phòng có một hướng tỏa ra từ trung tâm. Trong source, hướng này được dùng để tính:

```text
- Trục sâu của phòng
- Trục ngang của phòng
- Vị trí cửa phòng
- Vị trí tường bên
- Vị trí tường cuối
- Tọa độ nội dung bên trong phòng
- Góc xoay group của phòng
```

Vì vậy khi chỉnh hướng phòng, không nên chỉ xoay mesh bằng mắt. Cần chỉnh thông qua định nghĩa hướng/phòng để các phần phụ thuộc được tính lại đồng bộ.

## Khoảng Nối Giữa Các Phòng

Giữa các phòng có các khoảng nối theo bốn hướng chính quanh mặt bằng.

Các khoảng nối này được suy ra từ các cặp góc cửa gần nhau giữa những phòng kề nhau. Chúng không nên được đặt thủ công tách rời, vì nếu phòng đổi hướng hoặc đổi kích thước thì connector phải thay đổi theo.

Về nguyên tắc:

```text
- Connector phía Nam là lối vào chính.
- Các connector còn lại được đóng bằng tường.
- Connector đóng vẫn là một phần của vỏ kiến trúc.
- Không đặt nội dung trưng bày ở mặt ngoài connector nếu người xem không tiếp cận được.
```

## Lối Vào Chính

Lối vào chính nằm ở phía Nam của mặt bằng. Đây là trục dẫn người xem từ ngoài vào trong sảnh trung tâm.

Lối vào gồm nhiều lớp không gian nối tiếp:

```text
1. Đoạn cổng gần sảnh trung tâm
2. Đoạn chuyển tiếp/loe theo hai phòng phía Nam
3. Tiền sảnh ngoài
4. Cửa hoặc ngưỡng vào
5. Vùng xuất phát của camera
```

Khi chỉnh lối vào, cần giữ nguyên logic:

```text
Người xem xuất phát từ ngoài.
Đi qua ngưỡng/cửa.
Vào tiền sảnh.
Qua đoạn chuyển tiếp.
Đến sảnh trung tâm.
```

Không nên mở rộng lối vào bằng các mặt sàn/trần rất lớn chỉ để che khe. Nếu có khe giữa các đoạn, cần sửa đúng polygon của đoạn đó.

## Hệ Tường

Tường trong scene có hai loại chính:

```text
Tường thẳng:
  Dùng cho tường bên phòng, tường cuối phòng, hành lang, cửa, ngưỡng.

Tường cong:
  Dùng cho các phần bo ngoài của connector hoặc vỏ kiến trúc cong.
```

Tường có thể nằm ngoài vùng camera đi lại, nhưng phải là phần giới hạn không gian có chủ đích. Điều này khác với hiện vật hoặc mảng trang trí bị đặt bên ngoài tường.

Quy tắc:

```text
Tường được phép là biên.
Nội dung trưng bày không được nằm sau biên.
Sàn/thảm không nên vượt xa ra ngoài biên.
Trần không nên phủ toàn cục nếu chỉ cần che một khe nhỏ.
```

## Hệ Trần

Trần phải được chia theo từng vùng kiến trúc, tương ứng với mặt bằng bên dưới:

```text
- Trần sảnh trung tâm
- Trần từng phòng chủ đề
- Trần đoạn lối vào
- Trần các đoạn chuyển tiếp cần che kín
```

Không nên dùng một mặt trần cực lớn phủ toàn bộ scene như một lớp nền an toàn. Cách đó dễ tạo vật thể ẩn bên ngoài phòng kín và làm khó rà soát hình học.

Nếu phát hiện khe trần:

```text
1. Xác định khe thuộc vùng nào.
2. Sửa polygon hoặc shape của vùng đó.
3. Chỉ tạo patch theo đúng biên khe.
4. Không tạo một mặt phẳng lớn để che toàn cục.
```

## Sàn Và Thảm

Sàn/thảm có vai trò biểu thị vùng đi lại và dẫn hướng. Vì vậy sàn/thảm phải bám theo các vùng mà người xem có thể tiếp cận.

Nguyên tắc:

```text
Thảm sảnh trung tâm chỉ thuộc vùng sảnh trung tâm.
Thảm phòng chỉ chạy từ cửa phòng vào trong phòng.
Thảm lối vào chỉ nằm trong hành lang/lối vào.
Không dùng bán kính/vùng ngoài của tường để tạo thảm trung tâm.
```

Nếu thảm hoặc sàn vượt ra sau tường, đó thường là dấu hiệu sai cấu trúc.

## Vùng Di Chuyển

Vùng di chuyển của camera là chuẩn kiểm tra quan trọng nhất. Mọi không gian mà người xem được phép đi vào phải được mô tả trong hàm kiểm tra vùng đi lại.

Khi thêm phòng, mở connector hoặc thay đổi lối vào, cần cập nhật đồng bộ:

```text
- Hình học sàn
- Tường bao
- Trần
- Minimap
- Vùng camera được phép di chuyển
```

Không nên chỉ thêm mesh nhìn đúng bằng mắt nhưng quên cập nhật vùng di chuyển.

## Minimap

Minimap phải phản ánh đúng mặt bằng kiến trúc:

```text
- Lõi trung tâm
- Sảnh trung tâm
- Bốn phòng
- Lối vào
- Vị trí người xem
```

Nếu thay đổi mặt bằng nhưng minimap không đổi, người xem sẽ bị sai định hướng. Vì vậy mọi thay đổi cấu trúc lớn đều cần kiểm tra lại minimap.

## Những Gì Không Thuộc Cấu Trúc

Các phần sau không được dùng để định nghĩa lại cấu trúc phòng:

```text
- Tranh
- Khung ảnh
- Video
- Audio card
- Bảng nội dung
- Ghế
- Tủ kính
- Đèn trang trí nhỏ
- Placeholder
```

Chúng chỉ là nội thất hoặc nội dung trưng bày. Nếu cần chỉnh mặt bằng, hãy chỉnh ở phần cấu trúc: phòng, tường, trần, sàn, connector, lối vào.

## Quy Trình Khi Chỉnh Cấu Trúc

Khi cần chỉnh sửa cấu trúc căn phòng, nên làm theo thứ tự:

```text
1. Xác định vùng nào thay đổi: trung tâm, phòng, connector hay lối vào.
2. Chỉnh định nghĩa hình học/hướng/vùng trước.
3. Chỉnh sàn tương ứng.
4. Chỉnh tường bao.
5. Chỉnh trần.
6. Chỉnh vùng di chuyển camera.
7. Chỉnh minimap.
8. Sau cùng mới chỉnh nội thất/nội dung nếu cần.
```

Không nên làm ngược lại bằng cách đặt thêm mesh để vá lỗi nhìn thấy.

## Nguyên Tắc Rà Soát Sau Khi Chỉnh

Sau khi chỉnh cấu trúc, cần tự hỏi:

```text
Có mesh nào nằm ngoài vùng phòng/sảnh/lối vào không?
Nếu có, nó có phải tường hoặc trần giới hạn không gian không?
Có mặt phẳng nào quá lớn chỉ để che khe không?
Có nội dung trưng bày nào nằm sau tường không?
Sàn/thảm có vượt qua biên tường không?
Trần có được tạo theo từng vùng thay vì phủ toàn cục không?
Minimap có còn khớp với mặt bằng không?
Camera có đi được đúng vùng mong muốn không?
```

Nếu một vật thể không nhìn thấy được từ bên trong không gian kín và cũng không phải biên kiến trúc, nên xóa hoặc đặt lại nó.

## Mục Tiêu Cấu Trúc

Mục tiêu cuối cùng của scene là một không gian kín, rõ logic, dễ mở rộng:

```text
Lõi trung tâm
-> Sảnh vòng
-> Bốn phòng chéo
-> Connector đóng/mở có chủ đích
-> Lối vào phía Nam
-> Tường, trần, sàn bám đúng từng vùng
```

Mọi chỉnh sửa sau này nên giữ nguyên tư duy này để căn phòng không bị biến thành tập hợp các mesh rời rạc khó kiểm soát.
