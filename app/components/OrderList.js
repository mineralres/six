import React, { useState } from 'react';
import { Radio, Table, Button } from 'antd';
import { css } from 'emotion';
import styles from './OrderList.scss';
import { useGlobalState, CancelOrder } from '../state/single';

const columns = [
  {
    title: '报单编号',
    width: '88px',
    dataIndex: 'OrderSysID',
    key: 'orderSysID'
  },
  {
    title: '合约',
    width: '88px',
    key: 'instrument-id',
    dataIndex: 'InstrumentID'
  },
  {
    title: '买卖',
    key: 'direction',
    width: '60px',
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
    width: '60px',
    render: (t, r) => {
      if (r.CombOffsetFlag === '0') {
        return '开仓';
      }
      return '平仓';
    }
  },
  {
    title: '状态',
    key: 'status',
    width: '88px',
    render: (t, r) => {
      switch (r.OrderStatus) {
        case '0':
          return <span style={{ color: 'green' }}>全部成交</span>;
        case '1':
          return <span style={{ color: 'Peru' }}>部分成交</span>;
        case 'a':
          return <span style={{ color: 'Peru' }}>未知</span>;
        case '3':
          return <span style={{ color: 'Peru' }}>未成交</span>;
        case '5':
          return <span style={{ color: 'Peru' }}>已撤单</span>;
        default:
          return t;
      }
    }
  },
  {
    title: '报单价格',
    key: 'limit-price',
    width: '100px',
    render: (t, r) => {
      return r.LimitPrice.toFixed(2);
    }
  },
  {
    title: '报单手数',
    key: 'volume',
    width: '80px',
    dataIndex: 'VolumeTotalOriginal'
  },
  {
    title: '未成交',
    key: 'volume-total',
    width: '80px',
    dataIndex: 'VolumeTotal'
  },
  {
    title: '成交手数',
    key: 'volume-traded',
    width: '80px',
    dataIndex: 'VolumeTraded'
  },
  {
    title: '详细状态',
    key: 'status-msg',
    dataIndex: 'StatusMsg',
    width: '130px',
    ellipsis: true,
    render: (t, r) => {
      return r.StatusMsg;
    }
  },
  {
    title: '报单时间',
    width: '100px',
    key: 'insert-time',
    dataIndex: 'InsertTime'
  },
  {
    title: '最后成交时间',
    width: '100px',
    key: 'last-trade-time'
  },
  {
    title: '成交均价',
    width: '100px',
    key: 'trade-average-price'
  },
  {
    title: '投保',
    width: '100px',
    key: 'hedge-flag',
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
    width: '100px',
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

let currentRow = null;

export default props => {
  const { height } = props;
  const [filterType, setFilterType] = useState(1);
  const [orderList] = useGlobalState('orderList');
  const orderFilter = () => {
    return orderList.filter(e => {
      switch (filterType) {
        case 1:
          return true;
        case 2:
          if (e.OrderStatus === 'a' || e.OrderStatus === '3') {
            return true;
          }
          return false;
        case 3:
          if (e.OrderStatus === '0') {
            return true;
          }
          return false;
        case 4:
          if (e.OrderStatus === '5') {
            return true;
          }
          return false;
        default:
          return false;
      }
    });
  };

  return (
    <div className={styles.container}>
      <Table
        className={tableCSS}
        size="small"
        rowKey={r => `${r.FrontID}-${r.SessionID}-${r.OrderRef}`}
        dataSource={orderFilter()}
        columns={columns}
        pagination={false}
        rowClassName={(re, index) => {
          if (index % 2 === 1) {
            return `zebraHighlight smallRow`;
          }
          return `smallRow zebra`;
        }}
        scroll={{ y: height - 35, x: true }}
        style={{ height, border: 'none' }}
        locale={{ emptyText: ' ' }}
        onRow={record => {
          return {
            onClick: ev => {
              console.log('单击', record);
              currentRow = record;
            },
            onDoubleClick: ev => {
              // event.emit('order_list:row:click', record);
              console.log('双击', record);
              CancelOrder(record);
            },
            onContextMenu: event => {},
            onMouseEnter: event => {}, // 鼠标移入行
            onMouseLeave: event => {}
          };
        }}
      />
      <Radio.Group
        onChange={e => {
          setFilterType(e.target.value);
        }}
        value={filterType}
        style={{ marginTop: 10 }}
      >
        <Radio value={1}>全部委托</Radio>
        <Radio value={2}>未成交</Radio>
        <Radio value={3}>已成交</Radio>
        <Radio value={4}>已撤单</Radio>
      </Radio.Group>
      <Button
        className={styles.cancelButton}
        size="small"
        onClick={() => {
          if (currentRow) {
            CancelOrder(currentRow);
          }
        }}
      >
        撤单
      </Button>
      <Button
        className={styles.cancelButton}
        size="small"
        onClick={() => {
          orderList.forEach(e => {
            if (e.OrderStatus === 'a' || e.OrderStatus === '3') {
              CancelOrder(e);
            }
          });
        }}
      >
        全撤
      </Button>
    </div>
  );
};
