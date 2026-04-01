// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    return NextResponse.json({ 
      success: true, 
      user: userData,
      token: 'simulate-jwt-token' // In a production app, use a real JWT
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
