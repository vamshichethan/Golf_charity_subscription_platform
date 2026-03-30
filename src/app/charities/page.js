import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { Heart } from "lucide-react";

export default async function Charities() {
  const supabase = await createClient();
  let charities = [
    {
      id: "mock-1",
      name: "Golf For Good",
      description: "Supporting youth development through golf programs. Providing equipment, tuition and mentorship to underprivileged areas.",
    },
    {
      id: "mock-2",
      name: "Green Drives",
      description: "Environmental conservation on and off the course. Focused on sustainable water usage, planting native trees, and habitat restoration.",
    },
    {
      id: "mock-3",
      name: "Tee Off Hunger",
      description: "Local food bank support initiatives. Every $10 feeds a family of four for a week.",
    }
  ];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data: realCharities } = await supabase
      .from('charities')
      .select('*')
      .eq('active_status', true);
      
    if (realCharities && realCharities.length > 0) {
      charities = realCharities;
    }
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "1rem" }}>Partner Charities</h1>
        <p style={{ fontSize: "1.25rem", color: "var(--secondary)", maxWidth: "600px", margin: "0 auto" }}>
          At the core of SwingForGood is the mission to drive change. Choose where your 10% contribution goes each month.
        </p>
      </div>

      <div className={styles.grid}>
        {charities.map((charity) => (
          <div key={charity.id} className={styles.card}>
            <div className={styles.imagePlaceholder}>
              <Heart size={48} opacity={0.2} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.name}>{charity.name}</h2>
              <p className={styles.description}>{charity.description}</p>
              <form action={async () => {
                'use server';
                const supabaseServer = await createClient();
                const { data: { user } } = await supabaseServer.auth.getUser();
                if (user) {
                  // Ensure user exists in public.users first (fallback if no trigger exists)
                  const { data: userExists } = await supabaseServer.from('users').select('id').eq('id', user.id).single();
                  if (!userExists) {
                    await supabaseServer.from('users').insert({ id: user.id, email: user.email });
                  }
                  
                  await supabaseServer.from('users').update({ selected_charity_id: charity.id }).eq('id', user.id);
                }
                redirect('/dashboard');
              }}>
                <button type="submit" className={styles.action}>Select Charity</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
