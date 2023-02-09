type ObsInputKind =
	| 'decklink-input'
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
	| 'text_gdiplus_v2'
	| 'dshow_input'
	| 'window_capture'
	| 'text_ft2_source_v2';

type SceneItemKind = ObsInputKind | 'group' | 'scene'

type SceneItemRef = {
	sceneName: string;
	sceneItemId: number;
	sourceName: string;
};
type Viewport = {
	name: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rows: number;
	columns: number;
	assignedFeeds: (SceneItemRef &
		Crop & {
			kind: SceneItemKind;
			width: number;
			height: number;
			x: number;
			y: number;
      scaleX: number;
			boundsWidth: number;
			boundsHeight: number;
		})[];
};
type ObsSceneItem = {
	inputKind: null | ObsInputKind;
	isGroup: null | boolean;
	sceneItemBlendMode: ObsBlendMode;
	sceneItemEnabled: boolean;
	sceneItemId: number;
	sceneItemIndex: number;
	sceneItemLocked: boolean;
	sceneItemTransform: ObsSceneItemTransform;
	sourceName: string;
	sourceType: 'OBS_SOURCE_TYPE_INPUT' | 'OBS_SOURCE_TYPE_SCENE';
};
type ObsSceneItemTransform = {
	positionX: number;
	positionY: number;
	alignment: ObsAlignment;
	rotation: number;
	scaleX: number;
	scaleY: number;
	cropTop: number;
	cropRight: number;
	cropBottom: number;
	cropLeft: number;
	boundsType: ObsBoundsType;
	boundsAlignment: ObsAlignment;
	boundsWidth: number;
	boundsHeight: number;
	sourceWidth: number;
	sourceHeight: number;
	width: number;
	height: number;
};
type ObsAlignment = 5 | 4 | 6 | 1 | 0 | 2 | 9 | 8 | 10;
type ObsBoundsType =
	| 'OBS_BOUNDS_STRETCH'
	| 'OBS_BOUNDS_SCALE_INNER'
	| 'OBS_BOUNDS_SCALE_OUTER'
	| 'OBS_BOUNDS_SCALE_TO_WIDTH'
	| 'OBS_BOUNDS_SCALE_TO_HEIGHT'
	| 'OBS_BOUNDS_MAX_ONLY'
	| 'OBS_BOUNDS_NONE';
type ObsBlendMode =
	| 'OBS_BLEND_NORMAL'
	| 'OBS_BLEND_ADDITIVE'
	| 'OBS_BLEND_SUBTRACT'
	| 'OBS_BLEND_SCREEN'
	| 'OBS_BLEND_MULTIPLY'
	| 'OBS_BLEND_LIGHTEN'
	| 'OBS_BLEND_DARKEN';
type Crop = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};
