import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Role check
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "admin") {
    redirect("/admin/login");
  }

  // Fetch all data for admin dashboard
  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, charity_percentage, created_at, charities(name)")
    .order("created_at", { ascending: false });

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, users(email)")
    .order("created_at", { ascending: false });

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: winners } = await supabase
    .from("winners")
    .select("*, users(email), draws(date, type)")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboardClient
      users={users || []}
      charities={charities || []}
      subscriptions={subscriptions || []}
      draws={draws || []}
      winners={winners || []}
      adminEmail={user.email}
    />
  );
}
