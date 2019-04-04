var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
  create: function() {
    this.map = this.game.add.tilemap('mymap');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('background');
    this.blockedLayer = this.map.createLayer('collidables');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'collidables');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    this.createItems();
    this.createDoors();    

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer')
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.player.animations.add('walk', [6,7,8,9]);
    this.player.animations.add('walkingRight', [4,5]);
    this.player.animations.add('walkingLeft', [2,3]);
    this.player.animations.add('walkingDown', [0,1]);
    //this.player.animations.add('walkingRight');
    //this.player.animations.add('walkingRight', Phaser.Animation.generateFrameNames('lookingright.png', 0, 1), 10, true);
    this.game.physics.arcade.enable(this.player);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.mouses = this.game.input.mouse.capture = true;

    //Pathfinder
    //this.player.pivot.setTo(0.5, 0.5);
    // velocity differentiator
    this.velocityDifference = 512;
    // Create the binary graph for AStar
    this.binaryGraph = this.createBinaryGraph();
    // console.log(this.binaryGraph);
    // show path
    // we're already at the correct destination
    this.finalDestinationX = -1;
    this.finalDestinationY = -1;
    this.isPositionCorrectedX = true;
    this.isPositionCorrectedY = true;
    this.game.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(this.togglePathView, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.G).onDown.add(this.promptPosition, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.M).onDown.add(this.increaseVelocity, this);
    this.game.input.keyboard.addKey(Phaser.Keyboard.N).onDown.add(this.decreaseVelocity, this);
    this.game.input.activePointer.leftButton.onDown.add(this.leftClicked, this);
    
    // console.log('X:' + this.game.input.activePointer.worldX);
    // console.log('Y:' + this.game.input.activePointer.worldY);

    // console.log(this.blockedLayer.layer.data);
    //this.blockedLayer.layer.data
    this.traversalPosition = 0;
    this.traversalGroup = new Array()
  },
  promptPosition: function() {
    let response = prompt("Please enter coordinates to go to, comma delimited; x,y:", "1,1");
    let positions = response.split(",");
    this.finalDestinationX = Math.floor(Math.floor(parseInt(positions[0]) * 128) / 128);
    this.finalDestinationY = Math.floor(Math.floor(parseInt(positions[1]) * 128) / 128);
    this.isPositionCorrectedX = false;
    this.isPositionCorrectedY = false;
    //console.log(this.finalDestinationX, this.finalDestinationY);
    this.beginAStarMovement();
  },
  render: function() {
    this.game.debug.spriteInfo(this.player, 100, 100);
  },
  increaseVelocity: function() {
    this.velocityDifference += 64;
    console.log(this.velocityDifference);
    // if (this.velocityDifference >= 960) {
    //   alert("The current velocity is '" + this.velocityDifference + "', This is the max allowed velocity (if you were going faster, you'd be going fast enough to go through walls!)");
    //   this.velocityDifference = 960;
    // }
  },
  decreaseVelocity: function() {
    this.velocityDifference -= 64;
    console.log(this.velocityDifference);
    // if (this.velocityDifference <= 0) {
    //   alert("The current velocity is '" + this.velocityDifference + "', which is <=0... Velocity is being reset to defaults");
    //   this.velocityDifference = 512;
    // }
  },
  createItems: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    
    result = this.findObjectsByType('item', this.map, 'objectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },
  createDoors: function() {
    //create doors
    this.doors = this.game.add.group();
    this.doors.enableBody = true;
    result = this.findObjectsByType('door', this.map, 'objectsLayer');

    result.forEach(function(element){
      this.createFromTiledObject(element, this.doors);
    }, this);
  },
  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    //console.log(this.blockedLayer);
    //this.player.rotation += 0.05;

    //player movement
    this.player.body.velocity.x = 0;

    // is moving var
    let isMoving = false;

    // movement using arrow key buttons
    if(this.cursors.up.isDown) {
      isMoving = true;
      if(this.player.body.velocity.y == 0) {
        this.player.body.velocity.y -= this.velocityDifference;
        if (!this.player.animations.isPlaying) {
          this.player.animations.play('walk', 10, true);
        }
      }
    }
    else if(this.cursors.down.isDown) {
      isMoving = true;
      if(this.player.body.velocity.y == 0) {
        this.player.body.velocity.y += this.velocityDifference;
        if (!this.player.animations.isPlaying) {
          this.player.animations.play('walk', 10, true);
        }      
      }
    }
    else {
      this.player.body.velocity.y = 0;
    }
    if(this.cursors.left.isDown) {
      isMoving = true;
      this.player.body.velocity.x -= this.velocityDifference;
      if (!this.player.animations.isPlaying) {
        this.player.animations.play('walk', 10, true);
      }
    }
    else if(this.cursors.right.isDown) {
      isMoving = true;
      this.player.body.velocity.x += this.velocityDifference;
      if (!this.player.animations.isPlaying) {
        this.player.animations.play('walk', 10, true);
      }
    }

    // movement using pathfinding click
    // if (!this.isPositionCorrectedX) {
    //   isMoving = true;
    //   this.movePlayerToX(this.moveToPositionCorrectedX);
    //   if (!this.player.animations.isPlaying) {
    //     this.player.animations.play('walk', 10, true);
    //   }
    // }
    // if (!this.isPositionCorrectedY) {
    //   isMoving = true;
    //   this.movePlayerToY(this.moveToPositionCorrectedY);
    //   if (!this.player.animations.isPlaying) {
    //     this.player.animations.play('walk', 10, true);
    //   }
    // }
    if ((this.traversalGroup.length != this.traversalPosition) && (this.finalDestinationX != -1)) {
      // console.log("we're iterating through traversal group");
      // console.log(this.traversalPosition);
      // console.log(this.isPositionCorrectedX, this.isPositionCorrectedY);
      // console.log(this.traversalGroup);
      if (!this.isPositionCorrectedX) {
        isMoving = true;
        // console.log("moving x to:", this.traversalGroup[this.traversalPosition].x);
        this.movePlayerToX(this.traversalGroup[this.traversalPosition].x);
        if (!this.player.animations.isPlaying) {
          if (this.traversalGroup[this.traversalPosition].x * 128 > this.player.position.x) {
            //console.log('walking right animation');
            this.player.animations.play('walkingRight', 30, true);
          } else {
            //console.log('walking left animation');
            this.player.animations.play('walkingLeft', 30, true);
          }
        }
      }
      if (!this.isPositionCorrectedY) {
        isMoving = true;
        // console.log("moving y to:", this.traversalGroup[this.traversalPosition].y);
        this.movePlayerToY(this.traversalGroup[this.traversalPosition].y);
        if (!this.player.animations.isPlaying) {
          if (this.traversalGroup[this.traversalPosition].y * 128 > this.player.position.y) {
            this.player.animations.play('walkingDown', 30, true);
          } else {
            this.player.animations.play('walk', 10, true);
          }
        }
      }
      if (this.isPositionCorrectedX && this.isPositionCorrectedY) {
        this.traversalPosition++;
        // console.log("incrementing position to: ", this.traversalPosition);
        if (this.traversalPosition != this.traversalGroup.length) {
          this.isPositionCorrectedX = false;
          this.isPositionCorrectedY = false;
        }
      }
    }

    if (!isMoving) {
      this.player.animations.stop();
    }
  },
  togglePathView: function() {
    let colored = -1;
    for (let i = 0; i < this.traversalGroup.length; ++i) {
      let x = this.traversalGroup[i].x;
      let y = this.traversalGroup[i].y;
      if (colored == -1) {
        if (this.backgroundlayer.layer.data[y][x].alpha == 1) {
          colored = 0;
        } else {
          colored = 1;
          this.showAllPathView();
          break;
        }
      }
      this.backgroundlayer.layer.data[y][x].alpha = colored;
    }
  },
  showAllPathView: function() {
    for (let i = 0; i < this.backgroundlayer.layer.data.length; ++i) {
      for (let j = 0; j < this.backgroundlayer.layer.data[i].length; ++j) {
        this.backgroundlayer.layer.data[i][j].alpha = 1;
      }
    }
  },
  movePlayerToAdjacent: function(x, y) {
    this.isPositionCorrectedX = false;
    this.moveToPositionCorrectedX = x;
    this.isPositionCorrectedY = false;
    this.moveToPositionCorrectedY = y;
  },
  movePlayerToX: function(x) {
    // console.log("move player x was called");
    if (((this.player.position.x - x * 128) <= 16 && (this.player.position.x - x * 128) >= 0) || ((x * 128 - this.player.position.x) <= 16 && (x * 128 - this.player.position.x >= 0))) {
      this.player.body.velocity.x = 0;
      this.player.position.x = Math.round(x * 128);
      this.isPositionCorrectedX = true;
      return;
    } else {
      if (this.player.position.x < x * 128) {
        this.player.body.velocity.x += this.velocityDifference;
        //console.log('moving right');
        //this.player = this.playerRight;
      } else if (this.player.position.x > x * 128) {
        this.player.body.velocity.x -= this.velocityDifference;
        //console.log('moving left');
      } else if (this.player.position.x == x * 128) {
        this.player.body.velocity.x = 0;
        this.isPositionCorrectedX = true;
      }
    }
  },
  movePlayerToY: function(y) {
    if (((this.player.position.y - y * 128) <= 16 && (this.player.position.y - y * 128) >= 0) || ((y * 128 - this.player.position.y) <= 16 && (y * 128 - this.player.position.y >= 0))) {
      this.player.body.velocity.y = 0;
      this.player.position.y = Math.round(y * 128);
      this.isPositionCorrectedY = true;
      return;
    } else {
      if (this.player.position.y < y * 128) {
        this.player.body.velocity.y += this.velocityDifference;
      } else if (this.player.position.y > y * 128) {
        this.player.body.velocity.y -= this.velocityDifference;
      } else if (this.player.position.y == y * 128) {
        this.isPositionCorrectedY = true;
        this.player.body.velocity.y = 0;
      }
    }
  },
  leftClicked: function() {
    this.finalDestinationX = Math.floor(Math.floor(this.game.input.activePointer.worldX) / 128);
    this.finalDestinationY = Math.floor(Math.floor(this.game.input.activePointer.worldY) / 128);
    this.isPositionCorrectedX = false;
    this.isPositionCorrectedY = false;
    this.beginAStarMovement();
  },
  beginAStarMovement: function() {
    this.traversalPosition = 0;
    let start = this.binaryGraph.grid[Math.round(this.player.position.x / 128)][Math.round(this.player.position.y / 128)];
    let end;
    try {
      end = this.binaryGraph.grid[this.finalDestinationX][this.finalDestinationY];
    } catch(error) {
      alert("Unable to reach that destination");
    }
    this.traversalGroup = astar.search(this.binaryGraph, start, end);
    if (this.traversalGroup.length == 0) {
      alert("Unable to reach that destination");
    }
  },
  createBinaryGraph: function() {
    let binaryGraph = new Array((this.blockedLayer.layer.data).length);
    for (let i = 0; i < (this.blockedLayer.layer.data).length; ++i) {
      binaryGraph[i] = new Array((this.blockedLayer.layer.data[i]).length);
      for (let j = 0; j < (this.blockedLayer.layer.data[i]).length; ++j) {
        let collide = 1;
        if (this.blockedLayer.layer.data[j][i].collideDown) {
          collide = 0;
        }
        binaryGraph[i][j] = collide;
      }
    }
    return new Graph(binaryGraph);
  },
};