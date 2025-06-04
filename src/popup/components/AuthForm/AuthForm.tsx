import { Flex } from 'antd';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import { TAuthType } from '../../../types/types';

type TProps = {
  authType: TAuthType;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthForm = ({ authType, setIsAuth }: TProps) => {
  return (
    <Flex align="center" justify="center" style={{ marginTop: '24px' }}>
      {authType === 'signIn' ? (
        <LoginPage setIsAuth={setIsAuth} />
      ) : (
        <RegisterPage />
      )}
    </Flex>
  );
};
