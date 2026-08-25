# NJCAA Region 19 and NAIA draft list (for review)

**Status: DRAFT. Not seeded.** Nothing in this file is in the database. These rows enter
`scripts/seed-colleges.ts` only after Coach Scanzano reviews them and they are converted to
`data/region19-naia-reviewed.json` with `data_source = "region19_naia"`.

Compiled 2026-08-25 from conference membership sources listed at the bottom. Membership and
sport sponsorship change year to year, so treat every row as unconfirmed until reviewed.

## How to review

For each row, confirm or correct: (1) does the school currently field a baseball team,
(2) the NJCAA division its baseball program plays in, (3) the city. Strike any school that
does not sponsor baseball. Add any Region 19 baseball program missing from this list.

**All `ipeds_unitid` values are blank on purpose.** IPEDS IDs are the join key for the
College Scorecard enrichment step, and a wrong ID silently attaches another school's
academics and cost data to this program. Guessing them is worse than leaving them null, so
they get looked up against the IPEDS directory as a separate verified pass, not filled in here.

Flag key: `BASEBALL?` sponsorship unconfirmed. `DIV?` NJCAA division unconfirmed.
`NAME?` institution renamed recently, verify current legal name.

## NJCAA Region 19

Region 19 covers NJ, DE, and eastern PA across two conferences (GSAC and EPAC). Region 19
baseball appears to be predominantly NJCAA Division III: RCSJ-Gloucester played in the 2026
NJCAA Division III Baseball World Series. Per-school division is not published in the sources
I could reach, so `division_detail` is a working assumption on every row.

### Garden State Athletic Conference (NJ)

| name | city | state | division | division_detail | ipeds_unitid | flags |
|---|---|---|---|---|---|---|
| Atlantic Cape Community College | Mays Landing | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Bergen Community College | Paramus | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Brookdale Community College | Lincroft | NJ | njcaa | NJCAA D-III | | DIV? |
| Camden County College | Blackwood | NJ | njcaa | NJCAA D-III | | DIV? |
| County College of Morris | Randolph | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Essex County College | Newark | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Mercer County Community College | West Windsor | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Middlesex College | Edison | NJ | njcaa | NJCAA D-III | | DIV? NAME? |
| Ocean County College | Toms River | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Passaic County Community College | Paterson | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Raritan Valley Community College | North Branch | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Rowan College of South Jersey at Cumberland | Vineland | NJ | njcaa | NJCAA D-III | | DIV? NAME? |
| Rowan College of South Jersey at Gloucester | Sewell | NJ | njcaa | NJCAA D-III | | DIV? NAME? |
| Salem Community College | Carneys Point | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Sussex County Community College | Newton | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Union College of Union County | Cranford | NJ | njcaa | NJCAA D-III | | BASEBALL? DIV? NAME? |

Baseball confirmed active in 2026 for Brookdale, Camden County, Middlesex, RCSJ-Cumberland,
and RCSJ-Gloucester, all of which appear in 2026 Region 19 postseason coverage. The rest are
conference members whose baseball sponsorship I could not confirm.

### Eastern Pennsylvania Athletic Conference (PA and DE)

| name | city | state | division | division_detail | ipeds_unitid | flags |
|---|---|---|---|---|---|---|
| Community College of Philadelphia | Philadelphia | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Delaware County Community College | Marple | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Delaware Technical and Community College, Charles L. Terry | Dover | DE | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Delaware Technical and Community College, Jack F. Owens | Georgetown | DE | njcaa | NJCAA D-III | | DIV? |
| Delaware Technical and Community College, Stanton-Wilmington | Stanton | DE | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Harcum College | Bryn Mawr | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Harrisburg Area Community College | Harrisburg | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Lackawanna College | Scranton | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Lehigh Carbon Community College | Schnecksville | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Luzerne County Community College | Nanticoke | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Montgomery County Community College | Blue Bell | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Northampton Community College | Bethlehem | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Thaddeus Stevens College of Technology | Lancaster | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |
| Williamson College of the Trades | Middletown Township | PA | njcaa | NJCAA D-III | | BASEBALL? DIV? |

Delaware Tech Jack F. Owens is noted as sponsoring baseball in the EPAC source.

## NAIA

**The NAIA footprint in this market is effectively empty, and this is worth a decision rather
than a data-entry pass.**

Pennsylvania has only two NAIA member institutions, Point Park University and Carlow
University, both in Pittsburgh, roughly 300 miles from the South Jersey and Philadelphia
launch market. New Jersey and Delaware have no NAIA members that I could identify.

| name | city | state | division | division_detail | ipeds_unitid | flags |
|---|---|---|---|---|---|---|
| Point Park University | Pittsburgh | PA | naia | NAIA | | BASEBALL? outside launch footprint |
| Carlow University | Pittsburgh | PA | naia | NAIA | | BASEBALL? outside launch footprint |

Point Park has a baseball program with NAIA World Series history. Carlow's baseball
sponsorship is unconfirmed.

Two schools that looked like candidates and are not: Cairn University (Langhorne, PA) is
NCAA Division III in the United East Conference, not NAIA. The Penn-Jersey Athletic
Association is a high school conference, not an NAIA college conference.

**Decision needed:** either accept that the NAIA half of this seed is two Pittsburgh schools,
or widen the NAIA footprint beyond NJ/PA/DE to somewhere the level is actually represented
(NAIA has real density in the Midwest and South). Leaving `naia` in the enum with two distant
rows behind it means the UI will show a level that is functionally empty for these players.

## What I could not verify

- Which Region 19 members currently sponsor baseball. Region19.org and TheBaseballCube both
  returned HTTP 403, so the roster below is conference membership, not a baseball roster.
- Per-school NJCAA division for baseball. The Wikipedia NJCAA Division III list is visibly
  stale, still using "Gloucester County College" and "Middlesex County College", so it was not
  trustworthy enough to assign divisions from.
- Any IPEDS unit ID. Deliberately left blank, see above.
- Whether the GSAC and EPAC membership lists reflect the 2026-27 year.

## Sources

- [NJCAA Region 19](https://www.region19.org/sports/bsb/index) (403, not readable)
- [Garden State Athletic Conference](https://en.wikipedia.org/wiki/Garden_State_Athletic_Conference)
- [Eastern Pennsylvania Athletic Conference](https://en.wikipedia.org/wiki/Eastern_Pennsylvania_Athletic_Conference)
- [List of NJCAA Division III schools](https://en.wikipedia.org/wiki/List_of_NJCAA_Division_III_schools)
- [Camden County College baseball, 2026 Region 19 Final Four](https://www.camdenccathletics.org/sports/bsb/2025-26/releases/20260518k1yrbd)
- [RCSJ Gloucester, 2026 NJCAA Division III Baseball World Series](https://www.rcroadrunners.com/sports/bsb/2025-26/releases/20260522vg3a73)
- [Point Park joins KIAC, NAIA](https://www.naia.org/membership/2012-13/releases/20120705voqri)
- [Cairn University, NCAA](https://www.ncaa.com/schools/cairn)
