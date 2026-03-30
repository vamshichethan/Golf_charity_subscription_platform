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

  // Top-level Server Action for charity selection
  async function selectCharity(formData) {
    "use server";
    const charityId = formData.get("charityId");
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    
    if (user && charityId) {
      // Ensure user exists in public.users first
      const { data: userExists } = await supabaseServer.from('users').select('id').eq('id', user.id).single();
      if (!userExists) {
        await supabaseServer.from('users').insert({ id: user.id, email: user.email, role: 'user' });
      }
      
      await supabaseServer.from('users').update({ selected_charity_id: charityId }).eq('id', user.id);
      redirect('/dashboard');
    }
  }

  // Get current user's charity if available
  let currentUserCharityId = null;
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (user) {
    const { data: userData } = await supabase.from('users').select('selected_charity_id').eq('id', user.id).single();
    currentUserCharityId = userData?.selected_charity_id;
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.badge}>
          <Heart size={14} fill="currentColor" />
          <span>Our Impact</span>
        </div>
        <h1 className={styles.title}>Play for <span>Purpose</span></h1>
        <p className={styles.subtitle}>
          At the core of SwingForGood is the mission to drive change. Choose where your fixed 10% contribution goes each month.
        </p>
      </header>

      <div className={styles.grid}>
        {charities.map((charity) => (
          <div key={charity.id} className={`${styles.card} ${currentUserCharityId === charity.id ? styles.cardActive : ''}`}>
            {currentUserCharityId === charity.id && (
              <div className={styles.currentBadge}>Current Selection</div>
            )}
            <div className={styles.imageWrapper}>
              <img 
                src={charity.image_url || `https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop`} 
                alt={charity.name} 
                className={styles.charityImage}
              />
              <div className={styles.imageOverlay} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.name}>{charity.name}</h2>
              <p className={styles.description}>{charity.description}</p>
              
              <form action={selectCharity}>
                <input type="hidden" name="charityId" value={charity.id} />
                <button 
                  type="submit" 
                  className={currentUserCharityId === charity.id ? styles.actionDisabled : styles.action}
                  disabled={currentUserCharityId === charity.id}
                >
                  {currentUserCharityId === charity.id ? 'Selected' : 'Select Charity'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
