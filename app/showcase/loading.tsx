import styles from "./showcase.module.css";

export default function ShowcaseLoading() {
  return (
    <div className={styles.showcase} aria-busy="true" aria-label="Loading showcase">
      <div className={styles.container}>
        <span className="sr-only" role="status">Loading the D’Art Crew showcase…</span>
        <div className={styles.loadingHero} aria-hidden="true">
          <span className={`${styles.loadingLine} ${styles.loadingLineSmall}`} />
          <span className={styles.loadingLine} />
          <span className={styles.loadingLine} />
        </div>
        <div className={styles.categoryGrid} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div key={index} className={styles.loadingCard} />)}</div>
      </div>
    </div>
  );
}
