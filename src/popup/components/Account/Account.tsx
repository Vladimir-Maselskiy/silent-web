import { createStyles } from 'antd-style';
import { Button, ConfigProvider, Flex, Spin, Typography } from 'antd';
import EmailIcon from '../../../assets/email.svg';
import { useEffect, useRef, useState } from 'react';
import { AuthForm } from '../AuthForm/AuthForm';
import { TAuthType } from '../../../types/types';
import { User } from '../User/User';

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
  const [isAuthFormVisible, setIsAuthFormVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [activePanel, setActivePanel] = useState<TAuthType>('signIn');
  const [nextPanel, setNextPanel] = useState<TAuthType>('signUp');
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNextPanel(activePanel === 'signUp' ? 'signIn' : 'signUp');
  }, [activePanel]);

  useEffect(() => {
    setIsLoading(true);

    getIsAuth()
      .then(() => {
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getIsAuth = async () => {
    const userId = await chrome.storage.local.get('userId');
    setIsAuth(!!userId.userId);
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
    console.log('onGoogleAuthButtonClick');
    // const CLIENT_ID =
    //   '848495744147-dcpqbmpbh7c0dfkiam9sj1ga9n7u0aad.apps.googleusercontent.com';
    // const REDIRECT_URI = chrome.identity.getRedirectURL();
    // const SCOPES = 'profile email';

    // const authUrl =
    //   `https://accounts.google.com/o/oauth2/v2/auth` +
    //   `?client_id=${CLIENT_ID}` +
    //   `&response_type=token` +
    //   `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    //   `&scope=${encodeURIComponent(SCOPES)}` +
    //   `&prompt=select_account`;

    // chrome.identity.launchWebAuthFlow(
    //   {
    //     url: authUrl,
    //     interactive: true,
    //   },
    //   function (redirectUrl) {
    //     if (chrome.runtime.lastError) {
    //       console.error('Auth error:', chrome.runtime.lastError.message);
    //       return;
    //     }

    //     const params = new URLSearchParams(
    //       new URL(redirectUrl).hash.substring(1)
    //     );
    //     const accessToken = params.get('access_token');

    //     console.log('New token (via WebAuthFlow):', accessToken);
    //   }
    // );

    chrome.identity.getAuthToken({ interactive: true }, token => {
      if (chrome.runtime.lastError || !token) {
        console.error('Authorization failed:', chrome.runtime.lastError);
        alert('Не вдалося авторизуватись. Спробуй ще раз.');
        return;
      }

      chrome.identity.removeCachedAuthToken({ token }, function () {
        chrome.identity.getAuthToken(
          { interactive: true },
          function (newToken) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: 'Bearer ' + newToken },
            })
              .then(response => response.json())
              .then(userInfo => {
                console.log('User info:', userInfo);
                alert(`Привіт, ${userInfo.name}!`);
                // Тут можна зберегти userInfo або передати в інші частини розширення
              })
              .catch(error => {
                console.error('Failed to fetch user info:', error);
                alert('Не вдалося отримати інформацію про користувача.');
              });
          }
        );
      });
    });
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
    <Spin />
  ) : isAuth ? (
    <User />
  ) : isAuthFormVisible ? (
    <AuthForm authType={activePanel} />
  ) : (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', width: '200%' }} ref={sliderRef}>
        {renderPanel(activePanel)}
        {renderPanel(nextPanel)}
      </div>
    </div>
  );
};
