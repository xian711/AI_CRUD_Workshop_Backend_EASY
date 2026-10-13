# 把做好的後端動畫裝進課程 repo：HANDBOOK/animation/（index.html＋images＋audio＋_src）
# 用法：python install.py [repo 根目錄]
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1] if len(sys.argv) > 1 else r'D:\AIWORK\_AICLASS\AI_CRUD_Workshop_Backend_EASY'
DST = os.path.join(REPO, 'HANDBOOK', 'animation')
OUT = os.path.join(HERE, 'out-be')

# 只放場景真的用到的截圖
src = open(os.path.join(HERE, 'scenes-be.js'), encoding='utf-8').read()
imgs = [f[:-4] for f in os.listdir(os.path.join(OUT, 'images')) if f.endswith('.jpg')]
used = sorted(n for n in imgs if re.search(r"['\"]" + re.escape(n) + r"['\"]", src) or re.fullmatch(r'bv6-diag-\d-(svg|head)', n))

if os.path.exists(DST):
    shutil.rmtree(DST)
os.makedirs(os.path.join(DST, 'images'))
os.makedirs(os.path.join(DST, '_src'))
shutil.copy(os.path.join(OUT, 'anim.html'), os.path.join(DST, 'index.html'))
for n in used:
    shutil.copy(os.path.join(OUT, 'images', n + '.jpg'), os.path.join(DST, 'images', n + '.jpg'))
# 預錄配音（每句一個 mp3）
shutil.copytree(os.path.join(OUT, 'audio'), os.path.join(DST, 'audio'))

# 原始檔：場景、繪圖工具、播放器、組裝與截圖腳本（不含實拍原圖 raw/，也不含本機專用的腳本）
SRC_FILES = ['scenes-be.js', 'scenes-be6-lec-body.js', 'scenes-be.v1.js', 'mk-be6.py', 'be6-import.py', 'after.v1.html', 'mk-be.sh', 'build_be_data.py', 'be-plan.md', 'after.html',
             'v3-helpers.js', 'helpers-crud.js', 'helpers.js', 'engine-v3.html', 'be-data.js',
             'prep.py', 'build.py', 'check.mjs', 'sheet.py', 't-v3.mjs', 't-v3-play.mjs', 't-installed.mjs', 't-latency2.mjs', 't-pause-freeze.mjs', 'install.py',
             'vsc-lib.mjs', 'driver.mjs', 'send.mjs', 'build-wait.sh', 'dlg.ps1', 'ocr-find.ps1',
             'cap-page.mjs', 'cap-swagger.mjs', 'cap-diag.mjs', 'md2html.py', 't-diag.mjs', 'pg-be-prd.json', 'pg-be-srs.json', 'pg-be-design.json', 'pg-be-tasks.json', 'pg-be-report.json', 'pg-be-pw.json', 'pg-be-log.json', 'pg-be-srsafter.json', 'pg-be-designafter.json', 'mk-c-bdocs.py', 'mk-c-bq.py', 'mk-c-bc01.py', 'mk-c-be03a.py', 'mk-c-be10.py',
             'pg-step1-2.json', 'pg-arch.json', 'pg-be-diag.json', 'c-hasq.json', 'c-busy2.json', 'c-qtext.json', 'handbook-pres.txt']
for f in SRC_FILES:
    p = os.path.join(HERE, f)
    if os.path.exists(p):
        shutil.copy(p, os.path.join(DST, '_src', f))
shutil.copy(os.path.join(OUT, 'meta.json'), os.path.join(DST, '_src', 'meta.json'))
shutil.copy(os.path.join(HERE, 'raw', 'meta-extra.json'), os.path.join(DST, '_src', 'meta-extra.json'))
if os.path.exists(os.path.join(HERE, 'SRC-README.md')):
    shutil.copy(os.path.join(HERE, 'SRC-README.md'), os.path.join(DST, '_src', 'README.md'))
TTS = os.path.join(os.path.dirname(HERE), 'tts-audition')
for f in ['script_be.py', 'script_be.v1.py', 'make_be_audio.py', 'tts.py', '講稿風格卡.md']:
    if os.path.exists(os.path.join(TTS, f)):
        shutil.copy(os.path.join(TTS, f), os.path.join(DST, '_src', f))
if os.path.exists(os.path.join(HERE, 'audio-be', 'manifest.json')):
    shutil.copy(os.path.join(HERE, 'audio-be', 'manifest.json'), os.path.join(DST, '_src', 'audio-manifest.json'))

# 安全檢查：帳號名稱不能出現在要放進 repo 的文字檔裡
user = os.environ.get('USERNAME', '')
bad = []
for root, _, files in os.walk(DST):
    for f in files:
        if f.endswith(('.jpg', '.png', '.mp3')):
            continue
        t = open(os.path.join(root, f), encoding='utf-8', errors='ignore').read()
        for m in re.finditer(r'(?i)users[\\/]+' + re.escape(user) + r'|CJ-?831|xian711', t):
            bad.append((f, m.group(0)))
size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(DST) for f in fs)
print('installed', DST, 'images', len(used), 'size %.1f MB' % (size / 1e6))
print('personal-path hits:', bad or 'none')
