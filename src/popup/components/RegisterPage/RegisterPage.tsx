import React, { useRef, useState, useEffect } from 'react';
import { Button, Flex, Form, Input } from 'antd';
import { FieldData } from 'rc-field-form/lib/interface';
import { domain } from '../../../assets/config/domain';

export default function RegisterPage() {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isComfirmPasswordValid, setIsComfirmPasswordValid] = useState(false);
  const [isEmailErrorStatus, setIsEmailErrorStatus] = useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const [form] = Form.useForm();

  useEffect(() => {
    if (isComfirmPasswordValid && isEmailValid && isPasswordValid) {
      setIsSubmitButtonDisabled(false);
    } else {
      setIsSubmitButtonDisabled(true);
    }
  }, [isComfirmPasswordValid, isEmailValid, isPasswordValid]);

  const onFinish = async (values: any) => {
    const { email } = values;
    setEmail(email);
    try {
      setIsLoading(true);
      const response = await fetch(`${domain}/api/users/register`, {
        method: 'POST',
        body: JSON.stringify(values),
      }).then(res => res.json());

      if (response.status === 'awaiting_verification') {
        chrome.tabs.create({
          url: chrome.runtime.getURL(
            `verify.html?email=${encodeURIComponent(email)}`
          ),
        });
        setIsEmailErrorStatus(true);
        return;
      }
      if (response.status == '409') {
        setIsEmailErrorStatus(true);
      }
    } catch (error) {
      console.error(error);
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  const onFieldsChange = (
    changedFields: FieldData[],
    allFields: FieldData[]
  ) => {
    console.log(changedFields);
    const field = changedFields[0];

    if (!Array.isArray(changedFields)) return;

    changedFields.forEach(changedField => {
      switch (changedField.name[0]) {
        case 'email':
          if (changedField.errors.length > 0) {
            setIsEmailValid(false);
          } else {
            setIsEmailValid(true);
          }
          break;
        case 'password':
          if (changedField.errors.length > 0) {
            setIsPasswordValid(false);
          } else {
            setIsPasswordValid(true);
          }
          break;
        case 'confirmPassword':
          if (changedField.errors.length > 0) {
            setIsComfirmPasswordValid(false);
          } else {
            setIsComfirmPasswordValid(true);
          }
          break;
        default:
          if (changedField.errors.length > 0) {
            setIsSubmitButtonDisabled(true);
          }
      }
    });
  };

  return (
    <Flex justify="center" align="center" style={{ minWidth: 400 }}>
      <Flex vertical style={{ maxWidth: 200 }}>
        <p style={{ fontSize: '22px', margin: 0, textAlign: 'center' }}>
          Sign up
        </p>
        <Form
          form={form}
          name="regiterForm"
          onFinish={onFinish}
          style={{ maxWidth: 600, marginTop: 20 }}
          layout="vertical"
          onFieldsChange={onFieldsChange}
        >
          <Form.Item
            label="Email Address"
            name="email"
            validateStatus={isEmailErrorStatus ? 'error' : ''}
            help={isEmailErrorStatus ? 'Email already in use' : ''}
            rules={[
              () => ({
                validator(_, value) {
                  if (
                    value?.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please input valid email'));
                },
              }),
            ]}
            validateTrigger="onBlur"
          >
            <Input
              onFocus={() => {
                form.setFields([
                  {
                    name: 'email',
                    errors: [],
                  },
                ]);
                setIsEmailValid(true);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 4 },
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password
              onFocus={() => {
                form.setFields([
                  {
                    name: 'password',
                    errors: [],
                  },
                ]);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },

              ({ getFieldValue, getFieldError }) => ({
                validator(_, value) {
                  const passwordFielddError = getFieldError('password');
                  const passwordFieldValue = getFieldValue('password');
                  if (!passwordFieldValue) {
                    return Promise.reject('Please input your password!');
                  }
                  if (!passwordFielddError) {
                    return Promise.resolve();
                  }
                  if (!value || passwordFieldValue === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('The new password that you entered do not match!')
                  );
                },
              }),
            ]}
            validateTrigger="onChange"
          >
            <Input.Password
              onFocus={() => {
                form.setFields([
                  {
                    name: 'confirmPassword',
                    errors: [],
                  },
                ]);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: 90 }}
              disabled={isSubmitButtonDisabled || isLoading}
              loading={isLoading}
            >
              Ok
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Flex>
  );
}
