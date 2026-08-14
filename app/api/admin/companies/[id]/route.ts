import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { isAdminAuthenticated } from '../../../../../lib/auth';
import { hashPassword } from '../../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true, name: true, phone: true, username: true, createdAt: true,
      prices: { select: { productId: true, price: true } },
    },
  });
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(company);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { name, phone, username, password } = await req.json();
    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = String(phone).trim();
    if (username !== undefined) {
      const cleanUsername = String(username).trim();
      const existing = await prisma.company.findUnique({ where: { username: cleanUsername } });
      if (existing && existing.id !== companyId) {
        return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });
      }
      data.username = cleanUsername;
    }
    if (password) {
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      data.passwordHash = await hashPassword(String(password));
    }

    const company = await prisma.company.update({ where: { id: companyId }, data });
    return NextResponse.json({ id: company.id, name: company.name });
  } catch (error) {
    console.error('Failed to update company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.company.delete({ where: { id: companyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
