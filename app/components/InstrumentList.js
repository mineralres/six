import React from 'react';
import { Table } from 'antd';
import styles from './InstrumentList.scss';
import { useGlobalState } from '../state/single';

const columns = [
  {
    title: '合约',
    dataIndex: 'InstrumentID',
    key: 'symbol'
  },
  {
    title: '合约名',
    key: 'name',
    dataIndex: 'InstrumentName'
  },
  {
    title: '品种',
    key: 'product-id',
    dataIndex: 'ProductID'
  },
  {
    title: '交易所',
    key: 'exchange',
    dataIndex: 'ExchangeID'
  },
  {
    title: '合约乘数',
    key: 'multiple',
    dataIndex: 'VolumeMultiple'
  },
  {
    title: '最小价格变动点',
    key: 'price-tick',
    dataIndex: 'PriceTick'
  }
];

export default () => {
  const [instrumentList] = useGlobalState('instrumentList');
  return (
    <div className={styles.container}>
      <Table
        className={styles.table}
        size="small"
        rowKey={r => r.InstrumentID}
        columns={columns}
        dataSource={instrumentList}
        locale={{ emptyText: '' }}
        pagination={{ pageSize: 15 }}
        scroll={{ y: 800 }}
      />
    </div>
  );
};
