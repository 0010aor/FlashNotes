import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite(), tsconfigPaths(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			},
			devOptions: {
			  enabled: true, //only keep as true while developing, not in production
			},
			includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
			  name: 'Flash-Notes',
			  short_name: 'Flash-Notes',
			  description: 'Study flashcards online or offline, even as a guest!',
			  theme_color: '#ffffff', 
			  background_color: '#ffffff',
			  display: 'standalone',
			  start_url: '/',
			  icons: [
				{
				  src: '/web-app-manifest-192x192.png',
				  sizes: '192x192',
				  type: 'image/png',
				},
				{
				  src: '/web-app-manifest-512x512.png',
				  sizes: '512x512',
				  type: 'image/png',
				},
				{
				  src: '/web-app-manifest-512x512.png',
				  sizes: '512x512',
				  type: 'image/png',
				  purpose: 'any maskable',
				},
			  ],
			},
		  })
	],
	server: {
		watch: {
			usePolling: true,
		},
	},
	build: {
		chunkSizeWarningLimit: 800,
		rollupOptions: {
			output: {
				manualChunks: {
					chakra: ["@chakra-ui/react", "@emotion/react"],
					tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
					vendor: ["react", "react-dom", "react-hook-form"],
					icons: ["react-icons"],
					editor: ["@tiptap/react", "@tiptap/starter-kit"],
				},
			},
		},
	},
});
