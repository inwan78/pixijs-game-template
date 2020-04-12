const Config = {
  ResourceBaseUrl: 'assets/',
  Screen: { //画面サイズなど
    Width: 512,
    Height: 768,
    BakcgroundColor: 0x000000,
  },
  Display: {
    Width: 0, 
    Height: 0,
  },
  Volume: { //音のボリューム。値は0~1
    Bgm: 1, 
    Sound: 1,  
  },  
  Strage: { //ローカルストレージ
    Title: 'test'
  },
  Keys: { //キーボード入力
    Up: 87,//w
    Right: 68,//d
    Down: 83,//s
    Left: 65,//a
    A: 78,//n
    B: 77,//m
    Start: 13//Enter
  }
};

export default Config;