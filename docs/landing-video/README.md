# Video do fluxo da LP

`scene.html` desenha o fluxo copiando as telas reais (`PublicBooking.tsx` e `Dashboard.tsx`): cada frame e funcao pura do tempo, 31s, 4 trechos. `render.mjs` captura os frames com Chrome headless e o ffmpeg monta os mp4 em `public/landing/`.

| Trecho | Segundos | Frames (30fps) | Arquivo |
|---|---|---|---|
| Agendar | 0-11 | 1 a 330 | agendar.mp4 |
| WhatsApp | 11-17 | 331 a 510 | whatsapp.mp4 |
| Avaliacao | 17-24 | 511 a 720 | avaliacao.mp4 |
| Agenda | 24-31 | 721 a 930 | agenda.mp4 |

Para refazer: `node render.mjs 30 31 ./frames` (dentro desta pasta) e, para cada trecho,
`ffmpeg -framerate 30 -start_number N -i frames/f_%04d.jpg -frames:v QTD -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -an trecho.mp4`.
