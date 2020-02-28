/************************************************
 * pixi拡張クラス
 ************************************************/
import * as PIXI from 'pixi.js';
//角丸のボタン
export class RectButton extends PIXI.Container{
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
    bg.drawRect(0, 0, width, height);
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
    label.position.set(width * 0.5, height * 0.45);
    this.addChild(label);
  }
}


