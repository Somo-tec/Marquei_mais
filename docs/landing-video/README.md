# Video do fluxo da LP

`scene.html` desenha o fluxo (cada frame e funcao pura do tempo, 24s, 4 trechos de 6s). `render.mjs` captura os frames com Chrome headless e o ffmpeg monta os mp4 em `public/landing/`.

Para refazer: `node render.mjs 30 24 ./frames` (dentro desta pasta), depois `ffmpeg -framerate 30 -start_number N -i frames/f_%04d.jpg -frames:v 180 -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -an trecho.mp4` com N = 1, 181, 361, 541.
