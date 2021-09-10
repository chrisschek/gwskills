"""Scrape Wiki

Script that scrapes the GWW for skill data and dumps it to a JSON file.

TODO: coerce the 'profession' of common skills to be 'Common'
TODO: descriptions sometimes include links that are broken (eg. see "Charge!")
TODO: descriptions are prepended with newline character; must delete because is useless & breaks javascript JSON parsing
TODO: need to triple-escape quote characters like in Shout names because breaks javascript JSON parsing
"""

import requests
from bs4 import BeautifulSoup
import json
import sys
import contextlib
import os


base_url = 'https://wiki.guildwars.com'

def check_request_succeeded(r):
  if r.status_code != requests.codes.ok:
    raise Exception('Request to [%s] returned status code [%s]' % (r.url, r.code))

def scrape_master_list():
  # the master list contains some dupes, so use dict to dedupe
  all_skills = {}

  url = base_url + '/wiki/List_of_all_skills'
  r = requests.get(url)
  check_request_succeeded(r)
  html_text = r.text

  soup = BeautifulSoup(html_text, 'html.parser')
  numbered_headers = soup.find_all('span', class_='mw-headline')
  for numbered_header in numbered_headers:
    # Sections are labelled in increments of 500, but most have <500 skills/links in them for some reason
    print('Scanning section %s' % numbered_header.contents)
    subsequent_section = numbered_header.parent.next_sibling.next_sibling
    skills = subsequent_section.find_all('a')
    for skill in skills:
      skill_info = {
        'name': skill.attrs['title'],
        'url': base_url + skill.attrs['href'],
      }
      all_skills[skill_info['name']] = skill_info
  
  all_skills_list = list(all_skills.values())
  print('Found %s total skills (including special non-usable skills)' % len(all_skills_list))
  return all_skills_list

def decorate_skill_info(skill_info):
  url = skill_info['url']
  r = requests.get(url)
  check_request_succeeded(r)
  soup = BeautifulSoup(r.text, 'html.parser')

  # just for energy cost, recharge time, etc.
  skill_details_wrapper = soup.find('div', class_='skill-details-wrapper')
  # most other details in here
  infobox = skill_details_wrapper.parent if skill_details_wrapper else None

  el_prof = infobox.find('a', title="Profession") if infobox else None
  prof_val = el_prof.parent.next_sibling.next_sibling.contents[0].string if el_prof else None
  el_attr = infobox.find('a', title="Attribute") if infobox else None
  attr_val = el_attr.parent.next_sibling.next_sibling.contents[0].string if el_attr else None

  # ignore unusable/fake/etc. skills
  is_special = infobox and (infobox.find('a', href="/wiki/Special_skill") and not infobox.find('a', title='Duplicate skill')) and not infobox.find('a', title='Resurrection skill')
  is_pvp_skill = '(PvP)' in skill_info['name'] or '(Codex)' in skill_info['name']
  is_removed = soup.find('b', string='The information on this page does not apply to the game as it currently exists.') or soup.find('b', string='The information on this page does not apply to the game as it currently is or was.')
  is_tied_to_profession_or_reputation = prof_val in ['Warrior', 'Ranger', 'Necromancer', 'Elementalist', 'Mesmer', 'Monk', 'Assassin', 'Ritualist', 'Dervish', 'Paragon'] or attr_val in ['Lightbringer rank', 'Asura rank', 'Deldrimor rank', 'Ebon Vanguard rank', 'Norn rank']
  is_title_effect = skill_info['name'] in ['Edification', 'Heart of the Norn', 'Lightbringer', 'Rebel Yell', 'Stout-Hearted']

  if not is_tied_to_profession_or_reputation or is_special or is_pvp_skill or is_removed or is_title_effect:
    print("Ignoring: " + skill_info['name'])
    return None
  else:
    print("Getting details: " + skill_info['name'])
  
  # image
  el_image = soup.find('div', class_='skill-image')
  skill_info['image_url'] = base_url + el_image.contents[0].contents[0].attrs['src']

  # profession
  skill_info['profession'] = prof_val

  # campaign
  el_campaign = infobox.find('a', title="Campaign")
  campaign_val = el_campaign.parent.next_sibling.next_sibling.contents[0].string if el_campaign else None
  skill_info['campaign'] = campaign_val

  # attribute
  skill_info['attribute'] = attr_val

  # energy cost
  el_energy = skill_details_wrapper.find('a', title="Energy")
  energy_val = el_energy.parent.text.strip() if el_energy else None
  skill_info['energy'] = energy_val

  # adrenaline cost
  el_adrenaline = skill_details_wrapper.find('a', title="Adrenaline")
  adrenaline_val = el_adrenaline.parent.text.strip() if el_adrenaline else None
  skill_info['adrenaline'] = adrenaline_val
  
  # sacrifice cost
  el_sacrifice = skill_details_wrapper.find('a', title="Sacrifice")
  sacrifice_val = el_sacrifice.parent.text.strip() if el_sacrifice else None
  skill_info['sacrifice'] = sacrifice_val
  
  # activation time
  el_activ = skill_details_wrapper.find('a', title="Activation")
  if el_activ == None:
    skill_info['activation_time'] = None
  else:
    hidden_value = el_activ.parent.find('span', style='display:none')
    if hidden_value:
      skill_info['activation_time'] = hidden_value.string
    else:
      skill_info['activation_time'] = el_activ.parent.text.strip()

  # recharge time
  el_recharge_time = skill_details_wrapper.find('a', title="Recharge")
  recharge_time_val = el_recharge_time.parent.text.strip() if el_recharge_time else None
  skill_info['recharge_time'] = recharge_time_val

  # description
  el_desc = soup.find('dt', string='Concise description').parent.parent.contents[2:]
  skill_info['description'] = "".join(list(map(str, el_desc)))

  return skill_info

def decorate_skills(all_skills_raw):
  all_skills = []
  for skill in all_skills_raw:
    try:
      decorated_skill_info = decorate_skill_info(skill)
    except Exception:
      print('Errored on: %s ... %s' % (skill['name'], skill['url']))
      raise
    if decorated_skill_info:
      all_skills.append(decorated_skill_info)
  print("Final tally: %s skills" % len(all_skills))
  return all_skills

def dump_to_json_file(all_skills):
  filename = 'all_skills.json'
  with contextlib.suppress(FileNotFoundError):
    os.remove(filename)
  with open(filename, 'w') as fp:
    json.dump(all_skills, fp)
  print("Dumped data to file: " + filename)

def test_skill(last_url_token):
  test_skill = {'name': 'test-run', 'url': 'https://wiki.guildwars.com/wiki/' + last_url_token}
  decorate_skill_info(test_skill)
  print(test_skill)
  return test_skill


if __name__ == '__main__':
  if len(sys.argv) > 1:
    # test mode
    all_skills = []
    test_skill('Call_of_Elemental_Protection')
    test_skill('Arcane_Echo')
    test_skill('Brawling_Headbutt')
    all_skills.append(test_skill('Offering_of_Blood'))
    dump_to_json_file(all_skills)
    sys.exit()

  all_skills_raw = scrape_master_list()
  all_skills = decorate_skills(all_skills_raw)
  dump_to_json_file(all_skills)

