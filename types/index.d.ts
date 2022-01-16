type obsSourceType =
  | 'wasapi_input_capture'
  | 'wasapi_output_capture'
  | 'browser_source'
  | 'color_source_v3'
  | 'monitor_capture'
  | 'game_capture'
  | 'image_source'
  | 'slideshow'
  | 'ffmpeg_source'
  | 'ndi_source'
  | 'scene'
  | 'text_gdiplus_v2'
  | 'dshow_input'
  | 'window_capture'
  | 'group'
  | 'text_ft2_source_v2';

type sceneItemRef = { 'scene-name': string; item: { id: number } };
type viewport = {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
