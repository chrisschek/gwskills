
var skills_list = [
    {
        "name": "Order of the Vampire",
        "url": "https://wiki.guildwars.com/wiki/Order_of_the_Vampire",
        "image_url": "https://wiki.guildwars.com/images/3/39/Order_of_the_Vampire.jpg",
        "profession": "Necromancer",
        "campaign": "Prophecies",
        "attribute": "Blood Magic",
        "energy": "5",
        "adrenaline": null,
        "sacrifice": "17%",
        "activation_time": "2",
        "recharge_time": "5",
        "description": "\nElite Enchantment Spell. Enchants all party members (5 seconds.) These party members steal <span style=\"color: green; font-weight: bold;\">3...13...16</span> Health with each physical damage attack. <span style=\"color: #808080;\">Party members under another Necromancer enchantment are not affected.</span>"
    },
    {
        "name": "Orison of Healing",
        "url": "https://wiki.guildwars.com/wiki/Orison_of_Healing",
        "image_url": "https://wiki.guildwars.com/images/5/5f/Orison_of_Healing.jpg",
        "profession": "Monk",
        "campaign": "Core",
        "attribute": "Healing Prayers",
        "energy": "5",
        "adrenaline": null,
        "sacrifice": null,
        "activation_time": "1",
        "recharge_time": "2",
        "description": "\nSpell. Heals for <span style=\"color: green; font-weight: bold;\">20...60...70</span>."
    }
];

const SKILLS_FILE = 'test_skills.json';

// const TAG_TANGO_SACRIFICE = $('<img/>').attr('src', 'static/Tango-sacrifice.png').addClass('tango');
// const TAG_TANGO_ADRENALINE = $('<img/>').attr('src', 'static/Tango-adrenaline.png').addClass('tango');
// const TAG_TANGO_ENERGY = $('<img/>').attr('src', 'static/Tango-energy.png').addClass('tango');
// const TAG_TANGO_ACTIVATION = $('<img/>').attr('src', 'static/Tango-activation-darker.png').addClass('tango');
// const TAG_TANGO_RECHARGE = $('<img/>').attr('src', 'static/Tango-recharge-darker.png').addClass('tango');

const TAG_TANGO_SACRIFICE = '<img src="static/Tango-sacrifice.png" class="tango"/>';
const TAG_TANGO_ADRENALINE = '<img src="static/Tango-adrenaline.png" class="tango"/>';
const TAG_TANGO_ENERGY = '<img src="static/Tango-energy.png" class="tango"/>';
const TAG_TANGO_ACTIVATION = '<img src="static/Tango-activation-darker.png" class="tango"/>';
const TAG_TANGO_RECHARGE = '<img src="static/Tango-recharge-darker.png" class="tango"/>';

const PROF_TO_CSS_CLASS = {
    'Warrior': 'row-warrior',
    'Ranger': 'row-ranger',
    'Monk': 'row-monk',
    'Necromancer': 'row-necromancer',
    'Mesmer': 'row-mesmer',
    'Elementalist': 'row-elementalist',
    'Assassin': 'row-assassin',
    'Ritualist': 'row-ritualist',
    'Paragon': 'row-paragon',
    'Dervish': 'row-dervish',
    'Common': 'row-common',
    null: 'row-common',
};

function constructTable(tableSelector, list) {

    // // Traversing the JSON data
    // for (var i = 0; i < list.length; i++) {
    //     var row = $('<tr/>');   
    //     for (var colIndex = 0; colIndex < cols.length; colIndex++)
    //     {
    //         var val = list[i][cols[colIndex]];

    //         // If there is any key, which is matching
    //         // with the column name
    //         if (val == null) val = "";  
    //             row.append($('<td/>').html(val));
    //     }

    //     // Adding each row to the table
    //     $(table_selector).append(row);
    // }

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


$(document).ready(function(){

    console.log('Starting JSON parse & skills-table creation')
    var allSkillsList = JSON.parse(allSkillsJson)
    constructTable('#skills-table', allSkillsList)
    console.log('Finished creating table')

    $('#skills-table').DataTable({
        paging: false,
        columnDefs: [
            // Disables features on first column ('Icon' column)
            { targets: 0, orderable: false, searchable: false }
          ]
    });

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