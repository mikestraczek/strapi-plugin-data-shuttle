import './style.css';

import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

type EditorProps = {
  content: any;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
};
export const Editor = ({
  content,
  language = 'csv',
  readOnly = false,
  onChange,
  style,
}: EditorProps) => {
  const [codeMirrorContent, setCodeMirrorContent] = useState('');

  useEffect(() => {
    if (typeof content === 'object') {
      setCodeMirrorContent(content.data);
    } else {
      setCodeMirrorContent(content);
    }
  }, [content, language]);

  return (
    <>
      <CodeMirror
        className="plugin-ie-editor"
        extensions={[javascript({ jsx: true })]}
        readOnly={false}
        style={style}
        height="40vh"
        theme="dark"
        value={codeMirrorContent}
        onChange={onChange}
        editable={!readOnly}
      />
    </>
  );
};
