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

function generateRandomSkillIdList(poolSize, filters, autoinclude) {
    // Return value. An array of skill id's
    let randomizedSkillIdList = [];

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
        randomizedSkillIdList.push(skillId);
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
        if (randomizedSkillIdList.length >= poolSize) {
            break;
        }
        if (!autoinclude.includes(skillId) && isSkillAllowed(skillId)) {
            randomizedSkillIdList.push(skillId);
        }
    }

    // Sort array so so that two identical skill lists will have the same code
    randomizedSkillIdList = randomizedSkillIdList.sort(function (a, b) {  return a - b;  });
    console.log('Randomized skill pool (id\'s): ' + randomizedSkillIdList);
    return randomizedSkillIdList;
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
        let skillIdList = generateNewSkillPoolFromUserOptions();
        displaySkillPool(skillIdList);
    });
}

function generateNewSkillPoolFromUserOptions() {
    // TODO implement filters here
    let skillCountPercent = $('input#skillcount-slider').val();
    let skillCount = Math.floor(skillCountPercent * SKILL_MASTER_COUNT / 100.);
    return generateRandomSkillIdList(skillCount, filters, autoinclude);
}

///////////////////////
/////////////////////// Table operations
///////////////////////

function displaySkillPool(skillIdList) {
    if (skillsTable != null) {
        clearSkillsTable();
    }

    constructSkillsTable(skillIdList);
    showSkillPoolCode(skillIdList);
    setTableFilterToAll(); // make sure everything's visible when a new table is created
}

function constructSkillsTable(skillIdList) {
    if (skillsTable != null) {
        alert('Error: attempting to construct table when a table already exists');
        return;
    }
    
    let table = $('#skills-table');
    let tbody = $('#skills-table > tbody');

    for (var i = 0; i < skillIdList.length; i++) {
        let skillId = skillIdList[i];
        let skill = SKILL_MASTER_LIST[skillId];
        // console.log('Adding skill: ' + skill.name);

        let row = $('<tr/>');
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
        autoWidth: false,
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

function clearSkillsTable() {
    if (skillsTable == null) {
        // table is already clear
        return;
    }

    skillsTable.clear();
    skillsTable.destroy();
    skillsTable = null;

    // $('#skills-table > tbody').empty();
    // $('p#skill-pool-code').html('No skill pool loaded');
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

function prepareTableFilterButtons() {
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

function showSkillPoolCode(skillIdList) {
    let encoded = encodeSkillIdList(skillIdList);
    $('textarea#skill-pool-code').html(encoded);
}

function encodeSkillIdList(skillIdList) {
    let skillPool = {
        'version': VERSION,
        'skillIdList': skillIdList,
    };
    let json = JSON.stringify(skillPool);
    let uriEncodedJson = encodeURIComponent(json);
    // return window.btoa(uriEncodedJson);
    return uriEncodedJson;
}

function tryLoadingSkillPoolFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const skillPoolCode = urlParams.get('skillPoolCode');

    console.log('skillPoolCode query param: ' + skillPoolCode);

    if (skillPoolCode) {
        let skillIdList = decodeSkillIdList(skillPoolCode);
        if (skillIdList && skillIdList.length > 0) {
            displaySkillPool(skillIdList);
        }
    }
}

function decodeSkillIdList(skillPoolJson) {
    let skillPool = JSON.parse(skillPoolJson);
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
    prepareTableFilterButtons();

    tryLoadingSkillPoolFromQueryParams();
});