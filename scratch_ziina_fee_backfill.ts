import { PrismaClient } from '@prisma/client';
import { estimateZiinaFee } from './lib/ziina';
const prisma = new PrismaClient();

// Dry run (default): npx tsx scratch_ziina_fee_backfill.ts
// Actually writes the expenses:  APPLY=1 npx tsx scratch_ziina_fee_backfill.ts
//
// One-off: books the estimated Ziina fee for every order that was already
// marked Fulfilled before logZiinaFeeOnce (lib/ziina.ts) existed to do it
// automatically. Safe to re-run — skips any order that already has a
// 'Payment Fees' expense logged for it.
async function main() {
  const orders = await prisma.order.findMany({
    where: { fulfillment: 'Fulfilled', paymentIntentId: { not: null } },
    select: { id: true, total: true, createdAt: true },
  });

  const toCreate: { id: number; total: number; createdAt: Date; fee: number }[] = [];
  for (const order of orders) {
    const note = `Ziina fee — Order #${order.id}`;
    const existing = await prisma.expense.findFirst({ where: { category: 'Payment Fees', note } });
    if (existing) continue;
    toCreate.push({ ...order, fee: estimateZiinaFee(order.total) });
  }

  const totalFee = Math.round(toCreate.reduce((s, o) => s + o.fee, 0) * 100) / 100;
  console.log(`${orders.length} fulfilled card order(s) found.`);
  console.log(`${toCreate.length} of them have no Payment Fees expense yet, totalling ${totalFee} AED.`);

  if (process.env.APPLY !== '1') {
    console.log('Dry run only — nothing written. Re-run with APPLY=1 to create the expenses.');
    return;
  }

  for (const order of toCreate) {
    await prisma.expense.create({
      data: {
        date: order.createdAt,
        category: 'Payment Fees',
        amount: order.fee,
        paidWith: 'card',
        note: `Ziina fee — Order #${order.id}`,
      },
    });
  }
  console.log(`Created ${toCreate.length} Payment Fees expense(s).`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
