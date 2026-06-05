'use client';
import React from 'react';

const categories = [
  { id: 'energy', label: 'Energy', img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200&q=80' },
  { id: 'protein', label: 'Protein', img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=200&q=80' },
  { id: 'chips', label: 'Chips', img: 'https://images.unsplash.com/photo-1566478989037-e924e50cb0c2?w=200&q=80' },
  { id: 'candy', label: 'Candy', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=200&q=80' },
  { id: 'healthy', label: 'Healthy', img: 'https://images.unsplash.com/photo-1515022384246-8800db721cb2?w=200&q=80' },
];

export default function CategoryCircles() {
  return (
    <div className="cat-circles-wrap">
      <div className="cat-circles-scroll">
        {categories.map(c => (
          <div key={c.id} className="cat-circle-item">
            <div className="cat-circle-img">
              <img src={c.img} alt={c.label} loading="lazy" />
            </div>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
