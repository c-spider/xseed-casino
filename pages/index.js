import Head from 'next/head';
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
        <div className={styles.container}>
      <Head>
        <title>SafeBlock ICO Presale</title>
        <meta name="description" content="SafeBlock" />
        <link rel="icon" href="/images/logo-white.png" />
      </Head>

      <main className={styles.main}>
      </main>
      <footer></footer>
    </div>
  );
}