import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { strategy = "random" } = body;

    // 1. Calculate Prize Pool based on active subscriptions
    const { count: activeSubs } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const subscriptionPrice = 9.99;
    const totalRevenue = (activeSubs || 0) * subscriptionPrice;
    
    // PRD: 30% to prize pool, fixed portions (40/35/25)
    const currentMonthPool = totalRevenue * 0.30;
    const pool5Match = currentMonthPool * 0.40;
    const pool4Match = currentMonthPool * 0.35;
    const pool3Match = currentMonthPool * 0.25;

    // 2. Generate Winning Numbers (5 unique numbers 1-45)
    let winningNumbers = [];
    while (winningNumbers.length < 5) {
      let r = Math.floor(Math.random() * 45) + 1;
      if (winningNumbers.indexOf(r) === -1) winningNumbers.push(r);
    }
    winningNumbers.sort((a, b) => a - b);

    // 3. Save Draw to DB
    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({
        date: new Date().toISOString(),
        type: strategy,
        winning_numbers: winningNumbers,
        pool_5_match: pool5Match,
        pool_4_match: pool4Match,
        pool_3_match: pool3Match,
        status: "published",
      })
      .select()
      .single();

    if (drawError) throw drawError;

    // 4. Find Winners by matching scores
    // Each user has up to 5 scores. We need to check if any user's set of scores matches the winning numbers.
    const { data: allUserScores } = await supabase
      .from("scores")
      .select("user_id, score");

    // Group scores by user
    const userMatches = {};
    allUserScores?.forEach((s) => {
      if (!userMatches[s.user_id]) userMatches[s.user_id] = 0;
      if (winningNumbers.includes(s.score)) {
        userMatches[s.user_id]++;
      }
    });

    // Create Winner records
    const winnersToInsert = [];
    for (const [userId, matchCount] of Object.entries(userMatches)) {
      let matchType = null;
      let payoutAmount = 0;

      if (matchCount === 5) {
        matchType = "5-number";
        payoutAmount = pool5Match; // In real logic, split by number of winners
      } else if (matchCount === 4) {
        matchType = "4-number";
        payoutAmount = pool4Match;
      } else if (matchCount === 3) {
        matchType = "3-number";
        payoutAmount = pool3Match;
      }

      if (matchType) {
        winnersToInsert.push({
          draw_id: draw.id,
          user_id: userId,
          match_type: matchType,
          payout_amount: payoutAmount,
          payout_status: "pending",
        });
      }
    }

    if (winnersToInsert.length > 0) {
      await supabase.from("winners").insert(winnersToInsert);
    }

    return NextResponse.json({
      success: true,
      draw: draw,
      winnersCount: winnersToInsert.length,
      message: `Draw completed. Found ${winnersToInsert.length} winners.`,
    });
  } catch (error) {
    console.error("Draw processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
