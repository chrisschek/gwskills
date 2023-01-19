///////////////////////
/////////////////////// Random Skill List Generator
///////////////////////

function generateRandomSkillIdList(options) {
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
    let shuffledMasterSkillIds = [...Array(SKILL_MASTER_COUNT).keys()];
    shuffleArray(shuffledMasterSkillIds);

    // Add whitelisted skills
    for (let skillId of options.whitelist) {
        randomizedSkillIdList.push(skillId);
    }

    // isSkillAllowed checks a skill against options
    let isSkillAllowed = function(skillId) {
        let skill = SKILL_MASTER_LIST[skillId];
        if (options.blacklist.includes(skillId)) {
            return false;
        } else if (!options.camp.includes(skill.camp)) {
            return false;
        } else if (!options.prof.includes(skill.prof)) {
            return false;
        } else {
            return true;
        }
    };

    // Move skill id's from shuffled master list to the randomizedSkillPool to create a smaller randomized list
    for (let skillId of shuffledMasterSkillIds) {
        if (randomizedSkillIdList.length >= options.deckSize) {
            break;
        }
        if (!options.whitelist.includes(skillId) && isSkillAllowed(skillId)) {
            randomizedSkillIdList.push(skillId);
        }
    }

    // Sort array so that two identical skill lists will have the same code
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

function prepareTextAreas() {
    $('textarea#gen-whitelist').val(WHITELIST_DEFAULT_TEXT);
    $('textarea#gen-blacklist').val('');
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
        let options = readOptionInputs();
        // stop if any skills are invalid to allow user to rectify the issue
        if (options.invalidSkillNames.length > 0) {
            let alertMsg = ">> Couldn't find any skill(s) matching the name(s):";
            options.invalidSkillNames.forEach(name => alertMsg += `\n${name}`);
            alert(alertMsg);
            return;
        }
        let deckAsSkillIds = generateRandomSkillIdList(options);
        let deckCode = createDeckCode(deckAsSkillIds);
        let url = "./table_view.html?deckCode=" + deckCode;
        window.location.assign(url);
    });
}

// call this from browser console for debugging
function generate() {
    return generateRandomSkillIdList(readOptionInputs());
}

function createDeckCode(skillIdList) {
    let bitArray = new EncodableBitArray(SKILL_MASTER_COUNT);
    skillIdList.forEach(index => bitArray.setBit(index, 1));
    return bitArray.toBase64();
}

$(document).ready(function(){
    prepareTextAreas();
    prepareSkillCountSlider();
    prepareGenerateButton();
});

///////////////////////
/////////////////////// UI elements reading
///////////////////////

function readOptionInputs() {
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
    
    let getSkillNamesFromTextArea = textArea => $(textArea).val().split('\n').map(str => str.trim()).filter(str => str.length > 0);
    let whitelistNames = getSkillNamesFromTextArea('textarea#gen-whitelist');
    let blacklistNames = getSkillNamesFromTextArea('textarea#gen-blacklist');
    
    let invalidSkillNames = [];
    let convertNamesToIds = names => {
        let ids = []
        names.forEach(name => {
            let skillId = lookupSkillId(name);
            if (skillId != null) {
                ids.push(skillId);
            } else {
                invalidSkillNames.push(name);
            }
        });
        return ids;
    };
    let whitelist = convertNamesToIds(whitelistNames);
    let blacklist = convertNamesToIds(blacklistNames);
    
    let deckSizePercent = $('input#skillcount-slider').val();
    let deckSize = Math.floor(deckSizePercent * SKILL_MASTER_COUNT / 100.);
    
    let options = {
        'camp': campList,
        'prof': profList,
        'includePveOnly': includePveOnly,
        'includeElites': includeElite,
        'whitelist': whitelist,
        'blacklist': blacklist,
        'deckSize' : deckSize,
        'invalidSkillNames' : invalidSkillNames,
    };
    console.log("Found options: " + JSON.stringify(options));
    return options;
}
