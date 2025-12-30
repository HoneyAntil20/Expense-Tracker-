import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const USER_DATA_PATH = path.join(process.cwd(), 'data', 'user.json');

export async function POST(request: Request) {
  try {
    const { friendEmail, amount, category, date } = await request.json();
    
    const userData = JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'));
    
    if (!process.env.RESEND_API_KEY) {
      console.log('Reminder simulation (No API Key):', { friendEmail, amount, category });
      return NextResponse.json({ success: true, message: 'Simulation: Email reminder logged to console' });
    }

    await resend.emails.send({
      from: 'ExpenseTracker <onboarding@resend.dev>',
      to: friendEmail,
      subject: `Reminder: Payment for ${category}`,
      html: `<p>Hi,</p><p><strong>${userData.name}</strong> is reminding you to pay <strong>${userData.currency}${amount}</strong> for the <strong>${category}</strong> expense on ${date}.</p><p>Please settle up soon!</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
