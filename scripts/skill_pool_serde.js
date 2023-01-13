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