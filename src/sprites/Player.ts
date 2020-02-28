import * as PIXI from 'pixi.js';
import GameManager from "../managers/GameManager";
import AnimationSprite from './AnimationSprite';
import Resource from '../Resource';

export default class Player extends AnimationSprite {
  public isPointerDown = false;
  constructor(){
    super();
    this.characterType = "Player";
    this.animationMaster = GameManager.instance.spriteAnimationData.Player;//アニメーションデータを渡しておく
    this.animationType = Resource.AnimationTypes.Player.WALK;
    this.sprite.anchor.set(0.5, 0.5);
    this.x = 250; 
    this.y = 250;
    this.sprite.position.set(this.x, this.y);
    
    const sprite = this.sprite;//見やすくするために変数に移す
    sprite.interactive = true;
    sprite.on('pointerdown', (event) => {
      this.isPointerDown = true;
    });
    sprite.on('pointermove', (event) => {
      if(!this.isPointerDown) return;
      const position = event.data.getLocalPosition(sprite.parent);//ゲーム画面上の座標を取得
      const vx = position.x - this.x;
      const vy = position.y - this.y;
      this.x += vx;
      this.y += vy;
      this.sprite.position.set(this.x, this.y);
    });
    sprite.on('pointerup', (event) => {
      this.isPointerDown = false;
    });
    sprite.on('pointerupoutside', (event) => {
      this.isPointerDown = false;
    });
    sprite.on('pointerout', (event) => {
      //this.isPointerDown = false;
      //falseにすると高速で移動した場合にポインターがキャラよりはみ出ると止まる
    });
  }
  
}