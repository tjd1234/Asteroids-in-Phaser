// asteroids.js

//
// To do:
// - Improve explosions.
// - Improve sounds. Add background music? Add "themes" for to play when UFOs
//   are out?
// - On start screen, add fadeout to game start? Would give time for user to
//   move hand from mouse to keyboard.
// - On start screen, show scores for big, medium, and small rocks, and for
//   UFOs.
// - On start screen, show random rocks floating around the in the background?
// - Consider changes to respawn. Classic way can last a few seconds until there
//   is a clear space in the middle of the screen. But some other ideas are:
//     - let the player select where to respawn
//     - always respawn in the middle but with a few seconds of invincibility,
//       giving the player time to avoid rocks
//
//

function randSign() {
    return Phaser.Math.RND.pick([-1, 1]);
}

function flip() {
    return Phaser.Math.RND.pick([true, false]);
}

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "preloadScene" });
    }

    preload() {
        // load all shared assets here
        this.load.image("debris", "assets/debris.png");

        this.load.audio("shipLaserShot", "assets/shipLaserSound.mp3");
        this.load.audio("shipExplosion", "assets/shipExplosion.mp3");

        this.load.audio("ufoLaserShot", "assets/ufoLaserSound.mp3");
        this.load.audio("ufoExplosion", "assets/ufoExplosion.mp3");

        this.load.audio("rockExplosion", "assets/rockExplosion.mp3");

        this.load.audio("extraShip", "assets/extraShip.mp3");
    }

    create() {
        this.makeUFO();

        //
        // after the assets are loaded call the initial scene
        //
        this.scene.start("startScene");
    }

    makeUFO() {
        //
        // draw the ship as a graphics object for the reserve ships
        //
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff);

        const size = 50;

        const leftX = 0 * size;
        const rightX = size - leftX;

        const midLeftX = 0.25 * size;
        const midRightX = size - midLeftX;

        const mid2LeftX = 0.25 * size;
        const mid2RightX = size - mid2LeftX;

        const topY = 0.25 * size;
        const midTopY = 0.45 * size;
        const midBotY = 0.75 * size;
        const botY = 1 * size;

        graphics.beginPath();
        graphics.moveTo(mid2LeftX + 0.1 * size, topY); // 1, top left
        graphics.lineTo(mid2RightX - 0.1 * size, topY); // 2, top right
        graphics.lineTo(midRightX, midTopY); // 3, top middle right
        graphics.lineTo(rightX, midBotY); // 4, bottom middle right
        graphics.lineTo(midRightX, botY); // 5, bottom left
        graphics.lineTo(midLeftX, botY); // 6, bottom right
        graphics.lineTo(leftX, midBotY); // 7, bottom middle left
        graphics.lineTo(midLeftX, midTopY); // 8, top middle left
        graphics.closePath();
        graphics.strokePath();

        //
        // draw the lines across the middle of the ufo
        //
        graphics.beginPath();
        graphics.moveTo(midLeftX, midTopY); // 8, top middle left
        graphics.lineTo(midRightX, midTopY); // 3, top middle right
        graphics.lineTo(rightX, midBotY); // 4, bottom middle right
        graphics.lineTo(leftX, midBotY); // 7, bottom middle left
        graphics.closePath();
        graphics.strokePath();

        // generate a texture from the graphics object
        graphics.generateTexture("ufoTexture", size, size);
        // bigUFO = this.add.sprite(400, 300, "ufoTexture");
        // bigUFO.setScale(1);

        // delete the graphics object since it's no longer needed
        graphics.destroy();
    }
} // class PreloadScene

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "startScene" });
    }

    create() {
        //
        // add centered title text
        //
        const text = this.add.text(400, 250, "Rock Shooter", {
            fontSize: "64px",
            align: "center",
            fill: "#FFFF00",
        });
        // set the origin to 0.5 to center the text at its position
        text.setOrigin(0.5, 0.5);

        //
        // start the game when the mouse button is clicked
        //
        this.input.on("pointerdown", () => {
            this.scene.start("playScene");
        });

        // Add text centered on the button
        const clickText = this.add.text(400, 400, "Click to Play", {
            fontSize: "32px",
            fill: "#FFFFFF",
        });
        clickText.setOrigin(0.5, 0.5); // Center the text on the button
    } // create
} // class StartScene

class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: "scoreScene" });
    }

    create() {
        this.scoreText = this.add.text(10, 10, "Score: 0", {
            fontSize: "24px",
            fill: "#FFFFFF",
        });
        this.highScoreText = this.add.text(525, 10, "High Score: 0", {
            fontSize: "24px",
            fill: "#FFFFFF",
        });
    } // create

    update(time, delta) {
        //
        // Update the score text
        //
        this.scoreText.setText(`Score: ${game.score}`);
        this.highScoreText.setText(`High Score: ${game.highScore}`);

        // update the reserve ships
        for (let i = 0; i < game.reserveShips.length; i++) {
            game.reserveShips[i].setActive(false);
            game.reserveShips[i].setVisible(i < game.shipsInReserve);
        }
    } // update
} // class ScoreScene

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: "gameOverScene" });
    }

    create() {
        //
        // add centered title text
        //
        const text = this.add.text(400, 250, "Game Over", {
            fontSize: "64px",
            align: "center",
            fill: "#FFFF00",
        });
        // set the origin to 0.5 to center the text at its position
        text.setOrigin(0.5, 0.5);

        //
        // start the game when the mouse button is clicked
        //
        this.input.on("pointerdown", () => {
            game.score = 0;
            game.level = 1;
            game.nextBonusShipScore = 5000;
            game.shipsInReserve = 2;
            ufo.levelAppearanceCount = 0;
            this.scene.stop("ufoScene");
            this.scene.start("playScene");
        });

        // Add text centered on the button
        const buttonText = this.add.text(400, 400, "Click to Play Again", {
            fontSize: "32px",
            fill: "#FFFFFF",
        });
        buttonText.setOrigin(0.5, 0.5); // Center the text on the button
    } // create
} // class GameOverScene

class UFOscene extends Phaser.Scene {
    constructor() {
        super({ key: "ufoScene" });
    }

    create() {
        console.log("UFOscene create() called ...");

        ufo.levelAppearanceCount += 1;

        //
        // sounds effects
        //
        this.rockExplosion = this.sound.add("rockExplosion");

        //
        // add a ufo
        //
        this.ufo = this.add.sprite(0, 0, "ufoTexture");

        if (ufo.levelAppearanceCount <= 2) {
            this.ufo.setScale(ufo.big.scale);
            this.ufo.points = ufo.big.points;
            this.ufo.maxDeviation = ufo.big.maxDeviation;
        } else {
            this.ufo.setScale(ufo.small.scale);
            this.ufo.points = ufo.small.points;
            this.ufo.maxDeviation = ufo.small.maxDeviation;
        }
        this.physics.add.existing(this.ufo);

        //
        // UFO randomly spans near one of the four corners
        //
        const offset = 50;
        const upLeft = { x: offset, y: offset };
        const upRight = {
            x: config.width - 2 * this.ufo.width - offset,
            y: offset,
        };
        const downLeft = { x: offset, y: config.height - offset };
        const downRight = {
            x: config.width - 2 * this.ufo.width - offset,
            y: config.height - offset,
        };

        const allPaths = [
            // left to right
            { start: upLeft, end: upRight },
            { start: upRight, end: upLeft },
            { start: downRight, end: downLeft },
            { start: downLeft, end: downRight },

            // diagonal
            { start: upLeft, end: downRight },
            { start: upRight, end: downLeft },
            { start: downLeft, end: upRight },
            { start: downRight, end: upLeft },
        ];

        const path = Phaser.Math.RND.pick(allPaths);
        this.ufo.x = path.start.x;
        this.ufo.y = path.start.y;

        //
        // make UFO bullet
        //
        this.ufoBullet = this.add.rectangle(0, 0, 4, 4, 0xffffff);
        this.physics.add.existing(this.ufoBullet);
        this.ufoBullet.setOrigin(0.5, 0.5);
        this.ufoBullet.setVisible(false);
        this.ufoBullet.setActive(false);
        this.ufoBullet.body.enable = false;

        //
        // as the UFO moves across the screen, shoot a bullet in a random
        // direction
        //
        this.scheduleNextUFObullet();

        //
        // sounds effects
        //
        this.ufoLaserSound = this.sound.add("ufoLaserShot");
        this.ufoExplosionSound = this.sound.add("ufoExplosion");

        //
        // UFO moves across the screen to the opposite edge
        //
        let ufoTween = this.tweens.add({
            targets: this.ufo,
            x: path.end.x,
            y: path.end.y,
            duration: 2 * 5000,
            ease: "Linear",
            onComplete: () => {
                this.scene.stop("ufoScene");
                this.scene.get("playScene").scheduleNextUFO();
            },
        });

        ufoTween.play();

        const playScene = this.scene.get("playScene");

        // destroy UFO if hit by a rock
        this.physics.add.collider(this.ufo, allRocks, () => {
            playScene.scheduleNextUFO();
            this.ufoExplosionSound.play();
            playScene.makeExplosion(this.ufo.x, this.ufo.y);
            this.scene.stop("ufoScene");
        });

        // destroy UFO if hit by a bullet
        this.physics.add.collider(shipBullets.allBullets, this.ufo, () => {
            game.score += this.ufo.points;
            playScene.scheduleNextUFO();
            this.ufoExplosionSound.play();
            playScene.makeExplosion(this.ufo.x, this.ufo.y);
            this.scene.stop("ufoScene");
        });

        // destroy the ship and the UFO if the UFO is hit by the ship
        this.physics.add.collider(ship, this.ufo, () => {
            playScene.handleShipCollision(this.ufo, ship);
            playScene.scheduleNextUFO();
            this.ufoExplosionSound.play();
            playScene.makeExplosion(this.ufo.x, this.ufo.y);
            this.scene.stop("ufoScene");
        });

        // split/destroy rocks if UFO bullet hits a rock
        this.physics.add.collider(
            this.ufoBullet,
            allRocks,
            this.handleUFObulletRockCollision,
            null,
            this
        );

        // destroy ship if UFO bullet hits the ship
        this.physics.add.collider(this.ufoBullet, ship, () => {
            this.handleUFObulletHitsShip();
            // playScene.scheduleNextUFO();
            // this.ufoExplosionSound.play();
            // playScene.makeExplosion(this.ufo.x, this.ufo.y);
        });
    } // create

    update(time, delta) {
        // skip if the bullet is inactive
        if (!this.ufoBullet.active) return;

        // UFO bullet wraps around the screen
        if (this.ufoBullet.x < 0) this.ufoBullet.x = config.width;
        if (this.ufoBullet.x > config.width) this.ufoBullet.x = 0;
        if (this.ufoBullet.y < 0) this.ufoBullet.y = config.height;
        if (this.ufoBullet.y > config.height) this.ufoBullet.y = 0;
    } // update

    scheduleNextUFObullet() {
        const timeBetweenBullets = 750;
        this.time.delayedCall(
            timeBetweenBullets,
            this.shootRandomUFObullet,
            null,
            this
        );
    } // scheduleNextUFOBullet

    shootRandomUFObullet() {
        this.ufoBullet.setVisible(true);
        this.ufoBullet.setActive(true);
        this.ufoBullet.body.enable = true;

        // bullet's starting position is the same as the UFO
        this.ufoBullet.x = this.ufo.x;
        this.ufoBullet.y = this.ufo.y;

        // // set the bullet to be a random angle, always the same speed
        // const speed = 400;
        // const angle = Phaser.Math.RND.between(0, Math.PI * 2);
        // this.ufoBullet.body.setVelocity(
        //     Math.cos(angle) * speed,
        //     Math.sin(angle) * speed
        // );

        // Calculate angle to ship with some randomness for inaccuracy
        // const ship = this.scene.get('playScene').ship;
        const dx = ship.x - this.ufo.x;
        const dy = ship.y - this.ufo.y;
        const angleToShip = Math.atan2(dy, dx);

        // Add random deviation to make it less accurate
        // const maxDeviation = 0.5;

        // make the UFO more accurate as it appears more times
        if (ufo.levelAppearanceCount % 5 === 0) {
            this.ufo.maxDeviation /= 2;
        }
        const randomDeviation = Phaser.Math.FloatBetween(
            -this.ufo.maxDeviation,
            this.ufo.maxDeviation
        );
        const angle = angleToShip + randomDeviation;

        const speed = 400;
        this.ufoBullet.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.ufoLaserSound.play();

        // Set a timer to deactivate the bullet after some time
        const shipBulletCooldown = 1000;
        this.ufoBullet.coolDownTimer = this.time.delayedCall(
            shipBulletCooldown,
            () => {
                this.ufoBullet.setActive(false);
                this.ufoBullet.setVisible(false);
                this.ufoBullet.body.enable = false;
                this.scheduleNextUFObullet();
            }
        );
    } // shootUFOBullet

    handleUFObulletRockCollision(bullet, rock) {
        if (!bullet || !bullet.active || !rock || !rock.active) return;

        //
        // handle bullet-rock collision
        //
        this.ufoBullet.setActive(false);
        this.ufoBullet.setVisible(false);
        this.ufoBullet.body.enable = false;

        if (this.ufoBullet.coolDownTimer) {
            this.ufoBullet.coolDownTimer.remove();
            this.ufoBullet.coolDownTimer = null;
        }

        //
        // play the explosion sound
        //
        this.rockExplosion.play();

        const playScene = this.scene.get("playScene");

        //
        // create a particle explosion
        //
        playScene.makeExplosion(rock.x, rock.y);

        //
        // destroy the rock
        //

        // remove the rock from the allRocks array
        allRocks.splice(allRocks.indexOf(rock), 1);

        if (rock.radius === rocks.small.size) {
            // do nothing: small rocks just disappear
        } else if (rock.radius === rocks.medium.size) {
            // spawn 2 small rocks
            playScene.spawnRockAt(rocks.small.size, rock.x, rock.y);
            playScene.spawnRockAt(rocks.small.size, rock.x, rock.y);
        } else if (rock.radius === rocks.large.size) {
            // spawn 2 medium rocks
            playScene.spawnRockAt(rocks.medium.size, rock.x, rock.y);
            playScene.spawnRockAt(rocks.medium.size, rock.x, rock.y);
        }

        rock.destroy();

        playScene.scheduleNextLevel();
        this.scheduleNextUFObullet();
    } // handleUFObulletRockCollision

    handleUFObulletHitsShip() {
        if (!this.ufoBullet || !this.ufoBullet.active || !ship || !ship.active)
            return;

        // destroy the bullet
        this.ufoBullet.setActive(false);
        this.ufoBullet.setVisible(false);
        this.ufoBullet.body.enable = false;

        // destroy the ship
        ship.setActive(false);
        ship.setVisible(false);
        ship.body.enable = false;

        //
        // play the ship explosion sound
        //
        const playScene = this.scene.get("playScene");
        playScene.shipExplosion.play();

        playScene.makeExplosion(ship.x, ship.y);

        // Remove the UFO scene without triggering another explosion
        // this.scene.stop("ufoScene");

        playScene.checkGameOver();
    } // handleUFObulletHitsShip
} // class UFOscene

class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: "playScene" });
    }

    preload() {
        // images are loaded in the PreloadScene
    }

    create() {
        console.log("PlayScene.create: starting ...");

        //
        // the ship
        //

        // TODO: fix the coordinates to make the ship rotate right
        ship = this.add.polygon(400, 300, shipPoints, 0xffffff);
        ship.setStrokeStyle(2, 0xffffff);
        ship.setFillStyle(0x000000, 0);

        // Add physics to the player ship
        this.physics.add.existing(ship);

        // Set initial properties
        // ship.body.setDamping(true);
        // ship.body.setDrag(0.99);
        // ship.body.setAngularDrag(0.99);
        ship.body.setMaxVelocity(300, 300);

        ship.rotatingLeft = false;
        ship.rotatingRight = false;
        ship.thrusting = false;

        //
        // draw the ship as a graphics object for the reserve ships
        //
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff);
        // graphics.fillStyle(0x00ff00, 0);

        graphics.beginPath();

        graphics.moveTo(shipPoints[0].x, shipPoints[0].y);
        graphics.lineTo(shipPoints[1].x, shipPoints[1].y);
        graphics.lineTo(shipPoints[2].x, shipPoints[2].y);
        graphics.lineTo(shipPoints[3].x, shipPoints[3].y);

        graphics.closePath();
        graphics.strokePath();
        // graphics.fillPath();
        graphics.setScale(0.75);

        // generate a texture from the graphics object
        graphics.generateTexture("shipTexture", 50, 50);

        // delete the graphics object since it's no longer needed
        graphics.destroy();

        // Use the generated texture
        game.reserveShips = [];
        for (let i = 0; i < game.maxShipsInReserve; i++) {
            const ship = this.add.sprite(250 + i * 25, 32, "shipTexture");
            ship.setVisible(false);
            ship.setActive(false);
            game.reserveShips.push(ship);
        }

        //
        // the bullets
        //

        //
        // Maybe use a (physics) group to manage bullets.
        //
        // Should this, or some of this, be done in PreloadScene?
        //
        shipBullets.allBullets = [];
        for (let i = 0; i < shipBullets.maxNumBullets; i++) {
            const b = this.add.rectangle(0, 0, 4, 4, 0xffffff);
            this.physics.add.existing(b);
            b.setOrigin(0.5, 0.5);
            b.setVisible(false);
            b.setActive(false);
            b.body.enable = false;
            shipBullets.allBullets.push(b);
        }

        //
        // the rocks
        //
        console.log("PlayScene.create: spawning large rocks ...");
        allRocks = [];
        this.spawnLargeRocks(game.numStartingRocks);

        //
        // add a collider to check for when a rock hits the ship
        //
        this.physics.add.collider(
            allRocks,
            ship,
            this.handleShipCollision,
            null,
            this
        );

        //
        // create the keys
        //
        // w/up-arrow - thrust
        // a/left-arrow - rotate left
        // d/right-arrow - rotate right
        // space - fire
        //
        keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            // down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,

            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            // s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        //
        // sound effects
        //
        this.laserShot = this.sound.add("shipLaserShot");
        this.rockExplosion = this.sound.add("rockExplosion");
        this.shipExplosion = this.sound.add("shipExplosion");
        this.extraShipSound = this.sound.add("extraShip");
        //
        // when a level starts, start the UFO timer
        //
        // resetUFOtimer(this, "PlayScene.create: UFO timer reset at start of level");
        console.log(
            `PlayScene.create: making delayed call to launch ufoScene in ${
                ufo.timeToNextUFO / 1000
            }s...`
        );

        // reset UFO timer
        this.scheduleNextUFO();

        //
        // start the score scene
        //
        this.scene.launch("scoreScene");
    } // create

    update(time, delta) {
        //
        // If the game is respawning, wait for a clear area in the center of the
        // screen and re-spawn the ship and that there's no UFO active.
        //
        if (game.respawning && !this.scene.isActive("ufoScene")) {
            //
            // stop the UFO if it's active, doesn't allow to spawn while waiting for space
            //

            // get min distance of all rocks from the center of the screen
            const centerX = config.width / 2;
            const centerY = config.height / 2;
            let minDistance = Math.min(
                ...allRocks.map((rock) => {
                    return Math.sqrt(
                        (rock.x - centerX) ** 2 + (rock.y - centerY) ** 2
                    );
                })
            );

            // console.log("min distance =", minDistance);
            if (minDistance > 130) {
                game.respawning = false;
                game.shipsInReserve--;
                ship.body.setVelocity(0, 0);
                ship.x = config.width / 2;
                ship.y = config.height / 2;
                ship.rotation = 0;
                ship.setVisible(true);
                ship.setActive(true);
                ship.body.enable = true;

                this.scene.get("playScene").scheduleNextUFO();
            }
        }

        //
        // Update rocks position and rotation
        //
        const deltaSeconds = delta / 1000; // Convert delta to seconds

        // Wrap the rocks around the screen
        for (const rock of allRocks) {
            if (rock.x < 0) rock.x = config.width;
            if (rock.x > config.width) rock.x = 0;
            if (rock.y < 0) rock.y = config.height;
            if (rock.y > config.height) rock.y = 0;
        } // for

        //
        // rotate the rocks
        //
        for (const rock of allRocks) {
            rock.rotation += rock.rotationSpeed * deltaSeconds;
        } // for

        //
        // check keyboard input
        //
        ship.thrusting = keys.up.isDown || keys.w.isDown;
        ship.rotatingLeft = keys.left.isDown || keys.a.isDown;
        ship.rotatingRight = keys.right.isDown || keys.d.isDown;

        //
        // rotate the player ship
        //
        const rotationSpeed = 5; // degrees per frame
        if (ship.rotatingLeft) {
            ship.rotation -= Phaser.Math.DegToRad(rotationSpeed);
        }
        if (ship.rotatingRight) {
            ship.rotation += Phaser.Math.DegToRad(rotationSpeed);
        }

        //
        // add thrust when W or Up arrow is pressed
        //
        if (ship.thrusting) {
            const thrustPower = 300;
            // Calculate thrust vector based on ship's rotation
            const thrustX = Math.cos(ship.rotation - Math.PI / 2) * thrustPower;
            const thrustY = Math.sin(ship.rotation - Math.PI / 2) * thrustPower;
            ship.body.setAcceleration(thrustX, thrustY);
        } else {
            // Stop acceleration when not thrusting
            ship.body.setAcceleration(0, 0);

            // Apply damping to reduce speed over time
            const dampingFactor = 0.99; // Adjust this value to control the rate of speed reduction
            ship.body.velocity.x *= dampingFactor;
            ship.body.velocity.y *= dampingFactor;
        }

        //
        // wrap the ship around the screen edges
        //
        if (ship.x < 0) ship.x = config.width;
        if (ship.x > config.width) ship.x = 0;
        if (ship.y < 0) ship.y = config.height;
        if (ship.y > config.height) ship.y = 0;

        //
        // handle bullet firing
        //
        if (Phaser.Input.Keyboard.JustDown(keys.space)) {
            // don't fire bullets if the game is over or the ship is inactive
            // (e.g. due to being hit)
            if (this.scene.isActive("gameOverScene")) return;
            if (!ship.active) return;

            //
            // find the first inactive bullet
            //
            const b = shipBullets.allBullets.find((bullet) => !bullet.active);
            if (b) {
                b.setVisible(true);
                b.setActive(true);
                b.body.enable = true;
                this.laserShot.play();
                b.body.reset(
                    ship.x +
                        (1 +
                            Math.cos(ship.rotation - Math.PI / 2) *
                                ship.width) /
                            2,
                    ship.y +
                        (1 +
                            Math.sin(ship.rotation - Math.PI / 2) *
                                ship.height) /
                            2
                );

                b.body.setVelocity(
                    Math.cos(ship.rotation - Math.PI / 2) * 400,
                    Math.sin(ship.rotation - Math.PI / 2) * 400
                );

                // Set a timer to deactivate the bullet after some time
                b.coolDownTimer = this.time.delayedCall(
                    shipBullets.bulletCooldown,
                    () => {
                        b.setActive(false);
                        b.setVisible(false);
                        b.body.enable = false;
                    }
                );
            }
        } // if

        //
        // make bullets wrap around screen edges
        //
        for (const b of shipBullets.allBullets) {
            if (b.active) {
                if (b.x < 0) b.x = config.width;
                if (b.x > config.width) b.x = 0;
                if (b.y < 0) b.y = config.height;
                if (b.y > config.height) b.y = 0;
            }
        }
    } // update

    scheduleNextUFO() {
        if (ufo.timer) {
            ufo.timer.destroy();
        }
        ufo.timer = this.time.delayedCall(ufo.timeToNextUFO, () => {
            this.scene.launch("ufoScene");
        });
    }

    // the ship can collide with a rock
    handleShipCollision(thing, ship) {
        if (!ship.active) return;

        //
        // hide and deactivate the ship
        //
        ship.setVisible(false);
        ship.setActive(false);
        ship.body.enable = false;

        //
        // play the ship explosion sound
        //
        this.shipExplosion.play();

        // Use the contact point for the explosion
        const explosionX = (thing.x + ship.x) / 2;
        const explosionY = (thing.y + ship.y) / 2;
        this.makeExplosion(explosionX, explosionY);

        this.checkGameOver();
    } // handleRockShipCollision

    makeExplosion(x, y) {
        this.add.particles(x, y, "debris", {
            speed: { min: -50, max: 50 },
            // scale: { start: 0.5, end: 0 },
            // scale: { start: 0.5, end: 1, ease: 'Power3' },
            // scale: { start: 3, end: 0, random: true, ease: 'bounce.out' },
            scale: { steps: 3, start: 0, end: 2, random: true, yoyo: true },
            blendMode: "ADD",
            lifespan: 700,
            quantity: 10,
            stopAfter: 30,
        });
    } // makeExplosion

    checkGameOver() {
        if (game.shipsInReserve > 0) {
            // don't decrease the ships in reserve until a new ship is spawned,
            // so the user sees that there are still ships remaining

            // delay start of respawn for at least a few seconds
            this.time.delayedCall(2000, () => {
                game.respawning = true;
            });
        } else {
            // console.log("game over: no ships in reserve");
            this.scene.launch("gameOverScene");
        }
    } // checkGameOver

    handleBulletRockCollision(bullet, rock) {
        if (!bullet.active) return;

        //
        // handle bullet-rock collision
        //
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;

        if (bullet.coolDownTimer) {
            bullet.coolDownTimer.remove();
            bullet.coolDownTimer = null;
        }

        //
        // play the explosion sound
        //
        this.rockExplosion.play();

        //
        // create a particle explosion
        //

        // console.log(`exploding rock at (${rock.x}, ${rock.y})`);
        this.add.particles(bullet.x, bullet.y, "debris", {
            speed: { min: -50, max: 50 },
            // scale: { start: 0.5, end: 0 },
            // scale: { start: 0.5, end: 1, ease: 'Power3' },
            // scale: { start: 3, end: 0, random: true, ease: 'bounce.out' },
            scale: { steps: 3, start: 0, end: 2, random: true, yoyo: true },
            blendMode: "ADD",
            lifespan: 700,
            quantity: 10,
            stopAfter: 30,
        });

        //
        // destroy the rock
        //

        // remove the rock from the allRocks array
        allRocks.splice(allRocks.indexOf(rock), 1);

        if (rock.radius === rocks.small.size) {
            game.score += rocks.small.points;
        } else if (rock.radius === rocks.medium.size) {
            game.score += rocks.medium.points;
            // spawn 2 small rocks
            this.spawnRockAt(rocks.small.size, rock.x, rock.y);
            this.spawnRockAt(rocks.small.size, rock.x, rock.y);
        } else if (rock.radius === rocks.large.size) {
            game.score += rocks.large.points;
            // spawn 2 medium rocks
            this.spawnRockAt(rocks.medium.size, rock.x, rock.y);
            this.spawnRockAt(rocks.medium.size, rock.x, rock.y);
        }
        game.highScore = Math.max(game.highScore, game.score);

        //
        // update the level and reserve ships
        //
        if (game.score >= game.nextBonusShipScore) {
            game.nextBonusShipScore += game.bonusShipIncrement;
            game.shipsInReserve++;
            game.shipsInReserve = Math.min(
                game.shipsInReserve,
                game.maxShipsInReserve
            );
            this.extraShipSound.play();
        }

        rock.destroy();

        this.scheduleNextLevel();
    } // handleBulletRockCollision

    //
    // If all the rocks are gone, pause briefly, and then re-spawn a new set
    // of rocks.
    //
    scheduleNextLevel() {
        if (allRocks.length === 0) {
            console.log("allRocks.length === 0: spawning new rocks ...");
            this.time.delayedCall(2000, () => {
                game.level++;
                ufo.levelAppearanceCount = 0;
                const numRocks = Math.min(
                    game.maxRocks,
                    game.numStartingRocks + game.level - 1
                );
                this.spawnLargeRocks(numRocks);
            });
            return true;
        }
        return false;
    }

    spawnRockAt(rockSize, x, y) {
        const numSides = Phaser.Math.Between(5, 10);
        const points = makeRandomPolygonPoints(numSides, rockSize);

        const rock = this.add.polygon(x, y, points, 0xffffff); // white
        rock.radius = rockSize;
        rock.setStrokeStyle(2, 0xffffff); // white border
        rock.setFillStyle(0x000000, 0); // black fill

        // add physics to the rock
        this.physics.add.existing(rock);

        // add random rotation
        rock.rotationSpeed = Phaser.Math.RND.between(0.75, 3) * randSign();

        // add random velocity
        const speed = Phaser.Math.RND.between(50, 125);
        const angle = Math.random() * Math.PI * 2;
        rock.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        rock.body.setMaxVelocity(100, 100);

        allRocks.push(rock);

        // Reset the collider between bullets and rocks
        this.physics.add.collider(
            shipBullets.allBullets,
            allRocks,
            this.handleBulletRockCollision,
            null,
            this
        );
    } // spawnRockAt

    spawnLargeRocks(numRocks) {
        console.log("spawnLargeRocks: numRocks =", numRocks);
        for (let i = 0; i < numRocks; i++) {
            // don't let pct go too close to 0.5; 0.5 and over it will make the
            // spawn zones cover the entire screen
            const pct = 0.3;
            const x = flip()
                ? Phaser.Math.Between(0, pct * config.width)
                : Phaser.Math.Between((1 - pct) * config.width, config.width);
            const y = flip()
                ? Phaser.Math.Between(0, pct * config.height)
                : Phaser.Math.Between((1 - pct) * config.height, config.height);
            this.spawnRockAt(rocks.large.size, x, y);
        }
    } // spawnLargeRocks
} // class PlayScene

// Generate n random points for a polygon within a given radius
function makeRandomPolygonPoints(n, maxRadius) {
    const points = [];
    const angleStep = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
        // Generate a random radius between 0.5 and 1 times the max radius. This
        // creates some irregularity in the shape.
        const randRadius = maxRadius * (0.5 + Math.random() * 0.9);
        const angle = i * angleStep;

        points.push({
            x: randRadius + randRadius * Math.cos(angle),
            y: randRadius + randRadius * Math.sin(angle),
        });
    }

    return points;
} // makeRandomPolygonPoints

//
// config and global variables
//

let ship;

const shipScale = 2;
const shipWidth = 15 * shipScale;
const shipHeight = 20 * shipScale;
const shipPoints = [
    { x: shipWidth / 2, y: 0 }, // nose
    { x: shipWidth, y: shipHeight }, // bottom right
    { x: 0.5 * shipWidth, y: 0.75 * shipHeight }, // notch in back
    { x: 0, y: shipHeight }, // bottom left
];

let shipBullets = {
    maxNumBullets: 5,
    allBullets: [],
    bulletCooldown: 1000,
};

// let ufoTimer; // should be owned by the PlayScene
// const ufoTimerInitial = 2 * 5000;
// const ufoBigPoints = 200;
// const ufoSmallPoints = 100;

const ufo = {
    timer: null,
    timeToNextUFO: 2 * 5000,
    levelAppearanceCount: 0,

    // smaller maxDeviation means more accurate shooting; 0.2 - 0.5 for the
    // small UFO; Math.PI for the big UFO means totally random shooting
    // direction
    small: { scale: 0.5, points: 1000, maxDeviation: 0.2 },
    big: { scale: 1, points: 200, maxDeviation: Math.PI },
};

const rocks = {
    small: { size: 10, points: 100 },
    medium: { size: 25, points: 50 },
    large: { size: 40, points: 25 },
};
let allRocks = [];
let keys;

let game = {
    score: 0,
    highScore: 0,
    level: 1,
    bonusShipIncrement: 5000,
    nextBonusShipScore: 5000,
    reserveShips: [],
    shipsInReserve: 2,
    maxShipsInReserve: 10,
    respawning: false,
    numStartingRocks: 5,
    maxRocks: 10,
    // gameOver: false,
};

const config = {
    // type says what renderer to use, AUTO means use the best available
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }, // Space has no gravity
            debug: false,
            fps: 60, // Ensure smooth motion
            tileBias: 0, // No tile-based collision adjustment needed
            maxVelocity: { x: 500, y: 500 }, // Limit max speed
            drag: { x: 0, y: 0 }, // No air resistance in space
            angularDrag: 0, // No rotational resistance
            bounceX: 0, // Objects won't bounce off screen edges
            bounceY: 0,
        },
    },

    //
    // scenes are processed in the order given here
    //
    scene: [
        PreloadScene,
        StartScene,
        ScoreScene,
        PlayScene,
        GameOverScene,
        UFOscene,
    ],
};

const asteroidsGame = new Phaser.Game(config);
