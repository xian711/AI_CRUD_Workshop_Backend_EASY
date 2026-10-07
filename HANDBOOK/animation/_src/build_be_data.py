# 第三版：把講稿（script_v3.py）和配音清單（audio-v3/manifest.json）寫成 be-data.js，並把用到的音檔複製到 <out>/audio
import json, os, shutil, sys
sys.path.insert(0, r'D:\AIWORK\pw-shots-tmp\tts-audition')
from script_be import SCENES

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out-be')
AUD = os.path.join(HERE, 'audio-be')
script = [{'chap': c, 'title': t, 'who': w, 'lines': [l if isinstance(l, str) else l[0] for l in L]} for c, t, w, v, L in SCENES]
man = json.load(open(os.path.join(AUD, 'manifest.json'), encoding='utf-8')) if os.path.exists(os.path.join(AUD, 'manifest.json')) else {}
shutil.rmtree(os.path.join(OUT, 'audio'), ignore_errors=True)   # 舊版本的音檔不要留著
os.makedirs(os.path.join(OUT, 'audio'), exist_ok=True)
audio, missing = {}, []
for i, s in enumerate(script, 1):
    for k, line in enumerate(s['lines'], 1):
        rec = man.get(f'{i}-{k}')
        if rec and rec.get('sub') == line and os.path.exists(os.path.join(AUD, rec['file'])):
            shutil.copy(os.path.join(AUD, rec['file']), os.path.join(OUT, 'audio', rec['file']))
            audio[f'{i}-{k}'] = {'src': 'audio/' + rec['file'], 'sec': rec['sec'], 'who': rec['who']}
        else:
            missing.append(f'{i}-{k}')
js = '// 由 build_v3_data.py 產生：講稿與配音清單\nwindow.__script = ' + json.dumps(script, ensure_ascii=False) + ';\nwindow.__audio = ' + json.dumps(audio, ensure_ascii=False) + ';\n'
open(os.path.join(HERE, 'be-data.js'), 'w', encoding='utf-8').write(js)
print('scenes', len(script), 'lines', sum(len(s['lines']) for s in script), 'audio', len(audio), 'missing', missing,
      'minutes', round(sum(a['sec'] for a in audio.values()) / 60, 1))
