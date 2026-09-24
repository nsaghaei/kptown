const standard={office:[8,18],school:[8,16],factory:[6,22],farm:[6,20],market:[7,22],tavern:[16,26]};
export function isPlaceOpen(place,hour){const interval=typeof place==='string'?standard[place]:place?.openHours||standard[place?.kind];if(!interval)return true;const h=((hour%24)+24)%24,[start,end]=interval;return end>24?h>=start||h<end-24:h>=start&&h<end;}
export function hoursLabel(place){const interval=place.openHours||standard[place.kind];if(!interval)return 'Open 24 hours';const fmt=h=>`${h%12||12}${h%24<12?'am':'pm'}`;return `${fmt(interval[0])}–${fmt(interval[1])}`;}
