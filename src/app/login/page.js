"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Fallback to mock navigation if real keys aren't added yet
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      router.push("/dashboard");
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{isLogin ? "Welcome Back" : "Join the Club"}</h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? "Enter your credentials to access your dashboard." 
              : "Create an account to start playing for purpose."}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div style={{color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center'}}>{error}</div>}
          
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <input className={styles.input} type="text" id="name" placeholder="John Doe" />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              className={styles.input} 
              type="email" 
              id="email" 
              placeholder="john@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              className={styles.input} 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button className={styles.btnSubmit} type="submit" disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className={styles.footer}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            className={styles.toggleLink} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up here" : "Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
}
