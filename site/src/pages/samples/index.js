import React from 'react'
import Layout from '@theme/Layout';
import clsx from 'clsx';


import styles from './styles.module.css';

import sampleExcalibird from './images/excalibird.png'
import sampleShmup from './images/shmup.png'
import sampleBreakout from './images/breakout.png'
import samplePlatformer from './images/platformer.gif'
import sampleElectron from './images/electron.png'
import sampleMatterjs from './images/matterjs.gif'
import sampleTiled from './images/tiled.gif'
import sampleGrid from './images/grid.gif'

const data = [
  {
    title: 'Grid Movement',
    image: sampleGrid,
    description: 'Example of building grid based movement.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-gird',
    source: 'https://github.com/excaliburjs/sample-grid',
  },
  {
    title: 'Tiled w/ Parcel',
    image: sampleTiled,
    description: 'This is a small level with the Tiled Plugin and Parcel bundler.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-tiled-parcel',
    source: 'https://github.com/excaliburjs/sample-tiled-parcel',
  },
  {
    title: 'Tiled w/ Vite',
    image: sampleTiled,
    description: 'This is a small level with the Tiled Plugin and Vite bundler.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-tiled-vite',
    source: 'https://github.com/excaliburjs/sample-tiled-vite',
  },
  {
    title: 'Tiled w/ Webpack',
    image: sampleTiled,
    description: 'This is a small level with the Tiled Plugin and Webpack bundler.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-tiled-webpack',
    source: 'https://github.com/excaliburjs/sample-tiled-webpack',
  },
  {
    title: 'Platformer',
    image: samplePlatformer,
    description: 'This is a small platforming example.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-platformer',
    source: 'https://github.com/excaliburjs/sample-platformer',
  },
  {
    title: 'Matter.js',
    image: sampleMatterjs,
    description: 'This is a small sample showing how to wire in a 3rd party physics instead of using Excalibur.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-matterjs',
    source: 'https://github.com/excaliburjs/sample-matterjs',
  },
  {
    title: 'Electron Template',
    image: sampleElectron,
    description: 'This is a template to show Electron integration with Excalibur. Useful for shipping games to desktops or steam!',
    url: 'https://codesandbox.io/s/github/excaliburjs/template-electron',
    source: 'https://github.com/excaliburjs/template-electron',
  },
  {
    title: 'Excalibird',
    image: sampleExcalibird,
    description:
      'This is a sample clone of the popular mobile game flappy bird.',
    url: 'https://codesandbox.io/s/github/excaliburjs/excalibird',
    source: 'https://github.com/excaliburjs/excalibird',
  },
  {
    title: "Shoot 'Em Up",
    image: sampleShmup,
    description: "This is an example of how to create a Shoot 'Em Up game",
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-shootemup',
    source: 'https://github.com/excaliburjs/sample-shootemup',
  },
  {
    title: 'Breakout',
    image: sampleBreakout,
    description: 'This is a sample brick breaking game.',
    url: 'https://codesandbox.io/s/github/excaliburjs/sample-breakout',
    source: 'https://github.com/excaliburjs/sample-breakout',
  },
]

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