import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Input, Tag, theme } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';

export const ExludedDomains = () => {
  const { token } = theme.useToken();
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    (async function () {
      const excludedDomains = await chrome.runtime.sendMessage({
        type: 'GET_EXCLUDED_DOMAINS',
      });
      console.log('excludedDomains', excludedDomains);

      setTags(excludedDomains);
    })();
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({
      type: 'SET_EXCLUDED_DOMAINS',
      data: tags,
    });
  }, [tags]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    console.log(newTags);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue.toLowerCase()]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const forMap = (tag: string) => (
    <span key={tag} style={{ display: 'inline-block' }}>
      <Tag
        closable
        onClose={e => {
          e.preventDefault();
          handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    </span>
  );

  const tagChild = tags.map(forMap);

  const tagPlusStyle: React.CSSProperties = {
    background: token.colorBgContainer,
    borderStyle: 'dashed',
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <TweenOneGroup
          appear={false}
          enter={{ scale: 0.8, opacity: 0, type: 'from', duration: 100 }}
          leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
          onEnd={e => {
            if (e.type === 'appear' || e.type === 'enter') {
              (e.target as any).style = 'display: inline-block';
            }
          }}
        >
          {tagChild}
        </TweenOneGroup>
      </div>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{ width: 120 }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag onClick={showInput} style={tagPlusStyle}>
          <PlusOutlined /> Add exluded domain
        </Tag>
      )}
    </>
  );
};
