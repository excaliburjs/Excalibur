import styles from './styles.module.css';
import Layout from '@theme/Layout';
import clsx from 'clsx';

const list = (...array) => {
  return array.join(' ')
}
export default function DonatePage() {
  return (
    <Layout
      title='Donate'
      description='Please consider a small donation on the following platforms!'
      >
      <main className={styles.main}>
        <div className="ui container">
        <h2>Donate</h2>

          <hr></hr>
          <p>
            Please consider a small donation on the following platforms!
          </p>

          <div className={styles['sponsor-options']}>
            <a
              className={list(styles['sponsor-button'], styles.gh)}
              href="https://github.com/sponsors/eonarheim"
            >
              <p>Support Excalibur on GitHub Sponsor</p>
            </a>

            <a
              className={list(styles['sponsor-button'], styles.patreon)}
              href="https://www.patreon.com/join/erikonarheim"
            >
              <p>Support Excalibur on Patreon</p>
            </a>

            <a
              className={list(styles['sponsor-button'], styles.kofi)}
              href="https://ko-fi.com/erikonarheim"
            >
              <p>Support Excalibur on Ko-Fi</p>
            </a>
            <a
              className={list(styles['sponsor-button'], styles.liberapay)}
              href="https://ko-fi.com/erikonarheim"
            >
              <p>Support Excalibur on Liberapay</p>
            </a>
          </div>

          <p>Donations allow us to spend more time working on Excalibur!</p>

          <p>
            Excalibur is currently a labor of love and something we do outside of
            our day jobs; our goal is to one day fund part-time or full-time
            development.
          </p>
        </div>
      </main>
    </Layout>
  )
}