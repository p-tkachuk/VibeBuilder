import { Container } from '../../di/Container';

export interface IPlugin {
  name: string;
  version: string;
  initialize(container: Container): Promise<void>;
  destroy(): Promise<void>;
}
