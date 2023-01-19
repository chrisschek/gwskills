const TAG_TANGO_SACRIFICE = '<img src="static/Tango-sacrifice.png" class="tango"/>';
const TAG_TANGO_ADRENALINE = '<img src="static/Tango-adrenaline.png" class="tango"/>';
const TAG_TANGO_ENERGY = '<img src="static/Tango-energy.png" class="tango"/>';
const TAG_TANGO_ACTIVATION = '<img src="static/Tango-activation-darker.png" class="tango"/>';
const TAG_TANGO_RECHARGE = '<img src="static/Tango-recharge-darker.png" class="tango"/>';

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
    var link = $('<a/>').html(name).attr('href', href).attr('target', '_blank').attr('rel', 'noopener noreferrer').addClass('skill-name');
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
/////////////////////// Document ready function
///////////////////////

var skillsTable; // DataTable (?) object

function tryLoadingSkillPoolFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const deckCode = urlParams.get('deckCode');

    console.log('deckCode query param: ' + deckCode);

    if (!deckCode) {
        throw "Query param 'deckCode' is missing or empty";
    }

    let skillIdList = decodeSkillIdList(deckCode);
    if (skillIdList && skillIdList.length > 0) {
        displaySkillPool(skillIdList);
    }
}

$(document).ready(function(){
    prepareTableFilterButtons();

    try {
        tryLoadingSkillPoolFromQueryParams();
    }
    catch(err) {
        $('#skills-table-container').html("Uh oh, something went wrong while loading the deck...").css("color", "red");
        console.error(err);
    }
});
