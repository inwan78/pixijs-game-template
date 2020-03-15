import * as PIXI from 'pixi.js';
import * as PixiExt from '../PixiExtends'; 
import UpdateObject from '../interfaces/UpdateObject';

/**
 * タイルマップ管理クラス
 * TiledMapEditorのデータ専用
 */
export default class TileMap extends PIXI.Container implements UpdateObject {
  protected destroyed: boolean = false;
  private mapLayerData:Array<number[]> = [];//レイヤーごとのマップデータ保存用
  private collisionData:Array<number>|Array<boolean> = [];//当たり判定用
  private mapLayerSprites:Array<TileSprite[]> = [];
  private _image: any;//画像データ
  public tileWidth: number;//タイルの幅
  public tileHeight: number;//タイルの高さ
  private tileColumns: number;//マップの横1列のタイルの数
  constructor(){
    super();
  }
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  public destroy(): void {
    super.destroy();
    this.destroyed = true;
  }
  /**
   * マップの各サイズをセットする
   */
  public setSizes(data){
    this.tileWidth = data.tilewidth;
    this.tileHeight = data.tileheight;
    this.tileColumns = data.width;
  }

  /**
   * 指定のマップレイヤーデータを指定のレイヤーに読み込んでマップを作成する
   * 判定用のレイヤーとかある場合にいらないレイヤーを抜くためにレイヤーを指定する(かならず0番からつくること)
   */
  public createMapLayer(layerNum: number, data){
    this.mapLayerData[layerNum] = data;
    this.mapLayerSprites[layerNum] = [];
    let sprites = this.mapLayerSprites[layerNum];
    for(let i = 0; i < this.mapLayerData[layerNum].length; i++){
      sprites[i] = new TileSprite(this.tileWidth, this.tileHeight);
      sprites[i].image = this._image;
      sprites[i].frameNumber = this.mapLayerData[layerNum][i] - 1;//TiledMapEditorは1から始まっているので1引く
      //表示位置
      const x = i % this.tileColumns * this.tileWidth;
      const y = (i / this.tileColumns | 0) * this.tileHeight;
      sprites[i].position.set(x, y);
      this.addChild(sprites[i]);
    }
  }
  /**
   * 指定のレイヤーにアニメーションをセットする
   * 引数(レイヤー番号、アニメーションするフレームのリスト、アニメーションデータ)
   */
  public setAnimation(layerNum: number, list:any, animationData:any){
    let data = this.mapLayerData[layerNum];
    for(let i = 0; i < data.length; i++){
      for(let j = 0; j < list.length; j++){
        if(data[i] == list[j].frameNumber){
          this.mapLayerSprites[layerNum][i].isAnimation = true;
          this.mapLayerSprites[layerNum][i].animationData = animationData[list[j].animationName];
          break;
        }
      }
    }
  }
  //画像データ
  get image(): any{
    return this._image;
  }
  set image(data: any) {
    this._image = data;
    //マップデータがあればもう一度マップを作り直す(確認の必要あり)
    if(!this.mapLayerData)return;
    /**
     * スプライトのイメージを入れ替える処理書く
     */
  }
  public update(dt: number): void {
    for(let layerNum = 0; layerNum < this.mapLayerSprites.length; layerNum++){
      for(let i = 0; i < this.mapLayerSprites[layerNum].length; i++){
        if(!this.mapLayerSprites[layerNum][i].isAnimation)continue;
        this.mapLayerSprites[layerNum][i].update(dt);
      }
    }
  }
}
/**
 * タイルマップ用スプライト
 * アニメーションフラグがあるだけ
 */
class TileSprite extends PixiExt.Sprite {
  public isAnimation = false;
  public animationPatternNumber = 0;
  public animationData;
  constructor(width: number, height: number){
    super(width, height);
  }
  public update(dt: number){
    super.update(dt);
    if(this.elapsedFrameCount % this.animationData.interval == 0){
      if(++this.animationPatternNumber >= this.animationData.pattern.length){
        this.animationPatternNumber = 0;
      }
      this.frameNumber = this.animationData.pattern[this.animationPatternNumber];
    }
  }
}