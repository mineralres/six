import React from 'react';
import { Table } from 'antd';
import { css } from 'emotion';
import styles from './QuoteList.scss';
import { useGlobalState } from '../state/single';
import { event } from '../state/event';

const columns = [
  {
    title: '合约',
    key: 'symbol',
    width: '80px',
    render: (t, r) => {
      return <span style={{ color: 'yellow' }}>{r.InstrumentID}</span>;
    }
  },
  {
    title: '合约名',
    key: 'name',
    width: '100px',
    render: (t, r) => {
      return <span style={{ color: 'yellow' }}>{r.InstrumentName}</span>;
    }
  },
  {
    title: '最新价',
    key: 'last-price',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return <span style={{ color: 'skyblue' }}>{r.LastPrice}</span>;
    }
  },
  {
    title: '涨跌',
    key: 'up-down',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return r.LastPrice - r.PreSettlementPrice;
    }
  },
  {
    title: '买价',
    key: 'bid-price',
    width: '80px',
    align: 'right',
    dataIndex: 'BidPrice1'
  },
  {
    title: '卖价',
    key: 'ask-price',
    width: '80px',
    align: 'right',
    dataIndex: 'AskPrice1'
  },
  {
    title: '买量',
    key: 'bid-volume',
    width: '80px',
    align: 'right',
    dataIndex: 'BidVolume1'
  },
  {
    title: '卖量',
    key: 'ask-volume',
    width: '80px',
    align: 'right',
    dataIndex: 'AskVolume1'
  },
  {
    title: '成交量',
    key: 'volume',
    width: '80px',
    align: 'right',
    dataIndex: 'Volume'
  },
  {
    title: '持仓量',
    key: 'open-interest',
    width: '80px',
    align: 'right',
    dataIndex: 'OpenInterest'
  },
  {
    title: '涨停价',
    key: 'upper-limit-price',
    width: '80px',
    align: 'right',
    dataIndex: 'UpperLimitPrice'
  },
  {
    title: '跌停价',
    key: 'lower-limit-price',
    width: '80px',
    align: 'right',
    dataIndex: 'LowerLimitPrice'
  },
  {
    title: '今开盘',
    key: 'open',
    width: '80px',
    align: 'right',
    dataIndex: 'OpenPrice'
  },
  {
    title: '昨结算',
    key: 'pre-settlement-price',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return r.PreSettlementPrice.toFixed(2);
    }
  },
  {
    title: '最高价',
    key: 'high',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return r.HighestPrice.toFixed(2);
    }
  },
  {
    title: '最低价',
    key: 'low',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return r.LowestPrice.toFixed(2);
    }
  },
  {
    title: '现量',
    width: '80px',
    align: 'right',
    key: 'volume-delta'
  },
  {
    title: '涨跌幅',
    width: '80px',
    align: 'right',
    key: 'up-down-ratio',
    render: (t, r) => {
      return `${(
        ((r.LastPrice - r.PreSettlementPrice) / r.PreSettlementPrice) *
        100
      ).toFixed(2)}%`;
    }
  },
  {
    title: '昨收盘',
    key: 'pre-close',
    width: '80px',
    align: 'right',
    dataIndex: 'PreClosePrice'
  },
  {
    title: '成交额',
    key: 'turnover',
    width: '80px',
    align: 'right',
    dataIndex: 'TurnOver'
  },
  {
    title: '交易所',
    key: 'exchange',
    width: '80px',
    align: 'right',
    render: (t, r) => {
      return r.ExchangeID;
    }
  },
  {
    title: '行情更新时间',
    key: 'udpate-time',
    width: '120px',
    align: 'right',
    render: (t, r) => {
      return `${r.UpdateTime}.${r.UpdateMillisec / 100}`;
    }
  }
];

const tableCSS = css({
  backgroundColor: '#444',
  '& table': {
    borderCollapse: 'collapse'
  },
  '& table > tr > td': {
    borderBottom: '0px'
  },
  '& thead > tr > th': {
    backgroundColor: 'darkblue',
    color: 'white'
  },
  '.ant-table-tbody > tr > td': {
    borderBottom: '0px'
  },
  '.ant-table': {
    border: 'none'
  },
  '& thead > tr': {
    borderWidth: '2px',
    borderColor: 'yellow',
    borderStyle: 'solid'
  }
});

export default props => {
  const { height } = props;
  const [quoteList] = useGlobalState('quoteList');
  return (
    <div className={styles.container}>
      <Table
        className={tableCSS}
        size="small"
        scroll={{ y: 180 }}
        style={{ minHeight: height, border: 'none' }}
        columns={columns}
        dataSource={quoteList}
        rowKey={r => {
          return r.InstrumentID;
        }}
        rowClassName={(r, index) => {
          if (index % 2 === 1) {
            return `${styles.blackRow} smallRow`;
          }
          return `${styles.blackRow} smallRow`;
        }}
        pagination={false}
        onRow={record => {
          return {
            onClick: ev => {
              event.emit('quote_list:row:click', record);
            },
            onDoubleClick: e => {},
            onContextMenu: e => {},
            onMouseEnter: e => {}, // 鼠标移入行
            onMouseLeave: e => {}
          };
        }}
      />
    </div>
  );
};
