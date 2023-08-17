import Head from 'next/head';
import styles from '../styles/Home.module.css'

import Hero from "components/Hero";
import History from "components/History";
import CountDown from "components/CountDown";
import PrizePool from 'components/PrizePool';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Lottery - MetaXSeed Casino</title>
        <meta name="description" content="Lottery game" />
        <link rel="icon" href="favicon.png" />
      </Head>

      <main className={styles.main}>
        <Hero />
        <CountDown />
        <History data={[1, 2]} />
        <PrizePool />
      </main>
      <footer></footer>
    </div>
  );
}