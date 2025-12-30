import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'expenses.json');

const getExpenses = () => {
  if (!fs.existsSync(DATA_PATH)) return [];
  const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(fileData);
};

const saveExpenses = (expenses: any[]) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(expenses, null, 2));
};

export async function GET() {
  try {
    const expenses = getExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expenses = getExpenses();
    
    const newExpense = {
      ...body,
      id: Date.now().toString(),
      amount: parseFloat(body.amount),
    };

    expenses.unshift(newExpense);
    saveExpenses(expenses);

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const expenses = getExpenses();
    
    const index = expenses.findIndex((e: any) => e.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    expenses[index] = {
      ...body,
      amount: parseFloat(body.amount),
    };
    
    saveExpenses(expenses);
    return NextResponse.json(expenses[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    let expenses = getExpenses();
    expenses = expenses.filter((e: any) => e.id !== id);
    
    saveExpenses(expenses);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
