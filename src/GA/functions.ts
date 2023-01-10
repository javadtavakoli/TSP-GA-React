import { logRoutes } from "../utilities/logger";
import { randomGenerator } from "../utilities/randomGenerator";
import { CitiesInitializer } from "./city";
import { Population } from "./popultaion";
import { getRandomIndexNotInRoute, Route } from "./route";
const GENE_PLACEHOLDER = -1;
const makeOrder1CrossOverChild = (routeA: Route, routeB: Route): Route => {
  const routeLength = routeA.route.length;
  const swathStart = randomGenerator(routeLength - 2);
  const swathLength = randomGenerator(routeLength - swathStart, 1);
  const swath: number[] = [];
  const child: number[] = [...new Array(routeLength)].fill(0);

  for (let i = 0; i < swathLength; i++) {
    const routeIndex = i + swathStart
    const currentCity = routeA.route[routeIndex];
    swath.push(currentCity);
    child[routeIndex] = currentCity;
  }
  let routeBIndex = 0;
  for (let i = 0; i < routeLength; i++) {
    if (i < swathStart || i >= swathStart + swathLength) {
      while (swath.includes(routeB.route[routeBIndex])) {
        routeBIndex++;
      }
      child[i] = routeB.route[routeBIndex];
      routeBIndex++;
    }
  }
  const childRoute = new Route(false);
  childRoute.route = child;
  return childRoute;
}
export const Order1CrossOver = (routeA: Route, routeB: Route): [Route, Route] => {
  const childA = makeOrder1CrossOverChild(routeA, routeB);
  const childB = makeOrder1CrossOverChild(routeB, routeA);
  return [childA, childB]
}
export const CrossOver = (routeA: Route, routeB: Route): [Route, Route] => {
  const routeLength = routeA.route.length;
  const chromosomeA: number[] = [];
  const chromosomeB: number[] = [];
  const mutationPoint = randomGenerator(routeLength);

  // Intitial chromosomes.
  for (let geneIndex = 0; geneIndex < routeLength; geneIndex++) {
    if (geneIndex < mutationPoint) {
      chromosomeA.push(routeA.route[geneIndex]);
      chromosomeB.push(GENE_PLACEHOLDER);
    } else {
      chromosomeB.push(routeB.route[geneIndex]);
      chromosomeA.push(GENE_PLACEHOLDER);
    }
  }

  // Fill other part.
  for (let geneIndex = 0; geneIndex < routeLength; geneIndex++) {
    if (geneIndex < mutationPoint) {
      const gene = routeA.route[geneIndex];
      if (chromosomeB.findIndex((c) => c == gene) == -1) {
        chromosomeB[geneIndex] = gene;
      }
    } else {
      const gene = routeB.route[geneIndex];
      if (chromosomeA.findIndex((c) => c == gene) == -1) {
        chromosomeA[geneIndex] = gene;
      }
    }
  }
  // Fill placeholders in chromosomeA.
  while (chromosomeA.findIndex((g) => g === GENE_PLACEHOLDER) !== -1) {
    const placeholderIndex = chromosomeA.findIndex(
      (g) => g === GENE_PLACEHOLDER
    );
    chromosomeA[placeholderIndex] = getRandomIndexNotInRoute(chromosomeA);
  }
  // Fill placeholders in chromosomeB.
  while (chromosomeB.findIndex((g) => g === GENE_PLACEHOLDER) !== -1) {
    const placeholderIndex = chromosomeB.findIndex(
      (g) => g === GENE_PLACEHOLDER
    );
    chromosomeB[placeholderIndex] = getRandomIndexNotInRoute(chromosomeB);
  }
  // Create routes.
  const childRouteA = new Route(false);
  childRouteA.route = chromosomeA;
  const childRouteB = new Route(false);
  childRouteB.route = chromosomeB;
  return [childRouteA, childRouteB];
};
const shuffleArray = <T,>(array: T[]) => {
  let clonedArray = [...array];
  const length = array.length;
  const shuffledArray: T[] = [];

  do {
    const randomIndex = randomGenerator(clonedArray.length);
    const selectedElement = clonedArray[randomIndex];
    shuffledArray.push(selectedElement);
    clonedArray = clonedArray.filter((_, index) => index != randomIndex);

  } while (shuffledArray.length !== length);
  return shuffledArray
}
export const ShuffleMutation = (route: Route, mutationRate: number): Route => {
  if (Math.random() > mutationRate) return route;
  const routeLength = route.route.length;
  const swathStart = randomGenerator(routeLength - 2);
  const swathLength = randomGenerator(routeLength - swathStart, 1);
  const swath: number[] = [];
  const mutatedChromosome: number[] = [...new Array(routeLength)].fill(0);

  for (let i = 0; i < swathLength; i++) {
    const routeIndex = i + swathStart
    const currentCity = route.route[routeIndex];
    swath.push(currentCity);
  }

  const shuffledSwath = shuffleArray(swath);

  for (let i = 0; i < routeLength; i++) {
    if (i < swathStart || i >= swathStart + swathLength) {
      mutatedChromosome[i] = route.route[i];
      continue;
    }
    mutatedChromosome[i] = shuffledSwath.shift() || 0;

  }
  const mutatedRoute = new Route(false);
  mutatedRoute.route = mutatedChromosome;

  return mutatedRoute;

}
export const InversionMutation = (route: Route, mutationRate: number): Route => {
  if (Math.random() > mutationRate) return route;
  const routeLength = route.route.length;
  const swathStart = randomGenerator(routeLength - 2);
  const swathLength = randomGenerator(routeLength - swathStart, 1);
  const swath: number[] = [];
  const mutatedChromosome: number[] = [...new Array(routeLength)].fill(0);

  for (let i = 0; i < swathLength; i++) {
    const routeIndex = i + swathStart
    const currentCity = route.route[routeIndex];
    swath.push(currentCity);
  }


  for (let i = 0; i < routeLength; i++) {
    if (i < swathStart || i >= swathStart + swathLength) {
      mutatedChromosome[i] = route.route[i];
      continue;
    }
    mutatedChromosome[i] = swath.pop() || 0;

  }
  const mutatedRoute = new Route(false);
  mutatedRoute.route = mutatedChromosome;

  return mutatedRoute;

}
export const SwapMutation = (route: Route, mutationRate: number): Route => {
  const chromosome = [...route.route];
  const mutateR = Math.random();
  if (mutationRate > mutateR) {

    const randMutiationPointA = randomGenerator(chromosome.length);
    const randMutiationPointB = randomGenerator(chromosome.length);
    const temp = chromosome[randMutiationPointA];
    chromosome[randMutiationPointA] = chromosome[randMutiationPointB];
    chromosome[randMutiationPointB] = temp;

  }
  const newRoute = new Route(false);
  newRoute.route = [...chromosome];
  return route;
};
export const MultiSwapMutation = (route: Route, mutationRate: number): Route => {
  const chromosome = [...route.route];
  const mutateR = Math.random();

  if (mutationRate > mutateR) {

    const totalSwaps = randomGenerator(chromosome.length / 2);
    for (let i = 0; i < totalSwaps; i++) {
      const randMutiationPointA = randomGenerator(chromosome.length);
      const randMutiationPointB = randomGenerator(chromosome.length);
      const temp = chromosome[randMutiationPointA];
      chromosome[randMutiationPointA] = chromosome[randMutiationPointB];
      chromosome[randMutiationPointB] = temp;
    }

  }
  const newRoute = new Route(false);
  newRoute.route = [...chromosome];
  return route;
};
export const TournaumentSelection = (
  population: Population,
  tornaumentSize: number
): Route => {
  const populationRoutes = population.routes;
  const populationLength = population.routes.length;
  const k = tornaumentSize;
  const tornaumentPopulation = new Population(false);
  for (let index = 0; index < k; index++) {
    const randomIndex = randomGenerator(populationLength - 1);
    tornaumentPopulation.routes.push(populationRoutes[randomIndex]);
  }
  const fittest = tornaumentPopulation.getFittest();

  return fittest;
};
export const SortRoutes = (routes: Route[]): Route[] => {
  const routesWithFitness = routes.map(
    (route) => ({ route, fitness: route.getFitness() } as RouteFitness)
  );
  const sortedRoutes = routesWithFitness
    .sort((a, b) => a.fitness - b.fitness)
    .map((r) => r.route);
  return sortedRoutes;
};
type RouteFitness = {
  route: Route;
  fitness: number;
};
export const RankSelection = (population: Population): Route => {
  const routes = SortRoutes(population.routes);
  const populationLength = population.routes.length;
  const ranksSum = ((populationLength / 2) * populationLength + 1)
  const selectedRank = randomGenerator(ranksSum);
  let summed = 0;
  for (let i = 1; i < populationLength + 1; i++) {
    summed += i;
    if (summed >= selectedRank)
      return routes[i - 1]

  }
  throw "Nothing Returned"
}