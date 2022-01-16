import ObsWebSocket from 'obs-websocket-js';
import obsWebsocketJs from 'obs-websocket-js';
let connectedToOBS: boolean = false;
let currentSceneItems: ObsWebSocket.SceneItem[] = [];
let currentSceneViewports: viewport[];
let pgm: string;
let pvw: string | null;
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

function initOBS() {
  if (!connectedToOBS) {
    obsError("Can't init, not connected");
    return;
  }
  obs
    .send('GetPreviewScene')
    .then((data) => {
      currentSceneItems = data.sources;
      pvw = data.name;
    })
    .catch((err) => {
      pvw = null;
    })
    .then(() => {
      obs
        .send('GetCurrentScene')
        .then((data) => {
          pgm = data.name;
          if (!pvw) currentSceneItems = data.sources;
          refreshSceneItems();
        })
        .catch(obsError);
    })
    .catch((err) => {
      obsError(err);
    });
}

obs.on('SwitchScenes', (data) => {
  if (pvw === null) {
    currentSceneItems = data.sources;
    refreshSceneItems();
  }
});
obs.on('StudioModeSwitched', () => {
  initOBS();
});
obs.on('PreviewSceneChanged', (data) => {
  currentSceneItems = data.sources;
  refreshSceneItems();
});

function refreshSceneItems() {
  const mainDiv = document.getElementById('main');
  const warning = document.getElementById('warning');
  mainDiv.innerHTML = '';
  mainDiv.appendChild(warning);
  let viewportSources: sceneItemRef[] = [];
  for (let i = 0; i < currentSceneItems.length; i++) {
    if (currentSceneItems[i].name.slice(-10) == '_reference') {
      viewportSources.push({
        'scene-name': pvw ? pvw : pgm,
        item: { id: currentSceneItems[i].id },
      });
    } else {
      let elem = document.createElement('div');
      elem.classList.add('scene-item');
      let icon = document.createElement('img');
      icon.width = 16;
      icon.classList.add('icon');
      const type = currentSceneItems[i].type;
      if (
        sourceIcons.hasOwnProperty(type) &&
        sourceIcons[type as obsSourceType]
      ) {
        icon.src = 'assets/sources/' + sourceIcons[type as obsSourceType];
      } else icon.src = 'assets/sources/default.svg';
      elem.appendChild(icon);
      let text = document.createElement('div');
      text.classList.add('scene-item-text');
      text.innerHTML +=
        currentSceneItems[i].name + ' (' + currentSceneItems[i].id + ')';
      elem.appendChild(text);
      if (i == 0) elem.classList.add('selected');
      icon = document.createElement('img');
      icon.width = 16;
      icon.style.float = 'right';
      if (currentSceneItems[i].render) {
        icon.src = 'assets/visible.svg';
      } else icon.src = 'assets/invisible.svg';
      elem.appendChild(icon);
      mainDiv.appendChild(elem);
    }
  }
  populateViewports(viewportSources).catch(obsError);
}

async function populateViewports(sources: sceneItemRef[]) {
  currentSceneViewports = [];
  for (let i = 0; i < sources.length; i++) {
    await obs
      .send('GetSceneItemProperties', sources[i])
      .then((data) => {
        currentSceneViewports.push({
          name: data.name.slice(0, -10),
          x: data.position.x,
          y: data.position.y,
          width: data.width,
          height: data.height,
        });
      })
      .catch((err) => {
        obsError(err);
        currentSceneViewports = [];
        return;
      });
  }
}

function populateFooter() {
  const footer = document.getElementById('footer');
  footer.innerHTML = '';
  footer.onclick = null;
  let icon = document.createElement('img');
  icon.width = 16;
  icon.classList.add('icon', 'footer');
  icon.src = 'assets/plus.svg';
  icon.onclick = plus;
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
  footer.appendChild(icon);
}

function plus() {
  if (!connectedToOBS) {
    obsError('Not Connected');
    return;
  }
  let addSourceDiv = document.createElement('div');
  obs.send('GetSceneItemList', { sceneName: 'Video Feeds' }).then((data) => {
    addSourceDiv.id = 'add-source';
    for (let i = 0; i < data.sceneItems.length; i++) {
      let elem = document.createElement('div');
      elem.classList.add('scene-item');
      let icon = document.createElement('img');
      icon.width = 16;
      icon.classList.add('icon');
      const type = data.sceneItems[i].sourceKind;
      if (
        sourceIcons.hasOwnProperty(type) &&
        sourceIcons[type as obsSourceType]
      ) {
        icon.src = 'assets/sources/' + sourceIcons[type as obsSourceType];
      } else icon.src = 'assets/sources/default.svg';
      elem.appendChild(icon);
      let text = document.createElement('div');
      text.classList.add('scene-item-text');
      text.innerHTML += data.sceneItems[i].sourceName;
      elem.appendChild(text);
      elem.onclick = (e) => {
        e.stopPropagation();
        selectDest(data.sceneItems[i].sourceName, addSourceDiv);
      };
      addSourceDiv.appendChild(elem);
    }
    document.onclick = (e) => {
      if (
        e.target !== addSourceDiv &&
        !addSourceDiv.contains(e.target as Node)
      ) {
        document.onclick = null;
        populateFooter();
      }
    };
    document.getElementById('footer').innerHTML = ''; //prevent buttons from being pushed while popup is present
    document.getElementById('footer').appendChild(addSourceDiv);
  });
}

function selectDest(source: string, div: HTMLDivElement) {
	console.log(source)
  div.innerHTML = '';
  let titleDiv = document.createElement('div');
  titleDiv.classList.add('title');
  if (currentSceneViewports.length < 1) {
    titleDiv.innerHTML = 'No viewports to map a source to';
    div.appendChild(titleDiv);
    return;
  }
  titleDiv.innerHTML = 'Map to viewport:';
  div.appendChild(titleDiv);
  for (let i = 0; i < currentSceneViewports.length; i++) {
    let elem = document.createElement('div');
    elem.classList.add('scene-item');
    elem.innerHTML = currentSceneViewports[i].name;
    elem.onclick = (e) => {
      e.stopPropagation();
      sourcetoViewport(source, currentSceneViewports[i]);
    };
    div.appendChild(elem);
  }
}

function sourcetoViewport(source: string, viewport: viewport) {
  console.log(source);
  let scene = pgm;
  if (pvw) scene = pvw;
  obs
    .send('AddSceneItem', { sceneName: scene, sourceName: source })
    .then((data) => {
      return obs.send('SetSceneItemProperties', {
        'scene-name': scene,
        item: { id: data.itemId },
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
    .catch(obsError);
}
