import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** Directory containing this config (`tawer-management/`), not a parent folder with another lockfile. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Silence “multiple lockfiles” + fix standalone/trace roots when a lockfile exists higher up (e.g. user home).
  outputFileTracingRoot: projectRoot,
  env: {
    company_name: "Tawer MNG",
    BACKEND_ADDRESS:
      process.env.BACKEND_ADDRESS ??
      process.env.NEXT_PUBLIC_API_URL ??
      "https://api-management.tawer.tn",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.BACKEND_ADDRESS ??
      "https://api-management.tawer.tn",
    NTFY_SERVICE_URL: "https://ntfy.tdg.tn",
    COUNTRY_CODE: "TN",
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV ?? "prod",

    //FIREBASE ENV
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCPs1NqOiDCfuAhM3Xt8dQLOs2G5P8jW-8",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "tawer-digital-group.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "tawer-digital-group",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "tawer-digital-group.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "192674173616",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:192674173616:web:88355bbee54b4ed605a175",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-25EKW89YZ0"

  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: "bundui-images.netlify.app"
      }
    ]
  }
};

export default withNextIntl(nextConfig);
