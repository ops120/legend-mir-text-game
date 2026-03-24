# 🔥 热血传奇文字游戏

> 经典复刻！纯前端实现的网页版文字冒险游戏

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-Game-orange.svg)](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue.svg)](https://developer.mozilla.org/zh-CN/docs/Web/CSS)

## 🎮 项目简介

传奇文字游戏版是一款纯前端实现的文字冒险游戏，完美复刻经典传奇游戏的核心玩法。无需安装任何插件，直接在浏览器中体验！

### ✨ 核心特色

- 🕹️ **回合制战斗** - 策略性的战斗系统
- 🎒 **装备系统** - 丰富的装备掉落和穿戴
- 📈 **角色养成** - 升级、技能、属性成长
- 💰 **经济系统** - 金币获取与装备交易
- ⚡ **速度解锁** - 付费加速游戏体验
- 💾 **存档功能** - 本地存储 + 云端迁移

## 🎯 游戏玩法

### 选择职业
- ⚔️ **战士** - 高血量、高防御，近战之王
- 🔮 **法师** - 高攻击、高魔法，群体伤害
- 📿 **道士** - 平衡型，可召唤宝宝

### 探索地图
- 🏘️ 边界村 (Lv.1-5)
- 🏛️ 比奇省 (Lv.5-10)
- 🏰 盟重省 (Lv.15-25)
- ⛰️ 苍月岛 (Lv.20-30)
- 🐷 猪洞 (Lv.25-35)
- 🗿 祖玛寺庙 (Lv.35-45)
- 🌋 赤月峡谷 (Lv.45-55)
- ⚔️ 封魔谷 (Lv.55-65)

### 战斗系统
- 点击「开始战斗」进入战斗
- 开启「自动战斗」解放双手
- 调整「战斗速度」控制节奏
- 击杀怪物获得经验和金币
- 击败BOSS掉落稀有装备

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 | 游戏结构 |
| CSS3 | 样式与布局 |
| JavaScript ES6+ | 游戏逻辑 |
| LocalStorage | 本地存档 |
| JSON | 数据存储格式 |

## 📂 项目结构

```
legend-mir-text-game/
│
├── index.html              # 🎮 主游戏入口
├── speed-unlock.html      # ⚡ 速度解锁系统
├── README.md              # 📖 项目说明
├── .gitignore            # 🔧 Git忽略配置
│
├── css/                   # 🎨 样式目录
│   └── style.css         # 游戏样式
│
├── js/                    # 💻 脚本目录
│   ├── data.js          # 📊 游戏数据
│   ├── game.js          # 🎯 游戏逻辑
│   └── save.js          # 💾 存档管理
│
├── saves/                 # 💾 存档目录（可选）
│   └── *.json           # 导出存档
│
└── assets/               # 🖼️ 资源目录（预留）
    ├── images/
    ├── icons/
    └── audio/
```

### 📝 目录说明

| 目录/文件 | 说明 |
|-----------|------|
| `index.html` | 游戏主页面 |
| `speed-unlock.html` | 速度解锁系统页面 |
| `css/` | 游戏样式文件 |
| `js/` | 游戏逻辑脚本 |
| `saves/` | 存档导出目录 |
| `assets/` | 预留资源目录 |

## 🚀 快速开始

### 🎮 本地运行
**无需安装任何依赖！只需下载并打开 `index.html` 即可开始游戏！**

1. 下载项目所有文件
2. 双击打开 `index.html`
3. 选择角色开始冒险

### 🛠️ 开发者模式
```bash
# 克隆项目
git clone https://github.com/ops120/legend-mir-text-game.git

# 进入目录
cd legend-mir-text-game

# 使用HTTP服务器（可选）
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 访问 http://localhost:8000
```

## 🎮 操作指南

### 基本操作
- 🎯 **选择角色** - 点击角色卡片
- 🗺️ **切换地图** - 点击地图列表
- ⚔️ **开始战斗** - 点击战斗按钮

### 背包操作
- 👆 **穿戴装备** - 点击背包物品
- 👋 **卸下装备** - 点击已穿戴装备
- 🖱️ **快速出售** - 双击物品直接出售
- ✨ **批量选择** - Ctrl+点击 或 右键点击
- 🔥 **批量出售** - 点击「出售选中」按钮

### 速度系统
- ◀ ▶ - 切换已解锁的速度等级
- 🔓 - 解锁更高速档（消耗金币）

## 💡 常见问题

### Q: 游戏存档会丢失吗？
A: 建议定期使用「导出存档」功能备份到本地，浏览器缓存可能因清理而丢失。

### Q: 如何解锁更快的战斗速度？
A: 积累金币后，点击「🔓 解锁」按钮购买更高速档。

### Q: 角色死亡怎么办？
A: 系统会自动在边界村复活，恢复50%生命值。

### Q: 背包满了怎么办？
A: 出售不需要的装备，或双击物品快速出售。

## 🔧 开发指南

### 添加新地图
编辑 `js/data.js` 中的 `maps` 数组：

```javascript
{
    name: '新地图',
    minLevel: 等级下限,
    maxLevel: 等级上限,
    monsters: [
        { name: '怪物名', level: 等级, hp: 血量, attack: 攻击, defense: 防御, exp: 经验, gold: 金币 }
    ],
    dropChance: { white: 0.3, green: 0.05 }
}
```

### 添加新装备
编辑 `js/data.js` 中的 `equipment` 对象：

```javascript
装备ID: {
    name: '装备名',
    type: 'weapon|armor|helmet|necklace|ring',
    quality: 'white|green|blue|purple|orange',
    attack: 攻击加成,
    defense: 防御加成,
    level: 需要等级
}
```

## 📊 游戏数据

### 物品品质
| 品质 | 颜色 | 稀有度 |
|------|------|--------|
| 普通 | 白色 | 常见 |
| 高级 | 绿色 | 少见 |
| 稀有 | 蓝色 | 珍稀 |
| 史诗 | 紫色 | 稀有 |
| 传说 | 橙色 | 极稀有 |

### 速度等级
| 等级 | 价格 | 延迟 |
|------|------|------|
| 1x | 免费 | 1000ms |
| 2x | 100💰 | 900ms |
| 3x | 300💰 | 800ms |
| ... | ... | ... |
| 10x | 4500💰 | 100ms |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 经典传奇游戏的灵感
- 所有开源技术的贡献者
- 测试和反馈的玩家们

## 📧 联系作者

- 🅱️ 哔哩哔哩: [你们喜爱的老王](https://space.bilibili.com/97727630)
- GitHub: [legend-mir-text-game](https://github.com/ops120/legend-mir-text-game)

---

<p align="center">
  <strong>如果这个项目对你有帮助，请给一个 ⭐️</strong>
</p>
