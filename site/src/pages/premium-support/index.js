import styles from './styles.module.css';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import offerings from './data';

const list = (...array) => {
  return array.join(' ')
}

const OfferingList = ({ items }) => (
  <div className={styles['support-options']}>
    {items.map(({ title, description, link, price }) => (
      <div className={styles['support-button']} key={title}>
        <div className={styles.content}>
          <h3 className="header">{title}</h3>

          <p>Price {price}</p>

          <p className="description">{description}</p>
        </div>
        <div className={clsx(styles.extra, styles.content)}>
          <a href={link}>Book Now</a>
        </div>
      </div>
    ))}
  </div>
);

export default function Support() {
  return (
    <Layout
      title='Premium Support'
      description='Excalibur maintainers offer premium support'
      >
      <main className={styles.main}>
        <div className="ui container">
        <h2>Book Premium Support</h2>

          <hr></hr>
          <p>
            The Excalibur core maintainers offer premium support.
          </p>

          <p>
            The core maintainers are experienced staff level engineers that can assist you with anything related to your project. Some of the services we provide:

            <ul>
              <li>Game Design</li>
              <li>Project Best Practices</li>
              <li>Custom Development</li>
              <li>Integrating 3rd party libraries or services</li>
              <li>Problem Solving & Debugging</li>
              <li>Bug Fixing</li>
              <li>CI/CD</li>
            </ul>
          </p>

          <OfferingList items={offerings} />

        </div>
      </main>
    </Layout>
  )
}