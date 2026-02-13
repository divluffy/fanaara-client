// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,

  /* config options here */
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  devIndicators: false,
  images: {
    domains: [
      "encrypted-tbn0.gstatic.com",
      "images.alphacoders.com",
      "images3.alphacoders.com",
      "images5.alphacoders.com",
      "mfiles.alphacoders.com",
      "i.pravatar.cc",
      "images.unsplash.com",
      "picsum.photos",
      "alphacoders.com",
      "source.unsplash.com",
      "picfiles.alphacoders.com",
      "images4.alphacoders.com",
      "avatarfiles.alphacoders.com",
      "images2.alphacoders.com",
      "giffiles.alphacoders.com",
      "media2.giphy.com",
      "media4.giphy.com",
      "upload.wikimedia.org",
      "wallpapers.com",
      "s4.anilist.co",
      "cdn.myanimelist.net",
      "randomuser.me",
      "api.dicebear.com",
      "images8.alphacoders.com",
      "images7.alphacoders.com",
      "i.pinimg.com",
      "images6.alphacoders.com",
      "placehold.co",
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL}/api/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
