import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const plans = {
      monthly: {
        name: "SwingForGood Monthly",
        amount: 999, // £9.99 in pence
        interval: "month",
      },
      yearly: {
        name: "SwingForGood Yearly",
        amount: 9999, // £99.99 in pence
        interval: "year",
      },
    };

    const plan = plans[tier];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: tier,
        },
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: plan.name,
              description:
                tier === "monthly"
                  ? "Monthly golf charity subscription — enter draws, track scores, support charities."
                  : "Annual golf charity subscription — save £19.89/year! Enter draws, track scores, support charities.",
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/pricing?subscription=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
