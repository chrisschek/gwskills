"""Check Skills

Script for checking the skill data collected by the scrape_wiki script.
"""

import argparse
import json

actions = [
    'show_counts',
    'list',
    'list_full',
]

campaigns = [
    'Core',
    'Prophecies',
    'Factions',
    'Nightfall',
    'Eye of the North',
]

professions = [
    'Warrior',
    'Ranger',
    'Monk',
    'Necromancer',
    'Mesmer',
    'Elementalist',
    'Assassin',
    'Ritualist',
    'Paragon',
    'Dervish',
    'Common',
]

parser = argparse.ArgumentParser(description='Check skill data in a JSON file.')
parser.add_argument('-f', '--file', default='all_skills.json')
parser.add_argument('-l', '--list', action='store_true')
parser.add_argument('-p', '--profession', choices=professions)
parser.add_argument('-c', '--campaign', choices=campaigns)


all_skills = []
skills_by_campaign = {}
for c in campaigns:
    skills_by_campaign[c] = []
skills_by_profession = {}
for p in professions:
    skills_by_profession[p] = []

def parse_file(filename):
    global all_skills, skills_by_campaign, skills_by_profession
    with open(filename) as f:
        all_skills = json.load(f)
        for skill in all_skills:
            campaign = skill['campaign']
            skills_by_campaign[campaign].append(skill)
            profession = skill['profession']
            profession = profession if profession else 'Common'
            skills_by_profession[profession].append(skill)

def show_counts(by, skills_by_):
    print('Skills by %s:' % by)
    def key_length(key):
        return 4 if key == None else len(key)
    col_width = max(key_length(key) for key in list(skills_by_.keys())) + 3
    for key, skill_list in skills_by_.items():
        print((key if key else "None").ljust(col_width) + str(len(skill_list)))
    print()

def get_skill_names(skill_list):
    names = []
    [names.append(skill['name']) for skill in skill_list]
    names.sort()
    return names


def matches_profession(skill, profession):
    return skill['profession'] == profession

def list_skills(campaign, profession):
    skills = all_skills
    if profession:
        skills = skills_by_profession[profession]
    if campaign:
        def matches_campaign(skill):
            return skill['campaign'] == campaign
        skills = filter(matches_campaign, skills)
    skills = list(skills)
    skill_names = get_skill_names(skills)
    print('Displaying %s skills:' % str(len(skill_names)))
    for name in skill_names:
        print('* %s' % name)
    

if __name__ == '__main__':
    namespace = parser.parse_args()
    args = vars(namespace)

    parse_file(args['file'])

    if len(all_skills) == 0:
        print("Didn't find any skills")
    else:
        if not args['list']:
            print('Total skills: %s\n' % str(len(all_skills)))
            show_counts('Campaign', skills_by_campaign)
            show_counts('Profession', skills_by_profession)
        else:
            list_skills(args['campaign'], args['profession'])

