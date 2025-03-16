import {
  CheckOutlined,
  CloseOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  CheckboxProps,
  Flex,
  Input,
  Popover,
  Typography,
} from 'antd';
import { useState } from 'react';

const CheckboxGroup = Checkbox.Group;
const plainOptions = ['Ignore case', 'Search block'];
const defaultCheckedList = ['Ignore case', 'Search block'];
export const AddNewTargetInput = () => {
  const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [target, setTarget] = useState('');
  const [popoverContent, setPopoverContent] = useState(null);
  const [isAddingTargetProcess, setIsAddingTargetProcess] = useState(false);

  const onChange = (list: string[]) => {
    console.log(list);
    setCheckedList(list);
  };

  const addTarget = async ({
    target,
    checkedList,
  }: {
    target: string;
    checkedList: string[];
  }) => {
    setIsAddingTargetProcess(true);
    const ignoreCase = checkedList.includes('Ignore case');
    const removeBlock = checkedList.includes('Search block');
    const result = await chrome.runtime.sendMessage({
      type: 'ADD_TARGET',
      data: { target, ignoreCase, removeBlock },
    });

    if (result.success === true) {
      setPopoverContent(
        <>
          <CheckOutlined style={{ color: 'green' }} />
          <span> Record added. Success!</span>
        </>
      );
    } else {
      setPopoverContent(
        <>
          <CloseOutlined style={{ color: 'red' }} />
          <span> Record not added. Failed!</span>
        </>
      );
    }

    setIsPopoverOpen(true);
    setTimeout(() => {
      setIsAddingTargetProcess(false);
      setPopoverContent(null);
      setIsPopoverOpen(false);

      if (result.success === true) {
        setTarget('');
      }
    }, 1500);
  };

  return (
    <Flex vertical gap={12} align="center">
      <Typography.Text>Add target word or phrase:</Typography.Text>
      <Input
        value={target}
        onChange={e => setTarget(e.target.value)}
        placeholder="Enter word or phrase"
      />
      <Flex align="center" gap={8}>
        <CheckboxGroup
          options={plainOptions}
          value={checkedList}
          onChange={onChange}
          disabled={!target}
        />
        <Popover title="Result:" content={popoverContent} open={isPopoverOpen}>
          <Button
            type="primary"
            onClick={() => addTarget({ target, checkedList })}
            loading={isAddingTargetProcess}
            icon={<PlusCircleOutlined />}
            disabled={!target}
          >
            Add
          </Button>
        </Popover>
      </Flex>
    </Flex>
  );
};
