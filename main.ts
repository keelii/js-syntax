Deno.serve(async (req) => {
  // console.log("Method:", req.method);
  //
  const url = new URL(req.url);
  console.log("Path:", url.pathname);
  // console.log("Query parameters:", url.searchParams);
  //
  // console.log("Headers:", req.headers);
  //
  // if (req.body) {
  //   const body = await req.text();
  //   console.log("Body:", body);
  // }
  switch (url.pathname) {
    case "/":
      return new Response((await Deno.open("./index.html")).readable);
    case "/index.min.js":
      return new Response((await Deno.open("./index.min.js")).readable);
    default:
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain", },
      });
  }
});


