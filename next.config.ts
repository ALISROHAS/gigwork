import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false, // Должно быть false
  // partialPrefetching: false, // Можно добавить или убрать
};

export default nextConfig;