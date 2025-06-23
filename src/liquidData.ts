export interface LiquidType {
  name: string;
  density: number; // kg/m³
  color: string;
  viscosity: number; // relative viscosity (water = 1)
  description: string;
}

export const LIQUIDS: LiquidType[] = [
  {
    name: 'Water',
    density: 1000,
    color: '#4FC3F7',
    viscosity: 1,
    description: 'Pure water at room temperature'
  },
  {
    name: 'Oil (Vegetable)',
    density: 920,
    color: '#FFD54F',
    viscosity: 50,
    description: 'Common cooking oil, less dense than water'
  },
  {
    name: 'Honey',
    density: 1420,
    color: '#FFA726',
    viscosity: 10000,
    description: 'Natural honey, very viscous and dense'
  },
  {
    name: 'Mercury',
    density: 13534,
    color: '#9E9E9E',
    viscosity: 1.5,
    description: 'Liquid metal, extremely dense'
  },
  {
    name: 'Ethanol',
    density: 789,
    color: '#E1F5FE',
    viscosity: 1.2,
    description: 'Alcohol, lighter than water'
  },
  {
    name: 'Glycerin',
    density: 1260,
    color: '#F8BBD9',
    viscosity: 1412,
    description: 'Thick, syrupy liquid'
  },
  {
    name: 'Gasoline',
    density: 720,
    color: '#FFECB3',
    viscosity: 0.4,
    description: 'Petroleum fuel, very light'
  }
];

export const CONTAINER_HEIGHT = 8;
export const CONTAINER_WIDTH = 6;
export const CONTAINER_DEPTH = 4;