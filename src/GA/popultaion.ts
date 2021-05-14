import { Route } from "./route";
type RouteFitness = {
  route: Route;
  fitness: number;
};
export class Population {
  public routes: Route[] = [];
  constructor(intialize: boolean = true, length?: number) {
    if (intialize && length) {
      this.initializePopulation(length);
    }
  }
  private initializePopulation = (length: number) => {
    for (let index = 0; index < length; index++) {
      let newRoute: Route;
      do {
        newRoute = new Route(true);
      } while (
        this.routes.findIndex(
          (r) => r.routeUniqueID() == newRoute.routeUniqueID()
        ) != -1
      );

      this.routes.push(newRoute);
    }
  };
  public addRoute = (route: Route) => {
    if (
      this.routes.findIndex(
        (r) => r.routeUniqueID() === route.routeUniqueID()
      ) == -1
    ) {
      this.routes.push(route);
    }
  };
  public getFittest = (): Route => {
    if (this.routes.length == 0) throw "Routes length zero";

    let maxFitness = this.routes[0].getFitness();
    let bestRoute: Route = this.routes[0];
    for (let index = 1; index < this.routes.length; index++) {
      
      const currentRoute = this.routes[index];
      const currentFittness = currentRoute.getFitness();
      if (currentFittness > maxFitness) {
        maxFitness = currentFittness;
        bestRoute = currentRoute;        
      }
    }
    console.log(bestRoute.routeUniqueID());
    
    return bestRoute;
  };
}
