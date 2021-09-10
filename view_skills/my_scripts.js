const TAG_TANGO_SACRIFICE = '<img src="static/Tango-sacrifice.png" class="tango"/>';
const TAG_TANGO_ADRENALINE = '<img src="static/Tango-adrenaline.png" class="tango"/>';
const TAG_TANGO_ENERGY = '<img src="static/Tango-energy.png" class="tango"/>';
const TAG_TANGO_ACTIVATION = '<img src="static/Tango-activation-darker.png" class="tango"/>';
const TAG_TANGO_RECHARGE = '<img src="static/Tango-recharge-darker.png" class="tango"/>';

const PROF = {
    'war': { 'name': 'Warrior', 'class': 'row-war', },
    'ran': { 'name': 'Ranger', 'class': 'row-ran', },
    'mon': { 'name': 'Monk', 'class': 'row-mon', },
    'nec': { 'name': 'Necromancer', 'class': 'row-nec', },
    'mes': { 'name': 'Mesmer', 'class': 'row-mes', },
    'ele': { 'name': 'Elementalist', 'class': 'row-ele', },
    'ass': { 'name': 'Assassin', 'class': 'row-ass', },
    'rit': { 'name': 'Ritualist', 'class': 'row-rit', },
    'par': { 'name': 'Paragon', 'class': 'row-par', },
    'der': { 'name': 'Dervish', 'class': 'row-der', },
    'com': { 'name': 'Common', 'class': 'row-com', },
    null: { 'name': 'Common', 'class': 'row-com', },
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

    // Move skill id's from shuffled master list to the randomizedSkillPool, while checking against filters
    let isSkillAllowed = function(skillId) {
        // TODO implement me
        return true;
    };
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
/////////////////////// Table creation
///////////////////////

function constructTable(tableSelector, skillIdList) {

    var table = $(tableSelector);

    var tbody = $('<tbody/>');
    table.append(tbody);

    for (var i = 0; i < skillIdList.length; i++) {
        var skillId = skillIdList[i];
        var skill = SKILL_MASTER_LIST[skillId];
        // console.log('Adding skill: ' + skill.name);

        var row = $('<tr/>');
        row.addClass(PROF[skill.prof]['class']);

        row.append(createIconCell(skill));
        row.append(createNameCell(skill));
        row.append(createDescriptionCell(skill));
        row.append(createCostsCell(skill));
        row.append(createAttributeCell(skill));
        row.append(createCampaignCell(skill));

        tbody.append(row);
    }
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

function enableTableFilterButtons() {
    $('#filter-all').click(function(){
        console.log('Doing filter-all');
        for (var key in PROF) {
            var className = PROF[key]['class'];
            $('.' + className).show();
        }
    });

    let hideAllFilterTypes = function() {
        for (var key in PROF) {
            var className = PROF[key]['class'];
            $('.' + className).hide();
        }
    }

    var filterTypes = ['war', 'ran', 'mon', 'nec', 'mes', 'ele', 'ass', 'rit', 'par', 'der', 'com'];

    for (let filterType of filterTypes) {
        $('#filter-' + filterType).click(function(){
            console.log('Doing filter-' + filterType);
            hideAllFilterTypes();
            $('.row-' + filterType).show();
        });
    }
}

///////////////////////
/////////////////////// Document ready function
///////////////////////

var skillsTable;

$(document).ready(function(){

    console.log('Starting JSON parse & skills-table creation');
    var skillsList = generateRandomSkillPool(10, filters, autoinclude);
    constructTable('#skills-table', skillsList);
    console.log('Finished creating table');

    console.log('Starting DataTable creation');
    skillsTable = $('#skills-table').DataTable({
        paging: false,
        columnDefs: [
            // Disables features on zeroth column ('Icon' column)
            { targets: 0, orderable: false, searchable: false },
            // Disables features on third column ('Costs' column)
            { targets: 3, orderable: false, searchable: false },
          ]
    });
    console.log('Finished DataTable creation');

    enableTableFilterButtons();
});


// Table sorting possibility:
// https://datatables.net/index

// Here's a way to do filters: hide/show each of the ".warrior-tint" or whatever classes to hide/show rows
// eg.
//   $('.warrior-tint').hide();
// maybe rename to: $('.row-warrior').hide();
// and of course use show() to show
// https://www.w3schools.com/jquery/jquery_hide_show.asp

// Would be nice to add an "elite":true/false to the JSON, then use that to make elites stand out more in the table