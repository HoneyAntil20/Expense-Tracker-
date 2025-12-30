import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'expenses.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
    const expenses = JSON.parse(fileData);
    const total = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    return NextResponse.json({ total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate total' }, { status: 500 });
  }
}
