import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAdminAuthenticated } from '../../../../lib/auth';
import { hashPassword } from '../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, phone: true, username: true, createdAt: true,
      _count: { select: { orders: true, prices: true } },
    },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, phone, username, password } = await req.json();
    const cleanName = String(name ?? '').trim();
    const cleanPhone = String(phone ?? '').trim();
    const cleanUsername = String(username ?? '').trim();

    if (!cleanName || !cleanPhone || !cleanUsername || !password) {
      return NextResponse.json({ error: 'Name, phone, username and password are all required.' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        username: cleanUsername,
        passwordHash: await hashPassword(String(password)),
      },
    });

    return NextResponse.json({ id: company.id, name: company.name }, { status: 201 });
  } catch (error) {
    console.error('Failed to create company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
