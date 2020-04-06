import * as PIXI from 'pixi.js';
import GameManager from "../managers/GameManager";
import SoundManager from '../managers/SoundManager';
import InputManager from '../managers/InputManager';
import Config from '../Config';
import Scene from './Scene';
import Resource from '../Resource';
import Player from '../sprites/Player';
import Fade from "./transition/Fade";
import PauseScene from './PauseScene';
import {PixelateFilter} from '@pixi/filter-pixelate';
import * as PixiExt from '../PixiExtends'; 

let map: PixiExt.TileMap;
let player: Player;
let enemy: PixiExt.Sprite;
export default class MainScene extends Scene {
  private pixelateFilter: PixelateFilter;
  private isTransitionInStart: boolean = true;
   /**
   * コンストラクタ
   * 描画を初期化する
   */
  constructor(){
    super();
    this.interactive = false;
    this.transitionIn = new Fade(1.0, 0.0, -0.02);
    this.transitionOut = new Fade(0.0, 1.0, 0.02);    
  
    this.initScene();
  }
  /***********************************************************************************************
   * ここからゲーム部分
   ***********************************************************************************************/
  /**
   * ゲームに使う変数の宣言
   */
  protected prePosition: PIXI.Point;
  public flag = false;
  public jumpFlag = false;
  public isBgmPlaying = false;
  /**
   * シーンの初期処理
   */
  protected initScene(): void {
    //this.setBgm(Resource.Bgm.Main);
    //this.playBgm(Config.Volume.Bgm);
    //this.isBgmPlaying = true;  
  
    const mapAnimationFrameList = [
      {
        frameNumber: 2,
        data: {
          pattern: [1, 2, 3, 2],
          interval: 30
        }
      },
    ];

    const resources = GameManager.instance.game.loader.resources as any;
    const mapData = resources[Resource.MapData.Stage1].data;
    map = new PixiExt.TileMap();
    map.image = resources[Resource.Image.Map].texture;
    const data = {//  tileMapの型宣言が面倒だったので
      tileWidth: mapData.tilewidth as number,
      tileHeight: mapData.tileheight as number,
      tileColumns: mapData.width as number,
      tileRows: mapData.height as number
    }
    map.setSizes(data);
    map.prepareLayers(2);
    map.createMapLayer(0, mapData.layers[0].data);
    map.setAnimation(0, mapAnimationFrameList);
    this.addUpdateChild(map);
    
    //プレイヤー
    player = new Player();
    map.layers[1].addUpdateChild(player);
    
    //
    enemy = new PixiExt.Sprite(32, 32);
    enemy.image = resources[Resource.Image.Enemy].texture;
    map.layers[1].addUpdateChild(enemy);
    
    //モザイクフィルター
    this.pixelateFilter = new PixelateFilter();
    this.pixelateFilter.size = 1;
    this.filters = [this.pixelateFilter];

  }
   
  /*****************************************************************
   * メインループ
   *****************************************************************/
  private pixelSize = 60;
  private vy = 1;
  public update(delta: number): void{
    super.update(delta);
    this.updateRegisteredObjects(delta);

    
    //モザイク処理の部分
    if(this.isTransitionInStart){
      if(--this.pixelSize < 1){
        this.pixelSize = 1;
        this.isTransitionInStart = false;
      }
      this.pixelateFilter.size = this.pixelSize;
    }

    if(InputManager.checkButton('Start') == InputManager.keyStatus.DOWN){
      //this.pauseBgm();
      //SoundManager.playSound(Resource.Sound.Pause, Config.Volume.Sound);
      GameManager.pushScene(new PauseScene());
    }
    if(InputManager.checkButton('A') == InputManager.keyStatus.DOWN){
      if(player.isJumping)return;
      player.animationType = Resource.AnimationTypes.JUMP;
      player.changeAnimation();
      player.isJumping = true;
      player.jumpCount = 0;
    }
    if(player.isJumping){
      if(++player.jumpCount > 60){
        player.animationType = Resource.AnimationTypes.WALK;
        player.changeAnimation();
        player.isJumping = false;
      }
    }
    switch(InputManager.checkDirection()){//8方向で返ってくる
      case InputManager.keyDirections.UP:
        player.y--;
        break;
      case InputManager.keyDirections.DOWN:
        player.y++;
        break;
      case InputManager.keyDirections.RIGHT:
        player.x++;
        break;
      case InputManager.keyDirections.LEFT:
        player.x--;
        break;
    }
      
    enemy.y += this.vy;
    if(enemy.y + enemy.height > Config.Screen.Height){
      this.vy = -1;
    }
    if(enemy.y < 0){
      this.vy = 1;
    }

    //
    if(this.elapsedFrameCount % 15 == 0){
      if(++enemy.frameNumber >= 4){
        enemy.frameNumber = 0;
      }
    }
  } 
}