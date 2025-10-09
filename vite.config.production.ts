import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    
    // Bundle analyzer for production builds
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Production optimizations
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // Disable source maps in production for security
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          
          // Feature chunks
          booking: [
            './src/components/BookingForm.tsx',
            './src/components/BookingWizard.tsx',
            './src/components/VehicleSelector.tsx'
          ],
          trips: [
            './src/components/TripCard.tsx',
            './src/components/LiveTripTracker.tsx',
            './src/components/TripRating.tsx'
          ],
          wallet: [
            './src/components/WalletBalance.tsx',
            './src/components/WalletSettings.tsx',
            './src/components/WalletAnalytics.tsx'
          ],
        },
        
        // Consistent chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Development server config (for reference)
  server: {
    port: 8080,
    host: true,
    strictPort: false,
  },
  
  // Preview server config
  preview: {
    port: 4173,
    host: true,
  },
  
  // Environment variable handling
  envPrefix: 'VITE_',
  
  // CSS optimization
  css: {
    devSourcemap: false,
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});