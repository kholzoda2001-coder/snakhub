import { ImageResponse } from 'next/og';

// The edge runtime is deprecated in Next 16, and it was the one thing stopping
// this icon from being generated once at build time — every request was
// rendering the same 32px "SH" from scratch. On the default runtime it is
// prerendered and served as a static file.

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 26,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d61a1a', // SH red color matching the logo
          fontWeight: 900,
          fontFamily: 'sans-serif',
          fontStyle: 'italic',
          letterSpacing: '-2px',
          paddingRight: '2px', // visually center italic text
        }}
      >
        SH
      </div>
    ),
    {
      ...size,
    }
  );
}
