import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Analytics & Monitoring Integration
const analyticsConfig = {
  googleAnalytics: {
    id: process.env.VITE_ANALYTICS_ID,
    config: {
      send_page_view: true,
      anonymize_ip: true,
      cookie_expires: 63072000, // 2 years
    }
  },
  
  sentry: {
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_APP_ENVIRONMENT,
    tracesSampleRate: 0.1,
    integrations: [
      'BrowserTracing',
      'Replay'
    ]
  },
  
  hotjar: {
    id: process.env.VITE_HOTJAR_ID,
    snippetVersion: 6
  }
};

export default defineConfig({
  plugins: [
    react(),
    
    // Analytics injection plugin
    {
      name: 'analytics-injection',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html) {
          // Inject Google Analytics
          if (analyticsConfig.googleAnalytics.id) {
            const gaScript = `
              <script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.googleAnalytics.id}"></script>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsConfig.googleAnalytics.id}', ${JSON.stringify(analyticsConfig.googleAnalytics.config)});
              </script>
            `;
            html = html.replace('<head>', `<head>${gaScript}`);
          }
          
          // Inject Hotjar
          if (analyticsConfig.hotjar.id) {
            const hotjarScript = `
              <script>
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${analyticsConfig.hotjar.id},hjsv:${analyticsConfig.hotjar.snippetVersion}};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              </script>
            `;
            html = html.replace('<head>', `<head>${hotjarScript}`);
          }
          
          return html;
        }
      }
    }
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});