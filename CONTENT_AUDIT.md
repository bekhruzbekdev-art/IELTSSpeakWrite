# Content Audit

Generated from the committed files in `src/data/` only. No temporary or scratch
directory is referenced. Re-run after any content change.

| Source | Path |
|---|---|
| Speaking master (257 units) | `src/data/content/masterSpeakingDb.json` |
| Writing Task 2 (48) | `src/data/content/writingTask2Db.json` |
| Writing Task 1 (53) | `src/data/writingTask1Database.json` |
| Theme axis (retag applied) | `src/data/content/themeAxis.json` |
| Retag provenance (39) | `src/data/content/themeRetag.json` |
| Immersion blocks (9) | `src/data/content/immersionBlocks.json` |
| Unit relations | `src/data/content/unitRelations.json` |
| Curriculum map (30 days) | `src/data/content/curriculumMap.json` |

## 1. Total and unique units

| Pool | Records | Coverage units | Note |
|---|---:|---:|---|
| Speaking Part 1 | 52 | 52 | topics |
| Speaking Part 2 | 136 | 136 | cue cards |
| Speaking Part 3 | 69 | 69 | topics |
| **Speaking total** | **257** | **257** | |
| Writing Task 1 | 53 | 51 | 2 exact duplicates excluded |
| Writing Task 2 | 48 | 48 | |
| **TOTAL** | **358** | **356** | |

**Total records: 358. Unique coverage units: 356.**

## 2. Duplicate pairs

| A | B | Relation | Excluded from coverage | Basis |
|---|---|---|---|---|
| `WT1_007` | `WT1_016` | EXACT | `WT1_016` | Pixel-identical page scan (SHA-256 of decoded RGB). |
| `WT1_046` | `WT1_049` | EXACT | `WT1_049` | Pixel-identical page scan (SHA-256 of decoded RGB). |
| `WT2_026` | `WT2_038` | NEAR | — both count | NEAR-DUPLICATE of WT2_026 (education vs experience for employment) |
| `WT2_021` | `WT2_040` | NEAR | — both count | NEAR-DUPLICATE of WT2_021 (group vs individual learning) |

Plus **10 intra-unit question duplicates** — near-identical questions inside a
single speaking topic. These do not affect coverage or scheduling.

## 3. Theme distribution

| Theme | Units | Block |
|---|---:|---|
| SOCIETY | 60 | `SOCIETY` |
| EDUCATION | 47 | `EDUCATION` |
| WORK | 34 | `WORK_ECONOMY` |
| CULTURE | 33 | `CULTURE_MEDIA` |
| ENVIRONMENT | 27 | `ENVIRONMENT` |
| ECONOMY | 27 | `WORK_ECONOMY` |
| TECHNOLOGY | 25 | `TECH_SCIENCE` |
| TOURISM | 18 | `CULTURE_MEDIA` |
| PERSONAL_LIFE | 17 | `NARRATIVE` |
| HEALTH | 15 | `HEALTH_SPORT` |
| TRANSPORT | 14 | `CITIES_TRANSPORT` |
| CITIES | 11 | `CITIES_TRANSPORT` |
| MEDIA | 7 | `CULTURE_MEDIA` |
| POPULATION | 6 | `SOCIETY` |
| SCIENCE | 4 | `TECH_SCIENCE` |
| OTHER | 4 | `SOCIETY` |
| AGRICULTURE | 4 | `ENVIRONMENT` |
| ENERGY | 3 | `ENVIRONMENT` |
| **Total** | **356** | |

18 themes mapping into 9 immersion blocks. **Zero units carry `UNCLASSIFIED`.**

| Block | Units | Scheduled days |
|---|---:|---:|
| Cities & Transport | 25 | 2 |
| Tech & Science | 29 | 2 |
| Health & Sport | 15 | 1 |
| Education | 47 | 4 |
| Environment | 34 | 3 |
| Culture & Media | 58 | 3 |
| Work & Economy | 61 | 4 |
| Society | 70 | 5 |
| Personal Life (floating) | 17 | floating |
| **Total** | **356** | **24** |

## 4. Difficulty distribution

| Pool | EASY | MEDIUM | HARD | Missing |
|---|---:|---:|---:|---:|
| Speaking P1 | 37 | 15 | 0 | 0 |
| Speaking P2 | 62 | 68 | 6 | 0 |
| Speaking P3 | 1 | 33 | 35 | 0 |
| Writing Task 1 | 0 | 31 | 20 | 0 |
| Writing Task 2 | 9 | 27 | 12 | 0 |
| **Total** | **109** | **174** | **73** | **0** |

> **Known gap.** Writing Task 1 has **zero EASY units** — all 51 are MEDIUM or HARD.
> Stage 1 of the curriculum therefore opens with no gentle tier in that pool.

## 5. Skill distribution

| Skill tag | Tagged units |
|---|---:|
| `SPK.FLUENCY` | 189 |
| `SPK.IDEA_DEVELOPMENT` | 179 |
| `SPK.LEXICAL_RESOURCE` | 109 |
| `SPK.OPINION_DEVELOPMENT` | 108 |
| `SPK.SPECULATION` | 74 |
| `SPK.COMPARISON` | 64 |
| `WT1.OVERVIEW_WRITING` | 51 |
| `SPK.GRAMMATICAL_RANGE` | 48 |
| `WT2.TASK_ACHIEVEMENT` | 48 |
| `WT2.ARGUMENT_CONSTRUCTION` | 44 |
| `WT1.DATA_COMPARISON` | 38 |
| `WT2.STANCE_MAINTENANCE` | 29 |
| `SPK.EXAMPLE_DEVELOPMENT` | 27 |
| `WT2.BALANCED_EVALUATION` | 24 |
| `WT2.EXEMPLIFICATION` | 24 |
| `WT1.TREND_DESCRIPTION` | 19 |
| `WT1.CHANGE_ANALYSIS` | 17 |
| `WT2.COMPARISON` | 17 |
| `WT1.MULTIPLE_DATA_SYNTHESIS` | 15 |
| `WT2.CONCESSION_REFUTATION` | 15 |
| `WT2.CAUSAL_REASONING` | 13 |
| `WT1.DATA_SELECTION` | 10 |
| `WT2.LEXICAL_RESOURCE` | 10 |
| `WT2.COHERENCE_COHESION` | 9 |
| `WT1.PROCESS_DESCRIPTION` | 8 |
| `WT1.STAGE_DESCRIPTION` | 8 |
| `WT1.SPATIAL_DESCRIPTION` | 7 |
| `WT2.PROBLEM_ANALYSIS` | 6 |
| `WT2.SOLUTION_DESIGN` | 5 |
| `WT2.PRIORITISATION` | 4 |
| `WT2.HYPOTHESISING` | 4 |
| `WT2.DEFINITION_FRAMING` | 3 |
| `WT2.GRAMMATICAL_RANGE_ACCURACY` | 2 |

33 distinct skill tags across 356 units.

> Tags are recorded in the vocabulary each source database was built with
> (`SPK.*` from the speaking import, `WT1.*` from the Task 1 import, `WT2.*` from
> thinking-skills plus IELTS criteria). Mapping them onto the 18-skill registry is
> P1 work and is deliberately **not** done here.

## 6. Integrity checks

| Check | Result |
|---|---|
| Coverage units total 356 | PASS |
| Zero units carry UNCLASSIFIED | PASS |
| All 257 speaking units have a theme | PASS |
| Curriculum assigns every coverage unit | PASS |
| No unit assigned to two days | PASS |
| Block unit counts sum to 356 | PASS |
| Scheduled block days sum to 24 | PASS |

**7/7 checks pass.**
