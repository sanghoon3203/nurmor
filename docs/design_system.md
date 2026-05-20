# Antigravity 디자인 시스템 규격서 (Design System Specification)

이 문서는 에코 도감(Eco-Pokedex) 프로젝트에 적용할 미래지향적 레트로 픽셀 아트 스타일(Antigravity 네온 광원 및 글래스모피즘 효과)의 구체적인 UI/UX 디자인 시스템 가이드라인을 정의합니다.

---

## 1. 컬러 팔레트 & 그라디언트 (Colors & Gradients)

앱의 메인 환경은 어두운 우주(Deep Space)를 테마로 하며, 활성 요소나 햅틱 반응 영역에는 고대비의 화려한 네온 그라디언트를 적용합니다.

### 1.1 기본 색상 (Base Colors)
*   **Deep Space Black**: `#08080c` (메인 앱 배경색)
*   **Charcoal Dark**: `#121218` (패널 및 비활성 컨테이너 배경색)
*   **Neon Cyan**: `#00f0ff` (메인 포커싱 및 긍정 반응 강조)
*   **Electric Purple**: `#8a2be2` (희귀 등급 및 스폐셜 액션 라벨)
*   **Radiant Emerald**: `#00ff66` (성공 피드백, 녹화 표시등, 오디오 레벨 정상 구역)
*   **Antigravity Pink**: `#ff007f` (경고 피드백 및 강렬한 에너지 효과)

### 1.2 프리미엄 그라디언트 (Gradients)
*   **Antigravity Glow Gradient**: `Neon Cyan` (`#00f0ff`) ➔ `Electric Purple` (`#8a2be2`) ➔ `Antigravity Pink` (`#ff007f`)
*   **Emerald Biosphere Gradient**: `Radiant Emerald` (`#00ff66`) ➔ `Neon Cyan` (`#00f0ff`)
*   **Golden Rare Gradient**: `Gold` (`#ffaa00`) ➔ `Orange` (`#ff5500`)

---

## 2. 타이포그래피 (Typography)

*   **로컬 폰트 사용**: `C:\Users\starn\Downloads\pokemon-bw.ttf` 폰트를 앱 리소스 내에 탑재하여 타이틀 및 수치 정보 렌더링에 사용합니다.
*   **텍스트 렌더링 최적화**: 
    *   가독성을 높이기 위해 모든 텍스트에 강한 대비의 검은색 픽셀 외곽선 효과(Text Shadow)를 기본 적용합니다.
    *   `textShadowColor: '#000000'`, `textShadowOffset: { width: 2, height: 2 }`, `textShadowRadius: 0`.
*   **Fallback Font**: 폰트 로드 완료 전에는 모노스페이스(`monospace`, `Courier New`) 시스템 폰트로 렌더링합니다.

---

## 3. 레트로 픽셀 더블 보더 (Stepped Double-Border Style)

기존의 둥글고 부드러운 UI 테두리 대신, 날카롭게 꺾이는 입체적인 픽셀 형태의 테두리 구조를 공통 테마로 선언합니다.

```typescript
export const pixelBorderStyles = {
  borderWidth: 4,
  borderColor: '#000000',
  backgroundColor: '#121218',
  shadowColor: '#000000',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0, // 입체감을 주는 칼 같은 픽셀 섀도우
};
```

---

## 4. 글래스모피즘 (Glassmorphism) 가이드

*   반투명 유리가 오버레이된 효과를 제공하기 위해 컨테이너에 투명도와 블러 필터를 매핑합니다.
*   **백그라운드 사양**: `backgroundColor: '#12121a95'` (약 58% 투명도 적용).
*   **광원 반사 효과**: 테두리 상단 모서리에 미세한 흰색/네온 스캔 광원 그래픽 데코레이션을 배치하여 유리 반사광을 연출합니다.
