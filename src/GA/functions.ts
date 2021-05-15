import { logRoutes } from "../utilities/logger";
import { randomGenerator } from "../utilities/randomGenerator";
import { CitiesInitializer } from "./city";
import { Population } from "./popultaion";
import { getRandomIndexNotInRoute, Route } from "./route";
const GENE_PLACEHOLDER = -1;
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
export const Mutation = (route: Route, mutationRate: number): Route => {
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
