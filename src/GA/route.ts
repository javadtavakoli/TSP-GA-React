import { randomGenerator } from "../utilities/randomGenerator";
import { CitiesInitializer, City } from "./city";

export class Route {
  public route: number[] = [];
  constructor(initialize: boolean = true) {
    if (initialize) {
      this.initializeRoute();
    }
  }
  private initializeRoute = () => {
    const citiesCount = CitiesInitializer.citiesCount;

    for (
      let itertationIndex = 0;
      itertationIndex < citiesCount;
      itertationIndex++
    ) {        
      const nextGene = getRandomIndexNotInRoute(this.route);      
      this.route.push(nextGene);
    }    
  };
  private measureDistance = (cityIndexA: number, cityIndexB: number): number => {
    const cityA = CitiesInitializer.cities[cityIndexA];
    const cityB = CitiesInitializer.cities[cityIndexB];
    return Math.sqrt(
      Math.pow(cityB.x - cityA.x, 2) + Math.pow(cityB.y - cityA.y, 2)
    );
  };
  public routeUniqueID = ():string=>{
      return this.route.join(",")
  }
  private measureRouteLength = (): number => {
    let length = 0;
    for (let cityIndex = 1; cityIndex < this.route.length; cityIndex++) {
      length += this.measureDistance(
        this.route[cityIndex],
        this.route[cityIndex - 1]
      );
    }

    return length;
  };
  public getFitness = (): number => {
    return 1 / this.measureRouteLength();
  };
}
export const getRandomCityIndex = () => {
  const citiesCount = CitiesInitializer.citiesCount;
  return randomGenerator(citiesCount);
};
export const getRandomIndexNotInRoute = (chromose: number[]): number => {
  while (true) {
    const cityIndex = getRandomCityIndex();
    if (chromose.indexOf(cityIndex) == -1) {
      return cityIndex;
    }
  }
};
