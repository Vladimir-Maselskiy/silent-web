import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Input, Spin } from 'antd';
import { FieldData } from 'rc-field-form/lib/interface';
import IconGoogleLogo from '../../img/google-icon.svg';
import { domain } from '../../../assets/config/domain';
import { Loader } from '../Loader/Loader';

type TProps = {
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoginPage({ setIsAuth }: TProps) {
  const [isEmailInputPassed, setIsEmailInputPassed] = useState(false);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [isEmailInputDisabled, setIsEmailInputDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setIsLoading(true);
    const { email, password } = values;

    try {
      const response = await fetch(`${domain}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        chrome.storage.local.set({ userId: data.user._id });
        setIsAuth(true);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFieldsChange = (
    changedFields: FieldData[],
    allFields: FieldData[]
  ) => {
    const field = changedFields[0];
    if (Array.isArray(field.name) && field.name[0] === 'email') {
      field.value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
        ? setIsNextButtonDisabled(false)
        : setIsNextButtonDisabled(true);
    }
    if (Array.isArray(field.name) && field.name[0] === 'password') {
      field.value.length >= 4
        ? setIsSubmitButtonDisabled(false)
        : setIsSubmitButtonDisabled(true);
    }
  };

  const onNextButtonClick = () => {
    setIsEmailInputDisabled(true);
    setIsEmailInputPassed(true);
  };

  const onClickChangeEmailInput = (
    e: React.MouseEvent<Element, MouseEvent>
  ) => {
    e.preventDefault();
    setIsEmailInputDisabled(false);
    setIsEmailInputPassed(false);
  };

  return isLoading ? (
    <Loader />
  ) : (
    <Form
      form={form}
      name="loginForm"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      layout="vertical"
      onFieldsChange={onFieldsChange}
      autoComplete="on"
    >
      <Form.Item>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your email!',
            },
          ]}
        >
          <Input disabled={isEmailInputDisabled} />
        </Form.Item>
        {isEmailInputDisabled && (
          <a
            href=""
            onClick={onClickChangeEmailInput}
            style={{ position: 'absolute', top: '38px', right: '10px' }}
          >
            Change
          </a>
        )}
      </Form.Item>
      {!isEmailInputPassed && (
        <Form.Item>
          <Button
            type="primary"
            htmlType="button"
            style={{ width: 90 }}
            disabled={isNextButtonDisabled}
            onClick={onNextButtonClick}
          >
            Next
          </Button>
        </Form.Item>
      )}

      {isEmailInputPassed && (
        <>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: 90 }}
              disabled={isSubmitButtonDisabled}
            >
              Login
            </Button>
          </Form.Item>
        </>
      )}
    </Form>
  );
}
