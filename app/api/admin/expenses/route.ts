import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

/** Admin only — proxy.ts denies anything under /api that is not allowlisted. */
const CATEGORIES = ['Stock', 'Product Expenses', 'Rent', 'Salary', 'Delivery', 'Marketing', 'Meta Ads', 'Utilities', 'Other'];
const METHODS = ['cash', 'card'];

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a number greater than zero.' }, { status: 400 });
    }

    const category = String(body.category ?? '').trim();
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` }, { status: 400 });
    }

    const paidWith = String(body.paidWith ?? 'cash');
    if (!METHODS.includes(paidWith)) {
      return NextResponse.json({ error: 'paidWith must be cash or card.' }, { status: 400 });
    }

    // An unparseable date would silently become "now" and quietly land the
    // expense in the wrong month.
    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'That date is not valid.' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        date,
        category,
        amount: Math.round(amount * 100) / 100,
        paidWith,
        note: body.note ? String(body.note).slice(0, 500) : null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Failed to save expense:', error);
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = Number(new URL(req.url).searchParams.get('id'));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'A numeric id is required.' }, { status: 400 });
    }
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
