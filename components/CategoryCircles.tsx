import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { canOptimize } from '../lib/imageHosts';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1566478989037-e924e50cb0c2?w=200&q=80';
// The circle is 72px across; `sizes` below lets the browser pick the right
// candidate for its own pixel density rather than always taking the 2x one.
const CIRCLE_PX = 72;

export default function CategoryCircles({ categories = [] }: { categories?: any[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="cat-circles-wrap">
      <div className="cat-circles-scroll">
        {categories.map(c => {
          const src = c.img || FALLBACK_IMG;
          return (
          <Link href={`/category/${c.slug}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="cat-circle-item">
              <div className="cat-circle-img">
                <Image
                  src={src}
                  alt={c.name}
                  width={CIRCLE_PX}
                  height={CIRCLE_PX}
                  sizes="72px"
                  unoptimized={!canOptimize(src)}
                />
              </div>
              <span>{c.name}</span>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
