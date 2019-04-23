export class JSLoader {
  constructor({baseURL = window.location.host} = {}) {
    this.baseURL = baseURL;
  }

  loadMap({map} = {}) {
    // remove other canvases in game-container div
    let game = document.getElementById("game-container");
    game.removeChild(game.childNodes[0]);

    // remove the game src before creating the new one
    document.getElementById("map").remove();

    this.loadJS({
      url: "js/Modules/Maps/" + map
    });
  }

  loadJS({url, callback = null, location = document.body} = {}) {
    // url: is URL of external file 
    // callback: is the code to be called from the file 
    // location: is the location to insert the <script> element

    let scriptTag = document.createElement("script");
    scriptTag.src = url;

    let attrType = document.createAttribute("type");
    attrType.value = "module"; 
    scriptTag.setAttributeNode(attrType);

    let attrId = document.createAttribute("id");
    attrId.value = "map"; 
    scriptTag.setAttributeNode(attrId);

    location.appendChild(scriptTag);
  }
}