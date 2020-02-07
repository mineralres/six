import React, { useState } from 'react';
import { Table, Radio } from 'antd';
import { css } from 'emotion';
import styles from './TradeList.scss';
import { useGlobalState } from '../state/single';

const columns = [
  {
    title: '成交编号',
    width: '100px',
    dataIndex: 'TradeID',
    key: 'trade-id'
  },
  {
    title: '合约',
    width: '80px',
    key: 'instrument-id',
    dataIndex: 'InstrumentID'
  },
  {
    title: '买卖',
    key: 'direction',
    width: '40px',
    render: (t, r) => {
      if (r.Direction === '0') {
        return <span style={{ color: 'red' }}>买 </span>;
      }
      return <span style={{ color: 'green' }}> 卖</span>;
    }
  },
  {
    title: '开平',
    key: 'offset-flag',
    width: '40px',
    render: (t, r) => {
      switch (r.OffsetFlag) {
        case '0':
          return '开仓';
        case '1':
          return '平仓';
        case '2':
          return '强平';
        case '3':
          return '平今';
        case '4':
          return '平昨';
        case '5':
          return '强减';
        case '6':
          return '本地强平';
        default:
          return '开仓';
      }
    }
  },
  {
    title: '成交价格',
    key: 'trade-price',
    width: '65px',
    render: (t, r) => {
      return r.Price.toFixed(2);
    }
  },
  {
    title: '成交手数',
    key: 'volume',
    width: '65px',
    dataIndex: 'Volume'
  },
  {
    title: '成交时间',
    key: 'trade-time',
    width: '65px',
    dataIndex: 'TradeTime'
  },
  {
    title: '报单编号',
    key: 'order-sys-id',
    width: '80px',
    dataIndex: 'OrderSysID'
  },
  {
    title: '成交类型',
    key: 'trae-type',
    width: '65px',
    render: (t, r) => {
      switch (r.TradeType) {
        case '0':
          return '普通成交';
        default:
          return '普通成交';
      }
    }
  },
  {
    title: '投保',
    key: 'hedge-flag',
    width: '40px',
    render: (t, r) => {
      switch (r.CombHedgeFlag) {
        case '0':
          return '投机';
        default:
          return '套保';
      }
    }
  },
  {
    title: '交易所',
    key: 'exchange',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      if (r.ExchangeID === 'SHFE') {
        return '上期所';
      }
    }
  }
];

const tableCSS = css({
  '.ant-table': {
    border: 'none'
  },
  '& table > tr > td': {
    borderBottom: '0px'
  }
});

export default props => {
  const { height } = props;
  const [tradeList] = useGlobalState('tradeList');
  const [filterType, setFilterType] = useState(1);
  return (
    <div className={styles.container}>
      <Table
        className={tableCSS}
        locale={{ emptyText: ' ' }}
        size="small"
        columns={columns}
        dataSource={tradeList}
        rowKey={r => `${r.TradeID}`}
        pagination={false}
        scroll={{ y: height - 35, x: true }}
        style={{ minHeight: height }}
        rowClassName={(re, index) => {
          if (index % 2 === 1) {
            return `zebraHighlight smallRow`;
          }
          return `smallRow zebra`;
        }}
      />
      <Radio.Group
        onChange={e => {
          setFilterType(e.target.value);
        }}
        value={filterType}
        style={{ marginTop: 10, marginLeft: 5 }}
      >
        <Radio value={1}>成交明细</Radio>
        <Radio value={2}>成交汇总</Radio>
      </Radio.Group>
    </div>
  );
};
