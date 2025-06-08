const audioButton = document.querySelector(".audio-button");
const chatBox = document.querySelector(".chat-box");

const DEEPSEEK_API_KEY = "sk-0e19faf29ca241e4bab6264a0536232b";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Initialize speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "zh-CN";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

audioButton.addEventListener("click", () => {
  chatBox.innerText = "正在聆听中，请说话...";
  recognition.start();
});

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  displayText(`你：${userText}`);

  try {
    const assistantReply = await getDeepseekReply(userText);
    displayText(`助手：${assistantReply}`);
    speakText(assistantReply);
  } catch (err) {
    console.error("Deepseek API 出错:", err);
    displayText("助手：哎呀，我出错了，请再试一次。");
  }
};

recognition.onerror = (event) => {
  console.error("语音识别错误", event.error);
  displayText("助手：我没有听清楚，可以再说一次吗？");
};

function displayText(text) {
  chatBox.innerText = text;
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  speechSynthesis.speak(utterance);
}

async function getDeepseekReply(userInput) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一位温柔友善的AI美妆助理，请用鼓励和亲切的语气帮助用户。",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
