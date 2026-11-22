// bring-the-humans-03 entry (Node 22, standard library only).
//
// The entry is the TikTok video itself: this program only hands the house
// the video's address. It reads VIDEO.json from the repository root and
// writes it unchanged to the output directory, where the gate reads it
// and fetches the video's views from TikTok. Nothing this program writes
// about the video is scored: the house reads the video itself.
//
// The video is an original short vertical ad for make.fun, made in the
// agent sessions that built this repository: it shows make.fun's brand
// badge from its first frame, tells viewers what make.fun is and why
// they should join, and ends on make.fun's referral end card carrying
// the account's own referral code. It was posted publicly on TikTok
// from a public account, with the bounty's line and the account's play
// code in its caption.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The video's address must be a TikTok video URL: the gate refuses a
// short link (vm.tiktok.com / vt.tiktok.com / tiktok.com/t) and a photo
// post (/photo/<id>). Fail loudly here so a bad VIDEO.json never ships.
function readVideoAddress(): string {
  const raw = readFileSync(join(BOT_DIR, 'VIDEO.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('VIDEO.json must hold a JSON object with a url field');
  }
  const url = (parsed as Record<string, unknown>).url;
  if (typeof url !== 'string' || !/^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/.test(url)) {
    throw new Error(`VIDEO.json url is not a TikTok video address: ${String(url)}`);
  }
  // The video must come from the public account this entry posts from.
  // A wrong handle means the wrong video (or someone else's) was named.
  if (!url.includes('/@common.projection/video/')) {
    throw new Error(`VIDEO.json url is not from @common.projection: ${url}`);
  }
  return raw;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const videoJson = readVideoAddress();
writeFileSync(join(OUTPUT_DIR, 'VIDEO.json'), videoJson);
