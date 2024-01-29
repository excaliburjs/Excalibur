import React from 'react'
import Layout from '@theme/Layout';
import clsx from 'clsx';

import data from './_data';
import styles from './styles.module.css';

const CardList = ({ items }) => (
  <div className={styles.cards}>
    {items.map(({ image, title, description, url, source }) => (
      <div className={styles.card} key={title}>
        <div className={styles.image}>
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
      title='Showcase'
    >
      <main className={styles.main}>


        <div className="ui container">
          <h2 className="ui header">Showcase</h2>

          <p className={styles.small}>
            These games were made using Excalibur by the community and maintainers, how cool is that? 🎉
          </p>

          <p>
            <a
              href="https://github.com/excaliburjs/Excalibur/blob/main/site/src/pages/showcase/_data.ts"
              className={styles.green}
            >
              <i className="fork icon" /> Submit a pull request to add your game
              here!
            </a>
          </p>

          <div className="ui section divider" />

          <CardList items={data} />

          <div className="ui hidden divider" />
        </div>
      </main>
    </Layout>
  );
}