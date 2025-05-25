import { createStyles } from 'antd-style';
import { Button, ConfigProvider, Flex, Typography } from 'antd';
import EmailIcon from '../../../assets/email.svg';
import { useEffect, useRef, useState } from 'react';

const useStyle = createStyles(({ prefixCls, css }) => ({
  buttonStyle: css`
    & {
      background-color: transparent;
      border-radius: 25px;
      width: 280px;
      height: 48px;
      font-size: 16px;
    }
    &:hover {
      text-decoration: underline;
      background: rgba(0, 0, 0, 0.05) !important;
    }
  `,
}));

export const Account = () => {
  const { styles } = useStyle();
  const [isSignUp, setIsSignUp] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [activePanel, setActivePanel] = useState<'signUp' | 'signIn'>('signUp');
  const [nextPanel, setNextPanel] = useState<'signUp' | 'signIn'>('signIn');

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNextPanel(activePanel === 'signUp' ? 'signIn' : 'signUp');
  }, [activePanel]);

  const handleSwitch = () => {
    if (animating) return;

    setAnimating(true);

    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.5s ease';
      sliderRef.current.style.transform = 'translateX(-50%)';
    }
    setTimeout(handleTransitionEnd, 450);
  };

  const handleTransitionEnd = () => {
    setActivePanel(nextPanel);
    setAnimating(false);

    // миттєво скидаємо слайдер
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none';
      sliderRef.current.style.transform = 'translateX(0)';
    }
  };

  const renderPanel = (type: 'signUp' | 'signIn') => (
    <Flex
      justify="center"
      align="center"
      vertical
      gap={16}
      style={{ padding: 20, height: 372, width: '50%' }}
    >
      <ConfigProvider
        button={{
          className: styles.buttonStyle,
        }}
      >
        <Button icon={<img src="/google-logo.png" style={{ width: 20 }} />}>
          Continue with Google
        </Button>
        <Button icon={<EmailIcon />}>
          {type === 'signUp' ? 'Continue with Email' : 'Sign in with Email'}
        </Button>
      </ConfigProvider>
      <Typography.Text>
        {type === 'signUp'
          ? "Don't have an account?"
          : 'Already have an account?'}{' '}
        <Button type="link" onClick={handleSwitch}>
          {type === 'signUp' ? 'Sign up' : 'Sign in'}
        </Button>
      </Typography.Text>
    </Flex>
  );
  return (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', width: '200%' }} ref={sliderRef}>
        {renderPanel(activePanel)}
        {renderPanel(nextPanel)}
      </div>
    </div>
  );
};
