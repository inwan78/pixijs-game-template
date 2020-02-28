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
