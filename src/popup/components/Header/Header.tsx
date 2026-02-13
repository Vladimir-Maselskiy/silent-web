import { Flex } from 'antd';
import { Logo } from '../Logo/Logo';
import { SettingOutlined } from '@ant-design/icons';

export const Header = () => {
  return (
    <Flex justify="space-between" style={{ padding: '20px 20px 0' }}>
      <Logo />
      <SettingOutlined
        style={{ fontSize: '24px' }}
        onClick={() => chrome.runtime.openOptionsPage()}
      />
    </Flex>
  );
};
