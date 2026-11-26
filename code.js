let enemyImg;
let playerImg;
let bossImages = [];
let enemies = [];
const enemyRowsAtEdge = new Set();
let effectParticles = [];
let impactRings = [];
let screenShakeFrames = 0;
let screenShakeStrength = 0;
let impactFlash = 0;
let impactFlashColor = [255, 255, 255];
let killCombo = 0;
let comboLastKillFrame = -Infinity;
let comboBannerFrames = 0;
let bossDefeatFrames = 0;
let bullets = [];
let enemyBullets = [];
let enemyBombs = [];
let shields = [];
let backgroundLayer = null;
let backgroundLayerStage = 0;
let simulationAccumulator = 0;
let simulationFrame = 0;
let lastSimulationUpdateAt = null;
let player;
let boss = null;
let bossEntranceFrames = 0;
const playerRecordKey = 'fish-striker-player-record-v1';
const gameSaveKey = 'fish-striker-game-save-v1';
let gameSaveAvailable = false;
let lastGameSaveAt = 0;
let playerRecord = {
    highScore: 0,
    clears: 0,
    upgrades: { rapidFire: 0, movement: 0, beam: 0, repair: 0 },
    rememberedAttack: '',
    achievements: [],
    totalRuns: 0,
    bestStage: 1,
    totalBossesDefeated: 0,
    history: []
};
let runBossAttackHits = {};
let runRecordSaved = false;
let runKills = 0;
let runBossesDefeated = 0;
let runMaxStage = 1;
let achievementsScreen = false;
let recentAchievement = '';
let achievementNoticeFrames = 0;
let achievementQueue = [];
let stars = [];
let enemySpeed = 1.2;
let hardMode = false;
let shotCooldown = 0;
const touchControls = { left: false, right: false, shoot: false, beam: false };
const basePlayerFireInterval = 10;
const rapidFireIntervals = [10, 8, 6, 5];
let playerFireInterval = basePlayerFireInterval;
const basePlayerBulletSpeed = 8;
let playerBulletSpeed = basePlayerBulletSpeed;
const playerInvulnerabilityDuration = 90;
let invulnerabilityFrames = 0;
let displayedFps = 0;
let fpsLastUpdatedAt = 0;
let gameOver = false;
let clear = false;
let titleScreen = true;
let score = 0;
const maxLives = 3;
let lives = maxLives;
let stage = 1;
const maxStage = 6;
let upgradeSelection = false;
const upgradeLevels = { rapidFire: 0, movement: 0, beam: 0 };
const maxUpgradeLevel = 3;
const basePlayerSpeed = 4.2;
const movementSpeedPerUpgrade = 0.3;
const beamDamageBonusPerLevel = 0.25;
const maxBeamCharge = 100;
const chargedBeamLifetime = 26;
const maxBeamBossHitFrames = Math.ceil(chargedBeamLifetime / 2);
const beamChargeThreshold = 85;
const beamChargeRate = 0.6;
const beamChargeDecayRate = 0.15;
const beamMaxChargeRate = 0.12;
const beamSecretChargeDuration = 5000;
const beamNormalDamage = 1.3;
const beamGoldenDamage = 2.2;
const beamPurpleDamage = 2.8;
const playerHitboxWidth = 32;
const playerHitboxHeight = 22;
const simulationStepMs = 1000 / 60;
const bossTelegraphDuration = 54;
const bossHealthBarColors = [[245, 190, 55], [65, 220, 245], [255, 70, 105]];
const beamColorSets = {
    normal: {
        outer: [65, 135, 255],
        middle: [30, 205, 255],
        inner: [185, 250, 255]
    },
    gold: {
        outer: [255, 145, 30],
        middle: [255, 190, 55],
        inner: [255, 235, 145],
        edge: [255, 225, 125]
    },
    purple: {
        outer: [125, 35, 255],
        middle: [195, 75, 255],
        inner: [240, 185, 255],
        edge: [225, 165, 255]
    }
};
const resultAccents = {
    gameOver: [255, 65, 75],
    clear: [90, 255, 195]
};
const resultAccentShadows = {
    gameOver: 'rgba(255, 65, 75, 0.75)',
    clear: 'rgba(90, 255, 195, 0.75)'
};
let beamCharge = 0;
let beamMaxChargeHoldMs = 0;
let beamMaxChargeLastUpdatedAt = null;
let beamCharging = false;
let beamFireCooldown = 0;
let chargedBeams = [];
let beamChargeParticles = [];
let audioCtx = null;
const stageBackgrounds = [[8, 14, 30], [20, 12, 35], [35, 12, 18], [10, 30, 34], [34, 24, 10], [28, 10, 32]];
const stageAccents = stageBackgrounds.map(backgroundColor =>
    backgroundColor.map(channel => Math.min(255, channel * 2 + 100))
);
const modeColors = {
    normal: [105, 220, 185],
    hard: [255, 115, 100]
};
const beamChargeColors = {
    purple: [205, 125, 255],
    max: [255, 165, 55],
    ready: [255, 180, 85],
    charging: [65, 205, 255]
};
const bossProfiles = [
    { name: 'ラビット', size: 104, spreadCount: 7, aimedShots: 3, attackBias: 0.6, patterns: ['spread', 'sweep', 'burst'] },
    { name: 'シャーク', size: 112, spreadCount: 10, aimedShots: 3, attackBias: 1.1, patterns: ['spread', 'double', 'fan'] },
    { name: 'キャノン', size: 118, spreadCount: 9, aimedShots: 4, attackBias: 1.5, patterns: ['aim', 'cross', 'rain'] }
];
const finalBossProfile = {
    name: 'デスキング', size: 140, spreadCount: 12, aimedShots: 4, attackBias: 2.2, patterns: ['aim', 'rain', 'spread', 'burst', 'cross']
};
const bossTelegraphTargetPatterns = new Set(['aim', 'sweep', 'double', 'cross']);
const bossTelegraphPatternLabels = {
    spread: '拡散',
    sweep: '掃射',
    burst: '爆破',
    double: '連弾',
    fan: '扇状',
    aim: '狙撃',
    cross: '十字',
    rain: '雨撃'
};
const achievements = [
    { id: 'first-kill', title: '初撃', description: '敵を1体倒す' },
    { id: 'combo-five', title: '連続撃破', description: '5連続コンボを達成する' },
    { id: 'combo-ten', title: '怒涛の連撃', description: '10連続コンボを達成する' },
    { id: 'combo-twenty', title: '連撃の極み', description: '20連続コンボを達成する' },
    { id: 'high-score', title: '記録更新', description: 'ハイスコアを更新する' },
    { id: 'score-5000', title: '賞金稼ぎ', description: 'スコア5,000点に到達する' },
    { id: 'score-10000', title: '銀河の伝説', description: 'スコア10,000点に到達する' },
    { id: 'score-20000', title: '星雲の覇者', description: 'スコア20,000点に到達する' },
    { id: 'first-boss', title: 'ボス撃破', description: 'ボスを1体倒す' },
    { id: 'three-bosses', title: 'ボスハンター', description: '1回のプレイでボスを3体倒す' },
    { id: 'bosses-ten', title: '深宇宙の狩人', description: '累計でボスを10体倒す' },
    { id: 'hard-boss', title: '強敵突破', description: 'ハードモードでボスを倒す' },
    { id: 'stage-four', title: '中盤突破', description: 'ステージ4に到達する' },
    { id: 'max-upgrade', title: '極限強化', description: 'いずれかの強化を最大にする' },
    { id: 'purple-beam', title: '虚空の砲撃', description: 'パープルビームを発射する' },
    { id: 'perfect-clear', title: '無傷の航海', description: 'ライフを失わず全ステージをクリアする' },
    { id: 'untouched-boss', title: '静寂の勝利', description: 'ボス戦でライフを失わずに倒す', hidden: true },
    { id: 'purple-finisher', title: '星を砕く者', description: '紫ビームでボスにとどめを刺す', hidden: true },
    { id: 'first-clear', title: '銀河の守り手', description: '全6ステージをクリアする' },
    { id: 'hard-clear', title: '限界突破', description: 'ハードモードで全ステージをクリアする' }
];
const stageDifficulty = [
    { enemyRows: 2, enemyColumns: 6, enemySpeed: 0.9, enemyFireInterval: 90, enemyVolley: 1, enemyBulletSpeed: 2.6, bossHealth: 90, bossSpeed: 2.1, bossAttackInterval: 66 },
    { enemyRows: 2, enemyColumns: 8, enemySpeed: 0.98, enemyFireInterval: 84, enemyVolley: 1, enemyBulletSpeed: 2.8, bossHealth: 115, bossSpeed: 2.25, bossAttackInterval: 64 },
    { enemyRows: 3, enemyColumns: 7, enemySpeed: 1.06, enemyFireInterval: 78, enemyVolley: 1, enemyBulletSpeed: 3.0, bossHealth: 145, bossSpeed: 2.4, bossAttackInterval: 62 },
    { enemyRows: 3, enemyColumns: 9, enemySpeed: 1.14, enemyFireInterval: 72, enemyVolley: 1, enemyBulletSpeed: 3.2, bossHealth: 180, bossSpeed: 2.55, bossAttackInterval: 60 },
    { enemyRows: 4, enemyColumns: 8, enemySpeed: 1.23, enemyFireInterval: 66, enemyVolley: 1, enemyBulletSpeed: 3.4, bossHealth: 220, bossSpeed: 2.7, bossAttackInterval: 58 },
    { enemyRows: 4, enemyColumns: 9, enemySpeed: 1.32, enemyFireInterval: 60, enemyVolley: 1, enemyBulletSpeed: 3.6, bossHealth: 265, bossSpeed: 2.85, bossAttackInterval: 56 }
];
const baseShieldPattern = [
    [false, true, true, true, true, true, true, true, false],
    [true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true],
    [true, true, true, false, false, false, true, true, true]
];

function preload() {
    // Load the enemy and player artwork before the game starts.
    enemyImg = loadImage('data/enemy-fish.svg');
    playerImg = loadImage('data/fish.png');
    bossImages = [
        loadImage('data/boss-rabbit.svg'),
        loadImage('data/boss-fish.svg'),
        loadImage('data/boss-cannon.svg'),
        loadImage('data/boss-rusher.svg'),
        loadImage('data/boss-sniper.svg'),
        loadImage('data/boss-king.svg')
    ];
}

function loadPlayerRecord() {
    try {
        const parsed = JSON.parse(localStorage.getItem(playerRecordKey) || '{}');
        const saved = parsed && typeof parsed === 'object' ? parsed : {};
        const upgrades = saved.upgrades || {};
        const knownPatterns = Object.keys(bossTelegraphPatternLabels);
        const knownAchievements = new Set(achievements.map(achievement => achievement.id));
        const history = Array.isArray(saved.history) ? saved.history.filter(entry =>
            entry && typeof entry.date === 'string'
            && Number.isFinite(entry.score)
            && Number.isInteger(entry.stage) && entry.stage >= 1 && entry.stage <= maxStage
            && typeof entry.cleared === 'boolean'
            && typeof entry.hardMode === 'boolean'
            && Number.isInteger(entry.bossesDefeated) && entry.bossesDefeated >= 0
        ).slice(0, 5) : [];
        return {
            highScore: Number.isFinite(saved.highScore) ? max(0, saved.highScore) : 0,
            clears: Number.isFinite(saved.clears) ? max(0, saved.clears) : 0,
            upgrades: {
                rapidFire: Number.isFinite(upgrades.rapidFire) ? max(0, upgrades.rapidFire) : 0,
                movement: Number.isFinite(upgrades.movement) ? max(0, upgrades.movement) : 0,
                beam: Number.isFinite(upgrades.beam) ? max(0, upgrades.beam) : 0,
                repair: Number.isFinite(upgrades.repair) ? max(0, upgrades.repair) : 0
            },
            rememberedAttack: knownPatterns.includes(saved.rememberedAttack) ? saved.rememberedAttack : '',
            achievements: Array.isArray(saved.achievements)
                ? [...new Set(saved.achievements.filter(id => knownAchievements.has(id)))] : [],
            totalRuns: Number.isInteger(saved.totalRuns) ? max(0, saved.totalRuns) : 0,
            bestStage: Number.isInteger(saved.bestStage) ? constrain(saved.bestStage, 1, maxStage) : 1,
            totalBossesDefeated: Number.isInteger(saved.totalBossesDefeated)
                ? max(0, saved.totalBossesDefeated) : 0,
            history
        };
    } catch (error) {
        console.error('Failed to load saved record.', error);
        return {
            highScore: 0,
            clears: 0,
            upgrades: { rapidFire: 0, movement: 0, beam: 0, repair: 0 },
            rememberedAttack: '',
            achievements: [],
            totalRuns: 0,
            bestStage: 1,
            totalBossesDefeated: 0,
            history: []
        };
    }
}

function savePlayerRecord() {
    try {
        localStorage.setItem(playerRecordKey, JSON.stringify(playerRecord));
    } catch (error) {
        console.error('Failed to save record.', error);
    }
}

function unlockAchievement(id) {
    if (!achievements.some(achievement => achievement.id === id)
        || playerRecord.achievements.includes(id)) return;
    playerRecord.achievements.push(id);
    achievementQueue.push(id);
    savePlayerRecord();
    startNextAchievementNotice();
}

function startNextAchievementNotice() {
    if (achievementNoticeFrames > 0 || achievementQueue.length === 0) return;
    recentAchievement = achievementQueue.shift();
    achievementNoticeFrames = 210;
    playTone(523.25, 0.16, 0.035, 'sine');
    window.setTimeout(() => playTone(783.99, 0.18, 0.035, 'sine'), 90);
    window.setTimeout(() => playTone(1046.5, 0.28, 0.04, 'triangle'), 180);
    const noticePosition = getAchievementNoticePosition();
    spawnImpactRing(noticePosition.x, noticePosition.y, [110, 225, 255], 76, 30);
    spawnImpactRing(noticePosition.x, noticePosition.y, [255, 215, 125], 48, 24);
    spawnEffectBurst(noticePosition.x, noticePosition.y,
        [[255, 225, 150], [110, 225, 255], [255, 255, 255]], 28, 3.8);
}

function getAchievementNoticePosition() {
    const toastWidth = min(width - 24, 320);
    return { x: toastWidth / 2 + 14, y: 150 };
}

function loadGameSave() {
    try {
        const saved = JSON.parse(localStorage.getItem(gameSaveKey) || 'null');
        if (!saved || saved.version !== 1
            || !Number.isInteger(saved.stage) || saved.stage < 1 || saved.stage > maxStage
            || !Number.isFinite(saved.score) || !Number.isFinite(saved.lives)
            || !Array.isArray(saved.enemies) || !Array.isArray(saved.bullets)
            || !Array.isArray(saved.enemyBullets) || !Array.isArray(saved.shields)) {
            return null;
        }
        return saved;
    } catch (error) {
        console.error('Failed to load save data.', error);
        return null;
    }
}

function clearGameSave() {
    gameSaveAvailable = false;
    try {
        localStorage.removeItem(gameSaveKey);
    } catch (error) {
        console.error('Failed to clear save data.', error);
    }
}

function saveGameState(force = false) {
    if (titleScreen || gameOver || clear) return false;
    const now = millis();
    if (!force && now - lastGameSaveAt < 1000) return gameSaveAvailable;

    const state = {
        version: 1,
        stage, score, lives, hardMode, upgradeSelection,
        upgradeLevels: { ...upgradeLevels },
        player: { x: player.x, speed: player.speed },
        enemies, bullets, enemyBullets, enemyBombs, shields,
        boss,
        chargedBeams, beamChargeParticles,
        beamCharge, beamMaxChargeHoldMs, beamCharging, beamFireCooldown,
        shotCooldown, invulnerabilityFrames, simulationFrame,
        killCombo, comboLastKillFrame, comboBannerFrames,
        runBossAttackHits, runKills, runBossesDefeated, runMaxStage
    };

    try {
        localStorage.setItem(gameSaveKey, JSON.stringify(state));
        gameSaveAvailable = true;
        lastGameSaveAt = now;
        return true;
    } catch (error) {
        console.error('Failed to save game state.', error);
        return false;
    }
}

function handleManualSave() {
    const saveButton = document.querySelector('[data-game-save]');
    if (!saveButton) return;

    let message;
    if (titleScreen || gameOver || clear) {
        message = 'プレイ中に保存できます';
    } else {
        message = saveGameState(true) ? '保存しました' : '保存に失敗しました';
    }

    saveButton.textContent = message;
    saveButton.setAttribute('aria-label', message);
    window.setTimeout(() => {
        saveButton.textContent = 'セーブ';
        saveButton.setAttribute('aria-label', 'ゲームをセーブ');
    }, 1800);
}

function resumeSavedGame() {
    const saved = loadGameSave();
    if (!saved) {
        gameSaveAvailable = false;
        return false;
    }

    stage = saved.stage;
    score = saved.score;
    lives = constrain(floor(saved.lives), 1, maxLives);
    hardMode = Boolean(saved.hardMode);
    upgradeSelection = Boolean(saved.upgradeSelection);
    for (const key of Object.keys(upgradeLevels)) {
        const level = saved.upgradeLevels && saved.upgradeLevels[key];
        upgradeLevels[key] = Number.isInteger(level) ? constrain(level, 0, maxUpgradeLevel) : 0;
    }
    player.x = Number.isFinite(saved.player && saved.player.x)
        ? constrain(saved.player.x, 35, width - 35) : width / 2;
    player.speed = Number.isFinite(saved.player && saved.player.speed)
        ? constrain(saved.player.speed, basePlayerSpeed, basePlayerSpeed + maxUpgradeLevel * movementSpeedPerUpgrade)
        : basePlayerSpeed + upgradeLevels.movement * movementSpeedPerUpgrade;
    enemies = saved.enemies;
    bullets = saved.bullets;
    enemyBullets = saved.enemyBullets;
    enemyBombs = Array.isArray(saved.enemyBombs) ? saved.enemyBombs : [];
    shields = saved.shields;
    boss = saved.boss && typeof saved.boss === 'object' ? saved.boss : null;
    if (boss) {
        if (typeof boss.playerHitThisFight !== 'boolean') boss.playerHitThisFight = true;
        if (typeof boss.lastHitByPurpleBeam !== 'boolean') boss.lastHitByPurpleBeam = false;
    }
    chargedBeams = Array.isArray(saved.chargedBeams) ? saved.chargedBeams : [];
    beamChargeParticles = Array.isArray(saved.beamChargeParticles) ? saved.beamChargeParticles : [];
    beamCharge = Number.isFinite(saved.beamCharge) ? constrain(saved.beamCharge, 0, maxBeamCharge) : 0;
    beamMaxChargeHoldMs = Number.isFinite(saved.beamMaxChargeHoldMs)
        ? constrain(saved.beamMaxChargeHoldMs, 0, beamSecretChargeDuration) : 0;
    beamCharging = false;
    beamFireCooldown = Number.isFinite(saved.beamFireCooldown) ? max(0, saved.beamFireCooldown) : 0;
    shotCooldown = Number.isFinite(saved.shotCooldown) ? max(0, saved.shotCooldown) : 0;
    invulnerabilityFrames = Number.isFinite(saved.invulnerabilityFrames)
        ? max(0, saved.invulnerabilityFrames) : 0;
    simulationFrame = Number.isInteger(saved.simulationFrame) ? max(0, saved.simulationFrame) : 0;
    killCombo = Number.isInteger(saved.killCombo) ? max(0, saved.killCombo) : 0;
    comboLastKillFrame = Number.isFinite(saved.comboLastKillFrame) ? saved.comboLastKillFrame : -Infinity;
    comboBannerFrames = Number.isFinite(saved.comboBannerFrames) ? max(0, saved.comboBannerFrames) : 0;
    runBossAttackHits = saved.runBossAttackHits && typeof saved.runBossAttackHits === 'object'
        ? saved.runBossAttackHits : {};
    runKills = Number.isInteger(saved.runKills) ? max(0, saved.runKills) : 0;
    runBossesDefeated = Number.isInteger(saved.runBossesDefeated) ? max(0, saved.runBossesDefeated) : 0;
    runMaxStage = Number.isInteger(saved.runMaxStage) ? constrain(saved.runMaxStage, 1, maxStage) : stage;
    enemySpeed = stageDifficulty[stage - 1].enemySpeed * (hardMode ? 1.4 : 1);
    playerFireInterval = getRapidFireInterval(upgradeLevels.rapidFire);
    playerBulletSpeed = basePlayerBulletSpeed + upgradeLevels.rapidFire * 2;
    simulationAccumulator = 0;
    lastSimulationUpdateAt = millis();
    titleScreen = false;
    gameOver = false;
    clear = false;
    runRecordSaved = false;
    bossEntranceFrames = 0;
    effectParticles = [];
    impactRings = [];
    screenShakeFrames = 0;
    screenShakeStrength = 0;
    impactFlash = 0;
    return true;
}

function recordBossAttackHit(pattern) {
    if (!pattern || !Object.prototype.hasOwnProperty.call(bossTelegraphPatternLabels, pattern)) return;
    runBossAttackHits[pattern] = (runBossAttackHits[pattern] || 0) + 1;
    let mostHitPattern = '';
    let highestHitCount = 0;
    for (const [hitPattern, hitCount] of Object.entries(runBossAttackHits)) {
        if (hitCount > highestHitCount) {
            mostHitPattern = hitPattern;
            highestHitCount = hitCount;
        }
    }
    playerRecord.rememberedAttack = mostHitPattern;
    savePlayerRecord();
}

function finalizeRun(cleared) {
    if (runRecordSaved) return;
    runRecordSaved = true;
    const newHighScore = score > playerRecord.highScore;
    playerRecord.highScore = max(playerRecord.highScore, score);
    if (cleared) playerRecord.clears++;
    const recordedStage = cleared ? maxStage : constrain(runMaxStage, 1, maxStage);
    playerRecord.totalRuns++;
    playerRecord.bestStage = max(playerRecord.bestStage, recordedStage);
    playerRecord.totalBossesDefeated += runBossesDefeated;
    if (playerRecord.totalBossesDefeated >= 10) unlockAchievement('bosses-ten');
    playerRecord.history.unshift({
        date: new Date().toISOString(),
        score,
        stage: recordedStage,
        cleared,
        hardMode,
        bossesDefeated: runBossesDefeated
    });
    playerRecord.history = playerRecord.history.slice(0, 5);
    if (cleared) unlockAchievement('first-clear');
    if (cleared && hardMode) unlockAchievement('hard-clear');
    if (cleared && lives === maxLives) unlockAchievement('perfect-clear');

    let mostHitPattern = '';
    let highestHitCount = 0;
    for (const [pattern, hitCount] of Object.entries(runBossAttackHits)) {
        if (hitCount > highestHitCount) {
            mostHitPattern = pattern;
            highestHitCount = hitCount;
        }
    }
    if (mostHitPattern) {
        playerRecord.rememberedAttack = mostHitPattern;
    }
    if (newHighScore) unlockAchievement('high-score');
    savePlayerRecord();
    clearGameSave();
}

function getFavoriteUpgrade() {
    const upgradeNames = {
        rapidFire: '射撃強化',
        movement: '移動強化',
        beam: 'ビーム強化',
        repair: '回復'
    };
    let favorite = '';
    for (const key of Object.keys(upgradeNames)) {
        if (!favorite || playerRecord.upgrades[key] > playerRecord.upgrades[favorite]) {
            favorite = key;
        }
    }
    return playerRecord.upgrades[favorite] > 0 ? upgradeNames[favorite] : '未強化';
}

function addScore(points) {
    score += points;
    if (score >= 5000) unlockAchievement('score-5000');
    if (score >= 10000) unlockAchievement('score-10000');
    if (score >= 20000) unlockAchievement('score-20000');
    if (score > playerRecord.highScore) {
        playerRecord.highScore = score;
        savePlayerRecord();
        unlockAchievement('high-score');
    }
}

// Keep the start state clean so local saves and score records are initialized consistently.
function setup() {
    pixelDensity(Math.min(2, displayDensity()));
    createCanvas(700, 760);
    playerRecord = loadPlayerRecord();
    gameSaveAvailable = loadGameSave() !== null;
    bindTouchControls();
    const touchControlPanel = document.querySelector('.touch-controls');
    if (touchControlPanel) {
        document.body.appendChild(touchControlPanel);
    }
    const saveButton = document.querySelector('[data-game-save]');
    if (saveButton) {
        document.body.appendChild(saveButton);
    }
    const controls = document.querySelector('.controls');
    if (controls) {
        document.body.appendChild(controls);
    }
    frameRate(60);
    imageMode(CENTER);
    rectMode(CENTER);
    textFont('monospace');

    player = {
        x: width / 2,
        y: height - 55,
        size: 42,
        speed: basePlayerSpeed
    };

    initShields();

    for (let i = 0; i < 130; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            size: random(1, 3),
            alpha: random(100, 255)
        });
    }

    initEnemies();
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    // Reloads restore the run; fresh visits keep the continue/new-game choice.
    if (gameSaveAvailable && navigationEntry && navigationEntry.type === 'reload') {
        resumeSavedGame();
    }
}

function getRapidFireInterval(level) {
    return rapidFireIntervals[constrain(level, 0, maxUpgradeLevel)];
}

function bindTouchControls() {
    const buttons = document.querySelectorAll('[data-game-control]');
    const activePointers = new Map();
    const saveButton = document.querySelector('[data-game-save]');
    if (saveButton) saveButton.addEventListener('click', handleManualSave);
    window.addEventListener('keydown', event => {
        if (event.code === 'Space' || event.key === ' '
            || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            event.preventDefault();
        }
    }, { capture: true, passive: false });
    const resetTouchControls = () => {
        for (const control of Object.keys(touchControls)) {
            touchControls[control] = false;
        }
        activePointers.clear();
        buttons.forEach(button => button.classList.remove('is-pressed'));
    };
    const releasePointer = event => {
        const control = activePointers.get(event.pointerId);
        if (!control) {
            return;
        }

        activePointers.delete(event.pointerId);
        touchControls[control] = [...activePointers.values()].includes(control);
        document.querySelector(`[data-game-control="${control}"]`)
            ?.classList.toggle('is-pressed', touchControls[control]);
    };

    buttons.forEach(button => {
        const control = button.dataset.gameControl;
        if (!Object.prototype.hasOwnProperty.call(touchControls, control)) {
            return;
        }

        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            activePointers.set(event.pointerId, control);
            touchControls[control] = true;
            button.classList.add('is-pressed');
        });
    });

    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', resetTouchControls);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            resetTouchControls();
            saveGameState(true);
        }
    });
    document.addEventListener('freeze', () => saveGameState(true));
    window.addEventListener('pagehide', () => saveGameState(true));
}

function initEnemies() {
    const difficulty = stageDifficulty[stage - 1] || stageDifficulty[0];
    enemies = [];
    let rows = difficulty.enemyRows;
    let cols = difficulty.enemyColumns;
    let spacing = 64;
    let startX = (width - (cols - 1) * spacing) / 2;
    enemySpeed = difficulty.enemySpeed * (hardMode ? 1.4 : 1);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            enemies.push({
                x: startX + x * spacing,
                y: 110 + y * 52,
                baseY: 110 + y * 52,
                dropY: 0,
                targetDropY: 0,
                bobPhase: y * 1.1 + x * 0.28,
                size: 34,
                alive: true,
                row: y,
                direction: y % 2 === 0 ? 1 : -1,
                velocityX: (y % 2 === 0 ? 1 : -1) * enemySpeed,
                speed: enemySpeed
            });
        }
    }
}

function createShieldPattern() {
    return baseShieldPattern.map(row => row.slice());
}

function initShields() {
    // Slightly stagger the enemy rows to create a cleaner wave pattern.
    shields = [];
    let shieldCount = 3;
    for (let i = 0; i < shieldCount; i++) {
        shields.push({
            x: 140 + i * 210,
            y: height - 120,
            cells: createShieldPattern(),
            cellSize: 8,
            width: 72,
            height: 32
        });
    }
}

function draw() {
    drawBackground();
    const now = millis();
    const elapsed = lastSimulationUpdateAt === null
        ? 0
        : min(max(0, now - lastSimulationUpdateAt), 100);
    lastSimulationUpdateAt = now;

    if (titleScreen) {
        decayScreenShake();
        if (achievementsScreen) {
            drawAchievementsScreen();
        } else {
            drawTitleScreen();
        }
        drawEffects();
        drawImpactFlash();
        drawCombatBanner();
        drawAchievementNotice();
        return;
    }

    if (gameOver) {
        decayScreenShake();
        drawResult('GAME OVER');
        drawEffects();
        drawImpactFlash();
        drawCombatBanner();
        drawAchievementNotice();
        return;
    }

    if (clear) {
        decayScreenShake();
        drawResult('CLEAR!');
        drawEffects();
        drawImpactFlash();
        drawCombatBanner();
        drawAchievementNotice();
        return;
    }

    if (upgradeSelection) {
        decayScreenShake();
        drawUpgradeSelection();
        drawEffects();
        drawImpactFlash();
        drawCombatBanner();
        drawAchievementNotice();
        return;
    }

    simulationAccumulator += elapsed;
    while (simulationAccumulator >= simulationStepMs) {
        simulationAccumulator -= simulationStepMs;
        simulationFrame++;
        updateGame();
        if (gameOver || clear || upgradeSelection) break;
    }
    saveGameState();

    push();
    if (screenShakeFrames > 0) {
        translate(random(-screenShakeStrength, screenShakeStrength),
            random(-screenShakeStrength, screenShakeStrength));
    }
    decayScreenShake();
    drawEnemies();
    drawBoss();
    drawBossTelegraph();
    drawBullets();
    drawEnemyBullets();
    drawEnemyBombs();
    drawChargedBeams();
    drawShields();
    drawPlayer();
    drawBeamChargeEffects();
    drawEffects();
    pop();
    drawHud();
    drawImpactFlash();
    drawCombatBanner();
    drawAchievementNotice();
}

function spawnEffectBurst(x, y, colors, count, speed) {
    const available = 80 - effectParticles.length;
    for (let i = 0; i < min(count, available); i++) {
        const angle = random(TWO_PI);
        const velocity = random(speed * 0.35, speed);
        effectParticles.push({
            x,
            y,
            vx: cos(angle) * velocity,
            vy: sin(angle) * velocity,
            size: random(2, 5),
            life: random(18, 34),
            maxLife: 34,
            color: random(colors)
        });
    }
}

function spawnFireworks(x, y) {
    for (let burst = 0; burst < 4; burst++) {
        const angle = burst * TWO_PI / 4 + random(-0.2, 0.2);
        const distance = random(48, 105);
        const colors = [[255, 205, 75], [255, 100, 125], [95, 220, 255], [210, 135, 255]];
        spawnEffectBurst(x + cos(angle) * distance, y + sin(angle) * distance,
            colors, 16, random(3.5, 6));
    }
}

function registerEnemyDefeat(x, y, points) {
    addScore(points);
    killCombo = simulationFrame - comboLastKillFrame <= 90 ? killCombo + 1 : 1;
    comboLastKillFrame = simulationFrame;
    runKills++;
    if (runKills === 1) unlockAchievement('first-kill');
    if (killCombo >= 5) unlockAchievement('combo-five');
    if (killCombo >= 10) unlockAchievement('combo-ten');
    if (killCombo >= 20) unlockAchievement('combo-twenty');
    if (killCombo >= 2) {
        comboBannerFrames = 54;
        if (killCombo % 5 === 0) {
            spawnImpactRing(x, y, [255, 205, 80], 100, 25);
            triggerImpact(4, 28, [255, 180, 90]);
            spawnFireworks(x, y);
        }
    }
}

function drawCombatBanner() {
    if (comboBannerFrames > 0) {
        const progress = comboBannerFrames / 54;
        const pulse = 0.5 + sin(frameCount * 0.45) * 0.5;
        push();
        rectMode(CENTER);
        drawingContext.shadowBlur = 18 + pulse * 18;
        drawingContext.shadowColor = 'rgba(255, 165, 55, 0.9)';
        noStroke();
        fill(18, 12, 24, 210 * progress);
        rect(width / 2, 126, 212, 38, 10);
        drawingContext.shadowBlur = 0;
        noFill();
        stroke(255, 190, 85, 220 * progress);
        strokeWeight(1.5);
        rect(width / 2, 126, 212, 38, 10);
        noStroke();
        fill(255, 225, 155, 255 * progress);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(18 + pulse * 3);
        text(`${killCombo} HIT COMBO!`, width / 2, 126);
        textStyle(NORMAL);
        pop();
        comboBannerFrames--;
    }

    if (bossDefeatFrames > 0) {
        const progress = bossDefeatFrames / 100;
        const pulse = 0.5 + sin(frameCount * 0.35) * 0.5;
        push();
        drawingContext.shadowBlur = 24 + pulse * 24;
        drawingContext.shadowColor = 'rgba(255, 185, 70, 0.95)';
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(38 + pulse * 8);
        fill(255, 235, 165, 255 * progress);
        text('BOSS DEFEATED!', width / 2, height * 0.43);
        drawingContext.shadowBlur = 0;
        stroke(255, 245, 205, 200 * progress);
        strokeWeight(2);
        line(width / 2 - 160 * progress, height * 0.43 + 34,
            width / 2 + 160 * progress, height * 0.43 + 34);
        pop();
        bossDefeatFrames--;
    }
}

function spawnImpactRing(x, y, color, maxRadius, life = 24) {
    if (impactRings.length >= 12) {
        impactRings.shift();
    }
    impactRings.push({ x, y, color, maxRadius, life, maxLife: life });
}

function triggerImpact(shake, flash, color) {
    screenShakeFrames = max(screenShakeFrames, shake);
    screenShakeStrength = max(screenShakeStrength, shake);
    impactFlash = max(impactFlash, flash);
    impactFlashColor = color;
}

function decayScreenShake() {
    if (screenShakeFrames > 0) {
        screenShakeFrames--;
        screenShakeStrength *= 0.88;
    }
}

function drawEffects() {
    if (impactRings.length === 0 && effectParticles.length === 0) return;

    for (let i = impactRings.length - 1; i >= 0; i--) {
        const ring = impactRings[i];
        const progress = 1 - ring.life / ring.maxLife;
        const alpha = 220 * (1 - progress);
        noFill();
        stroke(ring.color[0], ring.color[1], ring.color[2], alpha);
        strokeWeight(max(1, 5 * (1 - progress)));
        ellipse(ring.x, ring.y, ring.maxRadius * progress);
        ring.life--;
        if (ring.life <= 0) {
            impactRings.splice(i, 1);
        }
    }

    noStroke();
    for (let i = effectParticles.length - 1; i >= 0; i--) {
        const particle = effectParticles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.97;
        particle.vy = particle.vy * 0.97 + 0.035;
        particle.life--;
        if (particle.life <= 0) {
            effectParticles[i] = effectParticles[effectParticles.length - 1];
            effectParticles.pop();
            continue;
        }

        const alpha = 255 * particle.life / particle.maxLife;
        const size = particle.size * particle.life / particle.maxLife;
        fill(particle.color[0], particle.color[1], particle.color[2], alpha);
        ellipse(particle.x, particle.y, size * 1.6);
    }
    drawingContext.shadowBlur = 0;
}

function drawImpactFlash() {
    if (impactFlash <= 0) return;
    push();
    rectMode(CORNER);
    noStroke();
    fill(impactFlashColor[0], impactFlashColor[1], impactFlashColor[2], impactFlash);
    rect(0, 0, width, height);
    pop();
    impactFlash *= 0.72;
    if (impactFlash < 2) impactFlash = 0;
}

function updateGame() {
    if (invulnerabilityFrames > 0) {
        invulnerabilityFrames--;
    }

    if (keyIsDown(LEFT_ARROW) || touchControls.left) {
        player.x -= player.speed * (beamCharging ? 0.55 : 1);
    }
    if (keyIsDown(RIGHT_ARROW) || touchControls.right) {
        player.x += player.speed * (beamCharging ? 0.55 : 1);
    }
    player.x = constrain(player.x, 35, width - 35);

    if (shotCooldown > 0) {
        shotCooldown--;
    }
    if (beamFireCooldown > 0) {
        beamFireCooldown--;
    }
    updateBeamCharge();
    if ((keyIsDown(32) || keyIsDown(90) || touchControls.shoot) && shotCooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 20, speed: playerBulletSpeed });
        shotCooldown = playerFireInterval;
        playTone(880, 0.05, 0.03, 'square');
    }

    updateEnemies();
    updateBullets();
    updateEnemyBullets();
    updateEnemyBombs();
    updateBoss();
    checkCollisions();
}

function updateEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        const rowPhase = enemy.row * 0.7;
        const speedPulse = 1 + sin(simulationFrame * 0.012 + rowPhase) * 0.1;
        const targetVelocityX = enemy.direction * enemy.speed * speedPulse;
        const velocityX = Number.isFinite(enemy.velocityX) ? enemy.velocityX : targetVelocityX;
        enemy.velocityX = velocityX + (targetVelocityX - velocityX) * 0.12;
        enemy.x = constrain(enemy.x + enemy.velocityX, 35, width - 35);

        const targetDropY = Number.isFinite(enemy.targetDropY) ? enemy.targetDropY : enemy.dropY;
        enemy.dropY += (targetDropY - enemy.dropY) * 0.12;
        const bobPhase = Number.isFinite(enemy.bobPhase) ? enemy.bobPhase : enemy.row * 1.1;
        enemy.y = enemy.baseY + enemy.dropY + sin(simulationFrame * 0.035 + bobPhase) * 3.5;
    }

    enemyRowsAtEdge.clear();
    for (let enemy of enemies) {
        const atEdge = enemy.direction > 0
            ? enemy.x >= width - 55
            : enemy.x <= 55;
        if (enemy.alive && atEdge) {
            enemyRowsAtEdge.add(enemy.row);
        }
    }

    if (enemyRowsAtEdge.size > 0) {
        for (let enemy of enemies) {
            if (enemy.alive && enemyRowsAtEdge.has(enemy.row)) {
                enemy.direction *= -1;
                const earlyDropBoost = stage === 1 ? 5 : 0;
                const targetDropY = Number.isFinite(enemy.targetDropY) ? enemy.targetDropY : enemy.dropY;
                enemy.targetDropY = targetDropY + (hardMode ? 14 : 10) + earlyDropBoost;
            }
        }
    }

    for (let enemy of enemies) {
        if (enemy.alive && enemy.y > height - 90) {
            loseLife();
            if (!gameOver) {
                initEnemies();
                initShields();
            }
            return;
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemyBullets() {
    const difficulty = stageDifficulty[stage - 1] || stageDifficulty[0];
    const bulletInterval = max(42, difficulty.enemyFireInterval - (hardMode ? 10 : 0));
    if (simulationFrame % bulletInterval === 0) {
        let aliveEnemies = enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length > 0) {
            const bulletsPerVolley = difficulty.enemyVolley + (hardMode ? 1 : 0);
            for (let shot = 0; shot < bulletsPerVolley; shot++) {
                let shooter = aliveEnemies[Math.floor(random(aliveEnemies.length))];
                enemyBullets.push({
                    x: shooter.x,
                    y: shooter.y + 8,
                    speed: difficulty.enemyBulletSpeed + (hardMode ? 0.6 : 0),
                    vx: 0
                });
            }
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].x += enemyBullets[i].vx;
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > height || enemyBullets[i].x < 0 || enemyBullets[i].x > width) {
            enemyBullets.splice(i, 1);
        }
    }
}

function updateEnemyBombs() {
    // Enemy bullets are treated as a separate group so they can be updated and drawn cleanly.
    if (!hardMode) {
        enemyBombs = [];
        return;
    }

    const bombInterval = max(120, 170 - stage * 7);
    if (simulationFrame % bombInterval === 0) {
        let aliveEnemies = enemies.filter(enemy => enemy.alive && abs(enemy.x - player.x) <= enemy.size / 2);
        if (aliveEnemies.length > 0) {
            let shooter = aliveEnemies[Math.floor(random(aliveEnemies.length))];
            enemyBombs.push({
                x: shooter.x,
                y: shooter.y + 8,
                speed: 2.4 + stage * 0.08,
                vx: 0
            });
        }
    }

    for (let i = enemyBombs.length - 1; i >= 0; i--) {
        enemyBombs[i].x += enemyBombs[i].vx;
        enemyBombs[i].y += enemyBombs[i].speed;
        if (enemyBombs[i].y > height || enemyBombs[i].x < 0 || enemyBombs[i].x > width) {
            enemyBombs.splice(i, 1);
        }
    }
}

function spawnBossBullet(angle, speed, x = boss.x, y = boss.y + 28) {
    enemyBullets.push({
        x,
        y,
        vx: cos(angle) * speed,
        speed: sin(angle) * speed,
        attackPattern: boss.currentAttackPattern
    });
}

function updateBoss() {
    if (!boss) return;

    boss.x += boss.direction * boss.speed;
    if (boss.x < 90 || boss.x > width - 90) {
        boss.direction *= -1;
    }
    boss.y = 185 + sin(simulationFrame * 0.04) * 12;

    const profile = boss.profile || bossProfiles[(stage - 1) % bossProfiles.length];
    const difficulty = stageDifficulty[stage - 1] || stageDifficulty[0];
    const attackInterval = max(24, difficulty.bossAttackInterval - (hardMode ? 8 : 0));
    if (!boss.telegraph) {
        boss.attackTimer = (boss.attackTimer || 0) + 1;
        if (boss.attackTimer >= attackInterval) {
            boss.attackTimer = 0;
            const rememberedPattern = boss.rememberedPattern;
            const pattern = rememberedPattern && !boss.usedRememberedPattern
                && profile.patterns.includes(rememberedPattern)
                ? rememberedPattern
                : profile.patterns[boss.attackPattern % profile.patterns.length];
            if (pattern === rememberedPattern) {
                boss.usedRememberedPattern = true;
            }
            boss.telegraph = {
                pattern,
                timer: bossTelegraphDuration,
                targetX: player.x,
                targetY: player.y
            };
        }
    }

    if (boss.telegraph) {
        boss.telegraph.timer--;
        if (boss.telegraph.timer > 0) return;
        const { pattern, targetX, targetY } = boss.telegraph;
        boss.telegraph = null;
        boss.currentAttackPattern = pattern;
        const angle = atan2(targetY - boss.y, targetX - boss.x);

        if (pattern === 'spread') {
            const spreadCount = min(13, profile.spreadCount + floor((stage - 1) / 2) * 2);
            const spreadStart = -(spreadCount - 1) / 2;
            for (let shot = 0; shot < spreadCount; shot++) {
                enemyBullets.push({
                    x: boss.x,
                    y: boss.y + 28,
                    speed: (hardMode ? 4.8 : 4.1) + profile.attackBias + stage * 0.16,
                    vx: (spreadStart + shot) * (0.7 + stage * 0.05),
                    attackPattern: pattern
                });
            }
        } else if (pattern === 'sweep') {
            const sweepCount = min(9, 5 + floor((stage - 1) / 2));
            for (let shot = 0; shot < sweepCount; shot++) {
                const sweepAngle = angle + (shot - (sweepCount - 1) / 2) * 0.28;
                spawnBossBullet(sweepAngle, (hardMode ? 5.0 : 4.3) + profile.attackBias + stage * 0.2);
            }
        } else if (pattern === 'burst') {
            const burstCount = min(15, profile.spreadCount + 2 + floor((stage - 1) / 2));
            for (let shot = 0; shot < burstCount; shot++) {
                const burstAngle = (TWO_PI / burstCount) * shot + simulationFrame * 0.04;
                spawnBossBullet(burstAngle, (hardMode ? 5.3 : 4.6) + profile.attackBias + stage * 0.18);
            }
        } else if (pattern === 'double') {
            const doubleCount = min(10, profile.spreadCount + 1);
            for (let shot = 0; shot < doubleCount; shot++) {
                const offset = (shot - (doubleCount - 1) / 2) * 0.5;
                spawnBossBullet(angle + offset, (hardMode ? 5.1 : 4.4) + profile.attackBias + stage * 0.15, boss.x + offset * 18);
            }
            if (stage >= 2) {
                spawnBossBullet(HALF_PI, (hardMode ? 5.8 : 5.1) + profile.attackBias + stage * 0.12);
            }
        } else if (pattern === 'fan') {
            const fanCount = min(11, profile.spreadCount + 1);
            for (let shot = 0; shot < fanCount; shot++) {
                const fanAngle = HALF_PI - 0.9 + (shot / (fanCount - 1)) * 1.8;
                spawnBossBullet(fanAngle, (hardMode ? 5.0 : 4.3) + profile.attackBias + stage * 0.16);
            }
        } else if (pattern === 'aim') {
            const aimedShots = min(5, profile.aimedShots + floor((stage - 1) / 3)) + (hardMode ? 2 : 0);
            for (let shot = 0; shot < aimedShots; shot++) {
                const aimOffset = (shot - (aimedShots - 1) / 2) * 0.16;
                spawnBossBullet(angle + aimOffset, (hardMode ? 5.7 : 4.9) + profile.attackBias + stage * 0.16);
            }
        } else if (pattern === 'cross') {
            for (let shot = -2; shot <= 2; shot++) {
                const bulletX = boss.x + shot * 22;
                const crossAngle = atan2(targetY - (boss.y + 28), targetX - bulletX);
                spawnBossBullet(crossAngle, (hardMode ? 5.6 : 4.9) + profile.attackBias + stage * 0.15, bulletX);
            }
        } else if (pattern === 'rain') {
            const rainCount = min(9, 5 + stage);
            for (let shot = 0; shot < rainCount; shot++) {
                enemyBullets.push({
                    x: boss.x + (shot - (rainCount - 1) / 2) * 22,
                    y: boss.y + 28,
                    speed: 5.3 + profile.attackBias + stage * 0.2 + (hardMode ? 0.9 : 0),
                    vx: (shot - (rainCount - 1) / 2) * 0.22,
                    attackPattern: pattern
                });
            }
        }

        boss.attackPattern = (boss.attackPattern + 1) % profile.patterns.length;
    }
}

function checkCollisions() {
    // Collision checks are done in a single pass so the boss, bullets, and player can be resolved predictably.
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        if (boss && boss.health > 0 && isWithinRadius(bullet.x, bullet.y, boss.x, boss.y, boss.size / 2 + 6)) {
            boss.lastHitByPurpleBeam = false;
            boss.health = max(0, boss.health - 1);
            if (simulationFrame % 4 === 0) {
                spawnImpactRing(bullet.x, bullet.y, [255, 220, 130], 34, 15);
                triggerImpact(1.5, 10, [255, 225, 160]);
            }
            if (simulationFrame % 3 === 0) {
                spawnEffectBurst(bullet.x, bullet.y, [[255, 215, 110], [255, 255, 240]], 4, 2.2);
            }
            bullets.splice(i, 1);
            addScore(50);
            continue;
        }
        for (let enemy of enemies) {
            if (!enemy.alive) continue;
            if (isWithinRadius(bullet.x, bullet.y, enemy.x, enemy.y, enemy.size / 2 + 6)) {
                enemy.alive = false;
                bullets.splice(i, 1);
                triggerImpact(2, 0, [255, 255, 255]);
                registerEnemyDefeat(enemy.x, enemy.y, 100);
                spawnEffectBurst(enemy.x, enemy.y, [[90, 220, 255], [255, 215, 120], [245, 250, 255]], 18, 3.8);
                playTone(660, 0.07, 0.03, 'triangle');
                break;
            }
        }
    }

    for (let i = chargedBeams.length - 1; i >= 0; i--) {
        const beam = chargedBeams[i];
        beam.life -= 1;
        if (beam.life <= 0) {
            chargedBeams.splice(i, 1);
            continue;
        }

        const beamTop = beam.y - beam.height / 2;
        const beamBottom = beam.y + beam.height / 2;
        let beamHit = false;

        for (let enemy of enemies) {
            if (!enemy.alive) continue;
            if (abs(enemy.x - beam.x) < beam.width / 2 + enemy.size / 2 && enemy.y > beamTop && enemy.y < beamBottom) {
                enemy.alive = false;
                registerEnemyDefeat(enemy.x, enemy.y, 250);
                spawnEffectBurst(enemy.x, enemy.y, [[100, 230, 255], [180, 250, 255], [255, 220, 130]], 14, 3.2);
                beam.power -= beam.enemyPowerCost;
                beamHit = true;
                playTone(220, 0.05, 0.04, 'triangle');
                if (beam.power <= 0) {
                    chargedBeams.splice(i, 1);
                    break;
                }
            }
        }

        if (chargedBeams[i] !== beam) continue;

        if (boss && boss.health > 0 && abs(boss.x - beam.x) < beam.width / 2 + boss.size / 2 && boss.y + boss.size / 2 > beamTop && boss.y - boss.size / 2 < beamBottom) {
            boss.lastHitByPurpleBeam = Boolean(beam.purple);
            boss.health = max(0, boss.health - Math.round(beam.damage));
            if (simulationFrame % 6 === 0) {
                spawnImpactRing(boss.x, boss.y, [110, 225, 255], boss.size * 1.2, 18);
                triggerImpact(2.5, 14, [110, 210, 255]);
            }
            if (simulationFrame % 4 === 0) {
                spawnEffectBurst(boss.x + random(-boss.size / 3, boss.size / 3),
                    boss.y + random(-boss.size / 3, boss.size / 3),
                    [[255, 210, 105], [255, 245, 210]], 5, 2.4);
            }
            beam.power -= beam.bossPowerCost;
            addScore(10);
            beamHit = true;
            playTone(180, 0.05, 0.04, 'sawtooth');
        }

        if (beamHit) {
            beam.life -= 1;
        }

        if (beam.power <= 0 || beam.life <= 0) {
            chargedBeams.splice(i, 1);
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        if (!bullet) continue;
        let shieldHit = false;

        for (let j = shields.length - 1; j >= 0; j--) {
            let shield = shields[j];
            if (!shield) continue;
            const column = floor((bullet.x - (shield.x - shield.width / 2)) / shield.cellSize);
            const row = floor((bullet.y - (shield.y - shield.height / 2)) / shield.cellSize);
            if (row >= 0 && row < shield.cells.length && column >= 0 && column < shield.cells[row].length && shield.cells[row][column]) {
                shield.cells[row][column] = false;
                enemyBullets.splice(i, 1);
                if (shield.cells.every(shieldRow => shieldRow.every(cell => !cell))) {
                    shields.splice(j, 1);
                }
                shieldHit = true;
                break;
            }
        }

        if (shieldHit) continue;

        if (pointHitsPlayer(bullet.x, bullet.y)) {
            if (invulnerabilityFrames === 0) {
                recordBossAttackHit(bullet.attackPattern);
            }
            enemyBullets.splice(i, 1);
            loseLife();
        }
    }

    for (let i = enemyBombs.length - 1; i >= 0; i--) {
        let bomb = enemyBombs[i];
        if (!bomb) continue;
        let bombHit = false;

        for (let j = shields.length - 1; j >= 0; j--) {
            let shield = shields[j];
            if (!shield) continue;
            const shieldLeft = shield.x - shield.width / 2;
            const shieldTop = shield.y - shield.height / 2;
            const bombRadius = 8;
            let hitRow = -1;
            let hitColumn = -1;

            for (let shieldRow = 0; shieldRow < shield.cells.length && hitRow < 0; shieldRow++) {
                for (let shieldColumn = 0; shieldColumn < shield.cells[shieldRow].length; shieldColumn++) {
                    if (!shield.cells[shieldRow][shieldColumn]) continue;
                    const cellLeft = shieldLeft + shieldColumn * shield.cellSize;
                    const cellTop = shieldTop + shieldRow * shield.cellSize;
                    if (bomb.x + bombRadius >= cellLeft && bomb.x - bombRadius <= cellLeft + shield.cellSize && bomb.y + bombRadius >= cellTop && bomb.y - bombRadius <= cellTop + shield.cellSize) {
                        hitRow = shieldRow;
                        hitColumn = shieldColumn;
                        break;
                    }
                }
            }

            if (hitRow >= 0) {
                for (let shieldRow = hitRow - 1; shieldRow <= hitRow + 1; shieldRow++) {
                    for (let shieldColumn = hitColumn - 1; shieldColumn <= hitColumn + 1; shieldColumn++) {
                        if (shieldRow >= 0 && shieldRow < shield.cells.length && shieldColumn >= 0 && shieldColumn < shield.cells[shieldRow].length) {
                            shield.cells[shieldRow][shieldColumn] = false;
                        }
                    }
                }
                if (shield.cells.every(shieldRow => shieldRow.every(cell => !cell))) {
                    shields.splice(j, 1);
                }
                enemyBombs.splice(i, 1);
                bombHit = true;
                playTone(110, 0.12, 0.04, 'sawtooth');
                break;
            }
        }

        if (bombHit || i >= enemyBombs.length) continue;

        if (pointHitsPlayer(bomb.x, bomb.y)) {
            enemyBombs.splice(i, 1);
            loseLife();
        }
    }

    if (!boss && enemies.every(enemy => !enemy.alive)) {
        startBoss();
    }

    if (boss && boss.health <= 0) {
        runBossesDefeated++;
        if (runBossesDefeated === 1) unlockAchievement('first-boss');
        if (runBossesDefeated >= 3) unlockAchievement('three-bosses');
        if (hardMode) unlockAchievement('hard-boss');
        if (!boss.playerHitThisFight) unlockAchievement('untouched-boss');
        if (boss.lastHitByPurpleBeam) unlockAchievement('purple-finisher');
        bossDefeatFrames = 100;
        spawnFireworks(boss.x, boss.y);
        spawnImpactRing(boss.x, boss.y, [255, 220, 120], boss.size * 3.2, 38);
        spawnImpactRing(boss.x, boss.y, [120, 225, 255], boss.size * 2.4, 30);
        triggerImpact(13, 105, [255, 230, 160]);
        spawnEffectBurst(boss.x, boss.y, [[255, 205, 80], [100, 225, 255], [255, 255, 255], [220, 120, 255]], 72, 7);
        addScore(500);
        boss = null;
        bossEntranceFrames = 0;
        chargedBeams = [];
        beamChargeParticles = [];
        beamCharge = 0;
        beamMaxChargeHoldMs = 0;
        beamMaxChargeLastUpdatedAt = null;
        beamCharging = false;
        beamFireCooldown = 0;
        if (stage < maxStage) {
            stage++;
            runMaxStage = max(runMaxStage, stage);
            if (stage >= 4) unlockAchievement('stage-four');
            simulationFrame = 0;
            upgradeSelection = true;
            simulationAccumulator = 0;
            lastSimulationUpdateAt = millis();
            bullets = [];
            enemyBullets = [];
            enemyBombs = [];
            initEnemies();
            initShields();
            saveGameState(true);
            playTone(520 + stage * 80, 0.12, 0.04, 'triangle');
        } else {
            clear = true;
            finalizeRun(true);
            playTone(760, 0.18, 0.04, 'triangle');
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    playTone(920, 0.15, 0.05, 'triangle');
                }, 80);
            }
        }
    }
}

function isWithinRadius(x1, y1, x2, y2, radius) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy < radius * radius;
}

function pointHitsPlayer(x, y) {
    const normalizedX = (x - player.x) / (playerHitboxWidth / 2);
    const normalizedY = (y - player.y) / (playerHitboxHeight / 2);
    return normalizedX * normalizedX + normalizedY * normalizedY < 1;
}

function startBoss() {
    const profile = stage >= maxStage ? finalBossProfile : bossProfiles[(stage - 1) % bossProfiles.length];
    const difficulty = stageDifficulty[stage - 1] || stageDifficulty[0];
    const bossHealth = Math.round(difficulty.bossHealth * (hardMode ? 1.25 : 1));
    boss = {
        x: width / 2,
        y: 185,
        size: profile.size,
        health: bossHealth,
        maxHealth: bossHealth,
        speed: difficulty.bossSpeed * (hardMode ? 1.15 : 1),
        direction: 1,
        attackPattern: 0,
        attackTimer: 0,
        telegraph: null,
        profile: profile,
        rememberedPattern: playerRecord.rememberedAttack,
        usedRememberedPattern: false,
        playerHitThisFight: false,
        lastHitByPurpleBeam: false
    };
    bossEntranceFrames = 100;
    killCombo = 0;
    comboBannerFrames = 0;
    spawnImpactRing(boss.x, boss.y, [100, 225, 255], 360, 48);
    triggerImpact(5, 38, [100, 200, 255]);
    spawnEffectBurst(boss.x, boss.y, [[100, 225, 255], [255, 215, 110], [255, 255, 255]], 42, 5);
    chargedBeams = [];
    beamChargeParticles = [];
    beamCharge = 0;
    beamMaxChargeHoldMs = 0;
    beamMaxChargeLastUpdatedAt = null;
    beamCharging = false;
    beamFireCooldown = 0;
    enemyBullets = [];
    enemyBombs = [];
    playTone(260, 0.3, 0.05, 'sawtooth');
}

function loseLife() {
    if (invulnerabilityFrames > 0) return;
    if (boss) boss.playerHitThisFight = true;
    spawnImpactRing(player.x, player.y, [255, 95, 120], 130, 26);
    triggerImpact(8, 75, [255, 55, 75]);
    spawnEffectBurst(player.x, player.y, [[255, 80, 105], [255, 190, 110], [255, 255, 255]], 30, 4.5);
    lives--;
    invulnerabilityFrames = playerInvulnerabilityDuration;
    player.x = width / 2;
    bullets = [];
    enemyBullets = [];
    enemyBombs = [];
    chargedBeams = [];
    beamChargeParticles = [];
    beamCharge = 0;
    beamMaxChargeHoldMs = 0;
    beamMaxChargeLastUpdatedAt = null;
    beamCharging = false;
    if (lives <= 0) {
        gameOver = true;
        finalizeRun(false);
    } else {
        playTone(180, 0.25, 0.04, 'sawtooth');
    }
}

function drawBackground() {
    if (!backgroundLayer || backgroundLayerStage !== stage) {
        if (backgroundLayer) {
            backgroundLayer.remove();
        }
        backgroundLayer = createGraphics(width, height);
        backgroundLayer.rectMode(CENTER);
        backgroundLayer.noStroke();
        const backgroundColor = stageBackgrounds[stage - 1];
        backgroundLayer.fill(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
        backgroundLayer.rect(width / 2, height / 2, width, height);

        backgroundLayer.stroke(105, 165, 205, 18);
        backgroundLayer.strokeWeight(1);
        for (let gridX = 70; gridX < width; gridX += 70) {
            backgroundLayer.line(gridX, 0, gridX, height);
        }
        for (let gridY = 70; gridY < height; gridY += 70) {
            backgroundLayer.line(0, gridY, width, gridY);
        }

        for (let star of stars) {
            backgroundLayer.fill(255, 255, 255, star.alpha);
            backgroundLayer.ellipse(star.x, star.y, star.size);
        }

        backgroundLayerStage = stage;
    }

    image(backgroundLayer, width / 2, height / 2);
    if (!titleScreen && !gameOver && !clear && !upgradeSelection) {
        push();
        rectMode(CENTER);
        noFill();
        stroke(60, 110, 180);
        strokeWeight(1);
        rect(width / 2, height - 45, width - 40, 40, 10);
        pop();
    }
    noStroke();
    stroke(60, 110, 180);
    strokeWeight(1);
    noFill();
}

function drawEnemies() {
    if (!enemyImg || enemyImg.width === 0 || enemyImg.height === 0) {
        return;
    }

    const imageScale = min(42 / enemyImg.width, 42 / enemyImg.height);
    const imageWidth = enemyImg.width * imageScale;
    const imageHeight = enemyImg.height * imageScale;

    for (let enemy of enemies) {
        if (enemy.alive) {
            push();
            translate(enemy.x, enemy.y);
            if (enemy.direction < 0) scale(-1, 1);
            image(enemyImg, 0, 0, imageWidth, imageHeight);
            pop();
        }
    }
    noStroke();
}

function drawBoss() {
    if (!boss) return;

    const bossImage = bossImages[stage - 1];
    if (bossImage && bossImage.width > 0 && bossImage.height > 0) {
        image(bossImage, boss.x, boss.y, boss.size, boss.size);
    }
    if (bossEntranceFrames > 0) {
        const progress = 1 - bossEntranceFrames / 100;
        const pulse = 0.5 + sin(frameCount * 0.3) * 0.5;
        noFill();
        stroke(100, 225, 255, bossEntranceFrames * 1.8);
        strokeWeight(3);
        ellipse(boss.x, boss.y, boss.size + 45 + progress * 130 + pulse * 12);
        stroke(255, 215, 110, bossEntranceFrames * 1.5);
        strokeWeight(1.5);
        ellipse(boss.x, boss.y, boss.size + 20 + progress * 90);
        bossEntranceFrames--;
    }

    const barWidth = 330;
    const barHeight = 20;
    const barLeft = width / 2 - barWidth / 2;
    const barTop = 64;
    const healthRatio = constrain(boss.health / boss.maxHealth, 0, 1);
    const profile = boss.profile || bossProfiles[(stage - 1) % bossProfiles.length];
    const barColor = bossHealthBarColors[(stage - 1) % bossHealthBarColors.length];

    rectMode(CORNER);
    drawingContext.shadowBlur = 16;
    drawingContext.shadowColor = `rgba(${barColor[0]}, ${barColor[1]}, ${barColor[2]}, 0.9)`;
    noStroke();
    fill(2, 8, 20, 225);
    rect(barLeft - 8, barTop - 7, barWidth + 16, barHeight + 14, 9);
    fill(18, 28, 43);
    rect(barLeft, barTop, barWidth, barHeight, 6);
    fill(barColor[0], barColor[1], barColor[2]);
    rect(barLeft + 2, barTop + 2, max(0, (barWidth - 4) * healthRatio), barHeight - 4, 4);
    fill(255, 255, 255, 120);
    rect(barLeft + 4, barTop + 4, max(0, (barWidth - 8) * healthRatio), 3, 2);
    drawingContext.shadowBlur = 0;
    stroke(barColor[0], barColor[1], barColor[2], 210);
    strokeWeight(1.5);
    noFill();
    rect(barLeft, barTop, barWidth, barHeight, 8);
    strokeWeight(1);
    for (let mark = 1; mark < 10; mark++) {
        line(barLeft + barWidth * mark / 10, barTop + barHeight - 5, barLeft + barWidth * mark / 10, barTop + barHeight);
    }
    rectMode(CENTER);
    fill(255, 245, 220);
    textAlign(CENTER, BASELINE);
    textSize(11);
    textStyle(BOLD);
    text(`${profile.name}  /  ${Math.ceil(boss.health)} / ${boss.maxHealth}`, width / 2, 58);
    textStyle(NORMAL);
}

function drawBossTelegraph() {
    if (!boss || !boss.telegraph) return;

    const { pattern, timer, targetX, targetY } = boss.telegraph;
    const pulse = 0.5 + sin(frameCount * 0.35) * 0.5;
    push();
    blendMode(BLEND);
    noFill();
    stroke(255, 75, 90, 190 + pulse * 60);
    if (bossTelegraphTargetPatterns.has(pattern)) {
        strokeWeight(2.5);
        line(boss.x, boss.y + boss.size / 2, targetX, targetY - 18);
        strokeWeight(3 + pulse * 2);
        ellipse(targetX, targetY - 18, 36 + pulse * 12);
        line(targetX - 24, targetY - 18, targetX - 12, targetY - 18);
        line(targetX + 12, targetY - 18, targetX + 24, targetY - 18);
    } else if (pattern === 'burst') {
        strokeWeight(2);
        ellipse(boss.x, boss.y, boss.size + 32 + pulse * 12);
        for (let ray = 0; ray < 8; ray++) {
            const angle = ray * TWO_PI / 8 + frameCount * 0.015;
            line(
                boss.x + cos(angle) * (boss.size / 2 + 12),
                boss.y + sin(angle) * (boss.size / 2 + 12),
                boss.x + cos(angle) * (boss.size / 2 + 29),
                boss.y + sin(angle) * (boss.size / 2 + 29)
            );
        }
    } else if (pattern === 'rain') {
        const railY = height - 95;
        strokeWeight(2);
        line(105, railY, width - 105, railY);
        for (let x = 125; x < width - 105; x += 38) {
            line(x, railY - 5, x, railY + 5);
        }
    } else {
        const spread = pattern === 'spread' ? 0.72 : 0.92;
        strokeWeight(2);
        for (let side = -1; side <= 1; side++) {
            const angle = HALF_PI + side * spread;
            line(boss.x, boss.y + boss.size / 2, boss.x + cos(angle) * 145, boss.y + sin(angle) * 145);
        }
    }

    noStroke();
    fill(135, 18, 32, 235);
    rectMode(CENTER);
    rect(width / 2, 278, 250, 30, 6);
    fill(255, 240, 235);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(13);
    text(`攻撃予告  ${bossTelegraphPatternLabels[pattern]}  ${(timer / 60).toFixed(1)}秒`, width / 2, 278);
    textStyle(NORMAL);
    pop();
}

function drawUpgradeSelection() {
    const compactLayout = window.innerWidth <= 600;
    const cardWidth = compactLayout ? 300 : 160;
    const cardHeight = compactLayout ? 160 : 248;
    const cardY = compactLayout ? 360 : height / 2 + 24;
    const cardCenters = compactLayout ? [165, 535, 165, 535] : [84, 261, 439, 616];
    const options = [
        {
            key: 'rapidFire',
            title: '射撃強化',
            lines: [
                `連射 ${(60 / playerFireInterval).toFixed(1)}→${(60 / getRapidFireInterval(min(maxUpgradeLevel, upgradeLevels.rapidFire + 1))).toFixed(1)}発/秒`,
                `弾速 ${playerBulletSpeed}→${basePlayerBulletSpeed + min(maxUpgradeLevel, upgradeLevels.rapidFire + 1) * 2}`
            ],
            accent: [85, 220, 255],
            level: upgradeLevels.rapidFire,
            status: upgradeLevels.rapidFire >= maxUpgradeLevel ? '最大強化済み' : '選択 / 1キー'
        },
        {
            key: 'movement',
            title: '移動強化',
            lines: [
                '機動性を高める',
                `速度 ${player.speed.toFixed(1)}→${(basePlayerSpeed + min(maxUpgradeLevel, upgradeLevels.movement + 1) * movementSpeedPerUpgrade).toFixed(1)}`
            ],
            accent: [110, 255, 180],
            level: upgradeLevels.movement,
            status: upgradeLevels.movement >= maxUpgradeLevel ? '最大強化済み' : '選択 / 2キー'
        },
        {
            key: 'beam',
            title: 'ビーム強化',
            lines: [
                `威力 ${(100 * (1 + upgradeLevels.beam * beamDamageBonusPerLevel)).toFixed(0)}→${(100 * (1 + min(maxUpgradeLevel, upgradeLevels.beam + 1) * beamDamageBonusPerLevel)).toFixed(0)}%`,
                `最大命中 ${min(maxBeamBossHitFrames, Math.ceil(maxBeamCharge / max(6, 9 - upgradeLevels.beam)))}→${min(maxBeamBossHitFrames, Math.ceil(maxBeamCharge / max(6, 9 - min(maxUpgradeLevel, upgradeLevels.beam + 1))))}回`
            ],
            accent: [255, 180, 75],
            level: upgradeLevels.beam,
            status: upgradeLevels.beam >= maxUpgradeLevel ? '最大強化済み' : '選択 / 3キー'
        },
        {
            key: 'repair',
            title: '回復',
            lines: ['ライフを1回復', `現在 ${lives}/${maxLives}`],
            accent: [255, 115, 145],
            level: lives,
            status: lives >= maxLives ? '回復MAX' : '選択 / 4キー +1',
            disabled: lives >= maxLives
        }
    ];

    push();
    rectMode(CORNER);
    noStroke();
    fill(3, 7, 20, 225);
    rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    fill(255, 235, 150);
    textStyle(BOLD);
    textSize(28);
    text(`STAGE ${stage} CLEAR!`, width / 2, 205);
    fill(215, 230, 245);
    textStyle(NORMAL);
    textSize(16);
    text('ボスが居る。まずは1回だけ砲撃を覚えておくといい', width / 2, 248);

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const disabled = option.disabled || (option.key !== 'repair' && option.level >= maxUpgradeLevel);
        const centerX = cardCenters[i];
        const left = centerX - cardWidth / 2;
        const rowOffset = compactLayout && i >= 2 ? 174 : 0;
        const top = cardY - cardHeight / 2 + rowOffset;
        drawingContext.shadowBlur = disabled ? 0 : 20;
        drawingContext.shadowColor = `rgba(${option.accent[0]}, ${option.accent[1]}, ${option.accent[2]}, ${disabled ? 0 : 0.18})`;
        fill(disabled ? 9 : 8, disabled ? 13 : 20, disabled ? 24 : 38, 245);
        rect(left, top, cardWidth, cardHeight, 12);
        drawingContext.shadowBlur = 0;
        stroke(option.accent[0], option.accent[1], option.accent[2], disabled ? 65 : 190);
        strokeWeight(2);
        noFill();
        rect(left, top, cardWidth, cardHeight, 12);
        noStroke();
        fill(option.accent[0], option.accent[1], option.accent[2], disabled ? 55 : 190);
        rect(left + 12, top + 12, cardWidth - 24, 3, 1.5);
        fill(option.accent[0], option.accent[1], option.accent[2], disabled ? 115 : 255);
        textStyle(BOLD);
        textSize(compactLayout ? 18 : 15);
        text(`${i + 1}. ${option.title}`, centerX, top + (compactLayout ? 27 : 42));
        fill(disabled ? 125 : 225, disabled ? 140 : 235, disabled ? 155 : 245);
        textStyle(NORMAL);
        textSize(compactLayout ? 13 : 10);
        text(option.lines[0], centerX, top + (compactLayout ? 55 : 92));
        text(option.lines[1], centerX, top + (compactLayout ? 75 : 114));
        fill(disabled ? 145 : 255, disabled ? 150 : 230, disabled ? 160 : 150);
        textSize(compactLayout ? 13 : 12);
        text(option.key === 'repair' ? `回復 ${min(maxLives, lives + 1)}/${maxLives}` : `強化 ${option.level}/${maxUpgradeLevel}`, centerX, top + (compactLayout ? 99 : 166));
        const pipCount = option.key === 'repair' ? maxLives : maxUpgradeLevel;
        for (let pip = 0; pip < pipCount; pip++) {
            const active = option.key === 'repair' ? pip < lives : pip < option.level;
            fill(active ? color(option.accent[0], option.accent[1], option.accent[2], disabled ? 100 : 255) : color(35, 55, 75));
            rect(centerX - (pipCount - 1) * 12 + pip * 24, top + (compactLayout ? 116 : 187), 16, 4, 2);
        }
        textSize(compactLayout ? 12 : 11);
        fill(disabled ? 130 : 175, disabled ? 140 : 205, disabled ? 155 : 225);
        text(option.status, centerX, top + (compactLayout ? 139 : 205));
        textStyle(NORMAL);
    }

    fill(180, 205, 225);
    textSize(compactLayout ? 15 : 12);
    text('選択肢: 1 / 2 / 3 / 4 で強化を決定', width / 2, compactLayout ? height - 20 : height - 40);
    pop();
    rectMode(CENTER);
}

function chooseUpgrade(optionIndex) {
    if (!upgradeSelection || optionIndex < 0 || optionIndex > 3) return;

    const keys = ['rapidFire', 'movement', 'beam', 'repair'];
    const key = keys[optionIndex];
    if (key === 'repair') {
        if (lives >= maxLives) {
            playTone(180, 0.08, 0.025, 'square');
            return;
        }
        lives = min(maxLives, lives + 1);
        playerRecord.upgrades.repair++;
        savePlayerRecord();
        spawnEffectBurst(player.x, player.y, [[255, 105, 150], [255, 230, 160], [255, 255, 255]], 28, 4);
        upgradeSelection = false;
        simulationAccumulator = 0;
        lastSimulationUpdateAt = millis();
        saveGameState(true);
        playTone(720, 0.16, 0.05, 'triangle');
        return;
    }

    if (upgradeLevels[key] >= maxUpgradeLevel) {
        playTone(180, 0.08, 0.025, 'square');
        return;
    }

    upgradeLevels[key]++;
    playerRecord.upgrades[key]++;
    if (upgradeLevels[key] >= maxUpgradeLevel) unlockAchievement('max-upgrade');
    savePlayerRecord();
    spawnEffectBurst(width / 2, height / 2, [[100, 220, 255], [150, 255, 190], [255, 220, 120]], 28, 4);
    if (key === 'rapidFire') {
        playerFireInterval = getRapidFireInterval(upgradeLevels.rapidFire);
        playerBulletSpeed = basePlayerBulletSpeed + upgradeLevels.rapidFire * 2;
    } else if (key === 'movement') {
        player.speed = basePlayerSpeed + upgradeLevels.movement * movementSpeedPerUpgrade;
    }

    upgradeSelection = false;
    simulationAccumulator = 0;
    lastSimulationUpdateAt = millis();
    saveGameState(true);
    playTone(520 + upgradeLevels[key] * 100, 0.12, 0.04, 'triangle');
}

function drawBullets() {
    noStroke();
    fill(255, 92, 92);
    for (let bullet of bullets) {
        ellipse(bullet.x, bullet.y, 7, 14);
    }
}

function drawChargedBeams() {
    for (let beam of chargedBeams) {
        push();
        translate(beam.x, beam.y);

        const fade = constrain(beam.life / 9, 0, 1);
        const phase = frameCount * 0.22;
        const top = -beam.height / 2;
        const bottom = beam.height / 2;
        const glowAlpha = constrain(beam.power / maxBeamCharge * 220, 90, 220) * fade;
        const goldBeam = beam.golden;
        const purpleBeam = beam.purple;
        const beamWidth = beam.width;
        const glowWidth = beamWidth * 1.8;
        const beamColors = purpleBeam
            ? beamColorSets.purple
            : (goldBeam ? beamColorSets.gold : beamColorSets.normal);

        blendMode(ADD);
        drawingContext.shadowBlur = 0;
        noStroke();
        fill(beamColors.outer[0], beamColors.outer[1], beamColors.outer[2], glowAlpha * 0.32);
        beginShape();
        vertex(-glowWidth * 0.18, top);
        vertex(glowWidth * 0.18, top);
        vertex(glowWidth * 0.5, bottom);
        vertex(-glowWidth * 0.5, bottom);
        endShape(CLOSE);

        fill(beamColors.middle[0], beamColors.middle[1], beamColors.middle[2], glowAlpha * 0.72);
        beginShape();
        vertex(-beamWidth * 0.22, top);
        vertex(beamWidth * 0.22, top);
        vertex(beamWidth * 0.56, bottom);
        vertex(-beamWidth * 0.56, bottom);
        endShape(CLOSE);

        fill(beamColors.inner[0], beamColors.inner[1], beamColors.inner[2], glowAlpha);
        beginShape();
        vertex(-beamWidth * 0.09, top);
        vertex(beamWidth * 0.09, top);
        vertex(beamWidth * 0.3, bottom);
        vertex(-beamWidth * 0.3, bottom);
        endShape(CLOSE);

        fill(255, purpleBeam ? 230 : (goldBeam ? 249 : 255), purpleBeam ? 255 : (goldBeam ? 210 : 255), 220 * fade);
        beginShape();
        vertex(-beamWidth * 0.035, top);
        vertex(beamWidth * 0.035, top);
        vertex(beamWidth * 0.11, bottom);
        vertex(-beamWidth * 0.11, bottom);
        endShape(CLOSE);

        stroke(beamColors.inner[0], beamColors.inner[1], beamColors.inner[2], 190 * fade);
        strokeWeight(2);
        for (let streak = 0; streak < 7; streak++) {
            const y = top + ((streak * 0.19 + (phase % 1)) % 1) * beam.height;
            const halfWidth = beamWidth * (0.12 + (y - top) / beam.height * 0.2);
            line(-halfWidth, y, halfWidth, y);
        }
        if (goldBeam || purpleBeam) {
            const edgeColor = beamColors.edge;
            stroke(edgeColor[0], edgeColor[1], edgeColor[2], 150 * fade);
            strokeWeight(purpleBeam ? 3.5 : 2.5);
            line(-beamWidth * 0.34, top + 20, -beamWidth * 0.62, bottom - 20);
            line(beamWidth * 0.34, top + 20, beamWidth * 0.62, bottom - 20);
        }

        drawingContext.shadowBlur = 0;
        blendMode(BLEND);
        pop();
    }
}

function drawEnemyBullets() {
    noStroke();
    fill(100, 220, 255);
    for (let bullet of enemyBullets) {
        ellipse(bullet.x, bullet.y, 6, 10);
    }
}

function drawEnemyBombs() {
    noStroke();
    fill(255, 150, 35);
    for (let bomb of enemyBombs) {
        ellipse(bomb.x, bomb.y, 16, 16);
        fill(255, 225, 90);
        ellipse(bomb.x, bomb.y, 6, 6);
        fill(255, 150, 35);
    }
}

function drawPlayer() {
    if (invulnerabilityFrames === 0 || floor(frameCount / 5) % 2 === 0) {
        image(playerImg, player.x, player.y, player.size, player.size);
    }

}

function drawBeamChargeEffects() {
    if (!beamCharging && beamChargeParticles.length === 0) return;

    const chargeRatio = beamCharge / maxBeamCharge;
    const ready = beamCharge >= beamChargeThreshold;
    const maxCharged = beamCharge >= maxBeamCharge;
    const purpleReady = isPurpleBeamReady();
    const purpleRatio = constrain(beamMaxChargeHoldMs / beamSecretChargeDuration, 0, 1);
    const secretCharging = maxCharged && !purpleReady;
    const red = secretCharging ? 255 : (purpleReady ? 190 : lerp(80, 255, chargeRatio));
    const green = secretCharging ? lerp(205, 145, purpleRatio) : (purpleReady ? 105 : lerp(210, 220, chargeRatio));
    const blue = secretCharging ? lerp(110, 30, purpleRatio) : (purpleReady ? 255 : lerp(255, 125, chargeRatio));

    push();
    blendMode(ADD);
    noFill();
    stroke(red, green, blue, 80 + chargeRatio * 120);
    strokeWeight(1.5 + chargeRatio * 2);
    ellipse(player.x, player.y - 18, 38 + chargeRatio * 26 + sin(frameCount * 0.2) * 4);
    stroke(210, 250, 255, 100);
    arc(player.x, player.y - 18, 54 + chargeRatio * 28, 54 + chargeRatio * 28,
        -HALF_PI, -HALF_PI + TWO_PI * chargeRatio, OPEN);
    if (maxCharged && !secretCharging) {
        const pulse = 0.5 + sin(frameCount * 0.2) * 0.5;
        stroke(255, 210, 105, 180 + pulse * 75);
        strokeWeight(2.5 + pulse * 2);
        ellipse(player.x, player.y - 18, 92 + pulse * 12);
        stroke(255, 245, 190, 130 + pulse * 80);
        strokeWeight(1.5);
        ellipse(player.x, player.y - 18, 112 + pulse * 18);
        strokeWeight(2);
        for (let ray = 0; ray < 12; ray++) {
            const angle = TWO_PI * ray / 12 + frameCount * 0.018;
            const innerRadius = 42 + pulse * 5;
            const outerRadius = 56 + pulse * 17;
            line(
                player.x + cos(angle) * innerRadius,
                player.y - 18 + sin(angle) * innerRadius,
                player.x + cos(angle) * outerRadius,
                player.y - 18 + sin(angle) * outerRadius
            );
        }
    }
    if (secretCharging || purpleReady) {
        const pulse = 0.5 + sin(frameCount * 0.24) * 0.5;
        stroke(purpleReady ? 190 : 255, purpleReady ? 105 : 165,
            purpleReady ? 255 : 55, 160 + pulse * 90);
        strokeWeight(2 + pulse * 2);
        ellipse(player.x, player.y - 18, 132 + pulse * 24);
        stroke(purpleReady ? 105 : 255, purpleReady ? 70 : 205,
            purpleReady ? 255 : 120, 130 + pulse * 90);
        strokeWeight(2);
        ellipse(player.x, player.y - 18, 154 + pulse * 32);
        stroke(purpleReady ? 235 : 255, purpleReady ? 185 : 230,
            purpleReady ? 255 : 165, 180);
        for (let arcIndex = 0; arcIndex < 4; arcIndex++) {
            const angle = frameCount * 0.06 + arcIndex * HALF_PI;
            const x = player.x + cos(angle) * (70 + pulse * 8);
            const y = player.y - 18 + sin(angle) * (70 + pulse * 8);
            line(x - 5, y, x + 5, y);
            line(x, y - 5, x, y + 5);
        }
    }
    noStroke();
    drawingContext.shadowBlur = secretCharging || purpleReady ? 30 : 14 + chargeRatio * 24;
    drawingContext.shadowColor = purpleReady
        ? 'rgba(190, 100, 255, 1)'
        : (secretCharging
            ? 'rgba(255, 165, 55, 1)'
            : (ready ? 'rgba(255, 205, 105, 0.95)' : 'rgba(100, 225, 255, 0.9)'));
    fill(red, green, blue, 100 + chargeRatio * 100);
    ellipse(player.x, player.y - 18, 10 + chargeRatio * 14);
    drawingContext.shadowBlur = 0;

    for (const particle of beamChargeParticles) {
        const alpha = 220 * constrain(particle.life / particle.maxLife, 0, 1);
        fill(ready ? 255 : 155, ready ? 225 : 245, ready ? 145 : 255, alpha);
        ellipse(particle.x, particle.y, particle.size * 1.8);
        fill(255, 255, 255, alpha);
        ellipse(particle.x, particle.y, particle.size * 0.65);
    }
    blendMode(BLEND);
    pop();
}

function drawLifeIcon(x, y, active) {
    push();
    translate(x, y);
    if (active) {
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(255, 90, 125, 0.8)';
        noStroke();
        fill(255, 92, 125);
    } else {
        drawingContext.shadowBlur = 0;
        noFill();
        stroke(120, 145, 165, 150);
        strokeWeight(1.5);
    }
    beginShape();
    vertex(0, 7);
    bezierVertex(-2, 5, -8, 1, -8, -3);
    bezierVertex(-8, -9, -2, -10, 0, -5);
    bezierVertex(2, -10, 8, -9, 8, -3);
    bezierVertex(8, 1, 2, 5, 0, 7);
    endShape(CLOSE);
    drawingContext.shadowBlur = 0;
    pop();
}

function drawShields() {
    rectMode(CENTER);
    for (let shield of shields) {
        noStroke();
        fill(120, 220, 255, 180);
        for (let row = 0; row < shield.cells.length; row++) {
            for (let column = 0; column < shield.cells[row].length; column++) {
                if (shield.cells[row][column]) {
                    const cellX = shield.x - shield.width / 2 + column * shield.cellSize + shield.cellSize / 2;
                    const cellY = shield.y - shield.height / 2 + row * shield.cellSize + shield.cellSize / 2;
                    rect(cellX, cellY, shield.cellSize - 1, shield.cellSize - 1);
                }
            }
        }
    }
}

// HUD elements for score, stage, mode, armor, and beam charge.
function drawHud() {
    const now = millis();
    if (now - fpsLastUpdatedAt >= 100) {
        displayedFps = round(frameRate());
        fpsLastUpdatedAt = now;
    }

    const accent = stageAccents[stage - 1];
    rectMode(CORNER);
    drawingContext.shadowBlur = 18;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.55)';
    noStroke();
    fill(4, 12, 27, 238);
    rect(12, 8, width - 24, 34, 10);
    drawingContext.shadowBlur = 0;
    noFill();
    stroke(90, 155, 190, 125);
    strokeWeight(1);
    rect(12, 8, width - 24, 34, 10);
    noStroke();
    fill(accent[0], accent[1], accent[2], 190);
    rect(18, 13, 3, 24, 1.5);

    textAlign(LEFT, BASELINE);
    textStyle(BOLD);
    fill(130, 165, 190);
    textSize(8);
    text('SCORE', 29, 22);
    fill(245, 250, 255);
    textSize(15);
    text(String(score).padStart(6, '0'), 29, 36);
    stroke(90, 130, 155, 100);
    line(107, 15, 107, 35);
    noStroke();
    fill(110, 165, 190);
    textStyle(NORMAL);
    textSize(8);
    text('FPS', 118, 22);
    fill(140, 225, 245);
    textStyle(BOLD);
    textSize(12);
    text(String(displayedFps), 118, 36);

    fill(7, 19, 36, 245);
    rect(width / 2 - 64, 12, 128, 26, 7);
    noFill();
    stroke(accent[0], accent[1], accent[2], 150);
    rect(width / 2 - 64, 12, 128, 26, 7);
    noStroke();
    fill(135, 165, 190);
    textAlign(CENTER, BASELINE);
    textStyle(BOLD);
    textSize(8);
    text('MISSION', width / 2, 22);
    fill(240, 247, 255);
    textSize(13);
    text(`STAGE ${String(stage).padStart(2, '0')} / ${maxStage}`, width / 2, 34);

    const modeX = 438;
    const modeColor = hardMode ? modeColors.hard : modeColors.normal;
    fill(14, 27, 42, 235);
    rect(modeX, 13, 92, 24, 7);
    noFill();
    stroke(modeColor[0], modeColor[1], modeColor[2], 130);
    rect(modeX, 13, 92, 24, 7);
    noStroke();
    fill(modeColor[0], modeColor[1], modeColor[2]);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(9);
    text(hardMode ? 'HARD MODE' : 'NORMAL', modeX + 46, 25);

    const lifePanelX = 540;
    fill(14, 27, 42, 235);
    rect(lifePanelX, 13, 148, 24, 7);
    noFill();
    stroke(90, 155, 190, 100);
    rect(lifePanelX, 13, 148, 24, 7);
    noStroke();
    fill(175, 215, 235);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(8);
    text('HULL', lifePanelX + 9, 25);
    for (let i = 0; i < maxLives; i++) {
        drawLifeIcon(lifePanelX + 56 + i * 18, 25, i < lives);
    }
    fill(190, 210, 225);
    textStyle(NORMAL);
    textSize(9);
    textAlign(RIGHT, BASELINE);
    text(`${lives}/${maxLives}`, lifePanelX + 140, 29);

    const beamPanelX = 12;
    const beamPanelY = 42;
    const beamPanelWidth = 160;
    const isMaxCharged = beamCharge >= maxBeamCharge;
    const isPurpleReady = isPurpleBeamReady();
    const secretChargeRatio = constrain(beamMaxChargeHoldMs / beamSecretChargeDuration, 0, 1);
    const beamPanelHeight = isMaxCharged ? 78 : 64;
    const chargeRatio = beamCharge / maxBeamCharge;
    const isReady = beamCharge >= beamChargeThreshold;
    const isCharging = beamCharging;
    const beamStatus = isCharging
        ? (isPurpleReady ? 'VOID BEAM READY' : (isMaxCharged
            ? `VOID AWAKENING ${floor(secretChargeRatio * 100)}%`
            : (isReady ? 'READY!' : `${floor(chargeRatio * 100)}% CHARGED`)))
        : (beamFireCooldown > 0 ? 'RECHARGING' : (beamCharge > 0 ? 'DECAYING' : 'HOLD B'));
    const barX = beamPanelX + 8;
    const barY = beamPanelY + 40;
    const barWidth = beamPanelWidth - 16;
    const barHeight = 8;
    const panelPulse = isMaxCharged ? 0.5 + sin(frameCount * 0.2) * 0.5 : 0;
    const chargeColor = isMaxCharged
        ? (isPurpleReady ? beamChargeColors.purple : beamChargeColors.max)
        : (isReady ? beamChargeColors.ready : beamChargeColors.charging);

    push();
    if (isMaxCharged) {
        drawingContext.shadowBlur = isPurpleReady ? 34 + panelPulse * 30 : 24 + panelPulse * 28;
        drawingContext.shadowColor = isPurpleReady
            ? 'rgba(175, 70, 255, 1)'
            : 'rgba(255, 145, 30, 0.95)';
    }
    noStroke();
    fill(5, 12, 28, 232);
    rectMode(CORNER);
    rect(beamPanelX, beamPanelY, beamPanelWidth, beamPanelHeight, 8);
    noFill();
    stroke(isMaxCharged ? (isPurpleReady ? 220 : 255) : (isReady ? 255 : 90),
        isMaxCharged ? (isPurpleReady ? 145 : 170) : (isReady ? 205 : 190),
        isMaxCharged ? (isPurpleReady ? 255 : 55) : (isReady ? 115 : 220),
        isMaxCharged ? 210 + panelPulse * 45 : 150);
    strokeWeight(isMaxCharged ? 2.5 + panelPulse : 1);
    rect(beamPanelX, beamPanelY, beamPanelWidth, beamPanelHeight, 8);
    drawingContext.shadowBlur = 0;
    stroke(isMaxCharged ? (isPurpleReady ? 235 : 255) : 115,
        isMaxCharged ? (isPurpleReady ? 175 : 210) : 215,
        isMaxCharged ? (isPurpleReady ? 255 : 115) : 245,
        150 + panelPulse * 80);
    strokeWeight(isMaxCharged ? 2.5 : 1.5);
    line(beamPanelX + 5, beamPanelY + 11, beamPanelX + 5, beamPanelY + 5);
    line(beamPanelX + 5, beamPanelY + 5, beamPanelX + 11, beamPanelY + 5);
    line(beamPanelX + beamPanelWidth - 11, beamPanelY + 5, beamPanelX + beamPanelWidth - 5, beamPanelY + 5);
    line(beamPanelX + beamPanelWidth - 5, beamPanelY + 5, beamPanelX + beamPanelWidth - 5, beamPanelY + 11);
    noStroke();
    fill(isMaxCharged
        ? (isPurpleReady ? color(235, 195, 255) : color(255, 220, 165))
        : color(205, 230, 245));
    textAlign(LEFT, BASELINE);
    textStyle(BOLD);
    textSize(9);
    text('BEAM CORE', beamPanelX + 8, beamPanelY + 17);
    fill(isMaxCharged
        ? (isPurpleReady ? color(240, 205, 255) : color(255, 205, 125))
        : (isReady ? color(255, 215, 125) : color(130, 225, 255)));
    textAlign(CENTER, BASELINE);
    textSize(8);
    text(beamStatus, beamPanelX + beamPanelWidth / 2, beamPanelY + 29);
    fill(28, 48, 68, 230);
    rect(barX, barY, barWidth, barHeight, 4);
    fill(chargeColor[0], chargeColor[1], chargeColor[2], 75);
    rect(barX, barY, barWidth * chargeRatio, barHeight, 4);
    fill(chargeColor[0], chargeColor[1], chargeColor[2]);
    rect(barX, barY + 1, barWidth * chargeRatio, barHeight - 2, 3);
    if (isMaxCharged) {
        const glintX = barX + ((frameCount * (isPurpleReady ? 4.5 : 2.5)) % barWidth);
        fill(255, 235, 255, 220);
        rect(glintX, barY + 1, isPurpleReady ? 5 : 3, barHeight - 2, 2);
        const sparkCount = isPurpleReady ? 8 : 5;
        for (let spark = 0; spark < sparkCount; spark++) {
            const orbit = isPurpleReady ? 57 : 51;
            const angle = frameCount * (isPurpleReady ? 0.07 : 0.035) + spark * TWO_PI / sparkCount;
            const sparkX = beamPanelX + beamPanelWidth / 2 + cos(angle) * orbit;
            const sparkY = beamPanelY + beamPanelHeight / 2 + sin(angle) * (isPurpleReady ? 31 : 27);
            fill(isPurpleReady ? 225 : 255, isPurpleReady ? 175 : 210,
                isPurpleReady ? 255 : 125, 145 + panelPulse * 110);
            ellipse(sparkX, sparkY, isPurpleReady ? (spark % 2 === 0 ? 4.5 : 3) : (spark % 2 === 0 ? 3.5 : 2));
        }
    }
    stroke(220, 245, 255, 150);
    strokeWeight(1);
    const thresholdX = barX + barWidth * beamChargeThreshold / maxBeamCharge;
    line(thresholdX, barY - 1, thresholdX, barY + barHeight + 1);
    noStroke();
    fill(175, 205, 225, 180);
    textAlign(CENTER, BASELINE);
    textSize(6);
    text(`FIRE AT ${beamChargeThreshold}%`, thresholdX, barY + barHeight + 9);
    if (isMaxCharged) {
        const secretBarY = beamPanelY + 69;
        fill(30, 18, 52, 230);
        rect(barX, secretBarY, barWidth, 4, 2);
        fill(isPurpleReady ? color(225, 155, 255) : color(255, 165, 55));
        rect(barX, secretBarY, barWidth * secretChargeRatio, 4, 2);
        if (isPurpleReady) {
            stroke(245, 215, 255, 180 + panelPulse * 75);
            strokeWeight(1.5);
            noFill();
            rect(barX, secretBarY, barWidth, 7, 3);
        }
    }
    textStyle(NORMAL);
    pop();
    rectMode(CENTER);
}

function drawTitleScreen() {
    const pulse = sin(frameCount * 0.08) * 0.5 + 0.5;
    push();
    rectMode(CENTER);
    drawingContext.shadowBlur = 28;
    drawingContext.shadowColor = 'rgba(60, 180, 255, 0.2)';
    fill(5, 14, 31, 150);
    rect(width / 2, height * 0.5, 570, 480, 20);
    drawingContext.shadowBlur = 0;
    noFill();
    stroke(85, 170, 220, 90 + pulse * 45);
    strokeWeight(1.5);
    rect(width / 2, height * 0.5, 570, 480, 20);
    stroke(115, 225, 255, 155);
    line(120, height * 0.405, width - 120, height * 0.405);
    noStroke();
    textAlign(CENTER, CENTER);
    noStroke();
    drawingContext.shadowBlur = 28;
    drawingContext.shadowColor = 'rgba(80, 220, 255, 0.8)';
    fill(100, 225, 255, 210 + pulse * 45);
    textStyle(BOLD);
    textSize(48);
    text('FISH STRIKER', width / 2, height * 0.31);
    drawingContext.shadowBlur = 0;
    fill(240, 250, 255);
    textSize(18);
    text('6 STAGES  /  6 BOSSES', width / 2, height * 0.39);
    fill(180, 220, 235);
    textSize(14);
    text('SPACE / Z で発射   B でビーム     H でハードモード', width / 2, height * 0.58);
    fill(135, 175, 205);
    textSize(11);
    const lastRun = playerRecord.history[0];
    text(lastRun
        ? `前回: ${lastRun.date.slice(0, 10)} / STAGE ${lastRun.stage} / SCORE ${lastRun.score}`
        : 'プレイすると前回の記録がここに残ります',
    width / 2, height * 0.62);
    fill(185, 210, 230);
    textSize(10);
    text(`ハイスコア ${playerRecord.highScore}  /  クリア ${playerRecord.clears}  /  好み ${getFavoriteUpgrade()}`,
        width / 2, height * 0.66);
    fill(130, 195, 220);
    textSize(9);
    text(playerRecord.rememberedAttack
        ? `前回苦戦した「${bossTelegraphPatternLabels[playerRecord.rememberedAttack]}」を初手に使う`
        : 'まだボスの記憶はありません。最初の攻撃を見て学ぶ',
    width / 2, height * 0.695);
    const achievementsButtonY = height * 0.735;
    fill(12, 38, 55, 235);
    stroke(85, 220, 235, 155 + pulse * 70);
    strokeWeight(1.5);
    rect(width / 2, achievementsButtonY, 250, 30, 8);
    noStroke();
    fill(165, 245, 255);
    textStyle(BOLD);
    textSize(12);
    text(`実績を見る  ${playerRecord.achievements.length}/${achievements.length}`,
        width / 2, achievementsButtonY);
    textStyle(NORMAL);
    fill(255, 230, 135, 180 + pulse * 75);
    textSize(15);
    text(gameSaveAvailable
        ? 'ENTER / 左クリックで続きから / N・SPACE で新規開始'
        : '新規開始 / ENTER / SPACE で開始',
    width / 2, height * 0.79);
    textStyle(NORMAL);
    pop();
}

function drawAchievementsScreen() {
    const panelWidth = min(width - 36, 640);
    const panelHeight = min(height - 36, 680);
    const panelTop = (height - panelHeight) / 2;
    noStroke();
    drawingContext.shadowBlur = 24;
    drawingContext.shadowColor = 'rgba(55, 190, 255, 0.35)';
    fill(5, 12, 27, 245);
    rect(width / 2, height / 2, panelWidth, panelHeight, 18);
    drawingContext.shadowBlur = 0;
    noFill();
    stroke(85, 190, 235, 190);
    strokeWeight(2);
    rect(width / 2, height / 2, panelWidth, panelHeight, 18);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(125, 235, 255);
    textStyle(BOLD);
    textSize(26);
    text('実績とプレイ記憶', width / 2, panelTop + 38);
    fill(195, 220, 240);
    textStyle(NORMAL);
    textSize(12);
    text(`プレイ ${playerRecord.totalRuns} 回  /  最高 STAGE ${playerRecord.bestStage}  /  ボス撃破 ${playerRecord.totalBossesDefeated} 体`,
        width / 2, panelTop + 70);

    const rowHeight = 40;
    const rowGap = 4;
    const columnGap = 12;
    const columnWidth = (panelWidth - 40 - columnGap) / 2;
    const rowCount = Math.ceil(achievements.length / 2);
    const rowStartY = panelTop + 111;
    for (let i = 0; i < achievements.length; i++) {
        const achievement = achievements[i];
        const unlocked = playerRecord.achievements.includes(achievement.id);
        const concealed = achievement.hidden && !unlocked;
        const row = Math.floor(i / 2);
        const column = i % 2;
        const centerX = width / 2 + (column === 0 ? -1 : 1) * (columnWidth + columnGap) / 2;
        const rowY = rowStartY + row * (rowHeight + rowGap);
        rectMode(CENTER);
        fill(unlocked ? color(22, 72, 81, 235)
            : concealed ? color(36, 27, 55, 225) : color(16, 29, 46, 220));
        rect(centerX, rowY, columnWidth, rowHeight, 9);
        noFill();
        stroke(unlocked ? color(85, 225, 190, 180)
            : concealed ? color(155, 115, 215, 150) : color(85, 115, 145, 110));
        strokeWeight(1);
        rect(centerX, rowY, columnWidth, rowHeight, 9);
        noStroke();
        textAlign(LEFT, CENTER);
        fill(unlocked ? color(135, 255, 220)
            : concealed ? color(195, 160, 235) : color(125, 145, 165));
        textStyle(BOLD);
        textSize(13);
        text(`${unlocked ? '★' : concealed ? '◆' : '・'} ${concealed ? '？？？' : achievement.title}`,
            centerX - columnWidth / 2 + 12, rowY - 7);
        fill(unlocked ? color(205, 230, 240)
            : concealed ? color(155, 140, 180) : color(115, 130, 150));
        textStyle(NORMAL);
        textSize(10);
        text(concealed ? '条件は秘密' : achievement.description,
            centerX - columnWidth / 2 + 24, rowY + 10);
    }

    const historyY = rowStartY + rowCount * (rowHeight + rowGap) + 2;
    fill(125, 220, 245);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(12);
    text('最近の記録', width / 2 - panelWidth / 2 + 24, historyY);
    textStyle(NORMAL);
    fill(180, 205, 225);
    textSize(10);
    if (playerRecord.history.length === 0) {
        text('まだプレイ記録はありません', width / 2 - panelWidth / 2 + 24, historyY + 20);
    } else {
        for (let i = 0; i < min(5, playerRecord.history.length); i++) {
            const run = playerRecord.history[i];
            const summary = `${run.date.slice(0, 10)}  STAGE ${run.stage}  SCORE ${run.score}  ${run.cleared ? 'CLEAR' : 'GAME OVER'}`;
            text(summary, width / 2 - panelWidth / 2 + 24, historyY + 19 + i * 17);
        }
    }
    fill(255, 225, 145);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('A / ESC / クリックでタイトルへ', width / 2, panelTop + panelHeight - 22);
    textStyle(NORMAL);
}

function drawAchievementNotice() {
    if (achievementNoticeFrames <= 0 || achievementsScreen) return;
    const achievement = achievements.find(item => item.id === recentAchievement);
    if (!achievement) {
        achievementNoticeFrames = 0;
        startNextAchievementNotice();
        return;
    }
    const totalFrames = 210;
    const entrance = constrain((totalFrames - achievementNoticeFrames) / 18, 0, 1);
    const slide = 1 - Math.pow(1 - entrance, 3);
    const fade = min(1, achievementNoticeFrames / 28);
    const toastWidth = min(width - 24, 320);
    const noticePosition = getAchievementNoticePosition();
    const toastX = lerp(-toastWidth / 2, noticePosition.x, slide);
    const toastY = noticePosition.y;

    push();
    rectMode(CENTER);
    noStroke();
    drawingContext.shadowBlur = 22 * fade;
    drawingContext.shadowColor = `rgba(85, 205, 255, ${0.42 * fade})`;
    fill(5, 13, 27, 242 * fade);
    rect(toastX, toastY, toastWidth, 60, 12);
    drawingContext.shadowBlur = 0;
    stroke(90, 190, 225, 190 * fade);
    noFill();
    rect(toastX, toastY, toastWidth, 60, 12);
    noStroke();
    fill(255, 213, 125, 245 * fade);
    rect(toastX, toastY - 28, toastWidth - 28, 2, 1);
    fill(255, 220, 145, 235 * fade);
    ellipse(toastX - toastWidth / 2 + 31, toastY, 36, 36);
    fill(18, 30, 48, 255 * fade);
    ellipse(toastX - toastWidth / 2 + 31, toastY, 29, 29);
    fill(255, 220, 145, 255 * fade);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(17);
    text('✦', toastX - toastWidth / 2 + 31, toastY);
    textAlign(LEFT, CENTER);
    fill(135, 220, 245, 255 * fade);
    textSize(8);
    text('ACHIEVEMENT UNLOCKED', toastX - toastWidth / 2 + 57, toastY - 11);
    fill(240, 248, 255, 255 * fade);
    textSize(14);
    text(achievement.title, toastX - toastWidth / 2 + 57, toastY + 10);
    textAlign(RIGHT, CENTER);
    fill(175, 205, 225, 230 * fade);
    textSize(9);
    text(`${playerRecord.achievements.length} / ${achievements.length}`,
        toastX + toastWidth / 2 - 15, toastY + 12);
    textStyle(NORMAL);
    pop();
    achievementNoticeFrames--;
    if (achievementNoticeFrames <= 0) startNextAchievementNotice();
}

function drawResult(message) {
    const isGameOver = message === 'GAME OVER';
    const pulse = sin(frameCount * (isGameOver ? 0.18 : 0.08)) * 0.5 + 0.5;
    const accent = isGameOver ? resultAccents.gameOver : resultAccents.clear;

    push();
    translate(width / 2, height / 2);
    for (let ray = 0; ray < 18; ray++) {
        const angle = TWO_PI * ray / 18 + frameCount * (isGameOver ? 0.012 : 0.004);
        const inner = isGameOver ? 115 : 90;
        const outer = 260 + sin(frameCount * 0.06 + ray) * 28;
        stroke(accent[0], accent[1], accent[2], isGameOver ? 18 : 24);
        strokeWeight(ray % 3 === 0 ? 3 : 1);
        line(cos(angle) * inner, sin(angle) * inner, cos(angle) * outer, sin(angle) * outer);
    }
    pop();

    noStroke();
    for (let spark = 0; spark < 34; spark++) {
        const x = (spark * 97 + frameCount * (isGameOver ? 2.2 : 0.7)) % width;
        const y = (spark * 137 + frameCount * (isGameOver ? 3.8 : 1.4)) % height;
        fill(accent[0], accent[1], accent[2], 70 + sin(frameCount * 0.12 + spark) * 55);
        ellipse(x, y, spark % 5 === 0 ? 5 : 2.5);
    }

    const panelY = height / 2;
    drawingContext.shadowBlur = isGameOver ? 32 + pulse * 18 : 28;
    drawingContext.shadowColor = isGameOver ? resultAccentShadows.gameOver : resultAccentShadows.clear;
    fill(5, 10, 23, 235);
    rect(width / 2, panelY, 480, 300, 18);
    drawingContext.shadowBlur = 0;
    stroke(accent[0], accent[1], accent[2], 170 + pulse * 80);
    strokeWeight(2);
    noFill();
    rect(width / 2, panelY, 480, 300, 18);
    noStroke();

    textAlign(CENTER, CENTER);
    fill(accent[0], accent[1], accent[2], 205 + pulse * 50);
    textSize(42);
    textStyle(BOLD);
    text(message, width / 2, panelY - 82);
    textStyle(NORMAL);
    fill(255);
    textSize(17);
    text(isGameOver ? 'もう一度挑戦してみよう' : '今回の戦績を記録した', width / 2, panelY - 34);
    fill(205, 220, 235);
    textSize(15);
    text(`スコア  ${score}`, width / 2, panelY + 8);

    fill(255, 235, 155);
    textSize(16);
    text('R  リセット', width / 2 - 95, panelY + 66);
    fill(175, 215, 240);
    text('T  タイトルへ', width / 2 + 105, panelY + 66);
    fill(150, 180, 205);
    textSize(12);
    text('R / T でゲームを再始動', width / 2, panelY + 112);
}

function playTone(frequency, duration, volume, type) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function resetGame() {
    if (!titleScreen && !runRecordSaved) {
        finalizeRun(false);
    }
    gameOver = false;
    clear = false;
    titleScreen = false;
    invulnerabilityFrames = 0;
    bullets = [];
    enemyBullets = [];
    enemyBombs = [];
    chargedBeams = [];
    beamChargeParticles = [];
    runBossAttackHits = {};
    runRecordSaved = false;
    runKills = 0;
    runBossesDefeated = 0;
    runMaxStage = 1;
    beamCharge = 0;
    beamMaxChargeHoldMs = 0;
    beamMaxChargeLastUpdatedAt = null;
    beamCharging = false;
    beamFireCooldown = 0;
    boss = null;
    bossEntranceFrames = 0;
    effectParticles = [];
    impactRings = [];
    screenShakeFrames = 0;
    screenShakeStrength = 0;
    impactFlash = 0;
    killCombo = 0;
    comboLastKillFrame = -Infinity;
    comboBannerFrames = 0;
    bossDefeatFrames = 0;
    score = 0;
    lives = maxLives;
    stage = 1;
    upgradeSelection = false;
    upgradeLevels.rapidFire = 0;
    upgradeLevels.movement = 0;
    upgradeLevels.beam = 0;
    playerFireInterval = basePlayerFireInterval;
    playerBulletSpeed = basePlayerBulletSpeed;
    hardMode = false;
    enemySpeed = 0.8;
    initEnemies();
    initShields();
    player.x = width / 2;
    player.speed = basePlayerSpeed;
    shotCooldown = 0;
    simulationAccumulator = 0;
    simulationFrame = 0;
    lastSimulationUpdateAt = millis();
}

function startNewGame() {
    clearGameSave();
    resetGame();
    saveGameState(true);
}

function updateBeamCharge() {
    if (touchControls.beam && !beamCharging && beamFireCooldown <= 0) {
        beamCharging = true;
        beamMaxChargeHoldMs = 0;
        beamMaxChargeLastUpdatedAt = null;
    }

    const chargeKeyHeld = keyIsDown(66) || keyIsDown(98) || touchControls.beam;
    if (beamCharging && chargeKeyHeld) {
        const chargeRate = beamCharge >= beamChargeThreshold ? beamMaxChargeRate : beamChargeRate;
        beamCharge = min(maxBeamCharge, beamCharge + chargeRate);
        if (beamCharge >= maxBeamCharge) {
            const now = millis();
            if (beamMaxChargeLastUpdatedAt !== null) {
                beamMaxChargeHoldMs = min(beamSecretChargeDuration,
                    beamMaxChargeHoldMs + min(max(0, now - beamMaxChargeLastUpdatedAt), 100));
            }
            beamMaxChargeLastUpdatedAt = now;
        } else {
            beamMaxChargeHoldMs = 0;
            beamMaxChargeLastUpdatedAt = null;
        }
        for (let i = 0; i < 4; i++) {
            const angle = random(TWO_PI);
            const radius = random(55, 125);
            beamChargeParticles.push({
                x: player.x + cos(angle) * radius,
                y: player.y - 18 + sin(angle) * radius,
                vx: cos(angle + HALF_PI) * random(0.5, 2),
                vy: sin(angle + HALF_PI) * random(0.5, 2),
                size: random(2, 4),
                life: 48,
                maxLife: 48
            });
        }
    } else if (beamCharging) {
        releaseBeam();
    } else if (beamCharge > 0) {
        beamCharge = max(0, beamCharge - beamChargeDecayRate);
        if (beamCharge < maxBeamCharge) {
            beamMaxChargeHoldMs = 0;
            beamMaxChargeLastUpdatedAt = null;
        }
    }

    for (let i = beamChargeParticles.length - 1; i >= 0; i--) {
        const particle = beamChargeParticles[i];
        const dx = player.x - particle.x;
        const dy = player.y - 18 - particle.y;
        const distance = max(1, sqrt(dx * dx + dy * dy));

        if (beamCharging) {
            const pull = 0.18 + beamCharge / maxBeamCharge * 0.18;
            const speed = 2 + beamCharge / maxBeamCharge * 3;
            particle.vx = particle.vx * (1 - pull) + dx / distance * speed * pull;
            particle.vy = particle.vy * (1 - pull) + dy / distance * speed * pull;
        } else {
            particle.vx *= 0.96;
            particle.vy *= 0.96;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        if (particle.life <= 0 || (beamCharging && distance < 8)) {
            beamChargeParticles.splice(i, 1);
        }
    }
}

function releaseBeam() {
    if (!beamCharging) {
        return;
    }

    beamCharging = false;
    beamMaxChargeLastUpdatedAt = null;
    if (beamFireCooldown > 0 || beamCharge < beamChargeThreshold) {
        beamMaxChargeHoldMs = 0;
        return;
    }

    if (beamCharge >= beamChargeThreshold) {
        const isMaxCharged = beamCharge >= maxBeamCharge;
        const isPurple = isPurpleBeamReady();
        if (isPurple) unlockAchievement('purple-beam');
        const beamLength = 700 + beamCharge * 3.2;
        chargedBeams.push({
            x: player.x,
            y: player.y - beamLength / 2,
            width: (20 + beamCharge * 0.82) * (isPurple ? 1.5 : (isMaxCharged ? 1.2 : 1)),
            height: beamLength,
            life: chargedBeamLifetime,
            power: isPurple ? 160 : beamCharge,
            damage: (isPurple ? beamPurpleDamage : (isMaxCharged ? beamGoldenDamage : beamNormalDamage))
                * (1 + upgradeLevels.beam * beamDamageBonusPerLevel),
            enemyPowerCost: max(12, 18 - upgradeLevels.beam * 2),
            bossPowerCost: max(6, 9 - upgradeLevels.beam),
            golden: isMaxCharged && !isPurple,
            purple: isPurple
        });
        beamFireCooldown = 90;
        playTone(170, 0.28, 0.06, 'sawtooth');
    }

    beamCharge = 0;
    beamMaxChargeHoldMs = 0;
    beamMaxChargeLastUpdatedAt = null;
}

function isPurpleBeamReady() {
    return beamCharge >= maxBeamCharge && beamMaxChargeHoldMs >= beamSecretChargeDuration;
}

function keyPressed() {
    if (achievementsScreen) {
        if (keyCode === ESCAPE || key === 'A' || key === 'a') achievementsScreen = false;
        return false;
    }

    // Toggle hard mode while the game is running.
    if (titleScreen) {
        if (key === 'A' || key === 'a') {
            achievementsScreen = true;
        } else if (keyCode === ENTER) {
            if (!resumeSavedGame()) startNewGame();
        } else if (keyCode === 32 || key === 'N' || key === 'n' || keyCode === 78) {
            startNewGame();
        }
        return false;
    }

    if (upgradeSelection) {
        if (key === '1' || keyCode === 49) {
            chooseUpgrade(0);
        } else if (key === '2' || keyCode === 50) {
            chooseUpgrade(1);
        } else if (key === '3' || keyCode === 51) {
            chooseUpgrade(2);
        } else if (key === '4' || keyCode === 52) {
            chooseUpgrade(3);
        }
        return false;
    }

    if (gameOver || clear) {
        if (key === 'R' || key === 'r' || keyCode === 82) {
            resetGame();
        } else if (key === 'T' || key === 't' || keyCode === 84) {
            resetGame();
            titleScreen = true;
        }
        return false;
    }

    if (key === 'L' || key === 'l' || keyCode === 76) {
        hardMode = !hardMode;
        const difficulty = stageDifficulty[stage - 1] || stageDifficulty[0];
        enemySpeed = difficulty.enemySpeed * (hardMode ? 1.4 : 1);
        for (let enemy of enemies) {
            enemy.speed = enemySpeed;
        }
        if (boss) {
            boss.speed = difficulty.bossSpeed * (hardMode ? 1.15 : 1);
        }
        playTone(hardMode ? 180 : 440, 0.08, 0.03, 'square');
    }

    if ((key === 'B' || key === 'b' || keyCode === 66) && !beamCharging && beamFireCooldown <= 0) {
        beamCharging = true;
        beamMaxChargeHoldMs = 0;
        beamMaxChargeLastUpdatedAt = null;
    }

    if (key === 'R' || key === 'r' || keyCode === 82) {
        resetGame();
    }

    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW
        || keyCode === 32 || keyCode === 90 || keyCode === 66) {
        return false;
    }
}

function keyReleased() {
    if (key === 'B' || key === 'b' || keyCode === 66) {
        releaseBeam();
    }
}

function mousePressed() {
    if (achievementsScreen) {
        achievementsScreen = false;
        return false;
    }

    if (titleScreen) {
        if (mouseY >= height * 0.70 && mouseY <= height * 0.745
            && mouseX >= width / 2 - 130 && mouseX <= width / 2 + 130) {
            achievementsScreen = true;
            return false;
        }
        if (gameSaveAvailable && mouseX < width / 2) {
            if (!resumeSavedGame()) startNewGame();
        } else {
            startNewGame();
        }
        return false;
    }

    if (upgradeSelection) {
        const cardWidth = 160;
        const cardHeight = 248;
        const cardY = height / 2 + 24;
        const cardCenters = [84, 261, 439, 616];
        const cardTop = cardY - cardHeight / 2;
        for (let i = 0; i < cardCenters.length; i++) {
            if (mouseX >= cardCenters[i] - cardWidth / 2
                && mouseX <= cardCenters[i] + cardWidth / 2
                && mouseY >= cardTop
                && mouseY <= cardTop + cardHeight) {
                chooseUpgrade(i);
                return false;
            }
        }
        return false;
    }

    if (gameOver || clear) {
        const panelY = height / 2;
        if (mouseY >= panelY + 45 && mouseY <= panelY + 88) {
            if (mouseX >= width / 2 - 155 && mouseX <= width / 2 - 35) {
                resetGame();
            } else if (mouseX >= width / 2 + 35 && mouseX <= width / 2 + 175) {
                resetGame();
                titleScreen = true;
            }
        }
        return false;
    }
}



