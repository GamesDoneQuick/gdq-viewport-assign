import ObsWebSocket from 'obs-websocket-js';
import obsWebsocketJs from 'obs-websocket-js';
let connectedToOBS = false;
let currentSceneViewports: viewport[] = [];
let unassignedFeeds: viewport['assignedFeeds'] = [];
let currentSceneFeedScenes: string[] = [];
let videoFeeds: ObsWebSocket.SceneItem[] = [];
let selectedFeedsScene = '';
let pgm: string;
let pvw: string | null;
let sendingChanges = false;
let inInit = false;
const sourceIcons: {
  [key in obsSourceType]: string;
} = require('./source-icons.json');

function obsError(err: any) {
  document.getElementById('footer').innerHTML = 'ERROR: ' + JSON.stringify(err);
  document.getElementById('footer').onclick = populateFooter;
  console.error(err);
}
function hideWarning() {
  document.getElementById('warning').classList.add('hide');
}
function showWarning(msg: string) {
  document.getElementById('warning-msg').innerHTML = msg;
  document.getElementById('warning').classList.remove('hide');
}

const obs = new obsWebsocketJs();
function connectToOBS() {
  showWarning('Connecting dashboard to OBS');
  obs
    .connect({ address: 'localhost:4444', password: 'pbmax' })
    .then(() => {
      connectedToOBS = true;
      hideWarning();
      initOBS();
    })
    .catch((err) => {
      showWarning('Connection error: ' + err + '</BR>Retrying...');
    });
}
connectToOBS();
populateFooter();

obs.on('ConnectionClosed', () => {
  showWarning('OBS connection closed. Reconnecting...');
  setTimeout(() => {
    connectToOBS();
  }, 5000);
});

const reInitEvents = [
  'SwitchScenes',
  'PreviewSceneChanged',
  'StudioModeSwitched',
  'SceneCollectionChanged',
  'SourceCreated',
  'SourceDestroyed',
  'SourceRenamed',
  'SceneItemAdded',
  'SceneItemRemoved',
  'SceneItemTransformChanged',
] as const;
for (let i = 0; i < reInitEvents.length; i++) {
  obs.on(reInitEvents[i], () => {
    initOBS();
    //console.log(reInitEvents[i]);
  });
}

obs.on('SceneItemVisibilityChanged', (data) => {
  const activeScene = pvw ? pvw : pgm;
  if (
    data['scene-name'] == activeScene &&
    currentSceneFeedScenes.indexOf(data['item-name']) != -1
  )
    initOBS();
});

function initOBS() {
  if (!connectedToOBS) {
    obsError("Can't init, not connected");
    return;
  }
  if (sendingChanges) return;
  if (inInit) {
    obsError('initOBS called too frequently');
    return;
  }
  inInit = true;
  let sceneItems: ObsWebSocket.SceneItem[] = [];
  obs
    .send('GetPreviewScene')
    .then((data) => {
      pvw = data.name;
      sceneItems = data.sources;
    })
    .catch(() => {
      pvw = null;
    })
    .then(() => {
      return obs.send('GetSceneList');
    })
    .then((data) => {
      pgm = data['current-scene'];
      const currentScene =
        data.scenes[
          data.scenes.map((x) => x.name).indexOf(data['current-scene'])
        ];
      if (currentScene && !pvw) sceneItems = currentScene.sources;

      videoFeeds = [];
      const videoFeedsScene =
        data.scenes[data.scenes.map((x) => x.name).indexOf('Video Feeds')];
      if (videoFeedsScene) videoFeeds = videoFeedsScene.sources;
    })
    .then(() => {
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

async function updateFromCurrentSceneItems(items: ObsWebSocket.SceneItem[]) {
  selectedFeedsScene = '';
  currentSceneFeedScenes = [];
  currentSceneViewports = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].name.slice(-10) == '_reference') {
      await obs
        .send('GetSceneItemProperties', {
          'scene-name': pvw ? pvw : pgm,
          item: { id: items[i].id },
        })
        .then((data) => {
          currentSceneViewports.push({
            name: data.name.slice(0, -10),
            x: data.position.x,
            y: data.position.y,
            width: data.width,
            height: data.height,
            assignedFeeds: [],
          });
        })
        .catch((err) => {
          obsError(err);
          currentSceneViewports = [];
          return;
        });
    }
    if (items[i].name.slice(0, 5) == 'Feeds') {
      currentSceneFeedScenes.push(items[i].name);
      if (items[i].render)
        if (!selectedFeedsScene) {
          selectedFeedsScene = items[i].name;
        } else {
          await obs.send('SetSceneItemProperties', {
            'scene-name': pvw ? pvw : pgm,
            item: { id: items[i].id },
            visible: false,
            position: {},
            scale: {},
            crop: {},
            bounds: {},
          });
        }
    }
  }
}

function populateViewportsFromActiveFeed() {
  unassignedFeeds = [];
  for (let i = 0; i < currentSceneViewports.length; i++)
    currentSceneViewports[i].assignedFeeds = [];
  if (!selectedFeedsScene) return;
  let sceneItemList: obsSceneItems = [];
  return obs
    .send('GetSceneItemList', { sceneName: selectedFeedsScene })
    .then(async (data) => {
      sceneItemList = data.sceneItems;
      for (let i = 0; i < data.sceneItems.length; i++) {
        await obs
          .send('GetSceneItemProperties', {
            'scene-name': selectedFeedsScene,
            item: { id: data.sceneItems[i].itemId },
          })
          .then((data) => {
            const itemRef: viewport['assignedFeeds'][number] = {
              'scene-name': selectedFeedsScene,
              item: { id: data.itemId, name: data.name },
              type: sceneItemList[i].sourceKind,
            };
            let assigned = false;
            for (let i = 0; i < currentSceneViewports.length; i++) {
              if (
                currentSceneViewports[i].x == data.position.x &&
                currentSceneViewports[i].y == data.position.y &&
                currentSceneViewports[i].width == data.bounds.x &&
                currentSceneViewports[i].height == data.bounds.y
              ) {
                currentSceneViewports[i].assignedFeeds.push(itemRef);
                assigned = true;
                break;
              }
            }
            if (!assigned) unassignedFeeds.push(itemRef);
          })
          .catch(obsError);
      }
    })
    .catch(obsError)
    .then(() => {
      //delete this .then()? It works
      console.log('viewports');
      console.log(currentSceneViewports.map((x) => x.assignedFeeds));
      console.log('unassigned');
      console.log(unassignedFeeds);
    });
}

async function refreshViewportsDiv() {
  const feedSelect = document.getElementById('feed-select');
  feedSelect.innerHTML = '';
  for (let i = 0; i < currentSceneFeedScenes.length; i++) {
    const feedBtn = document.createElement('div');
    feedBtn.classList.add('selection-item');
    if (currentSceneFeedScenes[i] == selectedFeedsScene)
      feedBtn.classList.add('selected');
    feedBtn.innerHTML = currentSceneFeedScenes[i];
    feedBtn.onclick = async () => {
      await selectFeed(currentSceneFeedScenes[i]);
      for (let i = 0; i < feedSelect.children.length; i++) {
        if (feedSelect.children[i].innerHTML == selectedFeedsScene) {
          feedSelect.children[i].classList.add('selected');
        } else feedSelect.children[i].classList.remove('selected');
      }
    };
    feedSelect.appendChild(feedBtn);
  }
  const listDiv = document.getElementById('viewports-list');
  listDiv.innerHTML = '';
  for (let i = 0; i <= currentSceneViewports.length; i++) {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('viewport-header');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('viewport-title');
    let viewportFeeds: typeof unassignedFeeds;
    if (i == currentSceneViewports.length) {
      if (unassignedFeeds.length == 0) break;
      titleDiv.innerHTML = 'Unassigned';
      headerDiv.appendChild(titleDiv);

      const removeSources = document.createElement('img');
      removeSources.classList.add('icon');
      removeSources.src = 'assets/trash.svg';
      removeSources.onclick = () => {
        if (confirm('Delete all unassigned video feeds?'))
          removeUnassignedSources();
      };
      headerDiv.appendChild(removeSources);

      viewportFeeds = unassignedFeeds;
    } else {
      titleDiv.innerHTML = currentSceneViewports[i].name;
      headerDiv.appendChild(titleDiv);
      const addSource = document.createElement('img');
      addSource.classList.add('icon');
      addSource.src = 'assets/plus.svg';
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
      const type = viewportFeeds[j].type;
      if (
        sourceIcons.hasOwnProperty(type) &&
        sourceIcons[type as obsSourceType]
      ) {
        typeIcon.src = 'assets/sources/' + sourceIcons[type as obsSourceType];
      } else typeIcon.src = 'assets/sources/default.svg';
      sourceDiv.appendChild(typeIcon);
      const text = document.createElement('div');
      text.classList.add('source-text');
      text.innerHTML += viewportFeeds[j].item.name;
      sourceDiv.appendChild(text);
      const trashIcon = document.createElement('img');
      trashIcon.classList.add('icon');
      trashIcon.style.float = 'right';
      trashIcon.src = 'assets/trash.svg';
      trashIcon.onclick = () => {
        sendingChanges = true;
        obs
          .send('DeleteSceneItem', {
            scene: viewportFeeds[j]['scene-name'],
            item: viewportFeeds[j].item,
          })
          .then(() => {
            viewportFeeds.splice(j, 1);
          })
          .catch(obsError)
          .then(() => {
            sendingChanges = false;
            refreshViewportsDiv();
          });
      };
      sourceDiv.appendChild(trashIcon);
      const cropIcon = document.createElement('img');
      cropIcon.classList.add('icon');
      cropIcon.style.float = 'right';
      cropIcon.src = 'assets/crop.svg';
      sourceDiv.appendChild(cropIcon);
      viewportSourcesDiv.appendChild(sourceDiv);
    }
    listDiv.appendChild(viewportSourcesDiv);

    /* let cropBtn = document.createElement('div');
    cropBtn.classList.add('crop-button');
    cropBtn.innerHTML = 'Crop';
    listDiv.appendChild(cropBtn); */
  }
}

async function removeUnassignedSources() {
  sendingChanges = true;
  for (let i = 0; i < unassignedFeeds.length; i++) {
    await obs
      .send('DeleteSceneItem', {
        scene: unassignedFeeds[i]['scene-name'],
        item: unassignedFeeds[i].item,
      })
      .catch(obsError);
  }
  unassignedFeeds = [];
  sendingChanges = false;
  refreshViewportsDiv();
}

async function selectFeed(feed: string) {
  selectedFeedsScene = feed;
  sendingChanges = true;
  for (let i = 0; i < currentSceneFeedScenes.length; i++) {
    let visible = false;
    if (currentSceneFeedScenes[i] == feed) visible = true;
    await obs.send('SetSceneItemProperties', {
      'scene-name': pvw ? pvw : pgm,
      item: { name: currentSceneFeedScenes[i] },
      visible: visible,
      crop: {},
      bounds: {},
      position: {},
      scale: {},
    });
  }
  sendingChanges = false;
}

//TODO: modify this function:
function populateFooter() {
  const footer = document.getElementById('footer');
  footer.innerHTML = '';
  /* footer.onclick = null;
  let icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/plus.svg';
  //icon.onclick = plus;
  footer.appendChild(icon);
  icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/minus.svg';
  footer.appendChild(icon);
  icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/general.svg';
  footer.appendChild(icon);
  icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/up.svg';
  icon.style.marginLeft = '16px';
  footer.appendChild(icon);
  icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/down.svg';
  footer.appendChild(icon); */
}

async function addSourceOnclick(
  viewport: viewport,
  headerDiv: HTMLDivElement,
  reset: () => void
) {
  await new Promise((res) => setTimeout(res, 1)); //allow click to propagate first;
  const addSourceDiv = document.createElement('div');
  addSourceDiv.id = 'add-source';
  for (let i = 0; i < videoFeeds.length; i++) {
    const sourceDiv = document.createElement('div');
    sourceDiv.classList.add('source');
    const icon = document.createElement('img');
    icon.classList.add('icon');
    const type = videoFeeds[i].type;
    if (
      sourceIcons.hasOwnProperty(type) &&
      sourceIcons[type as obsSourceType]
    ) {
      icon.src = 'assets/sources/' + sourceIcons[type as obsSourceType];
    } else icon.src = 'assets/sources/default.svg';
    sourceDiv.appendChild(icon);
    const text = document.createElement('div');
    text.classList.add('source-text');
    text.innerHTML += videoFeeds[i].name;
    sourceDiv.appendChild(text);
    sourceDiv.onclick = () => {
      document.onclick = null;
      headerDiv.removeChild(addSourceDiv);
      reset();
      addSourceToViewport(videoFeeds[i].name, videoFeeds[i].type, viewport);
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

//TODO: delete this function:
/* function selectDest(source: string, div: HTMLDivElement) {
  console.log(source);
  div.innerHTML = '';
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');
  if (currentSceneViewports.length < 1) {
    titleDiv.innerHTML = 'No viewports to map a source to';
    div.appendChild(titleDiv);
    return;
  }
  titleDiv.innerHTML = 'Select viewport:';
  div.appendChild(titleDiv);
  for (let i = 0; i < currentSceneViewports.length; i++) {
    const elem = document.createElement('div');
    elem.classList.add('scene-item');
    elem.innerHTML = currentSceneViewports[i].name;
    elem.onclick = (e) => {
      e.stopPropagation();
      //sourcetoViewport(source, currentSceneViewports[i]);
    };
    div.appendChild(elem);
  }
} */

async function addSourceToViewport(
  source: string,
  type: string,
  viewport: viewport
) {
  sendingChanges = true;
  const scene = selectedFeedsScene;
  let newItem: typeof unassignedFeeds[number];
  obs
    .send('AddSceneItem', { sceneName: scene, sourceName: source })
    .then((data) => {
      newItem = {
        'scene-name': scene,
        type: type,
        item: { id: data.itemId, name: source },
      };
      return obs.send('SetSceneItemProperties', {
        'scene-name': scene,
        item: newItem.item,
        position: { x: viewport.x, y: viewport.y },
        locked: true,
        scale: {},
        crop: {},
        bounds: {
          type: 'OBS_BOUNDS_SCALE_INNER',
          x: viewport.width,
          y: viewport.height,
        },
      });
    })
    .catch(obsError)
    .then(() => {
      sendingChanges = false;
      const viewportIndex = currentSceneViewports
        .map((x) => x.name)
        .indexOf(viewport.name);
      if (viewportIndex != -1 && newItem) {
        currentSceneViewports[viewportIndex].assignedFeeds.push(newItem);
        refreshViewportsDiv();
      } else initOBS();
    });
}
