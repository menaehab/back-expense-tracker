import { NextRequest, NextResponse } from "next/server";
import { useUserStore } from "./store/user-state";
const authPages = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = authPages.includes(pathname);

  let isLoggedIn = false;

  const cookie = request.headers.get("cookie") || "";
  const referer = request.headers.get("referer") || request.nextUrl.origin;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: cookie,
          Referer: referer,
        },
      },
    );

    isLoggedIn = response.status === 200;
  } catch (error) {
    console.error("Middleware Auth Verification Error:", error);
    isLoggedIn = false;
  }

  // authenticated
  if (isLoggedIn) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // guest
  if (!isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
