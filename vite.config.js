
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/SV_para_Mi_nina/" : "/",
}));
