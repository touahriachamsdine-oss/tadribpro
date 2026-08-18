import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'تادريب برو | منصة التكوين المتواصل',
    short_name: 'TadribPro',
    description: 'المنصة الوطنية للتكوين المتواصل للموظفين والتربصات - الجزائر',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fbf8f3',
    theme_color: '#3E5C46',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}