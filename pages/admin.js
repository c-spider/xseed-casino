import Head from 'next/head';
import styles from '../styles/Home.module.css'
import RequestTable from 'components/RequestTable';
import RoundTable from 'components/RoundTable';
import SettingDlg from 'components/SettingDlg';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Admin - MetaXSeed Casino</title>
        <meta name="description" content="SafeBlock" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <SettingDlg />
        <RoundTable />
      </main>
      <footer></footer>
    </div>
  );
}