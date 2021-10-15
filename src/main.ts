import Phaser from 'phaser';
import FogOfWar from './FogOfWar';
import { PerlinNoisePipeline } from './perlinNoiseShader';

const NUM_MARIOS = 10;

const game = new Phaser.Game({
  width: 1920,
  height: 1080,
  backgroundColor: 0x000000,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pipeline: {
    'perlin': PerlinNoisePipeline,
  } as any,
  physics: {
    default: 'arcade',
    arcade: {
      timeScale: 1,
      gravity: {
        y: 100
      }
    },
  },
  scene: class extends Phaser.Scene {
    fog: FogOfWar;
    players: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
    preload = () => {
      this.load.image('dot', 'https://i.imgur.com/tehnIVH.png');

      this.load.image('mario', 'https://i.imgur.com/nKgMvuj.png');
      this.load.image('background', 'https://i.imgur.com/dzpw15B.jpg');
      this.load.image('background-drawn', 'https://i.imgur.com/IQSuIl7.png'); // Bd1qjwx.png'); // 5vInLKj.png'); // psuedo-drawn effect, full opacity
    };
    create = () => {
      this.cameras.main.zoomTo(1);
      this.cameras.main.setBounds(0, 0, 1920, 1080);
      this.physics.world.setBounds(0, 0, 1920, 1080);
      this.physics.world.setBoundsCollision(true);
      const bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(1920, 1080);
      this.fog = new FogOfWar(this, 1920, 1080, 256, 0.0025, 'background-drawn');


      for (let i = 0; i < NUM_MARIOS; i++) {
        const player = this.physics.add.image(32, 32, 'mario')
          .setVelocity(Math.random() * 500, Math.random() * 500)
          .setMass(128)
          .setCollideWorldBounds(true, 0.98, 0.98)
          .setDisplaySize(32, 32);

        if (i < 3) {
          this.players.push(player);
        }
      }

      bg.setDepth(-2);

    };

    update = (time: number, delta: number) => {
      this.fog.updateFog(delta, this.players);
    }
  }
});
