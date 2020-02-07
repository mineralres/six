import React, { useState } from 'react';
import { Table, Radio } from 'antd';
import { css } from 'emotion';
import styles from './PositionList.css';

import { useGlobalState } from '../state/single';

const columns = [
  {
    title: '合约',
    key: 'symbol',
    width: '80px',
    align: 'left',
    dataIndex: 'InstrumentID'
  },
  {
    title: '买卖',
    width: '60px',
    key: 'direction',
    render: (t, r) => {
      if (r.PosiDirection === '1') {
        return <span style={{ color: 'gray' }}>净 </span>;
      }
      if (r.PosiDirection === '2') {
        return <span style={{ color: 'red' }}>多 </span>;
      }
      return <span style={{ color: 'green' }}> 空</span>;
    }
  },
  {
    title: '总持仓',
    width: '60px',
    key: 'position',
    dataIndex: 'Position'
  },
  {
    title: '昨仓',
    width: '60px',
    key: 'yd-position',
    dataIndex: 'YdPosition'
  },
  {
    title: '今仓',
    width: '60px',
    key: 'today-position',
    dataIndex: 'TodayPosition'
  },
  {
    title: '可平量',
    width: '60px'
  },
  {
    width: '80px',
    title: '持仓均价'
  },
  {
    width: '80px',
    title: '持仓盈亏',
    render: (t, r) => {
      if (r.PositionProfit > 0) {
        return <span style={{ color: 'red' }}>{r.PositionProfit}</span>;
      }
      return <span style={{ color: 'green' }}>{r.PositionProfit}</span>;
    }
  },
  {
    width: '90px',
    title: '占用保证金'
  },
  {
    width: '40px',
    title: '投保',
    render: (t, r) => {
      switch (r.HedgeFlag) {
        case '0':
          return '投机';
        default:
          return '套保';
      }
    }
  },
  {
    width: '70px',
    align: 'right',
    title: '交易所',
    render: (t, r) => {
      switch (r.ExchangeID) {
        case 'SHFE':
          return '上期所';
        default:
          return '';
      }
    }
  }
];
const tableCSS = css({
  '.ant-table': {
    border: 'none'
  }
});

export default props => {
  const { height } = props;
  const [positionList] = useGlobalState('positionList');
  const [filterType, setFilterType] = useState(1);
  return (
    <div className={styles.container}>
      <Table
        className={tableCSS}
        locale={{ emptyText: ' ' }}
        size="small"
        columns={columns}
        dataSource={positionList}
        scroll={{ y: 220 }}
        style={{ minHeight: height }}
        rowKey={(r, index) => {
          return index;
        }}
        pagination={false}
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
        style={{ marginTop: 10 }}
      >
        <Radio value={1}>持仓</Radio>
        <Radio value={2}>明细</Radio>
        <Radio value={3}>组合</Radio>
      </Radio.Group>
    </div>
  );
};
