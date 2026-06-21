import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'ziina_enabled' }
    });
    
    // Default to true if not set
    const isEnabled = setting ? setting.value === 'true' : true;
    
    return NextResponse.json({ ziinaEnabled: isEnabled });
  } catch (error) {
    return NextResponse.json({ ziinaEnabled: false });
  }
}
