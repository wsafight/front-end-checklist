import React, { useEffect, useState } from 'react';

type User = { id: string; name: string; email: string; role: 'admin' | 'user'; createdAt: string };

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'createdAt'>('name');
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(() => {
    return Number(new URLSearchParams(location.search).get('page')) || 1;
  });

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((list: User[]) => {
        setUsers(list);
        setUserCount(list.length);
        setAdminCount(list.filter((u) => u.role === 'admin').length);
        setFilteredUsers(list);
        setSortedUsers(list);
      });
  }, []);

  useEffect(() => {
    const f = users.filter((u) => u.name.includes(keyword) || u.email.includes(keyword));
    setFilteredUsers(f);
    const s = [...f].sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1));
    setSortedUsers(s);
  }, [keyword, sortKey, users]);

  useEffect(() => {
    if (selectedId) {
      const u = users.find((x) => x.id === selectedId) || null;
      setSelectedUser(u);
    } else {
      setSelectedUser(null);
    }
  }, [selectedId, users]);

  const onDelete = (id: string) => {
    fetch('/api/users/' + id, { method: 'DELETE' });
    const next = users.filter((u) => u.id !== id);
    setUsers(next);
    setUserCount(next.length);
    setAdminCount(next.filter((u) => u.role === 'admin').length);
  };

  return (
    <div>
      <div>
        总数 {userCount} / 管理员 {adminCount} / 当前页 {page}
      </div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索" />
      <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
        <option value="name">姓名</option>
        <option value="createdAt">创建时间</option>
      </select>
      <table>
        <tbody>
          {sortedUsers.map((u) => (
            <tr key={u.id} onClick={() => setSelectedId(u.id)}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => onDelete(u.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && <div className="detail">{selectedUser.name}</div>}
    </div>
  );
}
