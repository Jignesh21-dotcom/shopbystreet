import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const newShop = await request.json();

  const filePath = path.join(process.cwd(), 'data', 'shops.json');
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const shops = JSON.parse(fileContents);

  shops.push(newShop);
  fs.writeFileSync(filePath, JSON.stringify(shops, null, 2));

  return NextResponse.json({ success: true });
}
