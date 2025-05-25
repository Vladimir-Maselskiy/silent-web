import { EyeOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { TPopupTab } from '../../../types/types';

const useStyle = createStyles(({ prefixCls, css }) => ({
  buttonStyle: css`
    & {
      background-color: transparent;
      display: flex;
      flex-direction: column;
      color: #fff;
      border: none;
      width: 33%;
      height: 80px;
    }
    &:hover {
      text-decoration: underline;
      background: rgba(0, 0, 0, 0.3) !important;
      border-radius: 0;
      color: #fff !important;
    }
  `,
}));

const onUpgadePlanButtonClick = () => {
  chrome.tabs.create({ url: 'https://sluk-next.vercel.app/' });
};

type TProps = {
  setCurrentTab: React.Dispatch<React.SetStateAction<TPopupTab>>;
};

export const Navigation = ({ setCurrentTab }: TProps) => {
  const { styles } = useStyle();

  const onTabButtonClick = (tab: TPopupTab) => {
    setCurrentTab(tab);
  };

  return (
    <>
      <ConfigProvider
        button={{
          className: styles.buttonStyle,
        }}
      >
        <Flex
          justify="center"
          style={{
            backgroundColor: '#637680',
            marginTop: 24,
            position: 'fixed',
            bottom: 0,
            width: '100%',
          }}
        >
          <Button
            onClick={() => onTabButtonClick('home')}
            style={{}}
            icon={<HomeOutlined style={{ fontSize: '24px' }} />}
          >
            Home
          </Button>
          <Button
            onClick={() => onTabButtonClick('upgrade')}
            style={{}}
            icon={<EyeOutlined style={{ fontSize: '24px' }} />}
          >
            Upgrade
          </Button>
          <Button
            onClick={() => onTabButtonClick('account')}
            style={{}}
            icon={<UserOutlined style={{ fontSize: '24px' }} />}
          >
            Account
          </Button>
        </Flex>
      </ConfigProvider>
    </>
  );
};
