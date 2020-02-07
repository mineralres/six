import React from 'react';
import { Tabs, Row, Col } from 'antd';
import styles from './Trading.css';
import { useGlobalState } from '../../state/single';
import BalanceHeadr from './BalanceHeader';
import InstrumetList from '../InstrumentList';
import QuoteList from '../QuoteList';
import OrderList from '../OrderList';
import TradeList from '../TradeList';
import PositionList from '../PositionList';
import InputOrder from '../InputOrder';
import { useWindowSize } from '../Util';

const { TabPane } = Tabs;

export default () => {
  const [width, height] = useWindowSize();
  const hx = (height - 390) / 2;

  return (
    <div className={styles.container}>
      <BalanceHeadr />
      <Tabs
        defaultActiveKey="1"
        animated={false}
        onChange={key => {
          console.log(key);
        }}
      >
        <TabPane tab="报价表" key="1">
          <div className={styles.firstRow}>
            <QuoteList height={220} />
          </div>
          <Row className={styles.secondRow}>
            <Col span={12} className={styles.leftCol}>
              <OrderList height={hx} />
            </Col>
            <Col span={12}>
              <InputOrder />
            </Col>
          </Row>
          <Row className={styles.thirdRow}>
            <Col span={12} className={styles.leftCol}>
              <PositionList height={hx} />
            </Col>
            <Col span={12}>
              <TradeList height={hx} />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="合约列表" key="2">
          <div className={styles.first}>
            <InstrumetList />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};
