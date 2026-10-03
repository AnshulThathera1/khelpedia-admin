export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      {
        userAgent: "Googlebot",
        disallow: "/",
      },
      {
        userAgent: "Bingbot",
        disallow: "/",
      },
      {
        userAgent: "Applebot",
        disallow: "/",
      },
      {
        userAgent: "Baiduspider",
        disallow: "/",
      },
      {
        userAgent: "Yandex",
        disallow: "/",
      },
      {
        userAgent: "DuckDuckBot",
        disallow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        disallow: "/",
      },
      {
        userAgent: "Twitterbot",
        disallow: "/",
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
  };
}
