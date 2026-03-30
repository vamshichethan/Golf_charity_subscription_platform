import { NextResponse } from "next/server";

// Sample utility to simulate draw math (40%, 35%, 25%) 
// using a hypothetical scenario where total pool is $10,000 and rollover exists.
export async function POST(req) {
  try {
    const body = await req.json();
    const { strategy = "random", totalSubscriptions = 1000, subscriptionPrice = 50, rolloverPrize = 5000 } = body;

    // 10% goes to charity. Part goes to platform. 
    // Let's assume 30% goes to the prize pool (PRD states "fixed portion").
    const totalRevenue = totalSubscriptions * subscriptionPrice;
    const prizePoolShare = 0.30; 
    const currentMonthPool = totalRevenue * prizePoolShare;

    // Split based on PRD
    const pool5Match = (currentMonthPool * 0.40) + rolloverPrize; // 40% + Rollover
    const pool4Match = currentMonthPool * 0.35; // 35%
    const pool3Match = currentMonthPool * 0.25; // 25%

    // Number generation logic (Algorithm vs Random)
    let winningNumbers = [];
    if (strategy === "random") {
       // Standard lottery style (pick 5 unique numbers between 1-45)
       while(winningNumbers.length < 5) {
         let r = Math.floor(Math.random() * 45) + 1;
         if(winningNumbers.indexOf(r) === -1) winningNumbers.push(r);
       }
    } else {
       // Algorithmic (Weighted). In a real app, query `scores` table, group by score frequency, etc.
       // For mock sake:
       winningNumbers = [36, 18, 42, 7, 21]; 
    }

    return NextResponse.json({
      success: true,
      strategy,
      math: {
        totalRevenue,
        currentMonthPool,
        payouts: {
          match_5: pool5Match,
          match_4: pool4Match,
          match_3: pool3Match
        }
      },
      winningNumbers,
      message: "Draw generated successfully."
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
