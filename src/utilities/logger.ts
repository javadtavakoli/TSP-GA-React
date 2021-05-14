import { Population } from "../GA/popultaion";

export const logRoutes = (pop: Population, gi: number) => {
  const popRoutes = pop.routes.map((r) => r.routeUniqueID());
  console.log(
    popRoutes.filter((p, i) => popRoutes.findIndex((r) => p == r) == i),
    gi
  );
};
