import React, { useState } from 'react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [age, setAge] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (email == '' || pwd == '') {
      setErr('请填写');
      return;
    }
    if (Number(age) < 18) {
      setErr('年龄不够');
      return;
    }
    fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, pwd, age }),
    });
  };

  return (
    <div className="signup">
      <div className="title" onClick={() => window.history.back()}>
        ← 返回
      </div>
      <h3>注册</h3>
      <div className="row">
        <div>邮箱</div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="row">
        <div>密码</div>
        <input value={pwd} onChange={(e) => setPwd(e.target.value)} />
      </div>
      <div className="row">
        <div>年龄</div>
        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <div className="btn" onClick={submit}>
        提交
      </div>
      <img src="/decorate.png" />
      <div
        className="close"
        onClick={() => (document.getElementById('modal')!.style.display = 'none')}
      >
        x
      </div>
    </div>
  );
}
