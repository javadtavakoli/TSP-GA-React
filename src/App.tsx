import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { CitiesInitializer, City } from "./GA/city";
import { Route } from "./GA/route";
import { Population } from "./GA/popultaion";
import {
  CrossOver,
  InversionMutation,
  SwapMutation,
  Order1CrossOver,
  RankSelection,
  ShuffleMutation,
  SortRoutes,
  TournaumentSelection,
  MultiSwapMutation,
} from "./GA/functions";

import { Chart, ChartData } from "./chart";
enum MutationTypes {
  SwapMutation,
  MultiSwapMutation,
  ShuffleMutation,
  InversionMutation,
}
const calcPercent = (total: number, percent: number) =>
  Math.floor((percent * total) / 100);
type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
function App() {
  const [bestRoute, setBestRoute] = useState<Route>();
  const [cities, setCities] = useState<City[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(600);
  const [lineData, setLineData] = useState<ChartData[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const mutationRateRef = useRef(0.1);
  const citiesCountRef = useRef(20);
  const populationSizeRef = useRef(100);
  const generationsCountRef = useRef(200);
  const mutationTypeRef = useRef(MutationTypes.InversionMutation);
  const elitismRef = useRef<boolean>(true);
  const drawLines = (route: Route) => {
    setBestRoute(route);
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
    const mutationMethod: (route: Route, mutationRate: number) => Route =
      (() => {
        switch (mutationTypeRef.current) {
          case MutationTypes.InversionMutation:
            return InversionMutation;
          case MutationTypes.MultiSwapMutation:
            return MultiSwapMutation;
          case MutationTypes.ShuffleMutation:
            return ShuffleMutation;
          case MutationTypes.SwapMutation:
            return SwapMutation;
        }
      })();
    for (
      let generationIndex = 0;
      generationIndex < generationsCountRef.current;
      generationIndex++
    ) {
      const childPopulation = new Population(false);
      // Crossover
      do {
        const chromosomeA = RankSelection(currentPopulation);

        const chromosomeB = RankSelection(currentPopulation);

        if (chromosomeA.routeUniqueID() !== chromosomeB.routeUniqueID()) {
          const [childA, childB] = Order1CrossOver(chromosomeA, chromosomeB);
          childPopulation.addRoute(childA);
          childPopulation.addRoute(childB);
        }
      } while (childPopulation.routes.length <= populationSizeRef.current - 1);

      // Mutation
      for (let index = 0; index < childPopulation.routes.length; index++) {
        childPopulation.routes[index] = mutationMethod(
          childPopulation.routes[index],
          mutationRateRef.current
        );
      }
      if (elitismRef.current)
        childPopulation.addRoute(currentPopulation.getFittest());

      setCurrentGeneration(generationIndex);

      currentPopulation = childPopulation;
      const fittest = currentPopulation.getFittest();
      setLineData((_lineData) =>
        _lineData.concat({
          name: generationIndex.toString(),
          fitness: fittest.getFitness(),
        } as ChartData)
      );
      drawLines(fittest);
      await delay(1);
    }
  };
  useEffect(() => {
    reset();
  }, []);
  const reset = () => {
    initialCities();
    setLines([]);
  };
  return (
    <div className="wrapper">
      <div className="container">
        <div className="playground">
          <svg height={height} width={width}>
            {cities.map((city) => (
              <circle cx={city.x} cy={city.y} r="5" />
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
                defaultValue={mutationRateRef.current}
                onChange={(e) => {
                  mutationRateRef.current = Number.parseFloat(e.target.value);
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
            <div className="label">Mutation Method</div>
            <div className="value">
              <select
                defaultValue={mutationTypeRef.current.toString()}
                onChange={(e) => (mutationTypeRef.current = +e.target.value)}
              >
                {Object.entries(MutationTypes).map((m) => {
                  if (isNaN(Number(m[1]))) {
                    return <option value={m[0].toString()}>{m[1]}</option>;
                  }
                })}
              </select>
            </div>
          </div>
          <div className="description">
            <div className="label">Elistism</div>
            <div className="value">
              <input
                type="checkbox"
                defaultChecked={elitismRef.current}
                onChange={(e) =>
                  (elitismRef.current = e.target.value === "checked")
                }
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
          </div>
          {bestRoute && (
            <div>
              <div className="description">
                <div className="label">Best route:</div>
                <div className="value">{bestRoute.routeUniqueID()}</div>
              </div>
              <div className="description">
                <div className="label">Route fitness:</div>
                <div className="value">{bestRoute.getFitness()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="chart">
          <Chart data={lineData} />
        </div>
      </div>
    </div>
  );
}

export default App;
