"use client";

import Link from "next/link";
import { RefreshCw, Sparkles } from "lucide-react";
import styles from "./showcase.module.css";

export default function ShowcaseError({ reset }: { reset: () => void }) {
  return (
    <div className={styles.showcase}>
      <div className={styles.container}>
        <div className={styles.emptyState} role="alert">
          <div className={styles.emptyIcon}><Sparkles size={28} strokeWidth={1.2} aria-hidden="true" /></div>
          <h1>A brief intermission.</h1>
          <p>The showcase couldn’t load right now. Give it another try in a moment.</p>
          <button type="button" className={styles.textLink} onClick={reset}><RefreshCw size={15} aria-hidden="true" />Try again</button>
          <Link href="/" className={styles.backLink} style={{ marginTop: 25, marginBottom: 0 }}>Back to D’Art Crew</Link>
        </div>
      </div>
    </div>
  );
}
