import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gazie Commute',
    short_name: 'Gazie',
    description: 'Verified & safe shared rides for Abuja commuters',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF7EE',
    theme_color: '#FBF7EE',
    icons: [
      {
        src: '/brand/gazie-commute-icon.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  };
}
