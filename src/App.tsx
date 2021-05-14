import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { CitiesInitializer, City } from "./GA/city";
import { Route } from "./GA/route";
import { Population } from "./GA/popultaion";
import { CrossOver, Mutation, TournaumentSelection } from "./GA/functions";
import { logRoutes } from "./utilities/logger";
const calcPercent = (total: number, percent: number) =>
  Math.floor((percent * total) / 100);
type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(600);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const mutationReteRef = useRef(1);
  const crossOverRateRef = useRef(0.78);
  const citiesCountRef = useRef(20);
  const populationSizeRef = useRef(100);
  const generationsCountRef = useRef(1000);
  const tornaumentSizeRef = useRef(5);

  const drawLines = (route: Route) => {
    const lines: Line[] = [];
    const cities = CitiesInitializer.cities;
    for (let index = 1; index < route.route.length; index++) {
      const cityA = cities[route.route[index - 1]];
      const cityB = cities[route.route[index]];
      lines.push({
        x1: cityA.x,
        y1: cityA.y,
        x2: cityB.x,
        y2: cityB.y,
      } as Line);
    }
    setLines(lines);
  };
  const initialCities = () => {
    CitiesInitializer.initializeCities(citiesCountRef.current, height, width);
    setCities(CitiesInitializer.cities);
  };
  const delay = async (amount: number): Promise<void> => {
    return new Promise((resolve, rejects) => {
      setTimeout(() => {
        resolve();
      }, amount);
    });
  };

  const solve = async () => {
    let currentPopulation = new Population(true, populationSizeRef.current);
    logRoutes(currentPopulation, -1);
    drawLines(currentPopulation.getFittest());
    for (
      let generationIndex = 0;
      generationIndex < generationsCountRef.current;
      generationIndex++
    ) {
      const childPopulation = new Population(false);
      childPopulation.routes = [...currentPopulation.routes];
      console.log("Ready");

      // Crossover
      for (
        let crossIndex = 0;
        crossIndex < childPopulation.routes.length;
        crossIndex++
      ) {
        const randCross = Math.random();
        if (crossOverRateRef.current > randCross) {
          const chromosomeA = TournaumentSelection(
            currentPopulation,
            tornaumentSizeRef.current
          );
          console.log("cross",crossIndex);
          
          let chromosomeB: Route;
          do {
            chromosomeB = TournaumentSelection(
              currentPopulation,
              tornaumentSizeRef.current
            );
            console.log("trying");
                        
          } while (chromosomeA.routeUniqueID() == chromosomeB.routeUniqueID());
          console.log("Fixed");
          
          const [childA, childB] = CrossOver(chromosomeA, chromosomeB);
          childPopulation.addRoute(childA);
          childPopulation.addRoute(childB);
        }
      }
      const newPopulation = new Population(false);
      do {
        let selectedChromosome: Route;

        selectedChromosome = TournaumentSelection(
          childPopulation,
          tornaumentSizeRef.current
        );

        newPopulation.addRoute(selectedChromosome);
        console.log(newPopulation.routes.length);
      } while (newPopulation.routes.length < populationSizeRef.current);

      // Mutation
      for (let index = 0; index < newPopulation.routes.length; index++) {
        newPopulation.routes[index] = Mutation(
          newPopulation.routes[index],
          mutationReteRef.current
        );
      }
      setCurrentGeneration(generationIndex);
      currentPopulation = newPopulation;
      const fittest = currentPopulation.getFittest();
      logRoutes(newPopulation, generationIndex);
      drawLines(fittest);
      await delay(1000);
    }
  };
  useEffect(() => {
    initialCities();
    setLines([]);
    let currentPopulation = new Population(true, 1000);

    
    // const b = new Route(true);
    // const c = new Route(true);
    // const d = new Route(true);
    // const e = new Route(true);
    // const f = new Route(true);
    // const g = new Route(true);
    // const h = new Route(true);
    // const i = new Route(true);
    // const j = new Route(true);

    // const population = new Population(false);
    // population.routes = [a, b, c, d, e, f, g, h, i, j];
    // console.log(population.routes.map((r) => r.route));

    // const test1 = TournaumentSelection(population, 2);
    // const test2 = TournaumentSelection(population, 2);
    // const test3 = TournaumentSelection(population, 2);
    // const test4 = TournaumentSelection(population, 3);
    // const test5 = TournaumentSelection(population, 5);
  }, []);
  return (
    <div>
      <div>
        {currentGeneration} -<button onClick={solve}>Solve</button>
      </div>
      <div>
        <svg height={height} width={width}>
          {cities.map((city) => (
            <circle cx={city.x} cy={city.y} r="3" fill="blue" />
          ))}
          {lines.map((line) => (
            <line
              key={`${line.x1}-${line.y1},${line.x2}-${line.y2}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              style={{ stroke: `rgb(255,0,0)`, strokeWidth: 2 }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default App;
