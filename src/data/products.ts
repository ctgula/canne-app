import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Sunset Dreams',
    description: 'A vibrant digital artwork capturing the essence of golden hour with warm, flowing colors.',
    price: 25,
    artworkUrl: '/api/placeholder/400/400', // Placeholder for now
    giftSize: '3.5g',
    hasDelivery: false,
  },
  {
    id: '2',
    name: 'Ocean Waves',
    description: 'Calming blue digital art that brings the serenity of ocean waves to your space.',
    price: 40,
    artworkUrl: '/api/placeholder/400/400',
    giftSize: '7g',
    hasDelivery: true, // Free delivery starts at $40
  },
  {
    id: '3',
    name: 'Urban Jungle',
    description: 'Modern abstract piece celebrating the harmony between city life and nature.',
    price: 50,
    artworkUrl: '/api/placeholder/400/400',
    giftSize: '10g',
    hasDelivery: true,
  },
  {
    id: '4',
    name: 'Cosmic Journey',
    description: 'Explore the universe through this mesmerizing digital space art with deep purples and blues.',
    price: 65,
    artworkUrl: '/api/placeholder/400/400',
    giftSize: '14g',
    hasDelivery: true,
  },
  {
    id: '5',
    name: 'Golden Meadow',
    description: 'Premium digital artwork featuring a sun-drenched meadow with incredible detail and depth.',
    price: 140,
    artworkUrl: '/api/placeholder/400/400',
    giftSize: '28g',
    hasDelivery: true,
  },
]; 