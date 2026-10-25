/* 校區是搜尋範圍；中心點僅作地區底圖視野，不當成餐廳位置。 */
window.IslandLunch={
 addresses:{'熹湯鋪子【台中中華店】':'臺中市北區中華路二段88號','熹湯舖子':'臺中市北區中華路二段88號','熹湯鋪子':'臺中市北區中華路二段88號'},
 campuses:{
 '三民校區':{label:'中科大・三民校區',query:'國立臺中科技大學 三民校區',city:'臺中市',lat:24.1494,lng:120.6832},
 '民生校區':{label:'中科大・民生校區',query:'國立臺中科技大學 民生校區',city:'臺中市',lat:24.1426,lng:120.6746},
 '中興大學':{label:'中興大學',query:'國立中興大學',city:'臺中市',lat:24.121,lng:120.675},
 '東海大學':{label:'東海大學',query:'東海大學',city:'臺中市',lat:24.181,lng:120.602},
 '逢甲大學':{label:'逢甲大學',query:'逢甲大學',city:'臺中市',lat:24.181,lng:120.647},
 '彰師大進德校區':{label:'彰師大・進德校區',query:'國立彰化師範大學 進德校區',city:'彰化縣彰化市',lat:24.082,lng:120.557},
 '彰師大師大校區':{label:'彰師大・師大校區（原寶山）',query:'國立彰化師範大學 師大校區',city:'彰化縣彰化市',lat:24.067,lng:120.561}
 },
 starter:['便當','雞肉飯','滷肉飯','水餃','鍋貼','牛肉麵','乾麵','拉麵','咖哩飯','炒飯','炒麵','小火鍋','義大利麵','漢堡','三明治','健康餐盒']
};

/* 2026-10-24 查閱資料；來源是參考，非即時營業保證。 */
IslandLunch.shops={
  "中興大學": [
    {
      "name": "京都排骨",
      "dish": "排骨飯",
      "area": "興大・學府路商圈",
      "source": "https://www.dcard.tw/f/nchu/p/229706208",
      "note": "學生分享提及滷汁及飯食續加；地址資料有差異，請先核對分店與現場規則。"
    },
    {
      "name": "聞香牛肉麵（學府路店）",
      "dish": "牛肉麵、滷味",
      "area": "臺中市南區學府路81號",
      "source": "https://blog.kc-studio.net.tw/2024/04/12/beef_noodle_1986/",
      "note": "食記提及可加麵、加湯；以現場規則為準。"
    },
    {
      "name": "清一色牛肉麵（興大商圈）",
      "dish": "牛肉麵",
      "area": "興大・學府路商圈",
      "source": "https://trade.1111.com.tw/Comp_Info?vNo=249697",
      "note": "品牌介紹曾提及加麵、加湯服務；請確認目前分店規則。"
    },
    {
      "name": "香香小吃（興大學府路）",
      "dish": "飯食、小吃",
      "area": "興大・學府路",
      "source": "https://fon435.pixnet.net/",
      "note": "日夜菜單可能不同，請看當日供應。"
    },
    {
      "name": "深森 SHEN POKE（興大圓廳）",
      "dish": "POKE 餐碗",
      "area": "校內・圓廳",
      "source": "https://oga.nchu.edu.tw/",
      "note": ""
    },
    {
      "name": "麥味登（興大圓廳）",
      "dish": "早午餐",
      "area": "校內・圓廳",
      "source": "https://oga.nchu.edu.tw/",
      "note": ""
    }
  ],
  "東海大學": [
    {
      "name": "聞香牛肉麵（東海店）",
      "dish": "牛肉麵",
      "area": "臺中市龍井區新興路31-2號",
      "source": "https://cheer198.pixnet.net/blog/posts/2036259364",
      "note": ""
    },
    {
      "name": "向宏魯肉飯",
      "dish": "魯肉飯、肉羹",
      "area": "東海商圈・新興路",
      "source": "https://buuz.tw/donghai-foods/",
      "note": ""
    },
    {
      "name": "東海刈包大王（東海總店）",
      "dish": "刈包、四神湯",
      "area": "臺中市龍井區臺灣大道五段3巷49號",
      "source": "https://www.104.com.tw/company/1a2x6bla6h",
      "note": ""
    },
    {
      "name": "張家飯館（東海）",
      "dish": "排骨飯、便當",
      "area": "東海商圈・新興路",
      "source": "https://www.facebook.com/ChangJiaRestaurant/",
      "note": "請核對當日午餐供應。"
    },
    {
      "name": "豆子洋食商行（東海店）",
      "dish": "洋食飯、火鍋",
      "area": "臺中市龍井區新興路27巷16號",
      "source": "https://www.facebook.com/doob22/",
      "note": ""
    },
    {
      "name": "東海龍門客棧美食",
      "dish": "仙草凍、芋圓",
      "area": "臺中市龍井區新興路1巷19號",
      "source": "https://sillycoupleblog.tw/taichung-longjing-food-longmenfood-2609/",
      "note": "飯後甜點／小吃選項。"
    }
  ],
  "逢甲大學": [
    {
      "name": "鄭二家快餐",
      "dish": "雞排飯、便當",
      "area": "臺中市西屯區文華路120號",
      "source": "https://blake.com.tw/blog/post/zheng-er-jia-2608",
      "note": ""
    },
    {
      "name": "下辣高手",
      "dish": "麵食",
      "area": "逢甲商圈",
      "source": "https://www.facebook.com/100063949209166/",
      "note": ""
    },
    {
      "name": "九湯屋日本拉麵（逢甲店）",
      "dish": "拉麵",
      "area": "逢甲商圈",
      "source": "https://sites.google.com/view/fcusapr/食物類",
      "note": "學生會曾列為特約店家；此處不代表優惠仍有效。"
    },
    {
      "name": "四號咖哩",
      "dish": "咖哩飯",
      "area": "逢甲商圈",
      "source": "https://sites.google.com/view/fcusapr/食物類",
      "note": "學生會曾列為特約店家；此處不代表優惠仍有效。"
    },
    {
      "name": "港仔煲仔飯",
      "dish": "煲仔飯",
      "area": "逢甲商圈",
      "source": "https://sites.google.com/view/fcusapr/食物類",
      "note": "學生會曾列為特約店家；此處不代表優惠仍有效。"
    },
    {
      "name": "吳班長川味便當",
      "dish": "便當",
      "area": "逢甲商圈",
      "source": "https://sites.google.com/view/fcusapr/食物類",
      "note": "學生會曾列為特約店家；此處不代表優惠仍有效。"
    }
  ],
  "彰師大進德校區": [
    {
      "name": "蘇菠麵",
      "dish": "手工麵食",
      "area": "彰化市進德路30號",
      "source": "https://ko310kmo.pixnet.net/blog/posts/2035900490",
      "note": ""
    },
    {
      "name": "聞香牛肉麵（彰化店）",
      "dish": "牛肉麵",
      "area": "彰化市實踐路112號",
      "source": "https://cheer198.pixnet.net/blog/posts/2036259364",
      "note": ""
    },
    {
      "name": "北門口肉圓（民生店）",
      "dish": "肉圓",
      "area": "彰化市民生路315號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校周邊美食清單收錄；商圈店家需依距離安排接駁。"
    },
    {
      "name": "手匠拉麵",
      "dish": "拉麵",
      "area": "彰化市中正路一段367號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校周邊美食清單收錄；商圈店家需依距離安排接駁。"
    },
    {
      "name": "阿本爌肉飯",
      "dish": "爌肉飯",
      "area": "彰化市中山路二段404號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校周邊美食清單收錄；商圈店家需依距離安排接駁。"
    }
  ],
  "彰師大師大校區": [
    {
      "name": "原山拉麵",
      "dish": "拉麵",
      "area": "彰化市南郭路一段173號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    },
    {
      "name": "麵屋三金",
      "dish": "拉麵",
      "area": "彰化市介壽北路247號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    },
    {
      "name": "千菊丸",
      "dish": "麵食",
      "area": "彰化市南瑤路33號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    },
    {
      "name": "阿貞河粉／阿貞的店",
      "dish": "河粉",
      "area": "彰化市東民街91號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    },
    {
      "name": "阿章爌肉飯",
      "dish": "爌肉飯",
      "area": "彰化市南郭路一段6號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    },
    {
      "name": "林小胖爌肉飯",
      "dish": "爌肉飯",
      "area": "彰化市民族路483號",
      "source": "https://freshman.ncue.edu.tw/p/405-1047-22061,c3435.php",
      "note": "學校列為周邊美食，部分需騎車接駁，非校門口步行店家。"
    }
  ]
};
IslandLunch.findShop=(campus,name)=>(IslandLunch.shops[campus]||[]).find(p=>p.name===name);
