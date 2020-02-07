import { createGlobalState } from 'react-hooks-global-state';
import addon from 'ctp-node-addon';
import { event } from './event';

const iconv = require('iconv-lite');

const { ctp } = addon;

let nRequestID = 0;
let update = null;
const g2u = gbk => {
  return iconv.decode(
    Buffer.from(
      gbk.filter(c => {
        return c > 0;
      })
    ),
    'GBK'
  );
};
let instList = [];
const getInstrumentName = instrumentID => {
  console.log('getInstrumentName ', instrumentID, instList);
  for (let i = 0; i < instList.length; i += 1) {
    if (instList[i].InstrumentID === instrumentID) {
      return instList[i].InstrumentName;
    }
  }
  return '';
};

const InstrumentParser = ctp.CThostFtdcInstrumentFieldParser();
let userId = '';
let password = '';
let brokerId = '';
let frontId = 0;
let sessionId = 0;
let orderRef = 0;
let qryPositionTimer = null;

let creq = {};
const trimErrMsg = src => {
  const uint8View = new Uint8Array(src);
  return uint8View.filter(e => {
    return e > 0;
  });
};
const traderApi = new addon.TraderApi(
  (t, d, errorID, errorMsg, requestID, isLast) => {
    let errMsg = '';
    if (errorID !== 0 && errorMsg && Buffer.from(errorMsg)[0] !== 0) {
      errMsg = iconv.decode(Buffer.from(trimErrMsg(errorMsg)), 'GBK').trim();
    }

    switch (t) {
      case 'OnFrontConnected':
        {
          nRequestID = 1;
          const req = addon.ctp.CThostFtdcReqUserLoginFieldInit();
          req.BrokerID = brokerId;
          req.UserID = userId;
          req.Password = password;
          const buff = new Uint8Array(
            addon.ctp.CThostFtdcReqUserLoginFieldParser().encode(req)
          );
          traderApi.ReqUserLogin(buff, nRequestID);
          update('positionList', []);
          update('orderList', []);
          update('lastStatusMsg', '正在登陆');
        }
        break;
      case 'OnRspUserLogin':
        {
          if (errorID !== 0) {
            console.log('登陆失败', errMsg);
            update('lastStatusMsg', errMsg);
            update('loginProgressPercent', 0);
            update('loading', false);
            break;
          }
          const rsp = ctp
            .CThostFtdcRspUserLoginFieldParser()
            .parse(Buffer.from(d));
          console.log(
            'OnRspUserLogin',
            t,
            d.byteLength,
            errorID,
            errMsg,
            requestID,
            isLast,
            rsp
          );
          update('frontId', rsp.FrontID);
          update('sessionId', rsp.SessionID);
          update('maxOrderRef', rsp.MaxOrderRef);
          update('lastStatusMsg', '投资者结算结果确认');
          update('loginProgressPercent', 10);
          frontId = rsp.FrontID;
          sessionId = rsp.SessionID;
          orderRef = Number(rsp.MaxOrderRef);
          const req = ctp.CThostFtdcSettlementInfoConfirmFieldInit();
          req.BrokerID = brokerId;
          req.InvestorID = userId;
          nRequestID += 1;
          traderApi.ReqSettlementInfoConfirm(
            new Uint8Array(
              ctp.CThostFtdcSettlementInfoConfirmFieldParser().encode(req)
            ),
            nRequestID
          );
        }
        break;
      case 'OnRtnInstrumentStatus':
        // {
        //   const status = ctp
        //     .CThostFtdcInstrumentStatusFieldParser()
        //     .parse(Buffer.from(d));
        //   console.log('OnRtnInstrumentStatus', status);
        // }
        break;
      case 'OnRspSettlementInfoConfirm':
        {
          // update('isLogin', true);
          const req = ctp.CThostFtdcQryOrderFieldInit();
          req.BrokerID = brokerId;
          req.InvestorID = userId;
          nRequestID += 1;
          console.log('结算返回', req, errMsg);
          setTimeout(() => {
            update('loginProgressPercent', 20);
            update('lastStatusMsg', '查询委托');
            traderApi.ReqQryOrder(
              new Uint8Array(ctp.CThostFtdcQryOrderFieldParser().encode(req)),
              nRequestID
            );
          }, 1000);
        }
        break;
      case 'OnRspQryOrder':
        if (d.byteLength > 0) {
          const rsp = ctp.CThostFtdcOrderFieldParser().parse(Buffer.from(d));
          console.log('OnRspQryOrder', rsp);
          rsp.StatusMsg = g2u(rsp.StatusMsg);
          update('orderList', v => [...v, rsp]);
        }
        if (isLast) {
          const req = ctp.CThostFtdcQryTradeFieldInit();
          req.BrokerID = '9999';
          nRequestID += 1;
          update('orderList', v => {
            v.sort((a, b) => {
              if (a.InsertTime > b.InsertTime) {
                return -1;
              }
              if (a.InsertTime < b.InsertTime) {
                return 1;
              }
              return 0;
            });
            return v;
          });
          setTimeout(() => {
            update('loginProgressPercent', 30);
            update('lastStatusMsg', '查询成交');
            traderApi.ReqQryTrade(
              new Uint8Array(ctp.CThostFtdcQryTradeFieldParser().encode(req)),
              nRequestID
            );
          }, 1000);
        }
        break;
      case 'OnRtnOrder':
        {
          const rtn = ctp.CThostFtdcOrderFieldParser().parse(Buffer.from(d));
          rtn.StatusMsg = g2u(rtn.StatusMsg);
          console.log('OnRtnOrder', rtn);
          update('orderList', v => {
            console.log('Update Order ');
            for (let i = 0; i < v.length; i += 1) {
              const e = v[i];
              if (
                e.FrontID === rtn.FrontID &&
                e.SessionID === rtn.SessionID &&
                e.OrderRef === rtn.OrderRef
              ) {
                v.splice(i, 1, rtn);
                // v[i] = rtn;
                console.log('Update existed order', v.length, v[i]);
                return [...v];
              }
            }
            return [rtn, ...v];
          });
        }
        break;
      case 'OnRspQryTrade':
        if (d.byteLength > 0) {
          const rsp = ctp.CThostFtdcTradeFieldParser().parse(Buffer.from(d));
          console.log('OnRspQryTrade', rsp);
          update('tradeList', v => [...v, rsp]);
        }
        if (isLast) {
          const req = ctp.CThostFtdcQryInstrumentFieldInit();
          req.BrokerID = '9999';
          nRequestID += 1;
          update('tradeList', v => {
            v.sort((a, b) => {
              if (a.TradeTime > b.TradeTime) {
                return -1;
              }
              if (a.TradeTime < b.TradeTime) {
                return 1;
              }
              return 0;
            });
            return v;
          });
          setTimeout(() => {
            update('loginProgressPercent', 40);
            update('lastStatusMsg', '查询合约');
            traderApi.ReqQryInstrument(
              new Uint8Array(
                ctp.CThostFtdcQryInstrumentFieldParser().encode(req)
              ),
              nRequestID
            );
          }, 1000);
        }
        break;
      case 'OnRtnTrade':
        {
          const rtn = ctp.CThostFtdcTradeFieldParser().parse(Buffer.from(d));
          console.log('OnRtnTrade', rtn);
          update('tradeList', v => {
            // v.splice(0, 1, rtn);
            return [rtn, ...v];
          });
          clearTimeout(qryPositionTimer);
          qryPositionTimer = setTimeout(() => {
            // 限流查询持仓
            const req = ctp.CThostFtdcQryInvestorPositionFieldInit();
            req.BrokerID = brokerId;
            nRequestID += 1;
            console.log('限流查询持仓');
            update('positionList', []);
            traderApi.ReqQryInvestorPosition(
              new Uint8Array(
                ctp.CThostFtdcQryInvestorPositionFieldParser().encode(req)
              ),
              nRequestID
            );
          }, 500);
        }
        break;
      case 'OnRspQryInstrument':
        if (d.byteLength > 0) {
          const rsp = InstrumentParser.parse(Buffer.from(d));
          rsp.InstrumentName = g2u(rsp.InstrumentName);
          update('instrumentList', v => {
            v.push(rsp);
            return v;
          });
        }
        if (isLast) {
          update('instrumentList', v => {
            v.sort((a, b) => {
              if (a.InstrumentID < b.InstrumentID) {
                return -1;
              }
              if (a.InstrumentID > b.InstrumentID) {
                return 1;
              }
              return 0;
            });
            instList = v;
            return v;
          });
          const req = ctp.CThostFtdcQryInvestorPositionFieldInit();
          req.BrokerID = brokerId;
          nRequestID += 1;
          setTimeout(() => {
            update('loginProgressPercent', 50);
            update('lastStatusMsg', '查询持仓');
            traderApi.ReqQryInvestorPosition(
              new Uint8Array(
                ctp.CThostFtdcQryInvestorPositionFieldParser().encode(req)
              ),
              nRequestID
            );
          }, 1000);
        }
        break;
      case 'OnRspQryInvestorPosition':
        console.log('OnRspQryInvestorPosition');
        if (d.byteLength > 0) {
          const rsp = ctp
            .CThostFtdcInvestorPositionFieldParser()
            .parse(Buffer.from(d));
          update('positionList', v => [...v, rsp]);
          console.log('返回持仓', rsp, isLast);
        }
        if (isLast) {
          const req = ctp.CThostFtdcQryTradingAccountFieldInit();
          req.BrokerID = '9999';
          nRequestID += 1;
          setTimeout(() => {
            update('loginProgressPercent', 60);
            update('lastStatusMsg', '查询资金');
            creq();
          }, 1000);
        }
        break;
      case 'OnRspQryTradingAccount':
        if (d.byteLength > 0) {
          console.log('OnRspQryTradingAccount', d, d.byteLength);
          const rsp = ctp
            .CThostFtdcTradingAccountFieldParser()
            .parse(Buffer.from(d));
          console.log('RspQryTradingAccount', rsp);
          update('tradingAccountField', rsp);
        }
        setTimeout(() => {
          update('lastStatusMsg', '登陆成功');
          update('loginProgressPercent', 60);
          update('isLogin', true);
          update('loading', false);
        }, 1000);
        break;
      case 'OnRspOrderInsert':
        if (d.byteLength > 0) {
          const rtn = ctp
            .CThostFtdcInputOrderFieldParser()
            .parse(Buffer.from(d));
          console.log('OnRspOrderInsert', rtn, errMsg, requestID, isLast);
          event.emit('ctp-event', t, d, errorID, errMsg, requestID, isLast);
        }
        break;
      case 'OnRspOrderAction':
        if (d.byteLength > 0) {
          const rtn = ctp
            .CThostFtdcInputOrderActionFieldParser()
            .parse(Buffer.from(d));
          console.log('OnRspOrderAction', rtn, errMsg, requestID, isLast);
          event.emit('ctp-event', t, d, errorID, errMsg, requestID, isLast);
        }
        break;
      default:
        console.log('On Message ', t, d.byteLength, errMsg);
    }
  }
);

let mdRequestID = 0;
const mdParser = ctp.CThostFtdcDepthMarketDataFieldParser();
const mdApi = new addon.MdApi((t, d) => {
  switch (t) {
    case 'OnFrontConnected':
      {
        mdRequestID += 1;
        const req = ctp.CThostFtdcReqUserLoginFieldInit();
        req.BrokerID = brokerId;
        req.UserID = userId;
        req.Password = password;
        const buff = new Uint8Array(
          ctp.CThostFtdcReqUserLoginFieldParser().encode(req)
        );
        mdApi.ReqUserLogin(buff, mdRequestID);
        console.log('行情服务器连接成功');
      }
      break;
    case 'OnRspUserLogin':
      mdApi.SubscribeMarketData([
        'rb2005',
        'rb2010',
        'ru2005',
        'cu2003',
        'CF005'
      ]);
      console.log('行情服务器登陆成功');
      break;
    case 'OnRtnDepthMarketData':
      {
        const md = mdParser.parse(Buffer.from(d));
        update('quoteList', v => {
          for (let i = 0; i < v.length; i += 1) {
            const e = v[i];
            if (e.InstrumentID === md.InstrumentID) {
              if (e.InstrumentName && e.InstrumentName.length > 0) {
                md.InstrumentName = e.InstrumentName;
              } else {
                md.InstrumentName = getInstrumentName(md.InstrumentID);
              }
              v.splice(i, 1, md);
              return [...v];
            }
          }
          md.InstrumentName = getInstrumentName(md.InstrumentID);
          return [md, ...v];
        });
      }
      break;
    default:
      console.log('On Message ', t, d.byteLength);
  }
});

const {
  GlobalStateProvider,
  useGlobalState,
  setGlobalState
} = createGlobalState({
  count: 0,
  traderApi,
  mdApi,
  isLogin: false,
  loading: false,
  userId: '',
  password: '',
  brokerId: '',
  frontId: 0,
  sessionId: 0,
  maxOrderRef: 0,
  lastStatusMsg: '未登陆',
  loginProgressPercent: 0,
  tradingAccountField: {
    PreBalance: 0,
    Balance: 0,
    Available: 0,
    CloseProfit: 0,
    Commission: 0,
    CurrMargin: 0,
    Deposit: 0,
    FrozenCommission: 0
  },
  instrumentList: [],
  quoteList: [],
  orderList: [],
  tradeList: [],
  positionList: [],
  positionDetailList: []
});

update = setGlobalState;
export const ReqQryTradingAccount = () => {
  const req = ctp.CThostFtdcQryTradingAccountFieldInit();
  req.BrokerID = '9999';
  nRequestID += 1;
  traderApi.ReqQryTradingAccount(
    new Uint8Array(ctp.CThostFtdcQryTradingAccountFieldParser().encode(req)),
    nRequestID
  );
  console.log('ReqQryTradingAccount', nRequestID, req, traderApi);
};
creq = ReqQryTradingAccount;

export const setLoginParameter = (bid, uid, pwd) => {
  brokerId = bid;
  userId = uid;
  password = pwd;
  console.log('setLoginParameter ', bid, uid, pwd);
};

export const ReqOrderInsert = (
  ExchangeID,
  InstrumentID,
  Direction,
  Offset,
  LimitPrice,
  Volume
) => {
  const req = ctp.CThostFtdcInputOrderFieldInit();
  nRequestID += 1;
  req.BrokerID = brokerId;
  req.InvestorID = userId;
  req.UserID = userId;
  req.ExchangeID = ExchangeID;
  req.InstrumentID = InstrumentID;
  req.OrderPriceType = '2';
  req.CombHedgeFlag = '1';
  req.VolumeTotalOriginal = Volume;
  req.Direction = `${Direction}`;
  req.CombOffsetFlag = `${Offset}`;
  req.LimitPrice = LimitPrice;

  req.TimeCondition = '3';
  req.VolumeCondition = '1';
  req.ContingentCondition = '1';
  req.ForceCloseReason = '0';
  req.CurrencyID = 'CNY';
  req.IPAddress = '192.168.1.105';
  req.MacAddress = '081F7121692C';
  req.RequestID = nRequestID;
  orderRef += 1;
  req.OrderRef = `${orderRef}`;

  console.log('ReqInsertOrder', req, nRequestID);
  traderApi.ReqOrderInsert(
    new Uint8Array(ctp.CThostFtdcInputOrderFieldParser().encode(req)),
    nRequestID
  );
};

export const CancelOrder = order => {
  const req = ctp.CThostFtdcInputOrderActionFieldInit();
  nRequestID += 1;
  console.log('撤单', order);
  req.InvestorID = userId;
  req.UserID = userId;
  req.FrontID = order.FrontID;
  req.SessionID = order.SessionID;
  req.OrderRef = order.OrderRef;
  req.ActionFlag = '0'; // 删除
  req.ExchangeID = order.ExchangeID;
  req.InstrumentID = order.InstrumentID;
  req.RequestID = nRequestID;
  traderApi.ReqOrderAction(
    new Uint8Array(ctp.CThostFtdcInputOrderActionFieldParser().encode(req)),
    nRequestID
  );
};

export { GlobalStateProvider, useGlobalState };
