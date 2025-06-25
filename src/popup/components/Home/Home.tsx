import { useEffect, useState } from 'react';
import { Button, Divider, Flex, Switch, Typography } from 'antd';
import {
  PauseOutlined,
  PlaySquareOutlined,
  RedditOutlined,
} from '@ant-design/icons';
import { AddNewTargetInput } from '../AddNewTargetInput/AddNewTargetInput';
import { TPopupTab } from '../../../types/types';

type TProps = {
  setCurrentTab: React.Dispatch<React.SetStateAction<TPopupTab>>;
};

const IconMap = {
  '2': <RedditOutlined style={{ fontSize: '24px' }} />,
};

export const Home = ({ setCurrentTab }: TProps) => {
  const [domain, setDomain] = useState('');
  const [isBlocking, setIsBlocking] = useState(undefined);
  const [domainId, setDomainId] = useState('1');

  const [isDomainInExcludedDomains, setIsDomainInExcludedDomains] =
    useState(false);
  const [styleSwitchValue, setStyleSwitchValue] = useState(null);
  const [isStyleSwitchDisabled, setIsStyleSwitchDisabled] = useState(false);

  const onBlockingButtonClick = async () => {
    const isActive = await chrome.storage.local
      .get('subscriptionData')
      .then(resp => {
        return resp?.subscriptionData?.isActive;
      });
    if (!isActive) {
      setCurrentTab('upgrade');
      return;
    }
    setIsBlocking(prev => !prev);
  };

  useEffect(() => {
    (async function () {
      const isDomainInExcludedDomains = await chrome.runtime.sendMessage({
        type: 'GET_IS_ACTIVE_TAB_DOMAIN_IN_EXCLUDED_DOMAINS',
      });
      setIsDomainInExcludedDomains(isDomainInExcludedDomains);
    })();
  }, []);

  useEffect(() => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tab = tabs[0];
        if (tab.url) {
          const url = new URL(tab.url);
          let domain = url.hostname;
          if (domain === 'ihjlpgmdimggkbogmipdgidnflocabmb')
            domain = '{{options domain}}';
          setDomain(domain);
        }
      });
      chrome.runtime.sendMessage({ type: 'GET_STYLE' }).then(resp => {
        if (resp) {
          setStyleSwitchValue(resp);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!domain) return;
    if (domain === 'www.reddit.com') {
      setDomainId('2');
    } else {
      setDomainId('1');
    }
  }, [domain]);

  useEffect(() => {
    if (!domainId) return;
    chrome.runtime.sendMessage({ type: 'GET_IS_BLOCKING' }).then(resp => {
      console.log('resp', resp);
      if (resp) setIsBlocking(resp);
    });
  }, [domainId]);

  useEffect(() => {
    if (!domainId) return;

    chrome.runtime.sendMessage({
      type: 'SET_IS_BLOCKING',
      data: { isBlocking },
    });
    isBlocking
      ? setIsStyleSwitchDisabled(false)
      : setIsStyleSwitchDisabled(true);
  }, [isBlocking]);

  const onStyleSwitchChange = async (value: boolean) => {
    const view = value ? 'on' : 'off';
    await chrome.runtime.sendMessage({ type: 'SET_STYLE', data: view });
    chrome.runtime.sendMessage({ type: 'GET_STYLE' }).then(resp => {
      if (resp) {
        setStyleSwitchValue(resp);
      }
    });
  };

  const toggleDomainInExcludedDomains = async () => {
    if (isDomainInExcludedDomains) {
      const result = await chrome.runtime.sendMessage({
        type: 'REMOVE_CURRENT_DOMAIN_FROM_EXCLUDED_DOMAINS',
      });
    } else {
      const result = await chrome.runtime.sendMessage({
        type: 'ADD_CURRENT_DOMAIN_TO_EXCLUDED_DOMAINS',
      });
    }
    const newValue = await chrome.runtime.sendMessage({
      type: 'GET_IS_ACTIVE_TAB_DOMAIN_IN_EXCLUDED_DOMAINS',
    });
    setIsDomainInExcludedDomains(newValue);
    chrome.runtime.sendMessage({ type: 'REINIT_BLOCKING' });
  };

  return (
    <>
      {domain && (
        <Flex vertical align="center">
          <Typography.Text>domain name:</Typography.Text>
          <Flex
            align="center"
            justify="center"
            gap={8}
            style={{ width: '100%' }}
          >
            <Typography.Text
              style={{
                fontSize: '24px',
                maxWidth: '80%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              {domain}
            </Typography.Text>
            {IconMap[domainId]}
          </Flex>

          <Typography.Text style={{ color: 'red', minHeight: '24px' }}>
            {isDomainInExcludedDomains ? 'is in excluded domains' : ' '}
          </Typography.Text>
          <Divider style={{ marginTop: 0 }} />
          <AddNewTargetInput />
          <Divider />
          <Button type="dashed" onClick={toggleDomainInExcludedDomains}>
            {isDomainInExcludedDomains
              ? 'Remove domain from excluded'
              : 'Add domain to excluded'}
          </Button>
          <Divider />
        </Flex>
      )}
      <Flex justify="space-around" align="center" gap={8}>
        <Button
          type="primary"
          disabled={!domainId}
          icon={isBlocking ? <PauseOutlined /> : <PlaySquareOutlined />}
          onClick={onBlockingButtonClick}
        >
          {isBlocking ? 'Stop blocking' : 'Start blocking'}
        </Button>
        {styleSwitchValue && (
          <Switch
            onChange={onStyleSwitchChange}
            checkedChildren="Blur"
            unCheckedChildren="Remove"
            checked={styleSwitchValue === 'on'}
            disabled={isStyleSwitchDisabled}
          />
        )}
      </Flex>
    </>
  );
};
