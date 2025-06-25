import { createStyles } from 'antd-style';
import { Button, ConfigProvider, Flex, Typography } from 'antd';
import EmailIcon from '../../../assets/email.svg';
import { useEffect, useRef, useState } from 'react';
import { AuthForm } from '../AuthForm/AuthForm';
import { TAuthType } from '../../../types/types';
import { User } from '../User/User';
import { domain } from '../../../assets/config/domain';
import { Loader } from '../Loader/Loader';

type TProps = {
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthFormVisible: boolean;
  setIsAuthFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

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

export const Account = ({
  isAuth,
  setIsAuth,
  isAuthFormVisible,
  setIsAuthFormVisible,
}: TProps) => {
  const { styles } = useStyle();
  const [animating, setAnimating] = useState(false);
  const [activePanel, setActivePanel] = useState<TAuthType>('signIn');
  const [nextPanel, setNextPanel] = useState<TAuthType>('signUp');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNextPanel(activePanel === 'signUp' ? 'signIn' : 'signUp');
  }, [activePanel]);

  useEffect(() => {
    if (!isAuth) {
      setIsLoading(false);
      return;
    }
    setCurrentUserEmail()
      .then(() => {
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuth]);

  const setCurrentUserEmail = async () => {
    chrome.storage.local.get(['email'], ({ email }) => {
      setUserEmail(email);
    });
  };

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

  const onEmailButtonClick = (type: 'signUp' | 'signIn') => {
    setIsAuthFormVisible(true);
  };

  const onGoogleAuthButtonClick = () => {
    const CLIENT_ID =
      '848495744147-54r8u6ovii2187l8srst0qtoevd88eod.apps.googleusercontent.com';
    const REDIRECT_URI = chrome.identity.getRedirectURL();
    const SCOPES = 'profile email';

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES)}` +
      `&prompt=select_account`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError.message);
          return;
        }

        const params = new URLSearchParams(
          new URL(redirectUrl).hash.substring(1)
        );
        const accessToken = params.get('access_token');

        if (!accessToken) {
          console.error('Access token not found in redirect URL');
          return;
        }

        setIsLoading(true);
        fetch(`${domain}/api/users/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              chrome.storage.local.set({
                userId: data.user._id,
                email: data.user.email,
              });
              setIsAuth(true);
            } else {
              alert(data.error || 'Login failed');
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    );
  };

  const renderPanel = (type: 'signUp' | 'signIn') => (
    <Flex
      justify="center"
      align="center"
      vertical
      gap={16}
      style={{ padding: 20, height: 372, width: '50%' }}
    >
      <Typography.Title level={3}>
        {type === 'signUp' ? 'Sign up' : 'Sign in'}
      </Typography.Title>
      <ConfigProvider
        button={{
          className: styles.buttonStyle,
        }}
      >
        <Button
          icon={<img src="/google-logo.png" style={{ width: 20 }} />}
          onClick={onGoogleAuthButtonClick}
        >
          Continue with Google
        </Button>
        <Button icon={<EmailIcon />} onClick={() => onEmailButtonClick(type)}>
          {type === 'signUp' ? 'Continue with Email' : 'Sign in with Email'}
        </Button>
      </ConfigProvider>
      <Typography.Text>
        {type === 'signIn'
          ? "Don't have an account?"
          : 'Already have an account?'}
        <Button type="link" onClick={handleSwitch}>
          {type === 'signIn' ? 'Sign up' : 'Sign in'}
        </Button>
      </Typography.Text>
    </Flex>
  );
  return isLoading ? (
    <Loader />
  ) : isAuth ? (
    <User email={userEmail} setIsAuth={setIsAuth} />
  ) : isAuthFormVisible ? (
    <AuthForm authType={activePanel} setIsAuth={setIsAuth} />
  ) : (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', width: '200%' }} ref={sliderRef}>
        {renderPanel(activePanel)}
        {renderPanel(nextPanel)}
      </div>
    </div>
  );
};
