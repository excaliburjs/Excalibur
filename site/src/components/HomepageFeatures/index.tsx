import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
{
    title: 'Free and Open Source',
    Svg: require('@site/static/img/OSI_Keyhole.svg').default,
    description: (
      <>
        Excalibur is and always will be free and open source! Excalibur public projects are BSD 2 Clause, and will never, ever change.
      </>
    ),
  },
  {
    title: 'Made with TypeScript',
    Svg: require('@site/static/img/ts-logo-256.svg').default,
    description: (
      <>
        Excalibur was built from the ground up for TypeScript, a typed superset of JavaScript that feels familiar to C#, Java, and other strongly-typed languages. This makes Excalibur code clean, readable, and maintainable.
      </>
    ),
  },
  {
    title: 'Extensive Documentation',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Excalibur has a fully-documented API reference that is automatically kept up-to-date with every version, including the main code branch.
      </>
    ),
  },
  {
    title: 'Designed for Cross-Platform',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Excalibur games compile to modern JavaScript and therefore work in the majority of browsers, including mobile. Since Excalibur games are "just JavaScript", you can use native app packaging wrappers like Apache Cordova, Universal Windows Apps, or Electron to create cross-platform games.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={clsx('row', styles.rowCenter)}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
