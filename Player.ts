import * as PIXI from 'pixi.js';
import * as PixiExt from '../PixiExtends';
import GameManager from "../managers/GameManager";
import Resource from '../Resource';

export default class Player extends PixiExt.AnimationSprite {
  public isPointerDown = false;
  public isJumping = false;
  public jumpCount = 0;
  constructor(){
    super();
    this.animationMaster = GameManager.instance.spriteAnimationData.Player;//アニメーションデータを渡しておく
    this.animationType = Resource.AnimationTypes.WALK;
    this.anchor.set(0.5, 0.5);
    this.x = 250; 
    this.y = 250;
  }
  public update(_dt: number){
    super.update(_dt);
  }
}