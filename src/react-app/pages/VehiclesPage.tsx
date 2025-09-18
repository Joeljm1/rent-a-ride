import { useLoaderData } from "react-router";
import { CarCard } from "../components/CarCard.tsx";
import type { CarList } from "../../worker/types.ts";
// import { useState } from "react";
export default function VehiclesPage() {
  const data = useLoaderData() as CarList;
  // const [carList, setCarList] = useState(data);
  return (
    <>
      {data.data.map((car) => (
        <CarCard
          title={`${car.brand} ${car.model}`}
          url={`https://pub-032f94942a2e444fa6cc5af38ce60e9e.r2.dev/${car.pics[0].url}`}
          content="This is a good car"
          key={car.id}
        />
      ))}
    </>
  );
}
