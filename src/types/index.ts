export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string; // For video preview
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
}

export interface HeroSettings {
  slides: HeroSlide[];
  autoplay: boolean;
  interval: number;
}

export interface MediaUploadResponse {
  url: string;
  thumbnailUrl?: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}