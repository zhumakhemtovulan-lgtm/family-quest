"use client";

export type CardInput = {
  photo: HTMLCanvasElement | HTMLImageElement | null;
  title: string;
  familyName: string;
  chapter: number;
  secretWord: string;
  themeEmoji: string;
  date: Date;
};

const W = 1080;
const H = 1920; // Instagram / Facebook Stories size
const INK = "#1F2340";
const CREAM = "#FFF4E4";
const CORAL = "#FF6B4A";
const SUN = "#FFC94A";

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement | HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const sw = src instanceof HTMLImageElement ? src.naturalWidth : src.width;
  const sh = src instanceof HTMLImageElement ? src.naturalHeight : src.height;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('700 80px "Fraunces"'),
      document.fonts.load('700 48px "Nunito"'),
      document.fonts.load('600 34px "Nunito"'),
    ]);
  } catch {
    // Falls back to system fonts.
  }
}

export async function renderFamilyCard(input: CardInput): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Photo (or an illustrated placeholder when the family skipped the photo)
  const px = 60, py = 60, pw = W - 120, ph = 1200;
  ctx.save();
  roundedRect(ctx, px, py, pw, ph, 56);
  ctx.clip();
  if (input.photo) {
    drawCover(ctx, input.photo, px, py, pw, ph);
  } else {
    const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, CORAL);
    g.addColorStop(1, SUN);
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    ctx.font = "360px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(input.themeEmoji, W / 2, py + ph / 2);
  }
  ctx.restore();

  // Chapter badge
  const badge = `CHAPTER ${input.chapter}`;
  ctx.font = '800 40px "Nunito", system-ui, sans-serif';
  const bw = ctx.measureText(badge).width + 64;
  ctx.fillStyle = INK;
  roundedRect(ctx, px + 36, py + 36, bw, 76, 38);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badge, px + 68, py + 76);

  // Title
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 84px "Fraunces", Georgia, serif';
  const lines = wrapText(ctx, input.title, W - 140, 2);
  let y = py + ph + 130;
  for (const line of lines) {
    ctx.fillText(line, 70, y);
    y += 96;
  }

  // Family + date
  ctx.font = '700 52px "Nunito", system-ui, sans-serif';
  ctx.fillStyle = CORAL;
  ctx.fillText(input.familyName, 70, y + 10);
  ctx.font = '600 38px "Nunito", system-ui, sans-serif';
  ctx.fillStyle = "rgba(31,35,64,0.7)";
  const dateText = input.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  ctx.fillText(`${dateText}  ·  Secret word: ${input.secretWord}`, 70, y + 80);

  // Footer
  ctx.font = '700 36px "Nunito", system-ui, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.fillText(`${input.themeEmoji}  Family Quest — tonight, home is the adventure`, W / 2, H - 70);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/jpeg", 0.9),
  );
}
