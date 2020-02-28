import * as WebFont from 'webfontloader';
import LoadingScene from './scenes/LoadingScene';
import GameManager from './managers/GameManager';
import './Config';
import Resource from './Resource';

function initGame(){
  GameManager.start();
  GameManager.loadScene(new LoadingScene());
}

let fontLoaded = false;
let windowLoaded = false;

/**
 * フォント読みこみ
 * window 読み込みも完了していたらゲームを起動する
 */
WebFont.load({
  custom: {
    families: [Resource.FontFamily.Default],
    urls: ['base.css']
  },
  active: () => {
    fontLoaded = true;
    if (windowLoaded) {
      initGame();
    }
  }
});

/**
 * エントリーポイント
 * フォント読み込みも完了していたらゲームを起動する
 */
window.onload = () => {
  windowLoaded = true;
  if (fontLoaded) {
    initGame();
  }
};
