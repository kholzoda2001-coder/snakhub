import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

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
