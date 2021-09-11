const VERSION = '1.0';

const TAG_TANGO_SACRIFICE = '<img src="static/Tango-sacrifice.png" class="tango"/>';
const TAG_TANGO_ADRENALINE = '<img src="static/Tango-adrenaline.png" class="tango"/>';
const TAG_TANGO_ENERGY = '<img src="static/Tango-energy.png" class="tango"/>';
const TAG_TANGO_ACTIVATION = '<img src="static/Tango-activation-darker.png" class="tango"/>';
const TAG_TANGO_RECHARGE = '<img src="static/Tango-recharge-darker.png" class="tango"/>';

const PROF = {
    'war': { 'id': 0, 'name': 'Warrior', 'class': 'row-war', },
    'ran': { 'id': 1, 'name': 'Ranger', 'class': 'row-ran', },
    'mon': { 'id': 2, 'name': 'Monk', 'class': 'row-mon', },
    'nec': { 'id': 3, 'name': 'Necromancer', 'class': 'row-nec', },
    'mes': { 'id': 4, 'name': 'Mesmer', 'class': 'row-mes', },
    'ele': { 'id': 5, 'name': 'Elementalist', 'class': 'row-ele', },
    'ass': { 'id': 6, 'name': 'Assassin', 'class': 'row-ass', },
    'rit': { 'id': 7, 'name': 'Ritualist', 'class': 'row-rit', },
    'par': { 'id': 8, 'name': 'Paragon', 'class': 'row-par', },
    'der': { 'id': 9, 'name': 'Dervish', 'class': 'row-der', },
    'com': { 'id': 10, 'name': 'Common', 'class': 'row-com', },
};

const CAMP = {
    'cor': 'Core',
    'pro': 'Prophecies',
    'fac': 'Factions',
    'nig': 'Nightfall',
    'eye': 'Eye of the North',
};

///////////////////////
/////////////////////// Randomization
///////////////////////

var filters = {
    'name': [],
    'camp': [],
    'prof': [],
    'attr': [],
    'include_pve_only': true, // TODO unimplemented
    'include_elites': true, // TODO unimplemented
}

var autoinclude = [
    // These are indices in the master skill list
    1316, // Resurrection Signet
    70, // Comfort Animal
]

function generateRandomSkillPool(poolSize, filters, autoinclude) {
    // Return value. An array of skill id's
    const randomizedSkillPool = [];

    // Source: https://stackoverflow.com/a/12646864
    let shuffleArray = function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // Shuffle the order of the master skill list. Just contains id's (indices of the actual master list).
    let masterSkillPool = Array(SKILL_MASTER_COUNT);
    for (let i = 0; i < SKILL_MASTER_COUNT; i++) {
        masterSkillPool[i] = i;
    }
    shuffleArray(masterSkillPool);

    // Add autoincluded skills
    for (let skillId of autoinclude) {
        randomizedSkillPool.push(skillId);
    }

    // isSkillAllowed checks a skill against filters
    let isSkillAllowed = function(skillId) {
        let skill = SKILL_MASTER_LIST[skillId];
        if (filters.name.includes(skill.name)) {
            return false;
        } else if (filters.camp.includes(skill.camp)) {
            return false;
        } else if (filters.prof.includes(skill.prof)) {
            return false;
        } else if (filters.attr.includes(skill.attr)) {
            return false;
        } else {
            return true;
        }
    };

    // Move skill id's from shuffled master list to the randomizedSkillPool to create a smaller randomized list
    for (let skillId of masterSkillPool) {
        if (randomizedSkillPool.length >= poolSize) {
            break;
        }
        if (!autoinclude.includes(skillId) && isSkillAllowed(skillId)) {
            randomizedSkillPool.push(skillId);
        }
    }

    console.log('Randomized skill pool (id\'s): ' + randomizedSkillPool);
    return randomizedSkillPool;
}

///////////////////////
/////////////////////// Skill pool generation
///////////////////////

function prepareSkillPoolGeneratorElements() {
    // Skill count slider
    let updateSkillCountSliderSelected = function() {
        let valPercent = $('input#skillcount-slider').val();
        let valNumber = Math.floor(valPercent * SKILL_MASTER_COUNT / 100.);
        let str = `${valPercent}% (${valNumber} skills)`;
        $('span#skillcount-slider-selected-number').html(str);
    };
    $('input#skillcount-slider').on('input', updateSkillCountSliderSelected);
    updateSkillCountSliderSelected();

    // 'Generate' button
    $('button#generate').on('click', function() {
        if (skillsTable != null) {
            clearTable();
        }

        var skillPool = generateRandomSkillPool(20, filters, autoinclude);
        constructTable('#skills-table', skillPool);
        saveSkillIdList(skillPool);
    });
}

///////////////////////
/////////////////////// Table operations
///////////////////////

function constructTable(tableSelector, skillIdList) {
    if (skillsTable != null) {
        alert('Error: attempting to construct table when a table already exists');
        return;
    }

    setTableFilterToAll(); // make sure everything's visible when a new table is created

    var table = $(tableSelector);

    var tbody = $('#skills-table > tbody');
    table.append(tbody);

    for (var i = 0; i < skillIdList.length; i++) {
        var skillId = skillIdList[i];
        var skill = SKILL_MASTER_LIST[skillId];
        // console.log('Adding skill: ' + skill.name);

        var row = $('<tr/>');
        row.addClass(PROF[skill.prof]['class']);

        row.append(createProfessionCell(skill));
        row.append(createIconCell(skill));
        row.append(createNameCell(skill));
        row.append(createDescriptionCell(skill));
        row.append(createCostsCell(skill));
        row.append(createAttributeCell(skill));
        row.append(createCampaignCell(skill));

        tbody.append(row);
    }

    // Convert to DataTable. https://datatables.net/index
    skillsTable = $('#skills-table').DataTable({
        paging: false,
        columnDefs: [
            // Hide Profession column. It's used for ordering only
            { targets: 0, visible: false },
            // Disables features on 'Icon' column
            { targets: 1, orderable: false, searchable: false },
            // Disables features on 'Costs' column
            { targets: 4, orderable: false, searchable: false },
        ],
        // Always keep things sorted by profession
        orderFixed: [ 0, 'asc' ],
        // Initial ordering by attribute, then name
        order: [[ 5, 'asc' ], [ 2, 'asc' ]],
    });
}

function clearTable() {
    if (skillsTable == null) {
        // table is already clear
        return;
    }

    skillsTable.clearTable();
    skillsTable.destroy();
    skillsTable = null;

    // $('#skills-table > tbody').empty();
    $('p#skill-pool-code').html('No skill pool loaded');
}

function createProfessionCell(skill) {
    // This will be a hidden column with ID's to enforce a specific ordering
    var profId = PROF[skill.prof]['id'];
    return $('<td/>').html(profId);
}

function createIconCell(skill) {
    var iconUrl = getIconUrl(skill);
    var imgTag = $('<img/>').attr('src', iconUrl).addClass('center-icon');
    return $('<td/>').html(imgTag);
}

function createNameCell(skill) {
    var name = skill.name;
    var href = getWikiUrl(skill);
    var link = $('<a/>').html(name).attr('href', href).addClass('skill-name');
    return $('<td/>').html(link).addClass('skills-table-cell');
}

function createDescriptionCell(skill) {
    var desc = skill.desc;
    return $('<td/>').html(desc).addClass('skills-table-cell').attr('style', 'text-align:left;');
}

function createCostsCell(skill) {
    var costs = $('<div/>');

    if (skill.sac != null) {
        var span = $('<span/>').addClass('no-wrap').html(skill.sac + TAG_TANGO_SACRIFICE);
        costs.append(span);
    }
    if (skill.adr != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skill.adr + ' ' + TAG_TANGO_ADRENALINE);
        costs.append(span);
    }
    if (skill.ene != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skill.ene + ' ' + TAG_TANGO_ENERGY);
        costs.append(span);
    }
    if (skill.act != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skill.act + ' ' + TAG_TANGO_ACTIVATION);
        costs.append(span);
    }
    if (skill.rec != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skill.rec + ' ' + TAG_TANGO_RECHARGE);
        costs.append(span);
    }

    return $('<td/>').html(costs).addClass('skills-table-cell');
}

function createAttributeCell(skill) {
    var attribute = skill.attr;
    return $('<td/>').html(attribute).addClass('skills-table-cell');
}

function createCampaignCell(skill) {
    var campaign = CAMP[skill.camp];
    return $('<td/>').html(campaign).addClass('skills-table-cell');
}

///////////////////////
/////////////////////// Table Filters
///////////////////////

function setTableFilterToAll() {
    console.log('Doing filter-all');
    for (let prof in PROF) {
        let className = PROF[prof]['class'];
        $('.' + className).show();
    }
}

function enableTableFilterButtons() {
    $('#filter-all').click(setTableFilterToAll);

    let hideAllFilterTypes = function() {
        for (let prof in PROF) {
            let className = PROF[prof]['class'];
            $('.' + className).hide();
        }
    }

    for (let prof in PROF) {
        $('#filter-' + prof).click(function(){
            console.log('Doing filter-' + prof);
            hideAllFilterTypes();
            $('.row-' + prof).show();
        });
    }
}

///////////////////////
/////////////////////// Skill pool saving/loading
///////////////////////

function saveSkillIdList(skillIdList) {
    let encoded = encodeSkillIdList(skillIdList);
    $('p#skill-pool-code').html(encoded);
}

function encodeSkillIdList(skillIdList) {
    let skillPool = {
        'version': VERSION,
        'skillIdList': skillIdList,
    };
    let json = JSON.stringify(skillPool);
    return window.btoa(json);
}

function loadSkillIdListFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSkillPool = urlParams.get('skillPool');
    let skillIdList = decodeSkillIdList(encodeSkillIdList);
    return skillIdList;
}

function decodeSkillIdList(encoded) {
    let json = window.atob(encoded);
    let skillPool = JSON.parse(json);
    if (skillPool.version != VERSION) {
        alert('This skill pool is incompatible as it was created with a different version.'
            + '\nSkill pool version: ' + skillPool.version
            + '\nCurrent app version: ' + VERSION);
        return [];
    }
    return skillPool.skillIdList;
}

///////////////////////
/////////////////////// Document ready function
///////////////////////

var skillsTable; // DataTable (?) object

$(document).ready(function(){

    prepareSkillPoolGeneratorElements();

    // console.log('Starting JSON parse & skills-table creation');
    // var skillPool = generateRandomSkillPool(20, filters, autoinclude);
    // constructTable('#skills-table', skillPool);
    // console.log('Finished creating table');

    // saveSkillIdList(skillPool);

    // console.log('Starting DataTable creation');
    // // https://datatables.net/index
    // skillsTable = $('#skills-table').DataTable({
    //     paging: false,
    //     columnDefs: [
    //         // Hide Profession column. It's used for ordering only
    //         { targets: 0, visible: false },
    //         // Disables features on 'Icon' column
    //         { targets: 1, orderable: false, searchable: false },
    //         // Disables features on 'Costs' column
    //         { targets: 4, orderable: false, searchable: false },
    //     ],
    //     // Always keep things sorted by profession
    //     orderFixed: [ 0, 'asc' ],
    //     // Initial ordering by attribute, then name
    //     order: [[ 5, 'asc' ], [ 2, 'asc' ]],
    // });
    // console.log('Finished DataTable creation');

    enableTableFilterButtons();
});

// Would be nice to add an "elite":true/false to the JSON, then use that to make elites stand out more in the table