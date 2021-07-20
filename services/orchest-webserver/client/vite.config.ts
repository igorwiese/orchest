import path from "path";
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { vitePluginDesignSystem } from "@orchest/design-system-vite-plugin";

// https://vitejs.dev/config/
export default (conditions) =>
  defineConfig({
    plugins: [reactRefresh(), vitePluginDesignSystem()],
    server: {
      host: "0.0.0.0",
      proxy: conditions.mode === "development" && {
        "^/async/*": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") },
        {
          find: "@material",
          replacement: path.resolve(
            __dirname,
            "../../../node_modules/@material/"
          ),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ["node_modules"],
        },
      },
    },
  });
