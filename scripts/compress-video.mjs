// Shrinks a video for web background use: H.264, no audio, capped bitrate, streams before fully downloaded.
// Usage: npm run compress:video -- <input.mp4> <output.mp4>
import { spawnSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error('Usage: npm run compress:video -- <input.mp4> <output.mp4>')
  process.exit(1)
}

const { status } = spawnSync(
  ffmpeg,
  [
    '-y',
    '-i',
    input,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '27',
    '-maxrate',
    '1800k',
    '-bufsize',
    '3600k',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    output,
  ],
  { stdio: 'inherit' },
)
process.exit(status ?? 1)
