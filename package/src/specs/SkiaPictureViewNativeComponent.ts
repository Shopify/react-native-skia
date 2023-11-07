import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  mode: string;
  debug?: boolean;
}

export default codegenNativeComponent<NativeProps>('SkiaPictureView');