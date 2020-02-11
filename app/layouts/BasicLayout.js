import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';
import styles from './BasicLayout.module.scss';
import { useWindowSize } from '../components/Util';

export default props => {
  const { children } = props;
  const [width, height] = useWindowSize();
  useEffect(() => {
    return () => {};
  });
  return (
    <Layout>
      <Layout.Header
        style={{ height: 1, background: '#fff' }}
        className={styles.header}
      ></Layout.Header>
      <Layout.Content
        className={styles.content}
        style={{
          minHeight: height - 81,
          width: '100%',
          padding: '0 0px',
          marginTop: 0
        }}
      >
        {children}
      </Layout.Content>
      <Layout.Footer className={styles.footer}>
        <p>上海成玥科技有限公司提供技术支持</p>
      </Layout.Footer>
    </Layout>
  );
};
