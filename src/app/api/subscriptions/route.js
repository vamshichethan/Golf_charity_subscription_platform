import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe." },
        { status: 401 }
      );
    }

    const { tier } = await req.json();

    if (!tier || !["monthly", "yearly"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier." },
        { status: 400 }
      );
    }

    // Set renewal date based on tier
    const renewalDate = new Date();
    if (tier === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    // Create Subscription directly in Supabase (Free/Mock mode)
    const { error: subError } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        status: "active",
        tier: tier,
        next_renewal: renewalDate.toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (subError) throw subError;

    return NextResponse.json({ success: true, message: "Subscription activated!" });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate subscription." },
      { status: 500 }
    );
  }
}
