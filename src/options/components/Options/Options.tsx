import { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Divider,
  Flex,
  Layout,
  List,
  Menu,
  Spin,
  Typography,
} from 'antd';
import { Logo } from '../../../popup/components/Logo/Logo';
import { MenuItem, webResourceItems } from './menuItems';
import { SelectInfo } from 'rc-menu/lib/interface';
import { OptionsModal } from '../Modal/Modal';

const { Content, Footer, Sider } = Layout;

function getOptionLabelByKey(key: string) {
  const currentItem = webResourceItems.find(item => item.key === key);
  return currentItem?.label;
}

export const Options = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [targets, setTargets] = useState<any[]>([]);
  const [optionKey, setOptionKey] = useState('1');
  const [optionLabel, setOptionLabel] = useState(
    getOptionLabelByKey(optionKey)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    onSelectOption({ key: '1' });
  }, []);

  useEffect(() => {
    onSelectOption({ key: optionKey });
    setOptionLabel(getOptionLabelByKey(optionKey));
  }, [optionKey]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onSelectOption = async (e: SelectInfo | { key: string }) => {
    setOptionKey(e.key);
    setIsLoading(true);
    const getTargetsByKey = await chrome.runtime.sendMessage({
      type: 'GET_TARGETS_BY_KEY',
      data: e.key,
    });

    console.log(getTargetsByKey);
    setTargets(getTargetsByKey);
    setIsLoading(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', minWidth: '100vw', padding: 20 }}>
      <Sider theme="light" width={300} style={{ width: 500, padding: 20 }}>
        <Logo />
        <Divider />
        <Menu
          theme="light"
          defaultSelectedKeys={['1']}
          selectedKeys={[optionKey]}
          mode="inline"
          items={webResourceItems}
          onSelect={onSelectOption}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>WebResource</Breadcrumb.Item>
            <Breadcrumb.Item>{optionLabel}</Breadcrumb.Item>
          </Breadcrumb>
          <Divider />
          <div
            style={{
              padding: 24,
              height: ' 100%',
            }}
          >
            {isLoading ? (
              <Flex justify="center" align="center" style={{ height: '100%' }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </Flex>
            ) : (
              <>
                <List
                  bordered
                  dataSource={targets}
                  renderItem={(target, index) => (
                    <List.Item key={target.id}>{target.value}</List.Item>
                  )}
                />
                <Flex justify="end" style={{ marginTop: '20px' }}>
                  <Button type="primary" onClick={showModal}>
                    Add Content
                  </Button>
                </Flex>
              </>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <Flex
            style={{ width: '100%' }}
            justify="center"
            gap={8}
            align="center"
          >
            <Logo />
            <Typography.Text style={{ fontSize: '20px' }}>
              ©{new Date().getFullYear()}
            </Typography.Text>
          </Flex>
        </Footer>
      </Layout>
      <OptionsModal
        addItem={() => {}}
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        setNewItem={() => {}}
      />
    </Layout>
  );
};
