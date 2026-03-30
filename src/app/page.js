import Link from "next/link";
import { Heart, Trophy, Goal } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Play for Purpose.<br/><span>Win for Good.</span></h1>
          <p className={styles.subtitle}>
            A modern platform blending your love for the game with meaningful charitable impact. Track your performance, enter our monthly draw, and support the causes you care about most.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/login">
              <button className={styles.btnPrimary}>
                Join the Club
              </button>
            </Link>
            <Link href="/charities">
              <button className={styles.btnSecondary}>Explore Charities</button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Goal size={24} />
          </div>
          <h3 className={styles.featureTitle}>Track Performance</h3>
          <p className={styles.featureDesc}>Log your rolling last 5 Stableford scores. A streamlined interface to keep track of your form without the clutter.</p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Trophy size={24} color="var(--success)" />
          </div>
          <h3 className={styles.featureTitle}>Monthly Draws</h3>
          <p className={styles.featureDesc}>Your recent scores form your entry ticket. Match 3, 4, or 5 numbers in our monthly draw to win from the prize pool.</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Heart size={24} color="var(--error)" />
          </div>
          <h3 className={styles.featureTitle}>Charitable Impact</h3>
          <p className={styles.featureDesc}>A guaranteed 10% of your subscription goes directly to a verified charity of your choice. Real impact, every month.</p>
        </div>
      </section>

      <section className={styles.impactSection}>
        <h2 className={styles.impactTitle}>Driving Real Change</h2>
        <p className={styles.impactDesc}>Our community turns their passion into purpose. Here is the impact we have created so far together.</p>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>$15K+</span>
            <span className={styles.statLabel}>Raised for Charity</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Verified Partners</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>$30K+</span>
            <span className={styles.statLabel}>Won by Members</span>
          </div>
        </div>
      </section>
    </div>
  );
}
