import { useForecastContext } from "@/context/forecast";
import { ButtonGroup, Button } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

enum ForecastType {
  DAILY = "daily",
  HOURLY = "hourly",
}

export default function ForecastContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [forecastType, setForecastType] = useState<ForecastType>(
    ForecastType.DAILY
  );
  const forecastContext = useForecastContext();
  const { value: forecastContextValue } = forecastContext;

  // Dumb hack to make the forecast scroll horizontally with the mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += e.deltaY;
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [containerRef.current]);

  if (!forecastContextValue) {
    return false;
  }

  const { forecastDaily, forecastHourly, fetching } = forecastContextValue;

  const fourteenHourForecast = forecastHourly?.properties.periods.slice(0, 14);
  const fourteenDayForecast = forecastDaily?.properties.periods.slice(0, 14);

  const forecast =
    forecastType === ForecastType.DAILY
      ? fourteenDayForecast
      : fourteenHourForecast;

  return (
    <>
      <div className="absolute bottom-[162px] left-[12px] flex gap-4 bg-black p-2 flex-1 justify-center items-center">
        <div className="text-white">Forecast</div>
        <ButtonGroup>
          <Button
            color={`${
              forecastType === ForecastType.DAILY ? "primary" : "default"
            }`}
            size="sm"
            onClick={() => setForecastType(ForecastType.DAILY)}
          >
            Daily
          </Button>
          <Button
            size="sm"
            color={`${
              forecastType === ForecastType.HOURLY ? "primary" : "default"
            }`}
            onClick={() => setForecastType(ForecastType.HOURLY)}
          >
            Hourly
          </Button>
        </ButtonGroup>
      </div>
      <div
        ref={containerRef}
        style={{
          width: "calc(100% - 24px)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.7) transparent",
        }}
        className={`
      bg-black
      h-[150px]
      bottom-0
      left-0
      absolute
      m-[12px]
      p-1
      flex
      flex-row
      flex-1
      items-center
      text-white
      overflow-x-auto
      overflow-y-hidden
      scrollbar-thin
      scrollbar-thumb-gray-400
      scrollbar-track-transparent
    `}
      >
        {fetching && (
          <div className="flex justify-center items-center mx-auto my-auto">
            Loading...
          </div>
        )}
        {forecast?.map((forecast, index) => {
          const { name, endTime, windDirection, windSpeed } = forecast;
          let title =
            forecastType === ForecastType.DAILY
              ? name
              : formatDistanceToNow(new Date(endTime), {
                  addSuffix: true,
                })
                  .replace("about ", "")
                  .replace("in ", "");
          return (
            <div
              key={forecast.number}
              className={`flex flex-col flex-1 justify-center min-w-[200px] relative p-3 gap-1 ${
                index % 2 === 0 ? "bg-gray-900" : "bg-black"
              }`}
            >
              <div className="">{title}</div>
              <div className="flex gap-2">
                <img
                  className="h-8 w-8 border-1 border-white rounded-md"
                  // For some reason the icon for daily has a comma in it
                  src={forecast.icon.split(",")[0]}
                  alt={forecast.shortForecast}
                />
                <div className="text-center">{forecast.temperature}&deg;</div>
              </div>
              <div className="w-full">
                <div
                  className="overflow-ellipsis overflow-hidden whitespace-nowrap"
                  title={forecast.shortForecast}
                >
                  {forecast.shortForecast}
                </div>
              </div>
              <div></div>
              <div className="w-full">
                <div
                  className="overflow-ellipsis overflow-hidden whitespace-nowrap"
                  title={`Wind: ${windSpeed} ${windDirection}`}
                >
                  Wind: {windSpeed} {windDirection}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
