import { EyeOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Flex } from 'antd';
import { createStyles, cx } from 'antd-style';
import { TPopupTab } from '../../../types/types';
import { useState } from 'react';

const useStyle = createStyles(({ prefixCls, css }) => ({
  buttonStyle: css`
    & {
      background-color: transparent;
      display: flex;
      flex-direction: column;
      color: #fff;
      border: none;
      width: 34%;
      height: 80px;
      border-radius: 0;
      border: none !important;
    }
    &::after {
      display: none !important;
    }
    &:hover:not(:disabled):not(.active) {
      text-decoration: underline;
      /* background: rgba(0, 0, 0, 0.2) !important; */
      background: #527a8c !important;
      color: #fff !important;
      border: none !important;
    }
    &.active {
      background: rgba(0, 0, 0, 0.3) !important;
      color: #fff !important;
      border: none !important;
      /* text-decoration: none !important; */
    }
  `,
}));

const onUpgadePlanButtonClick = () => {
  chrome.tabs.create({ url: 'https://sluk-next.vercel.app/' });
};

type TProps = {
  currentTab: TPopupTab;
  setCurrentTab: React.Dispatch<React.SetStateAction<TPopupTab>>;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  isActive: boolean;
  setIsAuthFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Navigation = ({
  currentTab,
  setCurrentTab,
  isAuth,
  setIsAuthFormVisible,
}: TProps) => {
  const { styles } = useStyle();

  const onTabButtonClick = (tab: TPopupTab) => {
    setCurrentTab(tab);

    if (tab === 'account') setIsAuthFormVisible(false);
  };

  return (
    <>
      <ConfigProvider
        button={{
          className: styles.buttonStyle,
        }}
        wave={{ disabled: true }}
      >
        <Flex
          justify="center"
          style={{
            backgroundColor: '#527a8c',

            marginTop: 24,
            position: 'fixed',
            bottom: 0,
            width: '100%',
          }}
        >
          <Button
            onClick={() => onTabButtonClick('home')}
            className={currentTab === 'home' ? 'active' : ''}
            icon={<HomeOutlined style={{ fontSize: '24px' }} />}
            disabled={!isAuth}
          >
            Home
          </Button>
          <Button
            onClick={() => onTabButtonClick('upgrade')}
            className={currentTab === 'upgrade' ? 'active' : ''}
            icon={<EyeOutlined style={{ fontSize: '24px' }} />}
            disabled={!isAuth}
          >
            Upgrade
          </Button>
          <Button
            onClick={() => onTabButtonClick('account')}
            className={currentTab === 'account' ? 'active' : ''}
            icon={<UserOutlined style={{ fontSize: '24px' }} />}
          >
            Account
          </Button>
        </Flex>
      </ConfigProvider>
    </>
  );
};
