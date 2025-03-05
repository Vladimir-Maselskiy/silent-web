import { Button, Divider, Flex, Typography } from 'antd';
import { Header } from '../components/Header/Header';
import { useEffect, useState } from 'react';
import {
  PauseOutlined,
  PlaySquareOutlined,
  RedditOutlined,
} from '@ant-design/icons';

const IconMap = {
  '1': <RedditOutlined style={{ fontSize: '24px' }} />,
};

export const Popup = () => {
  const [domain, setDomain] = useState('');
  const [domainId, setDomainId] = useState('6');
  const [isBlocking, setIsBlocking] = useState(undefined);
  useEffect(() => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tab = tabs[0];
        if (tab.url) {
          const url = new URL(tab.url);
          const domain = url.hostname;
          setDomain(domain);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!domain) return;
    if (domain === 'www.reddit.com') {
      setDomainId('1');
    } else {
      setDomainId('6');
    }
  }, [domain]);

  useEffect(() => {
    if (!domainId) return;
    chrome.runtime.sendMessage({ type: 'GET_IS_BLOCKING' }).then(resp => {
      if (resp) setIsBlocking(resp);
    });
  }, [domainId]);

  useEffect(() => {
    if (!domainId) return;
    chrome.runtime.sendMessage({
      type: 'SET_IS_BLOCKING',
      data: { isBlocking },
    });
  }, [isBlocking]);

  const onBlockingButtonClick = () => {
    setIsBlocking(prev => !prev);
  };

  return (
    <>
      <Header />
      <Divider />
      {domain && (
        <>
          <Flex align="center" justify="center" gap={8}>
            <Typography.Text style={{ fontSize: '24px' }}>
              {domain}
            </Typography.Text>
            {IconMap[domainId]}
          </Flex>
          <Divider />
        </>
      )}
      <Flex justify="center">
        <Button
          type="primary"
          disabled={!domainId}
          icon={isBlocking ? <PauseOutlined /> : <PlaySquareOutlined />}
          onClick={onBlockingButtonClick}
        >
          {isBlocking ? 'Stop blocking' : 'Start blocking'}
        </Button>
      </Flex>
    </>
  );
};
