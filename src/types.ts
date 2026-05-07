/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  website: string;
  rating: number;
  reviews: number;
  category: string;
  openingHours?: string;
  plusCode?: string;
  claimed?: boolean;
  socials?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  emails?: string[];
  coordinate?: {
    lat: number;
    lng: number;
  };
}

export interface SearchConfig {
  niche: string;
  city: string;
  radiusKm: number;
  gridStepKm: number;
  deepExtract: boolean;
  model: string;
}

export interface SearchProgress {
  totalFound: number;
  totalRaw: number;
  withEmail: number;
  currentGridPoint: number;
  totalGridPoints: number;
  status: 'idle' | 'searching' | 'completed' | 'error';
  message: string;
  currentCoord?: { lat: number; lng: number };
}
