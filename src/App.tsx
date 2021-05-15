import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { CitiesInitializer, City } from "./GA/city";
import { Route } from "./GA/route";
import { Population } from "./GA/popultaion";
import {
  CrossOver,
  hasProgress,
  Mutation,
  SortRoutes,
  TournaumentSelection,
} from "./GA/functions";
import { logRoutes } from "./utilities/logger";

import { fireEvent } from "@testing-library/react";
import { Chart, ChartData } from "./chart";

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
  const [lineData, setLineData] = useState<ChartData[]>([]);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const mutationReteRef = useRef(0.2);
  const citiesCountRef = useRef(20);
  const populationSizeRef = useRef(500);
  const generationsCountRef = useRef(1000);
  const tornaumentSizeRef = useRef(5);
  const fitnessHistory = useRef<number[]>([]);
  const stopRef = useRef(false);

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
    drawLines(currentPopulation.getFittest());
    fitnessHistory.current = [];

    for (
      let generationIndex = 0;
      generationIndex < generationsCountRef.current;
      generationIndex++
    ) {
      if (
        stopRef.current ||
        !hasProgress(
          generationsCountRef.current,
          generationIndex,
          fitnessHistory.current
        )
      ) {
        stopRef.current = false;
        break;
      }
      const childPopulation = new Population(false);
      childPopulation.routes = [currentPopulation.getFittest()];
      // Crossover
      do {
        const chromosomeA = TournaumentSelection(
          currentPopulation,
          tornaumentSizeRef.current
        );
        let chromosomeB: Route;
        do {
          chromosomeB = TournaumentSelection(
            currentPopulation,
            tornaumentSizeRef.current
          );
        } while (chromosomeA.routeUniqueID() == chromosomeB.routeUniqueID());

        const [childA, childB] = CrossOver(chromosomeA, chromosomeB);
        childPopulation.addRoute(childA);
        childPopulation.addRoute(childB);
      } while (childPopulation.routes.length < populationSizeRef.current);

      // do {
      //   let selectedChromosome: Route;

      //   selectedChromosome = TournaumentSelection(
      //     childPopulation,
      //     tornaumentSizeRef.current
      //   );

      //   newPopulation.addRoute(selectedChromosome);
      // } while (newPopulation.routes.length < populationSizeRef.current);
      // const sortedParentRoutes = SortRoutes(currentPopulation.routes);
      // for (let i = 0; i < calcPercent(populationSizeRef.current, 5); i++) {
      //   newPopulation.addRoute(sortedParentRoutes[i]);
      // }
      // Mutation

      for (let index = 0; index < childPopulation.routes.length; index++) {
        const child = Mutation(
          childPopulation.routes[index],
          mutationReteRef.current
        );
        childPopulation.routes[index] = child;
      }
      setCurrentGeneration(generationIndex + 1);
      currentPopulation = childPopulation;
      const fittest = currentPopulation.getFittest();
      const fittestFitness = fittest.getFitness();
      setLineData((_lineData) =>
        _lineData.concat({
          name: generationIndex.toString(),
          fitness: fittestFitness,
        } as ChartData)
      );
      fitnessHistory.current = [...fitnessHistory.current,fittestFitness];
      
      setRouteIds((_ids) => _ids.concat(fittest.routeUniqueID()));
      drawLines(fittest);
      await delay(1);
    }
  };
  useEffect(() => {
    reset();
    setLines([]);
  }, []);
  const reset = () => {
    initialCities();
    setLines([]);
    setRouteIds([]);
    setLineData([]);
  };
  return (
    <div className="wrapper">
      <div className="container">
        <div className="playground">
          <svg height={height} width={width}>
            {cities.map((city) => (
              <circle cx={city.x} cy={city.y} r="3" />
            ))}
            {lines.map((line) => (
              <line
                key={`${line.x1}-${line.y1},${line.x2}-${line.y2}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
              />
            ))}
          </svg>
        </div>
        <div className="controls">
          <div className="description">
            <div className="label">Generation Number</div>
            <div className="value">
              <div>{currentGeneration}</div>
            </div>
          </div>
          <div className="description">
            <div className="label">Best Route</div>
            <div className="value">
              <div>{routeIds.length > 0 && routeIds[routeIds.length - 1]}</div>
            </div>
          </div>
          <div className="description">
            <div className="label">Height</div>
            <div className="value">
              <input
                value={height}
                onChange={(e) => setHeight(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="description">
            <div className="label">Width</div>
            <div className="value">
              <input
                value={width}
                onChange={(e) => setWidth(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="description">
            <div className="label">Mutation Rate</div>
            <div className="value">
              <input
                defaultValue={mutationReteRef.current}
                onChange={(e) => {
                  mutationReteRef.current = Number.parseFloat(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="description">
            <div className="label">Popultaion Size</div>
            <div className="value">
              <input
                defaultValue={populationSizeRef.current}
                onChange={(e) => {
                  populationSizeRef.current = Number.parseInt(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="description">
            <div className="label">Generation Count</div>
            <div className="value">
              <input
                defaultValue={generationsCountRef.current}
                onChange={(e) => {
                  generationsCountRef.current = Number.parseInt(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="description">
            <div className="label">Cities Count</div>
            <div className="value">
              <input
                defaultValue={citiesCountRef.current}
                onChange={(e) => {
                  citiesCountRef.current = Number.parseInt(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="description">
            <div className="label">Tornaument Size</div>
            <div className="value">
              <input
                defaultValue={tornaumentSizeRef.current}
                onChange={(e) => {
                  tornaumentSizeRef.current = Number.parseInt(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="buttons">
            <button onClick={solve} className="reset-button">
              Solve
            </button>
            <button onClick={initialCities} className="initial-button">
              Initial Cities
            </button>
            <button onClick={reset} className="initial-button">
              Reset
            </button>
            <button
              onClick={() => {
                setRouteIds((_ids) => _ids.concat(["stopped"]));
                stopRef.current = true;
              }}
              className="stop-button"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="chart">
          <Chart data={lineData} />
        </div>
      </div>
      <div>
        <h4>Routes</h4>
        <div className="route-ids">
          {routeIds.map((r) => (
            <div>{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
