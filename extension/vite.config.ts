import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import hotReloadExtension from "hot-reload-extension-vite";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			tailwindcss(),
			hotReloadExtension({
				log: true,
				backgroundPath: "src/pages/background/index.ts",
			}),
			viteStaticCopy({
				targets: [
					{
						src: "manifest.json",
						dest: ".",
					},
					{
						src: "src/style.css",
						dest: "./",
					},
				],
			}),
		],
		build: {
			rollupOptions: {
				input: {
					popup: resolve(__dirname, "src/pages/popup/index.html"),
					content: resolve(__dirname, "src/pages/content/index.ts"),
					background: resolve(__dirname, "src/pages/background/index.ts"),
				},
				output: {
					dir: "dist",
					entryFileNames: "src/[name]/index.js",
					chunkFileNames: "assets/js/[name].js",
				},
			},
		},
	};
});
