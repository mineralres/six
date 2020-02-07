import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Progress,
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  Select
} from 'antd';
import styles from './Login.scss';
import { useGlobalState, setLoginParameter } from '../../state/single';
import routes from '../../constants/routes.json';

const fs = require('fs');

const { Option } = Select;

const rawdata = fs.readFileSync('broker-config.json');
const brokerConfig = JSON.parse(rawdata);

const key = 'default-login-state-3';

const load = () => {
  const ret = localStorage.getItem(key);
  if (!ret) {
    return {
      defaultFrontIndex: 0,
      userId: '',
      password: '',
      saveUserId: false
    };
  }
  return JSON.parse(ret);
};

const save = i => {
  console.log('save', i);
  localStorage.setItem(key, JSON.stringify(i));
};

export default () => {
  // eslint-disable-next-line react/prop-types
  const [loading, setLoading] = useGlobalState('loading');
  const [traderApi] = useGlobalState('traderApi');
  const [mdApi] = useGlobalState('mdApi');
  const [lastStatusMsg] = useGlobalState('lastStatusMsg');
  const [loginProgressPercent] = useGlobalState('loginProgressPercent');
  const preState = load();
  if (
    !brokerConfig ||
    !brokerConfig.Fronts ||
    brokerConfig.Fronts.length === 0
  ) {
    return (
      <div className={styles.container}>
        <h1>brokerConfig.json配置文件错误</h1>
      </div>
    );
  }
  const [front, setFront] = useState(
    brokerConfig.Fronts[preState.defaultFrontIndex]
  );
  const startLogin = () => {
    setLoading(true);
    console.log('Front', front);
    if (!preState.saveUserId) {
      preState.userId = '';
    }
    save(preState);
    setLoginParameter(
      brokerConfig.BrokerID,
      preState.userId,
      preState.password
    );
    front.MarketData.map(e => {
      if (e.length > 0) {
        // mdApi.RegisterFront('tcp://180.168.146.187:10131');
        mdApi.RegisterFront(e);
        console.log('RegisterFront', e);
      }
      return true;
    });
    mdApi.Init();
    front.Trading.map(e => {
      if (e.length > 0) {
        traderApi.RegisterFront(e);
      }
      return true;
    });
    // traderApi.RegisterFront('tcp://180.168.146.187:10101');
    // traderApi.RegisterFront('tcp://180.168.146.187:10130');
    traderApi.SubscribePrivateTopic(2);
    traderApi.SubscribePublicTopic(0);
    traderApi.Init();
  };

  return (
    <div className={styles.container}>
      <Form
        onSubmit={() => {
          console.log('submit');
        }}
        className={styles.login}
      >
        <Form.Item>
          <Select
            defaultValue={`${preState.defaultFrontIndex}`}
            className={styles.select}
            onChange={(v, op) => {
              console.log('选择服务器', v, op);
              setFront(brokerConfig.Fronts[v]);
              save({ ...preState, defaultFrontIndex: Number(v) });
            }}
          >
            {brokerConfig.Fronts.map((e, index) => (
              <Option key={`${index + 1}`} value={`${index}`}>
                {`${brokerConfig.Name} - ${e.Name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            defaultValue={preState.userId}
            placeholder="账号"
            onChange={e => {
              preState.userId = e.target.value;
              save(preState);
            }}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="密码"
            onChange={e => {
              preState.password = e.target.value;
            }}
            onPressEnter={startLogin}
          />
        </Form.Item>
        <Form.Item>
          <Row>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Checkbox
                defaultChecked={preState.saveUserId}
                onChange={e => {
                  preState.saveUserId = e.target.checked;
                  save(preState);
                }}
              >
                保存账号
              </Checkbox>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                loading={loading}
                type="primary"
                className={styles.loginButton}
                onClick={startLogin}
              >
                登陆
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Link to={routes.SPEED_TEST}>服务器测速</Link>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <span>{lastStatusMsg}</span>
            </Col>
          </Row>
          <Row>
            <Col span={8} style={{ textAlign: 'left' }}>
              <span>登陆进度</span>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              <Progress percent={loginProgressPercent} showInfo={false} />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};
