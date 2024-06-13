import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './actions/counterActions';
import { Button, Flex } from 'antd';

const Counter = () => {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  const [upWide, setUpWide] = useState(0);
  const [downWide, setDownWide] = useState(0);

  const UphandleHover = () => {
    setUpWide(300);
  };

  const UphandleLeave = () => {
    setUpWide(0);
  };

  const DownhandleHover = () => {
    setDownWide(300);
  };

  const DownhandleLeave = () => {
    setDownWide(0);
  };

  // ...

  return (
    <Flex justify="center" align="center" vertical>
      <h1>{count}</h1>
      <Flex gap="large" align="center" justify="flex-start">
        <Button
          style={{ width: `${upWide}px` }}
          type="primary"
          onClick={() => dispatch(increment())}
          onMouseEnter={UphandleHover}
          onMouseLeave={UphandleLeave}
        >
          up
        </Button>
        <Button
          style={{ width: `${downWide}px` }}
          type="dashed"
          onClick={() => dispatch(decrement())}
          onMouseEnter={DownhandleHover}
          onMouseLeave={DownhandleLeave}
        >
          down
        </Button>
      </Flex>
    </Flex>
  );
};

export default Counter;
