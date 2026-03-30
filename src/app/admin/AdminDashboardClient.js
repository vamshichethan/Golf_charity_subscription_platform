"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";
import {
  Users,
  Heart,
  Trophy,
  CreditCard,
  Award,
  LogOut,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboardClient({
  users,
  charities,
  subscriptions,
  draws,
  winners,
  adminEmail,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCharity, setShowAddCharity] = useState(false);
  const [charityName, setCharityName] = useState("");
  const [charityDesc, setCharityDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const tabs = [
    { id: "overview", label: "Overview", icon: <Shield size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "charities", label: "Charities", icon: <Heart size={18} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <CreditCard size={18} /> },
    { id: "draws", label: "Draws", icon: <Trophy size={18} /> },
    { id: "winners", label: "Winners", icon: <Award size={18} /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const handleAddCharity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const { error } = await supabase.from("charities").insert({
      name: charityName,
      description: charityDesc,
      active_status: true,
    });
    if (!error) {
      setCharityName("");
      setCharityDesc("");
      setShowAddCharity(false);
      router.refresh();
    }
    setActionLoading(false);
  };

  const handleToggleCharity = async (id, currentStatus) => {
    await supabase
      .from("charities")
      .update({ active_status: !currentStatus })
      .eq("id", id);
    router.refresh();
  };

  const handleDeleteCharity = async (id) => {
    if (confirm("Are you sure you want to delete this charity?")) {
      await supabase.from("charities").delete().eq("id", id);
      router.refresh();
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    router.refresh();
  };

  const handleUpdateWinnerPayout = async (id, status) => {
    await supabase
      .from("winners")
      .update({ payout_status: status })
      .eq("id", id);
    router.refresh();
  };

  // Stats
  const totalUsers = users.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const totalCharities = charities.length;
  const totalDraws = draws.length;
  const pendingPayouts = winners.filter(
    (w) => w.payout_status === "pending"
  ).length;

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Shield size={24} className={styles.sidebarIcon} />
          <span className={styles.sidebarTitle}>Admin Panel</span>
        </div>

        <nav className={styles.sidebarNav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${
                activeTab === tab.id ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <ChevronRight size={14} className={styles.navArrow} />
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {adminEmail?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.adminMeta}>
              <span className={styles.adminName}>Admin</span>
              <span className={styles.adminEmailText}>{adminEmail}</span>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <p className={styles.pageSubtitle}>
              Welcome back. Here is a snapshot of the platform.
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))",
                    color: "#3b82f6",
                  }}
                >
                  <Users size={22} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{totalUsers}</span>
                  <span className={styles.statLabel}>Total Users</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                    color: "#22c55e",
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>
                    {activeSubscriptions}
                  </span>
                  <span className={styles.statLabel}>Active Subs</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                    color: "#ef4444",
                  }}
                >
                  <Heart size={22} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{totalCharities}</span>
                  <span className={styles.statLabel}>Charities</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))",
                    color: "#a855f7",
                  }}
                >
                  <Trophy size={22} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{totalDraws}</span>
                  <span className={styles.statLabel}>Total Draws</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
                    color: "#f97316",
                  }}
                >
                  <Award size={22} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{pendingPayouts}</span>
                  <span className={styles.statLabel}>Pending Payouts</span>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Recent Users</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Charity</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              u.role === "admin"
                                ? styles.badgeAdmin
                                : styles.badgeUser
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{u.charities?.name || "—"}</td>
                        <td>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className={styles.emptyRow}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h1 className={styles.pageTitle}>User Management</h1>
            <p className={styles.pageSubtitle}>
              View and manage all platform users.
            </p>

            <div className={styles.sectionCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Charity</th>
                      <th>Contribution %</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className={styles.emailCell}>{u.email}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              u.role === "admin"
                                ? styles.badgeAdmin
                                : styles.badgeUser
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{u.charities?.name || "—"}</td>
                        <td>{u.charity_percentage}%</td>
                        <td>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className={styles.actionBtn}
                            onClick={() =>
                              handleChangeUserRole(
                                u.id,
                                u.role === "admin" ? "user" : "admin"
                              )
                            }
                          >
                            <RefreshCw size={14} />
                            {u.role === "admin"
                              ? "Make User"
                              : "Make Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Charities Tab */}
        {activeTab === "charities" && (
          <div>
            <div className={styles.pageTitleRow}>
              <div>
                <h1 className={styles.pageTitle}>Charity Management</h1>
                <p className={styles.pageSubtitle}>
                  Add, edit, or deactivate charities.
                </p>
              </div>
              <button
                className={styles.addBtn}
                onClick={() => setShowAddCharity(!showAddCharity)}
              >
                <Plus size={18} />
                Add Charity
              </button>
            </div>

            {showAddCharity && (
              <div className={styles.formCard}>
                <h3 className={styles.formCardTitle}>New Charity</h3>
                <form onSubmit={handleAddCharity} className={styles.inlineForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      placeholder="Charity name"
                      value={charityName}
                      onChange={(e) => setCharityName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea
                      className={styles.formTextarea}
                      placeholder="Brief description..."
                      value={charityDesc}
                      onChange={(e) => setCharityDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Saving..." : "Save Charity"}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setShowAddCharity(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.sectionCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charities.map((c) => (
                      <tr key={c.id}>
                        <td className={styles.boldCell}>{c.name}</td>
                        <td className={styles.descCell}>
                          {c.description || "—"}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              c.active_status
                                ? styles.badgeActive
                                : styles.badgeInactive
                            }`}
                          >
                            {c.active_status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.actionBtn}
                              onClick={() =>
                                handleToggleCharity(c.id, c.active_status)
                              }
                            >
                              <RefreshCw size={14} />
                              {c.active_status ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              onClick={() => handleDeleteCharity(c.id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {charities.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          No charities found. Add one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div>
            <h1 className={styles.pageTitle}>Subscriptions</h1>
            <p className={styles.pageSubtitle}>
              Track all user subscription activity.
            </p>

            <div className={styles.sectionCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Stripe ID</th>
                      <th>Status</th>
                      <th>Tier</th>
                      <th>Next Renewal</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.users?.email || "—"}</td>
                        <td className={styles.monoCell}>
                          {s.stripe_id?.slice(0, 20)}...
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              s.status === "active"
                                ? styles.badgeActive
                                : styles.badgeInactive
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>{s.tier || "—"}</td>
                        <td>
                          {s.next_renewal
                            ? new Date(s.next_renewal).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          No subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Draws Tab */}
        {activeTab === "draws" && (
          <div>
            <div className={styles.pageTitleRow}>
              <div>
                <h1 className={styles.pageTitle}>Draw History</h1>
                <p className={styles.pageSubtitle}>
                  View past draws and trigger new ones based on current data.
                </p>
              </div>
              <button
                className={styles.addBtn}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    const res = await fetch("/api/draws", { method: "POST", body: JSON.stringify({ strategy: "random" }) });
                    const result = await res.json();
                    if (result.success) {
                      alert(`Draw successful! Found ${result.winnersCount} winners.`);
                      router.refresh();
                    } else {
                      alert("Error: " + result.error);
                    }
                  } catch (err) {
                    alert("Failed to run draw. Check console.");
                  }
                  setActionLoading(false);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <RefreshCw size={18} className={styles.spin} />
                ) : (
                  <Trophy size={18} />
                )}
                Run New Draw
              </button>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Winning Numbers</th>
                      <th>Match 5 Pool</th>
                      <th>Match 4 Pool</th>
                      <th>Match 3 Pool</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draws.map((d) => (
                      <tr key={d.id}>
                        <td>
                          {new Date(d.date).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              d.type === "random"
                                ? styles.badgeUser
                                : styles.badgeAdmin
                            }`}
                          >
                            {d.type}
                          </span>
                        </td>
                        <td className={styles.monoCell}>
                          {d.winning_numbers?.join(", ") || "—"}
                        </td>
                        <td className={styles.boldCell}>£{parseFloat(d.pool_5_match).toFixed(2)}</td>
                        <td>£{parseFloat(d.pool_4_match).toFixed(2)}</td>
                        <td>£{parseFloat(d.pool_3_match).toFixed(2)}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              d.status === "published"
                                ? styles.badgeActive
                                : styles.badgeInactive
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {draws.length === 0 && (
                      <tr>
                        <td colSpan={7} className={styles.emptyRow}>
                          No draws found. Trigger one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Winners Tab */}
        {activeTab === "winners" && (
          <div>
            <h1 className={styles.pageTitle}>Winners & Payouts</h1>
            <p className={styles.pageSubtitle}>
              Manage draw winners and payout statuses.
            </p>

            <div className={styles.sectionCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Draw Date</th>
                      <th>Match Type</th>
                      <th>Payout</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((w) => (
                      <tr key={w.id}>
                        <td>{w.users?.email || "—"}</td>
                        <td>
                          {w.draws?.date
                            ? new Date(w.draws.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{w.match_type}</td>
                        <td className={styles.boldCell}>
                          £{parseFloat(w.payout_amount).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              w.payout_status === "paid"
                                ? styles.badgeActive
                                : w.payout_status === "rejected"
                                ? styles.badgeDanger
                                : styles.badgeInactive
                            }`}
                          >
                            {w.payout_status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            {w.payout_status === "pending" && (
                              <>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() =>
                                    handleUpdateWinnerPayout(w.id, "paid")
                                  }
                                >
                                  Mark Paid
                                </button>
                                <button
                                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                  onClick={() =>
                                    handleUpdateWinnerPayout(
                                      w.id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {w.payout_status !== "pending" && (
                              <span className={styles.completedText}>
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {winners.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          No winners found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
