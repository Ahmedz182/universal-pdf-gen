import fs from 'fs';
import path from 'path';
import { PDFDoc } from '../types';

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'svg' | 'unknown';

const MAGIC_BYTES: Array<[ImageFormat, Buffer]> = [
  ['png', Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  ['jpeg', Buffer.from([0xff, 0xd8, 0xff])],
  ['gif', Buffer.from('GIF8')]
];

function detectFromBuffer(buf: Buffer): ImageFormat {
  for (const [format, magic] of MAGIC_BYTES) {
    if (buf.subarray(0, magic.length).equals(magic)) return format;
  }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  const head = buf.subarray(0, 512).toString('utf8').trimStart();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'svg';
  return 'unknown';
}

function detectFromExtension(ext: string): ImageFormat {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'png';
    case '.jpg':
    case '.jpeg':
      return 'jpeg';
    case '.webp':
      return 'webp';
    case '.gif':
      return 'gif';
    case '.svg':
      return 'svg';
    default:
      return 'unknown';
  }
}

export function detectFormat(source: string | Buffer): ImageFormat {
  if (Buffer.isBuffer(source)) {
    return detectFromBuffer(source);
  }
  const byExtension = detectFromExtension(path.extname(source));
  if (byExtension !== 'unknown') return byExtension;
  return detectFromBuffer(fs.readFileSync(source));
}

function readSource(source: string | Buffer): Buffer {
  return Buffer.isBuffer(source) ? source : fs.readFileSync(source);
}

/**
 * Resolves any supported image source (PNG, JPEG, GIF, WEBP, SVG — as a file
 * path or an in-memory Buffer) down to either:
 *  - `{ kind: 'raster', buffer }` — a PNG/JPEG buffer PDFKit can embed directly
 *    via `doc.image()`, or
 *  - `{ kind: 'svg', markup }` — SVG markup to be drawn as vector paths via
 *    `svg-to-pdfkit`.
 *
 * WEBP and other raster formats are transparently normalized to PNG using
 * `sharp` since PDFKit only natively understands PNG/JPEG.
 */
export async function resolveImage(
  source: string | Buffer
): Promise<{ kind: 'raster'; buffer: Buffer } | { kind: 'svg'; markup: string }> {
  const format = detectFormat(source);

  if (format === 'svg') {
    return { kind: 'svg', markup: readSource(source).toString('utf8') };
  }

  if (format === 'png' || format === 'jpeg') {
    return { kind: 'raster', buffer: readSource(source) };
  }

  // WEBP, GIF, or anything else raster PDFKit can't embed natively — normalize via sharp.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sharp = require('sharp');
  const buffer: Buffer = await sharp(readSource(source)).png().toBuffer();
  return { kind: 'raster', buffer };
}

export interface EmbedImageOptions {
  width?: number;
  height?: number;
}

/**
 * Draws an image (PNG, JPEG, GIF, WEBP, or SVG — file path or Buffer) onto a
 * PDFKit document at the given top-left position. SVG is drawn as true vector
 * paths via `svg-to-pdfkit` rather than being rasterized, so logos stay crisp.
 */
export async function embedImage(doc: PDFDoc, source: string | Buffer, x: number, y: number, options: EmbedImageOptions = {}): Promise<void> {
  const resolved = await resolveImage(source);

  if (resolved.kind === 'svg') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SVGtoPDF = require('svg-to-pdfkit');
    SVGtoPDF(doc, resolved.markup, x, y, { width: options.width, height: options.height, preserveAspectRatio: 'xMidYMid meet' });
    return;
  }

  doc.image(resolved.buffer, x, y, { width: options.width, height: options.height });
}
