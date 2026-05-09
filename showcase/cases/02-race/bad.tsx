import React, { useEffect, useState } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/user/' + userId)
      .then((r) => r.json())
      .then((u) => {
        setUser(u);
        fetch('/api/posts?uid=' + u.id)
          .then((r) => r.json())
          .then((p) => {
            setPosts(p);
            setLoading(false);
          });
      })
      .catch((e) => {
        setErr(e.message);
      });
  }, [userId]);

  useEffect(() => {
    const t = setInterval(() => {
      fetch('/api/user/' + userId + '/online')
        .then((r) => r.json())
        .then((d) => setUser((prev: any) => ({ ...prev, online: d.online })));
    }, 3000);
  }, [userId]);

  const onRefresh = async () => {
    const u = await fetch('/api/user/' + userId).then((r) => r.json());
    setUser(u);
    const p = await fetch('/api/posts?uid=' + u.id).then((r) => r.json());
    setPosts(p);
  };

  return (
    <div>
      {loading && <div>loading...</div>}
      <h2>{user.name}</h2>
      <p>粉丝 {user.followers}</p>
      <button onClick={onRefresh}>刷新</button>
      <ul>
        {posts.map((p: any) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}
