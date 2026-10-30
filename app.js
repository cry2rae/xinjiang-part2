/* 新疆后半程 · 个人版（2026-11-08 ~ 11-17）
   底图：高德地图瓦片（GCJ-02）｜导航：高德 URI API */
'use strict';

const LS_KEY = 'nanjiang-solo-plan-v1';
let state = null;
let ui = { place: 'all', tab: 'days', mapDay: null };
let PICK = false;          // 地图点选加景点模式
let RTOKEN = 0;            // 渲染版本号，防止旧地图残留

/* ============ 内置坐标库（GCJ-02，高德系；部分石窟为近似点） ============ */
const POI = {
  /* --- 库尔勒 --- */
  '库尔勒站': [86.1560, 41.7300],
  '库尔勒客运站': [86.1500, 41.7260],
  '库尔勒机场': [86.1500, 41.6800],
  '越山青年旅舍（库尔勒）': [86.1580, 41.7235],
  '巴州博物馆': [86.1680, 41.7230],
  '南疆大巴扎': [86.1800, 41.7400],
  '梨城大巴扎': [86.1800, 41.7400],
  '杜鹃河': [86.1950, 41.7450],
  '孔雀河': [86.1700, 41.7330],
  '塔塔秘境': [86.7927, 40.8698],
  '塔塔秘境·罗布湖': [86.7927, 40.8698],
  '罗布人村寨': [86.3667, 41.3167],
  /* --- 吐鲁番 --- */
  '吐鲁番北站': [89.1167, 43.0167],
  '吐鲁番市区': [89.1831, 42.9478],
  '吐鲁番郡王府': [89.1903, 42.9517],
  '郡王府': [89.1903, 42.9517],
  '吐鲁番老街': [89.1800, 42.9503],
  '吐鲁番巴扎': [89.1736, 42.9519],
  '苏公塔': [89.1736, 42.9389],
  '葡萄沟': [89.2667, 43.0167],
  '交河故城': [89.0644, 42.9519],
  '坎儿井民俗园': [89.1500, 42.9300],
  '坎儿井乐园': [89.1500, 42.9300],
  '火云谷': [89.3500, 43.0500],
  '麻扎村': [89.6600, 42.9030],
  '吐峪沟麻扎村': [89.6600, 42.9030],
  '库木塔格沙漠': [90.2333, 42.8500],
  '柏孜克里克千佛洞': [89.5333, 42.9556],
  '柏孜克里克石窟': [89.5333, 42.9556],
  '吐峪沟石窟': [89.6583, 42.9083],
  '胜金口石窟': [89.6167, 42.9833],
  '雅儿湖石窟': [89.0550, 42.9530],
  /* --- 乌鲁木齐 --- */
  '乌鲁木齐站': [87.5456, 43.8550],
  '高铁汽车站（乌鲁木齐）': [87.5460, 43.8560],
  '天山天池': [88.1170, 43.8870],
  '天池': [88.1170, 43.8870],
  '乌鲁木齐市区': [87.6168, 43.8256],
  '红山公园': [87.6118, 43.8230],
  '二道桥': [87.6130, 43.7900]
};

/* ============ 初始行程数据 ============ */
const SEED = {
  v: 1,
  trip: {
    title: '新疆后半程 · 个人版',
    sub: '库尔勒 → 吐鲁番 → 乌鲁木齐',
    start: '2026-11-08',
    end: '2026-11-17'
  },
  settings: { amapKey: '' },
  places: ['库尔勒', '吐鲁番', '乌鲁木齐'],
  days: [
    {
      id: 'd1', date: '2026-11-08', no: 'D1', wd: '周日', place: '库尔勒', city: '库尔勒',
      title: '塔塔秘境回来 · 换住青旅', stay: '越山青年旅舍（库尔勒）', stayLL: '86.1580,41.7235',
      legs: [{ id: 'd1l1', mode: '🚌', text: '塔塔秘境 · 罗布湖往返大巴', time: '10:00 → 17:00', note: '尉犁县 218 国道 887 公里处，距库尔勒约 120 公里' }],
      stops: [
        { id: 'd1s1', name: '塔塔秘境 · 罗布湖', time: '10:00-17:00', ll: '86.7927,40.8698', intro: '沙漠、胡杨与湖泊共存。滑沙、越野、游船等项目按兴趣自选', note: '当天把行李收拾好，回来直接搬家', links: [], done: false },
        { id: 'd1s2', name: '入住越山青年旅舍', time: '晚上', ll: '86.1580,41.7235', intro: '库尔勒市区的下一处住地，往下还要住两晚', note: '入住顺利的话，顺手问前台 09 号去罗布人村寨怎么坐车最省事', links: [], done: false }
      ],
      notes: ['从这里开始是自己这段行程。库尔勒的住处已定：越山青年旅舍，08、09 两晚都在这里。']
    },
    {
      id: 'd2', date: '2026-11-09', no: 'D2', wd: '周一', place: '库尔勒', city: '库尔勒',
      title: '罗布人村寨一日游', stay: '越山青年旅舍（库尔勒）', stayLL: '86.1580,41.7235',
      legs: [{ id: 'd2l1', mode: '🚗', text: '库尔勒 ⇄ 罗布人村寨', time: '早出发，全天', note: '尉犁县境内，距库尔勒约 85 公里，往返车程约 2.5–3 小时。拼车或班车提前一晚确认' }],
      stops: [
        { id: 'd2s1', name: '罗布人村寨', time: '全天', ll: '86.3667,41.3167', intro: '塔里木河畔的罗布人聚落，一边是沙漠一边是河与胡杨，接得上昨天塔塔秘境那一套地貌', note: '景区里项目自选；沙漠段日照强，帽子墨镜防晒照旧', links: [], done: false },
        { id: 'd2s2', name: '回到青旅 · 收行李', time: '傍晚', ll: '86.1580,41.7235', intro: '明天 11:05 的火车，今晚把要带的都收出来', note: '火车票、身份证放随身包，不要压箱底', links: [], done: false }
      ],
      notes: ['明天是 11:05 库尔勒 → 15:56 吐鲁番北站，上午出发，不用赶早，但要留出进站时间。']
    },
    {
      id: 'd3', date: '2026-11-10', no: 'D3', wd: '周二', place: '吐鲁番', city: '吐鲁番',
      title: '转场吐鲁番 · 下午市区半天', stay: '吐鲁番市区（酒店待补）', stayLL: '89.1831,42.9478',
      legs: [
        { id: 'd3l1', mode: '🚂', text: '库尔勒 → 吐鲁番北站', time: '11:05 → 15:56', note: '约 5 小时，午饭提前买好在车上吃' }
      ],
      stops: [
        { id: 'd3s1', name: '抵达吐鲁番北站', time: '15:56', ll: '89.1167,43.0167', intro: '出站先看清方位——13 号要搬来北站住', note: '北站到市区打车约 40 分钟，价格先问清楚', links: [], done: false },
        { id: 'd3s2', name: '到市区 · 放行李', time: '下午', ll: '89.1831,42.9478', intro: '先在市区落脚，连住三晚（10、11、12 号）', note: '住处具体门店待补，建议选离老街/郡王府步行可达的位置', links: [], done: false },
        { id: 'd3s3', name: '市区随便走走 · 踩点', time: '傍晚', ll: '89.1800,42.9503', intro: '不排满：找条主街走一圈，认清方位、找好明天的早点和晚饭', note: '11 月吐鲁番天黑得早，太阳一落温度掉得快，出去带外套', links: [], done: false }
      ],
      notes: ['市区一共一天半：今天下午先踩点，明天 11 号整天慢慢逛郡王府、老街、巴扎。']
    },
    {
      id: 'd4', date: '2026-11-11', no: 'D4', wd: '周三', place: '吐鲁番', city: '吐鲁番',
      title: '吐鲁番市区一天 · 老城慢慢逛', stay: '吐鲁番市区（酒店待补）', stayLL: '89.1831,42.9478',
      legs: [],
      stops: [
        { id: 'd4s1', name: '吐鲁番郡王府', time: '上午', ll: '89.1903,42.9517', intro: '回部札萨克多罗郡王的府邸，伊斯兰式建筑与地方政权史，当天的头一个重点', note: '进去先绕建筑一圈再细看，上午光线最好', links: [], done: false },
        { id: 'd4s2', name: '吐鲁番老街', time: '中午', ll: '89.1800,42.9503', intro: '老城的生活区：馕坑、茶馆、手工作坊，午饭可以就在这儿', note: '遇到开着的馕坑就别饿着，刚出炉的最好', links: [], done: false },
        { id: 'd4s3', name: '吐鲁番巴扎', time: '下午', ll: '89.1736,42.9519', intro: '干果、葡萄、布料、日用品混在一起的市场，适合收尾', note: '干果葡萄干按「能不能带上路」买，别一次买太多', links: [], done: false },
        { id: 'd4s4', name: '晚饭 & 早点回住处', time: '晚上', ll: '89.1831,42.9478', intro: '明天是石窟日，司机上门接，今晚把包收好、充满电', note: '', links: [], done: false }
      ],
      notes: ['市区这一天不赶点：都在步行范围内，走累了随时找个茶馆坐下来。']
    },
    {
      id: 'd5', date: '2026-11-12', no: 'D5', wd: '周四', place: '吐鲁番', city: '吐鲁番',
      title: '石窟一日 · 四个石窟（司机上门接）', stay: '吐鲁番市区（酒店待补）', stayLL: '89.1831,42.9478',
      legs: [{ id: 'd5l1', mode: '🚗', text: '司机上门接 · 石窟环线', time: '早出发 → 傍晚回市区', note: '提前一天和司机确认接人地点、时间、是否含门票' }],
      stops: [
        { id: 'd5s1', name: '柏孜克里克千佛洞', time: '上午', ll: '89.5333,42.9556', intro: '火焰山木头沟里的石窟群，高昌回鹘时期壁画，四个石窟里体量最大', note: '洞内通常禁拍、限制人数，按当日管理执行', links: [], done: false },
        { id: 'd5s2', name: '吐峪沟石窟', time: '中午', ll: '89.6583,42.9083', intro: '吐峪沟峡谷里的早期石窟，连着下面的吐峪沟村一起看', note: '石窟开放与否视当日管理，先跟司机确认', links: [], done: false },
        { id: 'd5s3', name: '胜金口石窟', time: '下午', ll: '89.6167,42.9833', intro: '火焰山北麓的小型石窟，看点在被破坏痕迹与残存壁画的对照', note: '规模小，停留不长', links: [], done: false },
        { id: 'd5s4', name: '雅儿湖石窟', time: '下午', ll: '89.0550,42.9530', intro: '交河故城西侧崖壁上的洞窟，与故城是同一处遗存，14 号还会再来这一带', note: '地图上这四个石窟是近似点位，到现场可以拖动微调', links: [], done: false }
      ],
      notes: ['四个石窟的实际开放情况是变量：哪几个能进、能进几个洞，出发前一天再跟司机确认一次。']
    },
    {
      id: 'd6', date: '2026-11-13', no: 'D6', wd: '周五', place: '吐鲁番', city: '吐鲁番',
      title: '搬到北站 · 旅游环线（交河 + 坎儿井）', stay: '吐鲁番北站附近（酒店待补）', stayLL: '89.1167,43.0167',
      legs: [{ id: 'd6l1', mode: '🚕', text: '市区 → 吐鲁番北站', time: '一早', note: '行李直接放到北站的住处，13、14 两晚住这里' }],
      stops: [
        { id: 'd6s1', name: '到北站 · 行李落定', time: '早上', ll: '89.1167,43.0167', intro: '先把行李安置好再出门，这两天都在这一带进出', note: '顺便看一眼 15 号早上进站怎么走', links: [], done: false },
        { id: 'd6s2', name: '交河故城', time: '上午', ll: '89.0644,42.9519', intro: '两千多年前的生土城，直接在台地上掏挖成型，当天的重点', note: '台地上没遮挡、风大，穿防风外套；走完全程约 2 小时', links: [], done: false },
        { id: 'd6s3', name: '坎儿井民俗园', time: '下午', ll: '89.1500,42.9300', intro: '下到暗渠里看坎儿井怎么把雪水引进盆地，和交河正好配成一套「水与城」', note: '暗渠里湿滑，注意脚下', links: [], done: false },
        { id: 'd6s4', name: '回北站住处', time: '傍晚', ll: '89.1167,43.0167', intro: '这天比石窟日轻松，晚上留给自己整理照片', note: '', links: [], done: false }
      ],
      notes: ['13、14 号两天是「旅游环线」和「火云谷线」各一天，顺序按天气和体力临时调换：环线＝交河故城＋坎儿井；火云谷线＝火云谷＋麻扎村＋库木塔格沙漠。']
    },
    {
      id: 'd7', date: '2026-11-14', no: 'D7', wd: '周六', place: '吐鲁番', city: '吐鲁番',
      title: '火云谷线 · 火云谷 / 麻扎村 / 库木塔格沙漠', stay: '吐鲁番北站附近（酒店待补）', stayLL: '89.1167,43.0167',
      legs: [{ id: 'd7l1', mode: '🚗', text: '北站 ⇄ 火云谷线', time: '早出发 → 傍晚回', note: '这条线最远到鄯善，包车或拼车一天，前一晚确认接人时间' }],
      stops: [
        { id: 'd7s1', name: '火云谷', time: '上午', ll: '89.3500,43.0500', intro: '红色砂岩峡谷，和火焰山是同一套地层的另一种样子', note: '谷里路不长，但石头反光强，墨镜带上', links: [], done: false },
        { id: 'd7s2', name: '麻扎村', time: '中午', ll: '89.6600,42.9030', intro: '吐峪沟里的维吾尔古村落，黄黏土房子依山层层叠叠，还有一处古老墓地', note: '村里还有人住，进院子先打招呼，别在人家门口长时间拍', links: [], done: false },
        { id: 'd7s3', name: '库木塔格沙漠', time: '下午', ll: '90.2333,42.8500', intro: '城市与沙漠紧挨着的地方，当天压轴，日落时段最好看', note: '风大时沙尘明显，围巾或口罩有用；越野项目按当日情况自选', links: [], done: false },
        { id: 'd7s4', name: '回北站', time: '晚上', ll: '89.1167,43.0167', intro: '最后一晚在北站，明天直接进站去乌鲁木齐', note: '今晚把 15 号的高铁票再确认一遍', links: [], done: false }
      ],
      notes: ['这天行程最长、单段车程也最长，水和零食带够，回程时间别压得太晚。']
    },
    {
      id: 'd8', date: '2026-11-15', no: 'D8', wd: '周日', place: '乌鲁木齐', city: '乌鲁木齐',
      title: '高铁去乌鲁木齐', stay: '乌鲁木齐（酒店待补）', stayLL: '87.6168,43.8256',
      legs: [{ id: 'd8l1', mode: '🚄', text: '吐鲁番北站 → 乌鲁木齐', time: '高铁（车次待定）', note: '约 1 小时；住北站的好处是不用赶早车。车次以 12306 为准' }],
      stops: [
        { id: 'd8s1', name: '到乌鲁木齐 · 放行李', time: '下午', ll: '87.6168,43.8256', intro: '市区的住处待补，连住三晚（15、16、17 号）', note: '优先选去高铁汽车站/地铁方便的，明天要去高铁站坐车', links: [], done: false },
        { id: 'd8s2', name: '市区补给 & 随便走走', time: '下午', ll: '87.6118,43.8230', intro: '红山公园看城市全景是个省事的收尾方式；乌鲁木齐你来过，博物馆和大巴扎这次跳过', note: '', links: [], done: false },
        { id: 'd8s3', name: '今晚必做：确认天池往返', time: '晚上', ll: '87.6168,43.8256', intro: '16 号的天池，券在 11 月 15 日 11:00 这一轮放出', note: '15 号 11 点之前把下单信息填好，别等开抢再手忙脚乱', links: [], done: false }
      ],
      notes: ['天池往返的关键节点就两个：15 号 11:00 抢券，16 号早上按时到高铁汽车站。这两天别安排太晚的活动。']
    },
    {
      id: 'd9', date: '2026-11-16', no: 'D9', wd: '周一', place: '乌鲁木齐', city: '乌鲁木齐',
      title: '天山天池一日 · 公共交通往返', stay: '乌鲁木齐（酒店待补）', stayLL: '87.6168,43.8256',
      legs: [{ id: 'd9l1', mode: '🚌', text: '高铁汽车站 ⇄ 天池', time: '早上出发，傍晚回', note: '「天山行」新疆公路客运往返天池。返程末班时间出发前必须确认好' }],
      stops: [
        { id: 'd9s1', name: '高铁汽车站（天山行发车）', time: '早上', ll: '87.5460,43.8560', intro: '乌鲁木齐高铁站旁的公路客运站，「天山行」往返天池的车在这里发', note: '提前半小时到；带上身份证、券/订单二维码', links: [], done: false },
        { id: 'd9s2', name: '天山天池', time: '白天', ll: '88.1170,43.8870', intro: '博格达峰下的高山湖泊，海拔约 1900 米。冬天的天池是雪景加冰面，和夏天的绿不是一个样子', note: '山上比市区冷得多，厚外套、帽子手套必带；湖边栈道结冰注意防滑', links: [], done: false },
        { id: 'd9s3', name: '回乌鲁木齐', time: '傍晚', ll: '87.6168,43.8256', intro: '当天往返，晚上回到市区', note: '留出等车和堵车余量，别卡最后一班', links: [], done: false }
      ],
      notes: ['交通按你之前查到的办法：高铁汽车站坐「天山行」新疆公路客运往返天池，券在 11 月 15 日 11:00 那一轮。', '11 月的天池已经入冬，摆渡车、索道、冰面项目开不开，出发前一天在官方渠道再核一遍。']
    },
    {
      id: 'd10', date: '2026-11-17', no: 'D10', wd: '周二', place: '乌鲁木齐', city: '乌鲁木齐',
      title: '乌鲁木齐市区 · 留白一天', stay: '乌鲁木齐（酒店待补）', stayLL: '87.6168,43.8256',
      legs: [],
      stops: [
        { id: 'd10s1', name: '机动：给自己留的一天', time: '全天', ll: '87.6168,43.8256', intro: '没有硬安排。想补就去补昨天没去的，想歇就睡到自然醒', note: '这一天的具体内容你自己往里加', links: [], done: false }
      ],
      notes: ['最后一天按实际状态决定：想收尾就采购补给，想休息就慢下来。这条留给你自己填。']
    }
  ],
  tips: [
    { id: 't1', cat: '证件', text: '身份证随身带，不要压在行李箱底：火车进站、住宿登记、景区实名都要用。', done: false },
    { id: 't2', cat: '抢票', text: '11.16 天山天池往返：券在 11 月 15 日 11:00 那一轮放出，14 号晚、15 号早上各看一眼，别错过。', done: false },
    { id: 't3', cat: '预约', text: '天池是否需要实名预约、景区摆渡车/索道冬天是否运营，出发前一天在官方渠道确认。', done: false },
    { id: 't4', cat: '火车', text: '11.10 库尔勒 11:05 → 吐鲁番北站 15:56，约 5 小时，午饭提前买好在车上吃。', done: false },
    { id: 't5', cat: '火车', text: '11.15 吐鲁番北站 → 乌鲁木齐的高铁车次待定，所有时刻以 12306 为准。', done: false },
    { id: 't6', cat: '当地确认', text: '11.12 石窟日：司机上门接的地点和时间、含哪些门票，前一天再确认一次；四个石窟哪几个能进是当日变量。', done: false },
    { id: 't7', cat: '当地确认', text: '11.13 / 11.14 两条线路（环线＝交河故城＋坎儿井；火云谷线＝火云谷＋麻扎村＋库木塔格沙漠）根据天气和体力临时调换，出发前一天定案。', done: false },
    { id: 't8', cat: '住宿', text: '待补的住处：吐鲁番市区 3 晚（10–12 号）、吐鲁番北站 2 晚（13–14 号）、乌鲁木齐 3 晚（15–17 号）。库尔勒的越山青年旅舍已定。', done: false },
    { id: 't9', cat: '装备', text: '11 月吐鲁番白天暖、太阳一落就掉到接近零度；天池比市区再冷一档，厚外套、抓绒、帽子手套都要带。', done: false },
    { id: 't10', cat: '装备', text: '天池和沙漠段都要防滑：路面结冰、沙地打滑，穿底纹深的鞋，必要时带简易冰爪。', done: false },
    { id: 't11', cat: '行李', text: '13 号一早从市区搬北站：前一晚把行李分好「随身 / 寄存」，避免一大早翻箱。', done: false },
    { id: 't12', cat: '时间风险', text: '14 号火云谷线最远到鄯善，单段车程最长，回程别卡太晚，15 号还要赶高铁。', done: false },
    { id: 't13', cat: '现金', text: '小额现金备一点：拼车分摊、村寨门票、向导小费更方便，大额用手机支付。', done: false }
  ]
};

const TIP_CAT = ['证件', '抢票', '预约', '火车', '当地确认', '住宿', '装备', '行李', '时间风险', '现金', '节奏', '离线', '其他'];
const TIP_ICON = { '证件': '🛂', '抢票': '🎫', '预约': '📝', '火车': '🚂', '当地确认': '☎️', '住宿': '🏠', '装备': '🎒', '行李': '🧳', '时间风险': '⏱️', '现金': '💰', '节奏': '🚶', '离线': '📶', '其他': '📌' };


/* ============ 工具 ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const V = (id) => { const e = $('#' + id); return e ? String(e.value).trim() : ''; };

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 2000);
}
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDate = (ds) => { const p = String(ds || '').split('-'); return p.length === 3 ? `${+p[1]}.${pad2(+p[2])}` : ds; };
function wdOf(ds) {
  const d = new Date(ds + 'T00:00:00');
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
}
function dayDiff(a, b) { // b - a，单位天
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

/* WGS-84 → GCJ-02 */
const _PI = Math.PI, _A = 6378245.0, _EE = 0.00669342162296594323;
function _outOfChina(lng, lat) { return !(lng > 72.004 && lng < 137.8347 && lat > 0.8293 && lat < 55.8271); }
function _tLat(x, y) {
  let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  r += (20 * Math.sin(6 * x * _PI) + 20 * Math.sin(2 * x * _PI)) * 2 / 3;
  r += (20 * Math.sin(y * _PI) + 40 * Math.sin(y / 3 * _PI)) * 2 / 3;
  r += (160 * Math.sin(y / 12 * _PI) + 320 * Math.sin(y * _PI / 30)) * 2 / 3;
  return r;
}
function _tLng(x, y) {
  let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  r += (20 * Math.sin(6 * x * _PI) + 20 * Math.sin(2 * x * _PI)) * 2 / 3;
  r += (20 * Math.sin(x * _PI) + 40 * Math.sin(x / 3 * _PI)) * 2 / 3;
  r += (150 * Math.sin(x / 12 * _PI) + 300 * Math.sin(x / 30 * _PI)) * 2 / 3;
  return r;
}
function wgs2gcj(lng, lat) {
  if (_outOfChina(lng, lat)) return [lng, lat];
  let dLat = _tLat(lng - 105, lat - 35), dLng = _tLng(lng - 105, lat - 35);
  const rLat = lat / 180 * _PI;
  let m = Math.sin(rLat); m = 1 - _EE * m * m;
  const sm = Math.sqrt(m);
  dLat = (dLat * 180) / ((_A * (1 - _EE)) / (m * sm) * _PI);
  dLng = (dLng * 180) / (_A / sm * Math.cos(rLat) * _PI);
  return [lng + dLng, lat + dLat];
}

/* 坐标解析 / 格式化 */
function parseLL(s) {
  if (!s) return null;
  if (Array.isArray(s)) return [+s[0], +s[1]];
  const m = String(s).match(/(-?\d+\.?\d*)\s*[,，\s]\s*(-?\d+\.?\d*)/);
  if (!m) return null;
  const a = +m[1], b = +m[2];
  if (Math.abs(a) > 180 || Math.abs(b) > 90) return null;
  return [a, b];
}
const llStr = (ll) => (ll ? `${(+ll[0]).toFixed(5)},${(+ll[1]).toFixed(5)}` : '');

/* 高德链接 */
const amapMarker = (ll, name) => `https://uri.amap.com/marker?position=${ll[0]},${ll[1]}&name=${encodeURIComponent(name || '')}&src=njtrip&coordinate=gaode&callnative=1`;
const amapNav = (ll, name) => `https://uri.amap.com/navigation?to=${ll[0]},${ll[1]},${encodeURIComponent(name || '')}&mode=car&policy=1&src=njtrip&coordinate=gaode&callnative=1`;
const amapSearch = (q) => `https://uri.amap.com/search?keyword=${encodeURIComponent(q || '')}&src=njtrip&coordinate=gaode&callnative=1`;
const stopHref = (s) => { const ll = parseLL(s.ll); return ll ? amapNav(ll, s.name) : amapSearch(s.name); };

/* 从高德/其他地图分享链接里抠坐标 */
function parseMapUrl(s) {
  s = String(s || '').trim();
  if (!s) return null;
  const grab = (re, flip) => {
    const m = s.match(re);
    if (!m) return null;
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    if (!isFinite(a) || !isFinite(b)) return null;
    return flip ? [b, a] : [a, b];
  };
  const ll =
    grab(/[?&]position=(-?\d+\.?\d*)(?:%2C|,)[ ]*(-?\d+\.?\d*)/i) ||
    grab(/[?&](?:center|to|from|latlng|coordinate|location)=(-?\d+\.?\d*)(?:%2C|,)[ ]*(-?\d+\.?\d*)/i) ||
    grab(/[?&]lng=(-?\d+\.?\d*)[&]lat=(-?\d+\.?\d*)/i) ||
    grab(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/) ||
    grab(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, true);
  let name = '';
  const nm = s.match(/[?&](?:name|keyword|query|title|poiname)=([^&#]*)/i);
  if (nm) { try { name = decodeURIComponent(nm[1].replace(/\+/g, ' ')); } catch (e) { name = nm[1]; } }
  return ll ? { ll, name } : null;
}

/* 地名 → 坐标 */
function lookupPOI(name) {
  const n = String(name || '').trim();
  if (!n) return null;
  if (POI[n]) return POI[n];
  const keys = Object.keys(POI).sort((a, b) => b.length - a.length);
  for (const k of keys) if (n.includes(k)) return POI[k];
  if (n.length >= 3) for (const k of keys) if (k.includes(n)) return POI[k];
  return null;
}
async function geocode(q) {
  q = String(q || '').trim();
  if (!q) return [];
  const out = [];
  const local = lookupPOI(q);
  if (local) out.push({ name: q, ll: local, addr: '内置坐标库' });

  const key = (state.settings && state.settings.amapKey) || '';
  if (key) {
    try {
      const u = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(q)}&offset=6&key=${encodeURIComponent(key)}`;
      const r = await fetch(u);
      const j = await r.json();
      (j.pois || []).forEach((p) => {
        const ll = parseLL(p.location);
        if (ll) out.push({ name: p.name, ll, addr: [p.cityname, p.adname, p.address].filter(Boolean).join('') });
      });
    } catch (e) { /* 忽略，走下面的兜底 */ }
  }
  if (out.length) return out.slice(0, 8);

  try {
    const u = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6&countrycodes=cn&accept-language=zh-CN`;
    const r = await fetch(u, { headers: { 'Accept-Language': 'zh-CN' } });
    const j = await r.json();
    (j || []).forEach((p) => {
      const ll = wgs2gcj(+p.lon, +p.lat);
      out.push({ name: p.display_name.split(',')[0], ll, addr: p.display_name });
    });
  } catch (e) { }
  return out.slice(0, 8);
}

/* ============ 存储 ============ */
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { }
}
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { state = JSON.parse(raw); normalize(); return; }
  } catch (e) { }
  resetState();
}
function resetState() { state = JSON.parse(JSON.stringify(SEED)); save(); }
function normalize() {
  state.trip = state.trip || SEED.trip;
  state.settings = state.settings || { amapKey: '' };
  state.places = state.places || [];
  state.tips = state.tips || [];
  state.days = (state.days || []).map((d) => {
    d.stops = (d.stops || []).map((s) => ({
      id: s.id || uid(), name: s.name || '未命名', time: s.time || '', intro: s.intro || '',
      note: s.note || '', ll: s.ll || '', links: s.links || [], done: !!s.done
    }));
    d.legs = d.legs || []; d.notes = d.notes || [];
    d.wd = d.wd || wdOf(d.date);
    return d;
  });
  // 保证 places 覆盖所有天的城市
  state.days.forEach((d) => { if (d.place && !state.places.includes(d.place)) state.places.push(d.place); });
}

/* ============ 地图 ============ */
let MAPS = [];
function regMap(scope, m) { MAPS.push({ scope, m }); return m; }
function killMaps(scope) {
  MAPS = MAPS.filter((x) => {
    if (!scope || x.scope === scope) { try { x.m.remove(); } catch (e) { } return false; }
    return true;
  });
}
const AMAP_TILE = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
function addAmapTiles(map) {
  L.tileLayer(AMAP_TILE, {
    subdomains: ['1', '2', '3', '4'], minZoom: 3, maxZoom: 18,
    attribution: '© 高德地图'
  }).addTo(map);
}
function pinIcon(n, kind) {
  const cls = kind === 'stay' ? 'stay' : (kind === 'done' ? 'done' : '');
  const txt = kind === 'stay' ? '🏠' : n;
  return L.divIcon({
    html: `<div class="pin-icon ${cls}"><span>${txt}</span></div>`,
    className: '', iconSize: [23, 23], iconAnchor: [11, 21], popupAnchor: [0, -18]
  });
}
function dayPoints(day) {
  const pts = [];
  (day.stops || []).forEach((s, i) => { const ll = parseLL(s.ll); if (ll) pts.push({ i, s, ll }); });
  return pts;
}
function drawDay(map, day, opts) {
  opts = opts || {};
  const fg = L.featureGroup().addTo(map);
  const pts = dayPoints(day);
  pts.forEach((p) => {
    const mk = L.marker([p.ll[1], p.ll[0]], { icon: pinIcon(p.i + 1, p.s.done ? 'done' : '') });
    mk.bindPopup(`<b>${esc(p.s.name)}</b>${p.s.time ? ` · ${esc(p.s.time)}` : ''}${p.s.intro ? `<br><span style="color:#6d5c4d">${esc(p.s.intro)}</span>` : ''}`);
    fg.addLayer(mk);
  });
  const stay = parseLL(day.stayLL);
  if (stay && day.stay) {
    const mk = L.marker([stay[1], stay[0]], { icon: pinIcon(null, 'stay'), zIndexOffset: 800 });
    mk.bindPopup(`🏠 ${esc(day.stay)}`);
    fg.addLayer(mk);
  }
  if (pts.length > 1) {
    const latlngs = pts.map((p) => [p.ll[1], p.ll[0]]);
    fg.addLayer(L.polyline(latlngs, { color: '#c05a24', weight: 3, opacity: .75, dashArray: '6 5' }));
  }
  const b = fg.getBounds();
  if (b.isValid()) map.fitBounds(b, { padding: opts.big ? [46, 46] : [28, 28], maxZoom: opts.big ? 15 : 14 });
  else if (stay) map.setView([stay[1], stay[0]], 12);
  else map.setView([39.47, 79.0], 5);
  return fg;
}
function mountsMap(el, opts) {
  opts = opts || {};
  const m = L.map(el, { zoomControl: false, attributionControl: true, scrollWheelZoom: !!opts.wheel });
  addAmapTiles(m);
  if (opts.zoomCtl) L.control.zoom({ position: 'bottomright' }).addTo(m);
  return m;
}

let dmObs = null;
function scheduleDayMaps() {
  if (dmObs) { dmObs.disconnect(); dmObs = null; }
  const els = $$('#tab-days .daymap');
  if (!window.L) {
    els.forEach((el) => { el.innerHTML = '<div class="dm-fallback">🗺 地图未加载</div>'; });
    return;
  }
  if (!('IntersectionObserver' in window)) { els.forEach(initDayMapEl); return; }
  dmObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { dmObs.unobserve(en.target); initDayMapEl(en.target); } });
  }, { rootMargin: '320px 0px' });
  els.forEach((el) => dmObs.observe(el));
}
function initDayMapEl(el) {
  if (el.dataset.ok) return;
  el.dataset.ok = '1';
  const day = state.days.find((d) => d.id === el.dataset.dm);
  if (!day) return;
  try {
    const m = regMap('day', mountsMap(el));
    drawDay(m, day);
    const ld = el.querySelector('.dm-loading'); if (ld) ld.remove();
    setTimeout(() => m.invalidateSize(), 60);
  } catch (e) { el.innerHTML = '<div class="dm-fallback">🗺 地图加载失败</div>'; }
}

/* ============ 渲染 ============ */
function renderAll() {
  RTOKEN++;
  killMaps();
  $('#tripTitle').textContent = state.trip.title;
  $('#tripSub').textContent = `${fmtDate(state.trip.start)} → ${fmtDate(state.trip.end)} ｜ ${state.days.length} 天 · ${state.places.length} 站`;
  renderPlaces(); renderProgress(); renderDays(); renderMap(); renderTips();
}
function visibleDays() {
  return ui.place === 'all' ? state.days : state.days.filter((d) => (d.place || '') === ui.place);
}
function renderPlaces() {
  const cnt = {};
  state.days.forEach((d) => { cnt[d.place || '其他'] = (cnt[d.place || '其他'] || 0) + 1; });
  const list = ['all'].concat(state.places.filter((p) => cnt[p]));
  $('#places').innerHTML = list.map((p) => `
    <button data-act="place" data-place="${esc(p)}" class="${p === ui.place ? 'on' : ''}">
      ${p === 'all' ? '全部' : esc(p)}<i>${p === 'all' ? state.days.length : cnt[p]}</i>
    </button>`).join('') + '<button data-act="place-add" title="添加城市">＋</button>';
}
function renderProgress() {
  const days = visibleDays();
  const stops = days.reduce((a, d) => a + d.stops.length, 0);
  const done = days.reduce((a, d) => a + d.stops.filter((s) => s.done).length, 0);
  const pct = stops ? Math.round(done / stops * 100) : 0;
  $('#progressBar').style.width = pct + '%';
  $('#progressText').textContent = `${ui.place === 'all' ? '' : ui.place + ' · '}打卡 ${done}/${stops} · ${pct}%`;
}
function heroHtml() {
  const t = todayStr(), s = state.trip.start, e = state.trip.end;
  const total = dayDiff(s, e) + 1;
  let main, sub;
  if (dayDiff(t, s) > 0) { const n = dayDiff(t, s); main = `${n} 天`; sub = '后出发'; }
  else if (dayDiff(t, e) >= 0) { const n = dayDiff(s, t) + 1; main = `第 ${n} 天`; sub = `／共 ${total} 天`; }
  else { main = '已结束'; sub = ''; }
  const passed = Math.min(Math.max(dayDiff(s, t) + 1, 0), total);
  const pct = Math.round(passed / total * 100);
  const cur = state.days.find((d) => d.date === t);
  const loc = cur ? `今天：${cur.place} · ${cur.title}` : `${fmtDate(s)} 出发 · ${state.trip.sub}`;
  return `<div class="hero">
    <div class="hero-top"><span class="hero-cd">${esc(main)}<small>${esc(sub)}</small></span></div>
    <div class="hero-loc">${esc(loc)}</div>
    <div class="hero-bar"><i style="width:${pct}%"></i></div>
  </div>`;
}
function legsHtml(d) {
  if (!d.legs.length) return '';
  return `<div class="legs">${d.legs.map((l) => `
    <div class="leg" data-act="leg" data-day="${esc(d.id)}" data-id="${esc(l.id)}">
      <span class="lg-ic">${esc(l.mode || '🚗')}</span>
      <div class="lg-b">
        <b>${esc(l.text)}</b> <span class="lg-t">${esc(l.time || '')}</span>
        ${l.note ? `<span class="lg-n">${esc(l.note)}</span>` : ''}
      </div>
    </div>`).join('')}</div>`;
}
function stopHtml(d, s, i) {
  const ll = parseLL(s.ll);
  const links = (s.links || []).filter((l) => l && l.url);
  return `<div class="stop ${s.done ? 'done' : ''}" data-act="stop" data-day="${esc(d.id)}" data-id="${esc(s.id)}">
    <i class="pin">${i + 1}</i>
    <div class="sb">
      <div class="sname">${esc(s.name)}${s.time ? `<em>${esc(s.time)}</em>` : ''}</div>
      ${s.intro ? `<div class="sintro">${esc(s.intro)}</div>` : ''}
      ${s.note ? `<div class="snote">⚠️ ${esc(s.note)}</div>` : ''}
      ${!ll ? `<div class="no-ll">📍 未定位 · 点卡片可补坐标</div>` : ''}
      ${links.length ? `<div class="slinks">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" data-act="link">${esc(l.label || '链接')} ↗</a>`).join('')}</div>` : ''}
    </div>
    <div class="sacts">
      <button class="chk" data-act="done">${s.done ? '✓' : ''}</button>
      <a class="nav-btn" href="${esc(stopHref(s))}" target="_blank" rel="noopener" data-act="nav">导航</a>
    </div>
  </div>`;
}
function renderDays() {
  killMaps('day');
  const days = visibleDays();
  const t = todayStr();
  if (!days.length) { $('#tab-days').innerHTML = '<div class="empty">这个城市还没有安排</div>'; return; }
  $('#tab-days').innerHTML = heroHtml() + days.map((d) => `
    <div class="day ${d.date === t ? 'today' : ''}">
      <div class="dh">
        <div class="dh-no"><b>${esc(d.no || '')}</b><span>${esc(fmtDate(d.date))}</span></div>
        <div class="dh-main">
          <h3>${esc(d.title || '')}</h3>
          <div class="dh-meta">
            <span>${esc(d.wd || '')} · ${esc(d.city || d.place || '')}</span>
            ${d.stay ? `<span class="stay">🏠 ${esc(d.stay)}</span>` : ''}
          </div>
        </div>
        <button class="dh-edit" data-act="day" data-day="${esc(d.id)}">✎</button>
      </div>
      ${legsHtml(d)}
      <div class="stops">${d.stops.map((s, i) => stopHtml(d, s, i)).join('') || '<div class="empty" style="padding:16px">这天还没有安排</div>'}</div>
      ${(d.notes || []).length ? `<div class="dnotes">${d.notes.map((n) => `<div class="dnote">${esc(n)}</div>`).join('')}</div>` : ''}
      <div class="daymap" data-dm="${esc(d.id)}"><div class="dm-loading">🗺 地图加载中…</div></div>
      <button class="add-stop" data-act="add" data-day="${esc(d.id)}">＋ 加景点 / 事项</button>
      <div class="dayfoot">
        <button data-act="addleg" data-day="${esc(d.id)}">＋ 交通段</button>
        <button data-act="addnote" data-day="${esc(d.id)}">＋ 当日要点</button>
      </div>
    </div>`).join('');
  scheduleDayMaps();
}
function renderMap() {
  killMaps('big');
  const days = visibleDays();
  if (!days.length) { $('#tab-map').innerHTML = '<div class="empty">这个城市还没有安排</div>'; return; }
  const d = days.find((x) => x.id === ui.mapDay) || days[0];
  ui.mapDay = d.id;
  const pick = `<div class="map-pick">${days.map((x) =>
    `<button data-act="mday" data-day="${esc(x.id)}" class="${x.id === d.id ? 'on' : ''}">${esc(x.no)} ${esc(x.place || '')}</button>`).join('')}</div>`;
  $('#tab-map').innerHTML = pick + `
    <div class="bigmap-card">
      <div class="map-tools">
        <button data-act="pickmode" class="${PICK ? 'on' : ''}">${PICK ? '📍 点地图加景点（开）' : '📍 点地图加景点'}</button>
        <button data-act="add" data-day="${esc(d.id)}">＋ 手动添加</button>
      </div>
      <div class="daymap big ${PICK ? 'pickmode' : ''}" id="bigMap" data-dm="${esc(d.id)}">
        <div class="dm-badge ${PICK ? 'pick' : ''}">${PICK ? '点地图任意位置即可加景点' : '© 高德地图'}</div>
        <div class="dm-loading">🗺 地图加载中…</div>
      </div>
      <div class="map-list-head"><span>🗓 ${esc(d.no)} · ${esc(d.title || '')}</span><span>${d.stops.length} 项</span></div>
      <div class="map-list">
        ${d.stops.map((s, i) => {
    const ll = parseLL(s.ll);
    return `<div class="mi">
            <i>${i + 1}</i>
            <span data-act="stop" data-day="${esc(d.id)}" data-id="${esc(s.id)}">${esc(s.name)}${s.time ? `<small>${esc(s.time)}</small>` : ''}${!ll ? '<small>📍 未定位</small>' : ''}</span>
            <a class="go" href="${esc(stopHref(s))}" target="_blank" rel="noopener">导航</a>
            <button class="del" data-act="del" data-day="${esc(d.id)}" data-id="${esc(s.id)}">删</button>
          </div>`;
  }).join('')}
      </div>
    </div>`;
  if (!window.L) { $('#bigMap').innerHTML = '<div class="dm-fallback">🗺 地图未加载</div>'; return; }
  try {
    const el = $('#bigMap');
    const m = regMap('big', mountsMap(el, { zoomCtl: true, wheel: false }));
    drawDay(m, d, { big: true });
    m.on('click', (e) => {
      if (!PICK) return;
      PICK = false;
      const ll = [+e.latlng.lng.toFixed(5), +e.latlng.lat.toFixed(5)];
      openStopSheet(d.id, null, { ll });
    });
    setTimeout(() => m.invalidateSize(), 60);
    const ld = el.querySelector('.dm-loading'); if (ld) ld.remove();
  } catch (err) { $('#bigMap').innerHTML = '<div class="dm-fallback">🗺 地图加载失败</div>'; }
}
function renderTips() {
  const tips = state.tips || [];
  const groups = {};
  tips.forEach((t) => { (groups[t.cat || '其他'] = groups[t.cat || '其他'] || []).push(t); });
  const cats = Object.keys(groups).sort((a, b) => TIP_CAT.indexOf(a) - TIP_CAT.indexOf(b));
  $('#tab-tips').innerHTML = cats.map((c) => `
    <div class="tip-group">
      <h4>${esc(TIP_ICON[c] || '📌')} ${esc(c)}</h4>
      ${groups[c].map((t) => `
        <div class="tip ${t.done ? 'done' : ''}" data-act="tip" data-id="${esc(t.id)}">
          <span class="ti">${esc(TIP_ICON[c] || '📌')}</span>
          <div class="tt">${esc(t.text)}</div>
          <button class="chk" data-act="tip-done" data-id="${esc(t.id)}">${t.done ? '✓' : ''}</button>
        </div>`).join('')}
    </div>`).join('') + '<button class="tip-add" data-act="tip-add">＋ 加一条建议</button>';
}

/* ============ 弹层 ============ */
function openSheet(title, body, foot, onMount) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = body;
  $('#sheetFoot').innerHTML = foot;
  $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  if (onMount) onMount();
}
function closeSheet() {
  killMaps('sheet');
  $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true;
  document.body.style.overflow = '';
}
const fld = (label, id, val, ph) => `<div class="fld"><label>${esc(label)}</label><input id="${id}" value="${esc(val || '')}" placeholder="${esc(ph || '')}"></div>`;
const area = (label, id, val, ph) => `<div class="fld"><label>${esc(label)}</label><textarea id="${id}" placeholder="${esc(ph || '')}">${esc(val || '')}</textarea></div>`;

/* ---- 链接编辑 ---- */
function linkRows(links) {
  return (links || []).map((l, i) => `<div class="link-row" data-lk="${i}">
      <input data-lk-label value="${esc(l.label || '')}" placeholder="名称">
      <input data-lk-url value="${esc(l.url || '')}" placeholder="https://">
      <button type="button" data-lk-del>✕</button>
    </div>`).join('');
}
function bindLinks(box, links) {
  const add = () => {
    const row = document.createElement('div');
    row.className = 'link-row';
    row.innerHTML = '<input data-lk-label placeholder="名称"><input data-lk-url placeholder="https://"><button type="button" data-lk-del>✕</button>';
    box.appendChild(row);
  };
  box.addEventListener('click', (e) => {
    if (e.target.dataset.lkDel !== undefined) { e.target.parentElement.remove(); }
  });
  box._add = add;
}
function collectLinks(box) {
  const out = [];
  $$('.link-row', box).forEach((r) => {
    const l = r.querySelector('[data-lk-label]').value.trim();
    const u = r.querySelector('[data-lk-url]').value.trim();
    if (u) out.push({ label: l || u.replace(/^https?:\/\//, '').slice(0, 18), url: u });
  });
  return out;
}

/* ---- 景点编辑 ---- */
function openStopSheet(dayId, stopId, preset) {
  preset = preset || {};
  const d = state.days.find((x) => x.id === dayId);
  if (!d) return;
  const isNew = !stopId;
  const s = isNew
    ? { id: '', name: preset.name || '', time: '', intro: '', note: '', ll: preset.ll ? llStr(preset.ll) : '', links: [], done: false }
    : d.stops.find((x) => x.id === stopId);
  if (!s) return;
  s.links = s.links || [];
  const ll0 = parseLL(s.ll);
  openSheet(isNew ? '添加景点 / 事项' : '编辑景点', `
    ${fld('名称 *', 'f_name', s.name, '例如：天山神秘大峡谷')}
    ${fld('时间', 'f_time', s.time, '例如：10:30 或 上午')}
    <div class="llbox">
      <div class="llhead">
        <span>📍 地图定位</span>
        <b id="llTxt">${ll0 ? llStr(ll0) : '未定位'}</b>
      </div>
      <div class="search-row" style="padding:8px 10px 0">
        <input id="f_find" placeholder="搜地名，或粘贴高德分享链接" value="">
        <button type="button" id="btnFind">搜索</button>
      </div>
      <div style="padding:6px 10px 0"><div id="findRes" class="find-results"></div></div>
      <div class="pickmap" id="pickMap"><div class="dm-loading">🗺 点地图选位置…</div></div>
      <div class="hint" style="margin:6px 10px 10px">
        在下方小地图上点一下即可定位；也可以直接搜名字。定位后地图和「导航」都按坐标走，不会搜错同名地点。
      </div>
      <input type="hidden" id="f_ll" value="${esc(s.ll || '')}">
    </div>
    ${area('一句话介绍', 'f_intro', s.intro, '显示在这条下面和地图气泡里')}
    ${area('备注（门票 / 预约 / 现场贴士）', 'f_note', s.note, '')}
    <div class="fld"><label>相关链接</label><div id="linksBox">${linkRows(s.links)}</div>
      <button type="button" class="btn-ghost" id="btnAddLink" style="width:100%;padding:9px;font-size:13px;margin-top:4px">＋ 添加链接</button>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn-danger" id="btnDel">删除</button>'}
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    const box = $('#linksBox');
    bindLinks(box, s.links);
    $('#btnAddLink').onclick = () => box._add();
    $('#btnCancel').onclick = closeSheet;
    $('#btnDel') && ($('#btnDel').onclick = () => {
      d.stops = d.stops.filter((x) => x.id !== stopId);
      save(); closeSheet(); renderAll(); toast('已删除，地图同步更新');
    });
    $('#btnSave').onclick = () => {
      const name = V('f_name') || '未命名地点';
      const o = {
        id: s.id || uid(), name, time: V('f_time'), intro: $('#f_intro').value.trim(),
        note: $('#f_note').value.trim(), ll: V('f_ll'), links: collectLinks(box), done: !!s.done
      };
      if (isNew) d.stops.push(o);
      else d.stops[d.stops.findIndex((x) => x.id === stopId)] = o;
      save(); closeSheet(); renderAll(); toast(isNew ? '已添加' : '已保存');
    };
    /* 定位搜索 */
    const setLL = (ll, label) => {
      $('#f_ll').value = llStr(ll);
      $('#llTxt').textContent = llStr(ll);
      if (label && !V('f_name')) $('#f_name').value = label;
      if (pickM) {
        if (tmpMk) pickM.removeLayer(tmpMk);
        tmpMk = L.marker([ll[1], ll[0]], { icon: L.divIcon({ html: '<div class="tmp-pin"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(pickM);
        pickM.setView([ll[1], ll[0]], Math.max(pickM.getZoom(), 13));
      }
    };
    let pickM = null, tmpMk = null;
    if (window.L) {
      try {
        pickM = regMap('sheet', mountsMap($('#pickMap'), { wheel: false }));
        if (ll0) { pickM.setView([ll0[1], ll0[0]], 13); tmpMk = L.marker([ll0[1], ll0[0]], { icon: L.divIcon({ html: '<div class="tmp-pin"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(pickM); }
        else {
          const ref = dayPoints(d)[0] || (parseLL(d.stayLL) ? { ll: parseLL(d.stayLL) } : null);
          pickM.setView(ref ? [ref.ll[1], ref.ll[0]] : [39.47, 79.0], ref ? 10 : 5);
        }
        pickM.on('click', (e) => { setLL([+e.latlng.lng.toFixed(5), +e.latlng.lat.toFixed(5)]); });
        setTimeout(() => pickM.invalidateSize(), 60);
        const ld = $('#pickMap .dm-loading'); if (ld) ld.remove();
      } catch (e) { $('#pickMap').innerHTML = '<div class="dm-fallback">地图不可用，可直接搜索</div>'; }
    }
    const doFind = async () => {
      const q = V('f_find');
      if (!q) return;
      const fromUrl = parseMapUrl(q);
      if (fromUrl) {
        setLL(fromUrl.ll, fromUrl.name);
        $('#findRes').innerHTML = `<div class="fr">✅ 已从链接解析坐标 ${esc(llStr(fromUrl.ll))}</div>`;
        return;
      }
      $('#findRes').innerHTML = '<div class="fr"><small>搜索中…</small></div>';
      const res = await geocode(q);
      if (!res.length) { $('#findRes').innerHTML = '<div class="fr"><small>没找到，可在地图上直接点，或先保存后补</small></div>'; return; }
      $('#findRes').innerHTML = res.map((r, i) =>
        `<button type="button" class="fr" data-ll="${esc(llStr(r.ll))}" data-nm="${esc(r.name)}"><b>${esc(r.name)}</b><small>${esc(r.addr || '')}</small></button>`).join('');
      $$('#findRes .fr').forEach((b) => {
        b.onclick = () => { setLL(parseLL(b.dataset.ll), b.dataset.nm); $('#findRes').innerHTML = `<div class="fr">✅ 已选：${esc(b.dataset.nm)}</div>`; };
      });
    };
    $('#btnFind').onclick = doFind;
    $('#f_find').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doFind(); } });
  });
}

/* ---- 交通段 ---- */
function openLegSheet(dayId, legId) {
  const d = state.days.find((x) => x.id === dayId);
  const isNew = !legId;
  const l = isNew ? { id: '', mode: '🚗', text: '', time: '', note: '' } : d.legs.find((x) => x.id === legId);
  if (!l) return;
  openSheet(isNew ? '添加交通段' : '编辑交通段', `
    <div class="fld"><label>方式</label>
      <select id="f_mode">${['✈️ 飞机', '🚂 火车', '🚙 包车/拼车', '🚌 大巴', '🚐 跟团', '🚕 打车', '🚶 步行', '🚗 其他'].map((o) => {
    const [ic, nm] = o.split(' ');
    return `<option value="${ic}" ${l.mode === ic ? 'selected' : ''}>${o}</option>`;
  }).join('')}</select></div>
    ${fld('内容', 'f_text', l.text, '例如：高铁 吐鲁番北站 → 乌鲁木齐')}
    ${fld('时间', 'f_time', l.time, '例如：23:10 → 次日 07:06')}
    ${area('备注', 'f_note', l.note, '')}
  `, `
    ${isNew ? '' : '<button class="btn-danger" id="btnDel">删除</button>'}
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnDel') && ($('#btnDel').onclick = () => {
      d.legs = d.legs.filter((x) => x.id !== legId); save(); closeSheet(); renderAll(); toast('已删除');
    });
    $('#btnSave').onclick = () => {
      const o = { id: l.id || uid(), mode: $('#f_mode').value, text: V('f_text') || '交通', time: V('f_time'), note: $('#f_note').value.trim() };
      if (isNew) d.legs.push(o); else d.legs[d.legs.findIndex((x) => x.id === legId)] = o;
      save(); closeSheet(); renderAll();
    };
  });
}
/* ---- 当日要点 ---- */
function openNoteSheet(dayId, idx) {
  const d = state.days.find((x) => x.id === dayId);
  const isNew = idx == null;
  const val = isNew ? '' : (d.notes[idx] || '');
  openSheet(isNew ? '添加当日要点' : '编辑要点', area('要点', 'f_note', val, '现场提醒、背景知识、要确认的事…'), `
    ${isNew ? '' : '<button class="btn-danger" id="btnDel">删除</button>'}
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnDel') && ($('#btnDel').onclick = () => {
      d.notes.splice(idx, 1); save(); closeSheet(); renderAll(); toast('已删除');
    });
    $('#btnSave').onclick = () => {
      const v = $('#f_note').value.trim(); if (!v) return closeSheet();
      if (isNew) d.notes.push(v); else d.notes[idx] = v;
      save(); closeSheet(); renderAll();
    };
  });
}
/* ---- 建议 ---- */
function openTipSheet(id) {
  const isNew = !id;
  const t = isNew ? { id: '', cat: '其他', text: '', done: false } : state.tips.find((x) => x.id === id);
  if (!t) return;
  openSheet(isNew ? '添加建议' : '编辑建议', `
    <div class="fld"><label>分类</label><select id="f_cat">
      ${TIP_CAT.map((c) => `<option value="${c}" ${t.cat === c ? 'selected' : ''}>${TIP_ICON[c]} ${c}</option>`).join('')}
    </select></div>
    ${area('内容', 'f_text', t.text, '')}
  `, `
    ${isNew ? '' : '<button class="btn-danger" id="btnDel">删除</button>'}
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnDel') && ($('#btnDel').onclick = () => {
      state.tips = state.tips.filter((x) => x.id !== id); save(); closeSheet(); renderAll(); toast('已删除');
    });
    $('#btnSave').onclick = () => {
      const o = { id: t.id || uid(), cat: $('#f_cat').value, text: $('#f_text').value.trim() || '（空）', done: !!t.done };
      if (isNew) state.tips.push(o); else state.tips[state.tips.findIndex((x) => x.id === id)] = o;
      save(); closeSheet(); renderAll();
    };
  });
}
/* ---- 当天信息 ---- */
function openDaySheet(dayId) {
  const d = state.days.find((x) => x.id === dayId);
  openSheet('编辑当天', `
    ${fld('标题', 'f_title', d.title, '')}
    <div class="fld-2">
      ${fld('日期', 'f_date', d.date, '2026-10-31')}
      ${fld('编号', 'f_no', d.no, 'D1')}
    </div>
    <div class="fld-2">
      ${fld('城市（用于顶部筛选）', 'f_place', d.place, '吐鲁番')}
      ${fld('副标题地名', 'f_city', d.city, '吐鲁番')}
    </div>
    ${fld('住宿', 'f_stay', d.stay, '')}
    ${fld('住宿坐标（lng,lat）', 'f_stayLL', d.stayLL, '75.9900,39.4700')}
  `, `
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnSave').onclick = () => {
      d.title = V('f_title'); d.date = V('f_date'); d.no = V('f_no');
      d.place = V('f_place'); d.city = V('f_city'); d.stay = V('f_stay'); d.stayLL = V('f_stayLL');
      d.wd = wdOf(d.date);
      if (d.place && !state.places.includes(d.place)) state.places.push(d.place);
      state.trip.start = state.days[0].date; state.trip.end = state.days[state.days.length - 1].date;
      save(); closeSheet(); renderAll();
    };
  });
}
/* ---- 菜单 ---- */
function openMenu() {
  openSheet('设置 / 数据', `
    <div class="fld"><label>行程标题</label><input id="m_title" value="${esc(state.trip.title)}"></div>
    <div class="fld"><label>副标题</label><input id="m_sub" value="${esc(state.trip.sub)}"></div>
    <div class="fld"><label>高德 Web 服务 Key（选填，填了搜索更准）</label>
      <input id="m_key" value="${esc(state.settings.amapKey || '')}" placeholder="留空则用内置坐标库 + 公开地名搜索">
      <div class="hint">在「高德开放平台 → 应用 → 添加 Key → 服务平台选 Web服务」获取。不填也能用。</div>
    </div>
    <button class="btn-ghost" id="m_export" style="width:100%;padding:11px;font-size:14px;margin-bottom:8px">⬇ 导出备份（JSON）</button>
    <button class="btn-ghost" id="m_import" style="width:100%;padding:11px;font-size:14px;margin-bottom:8px">⬆ 导入备份</button>
    <button class="btn-danger" id="m_reset" style="width:100%;padding:11px;font-size:14px">↺ 恢复初始行程（清空我的修改）</button>
    <div class="hint" style="margin-top:12px">数据只存在这台设备的浏览器里（含手机）。换设备用「导出 / 导入」搬家。</div>
  `, `<button class="btn-ghost" id="btnCancel">关闭</button><button class="btn-primary" id="btnSave">保存</button>`, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnSave').onclick = () => {
      state.trip.title = V('m_title') || state.trip.title;
      state.trip.sub = V('m_sub');
      state.settings.amapKey = V('m_key');
      save(); closeSheet(); renderAll(); toast('已保存');
    };
    $('#m_export').onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'nanjiang-trip-' + todayStr() + '.json';
      a.click(); toast('已导出');
    };
    $('#m_import').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = () => {
        const f = inp.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const o = JSON.parse(rd.result);
            if (!o || !o.days) throw 0;
            state = o; normalize(); save(); closeSheet(); renderAll(); toast('导入成功');
          } catch (e) { toast('文件格式不对'); }
        };
        rd.readAsText(f);
      };
      inp.click();
    };
    $('#m_reset').onclick = () => {
      if (!confirm('会清空你在这台设备上做的所有修改，恢复成初始行程。确定？')) return;
      resetState(); closeSheet(); renderAll(); toast('已恢复初始行程');
    };
  });
}
function openPlaceAdd() {
  openSheet('添加城市', fld('城市名', 'f_p', '', '例如：和田'), `
    <button class="btn-ghost" id="btnCancel">取消</button>
    <button class="btn-primary" id="btnSave">保存</button>
  `, () => {
    $('#btnCancel').onclick = closeSheet;
    $('#btnSave').onclick = () => {
      const v = V('f_p'); if (!v) return;
      if (!state.places.includes(v)) state.places.push(v);
      ui.place = v; save(); closeSheet(); renderAll(); toast('已添加（到行程里给它排一天才会显示天数）');
    };
  });
}

/* ============ 事件 ============ */
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.id === 'sheetClose' || t.id === 'sheetBackdrop') return closeSheet();
  if (t.id === 'btnMenu') return openMenu();
  const nav = t.closest('#tabbar button');
  if (nav) {
    ui.tab = nav.dataset.tab;
    $$('#tabbar button').forEach((b) => b.classList.toggle('active', b === nav));
    $$('.tab').forEach((s) => s.classList.toggle('active', s.id === 'tab-' + ui.tab));
    if (ui.tab === 'map') renderMap();
    window.scrollTo({ top: 0 });
    return;
  }
  const el = t.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'link' || act === 'nav' || act === 'stop-nav') return; // 让链接正常跳转
  const dayId = el.dataset.day, id = el.dataset.id, day = dayId && state.days.find((x) => x.id === dayId);

  switch (act) {
    case 'place': ui.place = el.dataset.place; renderAll(); break;
    case 'place-add': openPlaceAdd(); break;
    case 'add': if (day) openStopSheet(day.id, null); break;
    case 'stop': if (day && id) openStopSheet(day.id, id); break;
    case 'del':
      if (day && id) { day.stops = day.stops.filter((x) => x.id !== id); save(); renderAll(); toast('已删除，地图同步更新'); }
      break;
    case 'done': {
      e.stopPropagation();
      if (day && id) {
        const s = day.stops.find((x) => x.id === id);
        if (s) {
          s.done = !s.done; save(); renderProgress();
          const row = el.closest('.stop');
          if (row) { row.classList.toggle('done', s.done); const c = row.querySelector('.chk'); if (c) c.textContent = s.done ? '✓' : ''; }
        }
      }
      break;
    }
    case 'addleg': if (day) openLegSheet(day.id, null); break;
    case 'leg': if (day && id) openLegSheet(day.id, id); break;
    case 'addnote': if (day) openNoteSheet(day.id, null); break;
    case 'day': if (day) openDaySheet(day.id); break;
    case 'tip': if (id) openTipSheet(id); break;
    case 'tip-done': {
      e.stopPropagation();
      const tp = state.tips.find((x) => x.id === id);
      if (tp) { tp.done = !tp.done; save(); renderTips(); }
      break;
    }
    case 'tip-add': openTipSheet(null); break;
    case 'mday': ui.mapDay = el.dataset.day; PICK = false; renderMap(); break;
    case 'pickmode': PICK = !PICK; renderMap(); toast(PICK ? '在地图上点一下即可加景点' : '已退出点选模式'); break;
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

/* ============ 启动 ============ */
load();
renderAll();
