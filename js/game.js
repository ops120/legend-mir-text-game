let gameState = {
    characters: [],
    selectedCharacter: null,
    currentMapIndex: 0,
    backpack: [],
    gold: 0,
    battleActive: false,
    currentMonsters: [],
    battleLog: [],
    isAutoBattle: false,
    battleSpeed: 1000,
    speedLevel: 1,
    unlockedSpeedLevels: [1],
    speedTimeLeft: 0,
    speedTimerInterval: null,
    totalKills: 0,
    gameTime: 0,
    battleTimeout: null,
    autoBattleTimeout: null,
    gameTimeInterval: null,
    selectedBackpackSlots: new Set()
};

const speedSettings = {
    1: { name: '1x', price: 0, delay: 1000, description: '正常速度' },
    2: { name: '2x', price: 50, delay: 900, description: '略快' },
    3: { name: '3x', price: 100, delay: 800, description: '较快' },
    4: { name: '4x', price: 200, delay: 700, description: '快速' },
    5: { name: '5x', price: 350, delay: 600, description: '很快' },
    6: { name: '6x', price: 500, delay: 500, description: '极速' },
    7: { name: '7x', price: 700, delay: 400, description: '超极速' },
    8: { name: '8x', price: 900, delay: 300, description: '疯狂' },
    9: { name: '9x', price: 1200, delay: 200, description: '狂暴' },
    10: { name: '10x', price: 1500, delay: 100, description: '神速' }
};

function createCharacter(classId) {
    const classInfo = gameData.classes[classId];
    return {
        id: classId,
        name: classInfo.name,
        class: classId,
        level: 1,
        exp: 0,
        maxExp: gameData.expTable[1],
        hp: classInfo.baseStats.hp,
        maxHp: classInfo.baseStats.hp,
        mp: classInfo.baseStats.mp,
        maxMp: classInfo.baseStats.mp,
        attack: classInfo.baseStats.attack,
        defense: classInfo.baseStats.defense,
        magicDefense: classInfo.baseStats.defense * 0.5,
        equipment: {
            weapon: null,
            armor: null,
            helmet: null,
            necklace: null,
            ring1: null,
            ring2: null
        },
        skills: Object.keys(classInfo.skills).map(skillId => ({
            skillId: parseInt(skillId),
            level: 1,
            cooldown: 0
        })),
        buffs: [],
        isDead: false
    };
}

function initGame() {
    gameState.characters = [];
    gameState.backpack = [];
    gameState.gold = 0;
    gameState.totalKills = 0;
    gameState.currentMapIndex = 0;
    gameState.battleActive = false;
    gameState.isAutoBattle = false;
    gameState.battleLog = [];
    gameState.currentMonsters = [];
    
    Object.keys(gameData.classes).forEach(classId => {
        const char = createCharacter(classId);
        gameState.characters.push(char);
        updateCharacterStats(char);
    });
    
    gameState.selectedCharacter = gameState.characters[0];
    
    renderCharacters();
    renderMaps();
    renderBackpack();
    updateUI();
    updateSpeedUI();
    
    if (!gameState.gameTimeInterval) {
        gameState.gameTimeInterval = setInterval(() => {
            gameState.gameTime++;
            document.getElementById('game-time').textContent = formatTime(gameState.gameTime);
        }, 1000);
    }
    
    addToLog('欢迎来到热血传奇文字游戏世界！', 'info');
    addToLog('选择一个角色开始你的传奇之旅！', 'info');
}

function renderCharacters() {
    const container = document.getElementById('characters-container');
    container.innerHTML = '';
    
    gameState.characters.forEach(char => {
        const charCard = document.createElement('div');
        charCard.className = `character-card ${char.class} ${gameState.selectedCharacter?.id === char.id ? 'active' : ''}`;
        charCard.onclick = () => selectCharacter(char);
        
        const classInfo = gameData.classes[char.class];
        const expPercent = (char.exp / char.maxExp) * 100;
        
        let equipmentHtml = '';
        const slotOrder = ['weapon', 'armor', 'helmet', 'necklace', 'ring1', 'ring2'];
        slotOrder.forEach(slot => {
            const item = char.equipment[slot];
            if (item && item.name) {
                const qualityInfo = gameData.itemQualities[item.quality] || gameData.itemQualities.white;
                const statsText = [];
                if (item.attack) statsText.push(`攻击+${item.attack}`);
                if (item.defense) statsText.push(`防御+${item.defense}`);
                if (item.magicDefense) statsText.push(`魔御+${item.magicDefense}`);
                
                equipmentHtml += `
                    <div class="equip-slot equipped" data-slot="${slot}" onclick="unequipItem('${slot}')" 
                         onmouseenter="showEquippedTooltip(event, '${slot}')" onmouseleave="hideItemTooltip()">
                        <div class="equip-slot-label">${getSlotName(slot)}</div>
                        <div class="${qualityInfo.color} equip-name" style="font-weight: bold; font-size: 0.75rem; line-height: 1.2;">${item.name}</div>
                        <div style="font-size: 0.65rem; color: #888; margin-top: 2px;">${statsText.join(' ')}</div>
                    </div>
                `;
            } else {
                equipmentHtml += `
                    <div class="equip-slot" data-slot="${slot}">
                        <div class="equip-slot-label">${getSlotName(slot)}</div>
                        <div style="color: #666; font-size: 0.75rem;">空</div>
                    </div>
                `;
            }
        });
        
        charCard.innerHTML = `
            <div class="char-name" style="color: ${classInfo.color}">${char.name}</div>
            <div class="char-level">Lv.${char.level}</div>
            
            <div class="char-stats">
                <div class="stat-item hp">❤️ HP: ${char.hp}/${char.maxHp}</div>
                <div class="stat-item mp">💧 MP: ${char.mp}/${char.maxMp}</div>
                <div class="stat-item attack">⚔️ 攻击: ${char.attack}</div>
                <div class="stat-item defense">🛡️ 防御: ${char.defense}</div>
            </div>
            
            <div class="exp-bar">
                <div class="exp-fill" style="width: ${expPercent}%"></div>
            </div>
            <div class="exp-text">经验: ${char.exp}/${char.maxExp} (${expPercent.toFixed(1)}%)</div>
            
            <div class="equipment-grid">${equipmentHtml}</div>
        `;
        
        container.appendChild(charCard);
    });
}

function getSlotName(slot) {
    const names = {
        weapon: '武器',
        armor: '衣服',
        helmet: '头盔',
        necklace: '项链',
        ring1: '戒指1',
        ring2: '戒指2'
    };
    return names[slot] || slot;
}

function selectCharacter(char) {
    if (char.isDead) {
        addToLog(`${char.name} 已死亡，无法选择！`, 'info');
        return;
    }
    
    gameState.selectedCharacter = char;
    renderCharacters();
    addToLog(`选择了 ${char.name}`, 'info');
}

function renderMaps() {
    const container = document.getElementById('map-list');
    container.innerHTML = '';
    
    gameData.maps.forEach((map, index) => {
        const mapItem = document.createElement('div');
        mapItem.className = `map-item ${gameState.currentMapIndex === index ? 'active' : ''}`;
        mapItem.innerHTML = `
            <div>
                <div class="map-name">${map.name}</div>
                <div class="map-level">等级: ${map.minLevel}-${map.maxLevel}</div>
            </div>
            <div style="color: #ffd93d;">▶</div>
        `;
        mapItem.onclick = () => selectMap(index);
        container.appendChild(mapItem);
    });
}

function selectMap(index) {
    gameState.currentMapIndex = index;
    const map = gameData.maps[index];
    
    if (gameState.selectedCharacter && gameState.selectedCharacter.level < map.minLevel) {
        addToLog(`${gameState.selectedCharacter.name} 等级不足，无法进入 ${map.name}！`, 'info');
        return;
    }
    
    renderMaps();
    addToLog(`前往 ${map.name}`, 'info');
}

function renderBackpack() {
    const container = document.getElementById('backpack-grid');
    container.innerHTML = '';
    
    for (let i = 0; i < 40; i++) {
        const slot = document.createElement('div');
        slot.className = 'backpack-slot';
        slot.dataset.index = i;
        
        if (gameState.backpack[i]) {
            const item = gameState.backpack[i];
            const qualityInfo = gameData.itemQualities[item.quality] || gameData.itemQualities.white;
            const isSelected = gameState.selectedBackpackSlots.has(i);
            
            slot.className += ' has-item' + (isSelected ? ' selected-item' : '');
            slot.innerHTML = `
                <div class="${qualityInfo.color}" style="font-weight: bold; font-size: 0.75rem; line-height: 1.2;">${item.name}</div>
                <div style="font-size: 0.65rem; color: #888;">Lv.${item.level}</div>
                ${isSelected ? '<div style="position: absolute; top: -5px; right: -5px; background: #ff6b6b; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">✓</div>' : ''}
            `;
            slot.style.position = 'relative';
            
            slot.onclick = (e) => {
                if (e.ctrlKey || e.shiftKey) {
                    toggleBackpackSelection(i);
                } else {
                    equipItem(i);
                }
            };
            slot.ondblclick = () => sellItem(i);
            slot.oncontextmenu = (e) => {
                e.preventDefault();
                toggleBackpackSelection(i);
            };
            slot.onmouseenter = (e) => {
                showItemTooltip(item, e, true);
                if (gameState.selectedBackpackSlots.has(i)) {
                    slot.style.borderColor = '#ff6b6b';
                    slot.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.6)';
                }
            };
            slot.onmouseleave = hideItemTooltip;
        }
        
        container.appendChild(slot);
    }
    
    document.getElementById('backpack-count').textContent = gameState.backpack.filter(item => item).length;
    updateSellPreview();
}

function showItemTooltip(item, event, isBackpack = false) {
    const tooltip = document.getElementById('item-tooltip');
    const qualityInfo = gameData.itemQualities[item.quality];
    
    let statsHtml = '';
    if (item.attack) statsHtml += `<div>攻击: +${item.attack}</div>`;
    if (item.defense) statsHtml += `<div>防御: +${item.defense}</div>`;
    if (item.magicDefense) statsHtml += `<div>魔御: +${item.magicDefense}</div>`;
    if (item.hp) statsHtml += `<div>生命: +${item.hp}</div>`;
    if (item.mp) statsHtml += `<div>魔法: +${item.mp}</div>`;
    
    let actionHint = isBackpack ? '<div style="color: #ffd93d; margin-top: 10px;">点击穿戴装备</div>' : '<div style="color: #ff6b6b; margin-top: 10px;">点击卸下装备</div>';
    
    tooltip.innerHTML = `
        <div class="tooltip-name" style="color: ${qualityInfo.color}">${item.name}</div>
        <div class="tooltip-type">${qualityInfo.name} ${getItemTypeName(item.type)} | 等级: ${item.level}</div>
        <div class="tooltip-stats">${statsHtml}</div>
        ${actionHint}
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY + 10) + 'px';
    
    if (parseInt(tooltip.style.left) + 300 > window.innerWidth) {
        tooltip.style.left = (event.pageX - 260) + 'px';
    }
    if (parseInt(tooltip.style.top) + 200 > window.innerHeight) {
        tooltip.style.top = (event.pageY - 200) + 'px';
    }
}

function hideItemTooltip() {
    document.getElementById('item-tooltip').style.display = 'none';
}

function showEquippedTooltip(event, slot) {
    const char = gameState.selectedCharacter;
    if (!char) return;
    
    const item = char.equipment[slot];
    if (!item) return;
    
    const tooltip = document.getElementById('item-tooltip');
    const qualityInfo = gameData.itemQualities[item.quality] || gameData.itemQualities.white;
    
    let statsHtml = '';
    if (item.attack) statsHtml += `<div style="color: #ffd93d;">⚔️ 攻击: +${item.attack}</div>`;
    if (item.defense) statsHtml += `<div style="color: #4ecdc4;">🛡️ 防御: +${item.defense}</div>`;
    if (item.magicDefense) statsHtml += `<div style="color: #9b59b6;">✨ 魔御: +${item.magicDefense}</div>`;
    if (item.hp) statsHtml += `<div style="color: #ff6b6b;">❤️ 生命: +${item.hp}</div>`;
    if (item.mp) statsHtml += `<div style="color: #45b7d1;">💧 魔法: +${item.mp}</div>`;
    
    tooltip.innerHTML = `
        <div class="tooltip-name" style="color: ${qualityInfo.color}; font-weight: bold;">${item.name}</div>
        <div class="tooltip-type" style="color: ${qualityInfo.color}; opacity: 0.8;">${qualityInfo.name} ${getItemTypeName(item.type)} | 需要等级: ${item.level}</div>
        <div class="tooltip-stats" style="margin-top: 10px;">${statsHtml}</div>
        <div style="color: #ff6b6b; margin-top: 10px; font-size: 0.85rem;">点击卸下装备</div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY + 10) + 'px';
    
    if (parseInt(tooltip.style.left) + 300 > window.innerWidth) {
        tooltip.style.left = (event.pageX - 260) + 'px';
    }
    if (parseInt(tooltip.style.top) + 200 > window.innerHeight) {
        tooltip.style.top = (event.pageY - 200) + 'px';
    }
}

function getItemTypeName(type) {
    const names = {
        weapon: '武器',
        armor: '衣服',
        helmet: '头盔',
        necklace: '项链',
        ring: '戒指'
    };
    return names[type] || type;
}

function equipItem(backpackIndex) {
    const char = gameState.selectedCharacter;
    if (!char) {
        addToLog('请先选择一个角色！', 'info');
        return;
    }
    
    if (char.isDead) {
        addToLog(`${char.name} 已死亡，无法穿戴装备！`, 'info');
        return;
    }
    
    const item = gameState.backpack[backpackIndex];
    if (!item) return;
    
    if (char.level < item.level) {
        addToLog(`${item.name} 需要 ${item.level} 级才能穿戴！`, 'info');
        return;
    }
    
    let equipSlot = item.type;
    if (item.type === 'ring') {
        if (char.equipment.ring1) {
            equipSlot = char.equipment.ring2 ? 'ring1' : 'ring2';
        } else {
            equipSlot = 'ring1';
        }
    }
    
    const oldItem = char.equipment[equipSlot];
    char.equipment[equipSlot] = item;
    gameState.backpack[backpackIndex] = oldItem;
    
    updateCharacterStats(char);
    renderCharacters();
    renderBackpack();
    
    const qualityInfo = gameData.itemQualities[item.quality];
    addToLog(`穿戴 ${item.name}（${qualityInfo.name}）`, 'info');
}

function unequipItem(slot) {
    const char = gameState.selectedCharacter;
    if (!char) {
        addToLog('请先选择一个角色！', 'info');
        return;
    }
    
    const item = char.equipment[slot];
    if (!item) return;
    
    if (gameState.backpack.filter(i => i).length >= 40) {
        addToLog('背包已满，无法卸下装备！', 'info');
        return;
    }
    
    char.equipment[slot] = null;
    
    const emptyIndex = gameState.backpack.findIndex(i => !i);
    if (emptyIndex !== -1) {
        gameState.backpack[emptyIndex] = item;
    } else {
        gameState.backpack.push(item);
    }
    
    updateCharacterStats(char);
    renderCharacters();
    renderBackpack();
    
    addToLog(`卸下 ${item.name}`, 'info');
}

function updateCharacterStats(char) {
    const classInfo = gameData.classes[char.class];
    
    char.maxHp = classInfo.baseStats.hp + (char.level - 1) * classInfo.growthStats.hp;
    char.maxMp = classInfo.baseStats.mp + (char.level - 1) * classInfo.growthStats.mp;
    char.attack = classInfo.baseStats.attack + (char.level - 1) * classInfo.growthStats.attack;
    char.defense = classInfo.baseStats.defense + (char.level - 1) * classInfo.growthStats.defense;
    char.magicDefense = char.defense * 0.5;
    
    Object.values(char.equipment).forEach(item => {
        if (item) {
            if (item.attack) char.attack += item.attack;
            if (item.defense) char.defense += item.defense;
            if (item.magicDefense) char.magicDefense += item.magicDefense;
            if (item.hp) char.maxHp += item.hp;
            if (item.mp) char.maxMp += item.mp;
        }
    });
    
    if (char.hp > char.maxHp) char.hp = char.maxHp;
    if (char.mp > char.maxMp) char.mp = char.maxMp;
}

function startBattle() {
    if (gameState.battleActive) {
        addToLog('战斗正在进行中...', 'info');
        return;
    }
    
    const char = gameState.selectedCharacter;
    if (!char) {
        addToLog('请先选择一个角色！', 'info');
        return;
    }
    
    if (char.isDead) {
        addToLog(`${char.name} 已死亡，无法战斗！`, 'info');
        return;
    }
    
    const map = gameData.maps[gameState.currentMapIndex];
    
    if (char.level < map.minLevel) {
        addToLog(`${char.name} 等级不足，无法进入 ${map.name}！`, 'info');
        return;
    }
    
    const monsterCount = char.level >= 30 ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 2) + 2;
    gameState.currentMonsters = [];
    
    for (let i = 0; i < monsterCount; i++) {
        const monsterTemplate = map.monsters[Math.floor(Math.random() * map.monsters.length)];
        const levelVariation = Math.floor(Math.random() * 5) - 2;
        const monsterLevel = Math.max(map.minLevel, Math.min(map.maxLevel, monsterTemplate.level + levelVariation));
        
        gameState.currentMonsters.push({
            id: i,
            name: monsterTemplate.name,
            level: monsterLevel,
            hp: Math.floor(monsterTemplate.hp * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            maxHp: Math.floor(monsterTemplate.hp * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            attack: Math.floor(monsterTemplate.attack * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            defense: Math.floor(monsterTemplate.defense * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            exp: Math.floor(monsterTemplate.exp * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            gold: Math.floor(monsterTemplate.gold * (1 + (monsterLevel - monsterTemplate.level) * 0.1)),
            boss: monsterTemplate.boss || false,
            isDead: false
        });
    }
    
    gameState.battleActive = true;
    renderMonsters();
    
    const bossCount = gameState.currentMonsters.filter(m => m.boss).length;
    if (bossCount > 0) {
        addToLog(`⚔️ 遭遇首领：${gameState.currentMonsters.find(m => m.boss).name}！`, 'info');
    } else {
        addToLog(`⚔️ 遭遇 ${monsterCount} 只怪物！`, 'info');
    }
    
    document.getElementById('start-battle').classList.add('battle-active');
    
    clearTimeout(gameState.battleTimeout);
    gameState.battleTimeout = setTimeout(() => battleRound(), gameState.battleSpeed);
}

function renderMonsters() {
    const container = document.getElementById('monsters-container');
    container.innerHTML = '';
    
    if (gameState.currentMonsters.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">等待战斗开始...</div>';
        return;
    }
    
    gameState.currentMonsters.forEach(monster => {
        if (monster.isDead) return;
        
        const card = document.createElement('div');
        card.className = 'monster-card';
        const hpPercent = (monster.hp / monster.maxHp) * 100;
        
        card.innerHTML = `
            <div class="monster-name">
                ${monster.boss ? '👑 ' : ''}${monster.name} Lv.${monster.level}
            </div>
            <div>生命: ${monster.hp}/${monster.maxHp}</div>
            <div>攻击: ${monster.attack} | 防御: ${monster.defense}</div>
            <div class="exp-bar">
                <div class="exp-fill" style="width: ${hpPercent}%; background: linear-gradient(90deg, #ff4444, #ff6666);"></div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function battleRound() {
    if (!gameState.battleActive) return;
    
    const char = gameState.selectedCharacter;
    if (!char || char.isDead) {
        endBattle();
        return;
    }
    
    const aliveMonsters = gameState.currentMonsters.filter(m => !m.isDead);
    if (aliveMonsters.length === 0) {
        battleVictory();
        return;
    }
    
    const target = aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
    
    let damage = calculateDamage(char, target);
    target.hp -= damage;
    
    addToLog(`${char.name} 攻击 ${target.name}，造成 ${damage} 点伤害！`, 'damage');
    
    if (target.hp <= 0) {
        target.hp = 0;
        target.isDead = true;
        gameState.totalKills++;
        addToLog(`击杀 ${target.name}！获得 ${target.exp} 经验，${target.gold} 金币`, 'loot');
        
        char.exp += target.exp;
        gameState.gold += target.gold;
        
        generateLoot(target);
        
        checkLevelUp(char);
    }
    
    if (!target.isDead) {
        const monsterDamage = calculateMonsterDamage(target, char);
        char.hp -= monsterDamage;
        addToLog(`${target.name} 反击 ${char.name}，造成 ${monsterDamage} 点伤害！`, 'damage');
        
        if (char.hp <= 0) {
            char.hp = 0;
            char.isDead = true;
            addToLog(`${char.name} 倒下了！正在复活...`, 'info');
            endBattle();
            
            setTimeout(() => {
                respawnCharacter(char);
            }, 1000);
            return;
        }
    }
    
    renderMonsters();
    renderCharacters();
    updateUI();
    
    gameState.battleTimeout = setTimeout(() => battleRound(), gameState.battleSpeed);
}

function calculateDamage(char, monster) {
    const baseDamage = char.attack - monster.defense / 2;
    const randomFactor = 0.9 + Math.random() * 0.2;
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor));
    return damage;
}

function calculateMonsterDamage(monster, char) {
    const baseDamage = monster.attack - char.defense / 2;
    const randomFactor = 0.9 + Math.random() * 0.2;
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor));
    return damage;
}

function generateLoot(monster) {
    const map = gameData.maps[gameState.currentMapIndex];
    const dropChance = Math.random();
    
    let quality = 'white';
    let cumulativeChance = 0;
    
    for (const [q, chance] of Object.entries(map.dropChance)) {
        cumulativeChance += chance;
        if (dropChance < cumulativeChance) {
            quality = q;
            break;
        }
    }
    
    const equipmentTypes = ['weapon', 'armor', 'helmet', 'necklace', 'ring'];
    const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    
    const equipmentNames = {
        weapon: {
            white: ['木剑', '铁剑'],
            green: ['短剑', '青铜剑'],
            blue: ['钢剑', '精钢剑'],
            purple: ['炼狱', '龙牙'],
            orange: ['屠龙刀', '嗜魂法杖']
        },
        armor: {
            white: ['布衣', '轻甲'],
            green: ['钢甲', '魔法长袍'],
            blue: ['重甲', '恶魔长袍'],
            purple: ['天魔战甲', '法神披风'],
            orange: ['圣战套装', '战神套装']
        },
        helmet: {
            white: ['皮帽'],
            green: ['铁盔'],
            blue: ['青铜头盔'],
            purple: ['黑铁头盔'],
            orange: ['圣战头盔']
        },
        necklace: {
            white: ['铜项链'],
            green: ['银项链'],
            blue: ['金项链'],
            purple: ['凤凰项链'],
            orange: ['嗜血项链']
        },
        ring: {
            white: ['铜戒指'],
            green: ['银戒指'],
            blue: ['金戒指'],
            purple: ['力量戒指'],
            orange: ['麻痹戒指']
        }
    };
    
    const names = equipmentNames[type]?.[quality] || ['装备'];
    const itemName = names[Math.floor(Math.random() * names.length)];
    
    const baseStats = {
        weapon: { attack: 5 + monster.level * 2 },
        armor: { defense: 3 + monster.level * 1.5 },
        helmet: { defense: 2 + monster.level },
        necklace: { defense: 2 + monster.level },
        ring: { attack: 2 + monster.level }
    };
    
    const item = {
        id: Date.now() + Math.random(),
        name: itemName,
        type: type,
        quality: quality,
        level: Math.max(1, monster.level + Math.floor(Math.random() * 3) - 1),
        ...baseStats[type]
    };
    
    const emptySlots = gameState.backpack.filter(i => !i).length;
    if (emptySlots > 0) {
        const emptyIndex = gameState.backpack.findIndex(i => !i);
        if (emptyIndex !== -1) {
            gameState.backpack[emptyIndex] = item;
            const qualityInfo = gameData.itemQualities[quality];
            addToLog(`🎁 获得 ${qualityInfo.name}装备：${itemName}（${type === 'weapon' ? '攻击' : '防御'}+${item.attack || item.defense}）`, 'loot');
            renderBackpack();
        }
    } else if (gameState.backpack.length < 40) {
        gameState.backpack.push(item);
        const qualityInfo = gameData.itemQualities[quality];
        addToLog(`🎁 获得 ${qualityInfo.name}装备：${itemName}（${type === 'weapon' ? '攻击' : '防御'}+${item.attack || item.defense}）`, 'loot');
        renderBackpack();
    } else {
        const goldReward = Math.floor(10 + monster.level * 5);
        gameState.gold += goldReward;
        addToLog(`💰 背包已满，获得 ${goldReward} 金币补偿`, 'gold');
    }
}

function checkLevelUp(char) {
    while (char.exp >= char.maxExp && char.level < 100) {
        char.exp -= char.maxExp;
        char.level++;
        char.maxExp = gameData.expTable[char.level];
        
        updateCharacterStats(char);
        
        addToLog(`🎉 ${char.name} 升级了！现在是 ${char.level} 级！`, 'levelup');
        
        if (char.level % 10 === 0) {
            addToLog(`${char.name} 获得了新技能！`, 'info');
        }
    }
}

function battleVictory() {
    gameState.battleActive = false;
    document.getElementById('start-battle').classList.remove('battle-active');
    
    addToLog('✨ 战斗胜利！✨', 'info');
    gameState.currentMonsters = [];
    renderMonsters();
    
    if (gameState.isAutoBattle) {
        setTimeout(() => startBattle(), 500);
    }
}

function endBattle() {
    gameState.battleActive = false;
    document.getElementById('start-battle').classList.remove('battle-active');
    
    addToLog('战斗结束', 'info');
    gameState.currentMonsters = [];
    renderMonsters();
    
    if (gameState.isAutoBattle) {
        gameState.isAutoBattle = false;
        document.getElementById('auto-battle-status').textContent = '关闭';
        addToLog('自动战斗已停止', 'info');
    }
}

function toggleAutoBattle() {
    gameState.isAutoBattle = !gameState.isAutoBattle;
    document.getElementById('auto-battle-status').textContent = gameState.isAutoBattle ? '开启' : '关闭';
    addToLog(`自动战斗：${gameState.isAutoBattle ? '开启' : '关闭'}`, 'info');
    
    if (gameState.isAutoBattle && !gameState.battleActive) {
        startBattle();
    }
}

function changeSpeed(delta) {
    if (gameState.speedLevel === 1 && gameState.speedTimeLeft <= 0 && delta > 0) {
        addToLog('⚠️ 请先购买加速服务', 'info');
        return;
    }
    
    if (gameState.speedLevel === 1 && gameState.speedTimeLeft <= 0) {
        addToLog('⚠️ 请先购买加速服务', 'info');
        return;
    }
    
    const currentIndex = gameState.unlockedSpeedLevels.indexOf(gameState.speedLevel);
    
    if (delta > 0) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < gameState.unlockedSpeedLevels.length) {
            gameState.speedLevel = gameState.unlockedSpeedLevels[nextIndex];
            gameState.battleSpeed = speedSettings[gameState.speedLevel].delay;
            updateSpeedUI();
            addToLog(`⚡ 切换到 ${speedSettings[gameState.speedLevel].name} 速度（${speedSettings[gameState.speedLevel].description}）`, 'info');
        } else {
            addToLog('⚠️ 已达到已解锁的最高速度', 'info');
        }
    } else {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            gameState.speedLevel = gameState.unlockedSpeedLevels[prevIndex];
            gameState.battleSpeed = speedSettings[gameState.speedLevel].delay;
            updateSpeedUI();
            addToLog(`⚡ 切换到 ${speedSettings[gameState.speedLevel].name} 速度（${speedSettings[gameState.speedLevel].description}）`, 'info');
        } else {
            addToLog('⚠️ 已达到最低速度', 'info');
        }
    }
}

function purchaseSpeed() {
    if (gameState.speedTimeLeft > 0) {
        const minutes = Math.floor(gameState.speedTimeLeft / 60);
        const seconds = gameState.speedTimeLeft % 60;
        addToLog(`⚠️ 加速服务剩余 ${minutes}分${seconds}秒，请等待到期后再购买`, 'info');
        return;
    }
    
    const currentMax = Math.max(...gameState.unlockedSpeedLevels);
    
    if (currentMax >= 10) {
        addToLog('⚠️ 已解锁最高速度等级！', 'info');
        return;
    }
    
    const nextLevel = currentMax + 1;
    const price = speedSettings[nextLevel].price;
    
    if (gameState.gold < price) {
        addToLog(`💰 金币不足！购买 ${nextLevel}x 加速需要 ${formatNumber(price)} 金币，你只有 ${formatNumber(gameState.gold)} 金币`, 'info');
        return;
    }
    
    if (confirm(`🔓 购买 ${nextLevel}x 加速服务\n\n价格: ${formatNumber(price)} 金币\n效果: ${speedSettings[nextLevel].description}\n持续时间: 5分钟\n\n确认消耗 ${formatNumber(price)} 金币？`)) {
        gameState.gold -= price;
        
        if (!gameState.unlockedSpeedLevels.includes(nextLevel)) {
            gameState.unlockedSpeedLevels.push(nextLevel);
            gameState.unlockedSpeedLevels.sort((a, b) => a - b);
        }
        
        gameState.speedLevel = nextLevel;
        gameState.battleSpeed = speedSettings[nextLevel].delay;
        gameState.speedTimeLeft = 300;
        
        startSpeedTimer();
        
        updateUI();
        updateSpeedUI();
        
        addToLog(`🎉 购买成功！${nextLevel}x 加速（${speedSettings[nextLevel].description}）已激活！`, 'levelup');
        addToLog(`⏰ 持续时间: 5分钟`, 'info');
        addToLog(`💰 剩余金币: ${formatNumber(gameState.gold)}`, 'gold');
    }
}

function startSpeedTimer() {
    if (gameState.speedTimerInterval) {
        clearInterval(gameState.speedTimerInterval);
    }
    
    gameState.speedTimerInterval = setInterval(() => {
        if (gameState.speedTimeLeft > 0) {
            gameState.speedTimeLeft--;
            updateSpeedUI();
            
            if (gameState.speedTimeLeft === 0) {
                clearInterval(gameState.speedTimerInterval);
                gameState.speedTimerInterval = null;
                
                gameState.speedLevel = 1;
                gameState.battleSpeed = speedSettings[1].delay;
                
                updateSpeedUI();
                addToLog('⏰ 加速服务已到期，速度恢复为 1x', 'info');
            }
        }
    }, 1000);
}

function formatTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateSpeedUI() {
    const currentSettings = speedSettings[gameState.speedLevel];
    const hasActiveSpeed = gameState.speedTimeLeft > 0;
    
    document.getElementById('speed-display').textContent = currentSettings.name;
    document.getElementById('speed-display').style.color = hasActiveSpeed ? '#ffd700' : '#ff6b6b';
    
    const descriptionEl = document.getElementById('speed-description');
    const hintEl = document.getElementById('unlock-hint');
    
    if (hasActiveSpeed) {
        descriptionEl.textContent = `${currentSettings.description} - 剩余 ${formatTimeLeft(gameState.speedTimeLeft)}`;
        descriptionEl.style.color = '#00ff00';
        hintEl.textContent = `⏰ ${formatTimeLeft(gameState.speedTimeLeft)} 后速度恢复为 1x`;
        hintEl.style.color = '#ffd700';
    } else {
        descriptionEl.textContent = `${currentSettings.description} - 未激活`;
        descriptionEl.style.color = '#888';
        hintEl.textContent = '💡 点击购买激活加速服务';
        hintEl.style.color = '#888';
    }
    
    const unlockBtn = document.getElementById('unlock-speed');
    const currentMax = Math.max(...gameState.unlockedSpeedLevels);
    
    if (currentMax >= 10) {
        unlockBtn.textContent = '✅ 已满级';
        unlockBtn.disabled = false;
    } else if (hasActiveSpeed) {
        const nextLevel = currentMax + 1;
        unlockBtn.textContent = `⏰ ${formatTimeLeft(gameState.speedTimeLeft)}`;
        unlockBtn.disabled = true;
        unlockBtn.style.opacity = '0.5';
    } else {
        const nextLevel = currentMax + 1;
        unlockBtn.textContent = `🔓 购买 ${nextLevel}x (${formatNumber(speedSettings[nextLevel].price)}金币)`;
        unlockBtn.disabled = false;
        unlockBtn.style.opacity = '1';
    }
}

function addToLog(message, type = 'info') {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    gameState.battleLog.push({ message, type, time: Date.now() });
    if (gameState.battleLog.length > 100) {
        gameState.battleLog.shift();
    }
}

function updateUI() {
    document.getElementById('gold-amount').textContent = formatNumber(gameState.gold);
    document.getElementById('total-kills').textContent = formatNumber(gameState.totalKills);
}

function respawnCharacter(char) {
    char.hp = Math.floor(char.maxHp * 0.5);
    char.mp = Math.floor(char.maxMp * 0.5);
    char.isDead = false;
    
    const oldMapIndex = gameState.currentMapIndex;
    gameState.currentMapIndex = 0;
    
    renderCharacters();
    renderMaps();
    updateUI();
    
    addToLog(`💚 ${char.name} 在【边界村】安全区复活！恢复了 ${char.hp} HP 和 ${char.mp} MP`, 'heal');
    
    if (oldMapIndex !== 0) {
        addToLog('已自动返回边界村安全区域', 'info');
    }
}

function toggleBackpackSelection(index) {
    if (gameState.selectedBackpackSlots.has(index)) {
        gameState.selectedBackpackSlots.delete(index);
    } else {
        gameState.selectedBackpackSlots.add(index);
    }
    renderBackpack();
}

function calculateSellPrice(item) {
    const basePrice = {
        weapon: 50,
        armor: 40,
        helmet: 30,
        necklace: 35,
        ring: 25
    };
    
    const qualityMultiplier = {
        white: 1,
        green: 2.5,
        blue: 5,
        purple: 10,
        orange: 20
    };
    
    const base = basePrice[item.type] || 30;
    const multiplier = qualityMultiplier[item.quality] || 1;
    const levelBonus = 1 + (item.level * 0.1);
    
    return Math.floor(base * multiplier * levelBonus);
}

function sellItem(index) {
    const item = gameState.backpack[index];
    if (!item) return;
    
    const price = calculateSellPrice(item);
    gameState.gold += price;
    gameState.backpack[index] = null;
    gameState.selectedBackpackSlots.delete(index);
    
    const qualityInfo = gameData.itemQualities[item.quality];
    addToLog(`出售 ${item.name}（${qualityInfo.name}）获得 ${price} 金币`, 'gold');
    
    renderBackpack();
    updateUI();
}

function sellAllEquipment() {
    let totalGold = 0;
    let soldCount = 0;
    const itemsToSell = [];
    
    gameState.backpack.forEach((item, index) => {
        if (item) {
            const price = calculateSellPrice(item);
            totalGold += price;
            soldCount++;
            itemsToSell.push({ index, item, price });
        }
    });
    
    if (soldCount === 0) {
        addToLog('背包中没有物品可以出售', 'info');
        return;
    }
    
    if (confirm(`确定要出售背包中的所有物品吗？\n共 ${soldCount} 件物品\n预计获得 ${formatNumber(totalGold)} 金币`)) {
        itemsToSell.forEach(({ index }) => {
            gameState.backpack[index] = null;
        });
        
        gameState.gold += totalGold;
        gameState.selectedBackpackSlots.clear();
        
        addToLog(`💰 一键出售 ${soldCount} 件物品，获得 ${formatNumber(totalGold)} 金币！`, 'gold');
        
        renderBackpack();
        updateUI();
    }
}

function sellSelectedItems() {
    if (gameState.selectedBackpackSlots.size === 0) {
        addToLog('请先选择要出售的物品（右键点击或Ctrl+点击）', 'info');
        return;
    }
    
    let totalGold = 0;
    const itemsToSell = [];
    
    gameState.selectedBackpackSlots.forEach(index => {
        const item = gameState.backpack[index];
        if (item) {
            const price = calculateSellPrice(item);
            totalGold += price;
            itemsToSell.push({ index, item, price });
        }
    });
    
    if (itemsToSell.length === 0) {
        addToLog('没有可出售的物品', 'info');
        return;
    }
    
    if (confirm(`确定要出售选中的 ${itemsToSell.length} 件物品吗？\n预计获得 ${formatNumber(totalGold)} 金币`)) {
        itemsToSell.forEach(({ index }) => {
            gameState.backpack[index] = null;
        });
        
        gameState.gold += totalGold;
        gameState.selectedBackpackSlots.clear();
        
        addToLog(`🔥 出售选中的 ${itemsToSell.length} 件物品，获得 ${formatNumber(totalGold)} 金币！`, 'gold');
        
        renderBackpack();
        updateUI();
    }
}

function updateSellPreview() {
    const preview = document.getElementById('sell-preview');
    if (!preview) return;
    
    if (gameState.selectedBackpackSlots.size > 0) {
        let totalGold = 0;
        gameState.selectedBackpackSlots.forEach(index => {
            const item = gameState.backpack[index];
            if (item) {
                totalGold += calculateSellPrice(item);
            }
        });
        preview.innerHTML = `已选择 ${gameState.selectedBackpackSlots.size} 件物品，可出售获得 ${formatNumber(totalGold)} 金币`;
        preview.style.color = '#ffd700';
    } else {
        let equipmentCount = 0;
        let totalValue = 0;
        gameState.backpack.forEach(item => {
            if (item) {
                equipmentCount++;
                totalValue += calculateSellPrice(item);
            }
        });
        preview.innerHTML = `双击物品快速出售 | 共 ${equipmentCount} 件装备，价值 ${formatNumber(totalValue)} 金币`;
        preview.style.color = '#888';
    }
}

function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.getElementById('start-battle').addEventListener('click', startBattle);
document.getElementById('auto-battle').addEventListener('click', toggleAutoBattle);
document.getElementById('stop-battle').addEventListener('click', () => {
    gameState.isAutoBattle = false;
    document.getElementById('auto-battle-status').textContent = '关闭';
    endBattle();
});
document.getElementById('speed-up').addEventListener('click', () => changeSpeed(1));
document.getElementById('speed-down').addEventListener('click', () => changeSpeed(-1));
document.getElementById('unlock-speed').addEventListener('click', purchaseSpeed);
document.getElementById('save-game').addEventListener('click', saveGame);
document.getElementById('load-game').addEventListener('click', loadGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('export-save').addEventListener('click', exportSave);

document.getElementById('import-save').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importSave(file);
        e.target.value = '';
    }
});

document.getElementById('sell-all-equipment').addEventListener('click', sellAllEquipment);
document.getElementById('sell-selected').addEventListener('click', sellSelectedItems);

window.onload = () => {
    initGame();
};
