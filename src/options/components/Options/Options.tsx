import { useEffect, useState } from 'react';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Flex,
  Layout,
  List,
  Menu,
  Popover,
  Spin,
  Switch,
  Typography,
} from 'antd';
import { Logo } from '../../../popup/components/Logo/Logo';
import { webResourceItems } from './menuItems';
import { SelectInfo } from 'rc-menu/lib/interface';
import { OptionsModal } from '../Modal/Modal';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { ExludedDomains } from '../ExludedDomains/ExludedDomains';

const { Content, Footer, Sider } = Layout;

function getWebResourceByKey(key: string) {
  const currentItem = webResourceItems.find(item => item.key === key);
  return currentItem?.label;
}

export const Options = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [targets, setTargets] = useState<any[]>([]);
  const [webResourceKey, setWebResourceKey] = useState('1');
  const [webResourceLabel, setWebResourceLabel] = useState(
    getWebResourceByKey(webResourceKey)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [exludeDomainsSetting, setExludeDomainsSetting] = useState(false);

  useEffect(() => {
    onSelectOption({ key: '1' });
  }, []);

  useEffect(() => {
    onSelectOption({ key: webResourceKey });
    setWebResourceLabel(getWebResourceByKey(webResourceKey));
  }, [webResourceKey]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleCancelConfirmModal = () => setIsConfirmModalOpen(false);

  const addItem = async ({
    target,
    checkedList,
  }: {
    target: string;
    checkedList: string[];
  }) => {
    const ignoreCase = checkedList.includes('Ignore case');
    const removeBlock = checkedList.includes('Block');
    const result = await chrome.runtime.sendMessage({
      type: 'ADD_ITEM',
      data: { target, ignoreCase, removeBlock, webResourceKey },
    });

    if (result.success === true) {
      setTargets(result.data);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const deleteTarget = async (targetId: string) => {
    const result = await chrome.runtime.sendMessage({
      type: 'DELETE_TARGET_ITEM',
      data: { id: targetId, webResourceKey },
    });

    if (result.success === true) {
      setTargets(result.data);
    }
  };

  const onSelectOption = async (e: SelectInfo | { key: string }) => {
    if (e.key === '7') {
      setExludeDomainsSetting(true);
      setWebResourceKey(e.key);
      return;
    }
    setExludeDomainsSetting(false);
    setWebResourceKey(e.key);
    setIsLoading(true);
    const getTargetsByKey = await chrome.runtime.sendMessage({
      type: 'GET_TARGETS_BY_KEY',
      data: e.key,
    });

    console.log(getTargetsByKey);
    setTargets(getTargetsByKey);
    setIsLoading(false);
  };

  const onCheckboxChangeTarget = (target: {
    field: 'removeBlock' | 'ignoreCase';
    id: string;
  }) => {
    setTargets(prevTargets =>
      prevTargets.map(t =>
        t.id === target.id ? { ...t, [target.field]: !t[target.field] } : t
      )
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={300} style={{ width: 500 }}>
        <Logo style={{ padding: 20 }} />
        <Menu
          style={{ borderTop: '1px solid #ccc', padding: 20 }}
          theme="light"
          defaultSelectedKeys={['1']}
          selectedKeys={[webResourceKey]}
          mode="inline"
          items={webResourceItems}
          onSelect={onSelectOption}
        />
      </Sider>
      <Layout style={{ height: 'calc(100vh-60px)' }}>
        <Content
          style={{
            height: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #ccc',
          }}
        >
          <Flex vertical style={{ flexGrow: 1 }}>
            <Breadcrumb
              style={{ padding: '16px', borderBottom: '1px solid #ccc' }}
            >
              <Breadcrumb.Item>WebResource</Breadcrumb.Item>
              <Breadcrumb.Item>{webResourceLabel}</Breadcrumb.Item>
            </Breadcrumb>
            <div
              style={{
                padding: 24,
                overflowY: 'auto',
                flexGrow: 1,
              }}
            >
              {isLoading ? (
                <Flex
                  justify="center"
                  align="center"
                  style={{ height: '100%' }}
                >
                  <Spin indicator={<LoadingOutlined spin />} size="large" />
                </Flex>
              ) : !exludeDomainsSetting ? (
                <>
                  <List
                    bordered
                    dataSource={targets}
                    style={{
                      overflowY: 'scroll',
                      maxHeight: 'calc(100vh - 245px)',
                    }}
                    renderItem={(target, index) => (
                      <List.Item key={target.id}>
                        <Flex gap={8} style={{ width: '40%' }}>
                          <Typography.Text>Target: </Typography.Text>
                          <Typography.Text>{target.target}</Typography.Text>
                        </Flex>
                        <Flex style={{ width: '25%' }} gap={8}>
                          <Switch checked={target.ignoreCase} disabled />
                          <Typography.Text>Ignore case</Typography.Text>
                        </Flex>
                        <Flex style={{ width: '25%' }} gap={8}>
                          <Switch checked={target.removeBlock} disabled />
                          <Typography.Text>Block</Typography.Text>
                        </Flex>
                        <Flex style={{ width: '10%' }} gap={8}>
                          <Popover
                            title="Delete"
                            trigger="click"
                            content={
                              <Button
                                type="primary"
                                onClick={() => deleteTarget(target.id)}
                              >
                                Ok
                              </Button>
                            }
                          >
                            <DeleteOutlined />
                          </Popover>
                        </Flex>
                      </List.Item>
                    )}
                  />

                  <Flex justify="end" style={{ marginTop: '20px' }}>
                    <Button type="primary" onClick={showModal}>
                      Add Content
                    </Button>
                  </Flex>
                </>
              ) : (
                <ExludedDomains />
              )}
            </div>
          </Flex>
          <Footer style={{ textAlign: 'center', borderTop: '1px solid #ccc' }}>
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
        </Content>
      </Layout>
      <OptionsModal
        addItem={addItem}
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
      />
      <ConfirmModal
        isModalOpen={isConfirmModalOpen}
        handleCancel={handleCancelConfirmModal}
      />
    </Layout>
  );
};
