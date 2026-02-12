
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
 base: "/SV_para_Mi_nina/", 
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        carta: resolve(__dirname, "carta/index.html"),
      },
    },
  },
});
