import { BuildingType } from '../../types/buildings';
import type { Position } from '../../utils/position.utils';
import type { Building } from '../../types/buildings';

export interface IBuildingService {
  createBuilding(buildingType: BuildingType, position: Position): Promise<Building>;
  destroyBuilding(buildingId: string): void;
  getBuilding(buildingId: string): Building | undefined;
  getAllBuildings(): Building[];
}
