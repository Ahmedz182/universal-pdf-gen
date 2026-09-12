import { embedImage } from './image';

export type LogoInput = string | Buffer | { src: string | Buffer; width?: number; height?: number };

export interface ResolvedLogo {
  src: string | Buffer;
  width: number;
  height: number;
}

/** Normalizes a template's `logo` field (bare path/Buffer, or `{src,width,height}`) to a fixed shape. */
export function resolveLogo(logo: LogoInput | undefined, defaultSize: number): ResolvedLogo | null {
  if (!logo) return null;
  if (typeof logo === 'string' || Buffer.isBuffer(logo)) {
    return { src: logo, width: defaultSize, height: defaultSize };
  }
  return { src: logo.src, width: logo.width ?? defaultSize, height: logo.height ?? defaultSize };
}

export { embedImage };
