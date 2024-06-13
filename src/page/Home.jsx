import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { Steps } from 'antd';
import Counter from '../Counter';

const description = 'This is a description';
const names = ['Edward King', 'John Doe', 'Jane Smith', 'Emma Johnson', 'Michael Brown'];
const ages = [32, 45, 27, 38, 50];
const addresses = [
  'London, Park Lane no.',
  'New York, Broadway no.',
  'Paris, Champs-Élysées no.',
  'Berlin, Unter den Linden no.',
  'Rome, Via del Corso no.',
];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: names.forEach((name) => ({
      text: name,
      value: name,
    })),
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value, record) => record.startsWith(value),
    width: '30%',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    filters: ages.map((age) => ({
      text: age,
      value: age,
    })),
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: addresses.map((address) => ({
      text: address,
      value: address,
    })),
    filterMode: 'multiple',
    filterSearch: true,
  },
];

const number = 10022;

const data = [];
for (let i = 0; i < number; i++) {
  data.push({
    key: i,
    name: `${names[i % names.length]} ${i}`,
    age: ages[i % ages.length],
    address: `${addresses[i % addresses.length]} ${i}`,
  });
}
const App = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;
  return (
    <div>
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={start} disabled={!hasSelected} loading={loading}>
          Reload
        </Button>
        <span
          style={{
            marginLeft: 8,
          }}
        >
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span>
      </div>
      <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
      <Steps
        current={2}
        status="error"
        items={[
          {
            title: 'Finished',
            description,
          },
          {
            title: 'In Process',
            description,
          },
          {
            title: 'Waiting',
            description,
          },
        ]}
      />
      <Counter />
    </div>
  );
};
export default App;
