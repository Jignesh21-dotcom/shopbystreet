import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.slug || !body.citySlug || !body.provinceSlug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'streets.json');
    const file = fs.readFileSync(filePath, 'utf-8');
    const streets = JSON.parse(file);

    const alreadyExists = streets.some((s: any) => s.slug === body.slug);
    if (alreadyExists) {
      return NextResponse.json({ error: 'Street already exists' }, { status: 409 });
    }

    const updated = [...streets, {
      name: body.name,
      slug: body.slug,
      citySlug: body.citySlug,
      provinceSlug: body.provinceSlug
    }];

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save street' }, { status: 500 });
  }
}
