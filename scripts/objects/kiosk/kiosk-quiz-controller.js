import * as THREE from "three";

export function attachKioskQuiz({ screenFace, quizData, registerInteractiveObject, requestRender }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1100;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  screenFace.material.dispose();
  screenFace.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });

  const state = { view: "welcome", subject: 0, topic: 0, question: 0, score: 0, answered: false, selected: -1 };
  const font = "Roboto, Arial, sans-serif";
  const palette = {
    blue: "#07558D", red: "#A82B31", gold: "#C9A95D", ink: "#102A43",
    muted: "#52677D", paper: "#F4F6F8", white: "#FFFFFF", paleBlue: "#E7F2FA"
  };

  const box = (x, y, width, height, color, radius = 22) => {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  };
  const text = (value, x, y, size, color, align = "left", weight = 700) => {
    context.fillStyle = color;
    context.font = `${weight} ${size}px ${font}`;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(value, x, y);
  };
  const wrappedText = (value, x, y, width, size, color, lineHeight = size * 1.25, weight = 700) => {
    context.font = `${weight} ${size}px ${font}`;
    const lines = [];
    let line = "";
    String(value).split(/\s+/).forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > width) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    context.fillStyle = color;
    context.textAlign = "left";
    context.textBaseline = "middle";
    lines.forEach((entry, index) => context.fillText(entry, x, y + index * lineHeight));
    return lines.length;
  };
  const header = (title, detail = "") => {
    context.fillStyle = palette.blue;
    context.fillRect(0, 0, canvas.width, 126);
    text("KHÔNG GIAN TRUYỀN THỐNG SỐ", 62, 48, 29, palette.white, "left", 900);
    text(title, 62, 91, 21, palette.gold, "left", 800);
    if (detail) text(detail, 1470, 64, 22, palette.white, "right", 700);
  };
  const activeTopic = () => quizData[state.subject].topics[state.topic];
  const currentQuestion = () => activeTopic().questions[state.question];
  const resetTopic = () => Object.assign(state, { question: 0, score: 0, answered: false, selected: -1 });

  const redraw = () => {
    context.fillStyle = palette.paper;
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (state.view === "welcome") {
      header("KIOSK TƯƠNG TÁC");
      text("TRẮC NGHIỆM KHÁM PHÁ", 768, 318, 59, palette.blue, "center", 900);
      text("Chọn môn học · chọn chủ đề · trả lời câu hỏi", 768, 388, 29, palette.ink, "center", 600);
      box(418, 548, 700, 128, palette.red, 30);
      text("BẮT ĐẦU", 768, 612, 42, palette.white, "center", 900);
      text("CHẠM VÀO MÀN HÌNH ĐỂ TƯƠNG TÁC", 768, 790, 22, palette.muted, "center", 700);
    } else if (state.view === "subjects") {
      header("CHỌN MÔN HỌC", "Bước 1 / 3");
      text("Bạn muốn khám phá nội dung nào?", 768, 204, 37, palette.ink, "center", 800);
      quizData.forEach((subject, index) => {
        const y = 290 + index * 232;
        box(156, y, 1224, 180, index === state.subject ? palette.paleBlue : palette.white, 25);
        box(187, y + 30, 116, 116, palette.blue, 21);
        text(subject.shortTitle, 245, y + 89, 33, palette.white, "center", 900);
        text(subject.title.toUpperCase(), 340, y + 67, 31, palette.blue, "left", 900);
        text(`${subject.topics.length} CHỦ ĐỀ · ${subject.topics.reduce((sum, topic) => sum + topic.questions.length, 0)} CÂU HỎI`, 340, y + 111, 20, palette.muted, "left", 700);
        text("CHỌN ›", 1314, y + 89, 23, palette.red, "right", 900);
      });
    } else if (state.view === "topics") {
      const subject = quizData[state.subject];
      header(subject.title.toUpperCase(), "Bước 2 / 3");
      text("CHỌN CHỦ ĐỀ", 80, 194, 37, palette.ink, "left", 900);
      subject.topics.forEach((topic, index) => {
        const y = 255 + index * 188;
        box(80, y, 1376, 148, palette.white, 23);
        box(108, y + 27, 94, 94, index === state.topic ? palette.red : palette.blue, 18);
        text(String(index + 1).padStart(2, "0"), 155, y + 74, 29, palette.white, "center", 900);
        text(topic.title.toUpperCase(), 240, y + 57, 29, palette.blue, "left", 900);
        text(`${topic.questions.length} CÂU HỎI TRẮC NGHIỆM`, 240, y + 99, 19, palette.muted, "left", 700);
        text("BẮT ĐẦU ›", 1390, y + 74, 22, palette.red, "right", 900);
      });
      text("‹ QUAY LẠI", 82, 1018, 22, palette.red, "left", 900);
    } else if (state.view === "question") {
      const topic = activeTopic();
      const question = currentQuestion();
      header(topic.title.toUpperCase(), `Câu ${state.question + 1} / ${topic.questions.length}`);
      box(70, 158, 1396, 174, palette.paleBlue, 22);
      const questionLines = wrappedText(question.question, 108, 216, 1300, 32, palette.ink, 42, 800);
      const answerStart = 354 + Math.max(0, questionLines - 2) * 18;
      state.answerStart = answerStart;
      const answerStep = Math.min(137, Math.floor((940 - answerStart) / question.choices.length));
      question.choices.forEach((choice, index) => {
        const y = answerStart + index * answerStep;
        let fill = palette.white;
        let accent = palette.blue;
        if (state.answered && index === question.answer) { fill = "#E4F7EB"; accent = "#16803C"; }
        if (state.answered && index === state.selected && index !== question.answer) { fill = "#FDEBEC"; accent = palette.red; }
        box(70, y, 1396, answerStep - 13, fill, 20);
        box(94, y + 18, 58, 58, accent, 15);
        text(["A", "B", "C", "D"][index], 123, y + 47, 23, palette.white, "center", 900);
        wrappedText(String(choice).replace(/\.$/, ""), 178, y + (answerStep - 13) / 2, 1190, 23, palette.ink, 29, 700);
      });
      if (state.answered) {
        const correct = state.selected === question.answer;
        text(correct ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC", 82, 965, 23, correct ? "#16803C" : palette.red, "left", 900);
        box(1138, 978, 328, 80, palette.red, 18);
        text(state.question + 1 === topic.questions.length ? "XEM KẾT QUẢ" : "CÂU TIẾP ›", 1302, 1018, 20, palette.white, "center", 900);
      }
    } else {
      const topic = activeTopic();
      header("HOÀN THÀNH", "Kết quả");
      text("KẾT QUẢ CỦA BẠN", 768, 265, 46, palette.blue, "center", 900);
      text(`${state.score} / ${topic.questions.length}`, 768, 430, 108, palette.red, "center", 900);
      text("SỐ CÂU TRẢ LỜI ĐÚNG", 768, 520, 23, palette.muted, "center", 800);
      box(290, 732, 450, 100, palette.red, 24);
      box(796, 732, 450, 100, palette.blue, 24);
      text("LÀM LẠI", 515, 782, 27, palette.white, "center", 900);
      text("CHỌN CHỦ ĐỀ", 1021, 782, 27, palette.white, "center", 900);
    }
    texture.needsUpdate = true;
    requestRender();
  };

  screenFace.userData = {
    kind: "sceneAction",
    action: hit => {
      if (!hit?.uv) return;
      const x = hit.uv.x * canvas.width;
      const y = (1 - hit.uv.y) * canvas.height;
      if (state.view === "welcome") state.view = "subjects";
      else if (state.view === "subjects") {
        const index = Math.floor((y - 290) / 232);
        if (index >= 0 && index < quizData.length) Object.assign(state, { subject: index, topic: 0, view: "topics" });
      } else if (state.view === "topics") {
        if (y > 945) state.view = "subjects";
        else {
          const index = Math.floor((y - 255) / 188);
          if (index >= 0 && index < quizData[state.subject].topics.length) {
            state.topic = index;
            resetTopic();
            state.view = "question";
          }
        }
      } else if (state.view === "question") {
        const question = currentQuestion();
        const step = Math.min(137, Math.floor((940 - state.answerStart) / question.choices.length));
        const index = Math.floor((y - state.answerStart) / step);
        if (!state.answered && index >= 0 && index < question.choices.length) {
          state.selected = index;
          state.answered = true;
          if (index === question.answer) state.score += 1;
        } else if (state.answered && x > 1100 && y > 940) {
          if (state.question + 1 < activeTopic().questions.length) Object.assign(state, { question: state.question + 1, answered: false, selected: -1 });
          else state.view = "result";
        }
      } else if (state.view === "result") {
        if (x < canvas.width / 2) { resetTopic(); state.view = "question"; }
        else state.view = "topics";
      }
      redraw();
    }
  };
  registerInteractiveObject(screenFace);
  redraw();
  return { canvas, texture, state, redraw };
}
