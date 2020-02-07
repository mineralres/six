import React, { useEffect, useState } from 'react';
import {
  Popover,
  Button,
  Form,
  Input,
  RadioGroup,
  Icon,
  Radio,
  InputNumber,
  Divider,
  Select,
  message,
  Row,
  Col
} from 'antd';
import styles from './InputOrder.scss';
import { event } from '../state/event';
import { ReqOrderInsert } from '../state/single';

const { Option } = Select;

export default () => {
  const [symbol, setSymbol] = useState('');
  const [offset, setOffset] = useState(0);
  const [price, setPrice] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [traderApi] = useGlobalState('traderApi');
  const lis = r => {
    console.log('some_event 事件触发', r);
    setSymbol(r.InstrumentID);
    setPrice(r.LastPrice);
  };
  const onCtpEvent = (t, d, errorID, errMsg, requestID, isLast) => {
    switch (t) {
      case 'OnRspOrderInsert':
        message.error(errMsg);
        break;
      case 'OnRspOrderAction':
        message.error(errMsg);
        break;
      default:
        console.log('Ctp Event', t, d, errorID, errMsg, requestID, isLast);
    }
  };
  useEffect(() => {
    event.on('quote_list:row:click', lis);
    event.on('ctp-event', onCtpEvent);
    return () => {
      event.removeListener('quote_list:row:click', lis);
      event.removeListener('ctp-event', onCtpEvent);
    };
  });
  const input = direction => {
    if (!symbol || symbol === '') {
      message.error('合约代码不能为空');
      return;
    }
    ReqOrderInsert('SHFE', symbol, direction, offset, price, volume);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };
  const vButton = v => {
    return (
      <Button
        size="small"
        style={{ width: 40 }}
        onClick={() => {
          setVolume(v);
        }}
      >
        {v}
      </Button>
    );
  };
  return (
    <div className={styles.container}>
      <Form
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20, offset: 1 }}
        onSubmit={() => {
          console.log('submit');
        }}
        className={styles.input}
        colon={false}
        style={{ minWidth: 300, maxWidth: 300, marginTop: 5 }}
      >
        <Form.Item label="合约" className={styles.item}>
          <Select
            showSearch
            value={symbol}
            placeholder="合约代码"
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            notFoundContent={null}
            style={{ width: '70%' }}
          >
            {}
          </Select>
        </Form.Item>
        <Form.Item label="开平" className={styles.item}>
          <Radio.Group
            onChange={e => {
              setOffset(e.target.value);
            }}
            value={offset}
            style={{ marginLeft: 0 }}
          >
            <Radio value={0}>开仓</Radio>
            <Radio value={1}>平仓</Radio>
            <Radio value={3}>平今</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="价格" className={styles.item}>
          <InputNumber
            value={price}
            onChange={value => {
              setPrice(value);
            }}
          />
        </Form.Item>
        <Form.Item label="数量" className={styles.item}>
          <Popover
            content={
              <div style={{ lineHeight: '20px', margin: '5px 1px' }}>
                <div>
                  {vButton(1)}
                  {vButton(2)}
                  {vButton(5)}
                  {vButton(10)}
                  {vButton(15)}
                </div>
                <div>
                  {vButton(20)}
                  {vButton(30)}
                  {vButton(40)}
                  {vButton(50)}
                  {vButton(100)}
                </div>
              </div>
            }
            title="选择数量"
            trigger="hover"
          >
            <InputNumber
              defaultValue={1}
              min={1}
              value={volume}
              onChange={value => {
                setVolume(value);
              }}
            />
          </Popover>
        </Form.Item>
        <Form.Item
          label={<span style={{}}>多空</span>}
          className={styles.item}
          style={{ marginTop: 5 }}
        >
          <div className={styles.buttonBox}>
            <Button
              loading={loading}
              type="primary"
              icon="up"
              ghost
              className={`${styles.longButton} ${styles.orderButton}`}
              onClick={() => {
                input(0);
              }}
            >
              多
            </Button>
            <Button
              loading={loading}
              type="primary"
              icon="down"
              ghost
              className={`${styles.shortButton} ${styles.orderButton}`}
              onClick={() => {
                input(1);
              }}
            >
              空
            </Button>
          </div>
        </Form.Item>
      </Form>
      <Divider />
    </div>
  );
};
