// Four attributed facts; no unlisted rank or other-season value is inferred.
export const EXPERT_SOURCE = Object.freeze({
  url: 'https://africa.espn.com/nfl/story/_/id/38151402/nfl-quarterback-council-2023-ranking-top-10-traits',
  publisher: 'ESPN Quarterback Council',
  published: '2023-08-14',
  window: '2023 preseason',
  method: 'Nine analysts; points-combined top-ten ballots. Ballot weights and full candidate denominator undisclosed.',
});
export type ExpertTrait = 'arm_strength' | 'field_vision';
export type ExpertRank = Readonly<{playerKey:string;year:number;trait:ExpertTrait;rank:number}>;
const expected: Record<string,number> = {
  '00-0033873:2023:arm_strength': 2,
  '00-0034857:2023:arm_strength': 1,
  '00-0033873:2023:field_vision': 1,
  '00-0034857:2023:field_vision': 4,
};
export function validateExpertRanks(input:unknown):readonly ExpertRank[]{
  if(!Array.isArray(input)||input.length!==4)throw Error('Expert source coverage mismatch');
  const seen=new Set<string>();
  const rows=input.map(row=>{
    if(!row||typeof row!=='object'||Object.keys(row).sort().join(',')!=='playerKey,rank,trait,year')throw Error('Invalid expert record');
    const key=`${row.playerKey}:${row.year}:${row.trait}`;
    if(typeof row.rank!=='number'||!Number.isFinite(row.rank)||!Number.isInteger(row.rank)||row.rank<1||row.rank>10||row.year!==2023||expected[key]!==row.rank||seen.has(key))throw Error('Unverified expert fact');
    seen.add(key);return Object.freeze({...row}) as ExpertRank;
  });
  return Object.freeze(rows);
}
export const EXPERT_RANKS=validateExpertRanks([
  {playerKey:'00-0033873',year:2023,trait:'arm_strength',rank:2},
  {playerKey:'00-0034857',year:2023,trait:'arm_strength',rank:1},
  {playerKey:'00-0033873',year:2023,trait:'field_vision',rank:1},
  {playerKey:'00-0034857',year:2023,trait:'field_vision',rank:4},
]);
export function expertFor(trait:ExpertTrait,year:number,id:string):ExpertRank|undefined{
  return EXPERT_RANKS.find(row=>row.trait===trait&&row.year===year&&row.playerKey===id);
}
// An ordinal drawing convention, never an NFL percentile or calibrated skill grade.
export function expertRadius(rank:number|null):number|null{
  return rank!==null&&Number.isFinite(rank)&&Number.isInteger(rank)&&rank>=1&&rank<=10?(11-rank)/10:null;
}
