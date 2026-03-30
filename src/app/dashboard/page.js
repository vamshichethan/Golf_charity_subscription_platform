import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { Trophy, Heart, Activity, Award } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (authError || !user)) {
    redirect("/login");
  }

  // Data fetching
  const { scores, charity, subscription, latestDraw, userWinnings } = await (async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user) {
      // 1. Subscription
      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single();
      
      // 2. Scores
      const { data: realScores } = await supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5);
      
      // 3. Charity
      const { data: userData } = await supabase.from('users').select('charity_percentage, selected_charity_id, charities(name)').eq('id', user.id).single();
      
      // 4. Latest Draw
      const { data: lastDraw } = await supabase.from('draws').select('*').order('date', { ascending: false }).limit(1).single();
      
      // 5. User Winnings
      const { data: wins } = await supabase.from('winners').select('*, draws(date)').eq('user_id', user.id).order('created_at', { ascending: false });
      
      return { 
        scores: realScores || [], 
        charity: userData?.charities ? { name: userData.charities.name, percentage: userData.charity_percentage } : { name: "None Selected", percentage: 10 },
        subscription: subData,
        latestDraw: lastDraw,
        userWinnings: wins || []
      };
    }
    return { scores: [], charity: { name: "None Selected", percentage: 10 }, subscription: null, latestDraw: null, userWinnings: [] };
  })();

  // Server Action to add a new score
  async function addScore(formData) {
    "use server";
    const scoreVal = formData.get("score");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && scoreVal) {
      const { data: userExists } = await supabase.from('users').select('id').eq('id', user.id).single();
      if (!userExists) {
        await supabase.from('users').insert({ id: user.id, email: user.email, role: 'user' });
      }

      await supabase.from("scores").insert({
        user_id: user.id,
        score: parseInt(scoreVal, 10),
        date: new Date().toISOString()
      });
      
      revalidatePath("/dashboard");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className={styles.title}>⛳ Score Management</h1>
            <p className={styles.subtitle}>
              {subscription ? (
                <>Subscription: <strong style={{ color: 'var(--success)' }}>Active ({subscription.tier})</strong></>
              ) : (
                <>Status: <strong style={{ color: 'var(--warn)' }}>Free Tier</strong> (Subscribe for Draws)</>
              )}
            </p>
          </div>
          <a href="/pricing" className={styles.manageLink}>View Plans</a>
        </div>
      </div>

      <div className={styles.dashboardContainer}>
        <div className="main-col">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Activity size={20} color="var(--primary)" /> Rolling 5 Scores</h2>
            <p className={styles.infoText}>
              Enter your latest scores (1–45 Stableford). We only store your last 5; adding a new one replaces the oldest automatically.
            </p>
            <div className={styles.scoreList}>
              {scores.map((s) => (
                <div key={s.id} className={styles.scoreItem}>
                  <span className={styles.scoreDate}>{new Date(s.date).toLocaleDateString()}</span>
                  <span className={styles.scoreValue}>{s.score} pts</span>
                </div>
              ))}
              {scores.length === 0 && <p className={styles.subtitle}>No scores recorded yet. Add your first score below.</p>}
            </div>
            
            <form action={addScore} className={styles.scoreInput}>
              <input type="number" name="score" min="1" max="45" placeholder="Score (1-45)" className={styles.inputField} required />
              <button type="submit" className={styles.btnAction} style={{width: 'auto'}}>Save Score</button>
            </form>
          </div>

          {/* Latest Draw Info */}
          {latestDraw && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><Trophy size={20} color="#ffd700" /> Latest Draw Results</h2>
              <div className={styles.drawResults}>
                <div className={styles.drawNumbers}>
                  {latestDraw.winning_numbers.map((num, i) => (
                    <div key={i} className={styles.numberBall}>{num}</div>
                  ))}
                </div>
                <p className={styles.drawMeta}>
                  Draw held on {new Date(latestDraw.date).toLocaleDateString()} • {latestDraw.type} strategy
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="side-col">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Heart size={20} color="var(--error)" /> My Charity</h2>
            <p style={{marginBottom: '1rem', color: 'var(--secondary)'}}>{charity.name}</p>
            <p><strong>Contribution:</strong> {charity.percentage}%</p>
            <p style={{marginTop: '0.5rem'}}><em>Fixed 10% from your membership.</em></p>
            <a href="/charities" className={styles.btnAction} style={{marginTop: '1rem', background: 'var(--primary)', textAlign: 'center', display: 'block', textDecoration: 'none'}}>Change Charity</a>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Trophy size={20} color="var(--success)" /> Draw Status</h2>
            <p style={{marginBottom: '0.5rem'}}>Next Draw: <strong>Monthly</strong></p>
            <p style={{color: 'var(--secondary)', fontSize: '0.875rem'}}>Your rolling 5 scores form your ticket automatically. Keep them updated!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
