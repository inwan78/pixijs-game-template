/***************************************************************************
 * ゲーム開発用にPixiのクラスを拡張
 * UpdateObjectを実装してupdate()を使えるようにする
 ***************************************************************************/
import * as PIXI from 'pixi.js';
import UpdateObject from './interfaces/UpdateObject';
import SpriteAnimationMaster, {SpriteAnimationTypeIndex} from './interfaces/SpriteAnimationMaster';
/*********************************************
 * PixiのContainerクラスへUpdateObject実装
 *********************************************/
export class Container extends PIXI.Container implements UpdateObject {
  protected destroyed: boolean = false;
  protected objectsToUpdate: UpdateObject[] = [];
  protected elapsedFrameCount: number = 0;
  constructor(){
    super();
  }
  //メインループで更新処理を行うべきオブジェクトの登録
  protected registerUpdatingObject(object: UpdateObject): void {
    this.objectsToUpdate.push(object);
  }
  //更新処理を行うべきオブジェクトを更新する
  protected updateRegisteredObjects(delta: number): void {
    const nextObjectsToUpdate = [];
    for (let i = 0; i < this.objectsToUpdate.length; i++) {
      const obj = this.objectsToUpdate[i];
      if (!obj || obj.isDestroyed()) {
        continue;
      }
      obj.update(delta);
      nextObjectsToUpdate.push(obj);
    }
    this.objectsToUpdate = nextObjectsToUpdate;
  }
  //Updateする子要素を追加
  public addUpdateChild(obj: PIXI.DisplayObject & UpdateObject): void {
    this.addChild(obj);
    this.registerUpdatingObject(obj);
  }
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  public destroy(): void {
    super.destroy();
    this.destroyed = true;
  }
  public update(dt: number){
    this.updateRegisteredObjects(dt);
    this.elapsedFrameCount++;
  }
}
/***************************************************************************
 * スプライトシートを使ったアニメーション制御付きスプライト
 ***************************************************************************/
export class AnimationSprite extends PIXI.Sprite implements UpdateObject {
  public animationType!: string;
  protected destroyed: boolean = false;
  protected elapsedFrameCount: number = 0;
  protected animationFrameCount: number = 0;
  protected animationMaster!: SpriteAnimationMaster;
  protected animationFrameId: number = 0;
  protected objectsToUpdate: UpdateObject[] = [];
  constructor(){
    super();
  }
  //メインループで更新処理を行うべきオブジェクトの登録
  protected registerUpdatingObject(object: UpdateObject): void {
    this.objectsToUpdate.push(object);
  }
  
  //更新処理を行うべきオブジェクトを更新する
  protected updateRegisteredObjects(delta: number): void {
    const nextObjectsToUpdate = [];
    for (let i = 0; i < this.objectsToUpdate.length; i++) {
      const obj = this.objectsToUpdate[i];
      if (!obj || obj.isDestroyed()) {
        continue;
      }
      obj.update(delta);
      nextObjectsToUpdate.push(obj);
    }
    this.objectsToUpdate = nextObjectsToUpdate;
  }
  /**
   * アニメーション再生をリセットする
   */
  public resetAnimation(): void {
    this.animationFrameCount = 0;
    this.animationFrameId = 0;
  }
   /**
   * UpdateObject インターフェース実装
   * requestAnimationFrame 毎のアップデート処理
   */
  public update(dt: number): void {
    this.updateRegisteredObjects(dt);
    this.elapsedFrameCount++;
    this.updateAnimation();
    
  }
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  public destroy(): void {
    super.destroy();
    this.destroyed = true;
  }
  //Updateする子要素を追加
  public addUpdateChild(obj: PIXI.DisplayObject & UpdateObject): void {
    this.addChild(obj);
    this.registerUpdatingObject(obj);
  }
  public updateAnimation(): void {
    const index = this.animationType as SpriteAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if(!animation){
      return;
    }
    //フレーム数がスプライトシート更新頻度に達しているかチェック
    if((this.animationFrameCount % animation.updateDuration) === 0) {
      //最終フレームならアニメーションをリセット
      if(this.isAnimationLastFrameTime()){
        this.resetAnimation();
      }
      const cacheKey = animation.frames[this.animationFrameId];
      this.texture = PIXI.utils.TextureCache[cacheKey];
      this.animationFrameId++;
    }
    this.animationFrameCount++;
  }
 
  /**
   * 現在のアニメーションが終了するフレーム時間かどうかを返す
   */
  public isAnimationLastFrameTime(): boolean {
    const index = this.animationType as SpriteAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if(!animation){
      return false;
    }
    const duration = animation.updateDuration;
    const lastId = animation.frames.length;
    const maxFrameTime = duration * lastId;
    return this.animationFrameCount === maxFrameTime;
  }
  /**
   * アニメーションを切り替える
   */
  public changeAnimation() {
    const index = this.animationType as SpriteAnimationTypeIndex;
    const animation = this.animationMaster.types[index];
    if(!animation){
      return;
    }
    this.animationFrameId = 0;
    const cacheKey = animation.frames[this.animationFrameId];
    this.texture = PIXI.utils.TextureCache[cacheKey];
    this.animationFrameCount = 0;
  }
}
/******************************************************************************************
 * フレームナンバーで切り替えるフレームアニメーションスプライト
 * 拡大表示すると端に余計なものが入る問題がある
 ******************************************************************************************/
export class Sprite extends PIXI.Sprite implements UpdateObject {
  protected destroyed: boolean = false;
  protected objectsToUpdate: UpdateObject[] = [];
  private _image: any;
  private _frameNumber = 0;
  private frameRows: number;
  private frameColumns: number;
  private frameMax: number;
  protected elapsedFrameCount: number = 0;
  constructor(width: number, height: number){
    super();
    this.width = width;
    this.height = height;
  }
  //メインループで更新処理を行うべきオブジェクトの登録
  protected registerUpdatingObject(object: UpdateObject): void {
    this.objectsToUpdate.push(object);
  }
  
  //更新処理を行うべきオブジェクトを更新する
  protected updateRegisteredObjects(delta: number): void {
    const nextObjectsToUpdate = [];
    for (let i = 0; i < this.objectsToUpdate.length; i++) {
      const obj = this.objectsToUpdate[i];
      if (!obj || obj.isDestroyed()) {
        continue;
      }
      obj.update(delta);
      nextObjectsToUpdate.push(obj);
    }
    this.objectsToUpdate = nextObjectsToUpdate;
  }
  //Updateする子要素を追加
  public addUpdateChild(obj: PIXI.DisplayObject & UpdateObject): void {
    this.addChild(obj);
    this.registerUpdatingObject(obj);
  }
  public isDestroyed(): boolean {
    return this.destroyed;
  }
  public destroy(): void {
    super.destroy();
    this.destroyed = true;
  }
  //画像データ
  get image(): any{
    return this._image;
  }
  set image(data: any) {
    this._image = data;
    this.frameColumns = this._image.width / this.width | 0;
    this.frameRows = this._image.height / this.height | 0;
    this.frameMax = this.frameRows * this.frameColumns;
    this.setTexture();
  }
  //フレームナンバー
  get frameNumber(): number{
    return this._frameNumber;
  }
  set frameNumber(frameNumber: number) {
    this._frameNumber = frameNumber;
    if(!this._image)return;//まだ画像がセットされてなければ抜ける
    this.setTexture();
  }
  //テクスチャーをセット
  private setTexture() {
    const frameNumber = this._frameNumber % this.frameMax;
    const left = frameNumber % this.frameColumns * this.width;
    const top = (frameNumber / this.frameColumns | 0) * this.height;
    this.texture = new PIXI.Texture(this._image, new PIXI.Rectangle(left, top, this.width, this.height));
  }
  public update(dt: number): void {
    this.updateRegisteredObjects(dt);
    this.elapsedFrameCount++;
  }
}
/***************************************************************************************************
 * タイルマップ用スプライト
 * アニメーションフラグがあるだけ
 ***************************************************************************************************/
class TileSprite extends Sprite {
  public isAnimation = false;
  public animationPatternNumber = 0;
  public animationData;
  constructor(width: number, height: number){
    super(width, height);
  }
  public update(dt: number){
    super.update(dt);
    if(!this.isAnimation)return;
    if(this.elapsedFrameCount % this.animationData.interval == 0){
      if(++this.animationPatternNumber >= this.animationData.pattern.length){
        this.animationPatternNumber = 0;
      }
      this.frameNumber = this.animationData.pattern[this.animationPatternNumber];
    }
  }
}

/*********************************************************************************************
 * タイルマップ管理クラス(TileMapEditorのjsonデータ向け)
 * これは表示するだけ。当たり判定などの処理はもっていない(ゲームに合わせて拡張して使う感じで)
 * TileMapEditorが1から始まるためframeNumberに-1されて代入されるので注意
 *********************************************************************************************/
export default interface MapAnimationFrameList {
  frameNumber: number;
  data: {
    pattern: Array<number>;
    interval: number;
  }
}
export class TileMap extends Container {
  protected mapLayerData: Array<number[]> = [];//レイヤーごとのマップデータ保存用
  public collisionData: Array<number>|Array<boolean>;//当たり判定用
  public mapLayerSprites:Array<TileSprite[]> = [];
  protected _image: any;//画像データ
  public tileWidth: number;//タイルの幅
  public tileHeight: number;//タイルの高さ
  public tileColumns: number;//マップの横1列のタイルの数
  public tileRows: number;
  public mapWidth: number;//コンテナの大きさは変化するのでマップサイズ用の変数を用意する
  public mapHeight: number;
  public layers: Array<Container> = [];//レイヤー
  constructor(){
    super();
  }
  //Updateする子要素を追加
  public addUpdateChild(obj: PIXI.DisplayObject & UpdateObject): void {
    this.addChild(obj);
    this.registerUpdatingObject(obj);
  }
  /**
   * マップの各サイズをセットする
   */
  public setSizes(data: {tileWidth: number, tileHeight: number, tileColumns: number, tileRows: number}){
    this.tileWidth = data.tileWidth;
    this.tileHeight = data.tileHeight;
    this.tileColumns = data.tileColumns;
    this.tileRows = data.tileRows;
    this.mapWidth = this.tileColumns * this.tileWidth;
    this.mapHeight = this.tileRows * this.tileHeight;
  }
  public setCollisionData(data: Array<number>|Array<boolean>){
    this.collisionData = data; 
  }
  //表示用の階層を作る(zIndexの代わり)
  public prepareLayers(num: number){
    for(let i = 0; i < num; i++){
      this.layers[i] = new Container();
      this.addUpdateChild(this.layers[i]);
    }
  }
  /**
   * 指定のマップレイヤーデータを指定のレイヤーに読み込んでマップを作成する
   * 判定用のレイヤーとかある場合にいらないレイヤーを抜くためにレイヤーを指定する(かならず0番からつくること)
   */
  public createMapLayer(layerNum: number, data: Array<number>){
    this.mapLayerData[layerNum] = data;
    this.mapHeight = (data.length / this.tileColumns | 0) * this.tileHeight; //マップの高さを算出
    this.mapLayerSprites[layerNum] = [];
    let sprites = this.mapLayerSprites[layerNum];
    for(let i = 0; i < this.mapLayerData[layerNum].length; i++){
      if(this.mapLayerData[layerNum][i] <= 0){
        sprites[i] = null;
        continue;
      }
      sprites[i] = new TileSprite(this.tileWidth, this.tileHeight);
      sprites[i].image = this._image;
      sprites[i].frameNumber = this.mapLayerData[layerNum][i] - 1;//TiledMapEditorは1から始まっているので1引く
      //表示位置
      const x = i % this.tileColumns * this.tileWidth;
      const y = (i / this.tileColumns | 0) * this.tileHeight;
      sprites[i].position.set(x, y);
      this.layers[layerNum].addUpdateChild(sprites[i]);//指定のレイヤーに追加
    }
  }
  /**
   * 指定のレイヤーにアニメーションをセットする
   * 引数(レイヤー番号、アニメーションするフレームのリスト、アニメーションデータ)
   */
  public setAnimation(layerNum: number, list: MapAnimationFrameList[]){
    let data = this.mapLayerData[layerNum];
    for(let i = 0; i < data.length; i++){
      for(let j = 0; j < list.length; j++){
        if(data[i] == list[j].frameNumber){
          this.mapLayerSprites[layerNum][i].isAnimation = true;
          this.mapLayerSprites[layerNum][i].animationData = list[j].data;
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
     * 必要になれば作るかな
     */
  }
  /**
   * 更新処理
   */
  public update(dt: number): void {
    super.update(dt);
  }
}

/***************************************************************************************************
 * 角丸のボタン
 ***************************************************************************************************/
export class RoundRectButton extends PIXI.Container {
  constructor(data?: {
    width?: number, 
    height?: number,
    backgroundColor?: number,
    text?: string,
    fontColor?: number,
    fontSize?: number,
    fontFamily?: string
  }){
    super();
    let width: number
    if(typeof data.width === 'undefined'){
      width = 200;
    }else{
      width = data.width;
    }
    let height: number
    if(typeof data.height === 'undefined'){
      height = 80;
    }else{
      height = data.height;
    }
    let backgroundColor: number;
    if(typeof data.backgroundColor === 'undefined'){
      backgroundColor = 0xFFFFFF;
    }else{
      backgroundColor = data.backgroundColor;
    }
    let text: string;
    if(typeof data.text === 'undefined'){
      text = 'ボタン';
    }else{
      text = data.text;
    }
    let fontColor: number;
    if(typeof data.fontColor === 'undefined'){
      fontColor = 0x000000;
    }else{
      fontColor = data.fontColor;
    }
    let fontSize: number;
    if(typeof data.fontSize === 'undefined'){
      fontSize = Math.floor(width * 0.2);
    }else{
      fontSize = data.fontSize;
    }
    let fontFamily: string;
    if(typeof data.fontFamily === 'undefined'){
      fontFamily = 'sans-serif';
    }else{
      fontFamily = data.fontFamily;
    }
    //ボタン背景
    const bg = new PIXI.Graphics();
    bg.lineStyle(1, backgroundColor , 1);
    bg.beginFill(backgroundColor);
    bg.drawRoundedRect(0, 0, width, height, height * 0.2);
    bg.endFill();
    this.addChild(bg);
    //テキスト
    const label = new PIXI.Text(text, new PIXI.TextStyle({
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: fontColor,
      padding: 12,
      fontWeight: 'bold'
    }));
    label.anchor.set(0.5, 0.5);
    label.position.set(width * 0.5, height * 0.5);
    this.addChild(label);
  }
}


