import GameManager from "./managers/GameManager";
import SoundManager from './managers/SoundManager';
import Sound from "./modules/Sound";
/****************************************
 *自作関数ライブラリ 
 ****************************************/
//twitter
export function twitter(data: {
  title: string,
  url: string,
  comment: string,
  hashtag?: string
}){
  const br = "%0D%0A";//改行コード
  const hashtag = data.hashtag == undefined ? "" : data.hashtag;
  const message = "【" + data.title + "】" + br + data.comment + br + "&hashtags=" + hashtag + br + "&url=" + data.url;
  window.open("https://twitter.com/intent/tweet?text=" + message);	
}
//内容：min～maxの整数をランダムで返す
export function random(min: number, max: number): number{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
//*************************************************************************
//内容:矩形の当たり判定
//説明:[L1:キャラ１の左端座標][R1:キャラ1の右端座標][T1:キャラ１のトップ座標][B1:キャラ1のボトム座標][L2:キャラ2の左端座標][R2:キャラ2の右端座標][T2:キャラ2のトップ座標][B2:キャラ2のボトム座標]
export function rectCollision(L1: number, R1: number, T1: number, B1: number, L2: number, R2: number, T2: number, B2: number): boolean{
  if(L2 <= R1 && L1 <= R2){
    if(T2 <= B1 && T1 <= B2){
      return true;
    }
  }
  return false;
}  
//************************************************************
//内容：三角関数クラス
//引数：unitValu:ラジアンの単位幅。基本0.01または0.001
export class Trigonometry {
  private PI = Math.PI;//数学関数は毎回呼び出すより、保持している方が速いらしい。。
  private abs = Math.abs;
  private atan2 = Math.atan2;
  private unitValue: number ;//角度の単位幅（ラジアン）
  private rate: number; 
  private toDegValue: number;
  private sin: number[];
  private cos: number[];
  private arrMax: number;
  constructor(unitValue: number){
    //円運動用配列作成
    this.unitValue = unitValue;//角度の単位幅（ラジアン）
    this.rate = 1 / this.unitValue;//整数にするために掛ける倍率を計算
    this.toDegValue = 180 / this.PI * this.unitValue;//degreeに変えるための変数
    this.sin = [];
    this.cos = [];
    for(var rad = 0, j = 0; rad < 2 * this.PI; rad += this.unitValue, j++){
      this.sin[j] = Math.sin(rad);
      this.cos[j] = Math.cos(rad);
    }
    this.arrMax = this.sin.length;
  }
  //引数の角度の値を返す
  getData(angle: number){
    if(this.abs(angle) >= this.arrMax){//範囲を超えていた場合
      angle = angle % this.arrMax;
    }
    if(angle < 0){//マイナスの値だった場合
      angle = this.arrMax + angle;
    }
    return {
      sin: this.sin[angle],
      cos: this.cos[angle],
      deg: angle * this.toDegValue,
    };
  }
  //２点間の角度を返す
  getAimAngle(x1: number, y1: number, x2: number, y2: number){
    var angle = this.atan2(y1 - y2, x1 - x2) * this.rate | 0;
    if(angle < 0){
      angle += this.arrMax;
    }
    return angle;
  }
}
//****************************************************************
//内容：ローカルストレージのデータ読み書き
export class LocalStorage {
  private name: string;
  private data: any;
  constructor(name: string) {
    this.name = name;
    this.data = {};
  }
  delete() {
    window.localStorage.removeItem(this.name);
  }
  load() {
    let data: any;
    if(window.localStorage){
      data =  JSON.parse(window.localStorage.getItem(this.name));
    }
    if(data){
      this.data = data;    
      return true;  
    }
    return false;
  }
  save() {
    let data = JSON.stringify(this.data);
    if(window.localStorage){
      window.localStorage.setItem(this.name, data); 
    }
  }
}
/**
 * 複数同時再生可能な効果音プレイヤー。max数までのコピーを作成
 */
export class SoundPlayer {
  private count = 0;
  private max: number;
  private sound: Sound[];
  constructor(name: string, max: number) { 
    this.sound = [];
    this.count = 0;//カウント用初期化
    this.max = max;//同時再生最大数
    for(var i = 0; i < this.max; i++){
        this.sound[i] = new Sound(SoundManager.instance.soundBuffers[name]);    
    }
  }
  //再生(クローンを順繰りに再生) 
  play(){
    this.sound[this.count++].play();
    if(this.count >= this.max){
        this.count = 0;
    }
  }
}
