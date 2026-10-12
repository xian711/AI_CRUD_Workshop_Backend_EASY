# 第三版配音：照 script_v3.py 逐句錄（小芸 Sulafat／阿哲 Sadaltager），AI 聽寫比對，念走樣就重錄（最多 3 次）
# 輸出：<OUT>/<雜湊>.mp3 ＋ <OUT>/manifest.json（"段-句" → 檔名、秒數、偏差分數）；同樣的句子不會重錄
import base64, difflib, hashlib, io, json, os, re, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
import tts
from script_be_hands import SCENES

OUT = sys.argv[1] if len(sys.argv) > 1 else 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/audio-be-hands'
os.makedirs(OUT, exist_ok=True)
VOICE = {'小芸': 'Sulafat', '阿哲': 'Sadaltager'}
STYLE = {
    '小芸': '台灣的女性講師，在課堂上講解 AI 開發的方法和觀念。標準國語，咬字清楚，台北人平常說話的語調；親切、自然、語速中等，像在跟學員說話，不要像在念稿。台詞要逐字照念，不要改詞、不要加字。',
    '阿哲': '台灣的男性講師，在課堂上帶學員看實際操作的畫面。標準國語，咬字清楚，台北人平常說話的語調；沉穩、清楚、語速中等，像在跟學員說話，不要像在念稿。台詞要逐字照念，不要改詞、不要加字。',
}
SPOKEN = [  # 念法：字幕不變，只改念出來的字
    (r'Ctrl\+Shift\+V', 'Control Shift V'),
    (r'localhost:3100', 'localhost 三一零零'), (r'3100', '三一零零'), (r'console\.log', 'console 點 log'),
    (r'Ctrl\+C', 'Control C'), (r'Ctrl', 'Control'), (r'my-equipment-app', 'my equipment app'),
    (r'Set-ExecutionPolicy', 'Set Execution Policy'), (r'step6_survey', 'step 6 survey'), (r'IT-NBK-003', 'I T N B K 零零三'),
    (r'45 個', '四十五個'),
    # 第四版：模型版本、檔名、編碼的念法
    (r'Opus 5\.5', 'Opus 五點五'), (r'Sonnet 5\.5', 'Sonnet 五點五'), (r'PW-GEN-003', 'P W G E N 零零三'),
    (r'LOOP-LOG(\.md)?', 'LOOP LOG'), (r'LOOP-REPORT(\.html)?', 'LOOP REPORT'), (r'E2E', 'E 2 E'),
    # 後端課
    (r'5080', '五零八零'), (r'3199', '三一九九'), (r'5432', '五四三二'), (r'my-equipment-api', 'my equipment API'),
    (r'SRS-delta', 'SRS delta'), (r'設計文件-delta', '設計文件 delta'), (r'ModelResult', 'Model Result'), (r'equipment_item', 'equipment item'),
    (r'dotnet', 'dot net'), (r'\.NET', 'dot NET'), (r'psql', 'P S Q L'), (r'CLAUDE\.md', 'CLAUDE 點 md'), (r'AGENTS\.md', 'AGENTS 點 md'),
    (r'CODE-RULES-api', 'CODE RULES API'), (r'contract-conventions-summary', 'contract conventions summary'), (r'EF Core', 'E F Core'),
    (r'M-999', 'M 九九九'), (r'E-999', 'E 九九九'), (r'Ctrl\+C', 'Control C'), (r'cd 空格兩個點', 'cd 空格 兩個點'),
    # 第六版
    (r'3200', '三二零零'), (r'IT-LAP-00(\d)', r'I T L A P 零零\1'), (r'IT-TAB', 'I T T A B'),
    (r'fullchain-app', 'full chain app'), (r'Program\.cs', 'Program 點 cs'), (r'nuget\.org', 'NuGet 點 org'),
    (r'NU1101', 'N U 一一零一'), (r'NU1301', 'N U 一三零一'), (r'1400 px', '一千四百 px'), (r'1 agent', 'one agent'),
    (r'ER 圖', 'E R 圖'), (r'PK', 'P K'), (r'UK', 'U K'), (r'1\.5', '一點五'),
    (r'devProxy', 'dev proxy'), (r'run-e2e', 'run E 2 E'), (r'camelCase', 'camel case'), (r'DIAGRAMS', 'DIAGRAMS'),
]


def spoken(s):
    for a, b in SPOKEN:
        s = re.sub(a, b, s)
    return s


FILLER = '欸誒嗯喔哦啊耶呢吧'
norm = lambda s: re.sub(r'[\s，。、：；「」！？,.:;!?\-—…（）()+／/]|[' + FILLER + ']', '', s).lower()


def drift(want, heard):
    got = re.sub(r'(?m)^\s*口音：.*$', '', heard)
    a, b = norm(want), norm(got)
    ops = difflib.SequenceMatcher(None, a, b).get_opcodes()
    return sum(max(a2 - a1, b2 - b1) for op, a1, a2, b1, b2 in ops if op != 'equal'), [f'{a[a1:a2]}→{b[b1:b2]}' for op, a1, a2, b1, b2 in ops if op != 'equal']


def render(text, who):
    body = {'contents': [{'role': 'user', 'parts': [{'text': text, 'speech_metadata': {'style': STYLE[who]}}]}],
            'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': VOICE[who]}}, 'languageCode': 'cmn-TW'}}}
    d = tts._post('gemini-3.8-flash-tts', body)
    raw = base64.b64decode(d['candidates'][0]['content']['parts'][0]['inlineData']['data'])
    return raw, d.get('usageMetadata', {}).get('candidatesTokenCount', 0)


def transcribe(wav):
    body = {'contents': [{'role': 'user', 'parts': [{'inlineData': {'mimeType': 'audio/wav', 'data': base64.b64encode(wav).decode()}},
            {'text': '逐字聽寫這段語音，用台灣繁體中文；英文、數字照念出來的樣子寫。只輸出聽寫文字。'}]}]}
    d = tts._post('gemini-3.5-flash', body)
    return d['candidates'][0]['content']['parts'][0]['text'].strip()


old = {}
mf = os.path.join(OUT, 'manifest.json')
if os.path.exists(mf):
    old = json.load(open(mf, encoding='utf-8'))
BYFILE = {r['file']: r for r in old.values()}
jobs = []
for i, (chap, title, who, visual, lines) in enumerate(SCENES, 1):
    for k, l in enumerate(lines, 1):
        sub, say = (l, spoken(l)) if isinstance(l, str) else (l[0], l[1])
        if '【' in sub or re.search(r'(?<![A-Z])[NM] (分鐘|條|題|個)', sub):   # 還沒定稿的句子（實拍後補）先不錄
            continue
        key = hashlib.sha1((VOICE[who] + STYLE[who] + say).encode()).hexdigest()[:12]
        jobs.append((f'{i}-{k}', who, sub, say, key))


def work(job):
    sk, who, sub, say, key = job
    mp3 = os.path.join(OUT, key + '.mp3')
    prev = old.get(sk)
    if prev and prev.get('file') == key + '.mp3' and os.path.exists(mp3):
        return sk, prev, 0
    same = BYFILE.get(key + '.mp3')   # 段號改了但同一句話錄過：沿用
    if same and os.path.exists(mp3):
        return sk, dict(same, sub=sub), 0
    best, tokens = None, 0
    for attempt in range(3):
        try:
            wav, t = render(say, who); tokens += t
            heard = transcribe(wav)
        except Exception as e:
            print(sk, 'ERR', str(e)[:120], flush=True); continue
        score, diffs = drift(say, heard)
        dur = tts.duration(wav)
        # 太短或太長（每秒字數不合理）也算走樣
        cps = len(norm(say)) / max(dur, 0.1)
        if cps < 2.2 or cps > 8.5:
            score += 10
        if best is None or score < best[0]:
            best = (score, wav, heard, diffs, attempt + 1, dur)
        if score <= 1:
            break
    if not best:
        return sk, None, tokens
    score, wav, heard, diffs, tries, dur = best
    tmp = os.path.join(OUT, key + '.wav'); open(tmp, 'wb').write(wav)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-b:a', '48k', mp3], check=True)
    os.remove(tmp)
    rec = {'file': key + '.mp3', 'sec': round(dur, 2), 'who': who, 'sub': sub, 'say': say, 'heard': heard, 'drift': score, 'diffs': diffs[:8], 'tries': tries}
    print(sk, who, round(dur, 1), 's drift', score, 'tries', tries, diffs[:4], flush=True)
    return sk, rec, tokens


man, total = {}, 0
with ThreadPoolExecutor(4) as ex:
    for sk, rec, t in ex.map(work, jobs):
        total += t
        if rec:
            man[sk] = rec
json.dump(man, open(mf, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
missing = [j[0] for j in jobs if j[0] not in man]
print('done', len(man), '/', len(jobs), 'missing', missing, 'audio tokens', total, '≈ US$', round(total / 1e6 * 9, 3))
print('total minutes', round(sum(r['sec'] for r in man.values()) / 60, 1), 'high drift', [(k, r['drift']) for k, r in man.items() if r['drift'] > 3])
