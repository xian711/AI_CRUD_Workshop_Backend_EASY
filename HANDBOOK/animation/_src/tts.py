# Gemini TTS 試聽工具：經 Vertex AI（金鑰在環境變數 GEMINI_API_KEY，不印出）
import os, json, base64, urllib.request, urllib.error, wave, io

KEY = os.environ['GEMINI_API_KEY']
HOST = 'https://aiplatform.googleapis.com/v1/publishers/google/models/'


def _post(model, body, timeout=180):
    req = urllib.request.Request(HOST + model + ':generateContent', data=json.dumps(body).encode(),
                                 headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        b = e.read().decode('utf8', 'ignore').replace(KEY, '<KEY>')
        raise RuntimeError(f'{e.code} {b[:400]}')


def speak(text, voice, style=None, model='gemini-3.8-flash-tts', lang='cmn-TW'):
    """回傳 (wav bytes, 用量)。style 放在 systemInstruction，不放進要念的文字裡。"""
    body = {'contents': [{'role': 'user', 'parts': [{'text': text}]}],
            'generationConfig': {'responseModalities': ['AUDIO'],
                                 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}, 'languageCode': lang}}}
    if style:
        body['systemInstruction'] = {'parts': [{'text': style}]}
    d = _post(model, body)
    p = d['candidates'][0]['content']['parts'][0]['inlineData']
    raw = base64.b64decode(p['data'])
    if not raw[:4] == b'RIFF':  # 沒有檔頭的 PCM：自己包成 wav（24kHz 單聲道 16-bit）
        buf = io.BytesIO(); w = wave.open(buf, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(raw); w.close(); raw = buf.getvalue()
    return raw, d.get('usageMetadata', {})


def transcribe(wav, model='gemini-3.5-flash'):
    """請另一個 Gemini 模型聽寫（繁體中文、英文照原樣），用來抓唸錯或把指示念出來。"""
    body = {'contents': [{'role': 'user', 'parts': [
        {'inlineData': {'mimeType': 'audio/wav', 'data': base64.b64encode(wav).decode()}},
        {'text': '逐字聽寫這段語音。用台灣繁體中文，英文、數字照念出來的樣子寫。只輸出聽寫文字。另起一行，用「口音：」開頭，一句話說明口音比較像台灣還是中國大陸，並列出你聽到念錯或讀音奇怪的字。'}]}]}
    d = _post(model, body)
    return d['candidates'][0]['content']['parts'][0]['text'].strip()


def duration(wav):
    w = wave.open(io.BytesIO(wav)); return w.getnframes() / w.getframerate()
