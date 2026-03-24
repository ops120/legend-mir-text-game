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
    selectedBackpackSlots: new Set(),
    activeBuffs: [],
    activeDOTs: [],
    skillCooldowns: {}
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
    gameState.battleSpeed = 1000;
    gameState.speedLevel = 1;
    gameState.unlockedSpeedLevels = [1];
    gameState.speedTimeLeft = 0;
    gameState.skillCooldowns = {};
    
    Object.keys(gameData.classes).forEach(classId => {
        const char = createCharacter(classId);
        gameState.characters.push(char);
        updateCharacterStats(char);
    });
    
    gameState.selectedCharacter = gameState.characters[0];
    
    renderCharacters();
    renderMaps();
    renderBackpack();
    renderSkills();
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
    renderSkills();
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

function renderSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const char = gameState.selectedCharacter;
    if (!char) {
        container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">请先选择一个角色</div>';
        return;
    }
    
    const skills = getCharacterSkills(char);
    
    if (skills.length === 0) {
        container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">暂无可用技能</div>';
        return;
    }
    
    skills.forEach(skill => {
        const skillEl = document.createElement('div');
        skillEl.className = 'skill-item';
        
        if (skill.remainingCooldown > 0) {
            skillEl.classList.add('on-cooldown');
        } else if (char.mp < skill.mpCost) {
            skillEl.classList.add('mp-insufficient');
        }
        
        const typeBadges = [];
        if (skill.type === 'active' || skill.type === 'passive') {
            typeBadges.push('<span class="skill-badge attack">攻击</span>');
        }
        if (skill.type === 'heal') {
            typeBadges.push('<span class="skill-badge heal">治疗</span>');
        }
        if (skill.type === 'buff') {
            typeBadges.push('<span class="skill-badge buff">buff</span>');
        }
        if (skill.aoe) {
            typeBadges.push('<span class="skill-badge aoe">AOE</span>');
        }
        if (skill.dot) {
            typeBadges.push('<span class="skill-badge dot">DOT</span>');
        }
        
        skillEl.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-level">需要等级: ${skill.skillId}</div>
            <div class="skill-info">
                ${skill.mpCost > 0 ? `<div class="skill-mp">MP: ${skill.mpCost}</div>` : ''}
                ${skill.remainingCooldown > 0 ? `<div class="skill-cooldown">冷却: ${skill.remainingCooldown}回合</div>` : ''}
            </div>
            <div>${typeBadges.join(' ')}</div>
        `;
        
        container.appendChild(skillEl);
    });
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
    
    updateBuffs(char);
    
    const aliveMonsters = gameState.currentMonsters.filter(m => !m.isDead);
    if (aliveMonsters.length === 0) {
        battleVictory();
        return;
    }
    
    const availableSkill = selectSkill(char, aliveMonsters.length);
    
    if (availableSkill) {
        useSkill(char, availableSkill, aliveMonsters);
    } else {
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
    }
    
    const stillAliveMonsters = gameState.currentMonsters.filter(m => !m.isDead);
    if (stillAliveMonsters.length === 0) {
        battleVictory();
        return;
    }
    
    for (const monster of stillAliveMonsters) {
        if (monster.isDead) continue;
        
        const monsterDamage = calculateMonsterDamage(monster, char);
        let finalDamage = monsterDamage;
        
        if (char.buffs) {
            char.buffs.forEach(buff => {
                if (buff.effect === 'damageReduction') {
                    finalDamage = Math.floor(finalDamage * (1 - buff.value));
                }
                if (buff.effect === 'shield') {
                    const absorbed = Math.floor(monsterDamage * buff.value);
                    finalDamage -= absorbed;
                    if (absorbed > 0) {
                        addToLog(`🛡️ 魔法盾吸收了 ${absorbed} 点伤害`, 'info');
                    }
                }
            });
        }
        
        finalDamage = Math.max(0, finalDamage);
        char.hp -= finalDamage;
        addToLog(`${monster.name} 攻击 ${char.name}，造成 ${finalDamage} 点伤害！`, 'damage');
        
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
    renderSkills();
    updateUI();
    
    gameState.battleTimeout = setTimeout(() => battleRound(), gameState.battleSpeed);
}

function getCharacterSkills(char) {
    if (!char || !char.class) return [];
    const classInfo = gameData.classes[char.class];
    if (!classInfo) return [];
    
    const skills = [];
    const skillIds = Object.keys(classInfo.skills).map(Number).sort((a, b) => a - b);
    
    for (const skillId of skillIds) {
        if (char.level >= skillId) {
            const skillInfo = classInfo.skills[skillId];
            const cooldownKey = `${char.id}_${skillId}`;
            const remainingCooldown = gameState.skillCooldowns[cooldownKey] || 0;
            
            skills.push({
                skillId: skillId,
                name: skillInfo.name,
                type: skillInfo.type,
                mpCost: skillInfo.mpCost || 0,
                damageMultiplier: skillInfo.damageMultiplier || 1,
                healMultiplier: skillInfo.healMultiplier || 0,
                aoe: skillInfo.aoe || false,
                dot: skillInfo.dot || false,
                duration: skillInfo.duration || 0,
                effect: skillInfo.effect || null,
                value: skillInfo.value || 0,
                cooldown: skillInfo.cooldown || 0,
                remainingCooldown: remainingCooldown,
                canUse: char.mp >= (skillInfo.mpCost || 0) && remainingCooldown <= 0
            });
        }
    }
    
    return skills;
}

function selectSkill(char, monsterCount) {
    const skills = getCharacterSkills(char);
    if (skills.length === 0) return null;
    
    const usableSkills = skills.filter(s => s.canUse);
    if (usableSkills.length === 0) return null;
    
    const hpPercent = char.hp / char.maxHp;
    const mpPercent = char.mp / char.maxMp;
    
    for (const skill of usableSkills) {
        if (hpPercent < 0.3 && (skill.type === 'heal' || skill.name === '护体神盾' || skill.name === '魔法盾')) {
            return skill;
        }
    }
    
    if (monsterCount >= 2) {
        for (const skill of usableSkills) {
            if (skill.aoe) {
                return skill;
            }
        }
    }
    
    if (mpPercent > 0.5) {
        const offensiveSkills = usableSkills.filter(s => s.type !== 'heal' && s.damageMultiplier > 1);
        if (offensiveSkills.length > 0) {
            return offensiveSkills[Math.floor(Math.random() * offensiveSkills.length)];
        }
    }
    
    if (usableSkills.length > 1) {
        const basicAttack = usableSkills.find(s => s.type === 'passive');
        if (basicAttack && Math.random() < 0.7) {
            return basicAttack;
        }
    }
    
    return usableSkills[0];
}

function useSkill(char, skill, monsters) {
    const skillInfo = gameData.classes[char.class].skills[skill.skillId];
    
    char.mp -= skill.mpCost;
    
    const cooldownKey = `${char.id}_${skill.skillId}`;
    gameState.skillCooldowns[cooldownKey] = skill.cooldown;
    
    addToLog(`✨ ${char.name} 使用【${skill.name}】！`, 'info');
    
    switch (skill.type) {
        case 'active':
        case 'passive':
            if (skill.aoe) {
                const aliveMonsters = monsters.filter(m => !m.isDead);
                for (const monster of aliveMonsters) {
                    let damage = calculateSkillDamage(char, monster, skill);
                    monster.hp -= damage;
                    addToLog(`💥 【${skill.name}】对 ${monster.name} 造成 ${damage} 点伤害！`, 'damage');
                    
                    if (monster.hp <= 0) {
                        monster.hp = 0;
                        monster.isDead = true;
                        gameState.totalKills++;
                        char.exp += monster.exp;
                        gameState.gold += monster.gold;
                        addToLog(`击杀 ${monster.name}！获得 ${monster.exp} 经验`, 'loot');
                        generateLoot(monster);
                        checkLevelUp(char);
                    }
                }
            } else {
                const target = monsters.filter(m => !m.isDead)[0];
                if (target) {
                    let damage = calculateSkillDamage(char, target, skill);
                    target.hp -= damage;
                    addToLog(`💥 【${skill.name}】对 ${target.name} 造成 ${damage} 点伤害！`, 'damage');
                    
                    if (target.hp <= 0) {
                        target.hp = 0;
                        target.isDead = true;
                        gameState.totalKills++;
                        char.exp += target.exp;
                        gameState.gold += target.gold;
                        addToLog(`击杀 ${target.name}！获得 ${target.exp} 经验`, 'loot');
                        generateLoot(target);
                        checkLevelUp(char);
                    }
                    
                    if (skill.dot) {
                        applyDOT(target, skill);
                    }
                }
            }
            break;
            
        case 'heal':
            let healAmount = Math.floor(char.maxHp * skill.healMultiplier);
            char.hp = Math.min(char.maxHp, char.hp + healAmount);
            addToLog(`💚 【${skill.name}】恢复了 ${healAmount} 点生命！`, 'heal');
            break;
            
        case 'buff':
            if (!char.buffs) char.buffs = [];
            char.buffs.push({
                name: skill.name,
                effect: skill.effect,
                value: skill.value,
                duration: skill.duration,
                remainingDuration: skill.duration
            });
            addToLog(`🛡️ 【${skill.name}】效果发动：${skill.duration}回合内${getEffectDescription(skill)}`, 'info');
            break;
            
        case 'debuff':
            if (skill.dot && monsters.length > 0) {
                const target = monsters.filter(m => !m.isDead)[0];
                if (target) {
                    applyDOT(target, skill);
                }
            }
            break;
    }
}

function getEffectDescription(skill) {
    switch (skill.effect) {
        case 'damageReduction':
            return `减少${skill.value * 100}%伤害`;
        case 'shield':
            return `吸收${skill.value * 100}%伤害`;
        case 'invisible':
            return '隐身';
        default:
            return skill.description || '';
    }
}

function applyDOT(target, skill) {
    if (!target.dots) target.dots = [];
    
    target.dots.push({
        name: skill.name,
        damage: Math.floor(target.maxHp * skill.damageMultiplier * 0.1),
        duration: skill.duration,
        remainingDuration: skill.duration
    });
    
    addToLog(`☠️ ${target.name} 中了【${skill.name}】！`, 'damage');
}

function calculateSkillDamage(char, monster, skill) {
    const baseDamage = char.attack * skill.damageMultiplier;
    const defense = monster.defense * (monster.dots && monster.dots.length > 0 ? 0.7 : 1);
    const finalDamage = Math.max(1, Math.floor((baseDamage - defense / 2) * (0.9 + Math.random() * 0.2)));
    return finalDamage;
}

function updateBuffs(char) {
    if (!char.buffs) return;
    
    char.buffs = char.buffs.filter(buff => {
        buff.remainingDuration--;
        if (buff.remainingDuration <= 0) {
            addToLog(`⏰ 【${buff.name}】效果结束`, 'info');
            return false;
        }
        return true;
    });
    
    if (!char.dots) char.dots = [];
    
    const deadMonsters = [];
    char.dots.forEach((dot, index) => {
        const monster = gameState.currentMonsters.find(m => m.dots && m.dots.includes(dot));
        if (monster) {
            monster.hp -= dot.damage;
            addToLog(`☠️ 【${dot.name}】对 ${monster.name} 造成 ${dot.damage} 点持续伤害！`, 'damage');
            
            if (monster.hp <= 0) {
                monster.hp = 0;
                monster.isDead = true;
                gameState.totalKills++;
                char.exp += monster.exp;
                gameState.gold += monster.gold;
                addToLog(`击杀 ${monster.name}！获得 ${monster.exp} 经验`, 'loot');
                generateLoot(monster);
                checkLevelUp(char);
            }
        }
        
        dot.remainingDuration--;
        if (dot.remainingDuration <= 0) {
            if (monster) {
                monster.dots = monster.dots.filter(d => d !== dot);
            }
            return false;
        }
        return true;
    });
    
    char.dots = char.dots.filter(d => d.remainingDuration > 0);
    
    Object.keys(gameState.skillCooldowns).forEach(key => {
        if (gameState.skillCooldowns[key] > 0) {
            gameState.skillCooldowns[key]--;
        }
    });
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
    let leveledUp = false;
    while (char.exp >= char.maxExp && char.level < 100) {
        char.exp -= char.maxExp;
        char.level++;
        char.maxExp = gameData.expTable[char.level];
        
        updateCharacterStats(char);
        
        addToLog(`🎉 ${char.name} 升级了！现在是 ${char.level} 级！`, 'levelup');
        leveledUp = true;
    }
    
    if (leveledUp) {
        const skills = getCharacterSkills(char);
        const newSkills = skills.filter(s => s.skillId === char.level);
        
        if (newSkills.length > 0) {
            newSkills.forEach(skill => {
                addToLog(`🌟 ${char.name} 学会了新技能【${skill.name}】！`, 'levelup');
            });
            renderSkills();
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
    if (gameState.speedLevel === 1 && gameState.speedTimeLeft <= 0) {
        addToLog('⚠️ 请先购买加速服务', 'info');
        return;
    }
    
    if (delta > 0) {
        if (gameState.speedLevel >= 10) {
            addToLog('⚠️ 已达到最高速度等级', 'info');
            return;
        }
        
        const currentPrice = speedSettings[gameState.speedLevel].price;
        const nextPrice = speedSettings[gameState.speedLevel + 1].price;
        const priceDiff = nextPrice - currentPrice;
        
        if (gameState.gold < priceDiff) {
            addToLog(`💰 金币不足！升级到 ${gameState.speedLevel + 1}x 需要 ${formatNumber(priceDiff)} 金币，你只有 ${formatNumber(gameState.gold)} 金币`, 'info');
            return;
        }
        
        gameState.gold -= priceDiff;
        gameState.speedLevel += 1;
        gameState.battleSpeed = speedSettings[gameState.speedLevel].delay;
        gameState.speedTimeLeft = 300;
        
        startSpeedTimer();
        updateUI();
        updateSpeedUI();
        
        addToLog(`⚡ 升级到 ${speedSettings[gameState.speedLevel].name} 速度（${speedSettings[gameState.speedLevel].description}）`, 'info');
        addToLog(`💰 消耗 ${formatNumber(priceDiff)} 金币，计时器已重置为5分钟`, 'info');
    } else {
        if (gameState.speedLevel <= 1) {
            addToLog('⚠️ 已达到最低速度', 'info');
            return;
        }
        
        gameState.speedLevel -= 1;
        gameState.battleSpeed = speedSettings[gameState.speedLevel].delay;
        updateSpeedUI();
        addToLog(`⚡ 切换到 ${speedSettings[gameState.speedLevel].name} 速度（${speedSettings[gameState.speedLevel].description}）`, 'info');
    }
}

function purchaseSpeed() {
    if (gameState.speedTimeLeft > 0) {
        const minutes = Math.floor(gameState.speedTimeLeft / 60);
        const seconds = gameState.speedTimeLeft % 60;
        addToLog(`⚠️ 加速服务剩余 ${minutes}分${seconds}秒，请等待到期后再购买`, 'info');
        return;
    }
    
    let optionsText = '请选择要购买的速度等级：\n\n';
    let affordableLevels = [];
    
    for (let level = 2; level <= 10; level++) {
        const price = speedSettings[level].price;
        const canAfford = gameState.gold >= price;
        const status = canAfford ? '✅' : '❌';
        optionsText += `${status} ${level}x - ${formatNumber(price)} 金币 (${speedSettings[level].description})\n`;
        if (canAfford) {
            affordableLevels.push(level);
        }
    }
    optionsText += '\n输入数字 2-10 选择速度等级';
    
    const choice = prompt(optionsText);
    
    if (!choice) return;
    
    const level = parseInt(choice.trim());
    
    if (isNaN(level) || level < 2 || level > 10) {
        addToLog('⚠️ 请输入 2-10 之间的数字', 'info');
        return;
    }
    
    const price = speedSettings[level].price;
    
    if (gameState.gold < price) {
        addToLog(`💰 金币不足！购买 ${level}x 加速需要 ${formatNumber(price)} 金币，你只有 ${formatNumber(gameState.gold)} 金币`, 'info');
        return;
    }
    
    gameState.gold -= price;
    gameState.speedLevel = level;
    gameState.battleSpeed = speedSettings[level].delay;
    gameState.speedTimeLeft = 300;
    
    startSpeedTimer();
    
    updateUI();
    updateSpeedUI();
    
    addToLog(`🎉 购买成功！${level}x 加速（${speedSettings[level].description}）已激活！`, 'levelup');
    addToLog(`⏰ 持续时间: 5分钟`, 'info');
    addToLog(`💰 剩余金币: ${formatNumber(gameState.gold)}`, 'gold');
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
    
    if (hasActiveSpeed) {
        unlockBtn.textContent = `⏰ ${formatTimeLeft(gameState.speedTimeLeft)}`;
        unlockBtn.disabled = true;
        unlockBtn.style.opacity = '0.5';
    } else {
        unlockBtn.textContent = '💰 购买加速';
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
    char.buffs = [];
    char.dots = [];
    
    const oldMapIndex = gameState.currentMapIndex;
    gameState.currentMapIndex = 0;
    
    renderCharacters();
    renderMaps();
    renderSkills();
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
