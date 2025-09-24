import React from 'react'
import Layout from '@theme/Layout';
import clsx from 'clsx';

import data from './_data';
import styles from './styles.module.css';

const CardList = ({ items }) => (
  <div className={styles.cards}>
    {items.map(({ image, title, description, url, source, backgroundColor = 'var(--ifm-color-primary)' }) => (
      <div className={styles.card} key={title}>
        <div className={styles.image} style={{ backgroundColor }}>
          <img src={image} alt={title} title={title} />
        </div>
        <div className={styles.content}>
          <h3 className="header">{title}</h3>

          <p className="description">{description}</p>
        </div>
        <div className={clsx(styles.extra, styles.content)}>
          <a href={url}>Demo</a>
          {!!source && (
            <span className={clsx("right floated")}>
              <a href={source}>Code</a>
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);


export default function () {
  return (
    <Layout
      title='Samples'
      description='Excalibur sample games you can reference!'
    >
      <main className={styles.main}>


        <div className="ui container">
          <h2 className="ui header">Samples</h2>

          <p className="ui grey small header">
            Learn Excalibur by referencing these sample games.
          </p>

          <div className="ui section divider" />

          <CardList items={data} />

          <div className="ui hidden divider" />
        </div>
      </main>
    </Layout>
  );
}