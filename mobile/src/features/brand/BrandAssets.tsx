import type { SvgProps } from 'react-native-svg';

import LeavesSvg from '../../../../leaves.svg';
import LogoImageSvg from '../../../../logo_image.svg';
import LogoNameSvg from '../../../../logo_name.svg';
import LogoSumSvg from '../../../../logo_sum.svg';

type BrandSvgProps = SvgProps & {
  width?: number | string;
  height?: number | string;
};

export function AtlasLogoSum(props: BrandSvgProps) {
  return <LogoSumSvg preserveAspectRatio="xMidYMid meet" {...props} />;
}

export function AtlasLeaves(props: BrandSvgProps) {
  return <LeavesSvg preserveAspectRatio="xMidYMid meet" {...props} />;
}

export function AtlasLogoName(props: BrandSvgProps) {
  return <LogoNameSvg preserveAspectRatio="xMidYMid meet" {...props} />;
}

export function AtlasLogoImage(props: BrandSvgProps) {
  return <LogoImageSvg preserveAspectRatio="xMidYMid meet" {...props} />;
}
