/**
 * Stores the state of the player on the server. This class will also store
 * other important information such as socket ID, packet number, and latency.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Constants = require('../lib/Constants')
const Vector = require('../lib/Vector')
const Entity = require('../lib/Entity')
const Util = require('../lib/Util')

/**
 * Player class.
 * @extends Entity
 */
class Player extends Entity {
  /**
   * Constructor for a Player object.
   * @constructor
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @param {Vector} position The player's starting location
   * @param {number} angle The player's starting tank angle
   */
  constructor(name, socketID, team) {
    super()

    this.name = name
    this.socketID = socketID
    this.team = "t1";

    this.lastUpdateTime = 0
    this.speed = Constants.PLAYER_DEFAULT_SPEED
    this.hitboxSize = Constants.PLAYER_RAD
    this.hasDisc = false;
    this.inEndzone = false;
    this.hasScored = false;
    this.timeWithDisc = 0;
    this.team = team
    this.stalledOut = false;
    this.inField = true;
  }

  /**
   * Creates a new Player object.
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @param {Team} team The associated team object
   * @return {Player}
   */
  static create(name, socketID, team) {
    const player = new Player(name, socketID, team)
    return player
  }

  /**
   * Update this player given the client's input data from Input.js
   * @param {Object} data A JSON Object storing the input state
   */
  updateOnInput(data) {
    if (data.up && data.left){
      this.velocity = Vector.fromArray([-this.speed/Math.sqrt(2), -this.speed/Math.sqrt(2)]);
    }
    else if (data.up && data.right){
      this.velocity = Vector.fromArray([this.speed/Math.sqrt(2), -this.speed/Math.sqrt(2)]);
    }
    else if (data.down && data.left){
      this.velocity = Vector.fromArray([-this.speed/Math.sqrt(2), this.speed/Math.sqrt(2)]);
    }
    else if (data.down && data.right){
      this.velocity = Vector.fromArray([this.speed/Math.sqrt(2), this.speed/Math.sqrt(2)]);
    }
    else if (data.left && data.right){
      this.velocity = Vector.zero();
    }
    else if (data.up && data.down){
      this.velocity = Vector.zero();
    }
    else if (data.up){
      this.velocity = Vector.fromArray([0, -this.speed]);
    }
    else if (data.left){
      this.velocity = Vector.fromArray([-this.speed, 0]);
    }
    else if (data.down){
      this.velocity = Vector.fromArray([0, this.speed]);
    }
    else if (data.right){
      this.velocity = Vector.fromArray([this.speed, 0]);
    }
    else{
      this.velocity = Vector.zero();
    }
  }

  /**
   * Stops the player when they have the disc.
   */
  stopMovement() {
    this.velocity = Vector.zero();
  }

  /**
   * Performs a physics update.
   * @param {number} lastUpdateTime The last timestamp an update occurred
   * @param {number} deltaTime The timestep to compute the update with
   */
  update(lastUpdateTime, deltaTime) {
    // this.old_position = this.position.copy()
    this.lastUpdateTime = lastUpdateTime
    this.position.add(Vector.scale(this.velocity, deltaTime))
    this.setHasScored()
    this.boundToWorld() // from entity
    this.setInField();

    if (this.hasDisc) this.timeWithDisc+=deltaTime;
    else this.timeWithDisc = 0;
  }

  /**
   * Return true if player has had disc for more than 10 seconds
   */
  get isStalledOut() {
    if (this.timeWithDisc >= Constants.STALL_OUT_TIME) this.stalledOut = true; // had to make this because of a weird problem with scope in the Drawing class.
    else this.stalledOut = false;
    return this.timeWithDisc > Constants.STALL_OUT_TIME; // 10s or 10000ms
  }

  /**
   * Return true if player is in their scoring endzone
   */
  isInEndzone() {
    if (this.team.scoringEndzone == Constants.SCORING_ENDZONE_BOT){ // bottom endzone
      return (this.position.y > Constants.FIELD_HEIGHT+Constants.FIELD_HEIGHT_OFFSET-Constants.ENDZONE_HEIGHT &&
              this.position.y < Constants.CANVAS_HEIGHT-Constants.FIELD_HEIGHT_OFFSET &&
              this.position.x > Constants.FIELD_MIN_X &&
              this.position.x < Constants.FIELD_MAX_X)
    }
    else{
      return (this.position.y > Constants.FIELD_HEIGHT_OFFSET && // top endzone
              this.position.y < Constants.FIELD_HEIGHT_OFFSET+Constants.ENDZONE_HEIGHT &&
              this.position.x > Constants.FIELD_MIN_X &&
              this.position.x < Constants.FIELD_MAX_X)
    }
  }

  setInField() {
    if (this.position.x > Constants.FIELD_MIN_X &&
        this.position.x < Constants.FIELD_MAX_X &&
        this.position.y > Constants.FIELD_MIN_Y &&
        this.position.y < Constants.FIELD_MAX_Y) {

      this.inField = true;
    }
    else {
      this.inField = false;
    }
  }

  /**
   * set true if player is in the endzone with the disc (scored!)
   */
  setHasScored() {
    if (this.isInEndzone() && this.hasDisc) this.hasScored = true;
    else this.hasScored = false;
  }


  /**
   * Set starting position of player
   * @param {Array} startPosition the x and y coordinates of the starting position
   */
  setStartPosition(startPosition) {
    this.position = Vector.fromArray(startPosition);
  }

  /**
   * Bound player position out of disc space radius
   * @param {Player} player a player object which may have disc.
   */
  boundPlayerDiscSpace(player) {
    if (player) { // a player does have the disc
      const positionVect = Vector.sub(this.position, player.position)
      if (positionVect.mag <= Constants.DISC_SPACE_RAD){
        this.position = Vector.add(player.position, Vector.fromPolar(Constants.DISC_SPACE_RAD, positionVect.angle))
      }
    }
  }

}

module.exports = Player
