/**
 * Loại tracking: screen (màn hình), body (cân nặng, nước, ...)
 */
export enum TrackingType {
  SCREEN = "screen",
  BODY = "body",
}

export const TRACKING_TYPES = Object.values(TrackingType);

/**
 * Khi type = body: metric (cân nặng, nước, ...)
 */
export enum Metric {
  WEIGHT = "weight",
  WATER = "water",
}

export const METRICS = Object.values(Metric);
