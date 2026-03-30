import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { Trophy, Heart, Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // If we have actual keys but the user isn't logged in, redirect them
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (authError || !user)) {
    redirect("/login");
  }

  // Mock data fallback
  let scores = [
    { id: 1, score: 36, date: "2026-03-25" },
    { id: 2, score: 42, date: "2026-03-20" },
    { id: 3, score: 38, date: "2026-03-15" },
    { id: 4, score: 40, date: "2026-03-10" },
    { id: 5, score: 45, date: "2026-03-05" }
  ];
  let charity = { name: "Golf For Good", percentage: 10 };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && user) {
    // Fetch user's rolling 5 scores
    const { data: realScores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (realScores) {
      scores = realScores;
    }

    // Fetch user's charity details assuming relation exists
    const { data: userData } = await supabase
      .from('users')
      .select('charity_percentage, charities(name)')
      .eq('id', user.id)
      .single();

    if (userData && userData.charities) {
       charity = { name: userData.charities.name, percentage: userData.charity_percentage };
    }
  }

  // Server Action to add a new score
  async function addScore(formData) {
    "use server";
    const scoreVal = formData.get("score");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && scoreVal) {
      // Ensure user exists in public.users first (fallback if no trigger exists)
      const { data: userExists } = await supabase.from('users').select('id').eq('id', user.id).single();
      if (!userExists) {
        await supabase.from('users').insert({ id: user.id, email: user.email });
      }

      const { error } = await supabase.from("scores").insert({
        user_id: user.id,
        score: parseInt(scoreVal, 10),
        date: new Date().toISOString()
      });
      if (error) console.error("Error inserting score:", error);
      
      revalidatePath("/dashboard");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, Golfer</h1>
        <p className={styles.subtitle}>Your subscription is active until April 25, 2026.</p>
      </div>

      <div className={styles.dashboardContainer}>
        <div className="main-col">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Activity size={20} color="var(--primary)" /> Rolling 5 Scores (Stableford)</h2>
            <div className={styles.scoreList}>
              {scores.map((s) => (
                <div key={s.id} className={styles.scoreItem}>
                  <span className={styles.scoreDate}>{s.date.split("T")[0]}</span>
                  <span className={styles.scoreValue}>{s.score} pts</span>
                </div>
              ))}
              {scores.length === 0 && <p className={styles.subtitle}>No scores recorded yet.</p>}
            </div>
            
            <form action={addScore} className={styles.scoreInput}>
              <input type="number" name="score" min="1" max="45" placeholder="New Score (1-45)" className={styles.inputField} required />
              <button type="submit" className={styles.btnAction} style={{width: 'auto'}}>Add</button>
            </form>
          </div>
        </div>

        <div className="side-col">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Heart size={20} color="var(--error)" /> My Charity</h2>
            <p style={{marginBottom: '1rem', color: 'var(--secondary)'}}>{charity.name}</p>
            <p><strong>Contribution:</strong> {charity.percentage}%</p>
            <p style={{marginTop: '0.5rem'}}><em>$12.50 donated this year.</em></p>
            <button className={styles.btnAction} style={{marginTop: '1rem', background: 'var(--primary)'}}>Change Charity</button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Trophy size={20} color="var(--success)" /> Draw Status</h2>
            <p style={{marginBottom: '0.5rem'}}>Next Draw: <strong>April 1st</strong></p>
            <p style={{color: 'var(--secondary)', fontSize: '0.875rem'}}>Your recent scores form your ticket automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
