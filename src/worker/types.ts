import { drizzle } from "drizzle-orm/d1";
import { createAuth } from "../lib/auth";

interface AvailableCars {
  id: number;
  distanceUsed: number;
  description: string | null;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  pics: AvailableCarPics[];
}

type AvailableCarPics = {
  id: number;
  url: string;
  isCover: boolean;
};

type AvailableCarPicsWithCarID = AvailableCarPics & {
  carId: number;
};

interface metaData {
  page: number;
  pageSize: number;
  totalPage: number;
}

interface CarList {
  data: AvailableCars[];
  metaData: metaData;
}

interface MyAvailableCars extends AvailableCars {
  status: "available" | "unavailable" | "renting" | "requesting" | "approved";
}

interface MyCarList {
  data: MyAvailableCars[];
  metaData: metaData;
}
interface CarPics {
  file: File;
  // isCover: boolean;
}
type CarPicWithID = Record<number, AvailableCarPicsWithCarID[]>;

type Variables = {
  auth: AuthInstance;
  user: AuthInstance["$Infer"]["Session"]["user"] | null;
  session: AuthInstance["$Infer"]["Session"]["session"] | null;
  db: DBType;
};

type AuthInstance = ReturnType<typeof createAuth>;

type DBType = ReturnType<typeof drizzle>;

export type {
  AvailableCarPics,
  AvailableCars,
  Variables,
  CarPics,
  AvailableCarPicsWithCarID,
  CarPicWithID,
  CarList,
  MyAvailableCars,
  MyCarList,
};
