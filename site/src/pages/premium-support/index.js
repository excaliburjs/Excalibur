import styles from './styles.module.css';
import Layout from '@theme/Layout';
import clsx from 'clsx';

const data = [
  {
    title: '1 Hour of Excalibur Support',
    link: 'https://savvycal.com/excalibur/support-1-hour',
    description: 'Book 1 hour of dedicated time with an Excalibur core maintainer. We will meet over a video call to discuss and work to provide you the information, issue resolution, debugging, or custom development you need.',
    price: '$100'
  },
  {
    title: '2 Hours of Excalibur Support',
    link: 'https://savvycal.com/excalibur/support-2-hour',
    description: 'Book 2 hours of dedicated time with an Excalibur core maintainer. We will meet over a video call to discuss and work to provide you the information, issue resolution, debugging, or custom development you need.',
    price: '$180'
  },
  {
    title: 'Custom Development Project',
    link: 'https://savvycal.com/excalibur/custom-quote',
    description: 'Schedule a free 30 minute meeting to get a quote for your project. This work would involve a maintainer writing custom code for your game, either in Excalibur, building a new plugin, or directly in your code base.',
    price: 'Starts at $2000'
  }
]

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

          <OfferingList items={data} />

        </div>
      </main>
    </Layout>
  )
}