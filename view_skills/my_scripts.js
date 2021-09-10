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
    'Resurrection Signet',
    'Comfort Animal',
]

function generateRandomSkillPool(poolSize, filters, autoinclude) {

}


///////////////////////
/////////////////////// Table creation
///////////////////////

function constructTable(tableSelector, skillList) {

    var table = $(tableSelector);

    var tbody = $('<tbody/>');
    table.append(tbody);

    for (var i = 0; i < skillList.length; i++) {
        var skill = skillList[i];
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
    var campaign = skill.camp;
    return $('<td/>').html(campaign).addClass('skills-table-cell');
}

///////////////////////
/////////////////////// Filters
///////////////////////

function enableFilterButtons() {
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
    var skillsList = SKILL_LIST_MASTER;
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

    enableFilterButtons();
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