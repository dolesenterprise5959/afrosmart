// Common cities/towns per Liberian county, keyed by county NAME (matching
// COUNTIES in lib/mock). Drives the County → City/Town dropdown on the posting
// form so sellers tap instead of typing (fewer spelling variants). Not
// exhaustive — an "Other Town/Village" option always allows manual entry.

export const TOWNS_BY_COUNTY: Record<string, string[]> = {
  Montserrado: ["Monrovia", "Paynesville", "Bensonville", "Brewerville", "Careysburg", "Gardnersville", "New Kru Town", "Congo Town"],
  Bomi: ["Tubmanburg", "Klay", "Suehn", "Dewoin"],
  Bong: ["Gbarnga", "Totota", "Salala", "Palala", "Suakoko", "Phebe"],
  Gbarpolu: ["Bopolu", "Belle Yella", "Bokomu", "Gbarma"],
  "Grand Bassa": ["Buchanan", "Edina", "Compound #3", "District #4", "Owensgrove"],
  "Grand Cape Mount": ["Robertsport", "Sinje", "Madina", "Tienii"],
  "Grand Gedeh": ["Zwedru", "Toe Town", "Konobo", "Putu"],
  "Grand Kru": ["Barclayville", "Grand Cess", "Sasstown", "Picnicess"],
  Lofa: ["Voinjama", "Foya", "Zorzor", "Kolahun", "Vahun"],
  Margibi: ["Kakata", "Harbel", "Marshall", "Dolostown", "Unification City"],
  Maryland: ["Harper", "Pleebo", "Karluway", "Gbolobo"],
  Nimba: ["Ganta", "Sanniquellie", "Saclepea", "Tappita", "Bahn", "Karnplay"],
  "River Cess": ["Cestos City", "Yarnee", "Timbo"],
  "River Gee": ["Fish Town", "Webbo", "Nyenawliken"],
  Sinoe: ["Greenville", "Juarzon", "Pynes Town"],
};

export const OTHER_TOWN = "__other";

export function townsForCounty(county: string): string[] {
  return TOWNS_BY_COUNTY[county] ?? [];
}
