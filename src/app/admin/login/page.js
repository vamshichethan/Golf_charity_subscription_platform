"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";
import { Shield } from "lucide-react";

export default function AdminLogin() {
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

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Step 2: Ensure user exists in public.users table
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      // If user doesn't exist in public.users yet, create the record
      if (userError || !userData) {
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: authData.user.email,
          role: "user",
        });

        if (insertError) {
          // If insert also fails (e.g. RLS), try fetching again in case of race condition
          const { data: retryData } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single();
          userData = retryData;
        } else {
          // Just inserted with role='user', so they're not admin yet
          userData = { role: "user" };
        }

        if (!userData) {
          setError("Unable to verify account. Check Supabase RLS policies on the users table.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }

      if (userData.role !== "admin") {
        setError("Access denied. You do not have admin privileges.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Step 3: Admin verified – redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Shield size={32} />
        </div>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Restricted access. Sign in with admin credentials.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="admin-email">
              Email Address
            </label>
            <input
              className={styles.input}
              type="email"
              id="admin-email"
              placeholder="admin@swingforgood.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="admin-password">
              Password
            </label>
            <input
              className={styles.input}
              type="password"
              id="admin-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className={styles.btnSubmit}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              "Sign In as Admin"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/login" className={styles.backLink}>
            ← Back to user login
          </a>
        </div>
      </div>
    </div>
  );
}
