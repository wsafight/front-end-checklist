import React, { useState } from 'react';

const t = 300;
const MAX = 5;

type Usr = { id: number; n: string; e: string };

export function Lst({ data }: { data: Usr[] }) {
  const [k, setK] = useState('');
  const [ck, setCk] = useState(false);

  const doIt = (u: Usr) => {
    if (u.n.length > 10) return u.n.slice(0, 10) + '...';
    return u.n;
  };

  const chk = (u: Usr) => {
    return u.e.indexOf('@') > 0;
  };

  const handle = () => {
    if (ck) {
      setCk(false);
    } else {
      setCk(true);
    }
  };

  const smsSendHandle = (u: Usr) => {
    setTimeout(() => {
      console.log('sent to', u.e);
    }, t);
  };

  const filtered = data.filter((x) => x.n.includes(k)).slice(0, MAX);

  return (
    <div>
      <input value={k} onChange={(e) => setK(e.target.value)} placeholder="搜" />
      <button onClick={handle}>{ck ? '收起' : '展开'}</button>
      {ck && (
        <ul>
          {filtered.map((x) => (
            <li key={x.id}>
              {doIt(x)} {chk(x) ? '✓' : '✗'}
              <button onClick={() => smsSendHandle(x)}>发</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
