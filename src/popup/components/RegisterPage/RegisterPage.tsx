import React, { useRef, useState, useEffect } from 'react';
import { Button, Flex, Form, Input } from 'antd';
import { FieldData } from 'rc-field-form/lib/interface';

export default function RegisterPage() {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isComfirmPasswordValid, setIsComfirmPasswordValid] = useState(false);
  const [isEmailErrorStatus, setIsEmailErrorStatus] = useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);

  const [form] = Form.useForm();

  useEffect(() => {
    if (isComfirmPasswordValid && isEmailValid && isPasswordValid) {
      setIsSubmitButtonDisabled(false);
    } else {
      setIsSubmitButtonDisabled(true);
    }
  }, [isComfirmPasswordValid, isEmailValid, isPasswordValid]);

  const onFinish = async (values: any) => {
    // try {
    //   const body = values;
    //   await axios
    //     .post(`${process.env.NEXT_PUBLIC_API_HOST}/users/addUser`, body)
    //     .then(res => {
    //       const newUser: IUser = res.data.user;
    //       setUser(newUser);
    //       localStorage.setItem('user', JSON.stringify(newUser));
    //       form.resetFields();
    //       router.push('/account/email/verify');
    //     });
    // } catch (error: any) {
    //   const message = error.response.data.error;
    //   const { status } = error.response;
    //   if (status === 422) {
    //     setIsErrorEmail(true);
    //   }
    // }
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
            setIsEmailErrorStatus(true);
          } else {
            setIsEmailValid(true);
            setIsEmailErrorStatus(false);
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
          rules={[
            () => ({
              validator(_, value) {
                if (value?.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
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
            disabled={isSubmitButtonDisabled}
          >
            Ok
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}
