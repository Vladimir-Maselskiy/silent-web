import { Button, Input, Modal } from 'antd';

type TProps = {
  isModalOpen: boolean;
  handleCancel: () => void;
  addItem: () => void;
  setNewItem: (value: string) => void;
};

export const OptionsModal = ({
  isModalOpen,
  handleCancel,
  addItem,
  setNewItem,
}: TProps) => {
  return (
    <Modal
      title="Add new item"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Close
        </Button>,
        <Button key="add" type="primary" onClick={addItem}>
          Submit
        </Button>,
      ]}
    >
      <Input
        onChange={e => setNewItem(e.target.value)}
        placeholder="Enter target words"
      />
    </Modal>
  );
};
