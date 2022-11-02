import obsWebsocketJs from 'obs-websocket-js';
import { icons } from './icons';

const autocropThreshold = 35;
const gdqGreen = [1, 128, 1];
const gdqGreen2 = [0, 255, 0];
let screenshotBase64 = '';

let connectedToOBS = false;
let obsConnectionError = '';
let obsUpdateTimeout: NodeJS.Timeout | null = null;
let cropItem: null | (SceneItemRef & Crop & { width: number; height: number }) =
	null;
let cropSide: 'left' | 'right' | 'top' | 'bottom' | null = null;
let targetCrop: Crop | null = null;
let initialCrop: Crop | null = null;
let scale = 1;
let cropWidthSide: 'left' | 'right' | null = null;
let cropHeightSide: 'top' | 'bottom' | null = null;
let clickLoc = { clientX: 0, clientY: 0 };
let activelyCropping = false;
let currentSceneViewports: Viewport[] = [];
let unassignedFeeds: Viewport['assignedFeeds'] = [];
let currentSceneFeedScenes: string[] = [];
let videoFeeds: ObsSceneItem[] = [];
let selectedFeedsScene = '';
let pgm: string;
let pvw: string | null;
let subscribed = false;
let inInit = false;
let obsPort = 4455;
let obsPassword = '';
if (localStorage.getItem('obsPort'))
	obsPort = parseInt(localStorage.getItem('obsPort')!);
if (localStorage.getItem('obsPassword'))
	obsPassword = localStorage.getItem('obsPassword')!;

//setup cropping controls
const cropDiv = document.getElementById('primary-crop') as HTMLDivElement;
const cropFrame = document.getElementById('crop-frame') as HTMLDivElement;
const cropImg = document.getElementById('crop-image') as HTMLImageElement;
const cropGuide = document.getElementById('crop-guide') as HTMLDivElement;
type SvgPathInHtml = HTMLElement & SVGPathElement;
const croppedSvg = document.getElementById('cropped') as SvgPathInHtml;
const cropOutline = document.getElementById('crop-outline') as HTMLDivElement;

//hotkeys:
document.onkeydown = (e) => {
	if (cropItem) {
		if (e.key == 'ArrowUp' && e.shiftKey == true && e.altKey == false) {
			stepChange('top', -1);
		}
		if (e.key == 'ArrowUp' && e.shiftKey == false && e.altKey == true) {
			stepChange('bottom', 1);
		}
		if (e.key == 'ArrowLeft' && e.shiftKey == true && e.altKey == false) {
			stepChange('left', -1);
		}
		if (e.key == 'ArrowLeft' && e.shiftKey == false && e.altKey == true) {
			stepChange('right', 1);
		}
		if (e.key == 'ArrowRight' && e.shiftKey == true && e.altKey == false) {
			stepChange('left', 1);
		}
		if (e.key == 'ArrowRight' && e.shiftKey == false && e.altKey == true) {
			stepChange('right', -1);
		}
		if (e.key == 'ArrowDown' && e.shiftKey == true && e.altKey == false) {
			stepChange('top', 1);
		}
		if (e.key == 'ArrowDown' && e.shiftKey == false && e.altKey == true) {
			stepChange('bottom', -1);
		}
		if (cropSide && e.shiftKey == false && e.altKey == false) {
			if (e.key == 'ArrowUp' && cropSide == 'top') {
				stepChange('top', -1);
			}
			if (e.key == 'ArrowUp' && cropSide == 'bottom') {
				stepChange('bottom', 1);
			}
			if (e.key == 'ArrowDown' && cropSide == 'top') {
				stepChange('top', 1);
			}
			if (e.key == 'ArrowDown' && cropSide == 'bottom') {
				stepChange('bottom', -1);
			}
			if (e.key == 'ArrowLeft' && cropSide == 'left') {
				stepChange('left', -1);
			}
			if (e.key == 'ArrowLeft' && cropSide == 'right') {
				stepChange('right', 1);
			}
			if (e.key == 'ArrowRight' && cropSide == 'left') {
				stepChange('left', 1);
			}
			if (e.key == 'ArrowRight' && cropSide == 'right') {
				stepChange('right', -1);
			}
		}
	}
};
function initZoomDirs() {
	document.querySelectorAll('.zoom').forEach((elem) => {
		const zoom = elem as HTMLImageElement;
		const side = zoom.parentElement!.id.slice(0, -5) as
			| 'left'
			| 'right'
			| 'top'
			| 'bottom';
		if (cropSide == side) {
			zoom.src = icons.zoomOut;
		} else zoom.src = icons.zoomIn;
	});
}
document.querySelectorAll('.handle').forEach((elem) => {
	const handle = elem as HTMLElement;
	handle.onmousedown = (e) => {
		if (e.button == 0) {
			clickLoc = { clientX: e.clientX, clientY: e.clientY };
			cropWidthSide = null;
			if (handle.classList.contains('left')) cropWidthSide = 'left';
			if (handle.classList.contains('right')) cropWidthSide = 'right';
			cropHeightSide = null;
			if (handle.classList.contains('top')) cropHeightSide = 'top';
			if (handle.classList.contains('bottom')) cropHeightSide = 'bottom';
			if (cropItem) {
				initialCrop = {
					left: cropItem.left,
					right: cropItem.right,
					top: cropItem.top,
					bottom: cropItem.bottom,
				};
			} else initialCrop = null;
		}
	};
});
document.querySelectorAll('.zoom').forEach((elem) => {
	const zoom = elem as HTMLImageElement;
	zoom.src = icons.zoomIn;
	const side = zoom.parentElement!.id.slice(0, -5) as
		| 'left'
		| 'right'
		| 'top'
		| 'bottom';
	zoom.onclick = () => {
		if (cropSide != side) {
			cropSide = side;
			refreshCropImage();
		} else {
			cropSide = null;
			refreshCropImage();
		}
	};
});
document.querySelectorAll('.plus').forEach((elem) => {
	const plus = elem as HTMLImageElement;
	const side = plus.parentElement!.id.slice(0, -5) as
		| 'left'
		| 'right'
		| 'top'
		| 'bottom';
	switch (side) {
		case 'top':
			plus.src = icons.down;
			break;
		case 'bottom':
			plus.src = icons.up;
			break;
		case 'left':
			plus.src = icons.right;
			break;
		case 'right':
			plus.src = icons.left;
			break;
	}
	plus.onclick = () => {
		//stepChange(side, 1);
	};
});
document.querySelectorAll('.minus').forEach((elem) => {
	const minus = elem as HTMLImageElement;
	const side = minus.parentElement!.id.slice(0, -5) as
		| 'left'
		| 'right'
		| 'top'
		| 'bottom';
	switch (side) {
		case 'top':
			minus.src = icons.up;
			break;
		case 'bottom':
			minus.src = icons.down;
			break;
		case 'left':
			minus.src = icons.left;
			break;
		case 'right':
			minus.src = icons.right;
			break;
	}
	minus.onclick = () => {
		//stepChange(side, -1);
	};
});
function stepChange(side: 'left' | 'right' | 'top' | 'bottom', change: 1 | -1) {
	if (!cropItem) {
		obsError('step crop error');
		return;
	}
	let targetCrop = cropItem[side] + change;
	const sourceSize =
		side == 'left' || side == 'right' ? cropItem.width : cropItem.height;
	let oppositeCrop = 0;
	switch (side) {
		case 'left':
			oppositeCrop = cropItem.right;
			break;
		case 'right':
			oppositeCrop = cropItem.left;
			break;
		case 'top':
			oppositeCrop = cropItem.bottom;
			break;
		case 'bottom':
			oppositeCrop = cropItem.top;
			break;
	}
	if (targetCrop + oppositeCrop > sourceSize)
		targetCrop = sourceSize - oppositeCrop - 1;
	if (targetCrop < 0) targetCrop = 0;
	if (targetCrop != cropItem[side]) {
		const newCrop: Partial<ObsSceneItemTransform> = {
			cropLeft: Math.round(cropItem.left),
			cropRight: Math.round(cropItem.right),
			cropTop: Math.round(cropItem.top),
			cropBottom: Math.round(cropItem.bottom),
		};
		const cropTranslate = {
			left: 'cropLeft',
			right: 'cropRight',
			top: 'cropTop',
			bottom: 'cropBottom',
		} as const;
		newCrop[cropTranslate[side]] = targetCrop;
		obs
			.call('SetSceneItemTransform', {
				sceneName: cropItem.sceneName,
				sceneItemId: cropItem.sceneItemId,
				sceneItemTransform: newCrop,
			})
			.then(() => {
				if (cropItem) cropItem[side] = targetCrop;
				refreshCropImage();
			})
			.catch(obsError);
	}
}
const controlsMove = (e: MouseEvent) => {
	if ((!cropWidthSide && !cropHeightSide) || !cropItem) return;
	let xDiff = 0;
	let yDiff = 0;
	targetCrop = initialCrop
		? {
				left: initialCrop.left,
				right: initialCrop.right,
				top: initialCrop.top,
				bottom: initialCrop.bottom,
		  }
		: { left: 0, right: 0, top: 0, bottom: 0 };
	if (cropWidthSide) {
		xDiff = Math.round((e.clientX - clickLoc.clientX) / scale);
		if (cropWidthSide == 'right') {
			targetCrop.right -= xDiff;
			if (targetCrop.right < 0) targetCrop.right = 0;
			if (targetCrop.right + targetCrop.left >= cropItem.width - 10)
				targetCrop.right = cropItem.width - targetCrop.left - 10;
		} else {
			targetCrop.left += xDiff;
			if (targetCrop.left < 0) targetCrop.left = 0;
			if (targetCrop.right + targetCrop.left >= cropItem.width - 10)
				targetCrop.left = cropItem.width - targetCrop.right - 10;
		}
	}
	if (cropHeightSide) {
		yDiff = Math.round((e.clientY - clickLoc.clientY) / scale);
		if (cropHeightSide == 'bottom') {
			targetCrop.bottom -= yDiff;
			if (targetCrop.bottom < 0) targetCrop.bottom = 0;
			if (targetCrop.bottom + targetCrop.top >= cropItem.height - 10)
				targetCrop.bottom = cropItem.height - targetCrop.top - 10;
		} else {
			targetCrop.top += yDiff;
			if (targetCrop.top < 0) targetCrop.top = 0;
			if (targetCrop.bottom + targetCrop.top >= cropItem.height - 10)
				targetCrop.top = cropItem.height - targetCrop.bottom - 10;
		}
	}
	cropItemToTarget();
};
const controlsStop = () => {
	cropWidthSide = null;
	cropHeightSide = null;
	initialCrop = null;
};
document.onmousemove = controlsMove;
document.onmouseup = controlsStop;
function cropItemToTarget(check?: 'check') {
	if (!cropItem || !targetCrop) {
		obsError("Can't crop without item and crop");
		activelyCropping = false;
		return;
	}
	if (activelyCropping && !check) return;
	activelyCropping = true;
	if (
		targetCrop.left != cropItem.left ||
		targetCrop.right != cropItem.right ||
		targetCrop.top != cropItem.top ||
		targetCrop.bottom != cropItem.bottom
	) {
		const newTransform: Partial<ObsSceneItemTransform> = {
			cropLeft: targetCrop.left,
			cropRight: targetCrop.right,
			cropTop: targetCrop.top,
			cropBottom: targetCrop.bottom,
		};
		obs
			.call('SetSceneItemTransform', {
				sceneName: cropItem.sceneName,
				sceneItemId: cropItem.sceneItemId,
				sceneItemTransform: newTransform,
			})
			.then(() => {
				if (cropItem && targetCrop) {
					cropItem.left = targetCrop.left;
					cropItem.right = targetCrop.right;
					cropItem.top = targetCrop.top;
					cropItem.bottom = targetCrop.bottom;
				}
				refreshCropImage();
				setTimeout(() => {
					cropItemToTarget('check');
				}, 30);
			})
			.catch(obsError);
	} else activelyCropping = false;
}
document.getElementById('camera-crop')!.onclick = () => {
	cropViewportFeed('camera');
};
document.getElementById('game1-crop')!.onclick = () => {
	cropViewportFeed('game1');
};
document.getElementById('game2-crop')!.onclick = () => {
	cropViewportFeed('game2');
};

function obsError(err: any) {
	document.getElementById('footer')!.innerHTML =
		'ERROR: ' + JSON.stringify(err);
	document.getElementById('footer')!.onclick = refreshFooter;
	console.error(err);
}
function hideWarning() {
	document.getElementById('warning')!.classList.add('hide');
}
function showWarning(msg: string) {
	document.getElementById('warning-msg')!.innerHTML = msg;
	document.getElementById('warning')!.classList.remove('hide');
}

const obs = new obsWebsocketJs();
function connectToOBS() {
	obsConnectionError = '';
	showWarning('Connecting dashboard to OBS');
	obs
		.connect(`ws://127.0.0.1:${obsPort}`, obsPassword)
		.then(() => {
			connectedToOBS = true;
			hideWarning();
			initOBS();
		})
		.catch((err) => {
			if (err?.error) err = err.error;
			obsConnectionError = err;
			showWarning('Connection error: ' + err);
			refreshFooter();
		});
}
connectToOBS();
refreshFooter();

obs.on('ConnectionClosed', () => {
	if (!obsConnectionError) showWarning('OBS connection closed.');
	connectedToOBS = false;
	refreshFooter();
});

const reInitEvents = [
	'CurrentPreviewSceneChanged',
	'StudioModeStateChanged',
	'CurrentSceneCollectionChanged',
	'SceneCreated',
	'SceneRemoved',
	'SceneNameChanged',
	'InputCreated',
	'InputRemoved',
	'InputNameChanged',
	'SceneItemCreated',
	'SceneItemRemoved',
	'SceneItemListReindexed',
	'SceneItemTransformChanged',
] as const;

function subscribeToChanges() {
	if (!subscribed)
		for (let i = 0; i < reInitEvents.length; i++) {
			obs.on(reInitEvents[i], () => {
				if (obsUpdateTimeout) {
					clearTimeout(obsUpdateTimeout);
				}
				obsUpdateTimeout = setTimeout(() => {
					initOBS();
				}, 200);
			});
		}
	subscribed = true;
}
function unsubscribeToChanges() {
	for (let i = 0; i < reInitEvents.length; i++) {
		obs.off(reInitEvents[i], initOBS);
	}
	subscribed = false;
}
subscribeToChanges();

/* obs.on('SceneItemEnableStateChanged', (data) => {
  const activeScene = pvw ? pvw : pgm;
  if (
    data.sceneName == activeScene &&
    currentSceneFeedScenes.indexOf(data['item-name']) != -1
  )
    if (subscribed) initOBS();
}); */

function initOBS() {
	if (!connectedToOBS) {
		obsError("Can't init, not connected");
		return;
	}
	if (cropItem) return;
	if (inInit) {
		obsError('initOBS called too frequently');
		setTimeout(initOBS, 200);
		return;
	}
	inInit = true;
	obs
		.call('GetSceneList')
		.then((data) => {
			pvw = data.currentPreviewSceneName;
			pgm = data.currentProgramSceneName;
			videoFeeds = [];
			if (data.scenes.map((x) => x.sceneName).indexOf('Video Feeds') > -1) {
				obs
					.call('GetSceneItemList', { sceneName: 'Video Feeds' })
					.then((data) => {
						if (isObsSceneItemArray(data.sceneItems)) {
							videoFeeds = data.sceneItems;
						} else obsError('Invalid scene item list');
					})
					.catch(obsError);
			}
			return obs.call('GetSceneItemList', { sceneName: pvw ? pvw : pgm });
		})
		.then((data) => {
			let sceneItems: ObsSceneItem[] = [];
			if (isObsSceneItemArray(data.sceneItems)) {
				sceneItems = data.sceneItems;
			} else obsError('Invalid scene item list');
			return updateFromCurrentSceneItems(sceneItems);
		})
		.then(() => {
			return populateViewportsFromActiveFeed();
		})
		.then(() => {
			refreshViewportsDiv();
		})
		.catch(obsError)
		.then(() => (inInit = false));
}

async function updateFromCurrentSceneItems(items: ObsSceneItem[]) {
	selectedFeedsScene = '';
	currentSceneFeedScenes = [];
	currentSceneViewports = [];
	for (let i = 0; i < items.length; i++) {
		if (items[i].sourceName.slice(-10) == '_reference') {
			currentSceneViewports.push({
				name: items[i].sourceName.slice(0, -10),
				x: items[i].sceneItemTransform.positionX,
				y: items[i].sceneItemTransform.positionY,
				width: items[i].sceneItemTransform.width,
				height: items[i].sceneItemTransform.height,
				rows: 1,
				columns: 1,
				assignedFeeds: [],
			});
		}
		if (
			items[i].sourceName.slice(0, 5) == 'Feeds' &&
			items[i].sourceName != 'Feeds'
		) {
			currentSceneFeedScenes.push(items[i].sourceName);
			if (items[i].sceneItemEnabled)
				if (!selectedFeedsScene) {
					selectedFeedsScene = items[i].sourceName;
				} else {
					await obs.call('SetSceneItemEnabled', {
						sceneName: pvw ? pvw : pgm,
						sceneItemId: items[i].sceneItemId,
						sceneItemEnabled: false,
					});
				}
		}
	}
}

function populateViewportsFromActiveFeed() {
	unassignedFeeds = [];
	const viewportSearchBoxes: {
		x: number;
		y: number;
		width: number;
		height: number;
	}[] = [];
	for (let i = 0; i < currentSceneViewports.length; i++) {
		currentSceneViewports[i].assignedFeeds = [];
		currentSceneViewports[i].rows = 1;
		currentSceneViewports[i].columns = 1;
		viewportSearchBoxes[i] = {
			x: currentSceneViewports[i].x,
			y: currentSceneViewports[i].y,
			width: currentSceneViewports[i].width,
			height: currentSceneViewports[i].height,
		};
	}
	if (!selectedFeedsScene) return;
	let sceneItemList: ObsSceneItem[] = [];
	return obs
		.call('GetSceneItemList', { sceneName: selectedFeedsScene })
		.then((data) => {
			if (isObsSceneItemArray(data.sceneItems)) {
				sceneItemList = data.sceneItems;
			} else obsError('Invalid scene item list');
			const viewportFeeds: Viewport['assignedFeeds'] = [];
			for (let i = 0; i < sceneItemList.length; i++) {
				viewportFeeds.push({
					sceneName: selectedFeedsScene,
					sceneItemId: sceneItemList[i].sceneItemId,
					sourceName: sceneItemList[i].sourceName,
					kind: sceneItemList[i].inputKind
						? (sceneItemList[i].inputKind as ObsInputKind)
						: sceneItemList[i].isGroup
						? 'group'
						: 'scene',
					left: sceneItemList[i].sceneItemTransform.cropLeft,
					right: sceneItemList[i].sceneItemTransform.cropRight,
					top: sceneItemList[i].sceneItemTransform.cropTop,
					bottom: sceneItemList[i].sceneItemTransform.cropBottom,
					width: sceneItemList[i].sceneItemTransform.sourceWidth,
					height: sceneItemList[i].sceneItemTransform.sourceHeight,
					x: sceneItemList[i].sceneItemTransform.positionX,
					y: sceneItemList[i].sceneItemTransform.positionY,
					boundsWidth: sceneItemList[i].sceneItemTransform.boundsWidth,
					boundsHeight: sceneItemList[i].sceneItemTransform.boundsHeight,
				});
			}
			let i = 0;
			let productiveLoop = false;
			while (i < viewportFeeds.length) {
				let assigned = false;
				for (let j = 0; j < currentSceneViewports.length; j++) {
					if (
						viewportSearchBoxes[j].x == viewportFeeds[i].x &&
						viewportSearchBoxes[j].y == viewportFeeds[i].y
					) {
						if (
							viewportSearchBoxes[j].width == viewportFeeds[i].boundsWidth &&
							viewportSearchBoxes[j].height == viewportFeeds[i].boundsHeight
						) {
							currentSceneViewports[j].assignedFeeds.push(viewportFeeds[i]);
							if (
								currentSceneViewports[j].rows > 1 ||
								currentSceneViewports[j].columns > 1
							)
								viewportSearchBoxes[j] = getViewPortBoundingBoxes(
									currentSceneViewports[j]
								)[currentSceneViewports[j].assignedFeeds.length];
							if (!viewportSearchBoxes[j])
								viewportSearchBoxes[j] = {
									x: -1,
									y: -1,
									width: -1,
									height: -1,
								};
							productiveLoop = true;
							assigned = true;
							viewportFeeds.splice(i, 1);
							break;
						} else if (currentSceneViewports[j].assignedFeeds.length == 0) {
							const possibleWidth: number[] = [NaN]; //array index corresponds to number of columns, which can't be zero
							for (let k = 1; k <= 4; k++) {
								possibleWidth.push(
									Math.round(currentSceneViewports[j].width / k)
								);
							}
							const columns = possibleWidth.indexOf(
								viewportFeeds[i].boundsWidth
							);
							if (columns > 0) {
								const possibleHeight: number[] = [NaN]; //array index corresponds to number of rows, which can't be zero
								for (let k = 1; k <= 4; k++) {
									possibleHeight.push(
										Math.round(currentSceneViewports[j].height / k)
									);
								}
								const rows = possibleHeight.indexOf(
									viewportFeeds[i].boundsHeight
								);
								if (rows > 0) {
									currentSceneViewports[j].rows = rows;
									currentSceneViewports[j].columns = columns;
									currentSceneViewports[j].assignedFeeds.push(viewportFeeds[i]);
									viewportSearchBoxes[j] = getViewPortBoundingBoxes(
										currentSceneViewports[j]
									)[currentSceneViewports[j].assignedFeeds.length];
									if (!viewportSearchBoxes[j])
										viewportSearchBoxes[j] = {
											x: -1,
											y: -1,
											width: -1,
											height: -1,
										};
									productiveLoop = true;
									assigned = true;
									viewportFeeds.splice(i, 1);
									break;
								}
							}
						}
					}
				}
				//if (!assigned) unassignedFeeds.push(viewportFeeds[i]);
				if (!assigned) i++;
				if (i == viewportFeeds.length && productiveLoop == true) {
					i = 0;
					productiveLoop = false;
				}
			}
			unassignedFeeds = viewportFeeds;
		})
		.catch(obsError);
}

async function refreshViewportsDiv() {
	document.getElementById('viewports')!.classList.remove('hide');
	document.getElementById('crop')!.classList.add('hide');
	cropImg.src = '';
	const listDiv = document.getElementById('viewports-list')!;
	listDiv.innerHTML = '';
	for (let i = 0; i <= currentSceneViewports.length; i++) {
		const headerDiv = document.createElement('div');
		headerDiv.classList.add('viewport-header');
		const titleDiv = document.createElement('div');
		titleDiv.classList.add('viewport-title');
		const spacer = document.createElement('div');
		spacer.style.flexGrow = '1';
		let viewportFeeds: typeof unassignedFeeds;
		if (i == currentSceneViewports.length) {
			if (unassignedFeeds.length == 0) break;
			titleDiv.innerHTML = 'Unassigned';
			headerDiv.appendChild(titleDiv);
			headerDiv.appendChild(spacer);
			const removeSources = document.createElement('img');
			removeSources.classList.add('icon');
			removeSources.src = icons.trash;
			removeSources.onclick = () => {
				if (confirm('Delete all unassigned video feeds?'))
					removeUnassignedSources();
			};
			headerDiv.appendChild(removeSources);

			viewportFeeds = unassignedFeeds;
		} else {
			titleDiv.innerHTML = currentSceneViewports[i].name;
			headerDiv.appendChild(titleDiv);
			headerDiv.appendChild(spacer);
			const removeRow = document.createElement('img');
			const addRow = document.createElement('img');
			removeRow.classList.add('icon');
			removeRow.src = icons.removeRow;
			removeRow.onclick = () => {
				if (currentSceneViewports[i].rows > 1) {
					currentSceneViewports[i].rows--;
					const columns = Math.ceil(
						currentSceneViewports[i].assignedFeeds.length /
							currentSceneViewports[i].rows
					);
					if (
						Math.ceil(currentSceneViewports[i].assignedFeeds.length / columns) <
						currentSceneViewports[i].rows
					)
						currentSceneViewports[i].rows--;
					if (currentSceneViewports[i].rows <= 1)
						removeRow.classList.add('hide');
					arrangeViewportFeeds(currentSceneViewports[i]);
					addRow.classList.remove('hide');
				}
			};
			if (currentSceneViewports[i].rows <= 1) removeRow.classList.add('hide');
			headerDiv.appendChild(removeRow);
			addRow.classList.add('icon');
			addRow.src = icons.addRow;
			addRow.onclick = () => {
				if (
					currentSceneViewports[i].rows <
					currentSceneViewports[i].assignedFeeds.length
				) {
					currentSceneViewports[i].rows++;
					const columns = Math.ceil(
						currentSceneViewports[i].assignedFeeds.length /
							currentSceneViewports[i].rows
					);
					if (
						Math.ceil(currentSceneViewports[i].assignedFeeds.length / columns) <
						currentSceneViewports[i].rows
					)
						currentSceneViewports[i].rows++;
					if (
						currentSceneViewports[i].assignedFeeds.length <=
						currentSceneViewports[i].rows
					)
						addRow.classList.add('hide');
					arrangeViewportFeeds(currentSceneViewports[i]);
					removeRow.classList.remove('hide');
				}
			};
			if (
				currentSceneViewports[i].assignedFeeds.length <=
				currentSceneViewports[i].rows
			)
				addRow.classList.add('hide');
			headerDiv.appendChild(addRow);
			const addSource = document.createElement('img');
			addSource.classList.add('icon');
			addSource.src = icons.plus;
			const onClick = () => {
				addSource.onclick = () => {
					if (selectedFeedsScene) {
						addSource.onclick = null;
						addSourceOnclick(currentSceneViewports[i], headerDiv, onClick);
					} else obsError('No feed selected');
				};
			};
			onClick();
			headerDiv.appendChild(addSource);
			viewportFeeds = currentSceneViewports[i].assignedFeeds;
		}
		listDiv.appendChild(headerDiv);
		const viewportSourcesDiv = document.createElement('div');
		viewportSourcesDiv.classList.add('viewport-sources');
		for (let j = 0; j < viewportFeeds.length; j++) {
			const sourceDiv = document.createElement('div');
			sourceDiv.classList.add('source');
			const typeIcon = document.createElement('img');
			typeIcon.classList.add('icon');
			const kind = viewportFeeds[j].kind;
			if (
				icons.sources.hasOwnProperty(kind) &&
				icons.sources[kind as SceneItemKind]
			) {
				typeIcon.src = icons.sources[kind as SceneItemKind];
			} else typeIcon.src = icons.defaultSource;
			sourceDiv.appendChild(typeIcon);
			const text = document.createElement('div');
			text.classList.add('source-text');
			text.innerHTML += viewportFeeds[j].sourceName;
			sourceDiv.appendChild(text);
			const trashIcon = document.createElement('img');
			trashIcon.classList.add('icon');
			trashIcon.style.float = 'right';
			trashIcon.src = icons.trash;
			trashIcon.onclick = () => {
				unsubscribeToChanges();
				obs
					.call('RemoveSceneItem', {
						sceneName: viewportFeeds[j].sceneName,
						sceneItemId: viewportFeeds[j].sceneItemId,
					})
					.then(() => {
						viewportFeeds.splice(j, 1);
						if (
							currentSceneViewports[i] &&
							currentSceneViewports[i].rows >
								currentSceneViewports[i].assignedFeeds.length &&
							currentSceneViewports[i].assignedFeeds.length > 0
						)
							currentSceneViewports[i].rows =
								currentSceneViewports[i].assignedFeeds.length;
					})
					.catch(obsError)
					.then(() => {
						subscribeToChanges();
						arrangeViewportFeeds(currentSceneViewports[i]);
						refreshViewportsDiv();
					});
			};
			sourceDiv.appendChild(trashIcon);
			const cropIcon = document.createElement('img');
			cropIcon.classList.add('icon');
			cropIcon.style.float = 'right';
			cropIcon.src = icons.crop;
			cropIcon.onclick = () => {
				cropItem = viewportFeeds[j];
				refreshCropDiv();
			};
			sourceDiv.appendChild(cropIcon);
			const upIcon = document.createElement('img');
			upIcon.classList.add('icon');
			upIcon.style.float = 'right';
			if (j > 0) {
				upIcon.src = icons.up;
				upIcon.onclick = () => {
					swapFeeds(viewportFeeds, j, j - 1);
				};
			} else upIcon.src = icons.blank;
			sourceDiv.appendChild(upIcon);
			if (j < viewportFeeds.length - 1) {
				const downIcon = document.createElement('img');
				downIcon.classList.add('icon');
				downIcon.style.float = 'right';
				downIcon.src = icons.down;
				downIcon.onclick = () => {
					swapFeeds(viewportFeeds, j, j + 1);
				};
				sourceDiv.appendChild(downIcon);
			}
			viewportSourcesDiv.appendChild(sourceDiv);
		}
		listDiv.appendChild(viewportSourcesDiv);
	}
	refreshFooter();
}

function swapFeeds(
	viewportFeeds: typeof unassignedFeeds,
	index1: number,
	index2: number
) {
	/* const feed1 = viewportFeeds[index1];
	const feed2 = viewportFeeds[index2];
	const swapX = feed2.x;
	const swapY = feed2.y;
	const swapWidth = feed2.boundsWidth;
	const swapHeight = feed2.boundsHeight;
	feed2.x = feed1.x;
	feed2.y = feed1.y;
	feed2.boundsWidth = feed1.boundsWidth;
	feed2.boundsHeight = feed1.boundsHeight;
	feed1.x = swapX;
	feed1.y = swapY;
	feed1.boundsWidth = swapWidth;
	feed1.boundsHeight = swapHeight; */
	const transform1: Partial<ObsSceneItemTransform> = {
		positionX: viewportFeeds[index2].x,
		positionY: viewportFeeds[index2].y,
		boundsWidth: viewportFeeds[index2].boundsWidth,
		boundsHeight: viewportFeeds[index2].boundsHeight,
	};
	const transform2: Partial<ObsSceneItemTransform> = {
		positionX: viewportFeeds[index1].x,
		positionY: viewportFeeds[index1].y,
		boundsWidth: viewportFeeds[index1].boundsWidth,
		boundsHeight: viewportFeeds[index1].boundsHeight,
	};
	unsubscribeToChanges();
	obs
		.call('SetSceneItemTransform', {
			sceneName: selectedFeedsScene,
			sceneItemId: videoFeeds[index1].sceneItemId,
			sceneItemTransform: transform1,
		})
		.then(() => {
			return obs.call('SetSceneItemTransform', {
				sceneName: selectedFeedsScene,
				sceneItemId: videoFeeds[index2].sceneItemId,
				sceneItemTransform: transform2,
			});
		})
		.then(() => {
			const swap = viewportFeeds[index2];
			viewportFeeds[index2] = viewportFeeds[index1];
			viewportFeeds[index1] = swap;
			refreshViewportsDiv();
			subscribeToChanges();
		})
		.catch(console.error);
}

async function removeUnassignedSources() {
	unsubscribeToChanges();
	for (let i = 0; i < unassignedFeeds.length; i++) {
		await obs
			.call('RemoveSceneItem', {
				sceneName: unassignedFeeds[i].sceneName,
				sceneItemId: unassignedFeeds[i].sceneItemId,
			})
			.catch(obsError);
	}
	unassignedFeeds = [];
	subscribeToChanges();
	refreshViewportsDiv();
}

function getViewPortBoundingBoxes(viewport: Viewport) {
	const rtn: { x: number; y: number; width: number; height: number }[] = [];
	for (let y = 0; y < viewport.rows; y++) {
		for (let x = 0; x < viewport.columns; x++) {
			const boxX = Math.round((x * viewport.width) / viewport.columns);
			const boxY = Math.round((y * viewport.height) / viewport.rows);
			rtn.push({
				x: viewport.x + boxX,
				y: viewport.y + boxY,
				width: Math.round(((x + 1) * viewport.width) / viewport.columns) - boxX,
				height: Math.round(((y + 1) * viewport.height) / viewport.rows) - boxY,
			});
		}
	}
	return rtn;
}

async function arrangeViewportFeeds(viewport: Viewport) {
	viewport.columns = Math.ceil(viewport.assignedFeeds.length / viewport.rows);
	const boxes = getViewPortBoundingBoxes(viewport);
	unsubscribeToChanges();
	for (let i = 0; i < viewport.assignedFeeds.length; i++) {
		const feed = viewport.assignedFeeds[i];
		const newTransform: Partial<ObsSceneItemTransform> = {
			positionX: boxes[i].x,
			positionY: boxes[i].y,
			boundsType: 'OBS_BOUNDS_SCALE_INNER',
			boundsWidth: boxes[i].width,
			boundsHeight: boxes[i].height,
		};
		await obs
			.call('SetSceneItemTransform', {
				sceneName: selectedFeedsScene,
				sceneItemId: feed.sceneItemId,
				sceneItemTransform: newTransform,
			})
			.then(() => {
				feed.x = boxes[i].x;
				feed.y = boxes[i].y;
				feed.boundsWidth = boxes[i].width;
				feed.boundsHeight = boxes[i].height;
			})
			.catch(console.error);
	}
	subscribeToChanges();
}

async function addSourceOnclick(
	viewport: Viewport,
	headerDiv: HTMLDivElement,
	reset: () => void
) {
	await new Promise((res) => setTimeout(res, 1)); //allow click to propagate first;
	const addSourceDiv = document.createElement('div');
	addSourceDiv.classList.add('pop-up');
	for (let i = 0; i < videoFeeds.length; i++) {
		const sourceDiv = document.createElement('div');
		sourceDiv.classList.add('source');
		const icon = document.createElement('img');
		icon.classList.add('icon');
		const kind: SceneItemKind = videoFeeds[i].inputKind
			? (videoFeeds[i].inputKind as ObsInputKind)
			: videoFeeds[i].isGroup
			? 'group'
			: 'scene';
		if (icons.sources.hasOwnProperty(kind) && icons.sources[kind]) {
			icon.src = icons.sources[kind];
		} else icon.src = icons.defaultSource;
		sourceDiv.appendChild(icon);
		const text = document.createElement('div');
		text.classList.add('source-text');
		text.innerHTML += videoFeeds[i].sourceName;
		sourceDiv.appendChild(text);
		sourceDiv.onclick = () => {
			document.onclick = null;
			headerDiv.removeChild(addSourceDiv);
			reset();
			addSourceToViewport(videoFeeds[i], viewport);
		};
		addSourceDiv.appendChild(sourceDiv);
	}
	document.onclick = (e) => {
		if (e.target !== addSourceDiv && !addSourceDiv.contains(e.target as Node)) {
			document.onclick = null;
			headerDiv.removeChild(addSourceDiv);
			reset();
		}
	};
	addSourceDiv.style.visibility = 'hidden';
	headerDiv.appendChild(addSourceDiv);
	const margin = 10;
	const moveUp =
		addSourceDiv.getBoundingClientRect().bottom + margin - window.innerHeight;
	if (moveUp > 0) addSourceDiv.style.transform = `translateY(-${moveUp}px)`;
	addSourceDiv.style.visibility = '';
}

function refreshCropDiv() {
	cropSide = null;
	if (!cropItem) {
		refreshViewportsDiv();
		return;
	}
	document.querySelectorAll('.base').forEach((elem) => {
		elem.classList.add('hide');
	});
	document.querySelectorAll('.crop-icon').forEach((elem) => {
		elem.classList.remove('hide');
	});
	obs
		.call('GetSourceScreenshot', {
			sourceName: cropItem.sourceName,
			imageFormat: 'png',
		})
		.then((data) => {
			screenshotBase64 = data.imageData;
			const cropWindow = document.getElementById('crop')!;
			cropWindow.style.opacity = '0';
			cropWindow.classList.remove('hide');
			refreshCropImage();
			cropWindow.style.opacity = '1';
			document.getElementById('viewports')!.classList.add('hide');
		})
		.catch(obsError);
	refreshFooter();
}

function initCropDisplay() {
	cropImg.src = '';
	setSvgCropPath();
	cropFrame.style.opacity = '0';
	cropFrame.style.width = '';
	cropFrame.style.height = '';
	cropImg.style.transform = '';
	cropGuide.style.opacity = '0';
	cropOutline.style.opacity = '0';
	initZoomDirs();
}

function refreshCropImage() {
	if (!cropItem) return;
	initCropDisplay();
	const fullFrameX = cropDiv.clientWidth;
	const fullFrameY = cropDiv.clientHeight;
	if (cropSide) {
		const changeableCropItem = JSON.parse(
			JSON.stringify(cropItem)
		) as typeof cropItem;
		cropGuide.className = cropSide;
		cropGuide.style.opacity = '1';
		let centerY = -1;
		let centerX = -1;
		let xSize = 10;
		let ySize = 10;
		if (cropSide == 'left' || cropSide == 'right') {
			ySize = Math.floor((2 * xSize * fullFrameY) / fullFrameX) / 2;
			const bottomY = cropItem.height - cropItem.bottom;
			centerY = Math.round((bottomY + cropItem.top) / 2);
			if (cropSide == 'right') {
				centerX = cropItem.width - cropItem.right;
			} else centerX = cropItem.left;
		} else {
			xSize = Math.floor((2 * ySize * fullFrameX) / fullFrameY) / 2;
			const rightX = cropItem.width - cropItem.right;
			centerX = Math.round((rightX + cropItem.left) / 2);
			if (cropSide == 'bottom') {
				centerY = cropItem.height - cropItem.bottom;
			} else centerY = cropItem.top;
		}
		changeableCropItem.left = centerX - xSize;
		changeableCropItem.right = cropItem.width - centerX - xSize;
		changeableCropItem.top = centerY - ySize;
		changeableCropItem.bottom = cropItem.height - centerY - ySize;
		const croppedSize = {
			x:
				changeableCropItem.width -
				(changeableCropItem.left + changeableCropItem.right),
			y:
				changeableCropItem.height -
				(changeableCropItem.top + changeableCropItem.bottom),
		};
		let shrinkAxis: 'width' | 'height' = 'width';
		let aspectRatio = croppedSize.x / croppedSize.y;
		if (fullFrameX / fullFrameY < aspectRatio) {
			shrinkAxis = 'height';
			aspectRatio = 1 / aspectRatio;
		}
		const [largeAxis, refSize, refAxis]: [
			'width' | 'height',
			number,
			'x' | 'y'
		] =
			shrinkAxis == 'width'
				? ['height', fullFrameY, 'y']
				: ['width', fullFrameX, 'x'];
		cropFrame.style[largeAxis] = refSize + 'px';
		cropFrame.style[shrinkAxis] = refSize * aspectRatio + 'px';
		scale = refSize / croppedSize[refAxis];
		const translateX =
			((scale - 1) * changeableCropItem.width) / 2 -
			changeableCropItem.left * scale;
		const translateY =
			((scale - 1) * changeableCropItem.height) / 2 -
			changeableCropItem.top * scale;
		cropImg.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
		cropFrame.style.opacity = '1';
	} else {
		const aspectRatio = cropItem.width / cropItem.height;
		let width = fullFrameX;
		let height = fullFrameY;
		scale = fullFrameY / cropItem.height;
		if (fullFrameX / fullFrameY < aspectRatio) {
			height = width / aspectRatio;
			scale = fullFrameX / cropItem.width;
		} else width = aspectRatio * height;
		cropFrame.style.width = width.toString() + 'px';
		cropFrame.style.height = height.toString() + 'px';
		const translateX = ((scale - 1) * cropItem.width) / 2;
		const translateY = ((scale - 1) * cropItem.height) / 2;
		cropImg.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
		setSvgCropPath(cropItem);
		cropOutline.style.width =
			(
				(cropItem.width - cropItem.left - cropItem.right) * scale +
				2
			).toString() + 'px';
		cropOutline.style.height =
			(
				(cropItem.height - cropItem.top - cropItem.bottom) * scale +
				2
			).toString() + 'px';
		cropOutline.style.left = (cropItem.left * scale - 1).toString() + 'px';
		cropOutline.style.top = (cropItem.top * scale - 1).toString() + 'px';
		cropOutline.style.transform = `translate(${translateX}, ${translateY})`;
		cropOutline.style.opacity = '1';
		cropFrame.style.opacity = '1';
	}
	cropImg.src = screenshotBase64;
}

function refreshFooter() {
	const footer = document.getElementById('footer')!;
	footer.innerHTML = '';
	footer.onclick = null;
	if (cropItem) {
		let icon = document.createElement('img');
		icon.width = 16;
		icon.classList.add('icon', 'footer');
		icon.src = icons.revert;
		icon.onclick = () => {
			cropSide = null;
			if (!cropItem) {
				obsError('No cropItem');
				return;
			}
			obs
				.call('SetSceneItemTransform', {
					sceneName: cropItem.sceneName,
					sceneItemId: cropItem.sceneItemId,
					sceneItemTransform: {
						cropLeft: 0,
						cropRight: 0,
						cropTop: 0,
						cropBottom: 0,
					},
				})
				.then(() => {
					if (cropItem) {
						cropItem.left = 0;
						cropItem.right = 0;
						cropItem.top = 0;
						cropItem.bottom = 0;
					} else obsError('No cropItem');
					refreshCropImage();
				})
				.catch(obsError);
		};
		footer.appendChild(icon);
		icon = document.createElement('img');
		icon.width = 16;
		icon.classList.add('icon', 'footer');
		icon.src = icons.check;
		icon.onclick = () => {
			cropItem = null;
			cropSide = null;
			refreshViewportsDiv();
		};
		footer.appendChild(icon);
	} else {
		let icon = document.createElement('img');
		if (!connectedToOBS) {
			icon.width = 16;
			icon.classList.add('icon', 'footer');
			icon.src = icons.revert;
			icon.onclick = () => {
				connectToOBS();
			};
			footer.appendChild(icon);
		}
		icon = document.createElement('img');
		icon.width = 16;
		icon.classList.add('icon', 'footer');
		icon.src = `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2032%2032%27%3E%3Cpath%20fill%3D%27%23d2d2d2%27%20fill-rule%3D%27evenodd%27%20d%3D%27M32%2017.77V14.1l-4.434-1.468-1.027-2.497%202.008-4.21-2.582-2.592-4.137%202.085-2.492-1.033-1.574-4.4h-3.66L12.664%204.43l-2.539%201.03-4.203-2.01-2.586%202.583%202.082%204.152-1.031%202.497L0%2014.234v3.647l4.434%201.468%201.027%202.497-2.008%204.216%202.582%202.59%204.137-2.09%202.492%201.035%201.574%204.394h3.637l1.437-4.444%202.54-1.029%204.207%202.018%202.582-2.59-2.102-4.15%201.074-2.496L32%2017.72zm-16%205.105c-3.793%200-6.856-3.07-6.856-6.873S12.208%209.128%2016%209.128s6.856%203.07%206.856%206.874-3.063%206.873-6.856%206.873z%27%2F%3E%3C%2Fsvg%3E`;
		icon.onclick = () => {
			setTimeout(() => {
				if (document.querySelectorAll('.pop-up').length == 0) {
					const settingsBox = document.createElement('div');
					settingsBox.classList.add('pop-up');
					settingsBox.style.top = 'unset';
					settingsBox.style.bottom = '25px';
					settingsBox.style.zIndex = '9999';
					const portDiv = document.createElement('div');
					portDiv.className = 'setup-item';
					portDiv.innerHTML = 'Port: ';
					const port = document.createElement('input');
					port.style.float = 'right';
					port.value = obsPort.toString();
					port.oninput = () => {
						const maybe = parseInt(port.value);
						if (maybe.toString() == port.value) {
							obsPort = maybe;
						} else port.value = obsPort.toString();
					};
					portDiv.appendChild(port);
					settingsBox.appendChild(portDiv);
					const pwdDiv = document.createElement('div');
					pwdDiv.className = 'setup-item';
					pwdDiv.innerHTML = 'Password: ';
					const pwd = document.createElement('input');
					pwd.value = obsPassword;
					pwd.type = 'password';
					pwd.oninput = () => {
						obsPassword = pwd.value;
					};
					pwdDiv.appendChild(pwd);
					settingsBox.appendChild(pwdDiv);
					document.onclick = (e) => {
						if (
							e.target !== settingsBox &&
							!settingsBox.contains(e.target as Node)
						) {
							document.onclick = null;
							localStorage.setItem('obsPort', obsPort.toString());
							localStorage.setItem('obsPassword', obsPassword);
							footer.removeChild(settingsBox);
						}
					};
					footer.appendChild(settingsBox);
				}
			}, 1);
		};
		footer.appendChild(icon);
	}
}

async function addSourceToViewport(source: ObsSceneItem, viewport: Viewport) {
	unsubscribeToChanges();
	let newItem: typeof unassignedFeeds[number];
	obs
		.call('CreateSceneItem', {
			sceneName: selectedFeedsScene,
			sourceName: source.sourceName,
		})
		.then((data) => {
			newItem = {
				sceneName: selectedFeedsScene,
				kind: source.inputKind
					? (source.inputKind as ObsInputKind)
					: source.isGroup
					? 'group'
					: 'scene',
				sceneItemId: data.sceneItemId,
				sourceName: source.sourceName,
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				width: source.sceneItemTransform.sourceWidth,
				height: source.sceneItemTransform.sourceHeight,
				x: viewport.x,
				y: viewport.y,
				boundsWidth: viewport.width,
				boundsHeight: viewport.height,
			};
			const newTransform: Partial<ObsSceneItemTransform> = {
				positionX: viewport.x,
				positionY: viewport.y,
				boundsType: 'OBS_BOUNDS_SCALE_INNER',
				boundsWidth: viewport.width,
				boundsHeight: viewport.height,
			};
			return obs.call('SetSceneItemTransform', {
				sceneName: selectedFeedsScene,
				sceneItemId: newItem.sceneItemId,
				sceneItemTransform: newTransform,
			});
		})
		.then(() => {
			return obs.call('SetSceneItemLocked', {
				sceneName: selectedFeedsScene,
				sceneItemId: newItem.sceneItemId,
				sceneItemLocked: true,
			});
		})
		.catch(obsError)
		.then(() => {
			const viewportIndex = currentSceneViewports
				.map((x) => x.name)
				.indexOf(viewport.name);
			if (viewportIndex != -1 && newItem) {
				currentSceneViewports[viewportIndex].assignedFeeds.push(newItem);
				arrangeViewportFeeds(currentSceneViewports[viewportIndex])
					.then(() => {
						refreshViewportsDiv();
						subscribeToChanges();
					})
					.catch(console.error);
			} else {
				subscribeToChanges();
				initOBS();
			}
		});
}

function cropViewportFeed(cropType: 'camera' | 'game1' | 'game2') {
	if (!cropItem) {
		obsError('No cropItem');
		return;
	}
	cropSide = null;
	cropImg.style.transform = '';
	const width = cropItem.width;
	const height = cropItem.height;
	const y1 = 0.124 * height; //always game1 to webcam gap
	const y2 = 0.546 * height; //game1 to game2 gap
	const x1 = 0.176 * width; //webcam y/ game2 y
	const x2 = 0.718 * width; //game1 y
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		obsError('Canvas error');
		return;
	}
	ctx.drawImage(cropImg, 0, 0);
	let temp: [number, number];
	let newItemRec = { left: -1, right: -1, top: -1, bottom: -1 };
	const camera = { left: -1, right: -1, top: -1, bottom: -1 };
	const game1 = { left: -1, right: -1, top: -1, bottom: -1 };
	const game2 = { left: -1, right: -1, top: -1, bottom: -1 };
	temp = findGreenBlock(ctx, 'y', y1, y2, x1, true);
	console.log(temp);
	if (temp[1] < y2) game2.top = temp[1];
	camera.bottom = temp[0];
	temp = findGreenBlock(ctx, 'y', y1, 0, x1, true);
	camera.top = temp[1] == -1 ? 0 : temp[1];
	temp = findGreenBlock(ctx, 'x', x1, 0, y1, true);
	camera.left = temp[1] == -1 ? 0 : temp[1];
	temp = findGreenBlock(ctx, 'x', x2, x1, y2, true);
	game2.right = temp[0] > x1 - 1 ? temp[0] : -1;
	game1.left = temp[1];
	temp = findGreenBlock(ctx, 'x', x1, x2, y1, true);
	camera.right = temp[0] == -1 ? game1.left : temp[0];
	temp = findGreenBlock(ctx, 'x', x2, width - 1, y1, true);
	game1.right = temp[0] == -1 ? width - 1 : temp[0];
	temp = findGreenBlock(ctx, 'y', y1, 0, x2, true);
	game1.top = temp[1] == -1 ? 0 : temp[1];
	temp = findGreenBlock(ctx, 'y', y1, height - 1, x2, true);
	game1.bottom = temp[0] == -1 ? height - 1 : temp[0];
	temp = findGreenBlock(ctx, 'x', x1, 0, y2, true);
	game2.left = temp[1] == -1 ? 0 : temp[1];
	temp = findGreenBlock(ctx, 'y', y2, height - 1, x1, true);
	game2.bottom = temp[0] == -1 ? height - 1 : temp[0];
	console.log(camera);
	console.log(game1);
	console.log(game2);
	switch (cropType) {
		case 'game1':
			newItemRec = game1;
			break;
		case 'game2':
			newItemRec = game2;
			break;
		case 'camera':
			newItemRec = camera;
			break;
	}
	const newCrop: Partial<ObsSceneItemTransform> = {
		cropLeft: newItemRec.left + 1,
		cropRight: width - newItemRec.right,
		cropTop: newItemRec.top + 1,
		cropBottom: height - newItemRec.bottom,
	};
	obs
		.call('SetSceneItemTransform', {
			sceneName: cropItem.sceneName,
			sceneItemId: cropItem.sceneItemId,
			sceneItemTransform: newCrop,
		})
		.then(() => {
			if (cropItem) {
				cropItem.left = newCrop.cropLeft!;
				cropItem.right = newCrop.cropRight!;
				cropItem.top = newCrop.cropTop!;
				cropItem.bottom = newCrop.cropBottom!;
			}
			refreshCropImage();
		})
		.catch(obsError);
}

function setSvgCropPath(crop?: typeof cropItem) {
	if (!crop) {
		croppedSvg.setAttribute('d', 'M0,0V1H1V0ZM0,0H1V1H0Z');
		return;
	}
	const left = crop.left / crop.width;
	const top = crop.top / crop.height;
	const right = 1 - crop.right / crop.width;
	const bottom = 1 - crop.bottom / crop.height;
	croppedSvg.setAttribute(
		'd',
		`M${left},${top}V${bottom}H${right}V${top}ZM0,0H1V1H0Z`
	);
}

//autocrop helpers:
function findGreenBlock(
	ctx: CanvasRenderingContext2D,
	axis: 'x' | 'y',
	start: number,
	end: number,
	otherAxis: number,
	allowend?: boolean
): [number, number] {
	let direction = 1;
	if (start > end) direction = -1;
	start = Math.round(start);
	end = Math.round(end);
	otherAxis = Math.round(otherAxis);
	let greenBlock: [number, number] = [-1, -1];
	let curBlock: [number, number] = [start - direction, start - direction];
	for (let i = start; (end - i) * direction >= 0; i += direction) {
		let coords: [number, number] = [i, otherAxis];
		if (axis == 'y') coords = [otherAxis, i];
		if (compareToGreen(ctx, ...coords) < autocropThreshold) {
			if (curBlock[1] == i - direction) {
				curBlock[1] = i;
			} else curBlock = [i, i];
		} else if (i - direction == curBlock[1]) {
			if (allowend || curBlock[0] != start - direction)
				if (
					Math.abs(curBlock[1] - curBlock[0]) >
					Math.abs(greenBlock[1] - greenBlock[0])
				) {
					greenBlock = [...curBlock];
					if (greenBlock[0] == -1) greenBlock[0] = start;
				}
		}
	}
	if (
		allowend &&
		Math.abs(curBlock[1] - curBlock[0]) >
			Math.abs(greenBlock[1] - greenBlock[0])
	)
		greenBlock = [...curBlock];
	if (direction == -1) greenBlock = greenBlock.reverse() as [number, number];
	if (greenBlock[0] == start - direction || greenBlock[1] == start - direction)
		greenBlock = [-1, -1];
	return greenBlock;
}

function compareToGreen(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number
): number {
	const pixel = Array.from(ctx.getImageData(x, y, 1, 1).data);
	return Math.min(
		Math.abs(pixel[0] - gdqGreen[0]) +
			Math.abs(pixel[1] - gdqGreen[1]) +
			Math.abs(pixel[2] - gdqGreen[2]),
		Math.abs(pixel[0] - gdqGreen2[0]) +
			Math.abs(pixel[1] - gdqGreen2[1]) +
			Math.abs(pixel[2] - gdqGreen2[2])
	);
}

//Type Checking:

function isObsSceneItemArray(test: any): test is ObsSceneItem[] {
	if (!Array.isArray(test)) return false;
	return !test.find((x) => {
		return !isObsSceneItem(x);
	});
}

function isObsSceneItem(test: any): test is ObsSceneItem {
	if (typeof test !== 'object') return false;
	if (test === null) return false;
	return (
		((isObsInputKind(test.inputKind) &&
			test.isGroup === null &&
			test.sourceType === 'OBS_SOURCE_TYPE_INPUT') ||
			(test.inputKind === null &&
				typeof test.isGroup === 'boolean' &&
				test.sourceType === 'OBS_SOURCE_TYPE_SCENE')) &&
		isObsBlendMode(test.sceneItemBlendMode) &&
		typeof test.sceneItemEnabled === 'boolean' &&
		typeof test.sceneItemId === 'number' &&
		typeof test.sceneItemIndex === 'number' &&
		typeof test.sceneItemLocked === 'boolean' &&
		IsObsSceneItemTransform(test.sceneItemTransform) &&
		typeof test.sourceName === 'string'
	);
}

function isObsInputKind(test: any): test is ObsInputKind {
	if (typeof test !== 'string') return false;
	const ObsSourceTypes: ObsInputKind[] = [
		'decklink-input',
		'wasapi_input_capture',
		'wasapi_output_capture',
		'browser_source',
		'color_source_v3',
		'monitor_capture',
		'game_capture',
		'image_source',
		'slideshow',
		'ffmpeg_source',
		'ndi_source',
		'text_gdiplus_v2',
		'dshow_input',
		'window_capture',
		'text_ft2_source_v2',
	];
	return (ObsSourceTypes as string[]).indexOf(test) != -1;
}

function isObsBlendMode(test: any): test is ObsBlendMode {
	if (typeof test !== 'string') return false;
	const ObsBlendModes: ObsBlendMode[] = [
		'OBS_BLEND_NORMAL',
		'OBS_BLEND_ADDITIVE',
		'OBS_BLEND_SUBTRACT',
		'OBS_BLEND_SCREEN',
		'OBS_BLEND_MULTIPLY',
		'OBS_BLEND_LIGHTEN',
		'OBS_BLEND_DARKEN',
	];
	return (ObsBlendModes as string[]).indexOf(test) != -1;
}

function IsObsSceneItemTransform(test: any): test is ObsSceneItemTransform {
	if (typeof test !== 'object') return false;
	if (test === null) return false;
	return (
		typeof test.positionX === 'number' &&
		typeof test.positionY === 'number' &&
		isObsAlignment(test.alignment) &&
		typeof test.rotation === 'number' &&
		typeof test.scaleX === 'number' &&
		typeof test.scaleY === 'number' &&
		typeof test.cropTop === 'number' &&
		typeof test.cropRight === 'number' &&
		typeof test.cropBottom === 'number' &&
		typeof test.cropLeft === 'number' &&
		isObsBoundsType(test.boundsType) &&
		isObsAlignment(test.boundsAlignment) &&
		typeof test.boundsWidth === 'number' &&
		typeof test.boundsHeight === 'number' &&
		typeof test.sourceWidth === 'number' &&
		typeof test.sourceHeight === 'number' &&
		typeof test.width === 'number' &&
		typeof test.height === 'number'
	);
}

function isObsAlignment(test: any): test is ObsAlignment {
	if (typeof test !== 'number') return false;
	const ObsAlignments: ObsAlignment[] = [5, 4, 6, 1, 0, 2, 9, 8, 10];
	return (ObsAlignments as number[]).indexOf(test) != -1;
}

function isObsBoundsType(test: any): test is ObsBoundsType {
	if (typeof test !== 'string') return false;
	const ObsBoundsTypes: ObsBoundsType[] = [
		'OBS_BOUNDS_STRETCH',
		'OBS_BOUNDS_SCALE_INNER',
		'OBS_BOUNDS_SCALE_OUTER',
		'OBS_BOUNDS_SCALE_TO_WIDTH',
		'OBS_BOUNDS_SCALE_TO_HEIGHT',
		'OBS_BOUNDS_MAX_ONLY',
		'OBS_BOUNDS_NONE',
	];
	return (ObsBoundsTypes as string[]).indexOf(test) != -1;
}
