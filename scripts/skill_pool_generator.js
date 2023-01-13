///////////////////////
/////////////////////// Random Skill List Generator
///////////////////////

// TODO filters aren't implemented in UI
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