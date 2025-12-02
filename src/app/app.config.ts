// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
// };

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          prefix: 'p',
          darkModeSelector: '.app-dark',
          cssLayer: false
        }
      }
    })
  ]
};

// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { providePrimeNG } from 'primeng/config';
// import { definePreset } from '@primeuix/themes';
// import Aura from '@primeuix/themes/aura';
// import { routes } from './app.routes';

// // Preset customizado Reva Studios
// const RevaPreset = definePreset(Aura, {
//   semantic: {
//     primary: {
//       50: '{purple.50}',
//       100: '{purple.100}',
//       200: '{purple.200}',
//       300: '{purple.300}',
//       400: '{purple.400}',
//       500: '{purple.500}',
//       600: '{purple.600}',
//       700: '{purple.700}',
//       800: '{purple.800}',
//       900: '{purple.900}',
//       950: '{purple.950}'
//     },
//     colorScheme: {
//       light: {
//         primary: {
//           color: '#7c3aed',
//           contrastColor: '#ffffff',
//           hoverColor: '#6b21a8',
//           activeColor: '#5b21b6'
//         },
//         highlight: {
//           background: '#7c3aed',
//           focusBackground: '#6b21a8',
//           color: '#ffffff',
//           focusColor: '#ffffff'
//         }
//       },
//       dark: {
//         primary: {
//           color: '#a855f7',
//           contrastColor: '#ffffff',
//           hoverColor: '#8b5cf6',
//           activeColor: '#7c3aed'
//         },
//         highlight: {
//           background: 'rgba(168, 85, 247, 0.16)',
//           focusBackground: 'rgba(168, 85, 247, 0.24)',
//           color: 'rgba(255,255,255,.87)',
//           focusColor: 'rgba(255,255,255,.87)'
//         }
//       }
//     }
//   }
// });

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideAnimationsAsync(),
//     providePrimeNG({
//       theme: {
//         preset: RevaPreset,
//         options: {
//           prefix: 'p',
//           darkModeSelector: '.app-dark',
//           cssLayer: false
//         }
//       }
//     })
//   ]
// };
