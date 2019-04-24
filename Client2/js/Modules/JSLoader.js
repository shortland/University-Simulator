export class JSLoader {
  constructor({baseURL = window.location.host} = {}) {
    this.baseURL = baseURL;
  }

  loadMap({map, prevMapLoc} = {}) {
    let noCache = "?nocache=" + Math.random();
    let map_url = "js/Modules/Maps/" + map + noCache;
    if (map == "MAIN") {
      map_url = "js/index.js" + noCache;
    }

    // remove other canvases in game-container div
    let game = document.getElementById("game-container");
    game.removeChild(game.childNodes[0]);

    // remove the game src before creating the new one
    let domMap = document.getElementById("map");
    domMap.remove();

    let newMapLoc = domMap.getAttribute("prevmaploc");
    if (newMapLoc != null && newMapLoc != undefined) {
      prevMapLoc = newMapLoc;
    }

    this.loadJS({
      url: map_url,
      attrPrevMaploc: prevMapLoc
    });
  }

  loadJS({url, attrPrevMaploc = null, callback = null, location = document.body} = {}) {
    // url: is URL of external file 
    // location: is the location to insert the <script> element

    let scriptTag = document.createElement("script");
    scriptTag.src = url;

    let attrType = document.createAttribute("type");
    attrType.value = "module"; 
    scriptTag.setAttributeNode(attrType);

    let attrId = document.createAttribute("id");
    attrId.value = "map"; 
    scriptTag.setAttributeNode(attrId);

    if (attrPrevMaploc !== null) {
      let attrId = document.createAttribute("prevmaploc");
      if ((attrPrevMaploc + "".indexOf(',') !== -1) && (typeof attrPrevMaploc == "string")) {
        attrId.value = attrPrevMaploc;
      } else {
        attrId.value = attrPrevMaploc.x + "," + attrPrevMaploc.y; 
      }
      scriptTag.setAttributeNode(attrId);
    }

    location.appendChild(scriptTag);
  }
}