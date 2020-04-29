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
  all_skills = []

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
      all_skills.append(skill_info)
  
  print('Found %s total skills (including special non-usable skills)' % len(all_skills))
  return all_skills

def decorate_skill_info(skill_info):
  url = skill_info['url']
  r = requests.get(url)
  check_request_succeeded(r)
  soup = BeautifulSoup(r.text, 'html.parser')

  # just for energy cost, recharge time, etc.
  skill_details_wrapper = soup.find('div', class_='skill-details-wrapper')
  # most other details in here
  infobox = skill_details_wrapper.parent if skill_details_wrapper else None

  # ignore unusable/fake/etc. skills
  is_a_skill = skill_details_wrapper != None and soup.find('dt', string='Concise description')
  is_special = is_a_skill and (infobox.find('a', href="/wiki/Special_skill") and not infobox.find('a', title='Duplicate skill'))
  is_pvp_skill = '(PvP)' in skill_info['name']
  is_removed = soup.find('b', string='The information on this page does not apply to the game as it currently exists.') or soup.find('b', string='The information on this page does not apply to the game as it currently is or was.')
  is_effect = '(item effect)' in skill_info['name'] or (infobox and infobox.find('a', href="/wiki/Party_bonus"))

  if not is_a_skill or is_special or is_pvp_skill or is_removed or is_effect:
    print("Ignoring: " + skill_info['name'])
    return None
  else:
    print("Getting details: " + skill_info['name'])
  
  # image
  el_image = soup.find('div', class_='skill-image')
  skill_info['image_url'] = base_url + el_image.contents[0].contents[0].attrs['src']

  # profession
  el_prof = infobox.find('a', title="Profession")
  if el_prof == None:
    skill_info['profession'] = None
  else:
    skill_info['profession'] = el_prof.parent.next_sibling.next_sibling.contents[0].string

  # campaign
  el_campaign = infobox.find('a', title="Campaign")
  if el_campaign == None:
    skill_info['campaign'] = None
  else:
    skill_info['campaign'] = el_campaign.parent.next_sibling.next_sibling.contents[0].string

  # attribute
  el_attr = infobox.find('a', title="Attribute")
  if el_attr == None:
    skill_info['attribute'] = None
  else:
    skill_info['attribute'] = el_attr.parent.next_sibling.next_sibling.contents[0].string

  # energy cost
  el_energy = skill_details_wrapper.find('a', title="Energy")
  if el_energy == None:
    skill_info['energy'] = None
  else:
    skill_info['energy'] = el_energy.parent.text.strip()

  # adrenaline cost
  el_adren = skill_details_wrapper.find('a', title="Adrenaline")
  if el_adren == None:
    skill_info['adrenaline'] = None
  else:
    skill_info['adrenaline'] = el_adren.parent.text.strip()

  # sacrifice cost
  el_sac = skill_details_wrapper.find('a', title="Sacrifice")
  if el_sac == None:
    skill_info['sacrifice'] = None
  else:
    skill_info['sacrifice'] = el_sac.parent.text.strip()
  
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
  el_recharge = skill_details_wrapper.find('a', title="Recharge")
  if el_recharge == None:
    skill_info['recharge_time'] = None
  else:
    skill_info['recharge_time'] = el_recharge.parent.text.strip()

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

