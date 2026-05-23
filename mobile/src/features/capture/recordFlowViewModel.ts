export type PlantVisibility = 'PRIVATE' | 'CELL' | 'PUBLIC';
export type ShareOptionId = 'private' | 'cell' | 'public';

export type ShareOption = {
  id: ShareOptionId;
  label: string;
  description: string;
  visibility: PlantVisibility;
};

export const shareOptions: ShareOption[] = [
  {
    id: 'private',
    label: '나만 보관',
    description: '내 도감에만 저장해요',
    visibility: 'PRIVATE',
  },
  {
    id: 'cell',
    label: '셀 도감 공유',
    description: '정확 좌표 없이 서식지 셀에 남겨요',
    visibility: 'CELL',
  },
  {
    id: 'public',
    label: '커뮤니티 공유',
    description: '주변 발견 피드에 공개해요',
    visibility: 'PUBLIC',
  },
];

export const defaultShareOption = shareOptions[1];

export function visibilityForShareOption(id: string): PlantVisibility {
  return shareOptions.find((option) => option.id === id)?.visibility ?? defaultShareOption.visibility;
}
