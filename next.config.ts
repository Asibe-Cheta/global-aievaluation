import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin content forms (lesson case studies, practice tasks, etc.)
      // upload files up to 20MB (see MAX_FILE_BYTES in lib/actions/admin-*.ts)
      // over server actions, but Next's default body limit is 1MB — raise it
      // to match, plus headroom for multipart/form-data overhead.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
