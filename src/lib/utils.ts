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
  // Approx conversion: 1 degree lat = 111km
  const latStep = stepKm / 111;
  // Approx conversion: 1 degree lng = 111 * cos(lat)
  const lngStep = stepKm / (111 * Math.cos(centerLat * Math.PI / 180));

  const stepsLat = Math.ceil(radiusKm / stepKm);
  const stepsLng = Math.ceil(radiusKm / stepKm);

  for (let i = -stepsLat; i <= stepsLat; i++) {
    for (let j = -stepsLng; j <= stepsLng; j++) {
      points.push({
        lat: centerLat + i * latStep,
        lng: centerLng + j * lngStep
      });
    }
  }
  return points;
}
