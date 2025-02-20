import { Divider } from 'antd';
import Demo from './components/ColorPicker/ColorPiker';
import { Header } from './components/Header/Header';

export const Popup = () => {
  return (
    <div>
      <Header />
      <Divider />
      <Demo />
    </div>
  );
};
