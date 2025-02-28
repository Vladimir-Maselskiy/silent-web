import { Button, Modal } from 'antd';

type TProps = {
  isModalOpen: boolean;
  handleCancel: () => void;
};

export const ConfirmModal = ({ isModalOpen, handleCancel }: TProps) => {
  return (
    <Modal
      title="Record already exists"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    ></Modal>
  );
};
