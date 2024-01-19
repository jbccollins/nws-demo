export enum StateCode {
  AL = "AL",
  AK = "AK",
  AS = "AS",
  AR = "AR",
  AZ = "AZ",
  CA = "CA",
  CO = "CO",
  CT = "CT",
  DE = "DE",
  DC = "DC",
  FL = "FL",
  GA = "GA",
  GU = "GU",
  HI = "HI",
  ID = "ID",
  IL = "IL",
  IN = "IN",
  IA = "IA",
  KS = "KS",
  KY = "KY",
  LA = "LA",
  ME = "ME",
  MD = "MD",
  MA = "MA",
  MI = "MI",
  MN = "MN",
  MS = "MS",
  MO = "MO",
  MT = "MT",
  NE = "NE",
  NV = "NV",
  NH = "NH",
  NJ = "NJ",
  NM = "NM",
  NY = "NY",
  NC = "NC",
  ND = "ND",
  OH = "OH",
  OK = "OK",
  OR = "OR",
  PA = "PA",
  PR = "PR",
  RI = "RI",
  SC = "SC",
  SD = "SD",
  TN = "TN",
  TX = "TX",
  UT = "UT",
  VT = "VT",
  VI = "VI",
  VA = "VA",
  WA = "WA",
  WV = "WV",
  WI = "WI",
  WY = "WY",
  MP = "MP",
  PW = "PW",
  FM = "FM",
  MH = "MH",
}

export const stateCodeToStateName: Record<StateCode, string> = {
  [StateCode.AL]: "Alabama",
  [StateCode.AK]: "Alaska",
  [StateCode.AS]: "American Samoa",
  [StateCode.AZ]: "Arizona",
  [StateCode.AR]: "Arkansas",
  [StateCode.CA]: "California",
  [StateCode.CO]: "Colorado",
  [StateCode.CT]: "Connecticut",
  [StateCode.DE]: "Delaware",
  [StateCode.DC]: "District of Columbia",
  [StateCode.FL]: "Florida",
  [StateCode.GA]: "Georgia",
  [StateCode.GU]: "Guam",
  [StateCode.HI]: "Hawaii",
  [StateCode.ID]: "Idaho",
  [StateCode.IL]: "Illinois",
  [StateCode.IN]: "Indiana",
  [StateCode.IA]: "Iowa",
  [StateCode.KS]: "Kansas",
  [StateCode.KY]: "Kentucky",
  [StateCode.LA]: "Louisiana",
  [StateCode.ME]: "Maine",
  [StateCode.MD]: "Maryland",
  [StateCode.MA]: "Massachusetts",
  [StateCode.MI]: "Michigan",
  [StateCode.MN]: "Minnesota",
  [StateCode.MS]: "Mississippi",
  [StateCode.MO]: "Missouri",
  [StateCode.MT]: "Montana",
  [StateCode.NE]: "Nebraska",
  [StateCode.NV]: "Nevada",
  [StateCode.NH]: "New Hampshire",
  [StateCode.NJ]: "New Jersey",
  [StateCode.NM]: "New Mexico",
  [StateCode.NY]: "New York",
  [StateCode.NC]: "North Carolina",
  [StateCode.ND]: "North Dakota",
  [StateCode.OH]: "Ohio",
  [StateCode.OK]: "Oklahoma",
  [StateCode.OR]: "Oregon",
  [StateCode.PA]: "Pennsylvania",
  [StateCode.PR]: "Puerto Rico",
  [StateCode.RI]: "Rhode Island",
  [StateCode.SC]: "South Carolina",
  [StateCode.SD]: "South Dakota",
  [StateCode.TN]: "Tennessee",
  [StateCode.TX]: "Texas",
  [StateCode.UT]: "Utah",
  [StateCode.VT]: "Vermont",
  [StateCode.VI]: "Virgin Islands",
  [StateCode.VA]: "Virginia",
  [StateCode.WA]: "Washington",
  [StateCode.WV]: "West Virginia",
  [StateCode.WI]: "Wisconsin",
  [StateCode.WY]: "Wyoming",
  [StateCode.MP]: "Northern Mariana Islands",
  [StateCode.PW]: "Palau",
  [StateCode.FM]: "Federated States of Micronesia",
  [StateCode.MH]: "Marshall Islands",
};

export const stateCodeNameList = Object.entries(stateCodeToStateName).map(
  ([code, name]) => ({ value: code, label: name })
);

export type StationsGeoJson = {
  features: {
    geometry: {
      coordinates: [number, number];
      type: "Point";
    };
    id: string;
    properties: {
      county: string;
      elevation: {
        unitCode: string;
        value: number;
      };
      fireWeatherZone: string;
      forecast: string;
      name: string;
      stationIdentifier: string;
      timeZone: string;
    };
    type: "Feature";
  }[];
  observationStations: string[];
  pagination?: {
    next?: string;
  };
  type: "FeatureCollection";
};
