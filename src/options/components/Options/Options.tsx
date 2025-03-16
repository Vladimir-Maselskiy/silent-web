import { useEffect, useState } from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Breadcrumb,
  Button,
  Flex,
  Layout,
  Menu,
  Popover,
  Spin,
  Table,
  Typography,
} from 'antd';
import { Logo } from '../../../popup/components/Logo/Logo';
import { webResourceItems } from './menuItems';
import { SelectInfo } from 'rc-menu/lib/interface';
import { OptionsModal } from '../Modal/Modal';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { ExludedDomains } from '../ExludedDomains/ExludedDomains';
import Card from 'antd/es/card/Card';

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

  const renderCell = (value: boolean) => (
    <Flex align="center" gap={4}>
      {value ? (
        <CheckOutlined style={{ color: 'green' }} />
      ) : (
        <CloseOutlined style={{ color: 'red' }} />
      )}
      {<Typography.Text>{value ? 'Yes' : 'No'}</Typography.Text>}
    </Flex>
  );

  const columns = [
    {
      title: 'Word/phrase',
      dataIndex: 'target',
      key: 'target',
      render: (_: any, record: any) => {
        const { target, id } = record;
        const targetWebResourseKey = parseInt(id).toString();
        const isAllDomainsTarget = targetWebResourseKey === '1';
        console.log('isAllDomainsTarget', isAllDomainsTarget);

        return isAllDomainsTarget ? (
          <Badge dot={true} status="processing">
            <Typography.Text>{target}</Typography.Text>
          </Badge>
        ) : (
          <Typography.Text>{target}</Typography.Text>
        );
      },
    },
    {
      title: 'Ignore case',
      dataIndex: 'ignoreCase',
      key: 'ignoreCase',
      render: renderCell,
    },
    {
      title: 'Search block',
      dataIndex: 'removeBlock',
      key: 'removeBlock',
      render: renderCell,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_: any, record: any) => {
        const { id } = record;
        const targetWebResourseKey = parseInt(id).toString();

        const isDisabled = targetWebResourseKey !== webResourceKey;
        return isDisabled ? (
          <DeleteOutlined style={{ color: 'lightGrey' }} />
        ) : (
          <Popover
            title="Delete"
            trigger="click"
            content={
              <Button
                disabled={isDisabled}
                type="primary"
                onClick={() => deleteTarget(id)}
              >
                Ok
              </Button>
            }
          >
            <DeleteOutlined />
          </Popover>
        );
      },
    },
  ];

  const addItem = async ({
    target,
    checkedList,
  }: {
    target: string;
    checkedList: string[];
  }) => {
    const ignoreCase = checkedList.includes('Ignore case');
    const removeBlock = checkedList.includes('Search block');
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
              items={[
                {
                  title: 'WebResource',
                },
                {
                  title: ':id',
                  href: '',
                },
              ]}
              params={{ id: webResourceLabel }}
            ></Breadcrumb>
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
                  <Table
                    dataSource={targets}
                    columns={columns}
                    pagination={{ pageSize: 7 }}
                  />
                  <Flex justify="end">
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
