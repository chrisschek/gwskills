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
/////////////////////// Random Skill List Generator
///////////////////////

const GEN_EMPTY_FILTERS = {
    'name': [],
    'camp': [],
    'prof': [],
    'attr': [],
    'include_pve_only': true, // TODO unimplemented
    'include_elites': true, // TODO unimplemented
}

const GEN_AUTOINCLUDE = [
    // These are indices in the master skill list
    1316,   // Resurrection Signet
    70,     // Comfort Animal
    918,    // "Fall Back!"
    11,     // Air Attunement
    128,    // Earth Attunement
    164,    // Fire Attunement
    439,    // Water Attunement
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
    return generateRandomSkillIdList(skillCount, GEN_EMPTY_FILTERS, GEN_AUTOINCLUDE);
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

/*
 * TODO: redo all of this so that:
 * when Generate button is pressed, generate skillIdList, then redirect to url+queryParam & load page
 * then we don't need to show the skill pool code at all
 */

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


/* Test run for main acct necro:

file:///Users/chris/dev/gwskills/view_skills/view.html?skillPoolCode=%7B%22version%22%3A%221.0%22%2C%22skillIdList%22%3A%5B2%2C3%2C7%2C8%2C11%2C12%2C13%2C16%2C18%2C19%2C25%2C26%2C27%2C28%2C29%2C31%2C33%2C36%2C38%2C52%2C53%2C54%2C57%2C58%2C59%2C63%2C69%2C70%2C73%2C75%2C79%2C82%2C85%2C90%2C98%2C100%2C102%2C103%2C104%2C106%2C107%2C108%2C111%2C114%2C117%2C122%2C123%2C126%2C128%2C131%2C137%2C139%2C147%2C148%2C150%2C151%2C154%2C159%2C161%2C167%2C169%2C171%2C172%2C173%2C175%2C185%2C186%2C188%2C190%2C200%2C202%2C206%2C212%2C229%2C230%2C231%2C232%2C234%2C235%2C236%2C237%2C241%2C242%2C244%2C245%2C248%2C249%2C252%2C253%2C256%2C259%2C260%2C263%2C264%2C265%2C269%2C270%2C271%2C274%2C289%2C290%2C293%2C294%2C295%2C296%2C298%2C301%2C305%2C307%2C308%2C314%2C321%2C322%2C323%2C326%2C329%2C331%2C334%2C339%2C347%2C348%2C350%2C355%2C357%2C361%2C364%2C365%2C366%2C367%2C368%2C374%2C375%2C383%2C384%2C387%2C389%2C392%2C395%2C397%2C399%2C400%2C406%2C408%2C415%2C419%2C421%2C425%2C426%2C427%2C430%2C432%2C433%2C434%2C436%2C441%2C444%2C448%2C450%2C452%2C453%2C455%2C460%2C461%2C464%2C468%2C470%2C473%2C476%2C484%2C502%2C503%2C505%2C510%2C516%2C519%2C520%2C524%2C525%2C526%2C534%2C535%2C537%2C538%2C542%2C550%2C554%2C557%2C560%2C561%2C564%2C573%2C575%2C576%2C587%2C588%2C592%2C596%2C597%2C599%2C602%2C604%2C606%2C607%2C608%2C609%2C615%2C617%2C619%2C621%2C626%2C628%2C629%2C632%2C634%2C638%2C639%2C642%2C648%2C650%2C652%2C659%2C671%2C672%2C680%2C685%2C687%2C689%2C692%2C705%2C707%2C709%2C710%2C711%2C713%2C716%2C717%2C718%2C721%2C722%2C724%2C727%2C729%2C734%2C738%2C739%2C741%2C744%2C746%2C747%2C748%2C751%2C752%2C753%2C757%2C761%2C763%2C767%2C779%2C780%2C781%2C785%2C786%2C788%2C792%2C794%2C797%2C798%2C799%2C803%2C804%2C806%2C807%2C808%2C813%2C815%2C821%2C825%2C826%2C827%2C830%2C837%2C844%2C846%2C851%2C852%2C855%2C857%2C859%2C860%2C861%2C862%2C864%2C867%2C871%2C874%2C875%2C881%2C882%2C883%2C886%2C894%2C895%2C898%2C904%2C906%2C907%2C910%2C922%2C923%2C924%2C926%2C928%2C930%2C931%2C933%2C934%2C937%2C942%2C944%2C948%2C952%2C953%2C955%2C960%2C964%2C965%2C966%2C967%2C968%2C969%2C974%2C978%2C981%2C994%2C996%2C999%2C1000%2C1002%2C1008%2C1009%2C1011%2C1018%2C1019%2C1023%2C1030%2C1031%2C1034%2C1041%2C1044%2C1045%2C1047%2C1048%2C1051%2C1054%2C1070%2C1071%2C1072%2C1073%2C1074%2C1077%2C1079%2C1081%2C1084%2C1087%2C1094%2C1099%2C1101%2C1105%2C1110%2C1111%2C1113%2C1114%2C1116%2C1118%2C1121%2C1128%2C1129%2C1131%2C1133%2C1136%2C1141%2C1143%2C1144%2C1145%2C1146%2C1150%2C1151%2C1154%2C1155%2C1158%2C1162%2C1165%2C1166%2C1169%2C1173%2C1175%2C1186%2C1187%2C1193%2C1195%2C1196%2C1197%2C1202%2C1204%2C1207%2C1208%2C1213%2C1214%2C1215%2C1222%2C1224%2C1226%2C1228%2C1235%2C1241%2C1252%2C1255%2C1268%2C1270%2C1271%2C1277%2C1279%2C1281%2C1283%2C1292%2C1297%2C1299%2C1302%2C1304%2C1307%2C1310%2C1312%2C1316%2C1317%5D%7D

 */
