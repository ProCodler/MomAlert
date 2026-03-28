import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'all' | 'flagged' | 'HIGH' | 'CRITICAL'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let where: any = {};
  if (filter === 'flagged') {
    where = { flagged: true };
  } else if (filter === 'HIGH') {
    where = { riskLevel: 'HIGH' };
  } else if (filter === 'CRITICAL') {
    where = { riskLevel: 'CRITICAL' };
  } else if (filter === 'urgent') {
    where = { riskLevel: { in: ['HIGH', 'CRITICAL'] } };
  } else if (filter === 'MEDIUM') {
    where = { riskLevel: 'MEDIUM' };
  } else if (filter === 'LOW') {
    where = { riskLevel: 'LOW' };
  }

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(sessions);
}
