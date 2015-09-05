/**
 * Class containing the game, handles drawing and updates.
 * Author: Alvin Lin (alvin.lin@stuypulse.com)
 */

/**
 * Creates a game on the client side to manage and render the players,
 * projectiles, and powerups.
 * @constructor
 * @param {Element} canvas The HTML5 canvas to render the game on.
 * @param {Socket} socket The socket connected to the server.
 */
function Game(canvas, socket) {
  this.canvas = canvas;
  this.canvas.width = Game.WIDTH;
  this.canvas.height = Game.HEIGHT;
  this.canvasContext = this.canvas.getContext('2d');

  this.socket = socket;
  this.packetNumber_ = 0;

  this.drawing = new Drawing(this.canvasContext);
  this.viewPort = new ViewPort();
  this.environment = new Environment(this.viewPort, this.drawing);

  this.id = null;
  this.players = [];
  this.projectiles = [];
  this.powerups = [];
  this.explosions = [];
};

Game.WIDTH = 800;
Game.HEIGHT = 600;
Game.SHOOTING_INTERVAL = 800;

/**
 * Stores this client's socket ID after getting it back from the server.
 * @param {string} id This client's socket ID.
 */
Game.prototype.setID = function(id) {
  this.id = id;
  this.viewPort.setID(id);
};

/**
 * Returns the object in the players array that represents this client's
 * player instance.
 * @return {Object}
 */
Game.prototype.getSelf = function() {
  for (var i = 0; i < this.players.length; ++i) {
    if (this.players[i].id == this.id) {
      return this.players[i];
    }
  }
  return null;
};

/**
 * Applies the user's movement client side regardless of server sider
 * validation while we wait for the server to return packets. This is
 * essentially a copy of server side Player class's updateOnInput() method.
 */
Game.prototype.applyAction = function(action) {
};

/**
 * Updates the game's internal storage of all the powerups, called each time
 * the server sends packets.
 * @param {Object} state
 */
Game.prototype.receiveGameState = function(state) {
  this.players = state.players;
  this.projectiles = state.projectiles;
  this.powerups = state.powerups;
};

/**
 * Starts an explosion animation given an object representing a bullet that
 * has reached the end of it's path or collided with a player.
 * @param {Object} object
 * @todo Finish this method
 */
Game.prototype.createExplosion = function(object) {
  var point = [object.x, object.y];
};

/**
 * Updates the state of the game client side and relays intents to the
 * server.
 */
Game.prototype.update = function() {
  var self = this.getSelf();
  if (self) {
    this.viewPort.update(self.x, self.y);

    var turretAngle = Math.atan2(
      Input.MOUSE[1] - Game.HEIGHT / 2,
      Input.MOUSE[0] - Game.WIDTH / 2) + Math.PI / 2;

    // Emits an event for the containing the player's intention to move
    // or shoot to the server.
    var action = {
      keyboardState: {
        up: Input.UP,
        right: Input.RIGHT,
        down: Input.DOWN,
        left: Input.LEFT
      },
      turretAngle: turretAngle,
      shot: Input.LEFT_CLICK,
      timestamp: (new Date()).getTime()
    };
    this.socket.emit('player-action', action);
  }

  // Updates the leaderboard.
  this.players.sort(function(o1, o2) {
    return o2.score > o1.score;
  });
  $('#leaderboard').empty();
  for (var i = 0; i < Math.min(this.players.length, 10); ++i) {
    $('#leaderboard').append($('<li>').text(
      this.players[i].name + ": " + this.players[i].score))
  };
};

/**
 * Draws the state of the game onto the HTML5 canvas.
 */
Game.prototype.draw = function() {
  this.canvasContext.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

  this.environment.draw();

  for (var i = 0; i < this.projectiles.length; ++i) {
    this.drawing.drawBullet(
      this.viewPort.toCanvasCoords(this.projectiles[i]),
      this.projectiles[i].direction);
  }

  for (var i = 0; i < this.powerups.length; ++i) {
    this.drawing.drawPowerup(
      this.viewPort.toCanvasCoords(this.powerups[i]),
      this.powerups[i].name);
  }

  for (var i = 0; i < this.players.length; ++i) {
    this.drawing.drawTank(
      this.players[i].id == this.id,
      this.viewPort.toCanvasCoords(this.players[i]),
      this.players[i].orientation,
      this.players[i].turretAngle,
      this.players[i].name,
      this.players[i].health,
      this.players[i].powerups['shield_powerup']);
  }
};