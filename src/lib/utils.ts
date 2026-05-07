/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Calculates a grid of coordinates around a center point.
 */
export function generateGrid(centerLat: number, centerLng: number, radiusKm: number, stepKm: number) {
  const points = [];
  const latStep = stepKm / 111;
  const lngStep = stepKm / (111 * Math.cos(centerLat * Math.PI / 180));
  const steps = Math.ceil(radiusKm / stepKm);

  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      // Euclidean distance in km — skip points outside the circle
      if (Math.sqrt((i * stepKm) ** 2 + (j * stepKm) ** 2) > radiusKm) continue;
      points.push({
        lat: centerLat + i * latStep,
        lng: centerLng + j * lngStep,
      });
    }
  }
  return points;
}
