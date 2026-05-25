export type PlantVisibility = 'PRIVATE' | 'PUBLIC';
export type ShareOptionId = 'private' | 'public';

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
    description: '위치 이름만 내 기록에 저장해요',
    visibility: 'PRIVATE',
  },
  {
    id: 'public',
    label: '커뮤니티 공유',
    description: '위치 이름과 발견 내용을 공개해요',
    visibility: 'PUBLIC',
  },
];

export const defaultShareOption = shareOptions[0];

export function visibilityForShareOption(id: string): PlantVisibility {
  return shareOptions.find((option) => option.id === id)?.visibility ?? defaultShareOption.visibility;
}
