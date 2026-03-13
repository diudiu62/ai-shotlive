/**
 * 模型适配器统一导出
 */

export * from './chatAdapter';
import * as imageAdapter from './imageAdapter';
import * as videoAdapter from './videoAdapter';

export const isImageAspectRatioSupported = imageAdapter.isAspectRatioSupported;
export const isVideoAspectRatioSupported = videoAdapter.isAspectRatioSupported;
export const isDurationSupported = videoAdapter.isDurationSupported;
export const callImageApi = imageAdapter.callImageApi;
export const callVideoApi = videoAdapter.callVideoApi;
