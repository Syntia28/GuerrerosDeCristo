import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    adapter: {
      provider: "sqlite",
      url: "file:./dev.db", // tu base de datos local
    },
  },
});
