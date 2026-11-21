import type { Consumption} from "@/lib/api-client/types";

export type YearGroup = {year:number, consumptions: Consumption[]};

export function groupByYear(consumptions: Consumption[]):YearGroup[]
{
    const groups = new Map<number, Consumption[]>();

    for(const consumption of consumptions)
        groups.set(consumption.year, [...(groups.get(consumption.year) ?? []), consumption]);

    return [...groups].map(([year, consumptions]) => ({year, consumptions}));
}

export function totalMonth(c: Consumption): number
{
    return c.jiramaKwh + c.solarKwh + c.generatorKwh;
}