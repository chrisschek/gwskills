///////////////////////
/////////////////////// Random Skill List Generator
///////////////////////

function generateRandomSkillIdList(poolSize, filters) {
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

    // Add whitelistd skills
    for (let skillId of filters.whitelist) {
        randomizedSkillIdList.push(skillId);
    }

    // isSkillAllowed checks a skill against filters
    let isSkillAllowed = function(skillId) {
        let skill = SKILL_MASTER_LIST[skillId];
        if (filters.blacklist.includes(skillId)) {
            return false;
        } else if (!filters.camp.includes(skill.camp)) {
            return false;
        } else if (!filters.prof.includes(skill.prof)) {
            return false;
        } else if (false /*!filters.attr.includes(skill.attr)*/) {
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
        if (!filters.whitelist.includes(skillId) && isSkillAllowed(skillId)) {
            randomizedSkillIdList.push(skillId);
        }
    }

    // Sort array so so that two identical skill lists will have the same code
    randomizedSkillIdList = randomizedSkillIdList.sort(function (a, b) {  return a - b;  });
    console.log('Randomized skill pool (id\'s): ' + randomizedSkillIdList);
    return randomizedSkillIdList;
}

///////////////////////
/////////////////////// UI elements setup
///////////////////////

const WHITELIST_DEFAULT_TEXT = "Resurrection Signet"
    + "\nComfort Animal"
    + "\n\"Fall Back!\""
    + "\nAir Attunement"
    + "\nEarth Attunement"
    + "\nFire Attunement"
    + "\nWater Attunement";

function preparewhitelistTextbox() {
    //$('textarea#gen-whitelist').html(WHITELIST_DEFAULT_TEXT);
    $('textarea#gen-whitelist').val(WHITELIST_DEFAULT_TEXT);
}

function prepareSkillCountSlider() {
    let updateSkillCountSliderSelected = function() {
        let valPercent = $('input#skillcount-slider').val();
        let valNumber = Math.floor(valPercent * SKILL_MASTER_COUNT / 100.);
        let str = `${valPercent}% (${valNumber} skills)`;
        $('span#skillcount-slider-selected-number').html(str);
    };
    $('input#skillcount-slider').on('input', updateSkillCountSliderSelected);
    updateSkillCountSliderSelected();
}

function prepareGenerateButton() {
    $('button#generate').on('click', function() {
        let skillIdList = generateNewSkillPoolFromUserOptions();
        let bitArray = new EncodableBitArray(SKILL_MASTER_COUNT);
        skillIdList.forEach(index => bitArray.setBit(index, 1));
        let deckCode = bitArray.toBase64();
        let url = "./table_view.html?deckCode=" + deckCode;
        window.location.assign(url);
    });
}

// call this from browser console for debugging
function generateNewSkillPoolFromUserOptions() {
    // TODO implement filters here
    let skillCountPercent = $('input#skillcount-slider').val();
    let skillCount = Math.floor(skillCountPercent * SKILL_MASTER_COUNT / 100.);
    let filters = readFilterInputs();
    console.log("Using filters: " + JSON.stringify(filters));
    return generateRandomSkillIdList(skillCount, filters);
}

$(document).ready(function(){
    preparewhitelistTextbox();
    prepareSkillCountSlider();
    prepareGenerateButton();
});

///////////////////////
/////////////////////// UI elements reading
///////////////////////

function readFilterInputs() {
    let campList = [];
    $('input.cb-camp').each(function() {
        if (this.checked) {
            campList.push(this.value);
        }
    });
    
    let profList = [];
    $('input.cb-prof').each(function() {
        if (this.checked) {
            profList.push(this.value);
        }
    });
    profList.push("com"); // always include common skills (basically just Resurrection Signet + PvE-Only skills)

    let includePveOnly = $('input#cb-pveonly').is(':checked');
    let includeElite = $('input#cb-elite').is(':checked');
    
    let whitelist = $('textarea#gen-whitelist').val().split('\n').map(str => str.trim()).filter(str => str.length > 0).map(lookupSkillId);
    let blacklist = $('textarea#gen-blacklist').val().split('\n').map(str => str.trim()).filter(str => str.length > 0).map(lookupSkillId);
    
    return {
        'camp': campList,
        'prof': profList,
        'attr': [], // unimplemented for now
        'includePveOnly': includePveOnly,
        'includeElites': includeElite,
        'whitelist': whitelist,
        'blacklist': blacklist,
    };
}
