# Vercel Deployment Plan

## Vite Configuration Updates

The `vite.config.ts` needs to be updated with the following optimizations:

```typescript
// Proposed vite.config.ts structure
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Path aliases remain unchanged
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Build optimizations
    build: {
      // Enable minification
      minify: "terser",

      // Configure chunks
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["@mui/material", "@emotion/react", "@emotion/styled"],
            charts: ["recharts", "@mui/x-charts"],
          },
        },
      },

      // Enable source maps for production debugging if needed
      sourcemap: true,

      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
      },
    },

    // Remove development proxy configuration
    // The API URL will be handled by environment variables
  };
});
```

### Key Changes:

1. **Environment Handling**

   - Added `loadEnv` to properly handle environment variables
   - Converted config to a function to access mode

2. **Build Optimizations**

   - Added Terser minification
   - Configured manual chunk splitting for better caching
   - Enabled source maps for production debugging
   - Optimized dependency bundling

3. **Removed Development Settings**

   - Removed the proxy configuration as it's not needed in production
   - API calls will use the `VITE_API_URL` environment variable directly

4. **Path Aliases**
   - Maintained the existing path alias configuration for `@`

## Next Steps

After implementing these Vite configuration changes, we should:

1. Update the environment variables in Vercel's project settings
2. Create a `vercel.json` configuration file
3. Set up proper build commands in Vercel

Would you like me to switch to Code mode to implement these changes to the `vite.config.ts` file?
