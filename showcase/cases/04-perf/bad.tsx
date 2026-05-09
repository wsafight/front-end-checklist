import React, { useEffect, useState } from 'react';

type Product = { id: number; title: string; price: number; tags: string[]; cover: string };

export function ProductGrid({ keyword }: { keyword: string }) {
  const [list, setList] = useState<Product[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetch('/api/products?limit=5000')
      .then((r) => r.json())
      .then((d) => setList(d));
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const filtered = list.filter((p) =>
    (p.title + p.tags.join(',')).toLowerCase().includes(keyword.toLowerCase()),
  );

  const featured = list.sort((a, b) => b.price - a.price).slice(0, 3);

  return (
    <div style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
      <h3>精选</h3>
      <div className="feature-row">
        {featured.map((p, i) => (
          <div key={i} style={{ border: '1px solid #eee', padding: 8 }}>
            <img src={p.cover} />
            <div>{p.title}</div>
          </div>
        ))}
      </div>

      <h3>全部商品（{filtered.length}）</h3>
      <div className="grid">
        {filtered.map((p, i) => (
          <div
            key={i}
            className="card"
            onClick={() => console.log('click', p)}
            style={{ background: i % 2 ? '#fafafa' : '#fff' }}
          >
            <img src={p.cover} width="200" height="200" />
            <div>{p.title}</div>
            <div>￥{p.price.toFixed(2)}</div>
            <TagBar tags={p.tags} onTag={(t) => console.log('tag', t)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TagBar({ tags, onTag }: { tags: string[]; onTag: (t: string) => void }) {
  const sorted = [...tags].sort();
  return (
    <div>
      {sorted.map((t, i) => (
        <span key={i} onClick={() => onTag(t)} style={{ marginRight: 4 }}>
          #{t}
        </span>
      ))}
    </div>
  );
}
