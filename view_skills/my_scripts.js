const TAG_TANGO_SACRIFICE = '<img src="static/Tango-sacrifice.png" class="tango"/>';
const TAG_TANGO_ADRENALINE = '<img src="static/Tango-adrenaline.png" class="tango"/>';
const TAG_TANGO_ENERGY = '<img src="static/Tango-energy.png" class="tango"/>';
const TAG_TANGO_ACTIVATION = '<img src="static/Tango-activation-darker.png" class="tango"/>';
const TAG_TANGO_RECHARGE = '<img src="static/Tango-recharge-darker.png" class="tango"/>';

const PROF_TO_CSS_CLASS = {
    'Warrior': 'row-war',
    'Ranger': 'row-ran',
    'Monk': 'row-mon',
    'Necromancer': 'row-nec',
    'Mesmer': 'row-mes',
    'Elementalist': 'row-ele',
    'Assassin': 'row-ass',
    'Ritualist': 'row-rit',
    'Paragon': 'row-par',
    'Dervish': 'row-der',
    'Common': 'row-com',
    null: 'row-com',
};

///////////////////////
/////////////////////// Table creation
///////////////////////

function constructTable(tableSelector, list) {

    var table = $(tableSelector);

    var tbody = $('<tbody/>');
    table.append(tbody);

    for (var i = 0; i < list.length; i++) {
        var skillObj = list[i];

        var row = $('<tr/>');
        row.addClass(PROF_TO_CSS_CLASS[skillObj.profession])

        row.append(createIconCell(skillObj));
        row.append(createNameCell(skillObj));
        row.append(createDescriptionCell(skillObj));
        row.append(createCostsCell(skillObj));
        row.append(createAttributeCell(skillObj));
        row.append(createCampaignCell(skillObj));

        tbody.append(row);
    }
}

function createIconCell(skillObj) {
    var imgTag = $('<img/>').attr('src', skillObj.image_url).addClass('center-icon');
    return $('<td/>').html(imgTag);
}

function createNameCell(skillObj) {
    var name = skillObj.name;
    var href = skillObj.url;
    var link = $('<a/>').html(name).attr('href', href).addClass('skill-name');
    return $('<td/>').html(link).addClass('skills-table-cell');
}

function createDescriptionCell(skillObj) {
    var desc = skillObj.description;
    return $('<td/>').html(desc).addClass('skills-table-cell').attr('style', 'text-align:left;');
}

function createCostsCell(skillObj) {
    var costs = $('<div/>');

    if (skillObj['sacrifice'] != null) {
        var span = $('<span/>').addClass('no-wrap').html(skillObj['sacrifice'] + TAG_TANGO_SACRIFICE);
        costs.append(span);
    }
    if (skillObj['adrenaline'] != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skillObj['adrenaline'] + ' ' + TAG_TANGO_ADRENALINE);
        costs.append(span);
    }
    if (skillObj['energy'] != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skillObj['energy'] + ' ' + TAG_TANGO_ENERGY);
        costs.append(span);
    }
    if (skillObj['activation_time'] != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skillObj['activation_time'] + ' ' + TAG_TANGO_ACTIVATION);
        costs.append(span);
    }
    if (skillObj['recharge_time'] != null) {
        var span = $('<span/>').addClass('no-wrap').html('  ' + skillObj['recharge_time'] + ' ' + TAG_TANGO_RECHARGE);
        costs.append(span);
    }

    return $('<td/>').html(costs).addClass('skills-table-cell');
}

function createAttributeCell(skillObj) {
    var attribute = skillObj.attribute;
    return $('<td/>').html(attribute).addClass('skills-table-cell');
}

function createCampaignCell(skillObj) {
    var campaign = skillObj.campaign;
    return $('<td/>').html(campaign).addClass('skills-table-cell');
}

///////////////////////
/////////////////////// Filters
///////////////////////

function enableFilterButtons() {
    $('#filter-all').click(function(){
        console.log('Doing filter-all');
        for (var key in PROF_TO_CSS_CLASS) {
            var className = PROF_TO_CSS_CLASS[key];
            $('.' + className).show();
        }
    });

    let hideAllFilterTypes = function() {
        for (var key in PROF_TO_CSS_CLASS) {
            var className = PROF_TO_CSS_CLASS[key];
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
    var allSkillsList = JSON.parse(allSkillsJson);
    constructTable('#skills-table', allSkillsList);
    console.log('Finished creating table');

    console.log('Starting DataTable creation');
    skillsTable = $('#skills-table').DataTable({
        paging: false,
        columnDefs: [
            // Disables features on first column ('Icon' column)
            { targets: 0, orderable: false, searchable: false }
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