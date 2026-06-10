'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoryCircles() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="cat-circles-wrap">
      <div className="cat-circles-scroll">
        {categories.map(c => (
          <Link href={`/category/${c.slug}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="cat-circle-item">
              <div className="cat-circle-img">
                <img src={c.img || 'https://images.unsplash.com/photo-1566478989037-e924e50cb0c2?w=200&q=80'} alt={c.name} loading="lazy" />
              </div>
              <span>{c.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
