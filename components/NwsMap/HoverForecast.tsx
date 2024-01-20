import { HoverForecastData } from "@/lib/types/nws";

type Props = {
  forecast: HoverForecastData;
};

export default function HoverForecast({ forecast }: Props) {
  const { data, fetching } = forecast;

  const firstPeriod = data?.properties?.periods?.[0];

  if (!firstPeriod) {
    return false;
  }

  return (
    <div className="my-4">
      <div>Forecast:</div>
      {fetching && <div>Fetching...</div>}
      {!fetching && firstPeriod && (
        <div>
          <div>{firstPeriod.name}</div>
          <div>{firstPeriod.detailedForecast}</div>
        </div>
      )}
    </div>
  );
}
