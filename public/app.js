const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const modelSelect = document.getElementById('modelSelect');
const temperatureInput = document.getElementById('temperatureInput');
const temperatureValue = document.getElementById('temperatureValue');
const systemPrompt = document.getElementById('systemPrompt');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKeyButton');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const autoSaveToggle = document.getElementById('autoSaveToggle');
const sessionNameInput = document.getElementById('sessionNameInput');
const saveSessionButton = document.getElementById('saveSessionButton');
const loadSessionButton = document.getElementById('loadSessionButton');
const clearSessionButton = document.getElementById('clearSessionButton');
const sessionSelect = document.getElementById('sessionSelect');

temperatureInput.addEventListener('input', () => {
  temperatureValue.textContent = temperatureInput.value;
});

const addMessage = (role, text) => {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}`;
  messageElement.innerHTML = `<strong>${role === 'user' ? '사용자' : '챗봇'}:</strong><p>${text}</p>`;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const saveHistory = () => {
  localStorage.setItem('chatHistory', chatLog.innerHTML);
};

const loadHistory = () => {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    chatLog.innerHTML = saved;
    chatLog.scrollTop = chatLog.scrollHeight;
  }
};

const updateSessionOptions = () => {
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
  sessionSelect.innerHTML = '';
  Object.keys(sessions).forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    sessionSelect.appendChild(option);
  });
};

const saveSession = (name) => {
  if (!name) return;
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
  sessions[name] = {
    html: chatLog.innerHTML,
    timestamp: new Date().toISOString(),
    model: modelSelect.value,
    temperature: temperatureInput.value,
    systemPrompt: systemPrompt.value,
  };
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
  updateSessionOptions();
  apiKeyStatus.textContent = `세션 '${name}' 저장됨.`;
};

const loadSession = (name) => {
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
  const session = sessions[name];
  if (!session) {
    apiKeyStatus.textContent = '선택한 세션을 찾을 수 없습니다.';
    return;
  }
  chatLog.innerHTML = session.html;
  modelSelect.value = session.model;
  temperatureInput.value = session.temperature;
  temperatureValue.textContent = session.temperature;
  systemPrompt.value = session.systemPrompt;
  saveHistory();
  apiKeyStatus.textContent = `세션 '${name}' 불러오기 완료.`;
};

const clearChat = () => {
  chatLog.innerHTML = '';
  saveHistory();
};

const setApiKey = async (key) => {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API 키 저장에 실패했습니다.');
    }
    localStorage.setItem('openaiApiKey', key);
    apiKeyStatus.textContent = 'API 키가 등록되었습니다.';
  } catch (err) {
    apiKeyStatus.textContent = `API 등록 오류: ${err.message}`;
  }
};

saveApiKeyButton.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiKeyStatus.textContent = 'API 키를 입력하세요.';
    return;
  }
  setApiKey(key);
});

saveSessionButton.addEventListener('click', () => {
  const name = sessionNameInput.value.trim() || '기본 세션';
  saveSession(name);
});

loadSessionButton.addEventListener('click', () => {
  const name = sessionSelect.value || sessionNameInput.value.trim();
  if (!name) {
    apiKeyStatus.textContent = '불러올 세션 이름을 선택하거나 입력하세요.';
    return;
  }
  loadSession(name);
});

clearSessionButton.addEventListener('click', () => {
  clearChat();
  apiKeyStatus.textContent = '채팅 로그가 초기화되었습니다.';
});

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addMessage('user', text);
  userInput.value = '';

  const payload = {
    messages: [{ role: 'user', content: text }],
    model: modelSelect.value,
    temperature: Number(temperatureInput.value),
    systemPrompt: systemPrompt.value,
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      addMessage('assistant', `오류: ${data.error || '응답을 받지 못했습니다.'}`);
      if (autoSaveToggle.checked) saveSession(sessionNameInput.value.trim() || '기본 세션');
      saveHistory();
      return;
    }

    addMessage('assistant', data.answer.content);
    if (autoSaveToggle.checked) saveSession(sessionNameInput.value.trim() || '기본 세션');
    saveHistory();
  } catch (error) {
    addMessage('assistant', `네트워크 오류: ${error.message}`);
    if (autoSaveToggle.checked) saveSession(sessionNameInput.value.trim() || '기본 세션');
    saveHistory();
  }
});

const restoreSettings = () => {
  const savedApiKey = localStorage.getItem('openaiApiKey');
  const savedAutoSave = localStorage.getItem('chatAutoSave') === 'true';
  const savedSessionName = localStorage.getItem('chatSessionName') || '기본 세션';
  const savedModel = localStorage.getItem('chatModel');
  const savedTemperature = localStorage.getItem('chatTemperature');
  const savedSystemPrompt = localStorage.getItem('chatSystemPrompt');

  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    setApiKey(savedApiKey);
  }
  autoSaveToggle.checked = savedAutoSave;
  sessionNameInput.value = savedSessionName;
  if (savedModel) modelSelect.value = savedModel;
  if (savedTemperature) {
    temperatureInput.value = savedTemperature;
    temperatureValue.textContent = savedTemperature;
  }
  if (savedSystemPrompt) systemPrompt.value = savedSystemPrompt;
};

const persistSettings = () => {
  localStorage.setItem('chatAutoSave', autoSaveToggle.checked);
  localStorage.setItem('chatSessionName', sessionNameInput.value.trim() || '기본 세션');
  localStorage.setItem('chatModel', modelSelect.value);
  localStorage.setItem('chatTemperature', temperatureInput.value);
  localStorage.setItem('chatSystemPrompt', systemPrompt.value);
};

modelSelect.addEventListener('change', persistSettings);
temperatureInput.addEventListener('change', persistSettings);
systemPrompt.addEventListener('change', persistSettings);
autoSaveToggle.addEventListener('change', persistSettings);
sessionNameInput.addEventListener('change', persistSettings);

loadHistory();
updateSessionOptions();
restoreSettings();
