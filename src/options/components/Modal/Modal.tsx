import { useState } from 'react';
import { Button, Checkbox, Divider, Input, Modal } from 'antd';
import type { CheckboxProps } from 'antd';

const CheckboxGroup = Checkbox.Group;
const plainOptions = ['Ignore case', 'Search block'];
const defaultCheckedList = ['Ignore case', 'Search block'];

type TProps = {
  isModalOpen: boolean;
  handleCancel: () => void;
  addItem: ({
    target,
    checkedList,
  }: {
    target: string;
    checkedList: string[];
  }) => void;
};

export const OptionsModal = ({
  isModalOpen,
  handleCancel,
  addItem,
}: TProps) => {
  const [target, setTarget] = useState('');
  const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);

  const checkAll = plainOptions.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < plainOptions.length;

  const onCheckAllChange: CheckboxProps['onChange'] = e => {
    setCheckedList(e.target.checked ? plainOptions : []);
  };

  const onChange = (list: string[]) => {
    console.log(list);
    setCheckedList(list);
  };

  return (
    <Modal
      title="Add new item"
      destroyOnClose={true}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Close
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={() => addItem({ target, checkedList })}
        >
          Submit
        </Button>,
      ]}
    >
      <Input
        onChange={e => setTarget(e.target.value)}
        placeholder="Enter target word or phrase"
      />
      <Divider />
      <>
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
        >
          Check all
        </Checkbox>
        <Divider />
        <CheckboxGroup
          options={plainOptions}
          value={checkedList}
          onChange={onChange}
        />
      </>
    </Modal>
  );
};
