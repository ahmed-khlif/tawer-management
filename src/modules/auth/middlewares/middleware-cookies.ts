import { NextRequest, NextResponse } from "next/server";

export function setupResponseCookies(req: NextRequest, res: NextResponse) {
  //set up private access cookie if need
  if (req.cookies.get("tat"))
    res.cookies.set("tat", req.cookies.get("tat")?.value as string, {
      httpOnly: true,
    });
}
