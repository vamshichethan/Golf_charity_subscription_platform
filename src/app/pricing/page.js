"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Check, Zap, Crown, Shield, ArrowRight } from "lucide-react";

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubscribe = async (tier) => {
    setLoading(tier);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Not logged in — redirect to login
          router.push("/login");
          return;
        }
        setError(data.error || "Something went wrong.");
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  };

  const features = [
    "Rolling 5 Stableford score tracking",
    "Monthly prize draw entry",
    "10% charity contribution",
    "Choose your charity partner",
    "Priority customer support",
  ];

  return (
    <div>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Zap size={14} />
            <span>Simple Pricing</span>
          </div>
          <h1 className={styles.title}>
            Choose Your <span>Plan</span>
          </h1>
          <p className={styles.subtitle}>
            Subscribe to SwingForGood and start playing for purpose. Every
            subscription supports verified charities.
          </p>
        </div>
      </section>

      {error && (
        <div className={styles.errorBanner}>
          <Shield size={16} />
          {error}
        </div>
      )}

      <section className={styles.plansSection}>
        {/* Monthly Plan */}
        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <div className={styles.planIcon}>
              <Zap size={24} />
            </div>
            <h2 className={styles.planName}>Monthly</h2>
            <p className={styles.planDesc}>Perfect for trying it out</p>
          </div>

          <div className={styles.priceWrap}>
            <span className={styles.currency}>£</span>
            <span className={styles.price}>9.99</span>
            <span className={styles.interval}>/month</span>
          </div>

          <ul className={styles.featureList}>
            {features.map((f, i) => (
              <li key={i} className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                {f}
              </li>
            ))}
          </ul>

          <button
            className={styles.subscribeBtn}
            onClick={() => handleSubscribe("monthly")}
            disabled={loading !== null}
          >
            {loading === "monthly" ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Get Started
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className={`${styles.planCard} ${styles.planCardFeatured}`}>
          <div className={styles.popularBadge}>Best Value</div>

          <div className={styles.planHeader}>
            <div className={`${styles.planIcon} ${styles.planIconFeatured}`}>
              <Crown size={24} />
            </div>
            <h2 className={styles.planName}>Yearly</h2>
            <p className={styles.planDesc}>Save £19.89 per year</p>
          </div>

          <div className={styles.priceWrap}>
            <span className={styles.currency}>£</span>
            <span className={styles.price}>99.99</span>
            <span className={styles.interval}>/year</span>
          </div>

          <div className={styles.savingsBadge}>
            Save 17% vs monthly
          </div>

          <ul className={styles.featureList}>
            {features.map((f, i) => (
              <li key={i} className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                {f}
              </li>
            ))}
            <li className={styles.featureItem}>
              <Check size={16} className={styles.checkIconGold} />
              <strong>Exclusive yearly member badge</strong>
            </li>
          </ul>

          <button
            className={`${styles.subscribeBtn} ${styles.subscribeBtnFeatured}`}
            onClick={() => handleSubscribe("yearly")}
            disabled={loading !== null}
          >
            {loading === "yearly" ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Get Started
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </section>

      <section className={styles.trustSection}>
        <p className={styles.trustText}>
          🔒 Secured by Stripe. Cancel anytime. 10% of every subscription goes
          directly to your chosen charity.
        </p>
      </section>
    </div>
  );
}
