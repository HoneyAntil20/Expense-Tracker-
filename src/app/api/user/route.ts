import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USER_DATA_PATH = path.join(process.cwd(), 'data', 'user.json');

export async function GET() {
  try {
    if (!fs.existsSync(USER_DATA_PATH)) {
      return NextResponse.json(null);
    }
    const userData = fs.readFileSync(USER_DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(userData));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}
