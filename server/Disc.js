/**
 * This class stores the state of a bullet on the server.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Constants = require('../lib/Constants')
const Entity = require('../lib/Entity')
const Vector = require('../lib/Vector')

/**
 * Disc class.
 */
class Disc extends Entity {
  /**
   * Constructor for a Bullet object.
   * @constructor
   * @param {Vector} position The starting position vector
   * @param {Vector} velocity The starting velocity vector
   * @param {number} angle The orientation of the disc
   * @param {Player} source The Player object throwing the disc
   */
  constructor(position, velocity, angle, source) {
    // super(position, velocity, Vector.zero(), Constants.BULLET_HITBOX_SIZE)
    super(position)

    this.angle = angle
    this.source = source

    // this.damage = Constants.BULLET_DEFAULT_DAMAGE
    this.distanceTraveled = 0
    this.destroyed = false

    this.throwDest = new Vector()
    this.position = position
    this.speed = 0.3;
  }

  // /**
  //  * Creates a new Bullet object from a Player object firing it.
  //  * @param {Player} player The Player object firing the bullet
  //  * @param {number} [angleDeviation=0] The angle deviation if the bullet is
  //  *   not traveling in the direction of the turret
  //  * @return {Bullet}
  //  */
  // static createFromPlayer(player, angleDeviation = 0) {
  //   const angle = player.turretAngle + angleDeviation
  //   return new Bullet(
  //     player.position.copy(),
  //     Vector.fromPolar(Constants.BULLET_SPEED, angle),
  //     angle,
  //     player
  //   )
  // }

  /**
   * Creates a new Bullet object from a Player object firing it.
   * @param {Player} player The Player object firing the bullet
   * @param {number} [angleDeviation=0] The angle deviation if the bullet is
   *   not traveling in the direction of the turret
   * @return {Bullet}
   */
  static createNewDisc(position) {
    return new Disc(Vector.fromArray(position))
  }

  /**
   * Update the disc given the client's input data from Input.js
   * @param {Object} data A JSON Object storing the input state
   */
  updateOnInput(data) {
    if (this.mouseDown){
      this.distanceTraveled = 0;
      this.throwDest = Vector.fromArray(this.mouseDown);
      this.throwSrc = this.position;
      this.throwVect = Vector.sub(this.throwDest, this.throwSrc);
      this.throwDist = this.throwVect.mag();
      this.throwVectNorm = Vector.scale(this.throwVect, 1/this.throwVect.mag());
      this.velocity = Vector.scale(this.throwVectNorm, this.speed);
      // console.log(this.throwDest)
      // console.log(this.throwSrc)
      // console.log(this.throwVect)
      // console.log(this.velocity)
    }
    // else{
      // this.velocity = Vector.zero();
    // }
  }
  /**
   * Performs a physics update.
   * @param {number} lastUpdateTime The last timestamp an update occurred
   * @param {number} deltaTime The timestep to compute the update with
   */
  update(lastUpdateTime, deltaTime) {
    const distanceStep = Vector.scale(this.velocity, deltaTime)
    this.position.add(distanceStep)
    this.distanceTraveled += distanceStep.mag2
    // if (this.inWorld() || distanceStep > Disc.MAX_TRAVEL_DISTANCE_SQ) {
    if (this.inWorld() || this.distanceTraveled > this.ThrowDist) {
      this.velocity = Vector.zero()
    }
  }
}

module.exports = Disc
