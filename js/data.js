const gameData = {
    classes: {
        warrior: {
            name: '战士',
            color: '#ff6b6b',
            baseStats: { hp: 180, attack: 20, defense: 25, mp: 30 },
            growthStats: { hp: 30, attack: 3, defense: 4, mp: 5 },
            skills: {
                1: { name: '基础攻击', type: 'passive', description: '普通物理攻击' },
                15: { name: '野蛮冲撞', type: 'active', mpCost: 10, damageMultiplier: 1.0, description: '冲撞敌人造成伤害' },
                26: { name: '烈火剑法', type: 'active', mpCost: 15, damageMultiplier: 2.5, cooldown: 3, description: '高伤害物理攻击' },
                35: { name: '半月弯刀', type: 'active', mpCost: 12, damageMultiplier: 1.2, aoe: true, description: '攻击周围所有敌人' },
                47: { name: '雷霆一击', type: 'active', mpCost: 20, damageMultiplier: 1.8, aoe: true, description: '强力AOE攻击' },
                58: { name: '护体神盾', type: 'buff', mpCost: 25, duration: 5, effect: 'damageReduction', value: 0.3, description: '减少30%受到伤害' },
                70: { name: '逐日剑法', type: 'active', mpCost: 35, damageMultiplier: 3.0, description: '终极物理攻击' }
            }
        },
        mage: {
            name: '法师',
            color: '#4ecdc4',
            baseStats: { hp: 120, attack: 28, defense: 12, mp: 80 },
            growthStats: { hp: 18, attack: 4, defense: 2, mp: 12 },
            skills: {
                1: { name: '火球术', type: 'passive', description: '基础魔法攻击' },
                13: { name: '抗拒火环', type: 'active', mpCost: 10, damageMultiplier: 0.8, description: '击退并伤害敌人' },
                24: { name: '地狱雷光', type: 'active', mpCost: 18, damageMultiplier: 0.9, aoe: true, description: 'AOE魔法伤害' },
                35: { name: '雷电术', type: 'active', mpCost: 20, damageMultiplier: 2.0, description: '单体高伤害魔法' },
                41: { name: '冰咆哮', type: 'active', mpCost: 25, damageMultiplier: 1.5, aoe: true, description: '范围冰系魔法' },
                47: { name: '魔法盾', type: 'buff', mpCost: 30, duration: 5, effect: 'shield', value: 0.5, description: '吸收50%伤害' },
                58: { name: '灭天火', type: 'active', mpCost: 35, damageMultiplier: 2.8, description: '终极单体魔法' },
                70: { name: '火墙', type: 'active', mpCost: 30, damageMultiplier: 1.0, aoe: true, dot: true, description: '持续火焰伤害' }
            }
        },
        taoist: {
            name: '道士',
            color: '#45b7d1',
            baseStats: { hp: 150, attack: 22, defense: 18, mp: 60 },
            growthStats: { hp: 22, attack: 2.5, defense: 3, mp: 10 },
            skills: {
                1: { name: '治愈术', type: 'heal', mpCost: 10, healMultiplier: 1.0, description: '治疗自己或队友' },
                18: { name: '灵魂火符', type: 'active', mpCost: 12, damageMultiplier: 1.1, description: '远程魔法攻击' },
                26: { name: '召唤骷髅', type: 'summon', mpCost: 20, summonType: 'skeleton', description: '召唤骷髅助战' },
                33: { name: '施毒术', type: 'debuff', mpCost: 15, damageMultiplier: 0.5, dot: true, duration: 10, description: '持续毒伤害' },
                38: { name: '隐身术', type: 'buff', mpCost: 20, duration: 5, effect: 'invisible', description: '隐身无法被攻击' },
                44: { name: '集体治愈术', type: 'heal', mpCost: 30, healMultiplier: 0.6, aoeHeal: true, description: '群体治疗' },
                52: { name: '召唤神兽', type: 'summon', mpCost: 40, summonType: 'beast', description: '召唤强力神兽' },
                65: { name: '嗜血术', type: 'active', mpCost: 35, damageMultiplier: 1.5, vampire: 0.5, description: '吸血攻击' },
                70: { name: '召唤月灵', type: 'summon', mpCost: 50, summonType: 'moonSpirit', description: '终极召唤兽' }
            }
        }
    },
    
    maps: [
        {
            name: '边界村',
            minLevel: 1,
            maxLevel: 5,
            monsters: [
                { name: '钉耙猫', level: 1, hp: 30, attack: 5, defense: 2, exp: 10, gold: 1 },
                { name: '多钩猫', level: 2, hp: 40, attack: 6, defense: 3, exp: 15, gold: 2 },
                { name: '钉耙猫王', level: 5, hp: 100, attack: 10, defense: 5, exp: 50, gold: 5 }
            ],
            dropChance: { white: 0.3, green: 0.05 }
        },
        {
            name: '比奇省',
            minLevel: 5,
            maxLevel: 10,
            monsters: [
                { name: '稻草人', level: 5, hp: 60, attack: 10, defense: 4, exp: 30, gold: 5 },
                { name: '蛤蟆', level: 7, hp: 80, attack: 12, defense: 5, exp: 40, gold: 6 },
                { name: '半兽战士', level: 10, hp: 120, attack: 15, defense: 8, exp: 60, gold: 8 }
            ],
            dropChance: { white: 0.35, green: 0.08 }
        },
        {
            name: '盟重省',
            minLevel: 15,
            maxLevel: 25,
            monsters: [
                { name: '沃玛战士', level: 15, hp: 200, attack: 25, defense: 12, exp: 150, gold: 20 },
                { name: '沃玛勇士', level: 18, hp: 280, attack: 30, defense: 15, exp: 200, gold: 25 },
                { name: '沃玛护卫', level: 22, hp: 350, attack: 35, defense: 18, exp: 280, gold: 30 },
                { name: '沃玛教主', level: 25, hp: 1000, attack: 50, defense: 25, exp: 1000, gold: 150, boss: true }
            ],
            dropChance: { white: 0.4, green: 0.12, blue: 0.03 }
        },
        {
            name: '苍月岛',
            minLevel: 20,
            maxLevel: 30,
            monsters: [
                { name: '骷髅精灵', level: 20, hp: 400, attack: 40, defense: 20, exp: 350, gold: 40 },
                { name: '邪恶钳虫', level: 25, hp: 500, attack: 48, defense: 25, exp: 450, gold: 50 },
                { name: '触龙神', level: 30, hp: 1500, attack: 60, defense: 30, exp: 1500, gold: 200, boss: true }
            ],
            dropChance: { green: 0.15, blue: 0.05 }
        },
        {
            name: '猪洞',
            minLevel: 25,
            maxLevel: 35,
            monsters: [
                { name: '红野猪', level: 25, hp: 450, attack: 45, defense: 22, exp: 400, gold: 60 },
                { name: '黑野猪', level: 28, hp: 520, attack: 50, defense: 25, exp: 480, gold: 70 },
                { name: '白野猪', level: 32, hp: 800, attack: 55, defense: 28, exp: 800, gold: 100 },
                { name: '石墓尸王', level: 35, hp: 2000, attack: 70, defense: 35, exp: 2000, gold: 300, boss: true }
            ],
            dropChance: { green: 0.2, blue: 0.08, purple: 0.01 }
        },
        {
            name: '祖玛寺庙',
            minLevel: 35,
            maxLevel: 45,
            monsters: [
                { name: '祖玛弓箭手', level: 35, hp: 600, attack: 60, defense: 30, exp: 600, gold: 80 },
                { name: '祖玛雕像', level: 38, hp: 700, attack: 65, defense: 35, exp: 700, gold: 90 },
                { name: '祖玛卫士', level: 42, hp: 900, attack: 75, defense: 40, exp: 900, gold: 100 },
                { name: '祖玛教主', level: 45, hp: 3000, attack: 100, defense: 50, exp: 3000, gold: 400, boss: true }
            ],
            dropChance: { blue: 0.15, purple: 0.03 }
        },
        {
            name: '赤月峡谷',
            minLevel: 45,
            maxLevel: 55,
            monsters: [
                { name: '赤月恶魔', level: 50, hp: 1500, attack: 120, defense: 60, exp: 2000, gold: 250 },
                { name: '恶魔祭坛', level: 52, hp: 2000, attack: 140, defense: 70, exp: 2500, gold: 300 },
                { name: '双头血魔', level: 55, hp: 2500, attack: 160, defense: 80, exp: 3000, gold: 350 }
            ],
            dropChance: { purple: 0.08, orange: 0.01 }
        },
        {
            name: '封魔谷',
            minLevel: 55,
            maxLevel: 65,
            monsters: [
                { name: '虹魔教主', level: 58, hp: 5000, attack: 200, defense: 100, exp: 5000, gold: 600, boss: true },
                { name: '雷霆蜥蜴', level: 60, hp: 3000, attack: 180, defense: 90, exp: 3500, gold: 400 },
                { name: '光芒怪物', level: 62, hp: 3500, attack: 200, defense: 100, exp: 4000, gold: 450 },
                { name: '烈焰怪物', level: 65, hp: 4000, attack: 220, defense: 110, exp: 4500, gold: 500 }
            ],
            dropChance: { purple: 0.12, orange: 0.02 }
        }
    ],
    
    equipment: {
        wooden_sword: { name: '木剑', type: 'weapon', quality: 'white', attack: 5, level: 1 },
        iron_sword: { name: '铁剑', type: 'weapon', quality: 'white', attack: 12, level: 5 },
        steel_sword: { name: '短剑', type: 'weapon', quality: 'green', attack: 18, level: 15 },
        bluesword: { name: '炼狱', type: 'weapon', quality: 'purple', attack: 40, level: 28 },
        cloth_robe: { name: '布衣', type: 'armor', quality: 'white', defense: 3, level: 1 },
        leather_armor: { name: '轻甲', type: 'armor', quality: 'white', defense: 8, level: 5 },
        iron_armor: { name: '钢甲', type: 'armor', quality: 'green', defense: 15, level: 15 },
        magic_robe: { name: '魔法长袍', type: 'armor', quality: 'green', defense: 18, magicDefense: 10, level: 20 },
        leather_helmet: { name: '皮帽', type: 'helmet', quality: 'white', defense: 3, level: 3 },
        iron_helmet: { name: '铁盔', type: 'helmet', quality: 'green', defense: 8, level: 12 },
        bronze_ring: { name: '铜戒指', type: 'ring', quality: 'white', attack: 2, level: 3 },
        silver_ring: { name: '银戒指', type: 'ring', quality: 'green', attack: 5, level: 15 },
        bronze_necklace: { name: '铜项链', type: 'necklace', quality: 'white', defense: 2, level: 3 },
        silver_necklace: { name: '银项链', type: 'necklace', quality: 'green', defense: 5, level: 15 }
    },
    
    itemQualities: {
        white: { name: '普通', statMultiplier: 1.0, color: '#ffffff' },
        green: { name: '高级', statMultiplier: 1.3, color: '#ffff00' },
        blue: { name: '稀有', statMultiplier: 1.6, color: '#00ff00' },
        purple: { name: '史诗', statMultiplier: 2.0, color: '#9b59b6' },
        orange: { name: '传说', statMultiplier: 2.5, color: '#ff6b6b' }
    },
    
    expTable: {}
};

for (let i = 1; i <= 100; i++) {
    if (i <= 10) {
        gameData.expTable[i] = i * 100;
    } else if (i <= 20) {
        gameData.expTable[i] = 1000 + (i - 10) * 500;
    } else if (i <= 30) {
        gameData.expTable[i] = 6000 + (i - 20) * 2000;
    } else if (i <= 50) {
        gameData.expTable[i] = 26000 + (i - 30) * 4000;
    } else if (i <= 70) {
        gameData.expTable[i] = 146000 + (i - 50) * 8000;
    } else {
        gameData.expTable[i] = 306000 + (i - 70) * 15000;
    }
}
