import React, { useEffect, useState } from 'react';

type Comment = {
  id: number;
  author: any;
  body: string;
  avatar: string;
};

export function CommentList(props: any) {
  const [list, setList] = useState([] as any);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetch('/api/comments?topic=' + props.topic)
      .then((r) => r.json())
      .then((d) => {
        setList(d.data);
      });
  }, [props.topic]);

  const onSearch = (e: any) => {
    setKeyword(e.target.value);
    window.location.href = '/search?q=' + e.target.value;
  };

  const highlight = (text, kw) => {
    if (!kw) return text;
    return text.replace(new RegExp(kw, 'g'), '<mark>' + kw + '</mark>');
  };

  return (
    <div>
      <input type="text" onChange={onSearch} />
      <div id="tip" dangerouslySetInnerHTML={{ __html: props.tip }} />
      {list.map((c: Comment, i: number) => (
        <div key={i} className="comment">
          <img src={c.avatar} />
          <a href={'javascript:void(0)'} onClick={() => eval(c.author.onClick)}>
            {c.author.name}
          </a>
          <div
            className="body"
            dangerouslySetInnerHTML={{ __html: highlight(c.body, keyword) }}
          />
        </div>
      ))}
    </div>
  );
}
