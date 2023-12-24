import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired({
  returnTo: "/",
  async middleware(req) {
    const res = NextResponse.next();
    console.log({ res });
    const user = await getSession(req, res);
    console.log({ user });
    // res.cookies.set('hl', user.language);
    return res;
  }
});

export const config = {
  matcher: ["/feed"],
};
