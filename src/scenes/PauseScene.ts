import * as PIXI from 'pixi.js';
import Scene from './Scene';
import Config from '../Config'
import GameManager from "../managers/GameManager";
import InputManager from '../managers/InputManager';
export default class PauseScene extends Scene {
  constructor() {
    super();
    this.initScene();
  }
  protected initScene(): void {
    const bg = new PIXI.Sprite();
    bg.width = Config.Screen.Width;
    bg.height = Config.Screen.Height;
    this.addChild(bg);

    const text = new PIXI.Text("PAUSE", new PIXI.TextStyle({
      fontFamily: 'MisakiGothic',
      fontSize: 100,
      fill: 0xffffff,
      padding: 12
    }));
    text.anchor.set(0.5, 0);
    text.position.set(256, 300);
    this.addChild(text);
    
    this.interactive = true;
    this.on('pointerup', () => {
      this.resumeGame();
    });
  }
  public update(dt: number): void {
    super.update(dt);
    if(InputManager.checkButton('Start') == InputManager.keyStatus.DOWN){
      this.resumeGame();
    }
  }
  private resumeGame() {
    //this.resumeBgm();
    GameManager.popScene();
  }
}
