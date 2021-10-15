import Phaser from 'phaser';

export default class FogOfWar {
  public fogTexture: Phaser.GameObjects.RenderTexture;
  private ratio: number;
  private eraserCursor: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    private worldWidth: number,
    private worldHeight: number,
    private fidelity: number = 128,
    public fogDecayRate: number = 0.0025,
    private revealTexture?:string,
  ) {
    const ratio = worldWidth / worldHeight;
    this.ratio = ratio;
    this.fogTexture = scene.add.renderTexture(0, 0, Math.ceil(this.fidelity * ratio), this.fidelity);
    this.fogTexture.fill(0x000000); // , 0.0001);
    this.fogTexture.setDisplaySize(worldWidth, worldHeight);
    this.fogTexture.setDepth(10);

    this.eraserCursor = scene.add.image(0, 0, 'dot')
      .setDisplaySize(64 * (this.fidelity / 128), 64 * (this.fidelity / 128))
      .setVisible(false);

    this._mask = this.fogTexture.createBitmapMask();


    // This prevents entities from being seen after leaving an area.
    // This also uses `-drawn` which is a stylized/simplified version of the map.
    // The result is that previously explored areas look more 'sketchy' and like drawings
    if (this.revealTexture) {
      const fg = scene.add.image(0, 0, this.revealTexture).setOrigin(0,0).setDisplaySize(worldWidth, worldHeight).setDepth(5);
      fg.setMask(this.bitmapMask);
    }
  }

  private _mask: Phaser.Display.Masks.BitmapMask;
  public get bitmapMask(): Phaser.Display.Masks.BitmapMask {
    return this._mask;
  }

  reveal(worldX: number, worldY: number) {
    this.eraserCursor.x = (worldX / this.worldWidth) * this.fidelity * this.ratio;
    this.eraserCursor.y = (worldY / this.worldHeight) * this.fidelity;
    this.fogTexture.erase(this.eraserCursor);
  }

  revealShape(obj: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform, worldX?: number, worldY?: number) {
    // Default to the given object's coordinates if none are given
    worldX = worldX === undefined ? obj.x : worldX;
    worldY = worldY === undefined ? obj.y : worldY;

    const x = (worldX / this.worldWidth) * this.fidelity * this.ratio;
    const y = (worldY / this.worldHeight) * this.fidelity;
    this.fogTexture.erase(obj, x, y);
  }

  growFog(amount: number) {
    this.fogTexture.fill(0, amount);
  }

  public updateFog = throttle((delta: number, revealers: { x: number; y: number; }[]) => {
    // this.growFog(delta * 2 * this.fogDecayRate);
    for (let i = 0; i < revealers.length; i++) {
      this.reveal(revealers[i].x, revealers[i].y);
    }
  }, 1000 / 30);
}
const throttle = function (innerFnc: Function, throttleTimeMs: number) {
  let throttleTimer: any;
  return function (...args: any[]) {
    if (throttleTimer) { return; }
    throttleTimer = setTimeout(() => {
      throttleTimer = null;
      innerFnc(...args);
    }, throttleTimeMs);
  };
};
