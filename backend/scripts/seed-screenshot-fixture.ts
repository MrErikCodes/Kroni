/**
 * One-time seed for App Store / Play Store screenshots. Wipes the target
 * household's content and replaces it with 3 kids, ~10 tasks (mix of
 * recurring + one-off), pending + approved completions, rewards (small +
 * savings goal per kid), and balance entries that land each kid at a
 * predictable share of their goal.
 *
 * Run with phase so DATABASE_URL etc. are injected:
 *   cd backend
 *   phase run -- tsx scripts/seed-screenshot-fixture.ts
 *   phase run -- tsx scripts/seed-screenshot-fixture.ts other.parent@example.com
 */

import { eq } from 'drizzle-orm';

import { getDb, closeDb } from '../src/db/index.js';
import { households } from '../src/db/schema/households.js';
import { parents } from '../src/db/schema/parents.js';
import { kids } from '../src/db/schema/kids.js';
import { tasks, taskCompletions } from '../src/db/schema/tasks.js';
import { rewards, rewardRedemptions } from '../src/db/schema/rewards.js';
import { balanceEntries, kidBalances } from '../src/db/schema/balance.js';
import { pairingCodes, kidDevices } from '../src/db/schema/pairing.js';

const DEFAULT_EMAIL = 'erik@nilsenkonsult.no';
const targetEmail = (process.argv[2] ?? DEFAULT_EMAIL).toLowerCase().trim();

const NOW = new Date();
function isoDate(daysFromToday: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}
function tsAt(daysFromToday: number, hour = 12): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

interface SeedKid {
  name: string;
  birthYear: number;
  avatarKey: string;
  pin: string;
  allowanceCents: number;
  allowanceDayOfWeek: number; // 0=Sun … 6=Sat
  finalBalanceCents: number;
  savingsGoalTitle: string;
  savingsGoalCents: number;
  smallReward: { title: string; cents: number };
}

const KIDS: SeedKid[] = [
  {
    name: 'Emil',
    birthYear: 2018,
    avatarKey: 'fox',
    pin: '1234',
    allowanceCents: 5000,
    allowanceDayOfWeek: 1,
    finalBalanceCents: 28500, // 285 kr → ~71% of 400 kr LEGO
    savingsGoalTitle: 'Nytt LEGO-sett',
    savingsGoalCents: 40000,
    smallReward: { title: 'Skjermtid 30 min', cents: 5000 },
  },
  {
    name: 'Sofia',
    birthYear: 2016,
    avatarKey: 'unicorn',
    pin: '4321',
    allowanceCents: 7500,
    allowanceDayOfWeek: 1,
    finalBalanceCents: 48000, // 480 kr → 80% of 600 kr Nye sko
    savingsGoalTitle: 'Nye sko',
    savingsGoalCents: 60000,
    smallReward: { title: 'Kinokveld', cents: 15000 },
  },
  {
    name: 'Noah',
    birthYear: 2020,
    avatarKey: 'bear',
    pin: '5678',
    allowanceCents: 3500,
    allowanceDayOfWeek: 1,
    finalBalanceCents: 6500, // 65 kr → ~81% of 80 kr book
    savingsGoalTitle: 'Ny bok',
    savingsGoalCents: 8000,
    smallReward: { title: 'Is etter middag', cents: 2000 },
  },
];

interface SeedTask {
  kidIdx: 0 | 1 | 2;
  title: string;
  rewardCents: number;
  recurrence: 'daily' | 'weekly' | 'once';
  daysOfWeek?: number[];
  // 'approved' = past, banked. 'pending' = today, awaiting approval.
  history: ('approved' | 'pending')[];
}

const TASKS: SeedTask[] = [
  // Emil
  { kidIdx: 0, title: 'Rydd rommet', rewardCents: 1000, recurrence: 'daily',
    history: ['approved', 'approved', 'approved', 'pending'] },
  { kidIdx: 0, title: 'Tøm oppvaskmaskinen', rewardCents: 1500, recurrence: 'weekly',
    daysOfWeek: [1, 3, 5], history: ['approved', 'approved'] },
  { kidIdx: 0, title: 'Øv 20 min på piano', rewardCents: 2000, recurrence: 'weekly',
    daysOfWeek: [2, 4], history: ['approved'] },
  { kidIdx: 0, title: 'Hjelp med flytting av møbler', rewardCents: 10000, recurrence: 'once',
    history: ['approved'] },

  // Sofia
  { kidIdx: 1, title: 'Stell hesten', rewardCents: 1500, recurrence: 'daily',
    history: ['approved', 'approved', 'approved', 'approved', 'pending'] },
  { kidIdx: 1, title: 'Hjelp med middag', rewardCents: 2500, recurrence: 'weekly',
    daysOfWeek: [6], history: ['approved'] },
  { kidIdx: 1, title: 'Lekselesing', rewardCents: 1200, recurrence: 'daily',
    history: ['approved', 'approved', 'approved'] },
  { kidIdx: 1, title: 'Vask bilen', rewardCents: 5000, recurrence: 'once',
    history: [] },

  // Noah
  { kidIdx: 2, title: 'Mat fisken', rewardCents: 500, recurrence: 'daily',
    history: ['approved', 'approved', 'pending'] },
  { kidIdx: 2, title: 'Lag opp seng', rewardCents: 500, recurrence: 'daily',
    history: ['approved', 'approved'] },
  { kidIdx: 2, title: 'Pakk ned skolesekken', rewardCents: 800, recurrence: 'weekly',
    daysOfWeek: [1, 2, 3, 4, 5], history: ['approved', 'approved'] },
];

async function main() {
  const db = getDb();
  console.log(`Seeding screenshot fixture for ${targetEmail}\n`);

  // 1. Find the parent.
  const parentRows = await db.select().from(parents);
  const parent = parentRows.find((p) => p.email.toLowerCase() === targetEmail);
  if (!parent) {
    console.error(`No parent found with email ${targetEmail}.\n`);
    console.error('Existing parents in DB:');
    for (const p of parentRows) console.error(`  - ${p.email} (${p.id})`);
    process.exit(2);
  }
  console.log(`✓ Found parent ${parent.id} (clerk: ${parent.clerkUserId})`);

  // 2. Get-or-create household.
  let householdId = parent.householdId;
  if (householdId) {
    const hh = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
    if (!hh[0]) householdId = null;
  }
  if (!householdId) {
    const inserted = await db
      .insert(households)
      .values({
        subscriptionTier: 'family',
        subscriptionExpiresAt: tsAt(90),
        premiumOwnerParentId: parent.id,
      })
      .returning({ id: households.id });
    householdId = inserted[0]!.id;
    await db
      .update(parents)
      .set({ householdId, updatedAt: new Date() })
      .where(eq(parents.id, parent.id));
    console.log(`✓ Created household ${householdId}`);
  } else {
    console.log(`✓ Reusing household ${householdId}`);
  }

  // 3. Force household to family tier with a 90-day runway. Removes
  // free-tier banners and matches "what a paying customer sees" — the
  // exact state we want for screenshots. Frame 10 paywall renders on
  // navigation regardless of tier.
  await db
    .update(households)
    .set({
      subscriptionTier: 'family',
      subscriptionExpiresAt: tsAt(90),
      subscriptionPeriodType: 'NORMAL',
      lifetimePaid: false,
      premiumOwnerParentId: parent.id,
      name: 'Familien Nilsen',
      updatedAt: new Date(),
    })
    .where(eq(households.id, householdId!));

  await db
    .update(parents)
    .set({
      subscriptionTier: 'family',
      subscriptionExpiresAt: tsAt(90),
      locale: 'nb-NO',
      currency: 'NOK',
      displayName: parent.displayName ?? 'Erik',
      updatedAt: new Date(),
    })
    .where(eq(parents.id, parent.id));
  console.log('✓ Household + parent flipped to family tier (90-day runway)');

  // 4. Wipe ONLY this household's content.
  console.log('\nWiping existing fixture data for this household …');
  const existingKids = await db.select().from(kids).where(eq(kids.householdId, householdId!));
  for (const k of existingKids) {
    await db.delete(balanceEntries).where(eq(balanceEntries.kidId, k.id));
    await db.delete(kidBalances).where(eq(kidBalances.kidId, k.id));
    await db.delete(kidDevices).where(eq(kidDevices.kidId, k.id));
  }
  await db.delete(pairingCodes).where(eq(pairingCodes.householdId, householdId!));
  await db.delete(rewards).where(eq(rewards.householdId, householdId!));
  await db.delete(tasks).where(eq(tasks.householdId, householdId!));
  await db.delete(kids).where(eq(kids.householdId, householdId!));
  console.log(`  removed ${existingKids.length} prior kid(s) and their data`);

  // 5. Create kids.
  const createdKidIds: string[] = [];
  for (const k of KIDS) {
    const inserted = await db
      .insert(kids)
      .values({
        householdId: householdId!,
        parentId: parent.id,
        name: k.name,
        birthYear: k.birthYear,
        avatarKey: k.avatarKey,
        pin: k.pin,
        allowanceFrequency: 'weekly',
        allowanceCents: k.allowanceCents,
        allowanceDayOfWeek: k.allowanceDayOfWeek,
      })
      .returning({ id: kids.id });
    const kidId = inserted[0]!.id;
    createdKidIds.push(kidId);
    await db.insert(kidBalances).values({ kidId, balanceCents: 0 });
    console.log(`  + ${k.name} (${k.avatarKey}) — ${kidId}`);
  }

  // 6. Tasks + completions.
  console.log('\nSeeding tasks + completions …');
  // Pending completions get varied recent-past offsets so the approvals screen
  // showcases the relative-time formatter ("akkurat nå" / "for X minutter siden"
  // / "for X timer siden") instead of all rows looking identical. Using a fixed
  // hour-of-day (e.g. 17:00 UTC) breaks when the screenshot is taken before
  // that hour — the timestamp is in the future, diff is negative, and every
  // row falls through to "akkurat nå".
  const PENDING_MINUTES_AGO = [3, 47, 135];
  let pendingCount = 0;
  let taskCount = 0;
  let completionCount = 0;
  for (const t of TASKS) {
    const kidId = createdKidIds[t.kidIdx]!;
    const inserted = await db
      .insert(tasks)
      .values({
        householdId: householdId!,
        parentId: parent.id,
        kidId,
        title: t.title,
        rewardCents: t.rewardCents,
        recurrence: t.recurrence,
        daysOfWeek: t.daysOfWeek ?? null,
        requiresApproval: true,
        active: true,
      })
      .returning({ id: tasks.id });
    const taskId = inserted[0]!.id;
    taskCount++;

    for (let i = 0; i < t.history.length; i++) {
      const slot = t.history[i]!;
      let dayOffset: number;
      let completedAtTs: Date;
      if (slot === 'pending') {
        dayOffset = 0;
        const m = PENDING_MINUTES_AGO[pendingCount % PENDING_MINUTES_AGO.length]!;
        completedAtTs = new Date(NOW.getTime() - m * 60_000);
        pendingCount++;
      } else {
        const approvedBefore = t.history.slice(0, i).filter((s) => s === 'approved').length;
        dayOffset = -(approvedBefore + 1);
        completedAtTs = tsAt(dayOffset, 17);
      }

      await db.insert(taskCompletions).values({
        taskId,
        kidId,
        scheduledFor: isoDate(dayOffset),
        completedAt: completedAtTs,
        approvedAt: slot === 'approved' ? tsAt(dayOffset, 19) : null,
        approvedBy: slot === 'approved' ? parent.id : null,
        rejectedAt: null,
        rewardCents: t.rewardCents,
      });
      completionCount++;
    }
  }
  console.log(`  ${taskCount} tasks, ${completionCount} completions`);

  // 7. Rewards — small everyday + savings goal per kid + 2 household-wide.
  console.log('\nSeeding rewards …');
  for (let i = 0; i < KIDS.length; i++) {
    const k = KIDS[i]!;
    const kidId = createdKidIds[i]!;
    await db.insert(rewards).values([
      {
        householdId: householdId!,
        parentId: parent.id,
        kidId,
        title: k.smallReward.title,
        costCents: k.smallReward.cents,
        active: true,
      },
      {
        householdId: householdId!,
        parentId: parent.id,
        kidId,
        title: k.savingsGoalTitle,
        costCents: k.savingsGoalCents,
        active: true,
      },
    ]);
  }
  await db.insert(rewards).values([
    {
      householdId: householdId!,
      parentId: parent.id,
      kidId: null,
      title: 'En helg uten oppvask',
      costCents: 25000,
      active: true,
    },
    {
      householdId: householdId!,
      parentId: parent.id,
      kidId: null,
      title: 'Velg middag på fredag',
      costCents: 7500,
      active: true,
    },
  ]);
  console.log('  3 personal + 2 household rewards');

  // 8. Balances. A few historical lines so History tab tells a story,
  // then a final adjustment that lands kid at finalBalanceCents.
  console.log('\nSeeding balance history + final balances …');
  for (let i = 0; i < KIDS.length; i++) {
    const k = KIDS[i]!;
    const kidId = createdKidIds[i]!;

    const history: {
      amount: number;
      reason: 'allowance' | 'task' | 'redemption' | 'adjustment';
      title: string;
      daysAgo: number;
    }[] = [
      { amount: k.allowanceCents, reason: 'allowance', title: 'Lommepenger', daysAgo: 14 },
      { amount: k.allowanceCents, reason: 'allowance', title: 'Lommepenger', daysAgo: 7 },
      { amount: -k.smallReward.cents, reason: 'redemption', title: k.smallReward.title, daysAgo: 5 },
    ];

    let running = 0;
    for (const h of history) {
      await db.insert(balanceEntries).values({
        kidId,
        amountCents: h.amount,
        reason: h.reason,
        referenceTitle: h.title,
        createdBy: parent.id,
        createdAt: tsAt(-h.daysAgo, 9),
      });
      running += h.amount;
    }

    const delta = k.finalBalanceCents - running;
    await db.insert(balanceEntries).values({
      kidId,
      amountCents: delta,
      reason: 'adjustment',
      referenceTitle: 'Sparing',
      createdBy: parent.id,
      createdAt: tsAt(-1, 9),
    });

    await db
      .update(kidBalances)
      .set({ balanceCents: k.finalBalanceCents, updatedAt: new Date() })
      .where(eq(kidBalances.kidId, kidId));

    console.log(
      `  ${k.name}: ${(k.finalBalanceCents / 100).toFixed(0)} kr ` +
        `(${Math.round((k.finalBalanceCents / k.savingsGoalCents) * 100)}% of ${k.savingsGoalTitle})`,
    );
  }

  // 9. One fulfilled redemption per kid so the redemption history view
  // isn't empty when reviewers tap into it.
  console.log('\nSeeding fulfilled redemptions …');
  for (let i = 0; i < KIDS.length; i++) {
    const kidId = createdKidIds[i]!;
    const rewardRows = await db.select().from(rewards).where(eq(rewards.kidId, kidId));
    const small = rewardRows.find((r) => r.title === KIDS[i]!.smallReward.title);
    if (!small) continue;
    await db.insert(rewardRedemptions).values({
      rewardId: small.id,
      kidId,
      costCents: small.costCents,
      requestedAt: tsAt(-5, 16),
      approvedAt: tsAt(-5, 17),
      fulfilledAt: tsAt(-5, 18),
    });
  }

  console.log('\n✅ Done. Next steps:');
  console.log('  • Open the parent app — 3 kids, ~11 tasks, several pending approvals.');
  console.log('  • Kid app PINs: Emil 1234, Sofia 4321, Noah 5678.');
  console.log('  • Re-run any time to reset to a clean state.\n');
}

main()
  .then(() => closeDb())
  .catch(async (err) => {
    console.error('\n❌ Seed failed:', err);
    await closeDb();
    process.exit(1);
  });
