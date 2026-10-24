import React from 'react'
import Layout from '@theme/Layout';
import clsx from 'clsx';

import styles from './styles.module.css';

export default function () {

  return (
    <Layout
      title='API Docs'
      description='Excalibur API Reference'
    >
      <main className={styles.main}>


        <div className="ui container">
          <h2 className="ui header">Excalibur API Reference</h2>


          <p className="ui grey small header">
            API Reference
          </p>

          <div className="ui section divider" />


          <div className="ui hidden divider" />
        </div>
      </main>
    </Layout>
  );
}
