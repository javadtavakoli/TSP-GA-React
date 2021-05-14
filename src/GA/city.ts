import { randomGenerator } from "../utilities/randomGenerator";

export class City {
  public x = 0;
  public y = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
export class CitiesInitializer {
  public static cities: City[] = [];
  public static citiesCount: number = 0;
  public static height: number = 0;
  public static width: number = 0;
  public static initializeCities = (
    citiesCount: number,
    height: number,
    width: number
  ) => {
    const self = CitiesInitializer;
    self.cities = [];
    self.citiesCount = citiesCount;
    self.height = height;
    self.width = width;
    for (let index = 0; index < self.citiesCount; index++) {
      const city = new City(
        randomGenerator(self.width),
        randomGenerator(self.height)
      );
      self.cities.push(city);
    }
  };
}
