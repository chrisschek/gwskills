/*
 * Store a set of skillId's as a bitmap. Bitmap size = SKILL_MASTER_COUNT and each index in the bitmap corresponds
 * to an index in SKILL_MASTER_LIST.
 */

function showSkillPoolCode(skillIdList) {
    let encoded = encodeSkillIdList(skillIdList);
    $('textarea#skill-pool-code').html(encoded);
}

function encodeSkillIdList(skillIdList) {
    let bitArray = new EncodableBitArray(SKILL_MASTER_COUNT);
    skillIdList.forEach(skillId => bitArray.setBit(skillId, 1));
    return bitArray.toBase64();
}

function decodeSkillIdList(encodedList) {
    let skillIdList = [];
    let bitArray = bitArrayFromBase64(encodedList);
    for (let i = 0; i < bitArray.length; i++) {
        if (bitArray.getBit(i)) {
            skillIdList.push(i);
        }
    }
    return skillIdList;
}