import React, { useState } from 'react';
import { Divider, Button } from 'antd';
import styles from './BalanceHeader.scss';

import { useGlobalState, ReqQryTradingAccount } from '../../state/single';

const HeaderItem = props => {
  const { value, title } = props;
  return (
    <div className={styles.item}>
      <p>{title}</p>
      <span>{value.toFixed(0)}</span>
    </div>
  );
};
export default () => {
  const [
    { PreBalance, Balance, CloseProfit, PositionProfit, CurrMargin }
  ] = useGlobalState('tradingAccountField');
  const [loading, setLoading] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <HeaderItem title="静态权益" value={PreBalance} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="平仓盈亏" value={CloseProfit} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="持仓盈亏" value={PositionProfit} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="浮动盈亏" value={PositionProfit} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="动态权益" value={Balance} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="占用保证金" value={CurrMargin} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="下单冻结" value={CurrMargin} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="冻结权利金" value={CurrMargin} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="可用资金" value={CurrMargin} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <HeaderItem title="风险度" value={CurrMargin} />
        <Divider type="vertical" style={{ height: '100%' }} />
        <Button
          style={{ height: '60%', marginTop: 12, marginLeft: 20 }}
          loading={loading}
          onClick={() => {
            setLoading(true);
            ReqQryTradingAccount();
            setTimeout(() => {
              setLoading(false);
            }, 1200);
          }}
        >
          查询
        </Button>
      </div>
    </div>
  );
};
