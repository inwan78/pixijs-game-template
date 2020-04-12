import * as PIXI from 'pixi.js';
import Config from '../Config';
import Scene from './Scene';
import MainScene from './MainScene';
import GameManager from "../managers/GameManager";
import Resource from '../Resource';
import Fade from "./transition/Fade";
import {PixelateFilter} from '@pixi/filter-pixelate';
import * as Functoins from '../Functions';

export default class TitleScene extends Scene {
  private text: PIXI.Text;
  private pixelateFilter: PixelateFilter;
  private isTransitionOutStart: boolean = false;

  
  constructor() {
    super();
    this.transitionOut = new Fade(0.0, 1.0, 0.02);   
    this.initScene();
  }
  protected initScene(): void {
    const GMI = GameManager.instance;
    
    //ローカルストレージ読み込み
    GMI.score = 0;
    GMI.localStorage = new Functoins.LocalStorage(Config.Strage.Title);
    if(!GMI.localStorage.load()){
      GMI.localStorage.data = {
        hiscore: 0,
        userName: ""
      };
    }
    if(GMI.hiscore < GMI.localStorage.data.hiscore){
      GMI.hiscore = GMI.localStorage.data.hiscore;
    }

    const resources = GMI.game.loader.resources as any;
    this.interactive = true;

    const bg = new PIXI.Sprite();
    bg.width = Config.Screen.Width;
    bg.height = Config.Screen.Height;
    this.addChild(bg);

    const title = new PIXI.Text('タイトル', new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 120,
      fill: [0xFFFF00, 0xFF0000],
      padding: 12,
      fontWeight: "bold",
      stroke: 0xFFFFFF,
      strokeThickness: 10
    }));
    title.anchor.set(0.5, 0.5);
    title.position.set(Config.Screen.Width * 0.5, Config.Screen.Height * 0.3);
    this.addChild(title);

    
    this.text = new PIXI.Text('TOUCH TO START', new PIXI.TextStyle({
      fontFamily: 'MisakiGothic',
      fontSize: 32,
      fill: 0xffffff,
      padding: 12
    }));
    this.text.anchor.set(0.5, 0.5);
    this.text.position.set(Config.Screen.Width * 0.5, Config.Screen.Height * 0.7);
    this.addChild(this.text);

    this.on('pointerup', () => {
      if(!this.isTransitionOutStart){
        this.isTransitionOutStart = true;

        //モザイクフィルター
        this.pixelateFilter = new PixelateFilter();
        this.pixelateFilter.size = 0;
        this.filters = [this.pixelateFilter];

        this.beginTransitionOut(() => GameManager.loadScene(new MainScene()));
        
      }
    });
  }
  private readonly textAppealDuration: number = 20;
  private pixelSize = 1;
  public update(dt: number): void {
    super.update(dt);
    if(this.elapsedFrameCount % this.textAppealDuration === 0) {
      const visible = this.text.visible;
      this.text.visible = !visible;
    }
    if(this.isTransitionOutStart){
      this.pixelateFilter.size = this.pixelSize++;
    }
  }
}
