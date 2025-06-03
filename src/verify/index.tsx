import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Modal, Input, Form, message, Button } from 'antd';

const App = () => {
  const [helpMessage, setHelpMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleOk = async () => {
    try {
      const { code } = await form.validateFields();
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email }),
      }).then(res => res.json());
      if (res.success === true) {
        setHelpMessage('');
        setIsLoading(false);
        chrome.storage.local.set({ userId: res.userId });
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tab = tabs[0];
          if (!tab || !tab.url) return;

          const verifyPageUrl = chrome.runtime.getURL('verify.html');
          if (tab.url.startsWith(verifyPageUrl)) {
            chrome.tabs.remove(tab.id);
          }
        });
      } else {
        setHelpMessage(res.error);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      closable={false}
      title="Verify Your Email"
      onOk={handleOk}
      confirmLoading={isLoading}
      okText="Verify"
      style={{ width: '300px' }}
      width={300}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          loading={isLoading}
        >
          Verify
        </Button>,
      ]}
    >
      <p>
        We sent a verification code to your email: <strong>{email}</strong>
      </p>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Verification Code"
          name="code"
          help={helpMessage}
          rules={[
            {
              required: true,
              message: 'Please enter the code from your email',
            },
          ]}
        >
          <Input placeholder="Enter code" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
