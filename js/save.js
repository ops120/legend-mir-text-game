const SAVE_VERSION = '1.0';

function saveGame() {
    try {
        const gameStateCopy = JSON.parse(JSON.stringify(gameState));
        
        if (gameState.selectedBackpackSlots instanceof Set) {
            gameStateCopy.selectedBackpackSlotsArray = Array.from(gameState.selectedBackpackSlots);
        }
        delete gameStateCopy.selectedBackpackSlots;
        
        const saveData = {
            version: SAVE_VERSION,
            gameState: gameStateCopy,
            saveTime: Date.now(),
            saveTimestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(saveData);
        localStorage.setItem('legendGameSave', dataStr);
        
        const saveDate = new Date();
        addToLog(`💾 游戏已保存！(${saveDate.toLocaleTimeString()})`, 'info');
        
        const size = (dataStr.length / 1024).toFixed(2);
        if (parseFloat(size) > 500) {
            addToLog('⚠️ 存档较大，建议定期导出备份', 'info');
        }
        
    } catch (error) {
        addToLog('❌ 保存失败！LocalStorage可能已满', 'info');
        console.error('Save error:', error);
        addToLog('💡 建议：导出存档到文件保存', 'info');
    }
}

function loadGame() {
    const saveData = localStorage.getItem('legendGameSave');
    if (saveData) {
        try {
            addToLog('📖 正在读取存档...', 'info');
            const data = JSON.parse(saveData);
            
            if (!data.gameState) {
                addToLog('❌ 存档格式不正确！', 'info');
                return;
            }
            
            gameState = migrateGameState(data.gameState, data.version);
            gameState.characters.forEach(char => updateCharacterStats(char));
            renderCharacters();
            renderMaps();
            renderBackpack();
            updateUI();
            updateSpeedUI();
            addToLog('📂 存档已从浏览器加载！', 'info');
            
            if (data.saveTimestamp) {
                const saveDate = new Date(data.saveTimestamp);
                addToLog(`💾 存档时间: ${saveDate.toLocaleString()}`, 'info');
            }
            
        } catch (e) {
            addToLog('❌ 读取存档失败！可能是损坏的存档。', 'info');
            addToLog('📌 错误: ' + e.message, 'info');
            console.error('Load error:', e);
            addToLog('💡 建议：导出存档到文件备份，然后重置游戏', 'info');
        }
    } else {
        addToLog('⚠️ 没有找到本地存档', 'info');
        addToLog('💡 请使用【导入存档】按钮导入JSON文件', 'info');
    }
}

function migrateGameState(gameState, version) {
    if (!gameState || typeof gameState !== 'object') {
        addToLog('❌ 存档数据无效！', 'info');
        throw new Error('Invalid gameState');
    }
    
    if (!version) {
        addToLog('⚠️ 检测到旧版存档，正在升级...', 'info');
    }
    
    if (version !== SAVE_VERSION) {
        addToLog(`📊 正在迁移存档: ${version || '旧版本'} → ${SAVE_VERSION}`, 'info');
    }
    
    const migratedState = JSON.parse(JSON.stringify(gameState));
    
    if (migratedState.selectedBackpackSlotsArray && Array.isArray(migratedState.selectedBackpackSlotsArray)) {
        migratedState.selectedBackpackSlots = new Set(migratedState.selectedBackpackSlotsArray);
        delete migratedState.selectedBackpackSlotsArray;
    } else if (!migratedState.selectedBackpackSlots || !(migratedState.selectedBackpackSlots instanceof Set)) {
        migratedState.selectedBackpackSlots = new Set();
    }
    
    if (!migratedState.battleSpeed) {
        migratedState.battleSpeed = 1000;
    }
    if (!migratedState.speedLevel) {
        migratedState.speedLevel = 1;
    }
    if (!migratedState.unlockedSpeedLevels || !Array.isArray(migratedState.unlockedSpeedLevels)) {
        migratedState.unlockedSpeedLevels = [1];
    }
    if (typeof migratedState.speedTimeLeft !== 'number') {
        migratedState.speedTimeLeft = 0;
    }
    
    if (!Array.isArray(migratedState.characters)) {
        migratedState.characters = [];
    }
    
    migratedState.characters.forEach(char => {
        if (!char.equipment) {
            char.equipment = {
                weapon: null,
                armor: null,
                helmet: null,
                necklace: null,
                ring1: null,
                ring2: null
            };
        }
        
        if (!Array.isArray(char.skills)) {
            char.skills = [];
        }
        
        if (!Array.isArray(char.buffs)) {
            char.buffs = [];
        }
        
        if (typeof char.isDead === 'undefined') {
            char.isDead = false;
        }
    });
    
    if (!Array.isArray(migratedState.backpack)) {
        migratedState.backpack = [];
    }
    
    if (!Array.isArray(migratedState.battleLog)) {
        migratedState.battleLog = [];
    }
    
    return migratedState;
}

function resetGame() {
    if (confirm('⚠️ 确定要重置游戏吗？\n\n所有数据将永久丢失！\n\n建议：重置前先导出存档备份！')) {
        localStorage.removeItem('legendGameSave');
        initGame();
        addToLog('🔄 游戏已重置！', 'info');
    }
}

function exportSave() {
    addToLog('💾 正在准备导出存档...', 'info');
    
    try {
        const gameStateCopy = JSON.parse(JSON.stringify(gameState));
        
        if (gameStateCopy.selectedBackpackSlots instanceof Set) {
            gameStateCopy.selectedBackpackSlotsArray = Array.from(gameState.selectedBackpackSlots);
        }
        delete gameStateCopy.selectedBackpackSlots;
        
        delete gameStateCopy.battleLog;
        
        const saveData = {
            version: SAVE_VERSION,
            gameState: gameStateCopy,
            exportTime: Date.now(),
            exportTimestamp: new Date().toISOString(),
            gameVersion: document.title,
            exportedBy: '传奇文字游戏版'
        };
        
        const dataStr = JSON.stringify(saveData, null, 2);
        
        if (!dataStr || dataStr === '{}') {
            addToLog('❌ 存档数据为空！', 'info');
            return;
        }
        
        const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const charLevel = gameState.selectedCharacter ? gameState.selectedCharacter.level : 0;
        const charName = gameState.selectedCharacter ? gameState.selectedCharacter.name : 'unknown';
        
        link.href = url;
        link.download = `传奇文字游戏_${charName}_Lv${charLevel}_${timestamp}.json`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        addToLog('✅ 存档导出成功！', 'info');
        addToLog(`📁 文件名: ${link.download}`, 'info');
        addToLog('💡 请妥善保管存档文件，防止丢失！', 'info');
        
        const fileSize = (new Blob([dataStr]).size / 1024).toFixed(2);
        addToLog(`📊 存档大小: ${fileSize} KB`, 'info');
        
    } catch (error) {
        addToLog('❌ 导出存档失败！', 'info');
        addToLog('📌 错误: ' + error.message, 'info');
        console.error('Export error:', error);
    }
}

function importSave(file) {
    if (!file) {
        addToLog('⚠️ 请选择存档文件！', 'info');
        return;
    }
    
    addToLog(`📂 正在读取存档文件: ${file.name}`, 'info');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            addToLog('📖 文件读取完成，正在解析...', 'info');
            
            if (!e.target.result || e.target.result.trim() === '') {
                addToLog('❌ 存档文件为空！', 'info');
                return;
            }
            
            const data = JSON.parse(e.target.result);
            
            if (!data.gameState) {
                addToLog('❌ 存档文件格式不正确：缺少gameState字段！', 'info');
                console.error('Missing gameState:', data);
                return;
            }
            
            const version = data.version || '旧版本';
            const exportTime = data.exportTimestamp ? new Date(data.exportTimestamp).toLocaleString() : '未知';
            
            addToLog(`📋 存档信息:\n  版本: ${version}\n  导出时间: ${exportTime}`, 'info');
            
            if (confirm(`📋 确认导入存档\n\n版本: ${version}\n导出时间: ${exportTime}\n\n是否导入此存档？\n当前游戏数据将被覆盖！`)) {
                
                const migratedState = migrateGameState(data.gameState, data.version);
                
                if (!migratedState.characters || !Array.isArray(migratedState.characters)) {
                    addToLog('❌ 存档数据不完整：缺少角色信息！', 'info');
                    return;
                }
                
                gameState = migratedState;
                
                if (!gameState.selectedBackpackSlots) {
                    gameState.selectedBackpackSlots = new Set();
                }
                
                gameState.characters.forEach(char => {
                    if (char.equipment) {
                        Object.keys(char.equipment).forEach(slot => {
                            if (char.equipment[slot] && !char.equipment[slot].name) {
                                console.warn('Invalid equipment in slot:', slot, char.equipment[slot]);
                            }
                        });
                    }
                    updateCharacterStats(char);
                });
                
                renderCharacters();
                renderMaps();
                renderBackpack();
                updateUI();
                updateSpeedUI();
                
                const gameStateCopy = JSON.parse(JSON.stringify(gameState));
                if (gameStateCopy.selectedBackpackSlots instanceof Set) {
                    gameStateCopy.selectedBackpackSlotsArray = Array.from(gameState.selectedBackpackSlots);
                }
                delete gameStateCopy.selectedBackpackSlots;
                
                const saveToLocal = {
                    version: SAVE_VERSION,
                    gameState: gameStateCopy,
                    saveTime: Date.now()
                };
                localStorage.setItem('legendGameSave', JSON.stringify(saveToLocal));
                
                addToLog('✅ 存档导入成功！', 'info');
                addToLog(`📂 已同步到浏览器LocalStorage`, 'info');
                
                if (data.gameVersion) {
                    addToLog(`📌 存档来源: ${data.gameVersion}`, 'info');
                }
                
            } else {
                addToLog('⚠️ 已取消导入', 'info');
            }
            
        } catch (error) {
            addToLog('❌ 导入存档失败！', 'info');
            addToLog('📌 错误详情：' + error.message, 'info');
            console.error('Import error:', error);
            console.error('File content:', e.target.result);
            
            if (error.message.includes('Unexpected token')) {
                addToLog('💡 提示：文件可能不是有效的JSON格式', 'info');
            } else if (error.message.includes('Unexpected end')) {
                addToLog('💡 提示：文件可能不完整或被截断', 'info');
            }
        }
    };
    
    reader.onerror = function() {
        addToLog('❌ 读取文件失败！浏览器无法读取此文件。', 'info');
    };
    
    reader.readAsText(file);
}

function autoBackup() {
    const saveData = {
        version: SAVE_VERSION,
        gameState: gameState,
        backupTime: Date.now(),
        type: 'auto_backup'
    };
    
    const backups = JSON.parse(localStorage.getItem('legendGameBackups') || '[]');
    backups.push(saveData);
    
    if (backups.length > 5) {
        backups.shift();
    }
    
    localStorage.setItem('legendGameBackups', JSON.stringify(backups));
}

function restoreBackup(backupIndex) {
    const backups = JSON.parse(localStorage.getItem('legendGameBackups') || '[]');
    
    if (backups[backupIndex]) {
        if (confirm('确定要恢复到此备份点吗？当前游戏进度将被覆盖！')) {
            const backup = backups[backupIndex];
            gameState = migrateGameState(backup.gameState, backup.version);
            gameState.characters.forEach(char => updateCharacterStats(char));
            renderCharacters();
            renderMaps();
            renderBackpack();
            updateUI();
            
            saveGame();
            addToLog(`✅ 已恢复到 ${new Date(backup.backupTime).toLocaleString()} 的备份`, 'info');
        }
    }
}

function showBackupList() {
    const backups = JSON.parse(localStorage.getItem('legendGameBackups') || '[]');
    
    if (backups.length === 0) {
        addToLog('⚠️ 没有找到自动备份', 'info');
        return;
    }
    
    addToLog('📋 自动备份列表：', 'info');
    backups.forEach((backup, index) => {
        const time = new Date(backup.backupTime).toLocaleString();
        addToLog(`  ${index + 1}. ${time}`, 'info');
    });
    addToLog('💡 如需恢复，请使用浏览器控制台调用 restoreBackup(index)', 'info');
}
