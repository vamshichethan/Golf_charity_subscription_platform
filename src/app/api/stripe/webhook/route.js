import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Use service role key for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.tier;
        const stripeSubscriptionId = session.subscription;

        if (userId && stripeSubscriptionId) {
          // Fetch subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            stripeSubscriptionId
          );

          // Ensure user exists in public.users
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .single();

          if (!existingUser) {
            await supabase.from("users").insert({
              id: userId,
              email: session.customer_email,
              role: "user",
            });
          }

          // Upsert subscription record
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_id: stripeSubscriptionId,
              status: subscription.status,
              tier: tier,
              next_renewal: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            },
            { onConflict: "stripe_id" }
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription;

        if (stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            stripeSubscriptionId
          );

          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              next_renewal: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("stripe_id", stripeSubscriptionId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            next_renewal: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_id", stripeSubscriptionId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            next_renewal: null,
          })
          .eq("stripe_id", stripeSubscriptionId);
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
